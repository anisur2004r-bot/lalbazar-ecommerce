"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Product, Category, Banner, Settings } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { formatBDT } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ChevronRight, Truck, ShieldCheck, Headphones, CreditCard, Flame, Star, Clock, Tag } from "lucide-react";

interface HomeViewProps {
  categories: Category[];
  banners: Banner[];
  settings: Settings | null;
}

export function HomeView({ categories, banners, settings }: HomeViewProps) {
  const navigate = useStore((s) => s.navigate);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [countdown, setCountdown] = useState({ h: 12, m: 34, s: 56 });

  useEffect(() => {
    Promise.all([
      fetch("/api/products?featured=true&limit=10").then((r) => r.json()),
      fetch("/api/products?bestSeller=true&limit=10").then((r) => r.json()),
      fetch("/api/products?newArrival=true&limit=10").then((r) => r.json()),
      fetch("/api/products?specialOffer=true&limit=10").then((r) => r.json()),
    ]).then(([f, b, n, s]) => {
      setFeatured(f.products || []);
      setBestSellers(b.products || []);
      setNewArrivals(n.products || []);
      setSpecialOffers(s.products || []);
    });
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        let { h, m, s } = c;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const featuredCats = categories.filter((c) => c.featured);
  const heroBanner = banners[heroIdx];

  return (
    <div className="bg-zinc-50">
      <div className="bg-primary text-white overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-1.5 text-xs font-medium">
          {Array(4).fill(0).map((_, i) => (
            <span key={i} className="mx-6 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Use code <strong>WELCOME10</strong> for 10% off your first order
              <span className="mx-3">•</span>
              Free delivery on orders over ৳2000
              <span className="mx-3">•</span>
              COD available nationwide
              <span className="mx-3">•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_220px] gap-4">
          <aside className="hidden lg:block bg-white rounded-xl border border-zinc-200 overflow-hidden h-fit sticky top-32">
            <div className="bg-zinc-900 text-white px-4 py-3 font-semibold text-sm flex items-center gap-2">📂 All Categories</div>
            <ul className="max-h-[480px] overflow-y-auto">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button onClick={() => navigate("shop", { category: cat.slug })} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition border-b border-zinc-100">
                    <span className="text-base">{cat.icon}</span>
                    <span className="flex-1 truncate">{cat.name}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="relative">
            {heroBanner && (
              <div className="relative rounded-xl overflow-hidden bg-zinc-200 aspect-[16/7] sm:aspect-[16/6] lg:aspect-[2/1]">
                <img src={heroBanner.image} alt={heroBanner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center p-6 sm:p-10">
                  <div className="max-w-md text-white">
                    <h2 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight">{heroBanner.title}</h2>
                    {heroBanner.subtitle && <p className="text-sm sm:text-lg mb-4 opacity-90">{heroBanner.subtitle}</p>}
                    {heroBanner.buttonText && (
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => {
                        if (heroBanner.link) {
                          const [v, q] = heroBanner.link.split("?");
                          const params: Record<string, string> = {};
                          if (q) q.split("&").forEach((p) => { const [k, val] = p.split("="); params[k] = val; });
                          navigate((v as any) || "shop", params);
                        } else { navigate("shop"); }
                      }}>{heroBanner.buttonText}</Button>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => setHeroIdx(i)} className={`h-1.5 rounded-full transition-all ${i === heroIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                  ))}
                </div>
              </div>
            )}

            <div className="hidden sm:grid grid-cols-4 gap-3 mt-4">
              {[
                { icon: Truck, title: "Fast Delivery", desc: "Same day in Dhaka" },
                { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected" },
                { icon: Headphones, title: "24/7 Support", desc: "Always here" },
                { icon: CreditCard, title: "COD Available", desc: "Pay on delivery" },
              ].map((b, i) => (
                <div key={i} className="bg-white rounded-lg border border-zinc-200 p-3 flex items-center gap-2">
                  <b.icon className="w-5 h-5 text-primary" />
                  <div><div className="text-xs font-semibold text-zinc-900">{b.title}</div><div className="text-[10px] text-zinc-500">{b.desc}</div></div>
                </div>
              ))}
            </div>
          </section>

          <aside className="hidden lg:flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary to-rose-700 text-white rounded-xl p-4">
              <div className="text-xs uppercase opacity-80 mb-1">Flash Sale</div>
              <div className="text-2xl font-bold mb-2">Up to 40% OFF</div>
              <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate("special-offers")}>Shop Now</Button>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">Hot Deal Today</div>
              {specialOffers[0] && (
                <>
                  <div className="text-sm font-semibold line-clamp-2 mb-2">{specialOffers[0].name}</div>
                  <div className="text-xl font-bold text-primary">{formatBDT(specialOffers[0].salePrice ?? specialOffers[0].regularPrice)}</div>
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => navigate("product", { slug: specialOffers[0].slug })}>View</Button>
                </>
              )}
            </div>
            <div className="bg-zinc-900 text-white rounded-xl p-4 text-center">
              <div className="text-xs uppercase mb-1 opacity-80">Download App</div>
              <div className="text-sm font-semibold mb-2">Get exclusive deals</div>
              <div className="text-[10px] opacity-70">Coming soon to iOS & Android</div>
            </div>
          </aside>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Shop by Category</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("shop")} className="text-primary">View All <ChevronRight className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-3">
            {featuredCats.map((cat) => (
              <button key={cat.id} onClick={() => navigate("shop", { category: cat.slug })} className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 flex flex-col items-center gap-2 hover:border-primary hover:shadow-md transition group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl sm:text-3xl group-hover:bg-primary/20 transition">{cat.icon}</div>
                <div className="text-[10px] sm:text-xs font-medium text-center text-zinc-700 leading-tight line-clamp-2">{cat.name}</div>
              </button>
            ))}
          </div>
        </section>

        {specialOffers.length > 0 && (
          <section className="mt-8 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-primary" />
                <div><h2 className="text-xl font-bold text-zinc-900">Flash Sale</h2><div className="text-xs text-zinc-500">Limited time offers - Hurry up!</div></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">Ends in:</span>
                {[{ v: countdown.h, l: "Hrs" }, { v: countdown.m, l: "Min" }, { v: countdown.s, l: "Sec" }].map((t, i) => (
                  <div key={i} className="bg-zinc-900 text-white rounded px-2 py-1 text-center min-w-[42px]"><div className="text-sm font-bold tabular-nums">{String(t.v).padStart(2, "0")}</div><div className="text-[9px] opacity-70">{t.l}</div></div>
                ))}
              </div>
            </div>
            <ProductGrid products={specialOffers.slice(0, 5)} cols={5} />
          </section>
        )}

        {bestSellers.length > 0 && (<Section title="Best Selling Products" subtitle="Top picks loved by our customers" icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />} onMore={() => navigate("best-sellers")}><ProductGrid products={bestSellers.slice(0, 10)} cols={5} /></Section>)}
        {featured.length > 0 && (<Section title="Featured Products" subtitle="Hand-picked just for you" icon={<span className="text-lg">⭐</span>} onMore={() => navigate("featured")}><ProductGrid products={featured.slice(0, 10)} cols={5} /></Section>)}
        {newArrivals.length > 0 && (<Section title="New Arrivals" subtitle="Fresh stock just landed" icon={<Clock className="w-5 h-5 text-emerald-600" />} onMore={() => navigate("new-arrivals")}><ProductGrid products={newArrivals.slice(0, 10)} cols={5} /></Section>)}

        <section className="mt-8 rounded-xl overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-primary mb-2">LalBazar Premium</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Get ৳100 off on orders above ৳1000</h3>
            <p className="text-sm text-zinc-300 mb-3">Use code <span className="font-mono bg-white/10 px-2 py-0.5 rounded">MEGA100</span> at checkout. Valid for limited time.</p>
            <Button onClick={() => navigate("shop")} className="bg-primary hover:bg-primary/90">Shop Now</Button>
          </div>
          <div className="text-6xl sm:text-8xl">🎁</div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 mb-4">Browse All Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-zinc-200 p-4">
                <button onClick={() => navigate("shop", { category: cat.slug })} className="flex items-center gap-2 mb-3 hover:text-primary transition">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="text-left"><div className="font-semibold text-sm">{cat.name}</div>{cat.nameBn && <div className="text-xs text-zinc-500 font-bengali">{cat.nameBn}</div>}</div>
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {cat.children?.slice(0, 5).map((sub) => (
                    <button key={sub.id} onClick={() => navigate("shop", { category: cat.slug, subcategory: sub.slug })} className="text-[11px] px-2 py-1 rounded bg-zinc-100 hover:bg-primary/10 hover:text-primary transition">{sub.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, icon, onMore, children }: { title: string; subtitle?: string; icon?: React.ReactNode; onMore: () => void; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-2">{icon}<div><h2 className="text-lg sm:text-xl font-bold text-zinc-900">{title}</h2>{subtitle && <div className="text-xs text-zinc-500">{subtitle}</div>}</div></div>
        <Button variant="ghost" size="sm" onClick={onMore} className="text-primary">View All <ChevronRight className="w-4 h-4" /></Button>
      </div>
      {children}
    </section>
  );
}
