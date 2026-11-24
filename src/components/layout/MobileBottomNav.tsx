"use client";

import { useStore } from "@/lib/store";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";

export function MobileBottomNav() {
  const navigate = useStore((s) => s.navigate);
  const view = useStore((s) => s.view);
  const cartCount = useStore((s) => s.cartItems.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useStore((s) => s.wishlist.length);
  const user = useStore((s) => s.user);

  const items = [
    { id: "home", icon: Home, label: "Home" },
    { id: "shop", icon: Search, label: "Shop" },
    { id: "cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { id: "wishlist", icon: Heart, label: "Saved", badge: wishlistCount },
    { id: user?.role === "ADMIN" ? "admin" : "account", icon: User, label: user ? "Account" : "Login" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 grid grid-cols-5 h-14 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id as any)}
            className={`flex flex-col items-center justify-center gap-0.5 relative ${active ? "text-primary" : "text-zinc-600"}`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
              {item.badge ? (
                <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 flex items-center justify-center text-[9px] font-bold bg-primary text-white rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
