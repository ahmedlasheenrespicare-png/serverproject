/* ==========================================================================
   بيانات SEO لكل مسار — مصدر واحد يستخدمه:
   • الموقع عند التنقّل بين الصفحات (تحديث العنوان والوصف)
   • سكربت البناء المسبق (Prerender) الذي يكتبها داخل HTML كل صفحة
========================================================================== */

import { absolute, BRAND_EN, BRAND_NAME, SITE_URL, WHATSAPP_DISPLAY } from "./config";
import { FAQS, PRICING_PLANS } from "./data";
import { BLOG_POSTS } from "./content/posts";

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType: "website" | "article";
  jsonLd: Record<string, unknown>[];
}

const OG_IMAGE = `${SITE_URL}/images/og-default.png`;

/* تنظيم الموقع — يظهر في كل الصفحات */
const organizationLd = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: `${BRAND_NAME} — ${BRAND_EN}`,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon-512.png`,
  description: "اشتراكات وسيرفرات IPTV بثبات عالٍ بدون تقطيع في السعودية والخليج ومصر",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${WHATSAPP_DISPLAY.replace(/[^\d]/g, "")}`,
    contactType: "customer support",
    availableLanguage: ["Arabic", "English"],
  },
};

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  };
}

export function getSeo(path: string): SeoMeta {
  const clean = `/${path.replace(/^\/+|\/+$/g, "")}`;
  const base: SeoMeta = {
    title: `${BRAND_NAME} | افضل اشتراك IPTV 2026 بدون تقطيع`,
    description:
      "اشتراكات وسيرفرات IPTV بثبات 99.9% في السعودية والخليج ومصر — قنوات رياضية وإخبارية ومكتبة أفلام، تفعيل فوري وتجربة مجانية.",
    canonical: absolute(""),
    robots: "index, follow, max-image-preview:large, max-snippet:-1",
    ogType: "website",
    jsonLd: [organizationLd],
  };

  /* ===== الصفحة الرئيسية ===== */
  if (clean === "/") {
    return {
      ...base,
      jsonLd: [
        organizationLd,
        breadcrumbs([{ name: "الرئيسية", path: "/" }]),
        {
          "@type": "Product",
          "@id": `${SITE_URL}/#product`,
          name: "اشتراك سيرفر IPTV بدون تقطيع 2026",
          description:
            "اشتراكات IPTV أصلية بجودة 4K/Full HD مع تفعيل فوري وضمان ثبات طوال مدة الاشتراك.",
          brand: { "@type": "Brand", name: BRAND_EN },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "SAR",
            lowPrice: "65",
            highPrice: "610",
            offerCount: String(PRICING_PLANS.length * 4),
            availability: "https://schema.org/InStock",
          },
          url: absolute(""),
          image: OG_IMAGE,
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.slice(0, 6).map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ],
    };
  }

  /* ===== صفحات الباقات ===== */
  const plan = PRICING_PLANS.find((p) => clean === `/${p.serverCode}`);
  if (plan) {
    const cheapest = Math.min(...Object.values(plan.prices).map((v) => v.SAR));
    const nameOnly = plan.serverName.split("(")[0].trim();
    return {
      ...base,
      title: `${nameOnly} — اشتراك IPTV ${plan.quality} | ${BRAND_NAME}`,
      description: `${plan.description} ${plan.channelsCount} و${plan.vodCount} — يبدأ من ${cheapest} ر.س مع تفعيل فوري وتجربة مجانية.`,
      canonical: absolute(`${plan.serverCode}/`),
      jsonLd: [
        organizationLd,
        breadcrumbs([
          { name: "الرئيسية", path: "/" },
          { name: nameOnly, path: `/${plan.serverCode}/` },
        ]),
        {
          "@type": "Product",
          name: plan.serverName,
          description: plan.description,
          brand: { "@type": "Brand", name: BRAND_EN },
          category: "IPTV Subscription",
          url: absolute(`${plan.serverCode}/`),
          image: OG_IMAGE,
          offers: Object.entries(plan.prices).map(([months, price]) => ({
            "@type": "Offer",
            name: `${Number(months)} شهر`,
            price: String(price.SAR),
            priceCurrency: "SAR",
            availability: "https://schema.org/InStock",
            url: absolute(`${plan.serverCode}/`),
          })),
        },
      ],
    };
  }

  /* ===== صفحة القنوات ===== */
  if (clean === "/channels") {
    return {
      ...base,
      title: `قائمة القنوات المتوفرة في الاشتراك | ${BRAND_NAME}`,
      description:
        "تصفّح القنوات الرياضية والإخبارية والعربية وقنوات الأطفال والوثائقيات المتوفرة داخل الاشتراك — بحث فوري وتصنيفات كاملة.",
      canonical: absolute("channels/"),
      jsonLd: [
        organizationLd,
        breadcrumbs([
          { name: "الرئيسية", path: "/" },
          { name: "القنوات", path: "/channels/" },
        ]),
      ],
    };
  }

  /* ===== المدوّنة ===== */
  if (clean === "/blog") {
    return {
      ...base,
      title: `مقالات ودلائل تشغيل الـ IPTV | ${BRAND_NAME}`,
      description:
        "دلائل عملية: كيف تختبر ثبات السيرفر، وطريقة تشغيل الاشتراك على شاشات سامسونج وLG، وكيف تختار السيرفر المناسب لسرعتك.",
      canonical: absolute("blog/"),
      jsonLd: [
        organizationLd,
        breadcrumbs([
          { name: "الرئيسية", path: "/" },
          { name: "المدوّنة", path: "/blog/" },
        ]),
        {
          "@type": "Blog",
          name: `مدوّنة ${BRAND_NAME}`,
          url: absolute("blog/"),
          blogPost: BLOG_POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absolute(`blog/${p.slug}/`),
            datePublished: p.date,
          })),
        },
      ],
    };
  }

  const post = BLOG_POSTS.find((p) => clean === `/blog/${p.slug}`);
  if (post) {
    return {
      ...base,
      title: `${post.title} | ${BRAND_NAME}`,
      description: post.description,
      canonical: absolute(`blog/${post.slug}/`),
      ogType: "article",
      jsonLd: [
        organizationLd,
        breadcrumbs([
          { name: "الرئيسية", path: "/" },
          { name: "المدوّنة", path: "/blog/" },
          { name: post.title, path: `/blog/${post.slug}/` },
        ]),
        {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: "ar",
          mainEntityOfPage: absolute(`blog/${post.slug}/`),
          author: { "@type": "Organization", name: BRAND_NAME },
          publisher: { "@id": `${SITE_URL}/#organization` },
          image: OG_IMAGE,
          wordCount: post.sections.reduce(
            (n, s) => n + (s.paragraphs?.join(" ").split(/\s+/).length ?? 0),
            0
          ),
        },
      ],
    };
  }

  /* ===== صفحة غير موجودة ===== */
  return {
    ...base,
    title: `الصفحة غير موجودة | ${BRAND_NAME}`,
    description: "الصفحة التي تبحث عنها غير متوفرة — تصفّح الباقات أو القنوات من الصفحة الرئيسية.",
    canonical: absolute(""),
    robots: "noindex, follow",
    jsonLd: [],
  };
}

/* تحديث وسوم الرأس أثناء التنقّل داخل الموقع (بدون إعادة تحميل) */
export function applySeoToDocument(path: string) {
  if (typeof document === "undefined") return;
  const seo = getSeo(path);
  document.title = seo.title;
  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      const m = /\[([a-z:]+)="([^"]+)"\]/.exec(selector);
      if (m) el.setAttribute(m[1], m[2]);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };
  setMeta('meta[name="description"]', "content", seo.description);
  setMeta('meta[name="robots"]', "content", seo.robots);
  setMeta('meta[property="og:title"]', "content", seo.title);
  setMeta('meta[property="og:description"]', "content", seo.description);
  setMeta('meta[property="og:url"]', "content", seo.canonical);
  setMeta('meta[property="og:type"]', "content", seo.ogType);
  setMeta('meta[name="twitter:title"]', "content", seo.title);
  setMeta('meta[name="twitter:description"]', "content", seo.description);

  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = seo.canonical;
}
