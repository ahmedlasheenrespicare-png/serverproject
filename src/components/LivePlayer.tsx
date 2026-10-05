import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  IconCheck,
  IconClock,
  IconPlay,
  IconSearch,
  IconShieldCheck,
  IconTv,
  IconZap,
} from "./Icons";
import { Reveal } from "./motion";

export interface ChannelItem {
  name: string;
  logo: string;
  url: string;
  cat: string;
}

// Built-in verified high-speed live channels including full MBC Network
const DEFAULT_CHANNELS: ChannelItem[] = [
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

// ====== وسيط البث: مواجهة حجب بعض الشبكات لسيرفرات القنوات ======
// بعض مزودي الإنترنت (خصوصاً في مصر) يحجبون سيرفرات بث معينة.
// عند فشل الاتصال المباشر يتم التبديل تلقائياً لأول وسيط يعمل من القائمة.

/* ⚙️⚙️⚙️ روابط الوسيط — تُجرّب بالترتيب عند فشل الاتصال المباشر ⚙️⚙️⚙️ */
const PROXY_BASES: string[] = [
  "https://serverproject.ahmedlasheenrespicare.workers.dev", // ✅ الوسيط الرسمي — Cloudflare Workers (مجاني، نطاق غير محدود، يُنشر تلقائياً مع كل push عبر wrangler.jsonc)
  // "https://dry-elephant-8562.ahmedlasheenrespicare-png.deno.net", // وسيط Deno قديم (موقوف USAGE_EXCEEDED) — احتياطي معطّل
];

/* تجربة وسيط فوراً بدون تعديل الكود — أضف للرابط:  ?proxy=https://xxx.workers.dev
   (يُحفظ للجلسة الحالية فقط — مفيد للاختبار قبل التفعيل الدائم) */
function resolveProxyBases(): string[] {
  try {
    const p = new URLSearchParams(window.location.search).get("proxy");
    if (p && p.startsWith("https://")) {
      sessionStorage.setItem("smp-proxy", p);
      return [p, ...PROXY_BASES];
    }
    const saved = sessionStorage.getItem("smp-proxy");
    if (saved && saved.startsWith("https://")) return [saved, ...PROXY_BASES];
  } catch {
    /* بيئة بدون sessionStorage — تجاهل */
  }
  return PROXY_BASES;
}
const ACTIVE_PROXY_BASES = resolveProxyBases();

// تحويل رابط القناة إلى رابط الوسيط
// - سيرفر MBC الرئيسي: مساره المخصص المباشر (الأسرع)
// - أي سيرفر آخر: المسار العام /h/<السيرفر>/<المسار> — يعمل لكل قنوات القائمة
function getProxyUrl(base: string, url: string): string {
  if (url.startsWith("https://shd-gcp-live.edgenextcdn.net/")) {
    return base + url.slice("https://shd-gcp-live.edgenextcdn.net".length);
  }
  const m = url.match(/^https:\/\/([^/]+)(\/.*)?$/);
  if (m) {
    return `${base}/h/${m[1]}${m[2] || "/"}`;
  }
  return url; // روابط غير مدعومة تبقى كما هي
}

// ذاكرة الجلسة: رقم الوسيط الناجح لشبكة هذا الزائر (0 = مباشر) — يُحفظ حتى التنقل بين القنوات
let needsProxySession: number | null = null;

interface LivePlayerProps {
  onOpenTrial: () => void;
}

export default function LivePlayer({ onOpenTrial }: LivePlayerProps) {
  const [channels, setChannels] = useState<ChannelItem[]>(DEFAULT_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem>(DEFAULT_CHANNELS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("قنوات MBC");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [bufferSec, setBufferSec] = useState<number>(0);
  const [proxyIdx, setProxyIdx] = useState<number>(needsProxySession ?? 0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Load complete channels.json if available
  useEffect(() => {
    fetch("./channels.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.channels) && data.channels.length > 0) {
          setChannels(data.channels);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_CHANNELS
      });
  }, []);

  // Monitor playback buffer health in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const v = videoRef.current;
      if (v && v.buffered.length > 0) {
        try {
          const current = v.currentTime;
          const end = v.buffered.end(v.buffered.length - 1);
          const diff = Math.max(0, end - current);
          setBufferSec(Math.round(diff * 10) / 10);
        } catch {
          // Ignore
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and switch ultra-fast HLS stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedChannel.url) return;

    // هل هذه القناة من النوع القابل للتمرير عبر الوسيط؟
    const canProxy = ACTIVE_PROXY_BASES.length > 0 && getProxyUrl(ACTIVE_PROXY_BASES[0], selectedChannel.url) !== selectedChannel.url;
    const playbackUrl = proxyIdx > 0 && canProxy
      ? getProxyUrl(ACTIVE_PROXY_BASES[proxyIdx - 1], selectedChannel.url)
      : selectedChannel.url;

    setIsLoading(true);
    setStatusMsg(
      proxyIdx > 0 && canProxy
        ? `🔄 جاري الاتصال عبر الوسيط ${proxyIdx}/${ACTIVE_PROXY_BASES.length}...`
        : "⚡ جاري الاتصال فائق السرعة بسيرفر القناة..."
    );

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    let manifestParsed = false;
    let switchTimer: number | undefined;

    // التبديل التلقائي للوسيط التالي (يُستدعى عند اكتشاف حجب الشبكة أو وسيط متوقف)
    const switchToProxy = (): boolean => {
      if (canProxy && proxyIdx < ACTIVE_PROXY_BASES.length) {
        needsProxySession = proxyIdx + 1;
        setProxyIdx(proxyIdx + 1);
        return true;
      }
      return false;
    };

    // مؤقت أمان: لو الرابط المباشر لم يستجب خلال 6 ثوانٍ (شبكة تحجب السيرفر) → بدّل للوسيط
    if (canProxy && proxyIdx === 0) {
      switchTimer = window.setTimeout(() => {
        if (!manifestParsed) switchToProxy();
      }, 6000);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        startFragPrefetch: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
        fragLoadingTimeOut: 15000,
        manifestLoadingTimeOut: 10000,
        levelLoadingTimeOut: 10000,
        autoStartLoad: true,
        capLevelToPlayerSize: false,
      });

      hls.loadSource(playbackUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        manifestParsed = true;
        setIsLoading(false);
        setStatusMsg("");

        // Autoplay with muted fallback to bypass browser policy
        video.muted = isMuted;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // If browser blocked unmuted autoplay, mute and play
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_event, data) => {
        if (data.audioTracks && data.audioTracks.length > 0 && hls.audioTrack === -1) {
          hls.audioTrack = 0;
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // الشبكة تحجب السيرفر المباشر؟ → بدّل للوسيط قبل محاولة إعادة الاتصال
              if (switchToProxy()) break;
              setStatusMsg("جاري الاتصال بالسيرفر الاحتياطي...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setStatusMsg("جاري تصحيح البث...");
              hls.recoverMediaError();
              break;
            default:
              setIsLoading(false);
              setStatusMsg("تعذر تشغيل هذه القناة حالياً — جرب قناة أخرى");
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Apple Safari HLS
      video.src = playbackUrl;
      video.muted = isMuted;
      video.addEventListener("loadedmetadata", () => {
        manifestParsed = true;
        setIsLoading(false);
        setStatusMsg("");
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener("error", () => {
        switchToProxy();
      }, { once: true });
    }

    return () => {
      if (switchTimer !== undefined) {
        window.clearTimeout(switchTimer);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel, proxyIdx]);

  // Handle Play Overlay Click
  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle Unmute
  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  // Categories list
  const categories = [
    "قنوات MBC",
    "الكل",
    "رياضية",
    "إخبارية",
    "مصرية",
    "أفلام",
    "دينية",
    "وثائقية",
    "أطفال",
    "منوعات",
  ];

  // Filtered channels
  const filteredChannels = channels.filter((c) => {
    const matchesCat = selectedCategory === "الكل" || c.cat === selectedCategory;
    const matchesSearch = searchQuery === "" || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="live-player" className="py-20 md:py-28 bg-white border-y border-black/10 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 relative">
        {/* الترويسة */}
        <Reveal variant="up" className="text-center max-w-[760px] mx-auto mb-12 md:mb-16">
          <p className="text-[12px] font-black tracking-[0.25em] uppercase text-[#ff5c4d] mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-[2px] bg-[#ff5c4d] inline-block" /> بث مباشر مجاني
          </p>
          <h2 className="font-display font-black tracking-tight leading-[1.15] text-[36px] md:text-[56px]">
            شاهد قنوات MBC <span className="font-serif italic font-normal">مباشرة</span> الآن
          </h2>
          <p className="mt-4 text-[15px] md:text-[16.5px] text-black/60 font-medium leading-relaxed">
            مشغل تفاعلي لبث قنوات MBC 1 وMBC Masr وMBC Drama وMBC 4 والقنوات الرياضية
            والإخبارية بدون تقطيع — جرّب الجودة قبل الاشتراك.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* المشغل الرئيسي */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <Reveal variant="zoom" threshold={0.15}>
            <div className="relative rounded-[24px] overflow-hidden border border-black/10 bg-white shadow-[0_50px_100px_-40px_rgba(0,0,0,0.4)]">
              {/* شريط المتصفح */}
              <div className="flex items-center gap-2 px-5 h-12 border-b border-black/10 bg-[#f7f6f2]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white border border-black/10 rounded-full px-4 py-1 text-[12px] font-bold text-black/60 flex items-center gap-2 max-w-sm w-full justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#ff5c4d] animate-pulse-soft" />
                    stream-master.pro / live
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black bg-[#ff5c4d] text-white px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> مباشر
                </span>
              </div>

              {/* منطقة الفيديو */}
              <div className="relative aspect-video w-full bg-black group">
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain bg-black"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onVolumeChange={() => {
                    if (videoRef.current) {
                      setIsMuted(videoRef.current.muted);
                    }
                  }}
                />

                {/* رسالة الحالة */}
                {statusMsg && (
                  <div className="absolute top-4 inset-x-0 mx-auto w-fit glass-dark text-[#d8ff3e] border border-white/15 text-xs font-bold px-4 py-1.5 rounded-full z-20 animate-pulse-soft">
                    {statusMsg}
                  </div>
                )}

                {/* زر التشغيل الكبير */}
                {!isPlaying && !isLoading && (
                  <div
                    onClick={handlePlayClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] cursor-pointer z-10"
                  >
                    <button
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0b0b0f] hover:bg-[#2b4eff] text-white shadow-2xl ring-4 ring-white/25 transition-all hover:scale-110 cursor-pointer"
                      aria-label="تشغيل البث"
                    >
                      <IconPlay className="h-8 w-8 mr-1" />
                    </button>
                  </div>
                )}

                {/* زر تشغيل الصوت */}
                {isPlaying && isMuted && (
                  <button
                    onClick={handleUnmute}
                    className="absolute top-4 end-4 z-20 bg-[#d8ff3e] hover:bg-white text-black font-black text-xs px-3.5 py-1.5 rounded-full shadow-xl transition-all animate-pulse-soft cursor-pointer"
                  >
                    🔊 اضغط لتشغيل الصوت
                  </button>
                )}

                {/* شارات البث */}
                <div className="absolute top-4 start-4 flex items-center gap-2 pointer-events-none z-10">
                  <span className="bg-[#ff5c4d] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> مباشر 1080p
                  </span>
                  <span className="glass-dark text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {selectedChannel.cat}
                  </span>
                  {bufferSec > 0 && (
                    <span className="bg-[#0b0b0f]/80 text-[#3effe0] text-[10.5px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-md border border-[#3effe0]/30">
                      ⚡ بافر: {bufferSec}s
                    </span>
                  )}
                </div>

                {/* شريط معلومات القناة */}
                <div className="absolute bottom-14 start-4 end-4 pointer-events-none z-10 flex items-center justify-between">
                  <div className="glass-dark border border-white/15 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                    <span className="text-xl">{selectedChannel.logo}</span>
                    <div className="text-right">
                      <span className="text-[13.5px] font-black text-white block leading-tight">
                        {selectedChannel.name}
                      </span>
                      <span className="text-[10.5px] text-[#3effe0] font-bold block">
                        ✓ سريعة التحميل • سيرفر HLS مباشر
                      </span>
                    </div>
                  </div>
                  <div className="glass-dark border border-white/15 px-3 py-1.5 rounded-xl text-[11px] font-black text-[#d8ff3e] hidden sm:block">
                    EdgeNext CDN • 50fps
                  </div>
                </div>
              </div>

              {/* سطر الثقة داخل الكرت */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 py-3.5 border-t border-black/10 bg-white text-[11.5px] font-bold text-black/60">
                <span className="flex items-center gap-1.5">
                  <IconShieldCheck className="w-4 h-4 text-[#16a34a]" /> ضمان كامل
                </span>
                <span className="flex items-center gap-1.5">
                  <IconZap className="w-4 h-4 text-[#ff5c4d]" /> تفعيل خلال 5 دقائق
                </span>
                <span className="flex items-center gap-1.5">
                  <IconClock className="w-4 h-4 text-[#2b4eff]" /> دعم 24/7
                </span>
              </div>
            </div>
            </Reveal>

            {/* شريط VIP الليموني — على طريقة شريط Salient */}
            <Reveal variant="up" delay={150}>
            <div className="rounded-[24px] bg-[#d8ff3e] border border-black/10 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-display font-black text-[16px] sm:text-[18px] tracking-tight flex items-center gap-2.5 text-center sm:text-right">
                <IconTv className="w-5 h-5 shrink-0" />
                شاهد جميع قنوات beIN Sports وSSC وShahid VIP 4K المشفرة
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="#pricing"
                  className="btn-slide slide-royal bg-black text-white font-black px-5 py-2.5 rounded-full text-[13px]"
                >
                  عرض باقات VIP
                </a>
                <button
                  onClick={onOpenTrial}
                  className="border-2 border-black/20 text-black font-black px-4 py-2 rounded-full text-[12.5px] hover:border-black transition cursor-pointer"
                >
                  تجربة مجانية
                </button>
              </div>
            </div>
            </Reveal>
          </div>

          {/* الشريط الجانبي — قائمة القنوات */}
          <Reveal variant="end" delay={200} threshold={0.1} className="lg:col-span-4">
          <div className="rounded-[24px] bg-white border border-black/10 overflow-hidden shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] flex flex-col h-[560px]">
            {/* الرأس والبحث */}
            <div className="p-4 border-b border-black/10 space-y-3 bg-[#faf9f6]">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-black flex items-center gap-2">
                  <IconTv className="w-4 h-4 text-[#2b4eff]" /> قائمة القنوات
                  <span className="text-black/40 font-latin">({filteredChannels.length})</span>
                </h3>
                <span className="text-[11px] font-black bg-[#d8ff3e] text-black px-2 py-0.5 rounded-full">
                  سريعة ⚡
                </span>
              </div>

              <div className="relative">
                <IconSearch className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-black/35" />
                <input
                  type="text"
                  placeholder="ابحث عن قناة (مثال: MBC Masr، دراما، 1)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-white border border-black/10 ps-10 pe-3 py-2.5 text-[13px] font-medium placeholder:text-black/35 focus:border-[#2b4eff] focus:outline-none transition"
                />
              </div>

              {/* تصنيفات على شكل حبوب */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#0b0b0f] text-white font-black"
                        : "bg-white text-black/50 border border-black/10 hover:border-black hover:text-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* القنوات */}
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
              {filteredChannels.length === 0 ? (
                <div className="p-8 text-center text-black/40 text-[13px] font-bold">
                  لا توجد قنوات مطابقة لبحثك.
                </div>
              ) : (
                filteredChannels.map((ch, idx) => {
                  const isActive = selectedChannel.name === ch.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedChannel(ch);
                        setIsPlaying(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-right transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#2b4eff]/10 border border-[#2b4eff]/40"
                          : "border border-transparent hover:bg-black/[0.04]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg border ${
                          isActive ? "bg-[#0b0b0f] border-[#0b0b0f]" : "bg-[#f4f3ef] border-black/10"
                        }`}
                      >
                        {ch.logo}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[13px] font-bold block truncate ${
                            isActive ? "text-[#2b4eff] font-black" : "text-black/80"
                          }`}
                        >
                          {ch.name}
                        </span>
                        <span className="text-[11px] text-black/40 block mt-0.5">{ch.cat}</span>
                      </div>
                      <span
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                          isActive ? "bg-[#ff5c4d] animate-pulse-soft" : "bg-[#3effe0]"
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>
          </Reveal>
        </div>

        {/* ملاحظة أسفل المشغل */}
        <p className="mt-6 text-center text-[12px] text-black/40 font-medium">
          <IconCheck className="w-3.5 h-3.5 inline-block text-[#16a34a] mr-1" />
          القنوات أعلاه مجانية للتجربة — قنوات beIN وSSC المشفرة متاحة داخل الباقات المدفوعة
          بسيرفرات نوفا والترا.
        </p>
      </div>
    </section>
  );
}
