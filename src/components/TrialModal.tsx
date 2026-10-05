import { useState } from "react";
import { IconChat, IconClose, IconZap } from "./Icons";
import { getWhatsAppUrl } from "../data";

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialModal({ isOpen, onClose }: TrialModalProps) {
  const [device, setDevice] = useState("شاشة سامسونج / LG");
  const [server, setServer] = useState("سيرفر نوفا (Nova)");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `مرحبًا ستريم ماستر، أود طلب كود تجربة مجانية:\n- نوع الجهاز: ${device}\n- السيرفر المطلوب: ${server}\n- رقم الواتساب: ${phone || "نفس الرقم الحالي"}`;
    window.open(getWhatsAppUrl(msg), "_blank");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0b0f]/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] rounded-[28px] bg-white border border-black/10 p-6 sm:p-8 shadow-2xl text-right animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-5 start-5 text-black/40 hover:text-black p-1.5 rounded-full bg-[#f4f3ef] hover:bg-[#d8ff3e] transition"
          aria-label="إغلاق"
        >
          <IconClose className="w-4.5 h-4.5" />
        </button>

        {/* الرأس */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#d8ff3e] text-black shadow-lg mb-3">
            <IconZap className="w-6 h-6" />
          </span>
          <h3 className="font-display font-black text-[22px] tracking-tight">
            طلب تجربة مجانية لمدة 6 ساعات
          </h3>
          <p className="text-[13.5px] text-black/55 mt-1.5 font-medium">
            جرب جميع القنوات الرياضية والترفيهية فوراً على جهازك قبل دفع أي مبلغ.
          </p>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div>
            <label className="block text-[13px] font-black text-black/70 mb-1.5">
              نوع جهازك:
            </label>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-3.5 py-3 text-[14px] font-bold focus:border-[#2b4eff] focus:outline-none focus:bg-white transition cursor-pointer"
            >
              <option value="شاشة سامسونج أو LG Smart TV">شاشة سامسونج أو LG Smart TV</option>
              <option value="جهاز Android Box / Firestick">جهاز Android Box / Firestick</option>
              <option value="Apple TV / iPhone / iPad">Apple TV / iPhone / iPad</option>
              <option value="كمبيوتر ولابتوب (Windows/Mac)">كمبيوتر ولابتوب (Windows/Mac)</option>
              <option value="جوال أندرويد">جوال أندرويد</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-black text-black/70 mb-1.5">
              السيرفر المراد تجربته:
            </label>
            <select
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-3.5 py-3 text-[14px] font-bold focus:border-[#2b4eff] focus:outline-none focus:bg-white transition cursor-pointer"
            >
              <option value="سيرفر نوفا (Nova Server) — الأفضل للمباريات">
                سيرفر نوفا (Nova) — الأفضل للمباريات ⚽
              </option>
              <option value="ماستر الترا (Master Ultra 4K) — باقة الـ VIP">
                ماستر الترا (Ultra 4K) — باقة الـ VIP 👑
              </option>
              <option value="سيرفر إيستار (iStar Pro) — الترفيه والأفلام">
                سيرفر إيستار (iStar) — الترفيه والأفلام 🎬
              </option>
              <option value="سيرفر موكا (Moka) — الاقتصادي للنت الضعيف">
                سيرفر موكا (Moka) — الاقتصادي ⚡
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-black text-black/70 mb-1.5">
              رقم الواتساب لإرسال الكود:
            </label>
            <input
              type="tel"
              placeholder="مثال: 05xxxxxxxx أو 010xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-3.5 py-3 text-[14px] font-bold placeholder:text-black/30 focus:border-[#2b4eff] focus:outline-none focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#0b0b0f] hover:bg-[#2b4eff] text-white font-black text-[15px] shadow-lg flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
          >
            <IconChat className="w-5 h-5 text-[#d8ff3e]" /> إرسال طلب التجربة فوراً عبر واتساب
          </button>
        </form>

        <p className="text-[11.5px] text-black/40 text-center mt-4 font-medium">
          يتم إرسال كود التجربة وشرح التشغيل خلال أقل من 5 دقائق عبر واتساب.
        </p>
      </div>
    </div>
  );
}
