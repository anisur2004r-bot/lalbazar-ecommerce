"use client";

import { useState, useRef } from "react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { Search, ShoppingCart, Heart, User, Menu, ChevronDown, Phone, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Category } from "@/lib/types";

export function Header({ categories }: { categories: Category[] }) {
  const navigate = useStore((s) => s.navigate);
  const cartCount = useStore((s) => s.cartItems.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useStore((s) => s.wishlist.length);
  const user = useStore((s) => s.user);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);

  const [searchInput, setSearchInput] = useState("");
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      navigate("search", { q: searchInput.trim() });
    }
  };

  const featuredCats = categories.filter((c) => c.featured).slice(0, 8);
  const allCats = categories;

  return (
    <>
      <div className="bg-zinc-900 text-white text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between h-9 max-w-7xl">
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1"><Phone className="w-3 h-3" /> +8809613-000000</span>
            <span className="hidden md:flex items-center gap-1"><Truck className="w-3 h-3" /> Free delivery on orders over ৳2000</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("order-tracking")} className="hover:text-primary-foreground/80 transition flex items-center gap-1"><Package className="w-3 h-3" /> Track Order</button>
            {user ? (<button onClick={() => navigate(user.role === "ADMIN" ? "admin" : "account")} className="hover:text-primary-foreground/80 transition">{user.role === "ADMIN" ? "Admin Panel" : "My Account"}</button>) : (<button onClick={() => navigate("login")} className="hover:text-primary-foreground/80 transition">Login / Register</button>)}
          </div>
        </div>
      </div>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-3 sm:gap-6 h-16">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden -ml-2"><Menu className="w-5 h-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[360px] p-0 overflow-y-auto">
                <SheetHeader className="px-4 py-4 border-b"><SheetTitle className="flex items-center justify-between"><Logo size="sm" /></SheetTitle></SheetHeader>
                <div className="p-4 space-y-1">
                  <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => navigate("home")}>Home</Button>
                  <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => navigate("shop")}>All Products</Button>
                  <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => navigate("special-offers")}>Special Offers</Button>
                  <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => navigate("best-sellers")}>Best Sellers</Button>
                  <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => navigate("new-arrivals")}>New Arrivals</Button>
                  <div className="pt-3 mt-3 border-t">
                    <div className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">Categories</div>
                    {allCats.map((cat) => (<div key={cat.id}><Button variant="ghost" className="w-full justify-start text-sm" onClick={() => navigate("shop", { category: cat.slug })}><span className="mr-2">{cat.icon}</span>{cat.name}</Button>{cat.children && cat.children.length > 0 && (<div className="pl-8 mb-1">{cat.children.slice(0, 5).map((sub) => (<Button key={sub.id} variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={() => navigate("shop", { category: cat.slug, subcategory: sub.slug })}>{sub.name}</Button>))}</div>)}</div>))}
                  </div>
                  <div className="pt-3 mt-3 border-t"><Button variant="ghost" className="w-full justify-start" onClick={() => navigate("about")}>About Us</Button><Button variant="ghost" className="w-full justify-start" onClick={() => navigate("contact")}>Contact Us</Button><Button variant="ghost" className="w-full justify-start" onClick={() => navigate("faq")}>FAQ</Button></div>
                </div>
              </SheetContent>
            </Sheet>
            <button onClick={() => navigate("home")} className="shrink-0"><Logo size="md" /></button>
            <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-2xl relative">
              <Input ref={searchRef} type="search" placeholder="Search for products, brands and categories..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full h-11 rounded-full border-2 border-primary/20 focus-visible:border-primary focus-visible:ring-primary pl-4 pr-32" />
              <Button type="submit" className="absolute right-1 top-1 bottom-1 rounded-full px-5"><Search className="w-4 h-4 mr-1" /> Search</Button>
            </form>
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              <Button variant="ghost" size="sm" className="hidden sm:flex flex-col items-center gap-0.5 h-auto py-1.5 px-3 relative" onClick={() => navigate("wishlist")}><div className="relative"><Heart className="w-5 h-5" />{wishlistCount > 0 && (<Badge className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white">{wishlistCount}</Badge>)}</div><span className="text-[10px] font-medium">Wishlist</span></Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-3 relative" onClick={() => navigate("cart")}><div className="relative"><ShoppingCart className="w-5 h-5" />{cartCount > 0 && (<Badge className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white animate-badge-pulse">{cartCount}</Badge>)}</div><span className="text-[10px] font-medium">Cart</span></Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex flex-col items-center gap-0.5 h-auto py-1.5 px-3" onClick={() => user ? navigate(user.role === "ADMIN" ? "admin" : "account") : navigate("login")}><User className="w-5 h-5" /><span className="text-[10px] font-medium">{user ? "Account" : "Login"}</span></Button>
            </div>
          </div>
          <div className="md:hidden pb-3"><form onSubmit={submitSearch} className="relative"><Input type="search" placeholder="Search products..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full h-10 rounded-full border-2 border-primary/20 focus-visible:border-primary pl-4 pr-12" /><Button type="submit" size="icon" className="absolute right-1 top-1 bottom-1 rounded-full h-8 w-8"><Search className="w-4 h-4" /></Button></form></div>
        </div>
        <nav className="hidden lg:block border-t border-zinc-100 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <ul className="flex items-center gap-1 h-11">
              <li><button onClick={() => navigate("shop")} className="flex items-center gap-1.5 px-4 h-11 text-sm font-semibold hover:text-primary transition"><Menu className="w-4 h-4" /> All Categories</button></li>
              {featuredCats.map((cat) => (<li key={cat.id} className="relative" onMouseEnter={() => setMegaOpen(cat.id)} onMouseLeave={() => setMegaOpen(null)}><button onClick={() => navigate("shop", { category: cat.slug })} className="flex items-center gap-1 px-3 h-11 text-sm font-medium hover:text-primary transition"><span>{cat.icon}</span>{cat.name}{cat.children && cat.children.length > 0 && <ChevronDown className="w-3 h-3" />}</button>{cat.children && cat.children.length > 0 && megaOpen === cat.id && (<div className="absolute left-0 top-11 z-50 bg-white border border-zinc-200 shadow-xl rounded-lg py-3 min-w-[220px]">{cat.children.map((sub) => (<button key={sub.id} onClick={() => { navigate("shop", { category: cat.slug, subcategory: sub.slug }); setMegaOpen(null); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition">{sub.name}</button>))}<div className="border-t mt-2 pt-2 px-4"><button onClick={() => { navigate("shop", { category: cat.slug }); setMegaOpen(null); }} className="text-xs font-semibold text-primary hover:underline">View all in {cat.name} →</button></div></div>)}</li>))}
              <li className="ml-auto"><button onClick={() => navigate("special-offers")} className="flex items-center gap-1 px-3 h-11 text-sm font-semibold text-primary hover:text-primary/80 transition">🔥 Special Offers</button></li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
