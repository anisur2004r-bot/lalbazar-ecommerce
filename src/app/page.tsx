"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Category, Settings, Banner } from "@/lib/types";

import { HomeView } from "@/components/views/HomeView";
import { ShopView } from "@/components/views/ShopView";
import { ProductDetailView } from "@/components/views/ProductDetailView";
import { CartView } from "@/components/views/CartView";
import { CheckoutView } from "@/components/views/CheckoutView";
import { OrderConfirmationView } from "@/components/views/OrderConfirmationView";
import { OrderTrackingView } from "@/components/views/OrderTrackingView";
import { WishlistView } from "@/components/views/WishlistView";
import { LoginView } from "@/components/views/LoginView";
import { RegisterView } from "@/components/views/RegisterView";
import { ForgotPasswordView } from "@/components/views/ForgotPasswordView";
import { AccountView } from "@/components/views/AccountView";
import { AboutView } from "@/components/views/info/AboutView";
import { ContactView } from "@/components/views/info/ContactView";
import { PrivacyView } from "@/components/views/info/PrivacyView";
import { TermsView } from "@/components/views/info/TermsView";
import { ReturnsView } from "@/components/views/info/ReturnsView";
import { ShippingView } from "@/components/views/info/ShippingView";
import { FAQView } from "@/components/views/info/FAQView";
import { AdminView } from "@/components/views/admin/AdminView";
import { SearchView } from "@/components/views/SearchView";

export default function Home() {
  const view = useStore((s) => s.view);
  const params = useStore((s) => s.params);
  const setUser = useStore((s) => s.setUser);

  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, setRes, banRes, meRes] = await Promise.all([
          fetch("/api/categories"), fetch("/api/settings"), fetch("/api/banners"), fetch("/api/auth/me"),
        ]);
        const catData = await catRes.json();
        const setData = await setRes.json();
        const banData = await banRes.json();
        const meData = await meRes.json();
        setCategories(catData.categories || []);
        setSettings(setData.settings || null);
        setBanners(banData.banners || []);
        if (meData.user) setUser(meData.user);
      } catch (e) {
        console.error("Bootstrap error:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [setUser]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-zinc-500">Loading LalBazar…</div>
        </div>
      </div>
    );
  }

  const isAdminView = view === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {!isAdminView && <Header categories={categories} />}
      <main className={`flex-1 ${isAdminView ? "" : "pb-16 lg:pb-0"}`}>
        {view === "home" && <HomeView categories={categories} banners={banners} settings={settings} />}
        {view === "shop" && <ShopView categories={categories} params={params} />}
        {view === "product" && <ProductDetailView slug={params.slug} categories={categories} />}
        {view === "cart" && <CartView settings={settings} />}
        {view === "checkout" && <CheckoutView settings={settings} />}
        {view === "order-confirmation" && <OrderConfirmationView orderId={params.orderId} />}
        {view === "order-tracking" && <OrderTrackingView />}
        {view === "wishlist" && <WishlistView />}
        {view === "search" && <SearchView query={params.q} categories={categories} />}
        {view === "login" && <LoginView />}
        {view === "register" && <RegisterView />}
        {view === "forgot-password" && <ForgotPasswordView />}
        {view === "account" && <AccountView />}
        {view === "about" && <AboutView settings={settings} />}
        {view === "contact" && <ContactView settings={settings} />}
        {view === "privacy" && <PrivacyView />}
        {view === "terms" && <TermsView />}
        {view === "returns" && <ReturnsView />}
        {view === "shipping" && <ShippingView settings={settings} />}
        {view === "faq" && <FAQView />}
        {view === "admin" && <AdminView />}
        {view === "special-offers" && <ShopView categories={categories} params={{ specialOffer: "true", title: "Special Offers" }} preset />}
        {view === "best-sellers" && <ShopView categories={categories} params={{ bestSeller: "true", title: "Best Selling Products" }} preset />}
        {view === "featured" && <ShopView categories={categories} params={{ featured: "true", title: "Featured Products" }} preset />}
        {view === "new-arrivals" && <ShopView categories={categories} params={{ newArrival: "true", title: "New Arrivals" }} preset />}
      </main>
      {!isAdminView && <Footer settings={settings} />}
      {!isAdminView && <MobileBottomNav />}
    </div>
  );
}
