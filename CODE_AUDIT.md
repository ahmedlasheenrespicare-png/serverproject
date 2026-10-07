# تدقيق كود — ستريم ماستر برو (Stream Master Pro)

**التاريخ:** 7 أكتوبر 2026 · **الفرع:** `arena/7e8c4d64-serverproject` · **الأساس:** `463a6bc`
**النطاق:** 143 ملفاً — كل `src/` و`proxy/` و`scripts/` وملفات البناء والنشر و`public/`.
**العلاقة بمراجعة سابقة:** هذا تدقيق مستقل بعد دمج إصلاحات `CODE_REVIEW.md`. البنود المصلَحة هناك تحقّقتها عملياً (القسم 5)، وما يلي **نتائج جديدة** لم تُذكر سابقاً أو بقيت مفتوحة.

---

## 1) الملخص التنفيذي

المشروع في حالة تقنية **سليمة**: `tsc --noEmit` = صفر أخطاء، `npm run build` ينجح كاملاً (10 مسارات + `404.html` + `sitemap.xml`)، والترطيب في المتصفح نظيف على كل الصفحات المفحوصة، ووسيط البث يعمل بعد فحصه فعلياً بـ `curl`.

لكن خرج التدقيق بـ **مشكلة سعرية حقيقية في مسار الشراء** (تُرسل رقماً خاطئاً في طلب الواتساب)، و**عطل وظيفي في الوسيط يخص السيرفرات التي لا تدعم TLS**، و**خطأ في رقم الهاتف المنشور في البيانات المنظّمة**، وحماية الوسيط ضد سرقة النطاق الترددي **غير مكتملة تقنياً** (يمكن تجاوزها)، إضافة إلى عدم فعّالية فصل `react-dom` في التغليف (مُثبت بالقياس).

| الخطورة | العدد | البنود |
|---|---|---|
| 🔴 حرجة (خطأ سعر/مال) | 1 | تعارض عملة السلة بين صفحات الباقات والموقع |
| 🟠 عالية (عطل وظيفي/بيانات/أمن) | 3 | إعادة كتابة بث `http` إلى `https` · رقم واتساب خاطئ في JSON-LD · تجاوز فلتر المصدر في الوسيط |
| 🟡 متوسطة (أداء/صيانة) | 5 | `manualChunks` · مسار `channels.json` النسبي · تحميل القنوات دائماً · اعتماديات ميتة · نصوص تسويقية غير متسقة |
| 🟢 منخفضة | 4 | حبس التركيز في النوافذ · سيرفر الاختبار على كل الواجهات · `deploy.sh` · حقول كود ميت |

---

## 2) ما شُغِّل فعلياً (أدلة)

| الأمر / الفحص | النتيجة |
|---|---|
| `npm ci --no-audit --no-fund` | ✅ نجح |
| `npx tsc --noEmit` | ✅ **صفر أخطاء** (`strict` + `noUnusedLocals`) |
| `npm run build` | ✅ `index.html 5.14 kB` + `css 81.57 kB` + `vendor 11.32 kB` + `index 418.43 kB` + `hls 592.63 kB` (مؤجّل) + 10 مسارات و`404.html` و`sitemap.xml` |
| `node scripts/hydration-check.mjs` (jsdom 24) | ✅ كل المسارات الخمسة «لا أخطاء ترطيب» |
| `node proxy/test-server.mjs` + `curl` | ✅ صفحة الحالة 200 · `/health` OK · `/?u=…` **يعيد المحتوى فعلاً** · `?text=…` يصل للسيرفر الأصلي · `Origin: evil.example` → **403** · `127.0.0.1` و`0x7f000001` و`169.254.169.254` → **BLOCKED_HOST** |
| اختبار `rewriteManifest` معزولاً (نسخة مؤقتة في `/tmp`) | ⚠️ كشف البند 2 (إعادة كتابة `http` إلى `/h/`) |
| اختبار تغليف بديل (`manualChunks` بدالة) | ⚠️ كشف البند 5: `react-dom` 180 kB انتقل لـ chunk مستقل، وحزمة التطبيق 418 → **237 kB** |
| فحص الأصول | ✅ لا صورة مفقودة، ولكل `webp` نسخة `avif`، وأيقونات PWA بأبعادها الصحيحة (192/512، og 1200×630) |
| `grep` للأصول الميتة/الاستيرادات/alerts | لا `dangerouslySetInnerHTML`، لا `console.log` متروك، كل الأيقونات (26) بـ `aria-hidden`، وكل `target="_blank"` (9) معها `rel="noopener"` |

---

## 3) النتائج بالخطورة

### 🔴 1. تعارض العملة في السلة عند الإضافة من صفحات الباقات — رقم سعر خاطئ في طلب الواتساب

- **الملفات:** `src/pages/PlanPage.tsx:23,27,161-172,187` ↔ `src/App.tsx:38-47,87` ↔ `src/components/CartModal.tsx:53-55,73,77`
- **الوصف:** صفحة الباقة (`/nova`, `/ultra`, `/istar`, `/moka`) تحتفظ بـ **عملة خاصة بها** (`useState("SAR")` + قائمة اختيار خاصة بها)، بينما `App` يحتفظ بعملة **مستقلة** يغيّرها زر الترويسة. عند الضغط على «أضف إلى السلة» تُمرَّر `price` المحسوبة بعملة الصفحة، لكن `App` يختم العنصر بعملة **الترويسة**:

```tsx
// src/pages/PlanPage.tsx
const [currency, setCurrency] = useState("SAR");      // ← عملة مستقلة عن الموقع
const price = priceObj[curr.code] || priceObj.SAR;
<button onClick={() => onAddToCart(plan, duration, price)}>  // ← السعر بعملة الصفحة

// src/App.tsx
(...) => setCartItems(prev => [...prev, { id, plan, months, price, currency }]);
                                                                        // ↑ عملة الترويسة
```

- **الأثر (سعرية، مثبتة من البيانات):** عملة الترويسة `SAR` والصفحة `EGP` → باقة نوفا سنة تُضاف كـ **2000 ر.س** بدل 250 ر.س (خطأ **8×**) فيُرسل للعميل في رسالة واتساب «الإجمالي المطلوب: 2000 ر.س». والعكس (ترويسة `EGP` + صفحة `SAR`) يعرض 250 ج.م بدل ٢٠٠٠.
- **ملاحظة:** هذا ليس البند 6 من المراجعة السابقة (ذاك أُصلح: تغيير العملة **بعد** الإضافة صار يُحوَّل صحيحاً) — هذا مسار **لحظة الإضافة** من صفحات الباقات، ولم يُعالَج.
- **الإصلاح (الأصح):** مصدر واحد للعملة — تمرير `currency`/`onCurrencyChange` من `App` إلى `PlanPage` وإزالة حالتها المحلية:

```tsx
// App.tsx
page = <PlanPage plan={plan} currency={currency} onCurrencyChange={setCurrency}
                 onOpenTrial={openTrial} onAddToCart={handleAddToCart} />;

// PlanPage.tsx — احذف useState المحلي واستخدم props
interface PlanPageProps { /* ... */ currency: string; onCurrencyChange: (c: string) => void; }
```
وبديل أسرع (دفاعي): تمرير كود العملة مع السعر في التوقيع —
`onAddToCart(plan, months, price, currencyCode)` ثم `App` يستخدمه بدل عملته.

---

### 🟠 2. الوسيط يعيد كتابة قوائم البث إلى `https` دائماً — البث عبر `/x/` و`?u=http://` يتوقف

- **الملف:** `proxy/worker.js:254-256` (دالة `toProxyPath`)، `:258-282` (`rewriteManifest`)، `:100-105` (مسار `/x/`)، `:74-79` (مسار `?u=`)
- **الدليل العملي** (تشغيل `rewriteManifest` على قائمة أساسها `http://plain.example.com/live/index.m3u8`):

```
#EXT-X-KEY:...,URI="/h/plain.example.com/live/key.php?token=abc"
/h/plain.example.com/live/segment1.ts        ← بروتوكول الوسيط /h/ = https إجبارياً
```

- **الأثر:** مسار `/x/` وُجد تحديداً لسيرفرات IPTV التي لا تدعم TLS (لوحات على بورت مباشر). بعد أول طلب، يعاد كتابة كل المقاطع والمفاتيح إلى `/h/…` فيحاول الوسيط `https://host/...` → فشل TLS (502) → **يتوقف العرض في منتصفه**، بدل أن يستمر عبر `http`. والنتيجة نفسها مع `?u=http://…` المستخدم في مشغّل الاشتراك (`src/components/XtreamPlayer.tsx:228,232`).
- **الإصلاح:** احترام بروتوكول الرابط الأصلي:

```js
function toProxyPath(u) {
  const p = `${u.host}${u.pathname}${u.search}`;
  return u.protocol === "http:" ? `/x/${p}` : `/h/${p}`;
}
```
(ويُفضَّل إضافة اختبار صغير لهذه الدالة، لأن كسرها لا يظهر إلا مع `http`.)

---

### 🟠 3. رقم الواتساب في `src/config.ts` خاطئ — يظهر معطوباً في البيانات المنظّمة المنشورة

- **الملفات:** `src/config.ts:12` ↔ `src/data.ts:2` ↔ `src/seo.ts:32`
- **الوصف:** الرقم مكرَّر في ملفين بقيمتين مختلفتين في **صيغة العرض**: `config.ts` = `"+20 107 033 835"` (٩ أرقام — ناقص صفر)، و`data.ts` = `"+20 107 033 0835"` (١٠ أرقام — الصحيح).
- **الدليل:** الناتج المبني فعلاً يحتوي:
```
dist/index.html → "telephone":"+20107033835"     ← رقم غير صالح (١١ خانة بدل ١٢)
```
بينما `Footer` (يقرأ من `data.ts`) يعرض الرقم الصحيح — أي أن جوجل وWhatsApp يريان رقماً، والزائر يرى آخر.
- **الأثر:** بيانات `Organization` غير صحيحة (مخالفة إرشادات جوجل للبيانات المنظّمة + ضياع نقرات «اتصال»).
- **الإصلاح:** حذف التعريف المكرَّر من `data.ts` وإعادة التصدير من `config.ts` فقط:

```ts
// src/data.ts
export { WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from "./config";
```
مع تصحيح `config.ts:12` إلى `"+20 107 033 0835"`.

---

### 🟠 4. فلتر `Origin` في الوسيط **لا يمنع** سرقة النطاق الترددي عبر `<video>`

- **الملف:** `proxy/worker.js:35-54` و`:56-65`
- **الوصف:** الفلتر يسمح صراحةً بالطلبات **بلا `Origin`** (`origin === ""`)، وهذا صحيح للاختبار بـ curl لكنه ثغرة عند الوسم: طلبات الوسائط المضمّنة (`<video src>` / `<audio>` / `<img>`) تُرسل بوضع `no-cors` و**لا تحمل رأس `Origin` إطلاقاً** ([MDN: Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin)، [StackOverflow](https://stackoverflow.com/questions/42239643/when-do-browsers-send-the-origin-header-when-do-browsers-set-the-origin-to-null/42242802)). لذا أي موقع خارجي يستطيع:
  - تشغيل ملفات `.ts/.mp4` مباشرة من الوسيط داخل `<video>` (HTML/JS أسهل ما يُكتشف)،
  - وإرسال طلبات برمجية بلا `Origin` بلا أي حد — الوسيط اليوم **بلا Rate Limiting**.
- **ما يعمل فعلاً (تم التحقق):** `Origin: https://evil.example` → **403**، وطلبات `hls.js` (XHR) من نطاق الموقع تمرّ. أي أن الحماية جيدة ضد تضمين مكتبات JS، وناقصة ضد الوسائط المباشرة والاستهلاك الآلي.
- **الإصلاح المقترح:**
  1. قائمة نطاقات مسموحة لرأس `Referer` عند غياب `Origin` (رفض ما لا يطابق `ahmedlasheenrespicare-png.github.io` أو `localhost`، مع إبقاء استثناء صريح لأدوات الفحص عبر توكن/مسار `/health`).
  2. تفعيل **Rate Limiting** من لوحة Cloudflare (لا يمكن من الكود).
  3. إضافة `Cross-Origin-Resource-Policy: same-site` والاستمرار في `Vary: Origin`.

---

### 🟡 5. `manualChunks` لا يفصل `react-dom` فعلياً (الـ vendor chunk = 11 kB فقط)

- **الملف:** `vite.config.ts:40-46`
- **الوصف:** الصيغة الكائنية (`{ vendor: ["react","react-dom"] }`) تُطابق معرّف الوحدة الحرفي فقط، فبقيت `react-dom` (~180 kB) داخل حزمة التطبيق. **الدليل بالقياس** (بناء بديل بنفس الإعدادات مع دالة تقسيم، ثم حُذف):

| | الحالي | بدالة `manualChunks` |
|---|---|---|
| vendor | 11.32 kB | 11.84 kB (react) + **180.25 kB (react-dom)** |
| حزمة التطبيق | **418.43 kB** | **236.78 kB** |

- **الأثر:** أي تعديل ولو حرفي في كود الموقع يُبطل كاش 180 kB للمستخدم العائد (المفترض أن يبقى React في كاش ثابت). التعليق في `vite.config.ts` يعد بأن الفصل يعمل — وهو لا يعمل.
- **الإصلاح:**

```ts
manualChunks(id) {
  if (id.includes("node_modules")) {
    if (id.includes("/react-dom/")) return "vendor-react-dom";
    if (id.includes("/react/") || id.includes("/scheduler/")) return "vendor-react";
  }
},
```

---

### 🟡 6. `fetch("./channels.json")` مسار نسبي هشّ في الصفحة الرئيسية

- **الملف:** `src/components/LivePlayer.tsx:109` (بينما `src/pages/ChannelsPage.tsx:40` تستخدم `to("channels.json")` الصحيح)
- **الأثر:** يعمل اليوم لأن المشغّل يُركَّب على `/serverproject/` فقط، لكنه ينكسر فوراً لو ظهر المشغّل في أي مسار آخر (`/nova/` → يطلب `/serverproject/nova/channels.json` → 404 صامت + السقوط إلى القنوات المميّزة فقط). الإصلاح سطر واحد: `fetch(to("channels.json"))` مع استيراد `to` من `src/config.ts`.

### 🟡 7. تحميل 173 kB من `channels.json` لكل زائر للصفحة الرئيسية حتى لو لم يشاهد

- **الملف:** `src/components/LivePlayer.tsx:108-127`
- **الأثر:** الحزمة نفسها صارت مؤجّلة للـ hls.js بنجاح، لكن ملف القنوات يُطلب فور التحميل لا عند أول ضغطة «تشغيل». تأجيله (أو تحويله لنسخ حسب التصنيف) يوفّر ~40-60 kB مضغوطة على كل زيارة.

### 🟡 8. اعتماديات وكود ميت

| الموضع | الملاحظة |
|---|---|
| `package.json:14-15` | `clsx` و`tailwind-merge` بلا أي استخدام (`grep` = صفر مطابقة) |
| `src/components/Pricing.tsx:31,33-35` | حقل `discount` («خصم 50% VIP») معرَّف ولا يُعرض أبداً — والنسبة الحقيقية تُحسب في `:110` (`وفّر X%`) |
| `src/index.css` | لا مشاكل، لكن `html { scroll-behavior: smooth }` يبقى مصدر «نعومة» مزدوجة مع `Reveal` (مقبول) |

### 🟡 9. نصوص تسويقية لا تطابق البيانات — ✅ أُصلح بقرار المالك (7 أكتوبر 2026)

- «خصومات تصل إلى 50%» صارت «خصومات على جميع الباقات» (بلا رقم مخالف)، ومدة التجربة وُحِّدت على «6 ساعات» في الموقع وFAQ.
- التفاصيل التاريخية للبند:

- `src/components/Header.tsx:76`: «خصومات تصل إلى **50%**» — أقصى خصم فعلي محسوب من `oldSar` هو **28%** (نوفا سنتان: 580→420). والقيمة المكتوبة «خصم 50% VIP» في `Pricing.tsx:35` كود ميت لا يُعرض.
- `src/components/TrialModal.tsx:66` و`FloatingActions.tsx:58,61` و`Footer.tsx:53,185` و`Hero.tsx:436`: «تجربة **6 ساعات**» مقابل `src/data.ts:249`: «**6 إلى 12 ساعة**».
- `index.html:19` يعلن `max-video-preview:-1` بينما `src/seo.ts:57` (المصدر الذي يستبدل الوسم في كل صفحة مبنية) يحذفه — نتيجة: الوسم يفقد هذا التوجيه في الإنتاج.

### 🟢 10. تفاصيل منخفضة

| الموضع | الملاحظة |
|---|---|
| `CartModal.tsx` / `TrialModal.tsx` | `role="dialog"` + `aria-modal` + Escape + قفل التمرير ✅، لكن **لا حبس للتركيز (focus trap)** ولا إعادة تركيز للعنصر المُطلِق بعد الإغلاق (`TrialModal` بلا `autoFocus` أصلاً) |
| `proxy/test-server.mjs:29` | يستمع على كل الواجهات (`0.0.0.0`) — أي جهاز على الشبكة المحلية يستطيع استخدام الوسيط في التطوير |
| `deploy.sh:12-13,36` | يعدّل إعدادات Git **العامة** ويدفع مباشرة إلى `main` (تم إزالة `--force` ✅) — المسار المُوصى به الآن هو Actions/PR |
| `proxy/worker.js:192-245` | `HEAD` يتحوّل إلى `GET` ويُعاد بجسم فارغ ✅، و`content-encoding/length/transfer-encoding` تُحذف ✅ — سليم |
| `proxy/worker.js:181` | الحجب يعتمد على نص المضيف؛ نطاق عام يشير إلى `127.0.0.1` (DNS rebinding) لا يُكتشف — خطر متبقٍّ منخفض على Cloudflare |

---

## 3-ب) سجل الإصلاحات المُنفَّذة (7 أكتوبر 2026)

> كل التغييرات على الفرع `arena/7e8c4d64-serverproject`. النتيجة بعد التنفيذ:
> `npx tsc --noEmit` = **0 أخطاء** · `npm run build` = **ناجح** (10 مسارات + `404.html` + `sitemap.xml`) ·
> `node scripts/hydration-check.mjs` = **كل الصفحات تُرطَّب بلا أخطاء** · اختبارات الوسيط بـ `curl` = **ناجحة**.

| # | البند | ما نُفِّذ | الملفات | الدليل |
|---|---|---|---|---|
| 1 | 🔴 عملة السلة | العملة صارت مصدراً واحداً: `App` يمرّرها إلى `PlanPage` (حُذفت الحالة المحلية) — لا يمكن أن يُسجَّل عنصر بعملة تخالف سعره | `src/App.tsx`, `src/pages/PlanPage.tsx` | اختبار jsdom: تغيير عملة الموقع إلى EGP ثم الإضافة → رسالة واتساب «2000 ج.م» (قبل الإصلاح: «2000 ر.س») |
| 2 | 🟠 الوسيط و`http` | `toProxyPath` تحفظ البروتوكول: `http` → `/x/` و`https` → `/h/` | `proxy/worker.js` | اختبار معزول: قائمة أساسها `http://` صارت `/x/…`، وقائمة `https://` بقيت `/h/…` |
| 3 | 🟠 رقم الواتساب | الرقم معرَّف مرة واحدة في `config.ts` (وصُحّحت صيغة العرض الناقصة)، و`data.ts` يعيد التصدير منه | `src/config.ts`, `src/data.ts` | `dist/index.html` أصبح `"telephone":"+201070330835"` |
| 4 | 🟠 تشديد الوسيط | فحص `Referer` عند غياب `Origin` (رفض 403 للمواقع الأخرى) + توثيق الحاجة إلى Rate Limiting | `proxy/worker.js`, `proxy/README.md` | `curl -H "Referer: https://evil.example"` → **403** · و`Referer` من نطاق الموقع → **200** |
| 5 | 🟡 فصل `react-dom` | `manualChunks` صارت دالة تفصل `react-dom` و`react` فعلياً | `vite.config.ts` | حزمة التطبيق **418 kB → 237 kB**، و`vendor-react-dom` = 180 kB مستقل |
| 6 | 🟡 قنوات المشغّل | مسار `to("channels.json")` الصحيح + تحميل القائمة عند الاقتراب من المشغّل (`IntersectionObserver`، هامش 600px) بدل التحميل الفوري | `src/components/LivePlayer.tsx` | `tsc` نظيف · الترطيب نظيف (لا IO في jsdom → تجاوز آمن) |
| 7 | 🟡 تنظيف | حذف `clsx` و`tailwind-merge` (وحُدِّث `package-lock.json`) + حذف الحقل الميت `discount` («خصم 50%») من `Pricing` | `package.json`, `package-lock.json`, `src/components/Pricing.tsx` | `grep` = صفر مطابقة · البناء ناجح |
| 8 | 🟢 a11y | هوك مشترك `useDialogA11y`: حبس التركيز في النافذة (Tab/Shift+Tab) + إعادة التركيز للعنصر المُطلِق + تمرير أولي وEscape وقفل الخلفية | `src/components/useDialogA11y.ts` (جديد), `CartModal.tsx`, `TrialModal.tsx` | الترطيب نظيف (كل الأثر داخل `useEffect`) |
| 10 | 🟡 النصوص التسويقية | «خصومات تصل إلى 50%» ← «خصومات على جميع الباقات» (بلا رقم مخالف للبيانات)، وتوحيد مدة التجربة على «6 ساعات» في الموقع وFAQ | `src/components/Header.tsx`, `src/data.ts` | `grep` = لا وجود لـ «50%» ولا «6 إلى 12 ساعة» في النصوص المرئية |
| 9 | 🟢 متفرقات | `deploy.sh` لا يعدّل إعدادات Git **العامة** · سيرفر الاختبار يستمع على `127.0.0.1` (مع `HOST=0.0.0.0` عند الحاجة) · إعادة `max-video-preview:-1` إلى وسم robots | `deploy.sh`, `proxy/test-server.mjs`, `src/seo.ts` | `ss -ltn` يُظهر `127.0.0.1:8787` · الوسم في البناء يحتوي التوجيه |

**ما لم يُنفَّذ (يحتاج منك):**
1. **نشر الوسيط** — الإصلاحان 2 و4 لا يسريان حتى تنفّذ `npx wrangler deploy` (أو ترفع للمستودع المربوط بـ Cloudflare).
2. **Rate Limiting** على Cloudflare (لوحة التحكم).
3. ~~**القرار التسويقي** في 🟡9~~ ✅ **نُفِّذ بقرار المالك:** «خصومات على جميع الباقات» (بلا رقم) + توحيد التجربة على «6 ساعات».

---

## 4) بنود المراجعة السابقة: تحقّق فعلي

| البند | الحالة المُتحقَّقة اليوم |
|---|---|
| 1. مسار `/?u=` | ✅ منفَّذ — `curl` أعاد محتوى NPM وليس صفحة الحالة |
| 2. تمرير `?search` في `/h/`,`/x/`,`/live/` | ✅ منفَّذ — `curl ".../h/registry.npmjs.org/-/v1/search?text=react"` أعاد نتائج البحث |
| 3. تقييد CORS + حجب المضيفات | ✅ جزئياً — 403 للمصادر الخارجية، والحجب يقاوم `0x7f000001` و`169.254.169.254`؛ لكن راجع البند 🟠4 (لا Origin للوسائط + لا Rate Limit) |
| 4. تقييد `?proxy=` | ✅ `OWNED_PROXY_PATTERN` في `LivePlayer.tsx:47-52` |
| 5. النطاق في robots/sitemap + og محلي | ✅ `robots.txt` و`sitemap.xml` المولَّد على الدومين الفعلي، و`og-default.png` محلي 1200×630 |
| 6. عملة السلة | ⚠️ أُصلح للتحويل **بعد** الإضافة، لكن مسار الإضافة من صفحات الباقات ما زال معطوباً (🔴1) |
| 7–8. تصنيفات ديناميكية + أصول ميتة | ✅ 12 تصنيفاً (بما فيها `عالمية` 553 و`موسيقى` 32)، ولا ملفات ميتة، ولا صورة مفقودة |
| 9. أداء | ✅ جزئياً — hls.js chunk مؤجّل (592 kB)، لكن فصل `react-dom` غير فعّال (🟡5) و`channels.json` يُحمَّل دائماً (🟡7) |
| 10–14. تنقية البيانات، typecheck في CI، `--force`، a11y، SmoothScroll | ✅ كلها مؤكَّدة في الكود والبناء |
| 15. توحيد الأرقام التسويقية | ⏳ **ما زال مفتوحاً** (🟡9) — يحتاج قراراً تجارياً منك |
| 16. `memo` للمشغّلين | ✅ موجود (`LivePlayer.tsx:626`, و`XtreamPlayer` مماثل) |

---

## 5) خطة الإصلاح المقترحة (مرتّبة بالعائد)

1. **🔴 عملة السلة** — مصدر واحد للعملة بين `App` و`PlanPage` (ساعة عمل، ويمنع رسائل طلب بأسعار خاطئة).
2. **🟠 `toProxyPath` تحترم `http`** — سطران، ويعيد الحياة لمسار `/x/` كاملاً.
3. **🟠 رقم الواتساب** — إزالة التكرار + تصحيح `config.ts`، ثم `npm run build` للتأكد أن `telephone` صار `+201070330835`.
4. **🟠 تشديد الوسيط** — فحص `Referer` عند غياب `Origin` + تفعيل Rate Limiting من لوحة Cloudflare + إعادة نشر (`npx wrangler deploy`).
5. **🟡 أداء** — `manualChunks` بالدالة + تأجيل `channels.json` + `to("channels.json")`.
6. **🟡 تنظيف** — حذف `clsx`/`tailwind-merge` وحقل `discount` الميت.
7. **⏳ قرارك** — توحيد «50%» و«6 ساعات» مع الأرقام الحقيقية.

> **ملاحظة تنفيذية:** البنود 2 و3 و6 و7 يمكن دمجها في تغيير واحد صغير منخفض المخاطر. البند 4 يحتاج نشر الوسيط على Cloudflare.

---

## 6) كيف تتحقق بنفسك

```bash
npm ci && npx tsc --noEmit && npm run build          # ✅ صفر أخطاء + بناء كامل
npm i -D jsdom@24 && node scripts/hydration-check.mjs # ✅ كل الصفحات تُرطَّب بلا أخطاء

# الوسيط (يحتاج إعادة تشغيل بعد أي تعديل)
node proxy/test-server.mjs &
curl -s "http://127.0.0.1:8787/?u=https%3A%2F%2Fregistry.npmjs.org%2Fhls.js" | head -c 80   # ✅ محتوى
curl -s "http://127.0.0.1:8787/h/registry.npmjs.org/-/v1/search?text=react" | head -c 80    # ✅ الاستعلام يصل
curl -s -o /dev/null -w "%{http_code}\n" -H "Origin: https://evil.example" \
     "http://127.0.0.1:8787/health"                                                          # ✅ 403
curl -s "http://127.0.0.1:8787/h/127.0.0.1/x.m3u8"                                            # ✅ BLOCKED_HOST

# كشف البند 🟠2 (بدون شبكة): نسخة مؤقتة تُصدِّر rewriteManifest
cp proxy/worker.js /tmp/w.mjs && printf '\nexport {rewriteManifest};\n' >> /tmp/w.mjs
node -e "import('/tmp/w.mjs').then(m=>console.log(m.rewriteManifest('seg1.ts','http://h.example/live/i.m3u8')))"
#   → "/h/h.example/live/seg1.ts"   (المتوقع بعد الإصلاح: "/x/h.example/live/seg1.ts")
```
