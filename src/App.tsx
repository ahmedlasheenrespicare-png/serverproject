import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import FloatingActions from "./components/FloatingActions";
import Footer from "./components/Footer";
import TrialModal from "./components/TrialModal";
import CartModal, { CartItem } from "./components/CartModal";
import { useRouter } from "./router";
import { applySeoToDocument } from "./seo";
import HomePage from "./pages/HomePage";
import ChannelsPage from "./pages/ChannelsPage";
import PlanPage from "./pages/PlanPage";
import BlogIndexPage from "./pages/BlogIndexPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFoundPage from "./pages/NotFoundPage";
import { BLOG_POSTS } from "./content/posts";
import { PRICING_PLANS, PricingPlan } from "./data";
import { ScrollProgress, SmoothScroll } from "./components/motion";

export default function App() {
  const { path } = useRouter();
  const [currency, setCurrency] = useState<string>("SAR");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrialOpen, setIsTrialOpen] = useState(false);
  const [highlightedPlanId, setHighlightedPlanId] = useState<string | undefined>(undefined);

  /* تحديث وسوم الرأس (العنوان والوصف وcanonical) مع كل تنقّل داخل الموقع */
  useEffect(() => {
    applySeoToDocument(path);
  }, [path]);

  /* مرجع ثابت للدوال — يمنع إعادة رسم الأقسام الثقيلة (المشغلات) عند كل تغيير حالة */
  const openTrial = useCallback(() => setIsTrialOpen(true), []);
  const closeTrial = useCallback(() => setIsTrialOpen(false), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const handleAddToCart = useCallback(
    (plan: PricingPlan, months: "3" | "6" | "12" | "24", price: number) => {
      setCartItems((prev) => [
        ...prev,
        { id: `${plan.id}-${months}-${Date.now()}`, plan, months, price, currency },
      ]);
      setIsCartOpen(true);
    },
    [currency]
  );

  const handleRemoveCartItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearCart = useCallback(() => setCartItems([]), []);

  const handleSelectPlanFromFinder = useCallback((planId: string) => {
    setHighlightedPlanId(planId);
    const el = document.getElementById("pricing");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  /* ===== توجيه الصفحات ===== */
  const plan = PRICING_PLANS.find((p) => path === `/${p.serverCode}`);
  const post = BLOG_POSTS.find((p) => path === `/blog/${p.slug}`);

  let page;
  if (path === "/") {
    page = (
      <HomePage
        currency={currency}
        onCurrencyChange={setCurrency}
        onAddToCart={handleAddToCart}
        highlightedPlanId={highlightedPlanId}
        onOpenTrial={openTrial}
        onSelectPlan={handleSelectPlanFromFinder}
      />
    );
  } else if (path === "/channels") {
    page = <ChannelsPage />;
  } else if (path === "/blog") {
    page = <BlogIndexPage />;
  } else if (post) {
    page = <BlogPostPage post={post} />;
  } else if (plan) {
    /* العملة تُمرَّر من هنا (مصدر واحد) — وإلا أضاف المستخدم باقة بسعر عملة
       صفحة الباقة بينما تُسجَّل في السلة بعملة أخرى (خطأ سعري حقيقي). */
    page = (
      <PlanPage
        plan={plan}
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenTrial={openTrial}
        onAddToCart={handleAddToCart}
      />
    );
  } else {
    page = <NotFoundPage />;
  }

  return (
    <div
      className="min-h-screen bg-[#faf9f6] text-[#0b0b0f] flex flex-col font-sans selection:bg-[#0b0b0f] selection:text-[#d8ff3e]"
      dir="rtl"
    >
      <ScrollProgress />
      <SmoothScroll />

      <Header
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        cartCount={cartItems.length}
        onOpenCart={openCart}
        onOpenTrial={openTrial}
      />

      <main className="flex-1">{page}</main>

      <Footer onOpenTrial={openTrial} />
      <FloatingActions onOpenTrial={openTrial} />

      <TrialModal isOpen={isTrialOpen} onClose={closeTrial} />

      <CartModal
        isOpen={isCartOpen}
        onClose={closeCart}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentCurrency={currency}
      />
    </div>
  );
}
