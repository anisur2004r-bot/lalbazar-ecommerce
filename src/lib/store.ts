'use client';

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionUser, CartLine, Product } from "@/lib/types";

export type ViewName =
  | "home" | "shop" | "product" | "cart" | "checkout" | "order-confirmation" | "order-tracking"
  | "wishlist" | "compare" | "login" | "register" | "forgot-password"
  | "account" | "about" | "contact" | "privacy" | "terms" | "returns" | "shipping" | "faq"
  | "admin" | "special-offers" | "best-sellers" | "featured" | "new-arrivals" | "search";

export interface ViewState {
  view: ViewName;
  params: Record<string, any>;
  navigate: (view: ViewName, params?: Record<string, any>) => void;
  back: () => void;
  cartItems: CartLine[];
  addToCart: (product: Product, quantity?: number, unit?: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  couponCode: string | null;
  setCoupon: (code: string | null) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareList: string[];
  toggleCompare: (productId: string) => void;
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  history: { view: ViewName; params: Record<string, any> }[];
}

export const useStore = create<ViewState>()(
  persist(
    (set, get) => ({
      view: "home",
      params: {},
      history: [],
      navigate: (view, params = {}) => {
        set((state) => ({ view, params, history: [...state.history.slice(-20), { view: state.view, params: state.params }], mobileMenuOpen: false }));
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      back: () => {
        const history = get().history;
        if (history.length > 0) {
          const last = history[history.length - 1];
          set((state) => ({ view: last.view, params: last.params, history: state.history.slice(0, -1), mobileMenuOpen: false }));
          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        } else { set({ view: "home", params: {}, mobileMenuOpen: false }); }
      },
      cartItems: [],
      addToCart: (product, quantity = 1, unit) => {
        set((state) => {
          const existing = state.cartItems.find((i) => i.productId === product.id);
          if (existing) return { cartItems: state.cartItems.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i) };
          const price = product.salePrice ?? product.regularPrice;
          const newLine: CartLine = { productId: product.id, name: product.name, slug: product.slug, image: product.images[0], price, regularPrice: product.regularPrice, quantity, unit: unit || product.unit || undefined, stock: product.stock };
          return { cartItems: [...state.cartItems, newLine] };
        });
      },
      updateCartQty: (productId, quantity) => {
        if (quantity <= 0) { get().removeFromCart(productId); return; }
        set((state) => ({ cartItems: state.cartItems.map((i) => i.productId === productId ? { ...i, quantity } : i) }));
      },
      removeFromCart: (productId) => { set((state) => ({ cartItems: state.cartItems.filter((i) => i.productId !== productId) })); },
      clearCart: () => set({ cartItems: [], couponCode: null }),
      couponCode: null,
      setCoupon: (code) => set({ couponCode: code }),
      wishlist: [],
      toggleWishlist: (productId) => { set((state) => ({ wishlist: state.wishlist.includes(productId) ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId] })); },
      compareList: [],
      toggleCompare: (productId) => {
        set((state) => {
          if (state.compareList.includes(productId)) return { compareList: state.compareList.filter((id) => id !== productId) };
          if (state.compareList.length >= 4) return state;
          return { compareList: [...state.compareList, productId] };
        });
      },
      user: null,
      setUser: (user) => set({ user }),
      recentlyViewed: [],
      addRecentlyViewed: (productId) => { set((state) => ({ recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 10) })); },
      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    { name: "lalbazar-store", storage: createJSONStorage(() => localStorage), partialize: (state) => ({ cartItems: state.cartItems, wishlist: state.wishlist, compareList: state.compareList, user: state.user, recentlyViewed: state.recentlyViewed, couponCode: state.couponCode }) }
  )
);

export function useCartTotals() {
  const items = useStore((s) => s.cartItems);
  const couponCode = useStore((s) => s.couponCode);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const freeThreshold = 2000;
  const deliveryCharge = subtotal >= freeThreshold || subtotal === 0 ? 0 : 60;
  const discount = 0;
  const total = Math.max(0, subtotal - discount) + deliveryCharge;
  return { subtotal, itemCount, deliveryCharge, discount, total, freeThreshold, couponCode };
}
