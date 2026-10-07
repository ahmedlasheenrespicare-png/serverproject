import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    /* الملف الواحد مفيد للتطوير/المعاينة فقط — في الإنتاج نُخرِج ملفات منفصلة
       ليستفيد الزائر من كاش المتصفح لملفات الvendor بدلاً من إعادة تحميل 1MB كل مرة */
    ...(command === "build" ? [] : [viteSingleFile()]),
  ],
  server: {
    host: true,
    allowedHosts: true,
  },
  build: {
    /* فصل مكتبات الطرف الثالث في chunk مستقل قابل للتخزين المؤقت.
       hls.js ليست هنا عن قصد: تُستورد ديناميكياً فتُخرج في chunk منفصل
       لا يُحمَّل إلا عند أول تشغيل فعلي لأي مشغل. */
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
