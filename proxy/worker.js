/* ==========================================================================
   وسيط بث HLS مجاني — Stream Master Pro
   --------------------------------------------------------------------------
   يعمل على:  Cloudflare Workers (موصى به — نطاق ترددي غير محدود مجاناً)
              Deno Deploy (يعمل أيضاً بنفس الملف)

   المخططات المدعومة (نفس مخططات الوسيط القديم — لا تغيير في المشغل):
     /h/<host>/<path>          → https://<host>/<path>   (أي قناة)
     /live/<path>              → سيرفر MBC الرئيسي مباشرة
     /?u=<full-url>            → أي رابط كامل (اختياري)
     /                         → صفحة التحقق من أن الوسيط يعمل
   ========================================================================== */

const MBC_CDN = "https://shd-gcp-live.edgenextcdn.net";

/* رؤوس CORS */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type, Origin",
  "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
};

export default {
  async fetch(request) {
    /* طلبات التحقق المسبق */
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    /* صفحة الحالة — افتح الوسيط في المتصفح للتأكد أنه يعمل */
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(statusPage(url.origin), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...CORS_HEADERS },
      });
    }

    if (url.pathname === "/health") {
      return new Response("OK", { status: 200, headers: CORS_HEADERS });
    }

    /* المسار العام: /h/<host>/<path> — عبر https */
    const m = url.pathname.match(/^\/h\/([^/]+)(\/.*)?$/);
    if (m) {
      return proxyTo(`https://${m[1]}${m[2] || "/"}`, request);
    }

    /* المسار العام البديل: /x/<host>/<path> — عبر http
       (لبعض سيرفرات IPTV التي لا تدعم https مثل البوابة ببورت مباشر) */
    const mx = url.pathname.match(/^\/x\/([^/]+)(\/.*)?$/);
    if (mx) {
      return proxyTo(`http://${mx[1]}${mx[2] || "/"}`, request);
    }

    /* مسار MBC المباشر (مطابق للوسيط القديم) */
    if (url.pathname.startsWith("/live/")) {
      return proxyTo(MBC_CDN + url.pathname, request);
    }

    /* مسار MBC للراديو (رابط radio-loud-fm.mbc.net يتحوّل تلقائياً عبر /h/) */

    return new Response(
      JSON.stringify({ error: "NOT_FOUND", hint: "استخدم /h/<host>/<path> أو /live/<path>" }),
      { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  },
};

/* ==========================================================================
   الوكيل الرئيسي
========================================================================== */
async function proxyTo(targetStr, request) {
  let target;
  try {
    target = new URL(targetStr);
  } catch {
    return jsonError("INVALID_URL", 400);
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return jsonError("BAD_SCHEME", 400);
  }

  /* حجب المحاولات الداخلية (أمان أساسي) */
  const h = target.hostname;
  if (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)
  ) {
    return jsonError("BLOCKED_HOST", 403);
  }

  /* تمرير الرؤوس المهمة فقط */
  const fwd = new Headers();
  for (const k of ["range", "accept", "user-agent", "accept-language"]) {
    const v = request.headers.get(k);
    if (v) fwd.set(k, v);
  }

  const isSegment = /\.(ts|m4s|aac|mp4|ac3|vtt)(\?|$)/i.test(target.pathname);

  let resp;
  try {
    resp = await fetch(target, {
      method: request.method === "HEAD" ? "GET" : request.method,
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
    return jsonError("UPSTREAM_FAILED: " + (e && e.message ? e.message : "network"), 502);
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
          ...CORS_HEADERS,
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
  for (const [k, v] of Object.entries(CORS_HEADERS)) out.set(k, v);

  return new Response(resp.body, { status: resp.status, headers: out });
}

/* ==========================================================================
   إعادة كتابة قوائم التشغيل m3u8
   - الأسطر العادية (روابط)           → /h/<host>/<path>
   - خصائص URI="..." (مفاتيح/صوت)     → /h/<host>/<path>
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
function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
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
