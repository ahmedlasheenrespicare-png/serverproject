/* التواصل — مصدر واحد في src/config.ts
   (كان الرقم مكرَّراً هنا بصيغة عرض مختلفة، فظهر رقم ناقص في JSON-LD المنشور) */
import { WHATSAPP_NUMBER } from "./config";
export { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "./config";

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface Currency {
  code: "SAR" | "EGP" | "AED" | "KWD" | "USD";
  symbol: string;
  name: string;
  rateToSar: number;
}

export const CURRENCIES: Record<string, Currency> = {
  SAR: { code: "SAR", symbol: "ر.س", name: "ريال سعودي", rateToSar: 1 },
  EGP: { code: "EGP", symbol: "ج.م", name: "جنيه مصري", rateToSar: 8.1 },
  AED: { code: "AED", symbol: "د.إ", name: "درهم إماراتي", rateToSar: 0.98 },
  KWD: { code: "KWD", symbol: "د.ك", name: "دينار كويتي", rateToSar: 0.082 },
  USD: { code: "USD", symbol: "$", name: "دولار أمريكي", rateToSar: 0.27 },
};

export interface PricingPlan {
  id: string;
  serverName: string;
  serverCode: "nova" | "istar" | "moka" | "ultra";
  tag: string;
  isPopular?: boolean;
  isVip?: boolean;
  description: string;
  prices: {
    "3": { SAR: number; EGP: number; AED: number; KWD: number; USD: number; oldSar?: number };
    "6": { SAR: number; EGP: number; AED: number; KWD: number; USD: number; oldSar?: number };
    "12": { SAR: number; EGP: number; AED: number; KWD: number; USD: number; oldSar?: number };
    "24": { SAR: number; EGP: number; AED: number; KWD: number; USD: number; oldSar?: number };
  };
  features: string[];
  channelsCount: string;
  vodCount: string;
  quality: string;
  antiFreeze: string;
  devices: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan-nova",
    serverName: "سيرفر نوفا الأصلي (Nova Server)",
    serverCode: "nova",
    tag: "الأكثر طلباً للمباريات ⚽",
    isPopular: true,
    description: "السيرفر الأقوى والأعلى ثباتاً وقت ضغط المباريات والدوريات الكبرى بدون أي تقطيع.",
    prices: {
      "3": { SAR: 95, EGP: 770, AED: 95, KWD: 7.8, USD: 25, oldSar: 120 },
      "6": { SAR: 160, EGP: 1300, AED: 160, KWD: 13.2, USD: 43, oldSar: 200 },
      "12": { SAR: 250, EGP: 2000, AED: 250, KWD: 20.5, USD: 67, oldSar: 340 },
      "24": { SAR: 420, EGP: 3400, AED: 420, KWD: 34.5, USD: 112, oldSar: 580 },
    },
    features: [
      "ثبات مطلق 99.9% في قمة المباريات",
      "قنوات beIN Sports بدقة 4K و50fps وسيرفرات متعددة المصدر",
      "قنوات SSC الرياضية السعودية بجودة فائقة",
      "مكتبة نتفليكس وشاهد وOSN وDisney+ محدثة يومياً",
      "خاصية الترجمة والدبلجة والتايم شفت (TimeShift)",
      "يعمل على جميع الأجهزة وتطبيقات Smart TV",
      "دعم فني وتحديثات مستمرة على مدار الساعة",
    ],
    channelsCount: "+16,500 قناة حية",
    vodCount: "+65,000 فيلم ومسلسل",
    quality: "4K / FHD / HD / SD",
    antiFreeze: "نظام مانع التقطيع H.265 v9.4",
    devices: "شاشة واحدة (أو جهاز واحد في المرة)",
  },
  {
    id: "plan-ultra",
    serverName: "ماستر الترا VIP (Master Ultra 4K)",
    serverCode: "ultra",
    tag: "باقة الـ VIP الفاخرة 👑",
    isVip: true,
    description: "أعلى فئة اشتراك تدعم شاشتين في نفس الوقت مع قنوات 4K حقيقية بدون ضغط وسيرفرات خاصة.",
    prices: {
      "3": { SAR: 140, EGP: 1150, AED: 140, KWD: 11.5, USD: 37, oldSar: 180 },
      "6": { SAR: 230, EGP: 1880, AED: 230, KWD: 18.9, USD: 61, oldSar: 290 },
      "12": { SAR: 370, EGP: 3000, AED: 370, KWD: 30.5, USD: 99, oldSar: 490 },
      "24": { SAR: 610, EGP: 4950, AED: 610, KWD: 50.0, USD: 163, oldSar: 820 },
    },
    features: [
      "تشغيل على جهازين في نفس الوقت (Dual Screen)",
      "سيرفرات كاش مخصصة لكأس العالم 2026 والدوريات الأوروبية",
      "قنوات 4K Ultra HD أصلية مع صوت محيطي Dolby 5.1",
      "أضخم مكتبة أفلام 4K ومسلسلات حصرية مع طلب أي محتوى خاص",
      "سيرفر سريع جداً في التنقل بين القنوات (Zap Time < 0.5s)",
      "دعم فني خاص ذو أولوية VIP عبر واتساب مباشر",
      "ضمان كامل واسترجاع 7 أيام في حال عدم الرضا",
    ],
    channelsCount: "+20,000 قناة حية",
    vodCount: "+85,000 فيلم ومسلسل",
    quality: "True 4K / UHD / FHD / HD",
    antiFreeze: "تقنية CDN VIP Ultra Dedicated",
    devices: "جهازان يعملان معاً في نفس اللحظة",
  },
  {
    id: "plan-istar",
    serverName: "سيرفر إيستار برو (iStar Pro Server)",
    serverCode: "istar",
    tag: "باقة الترفيه الشاملة 🎬",
    description: "توازن مثالي بين القنوات الرياضية العالمية والمكتبة الترفيهية الضخمة مع جودة ممتازة وسرعة تشغيل.",
    prices: {
      "3": { SAR: 80, EGP: 650, AED: 80, KWD: 6.5, USD: 21, oldSar: 110 },
      "6": { SAR: 135, EGP: 1100, AED: 135, KWD: 11.0, USD: 36, oldSar: 175 },
      "12": { SAR: 210, EGP: 1700, AED: 210, KWD: 17.2, USD: 56, oldSar: 290 },
      "24": { SAR: 350, EGP: 2850, AED: 350, KWD: 28.7, USD: 93, oldSar: 480 },
    },
    features: [
      "جميع باقات الرياضة العربية والعالمية",
      "باقات ترفيهية كاملة لجميع أفراد الأسرة والأطفال",
      "مكتبة سينمائية ضخمة تترجم فورياً مع صدور الأفلام",
      "ثبات عالي وتوافق مع كافة مشغلات IPTV",
      "سيرفر مستقر مع استهلاك بيانات منخفض",
      "دعم فني سريع ومساعدة في ضبط الإعدادات",
    ],
    channelsCount: "+14,000 قناة حية",
    vodCount: "+50,000 فيلم ومسلسل",
    quality: "FHD / HD / SD",
    antiFreeze: "نظام الحماية من الانقطاع H.264/265",
    devices: "شاشة واحدة",
  },
  {
    id: "plan-moka",
    serverName: "سيرفر موكا الاقتصادي (Moka Server)",
    serverCode: "moka",
    tag: "الخيار الاقتصادي وسرعات النت الضعيفة ⚡",
    description: "سيرفر خفيف وسريع مصمم خصيصاً ليعمل بكفاءة عالية على سرعات الإنترنت المحدودة ابتداءً من 4 ميجا.",
    prices: {
      "3": { SAR: 65, EGP: 530, AED: 65, KWD: 5.3, USD: 17, oldSar: 90 },
      "6": { SAR: 110, EGP: 890, AED: 110, KWD: 9.0, USD: 29, oldSar: 145 },
      "12": { SAR: 170, EGP: 1380, AED: 170, KWD: 13.9, USD: 45, oldSar: 230 },
      "24": { SAR: 280, EGP: 2280, AED: 280, KWD: 23.0, USD: 75, oldSar: 380 },
    },
    features: [
      "يعمل بسلاسة حتى على سرعات نت 4 إلى 8 ميجابت",
      "قنوات بجودات متعددة SD و HD و Low-Bitrate",
      "جميع قنوات المباريات الأساسية مع سيرفرات بديلة",
      "أفلام ومسلسلات عربية وأجنبية متنوعة",
      "أفضل قيمة مقابل سعر اقتصادي",
      "تفعيل فوري ودعم إعداد المشغل",
    ],
    channelsCount: "+11,000 قناة حية",
    vodCount: "+35,000 فيلم ومسلسل",
    quality: "FHD / HD / SD / Low-Data",
    antiFreeze: "تقنية الضغط الذكي Smart Low-Buffer",
    devices: "شاشة واحدة",
  },
];

export const CHANNEL_CATEGORIES = [
  {
    id: "sports",
    name: "قنوات الرياضة ⚽",
    badge: "تغطية شاملة",
    channels: [
      "beIN Sports 1-9 (4K / FHD / HD)",
      "beIN Sports Premium & Xtra",
      "SSC Sports 1-5 (HD / 4K) السعودية",
      "Abu Dhabi Sports Premium (1 & 2)",
      "Alkass Sports 1-8 القطرية",
      "Sky Sports & TNT Sports UK",
      "DAZN 1-4 & Eurosport",
      "قنوات دوري أبطال أوروبا وكأس العالم 2026",
    ],
  },
  {
    id: "entertainment",
    name: "الأفلام والمسلسلات 🎬",
    badge: "مكتبة VOD ضخمة",
    channels: [
      "باقة نتفليكس الحصرية (Netflix Originals)",
      "باقة شاهد VIP وقنوات MBC HD",
      "باقة OSN الكاملة + OSN Movies & Series",
      "باقة HBO Max & Disney+ Plus",
      "قنوات Box Office السينمائية",
      "قنوات المسلسلات التركية والكورية المترجمة",
    ],
  },
  {
    id: "arab",
    name: "القنوات العربية 🌍",
    badge: "جميع الدول",
    channels: [
      "القنوات السعودية والخليجية الرسمية والخاصة",
      "القنوات المصرية والنايل سات وعربسات كاملة",
      "قنوات الشام (سوريا، لبنان، الأردن، العراق)",
      "قنوات المغرب العربي (المغرب، الجزائر، تونس)",
      "القنوات الإخبارية العربية والدولية 24/7",
    ],
  },
  {
    id: "kids",
    name: "الأطفال والوثائقيات 🦁",
    badge: "عائلي آمن",
    channels: [
      "National Geographic & Nat Geo Wild",
      "Discovery Channel & Animal Planet",
      "Spacetoon & MBC 3 & Majid TV",
      "Cartoon Network & Nickelodeon & Disney XD",
      "قنوات إسلامية وقرآن كريم على مدار 24 ساعة",
    ],
  },
];

export const APPS_AND_DEVICES = [
  {
    device: "شاشات Smart TV (سامسونج وLG)",
    apps: ["IBO Player", "BOB Player", "Flix IPTV", "Smart IPTV", "Set IPTV", "Net IPTV"],
    desc: "يعمل بتطبيق مباشر من متجر الشاشة دون الحاجة لأي رسيفر إضافي.",
    icon: "tv",
  },
  {
    device: "أجهزة Android & TV Box & Firestick",
    apps: ["IPTV Smarters Pro", "XCIPTV Player", "TiviMate", "LED 4K Player"],
    desc: "أفضل تجربة وأسرع تنقل بين القنوات مع دعم خاصية التسجيل.",
    icon: "android",
  },
  {
    device: "أجهزة Apple (Apple TV, iPhone, iPad, Mac)",
    apps: ["S-Player Pro", "IPTVX", "GSE Smart IPTV", "Smarters Lite"],
    desc: "واجهة فائقة السلاسة ودعم AirPlay والمزامنة السحابية.",
    icon: "apple",
  },
  {
    device: "أجهزة الكمبيوتر واللابتوب (Windows / Mac)",
    apps: ["VLC Media Player", "IPTV Smarters Web/App", "MyTVOnline"],
    desc: "مشاهدة مباشرة برابط M3U أو بيانات Xtream Codes المباشرة.",
    icon: "computer",
  },
];

export const FAQS = [
  {
    q: "هل السيرفر مستقر وبدون تقطيع أثناء المباريات الكبيرة؟",
    a: "نعم، سيرفراتنا مزودة بتقنية الحماية من الضغط (Anti-Freeze Tech) وشبكة خوادم CDN موزعة جغرافياً في السعودية والخليج وأوروبا لضمان ثبات 99.9% حتى مع ذروة المشاهدات في نهائيات دوري الأبطال وكأس العالم.",
  },
  {
    q: "كيف أستلم بيانات الاشتراك بعد الشراء؟",
    a: "التفعيل فوري وآلي بالكامل! بمجرد تأكيد الطلب، نرسل لك بيانات الاشتراك (رابط M3U + بيانات Xtream: المستخدم وكلمة السر والسيرفر) عبر واتساب والبريد الإلكتروني خلال 5 دقائق مع شرح كامل لطريقة التشغيل.",
  },
  {
    q: "هل يمكنني طلب تجربة مجانية قبل الاشتراك؟",
    a: "نعم، بكل سرور! نوفر تجربة مجانية لمدة 6 إلى 12 ساعة لتفحص القنوات الرياضية والترفيهية وجودة السيرفر على جهازك قبل دفع أي مبلغ.",
  },
  {
    q: "ما هي سرعة الإنترنت المطلوبة لتشغيل القنوات بدون تقطيع؟",
    a: "لتشغيل قنوات SD/HD تحتاج إلى 4-8 ميجابت. لقنوات FHD تحتاج 15-20 ميجابت. ولقنوات 4K الحقيقية يُفضل 25-30 ميجابت فما فوق.",
  },
  {
    q: "هل يعمل الاشتراك على أكثر من جهاز؟",
    a: "يمكنك تنزيل وتثبيت الاشتراك على كافة أجهزتك (الشاشة، الجوال، التابلت، اللابتوب)، ولكن الباقات القياسية تعمل على جهاز واحد في نفس اللحظة. إذا كنت ترغب بتشغيل جهازين معاً ننصحك بباقة 'ماستر الترا VIP' التي تدعم شاشتين في نفس الوقت.",
  },
  {
    q: "ما هي طرق الدفع المتاحة؟",
    a: "نوفر طرق دفع سهلة وآمنة تناسب جميع الدول: مدى، فيزا، ماستركارد، Apple Pay، STC Pay، فودافون كاش، إنستاباي، تحويل بنكي، وUSDT.",
  },
  {
    q: "هل أحتاج إلى فني لتركيب الاشتراك؟",
    a: "لا تحتاج إلى أي فني على الإطلاق! العملية بسيطة جداً: تقوم بتحميل التطبيق على جهازك، وتدخل كود الاشتراك الذي نرسله لك، وتعمل القنوات فوراً. كما أن فريق الدعم الفني جاهز لمساعدتك خطوة بخطوة عبر واتساب.",
  },
  {
    q: "ما الفرق بين سيرفر نوفا وإيستار وموكا وماستر الترا؟",
    a: "سيرفر نوفا هو الأفضل على الإطلاق للمباريات والرياضة، سيرفر إيستار ممتاز للأفلام والمسلسلات والترفيه، سيرفر موكا اقتصادي جداً ويعمل على النت الضعيف، وسيرفر ماستر الترا VIP هو الأقوى ويدعم شاشتين بدقة 4K حقيقية.",
  },
];

export const TESTIMONIALS = [
  {
    name: "سلطان القحطاني",
    city: "الرياض، السعودية",
    avatar: "🇸🇦",
    rating: 5,
    server: "سيرفر نوفا VIP (سنة)",
    review: "أفضل وأثبت سيرفر جربته في حياتي، تابعت مباريات الكلاسيكو ودوري أبطال أوروبا بدون رمشة واحدة ولا لاج، والدعم الفني يرد في ثواني على الواتساب.",
  },
  {
    name: "محمد العوضي",
    city: "دبي، الإمارات",
    avatar: "🇦🇪",
    rating: 5,
    server: "ماستر الترا 4K (سنة)",
    review: "جودة الـ 4K حقيقية ومكتبة الأفلام والمسلسلات محدثة أولاً بأول كأني مشترك في نتفليكس وشاهد وOSN معاً. تشغيل شاشتين معاً ميزة رائعة جداً للبيت.",
  },
  {
    name: "د. هاني الشريف",
    city: "القاهرة، مصر",
    avatar: "🇪🇬",
    rating: 5,
    server: "سيرفر إيستار برو (6 شهور)",
    review: "كنت متخوف من التقطيع وقت ضغط المباريات لكن التجربة كانت ممتازة والتفعيل تم خلال 3 دقائق بالظبط وطريقة الدفع بفودافون كاش كانت سهلة جداً.",
  },
  {
    name: "بدر الشمري",
    city: "الكويت",
    avatar: "🇰🇼",
    rating: 5,
    server: "سيرفر نوفا (سنتين)",
    review: "سنة كاملة مشترك معاهم وجددت لسنتين إضافيتين، مصداقية عالية وسيرفرات محترمة وتطبيق سريع جداً على شاشة سامسونج سمارت.",
  },
];

/* ==========================================================================
   القنوات المميّزة المعروضة قبل تحميل الملف الكامل
   (كانت داخل LivePlayer — نُقلت هنا لأن صفحة /channels تحتاجها وقت البناء أيضاً)
========================================================================== */
export interface ChannelItem {
  name: string;
  logo: string;
  url: string;
  cat: string;
}

export const FEATURED_CHANNELS: ChannelItem[] = [
  // --- باقة قنوات MBC المؤكدة والمفحوصة بنجاح 100% ---
  {
    name: "MBC 1 HD (العامة والمسلسلات)",
    logo: "🟣",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1-na/eec141533c90dd34722c503a296dd0d8/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC Masr 1 HD (إم بي سي مصر الأولى)",
    logo: "🇪🇬",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC Masr 2 HD (مصر 2 والرياضة)",
    logo: "🇪🇬",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-2/754931856515075b0aabf0e583495c68/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC Masr Drama HD (دراما مصر)",
    logo: "🎭",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-drama/567b703c19ede6598222de81b0e4504b/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC Drama HD (المسلسلات والدراما العربية)",
    logo: "🎭",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-drama/2c28a458e2f3253e678b07ac7d13fe71/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC 4 HD (البرامج والمنوعات)",
    logo: "📺",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-4/24f134f1cd63db9346439e96b86ca6ed/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC 5 HD (إم بي سي 5 المغرب)",
    logo: "🇲🇦",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-5/ee6b000cee0629411b666ab26cb13e9b/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC Bollywood HD (هندي مدبلج ومترجم)",
    logo: "💃",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-bollywood/546eb407d7dcf9a209255dd2496903764/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC Persia HD (أفلام أجنبية وسينما)",
    logo: "🎬",
    url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-persia/818ee8e4b592dc497608f066d825bfb4/index.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "العربية الحدث HD (أخبار MBC)",
    logo: "⚫",
    url: "https://live.alarabiya.net/alarabiapublish/alhadath.smil/playlist.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "العربية الإخبارية HD",
    logo: "🔴",
    url: "https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "العربية أسواق 💹",
    logo: "💹",
    url: "https://live.alarabiya.net/alarabiapublish/aswaaq.smil/playlist.m3u8",
    cat: "قنوات MBC",
  },
  {
    name: "MBC Loud FM",
    logo: "📻",
    url: "https://radio-loud-fm.mbc.net/radio-loud-fm_1.m3u8",
    cat: "قنوات MBC",
  },

  // --- القنوات الإخبارية والرياضية والعامة ---
  {
    name: "الجزيرة الإخبارية HD",
    logo: "🟡",
    url: "https://live-hls-web-aja.getaj.net/AJA/index.m3u8",
    cat: "إخبارية",
  },
  {
    name: "الجزيرة مباشر",
    logo: "🔴",
    url: "https://live-hls-web-ajm.getaj.net/AJM/index.m3u8",
    cat: "إخبارية",
  },
  {
    name: "العراقية سبورت HD",
    logo: "⚽",
    url: "https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8",
    cat: "رياضية",
  },
  {
    name: "Oman Sport TV",
    logo: "⚽",
    url: "https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8",
    cat: "رياضية",
  },
  {
    name: "France 24 عربي",
    logo: "🔵",
    url: "https://static.france24.com/live/F24_AR_HI_HLS/live_web.m3u8",
    cat: "إخبارية",
  },
  {
    name: "DW عربي HD",
    logo: "🔷",
    url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    cat: "إخبارية",
  },
  {
    name: "Watan TV وطن مصرية",
    logo: "🇪🇬",
    url: "https://rp.tactivemedia.com/watantv_source/live/playlist.m3u8",
    cat: "مصرية",
  },
  {
    name: "Mekameleen مكملين",
    logo: "📺",
    url: "https://mn-nl.mncdn.com/mekameleen/smil:mekameleentv.smil/playlist.m3u8",
    cat: "مصرية",
  },
  {
    name: "Koogi TV أطفال",
    logo: "🧒",
    url: "https://5d658d7e9f562.streamlock.net/koogi.tv/koogi.smil/playlist.m3u8",
    cat: "أطفال",
  },
  {
    name: "Qatar Quran القرآن الكريم",
    logo: "🕌",
    url: "https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master1080p.m3u8",
    cat: "دينية",
  },
  {
    name: "Asharq Discovery وثائقية",
    logo: "🦁",
    url: "https://svs.itworkscdn.net/asharqdiscoverylive/asharqd.smil/playlist_dvr.m3u8",
    cat: "وثائقية",
  },
  {
    name: "Big Buck Bunny 4K Cinema Demo",
    logo: "🐰",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    cat: "أفلام",
  },
];