import { IconCart, IconChat, IconClose } from "./Icons";
import { CURRENCIES, getWhatsAppUrl, PricingPlan } from "../data";

export interface CartItem {
  id: string;
  plan: PricingPlan;
  months: "3" | "6" | "12" | "24";
  price: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  currentCurrency: string;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearCart,
  currentCurrency,
}: CartModalProps) {
  if (!isOpen) return null;

  const curr = CURRENCIES[currentCurrency] || CURRENCIES.SAR;
  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);

  const durationLabels: Record<"3" | "6" | "12" | "24", string> = {
    "3": "3 شهور",
    "6": "6 شهور",
    "12": "سنة (12 شهر)",
    "24": "سنتين (24 شهر)",
  };

  const handleCheckout = () => {
    const itemsListText = items
      .map(
        (item, i) =>
          `${i + 1}. ${item.plan.serverName} — المدة: ${durationLabels[item.months]} — السعر: ${item.price} ${curr.symbol}`
      )
      .join("\n");

    const message = `مرحبًا ستريم ماستر، أود إتمام طلب الاشتراكات التالية:\n\n${itemsListText}\n\nالإجمالي المطلوب: ${totalPrice} ${curr.symbol}\nأرجو تزويدي ببيانات الدفع والتفعيل الفوري.`;

    window.open(getWhatsAppUrl(message), "_blank");
    onClearCart();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-[#0b0b0f]/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-[440px] bg-[#faf9f6] border-s border-black/10 p-6 shadow-2xl flex flex-col justify-between text-right overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* الرأس */}
          <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <IconCart className="w-5 h-5" />
              <h3 className="font-display font-black text-[18px]">سلة المشتريات</h3>
              <span className="bg-[#d8ff3e] text-black text-xs font-black px-2 py-0.5 rounded-full">
                {items.length} عناصر
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-black/40 hover:text-black p-1.5 rounded-lg bg-black/[0.05] hover:bg-[#d8ff3e] transition cursor-pointer"
              aria-label="إغلاق"
            >
              <IconClose className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* العناصر */}
          {items.length === 0 ? (
            <div className="text-center py-16 text-black/40">
              <IconCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-[15px] font-black text-black/60">السلة فارغة حالياً</p>
              <p className="text-[13px] mt-1 text-black/40 font-medium">
                اختر أحد السيرفرات والباقات وأضفها للسلة.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-black/10 flex items-center justify-between gap-3 hover:border-black/30 transition"
                >
                  <div>
                    <h4 className="text-[14px] font-black">{item.plan.serverName}</h4>
                    <span className="text-[12px] text-black/50 block mt-0.5 font-medium">
                      المدة: {durationLabels[item.months]}
                    </span>
                    <span className="text-[16px] font-black text-[#2b4eff] mt-1 block font-display">
                      {item.price} {curr.symbol}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-black/40 hover:text-[#ff5c4d] p-2 rounded-lg hover:bg-[#ff5c4d]/10 transition-colors text-xs font-black cursor-pointer"
                  >
                    حذف ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* إتمام الطلب */}
        {items.length > 0 && (
          <div className="pt-6 border-t border-black/10 space-y-4">
            <div className="flex items-center justify-between text-[15px] font-black">
              <span>المجموع الكلي:</span>
              <span className="text-[22px] text-[#0b0b0f] font-display">
                {totalPrice} {curr.symbol}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-[15px] shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <IconChat className="w-5 h-5" /> إتمام الطلب وتأكيد الدفع عبر واتساب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
