# ستريم ماستر برو — Stream Master Pro

موقع تسويقي عربي (RTL) لاشتراكات IPTV مبني بـ **Vite 7 + React 19 + TypeScript + Tailwind 4**،
مع مشغّلَي بث (قنوات عامة + مشغّل اشتراك Xtream Codes) ووسيط بث على Cloudflare Workers.

---

## تشغيل المشروع

```bash
npm ci            # تثبيت الاعتماديات
npm run dev       # خادم التطوير على http://localhost:5173
npm run typecheck # فحص الأنواع (يجب أن يكون صفرياً)
npm run build     # بناء كامل: واجهة + SSR + رسم مسبق لكل الصفحات
npm run preview   # معاينة ناتج البناء
```

## بنية المشروع

```
src/
  config.ts          الإعدادات المركزية (رابط الوسيط، رقم واتساب، عنوان الموقع، مسار النشر)
  router.tsx         موجّه خفيف بلا مكتبات — يعمل على الخادم والمتصفح
  seo.ts             عنوان ووصف وcanonical وJSON-LD لكل مسار (مصدر واحد)
  data.ts            الباقات والأسعار والأسئلة الشائعة والقنوات المميّزة
  content/posts.ts   مقالات المدوّنة (محتوى منظّم يُرسم كمكوّنات)
  pages/             صفحات الموقع (الرئيسية، القنوات، الباقة، المدوّنة، 404)
  components/        أقسام الموقع والمشغلات والنوافذ
  entry-client.tsx   نقطة دخول المتصفح (hydrate)
  entry-server.tsx   نقطة دخول بناء الـ SSR (تُستخدم للرسم المسبق فقط)
proxy/
  worker.js          وسيط البث (Cloudflare Workers) + سيرفر اختبار محلي
scripts/
  prerender.mjs      يحوّل كل مسار إلى HTML ثابت + يبني sitemap.xml
```

## المسارات

| المسار | الصفحة | ملاحظات |
|---|---|---|
| `/` | الرئيسية | كل الأقسام التسويقية + المشغلات |
| `/channels/` | مكتبة القنوات | بحث وتصنيفات و«عرض المزيد» (تُحمَّل القائمة الكاملة بعد أول رسم) |
| `/nova/` `/ultra/` `/istar/` `/moka/` | صفحة هبوط لكل باقة | أسعار وميزات وشراء مباشر |
| `/blog/` | فهرس المقالات | |
| `/blog/<slug>/` | مقال كامل | ثلاثة مقالات حالياً |
| أي مسار آخر | صفحة 404 | تُبنى أيضاً كـ `dist/404.html` |

## كيف يعمل الرسم المسبق (Prerender)؟

1. `vite build` → يبني الواجهة (HTML + CSS + JS) في `dist/`
2. `vite build --ssr` → يبني الخادم في `dist-ssr/`
3. `node scripts/prerender.mjs` → يرسم كل مسار إلى HTML كامل (المحتوى والعناوين وJSON-LD)،
   ويكتب `dist/<route>/index.html` و`dist/404.html` و`dist/sitemap.xml`

بعد التحميل يعمل الموقع كتطبيق React تفاعلي عادي (hydration)، والتنقّل بين الصفحات فوري بلا إعادة تحميل.

## مسار النشر (مهم)

```bash
npm run build                        # محلياً → مسار "/"
VITE_BASE=/serverproject/ npm run build   # GitHub Pages → مسار المشروع الفرعي
```

وركفلو النشر (`.github/workflows/deploy.yml`) يضبط `VITE_BASE=/serverproject/` و`VITE_SITE_URL`
تلقائياً. عند الانتقال إلى نطاق مخصص: اترك `VITE_BASE=/` واضبط `VITE_SITE_URL` على النطاق الجديد.

## وسيط البث

راجع [`proxy/README.md`](proxy/README.md) — يحتاج إعادة نشر (`npx wrangler deploy`) بعد أي تعديل على `proxy/worker.js`.

```bash
node proxy/test-server.mjs      # تشغيل الوسيط محلياً على http://localhost:8787
```

## فحص الترطيب (اختياري)

للتأكد أن الصفحات المُولَّدة مسبقاً تُرطَّب بلا أخطاء (تكشف أي اختلاف بين رسم الخادم والمتصفح):

```bash
npm run build:ssr
npm i -D jsdom            # مرة واحدة — غير مضمّن في الاعتماديات
node scripts/hydration-check.mjs
```

## قبل الدمج

- [ ] `npm run typecheck` بلا أخطاء
- [ ] `npm run build` ناجح ويحتوي على `dist/sitemap.xml` و`dist/404.html`
- [ ] تجربة المسارات الجديدة محلياً عبر `npm run preview`
- [ ] تحديث `VITE_SITE_URL` إن تغيّر النطاق
