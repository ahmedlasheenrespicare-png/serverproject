/* سيرفر اختبار محلي — يغلّف worker.js بواجهة Node لتجربته قبل النشر */
import http from "node:http";
import worker from "./worker.js";

const PORT = 8787;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers.set(k, v);
    }
    const request = new Request(url, { method: req.method, headers });
    const resp = await worker.fetch(request);

    const outHeaders = {};
    resp.headers.forEach((v, k) => (outHeaders[k] = v));
    res.writeHead(resp.status, outHeaders);

    const buf = Buffer.from(await resp.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: String(e) }));
  }
});

server.listen(PORT, () => {
  console.log(`✓ وسيط الاختبار يعمل على http://localhost:${PORT}`);
});
