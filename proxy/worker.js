/* ==========================================================================
   وسيط بث HLS — Stream Master Pro
   --------------------------------------------------------------------------
   يعمل على:  Cloudflare Workers (موصى به — نطاق ترددي غير محدود مجاناً)
              Deno Deploy (يعمل أيضاً بنفس الملف)

   المخططات المدعومة (نفس مخططات الوسيط القديم — لا تغيير في المشغل):
     /h/<host>/<path>?<query>   → https://<host>/<path>?<query>   (أي قناة)
     /x/<host>/<path>?<query>   → http://<host>/<path>?<query>    (سيرفرات بلا TLS)
     /live/<path>?<query>       → سيرفر MBC الرئيسي مباشرة
     /?u=<full-url>             → أي رابط كامل مُرمَّز (يستخدمه مشغل الاشتراك)
     /health                    → فحص سريع للوسيط
     /                          → صفحة التحقق من أن الوسيط يعمل

   ملاحظات الإصلاح (مقارنة بالنسخة السابقة):
   1) مسار /?u=<full-url> أصبح مُنفَّذاً فعلياً (كان موثّقاً لكنه يُرجع صفحة الحالة)
   2) سلسلة الاستعلام url.search تُمرَّر الآن في كل المسارات — بدونها تفشل القنوات
      المحمية بـ token وتتوقف قوائم m3u8 المُعاد كتابتها في منتصف البث
   3) CORS مُقيَّد بنطاقات الموقع بدل "*" حتى لا يُستخدم الوسيط كوسيط مفتوح
   4) حجب أقوى للمضيفات الداخلية (IPv6 / صيغ IPv4 البديلة / أسماء بلا نقطة)
   ========================================================================== */

const MBC_CDN = "https://shd-gcp-live.edgenextcdn.net";

/* ==========================================================================
   النطاقات المسموح لها باستخدام الوسيط من المتصفح
   أضف نطاقك المخصص هنا عند ربطه (مثال: "https://example.com")
========================================================================== */
const ALLOWED_ORIGINS = [
  "https://ahmedlasheenrespicare-png.github.io",
];

/* طلبات بلا Origin (تشغيل أصلي داخل <video>، أو أدوات سطر أوامر) مسموحة،
   أما الطلبات القادمة من مواقع أخرى فتُرفض لمنع سرقة النطاق الترددي. */
function resolveCors(request) {
  const origin = request.headers.get("Origin") || "";

  const allowed =
    origin === "" ||
    ALLOWED_ORIGINS.includes(origin) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.e2b\.app$/i.test(origin) || /* بيئة المعاينة */
    /^https:\/\/[a-z0-9-]+\.ahmedlasheenrespicare\.workers\.dev$/i.test(origin);

  if (!allowed) return null;

  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Content-Type, Origin",
    "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
  };
}

export default {
  async fetch(request) {
    /* نتحقق من المصدر أولاً — أي موقع غير مسموح يحصل على 403 */
    const cors = resolveCors(request);
    if (!cors) {
      return new Response(
        JSON.stringify({ error: "ORIGIN_NOT_ALLOWED", hint: "هذا الوسيط مخصص لموقع واحد فقط" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    /* طلبات التحقق المسبق */
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    /* الرابط الكامل المُرمَّز: /?u=<encoded-url>
       (يستخدمه مشغل الاشتراك كمرشّح احتياطي — يجب أن يسبق فحص صفحة الحالة) */
    const fullUrl = url.searchParams.get("u");
    if (fullUrl) {
      return proxyTo(fullUrl, request, cors);
    }

    /* صفحة الحالة — افتح الوسيط في المتصفح للتأكد أنه يعمل */
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(statusPage(url.origin), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...cors },
      });
    }

    if (url.pathname === "/health") {
      return new Response("OK", { status: 200, headers: cors });
    }

    /* المسار العام: /h/<host>/<path> — عبر https
       ⚠️ مهم: نمرّر url.search لأن كثيراً من السيرفرات تعتمد على ?token=... */
    const m = url.pathname.match(/^\/h\/([^/]+)(\/.*)?$/);
    if (m) {
      return proxyTo(`https://${m[1]}${m[2] || "/"}${url.search}`, request, cors);
    }

    /* المسار العام البديل: /x/<host>/<path> — عبر http
       (لبعض سيرفرات IPTV التي لا تدعم https مثل البوابة ببورت مباشر) */
    const mx = url.pathname.match(/^\/x\/([^/]+)(\/.*)?$/);
    if (mx) {
      return proxyTo(`http://${mx[1]}${mx[2] || "/"}${url.search}`, request, cors);
    }

    /* مسار MBC المباشر (مطابق للوسيط القديم) */
    if (url.pathname.startsWith("/live/")) {
      return proxyTo(MBC_CDN + url.pathname + url.search, request, cors);
    }

    return new Response(
      JSON.stringify({
        error: "NOT_FOUND",
        hint: "استخدم /h/<host>/<path> أو /x/<host>/<path> أو /live/<path> أو /?u=<full-url>",
      }),
      { status: 404, headers: { "Content-Type": "application/json", ...cors } }
    );
  },
};

/* ==========================================================================
   حجب المضيفات الداخلية والخاصة (أمان أساسي ضد SSRF)
   يغطي: localhost، النطاقات الداخلية، IPv4 الخاص، IPv6، الصيغ البديلة
========================================================================== */
function isBlockedHost(hostname) {
  /* URL يحتفظ بأقواس IPv6: [::1] → نزيلها */
  const h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");

  if (!h) return true;
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".home.arpa")
  ) {
    return true;
  }

  /* أي IPv6 (بما فيها ::1 و ::ffff:127.0.0.1) — لا حاجة لها في بث HLS */
  if (h.includes(":")) return true;

  /* صور الأرقام البديلة: 127.1 / 2130706433 / 0x7f000001 / 0177.0.0.1 */
  if (/^\d[\d.]*$/.test(h) || /^0x/i.test(h)) {
    const parts = h.split(".");
    if (parts.length !== 4) return true; /* 127.1 أو 2130706433 أو 0x7f000001 */
    const p = parts.map((n) => Number(n));
    if (p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
    const [a, b] = p;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; /* metadata */
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; /* CGNAT */
    if (a >= 224) return true; /* multicast / محجوز */
    return false;
  }

  /* اسم بلا نقطة (لا يمكن أن يكون نطاقاً عاماً على الإنترنت) */
  if (!h.includes(".")) return true;

  return false;
}

/* ==========================================================================
   الوكيل الرئيسي
========================================================================== */
async function proxyTo(targetStr, request, cors) {
  let target;
  try {
    target = new URL(String(targetStr).trim());
  } catch {
    return jsonError("INVALID_URL", 400, cors);
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return jsonError("BAD_SCHEME", 400, cors);
  }

  if (isBlockedHost(target.hostname)) {
    return jsonError("BLOCKED_HOST", 403, cors);
  }

  /* تمرير الرؤوس المهمة فقط */
  const fwd = new Headers();
  for (const k of ["range", "accept", "user-agent", "accept-language"]) {
    const v = request.headers.get(k);
    if (v) fwd.set(k, v);
  }

  const isHead = request.method === "HEAD";
  const isSegment = /\.(ts|m4s|aac|mp4|ac3|vtt)(\?|$)/i.test(target.pathname);

  let resp;
  try {
    resp = await fetch(target, {
      method: isHead ? "GET" : request.method,
      headers: fwd,
      redirect: "follow",
      /* تخزين مؤقت عند حافة Cloudflare (يقلل الطلبات على السيرفر الأصلي)
         — تُتجاهل تلقائياً على Deno */
      ...(isSegment &&
      request.method === "GET" &&
      !request.headers.get("range") &&
      typeof navigator !== "undefined" &&
      /cloudflare/i.test(navigator.userAgent || "")
        ? { cf: { cacheEverything: true, cacheTtl: 120 } }
        : {}),
    });
  } catch (e) {
    return jsonError("UPSTREAM_FAILED: " + (e && e.message ? e.message : "network"), 502, cors);
  }

  /* إعادة كتابة قوائم m3u8 بحيث تمر كل الروابط الداخلية عبر الوسيط */
  const ct = (resp.headers.get("content-type") || "").toLowerCase();
  const isManifest =
    target.pathname.endsWith(".m3u8") || ct.includes("mpegurl") || ct.includes("vnd.apple");

  if (isManifest && request.method === "GET" && resp.status === 200 && resp.body) {
    try {
      const text = await resp.text();
      const finalUrl = resp.url || target.href;
      const rewritten = rewriteManifest(text, finalUrl);
      return new Response(rewritten, {
        status: resp.status,
        headers: {
          "Content-Type": resp.headers.get("content-type") || "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
          ...cors,
        },
      });
    } catch {
      /* عند الفشل نمرر الأصل كما هو */
    }
  }

  /* تمرير الاستجابة كما هي (بث مباشر) */
  const out = new Headers(resp.headers);
  out.delete("content-encoding");
  out.delete("content-length");
  out.delete("transfer-encoding");
  for (const [k, v] of Object.entries(cors)) out.set(k, v);

  return new Response(isHead ? null : resp.body, { status: resp.status, headers: out });
}

/* ==========================================================================
   إعادة كتابة قوائم التشغيل m3u8
   - الأسطر العادية (روابط)           → /h/<host>/<path>?<query>
   - خصائص URI="..." (مفاتيح/صوت)     → /h/<host>/<path>?<query>
   - الروابط النسبية تُحلّ مقابل الرابط النهائي للسيرفر
========================================================================== */
function toProxyPath(u) {
  return `/h/${u.host}${u.pathname}${u.search}`;
}

function rewriteManifest(text, baseUrl) {
  return text
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (!t) return line;

      if (t.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (orig, u) => {
          try {
            return `URI="${toProxyPath(new URL(u, baseUrl))}"`;
          } catch {
            return orig;
          }
        });
      }

      try {
        return toProxyPath(new URL(t, baseUrl));
      } catch {
        return line;
      }
    })
    .join("\n");
}

/* ==========================================================================
   أدوات مساعدة
========================================================================== */
function jsonError(msg, status, cors) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...(cors || {}) },
  });
}

function statusPage(origin) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>وسيط البث — يعمل ✅</title>
<style>
  body{font-family:system-ui,sans-serif;background:#faf9f6;color:#0b0b0f;display:grid;place-items:center;min-height:100vh;margin:0;padding:20px}
  .card{background:#fff;border:1px solid #e5e5e5;border-radius:24px;padding:40px;max-width:520px;text-align:center;box-shadow:0 20px 60px -20px rgba(0,0,0,.15)}
  .ok{width:64px;height:64px;border-radius:50%;background:#d8ff3e;display:grid;place-items:center;font-size:32px;margin:0 auto 16px}
  h1{font-size:22px;margin:0 0 8px}
  p{color:#666;font-size:14px;line-height:1.8;margin:6px 0}
  code{background:#0b0b0f;color:#d8ff3e;padding:3px 10px;border-radius:8px;font-size:12px;direction:ltr;display:inline-block}
</style>
</head>
<body>
  <div class="card">
    <div class="ok">✓</div>
    <h1>وسيط البث يعمل بنجاح</h1>
    <p>الآن الصق هذا الرابط في ملف المشغل:</p>
    <p><code>${origin}</code></p>
    <p style="font-size:12px;color:#999">لا تضف أي مسار في النهاية — المشغل يبني الروابط تلقائياً</p>
  </div>
</body>
</html>`;
}
