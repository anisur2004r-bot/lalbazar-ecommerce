"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Product, Category } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, ArrowRight, PackageSearch, SlidersHorizontal } from "lucide-react";

interface SearchViewProps {
  query?: string;
  categories?: Category[];
}

export function SearchView({ query, categories = [] }: SearchViewProps) {
  const navigate = useStore((s) => s.navigate);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const [input, setInput] = useState(query || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setInput(query || "");
    let cancelled = false;
    (async () => {
      if (!query || !query.trim()) { setProducts([]); setTotal(0); setLoading(false); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=48`);
        const data = await res.json();
        if (!cancelled) { setProducts(data.products || []); setTotal(data.total || (data.products || []).length); }
      } catch { if (!cancelled) setProducts([]); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [query]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) { setSearchQuery(input.trim()); navigate("search", { q: input.trim() }); }
  };

  const popularCats = categories.filter((c) => c.featured).slice(0, 6);

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 mb-3"><SearchIcon className="w-6 h-6 text-primary" /> Search Results</h1>
        <form onSubmit={submitSearch} className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input type="search" placeholder="Search for products, brands, categories..." value={input} onChange={(e) => setInput(e.target.value)} className="pl-9 pr-24 h-11 rounded-full border-2 border-primary/20 focus-visible:border-primary" />
          <Button type="submit" className="absolute right-1 top-1 bottom-1 rounded-full px-5 h-9"><SearchIcon className="w-4 h-4" /> Search</Button>
        </form>
        {popularCats.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500 flex items-center gap-1"><SlidersHorizontal className="w-3 h-3" /> Popular:</span>
            {popularCats.map((c) => (<button key={c.id} onClick={() => navigate("shop", { category: c.slug })} className="text-xs px-3 py-1 rounded-full bg-zinc-100 hover:bg-primary hover:text-white transition">{c.name}</button>))}
          </div>
        )}
      </div>
      {query && (<div className="mb-4 text-sm text-zinc-600">{loading ? ("Searching…") : (<>Found <strong className="text-zinc-900">{total}</strong> result{total !== 1 ? "s" : ""} for <strong className="text-primary">&quot;{query}&quot;</strong></>)}</div>)}
      {!query && (<Card className="border-dashed border-zinc-300 bg-zinc-50/50"><CardContent className="py-16 flex flex-col items-center text-center"><div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"><SearchIcon className="w-10 h-10 text-primary/60" /></div><h3 className="text-lg font-semibold text-zinc-900 mb-1">Start searching</h3><p className="text-sm text-zinc-500 max-w-sm mb-6">Type in the search box above to find products across groceries, electronics, fashion, home goods and more.</p><Button onClick={() => navigate("shop")} size="lg"><PackageSearch className="w-4 h-4" /> Browse All Products <ArrowRight className="w-4 h-4" /></Button></CardContent></Card>)}
      {query && loading && (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">{Array.from({ length: 10 }).map((_, i) => (<Skeleton key={i} className="aspect-[3/4] rounded-xl" />))}</div>)}
      {query && !loading && products.length === 0 && (<Card className="border-dashed border-zinc-300 bg-zinc-50/50"><CardContent className="py-16 flex flex-col items-center text-center"><div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center mb-4"><PackageSearch className="w-10 h-10 text-zinc-400" /></div><h3 className="text-lg font-semibold text-zinc-900 mb-1">No products found</h3><p className="text-sm text-zinc-500 max-w-sm mb-6">We couldn&apos;t find anything matching &quot;{query}&quot;. Try different keywords or browse our categories.</p><div className="flex flex-wrap gap-2 justify-center"><Button onClick={() => navigate("shop")}><PackageSearch className="w-4 h-4" /> Browse All</Button><Button variant="outline" onClick={() => navigate("special-offers")}>View Special Offers</Button></div></CardContent></Card>)}
      {query && !loading && products.length > 0 && (<ProductGrid products={products} cols={5} />)}
    </div>
  );
}
