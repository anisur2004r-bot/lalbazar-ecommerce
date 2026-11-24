"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Product, Category } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, ChevronRight, Home } from "lucide-react";
import { formatBDT } from "@/lib/format";

interface ShopViewProps { categories: Category[]; params: Record<string, any>; preset?: boolean; }

export function ShopView({ categories, params, preset }: ShopViewProps) {
  const navigate = useStore((s) => s.navigate);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const category = params.category as string | undefined;
  const subcategory = params.subcategory as string | undefined;
  const search = params.search as string | undefined;
  const titleParam = params.title as string | undefined;

  const activeCategory = useMemo(() => categories.find((c) => c.slug === category), [categories, category]);
  const activeSubcategory = useMemo(() => activeCategory?.children?.find((c) => c.slug === subcategory), [activeCategory, subcategory]);

  const queryStr = useMemo(() => {
    const q = new URLSearchParams();
    q.set("limit", "24"); q.set("page", String(page)); q.set("sort", sort);
    if (category) q.set("category", category);
    if (subcategory) q.set("subcategory", subcategory);
    if (search) q.set("search", search);
    if (params.featured) q.set("featured", "true");
    if (params.bestSeller) q.set("bestSeller", "true");
    if (params.newArrival) q.set("newArrival", "true");
    if (params.specialOffer) q.set("specialOffer", "true");
    if (selectedBrands.length > 0) q.set("brand", selectedBrands[0]);
    if (inStock) q.set("inStock", "true");
    if (priceRange[0] > 0 || priceRange[1] < 50000) { q.set("minPrice", String(priceRange[0])); q.set("maxPrice", String(priceRange[1])); }
    return q.toString();
  }, [page, sort, category, subcategory, search, params, selectedBrands, inStock, priceRange]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?${queryStr}`).then((r) => r.json()).then((d) => {
      setProducts(d.products || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1);
      const bset = new Set<string>(); (d.products || []).forEach((p: Product) => p.brand && bset.add(p.brand));
      if (page === 1) setBrands(Array.from(bset));
    }).finally(() => setLoading(false));
  }, [queryStr]);

  useEffect(() => { setPage(1); }, [category, subcategory, search, params.featured, params.bestSeller, params.newArrival, params.specialOffer]);

  const title = titleParam || activeSubcategory?.name || activeCategory?.name || (search ? `Search: "${search}"` : "All Products");
  const clearFilters = () => { setSelectedBrands([]); setInStock(false); setPriceRange([0, 50000]); setSort("popular"); };

  const renderFilters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-zinc-900">Categories</h3>
        <div className="space-y-1.5">
          <button onClick={() => navigate("shop")} className={`block text-sm w-full text-left py-1 px-2 rounded hover:bg-primary/5 ${!category ? "text-primary font-medium bg-primary/5" : "text-zinc-700"}`}>All Categories</button>
          {categories.map((cat) => (<div key={cat.id}><button onClick={() => navigate("shop", { category: cat.slug })} className={`block text-sm w-full text-left py-1 px-2 rounded hover:bg-primary/5 ${category === cat.slug && !subcategory ? "text-primary font-medium bg-primary/5" : "text-zinc-700"}`}>{cat.icon} {cat.name}</button>{category === cat.slug && cat.children && (<div className="pl-4 mt-1 space-y-0.5">{cat.children.map((sub) => (<button key={sub.id} onClick={() => navigate("shop", { category: cat.slug, subcategory: sub.slug })} className={`block text-xs w-full text-left py-1 px-2 rounded hover:bg-primary/5 ${subcategory === sub.slug ? "text-primary font-medium bg-primary/5" : "text-zinc-600"}`}>{sub.name}</button>))}</div>)}</div>))}
        </div>
      </div>
      <div><h3 className="font-semibold text-sm mb-3 text-zinc-900">Price Range</h3><Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} min={0} max={50000} step={100} className="mb-2" /><div className="flex items-center justify-between text-xs text-zinc-600"><span>{formatBDT(priceRange[0])}</span><span>{formatBDT(priceRange[1])}</span></div></div>
      {brands.length > 0 && (<div><h3 className="font-semibold text-sm mb-3 text-zinc-900">Brands</h3><div className="space-y-2 max-h-48 overflow-y-auto">{brands.map((b) => (<div key={b} className="flex items-center gap-2"><Checkbox id={`brand-${b}`} checked={selectedBrands.includes(b)} onCheckedChange={(c) => { if (c) setSelectedBrands([b]); else setSelectedBrands([]); }} /><Label htmlFor={`brand-${b}`} className="text-sm font-normal cursor-pointer">{b}</Label></div>))}</div></div>)}
      <div><h3 className="font-semibold text-sm mb-3 text-zinc-900">Availability</h3><div className="flex items-center gap-2"><Checkbox id="in-stock" checked={inStock} onCheckedChange={(c) => setInStock(!!c)} /><Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">In Stock Only</Label></div></div>
      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full"><X className="w-4 h-4 mr-1" /> Clear Filters</Button>
    </div>
  );

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="bg-white border-b border-zinc-200"><div className="container mx-auto px-4 max-w-7xl py-3 flex items-center gap-1 text-xs text-zinc-500"><button onClick={() => navigate("home")} className="flex items-center gap-1 hover:text-primary"><Home className="w-3 h-3" /> Home</button><ChevronRight className="w-3 h-3" /><button onClick={() => navigate("shop")} className="hover:text-primary">Shop</button>{activeCategory && (<><ChevronRight className="w-3 h-3" /><button onClick={() => navigate("shop", { category: activeCategory.slug })} className="hover:text-primary">{activeCategory.name}</button></>)}{activeSubcategory && (<><ChevronRight className="w-3 h-3" /><span className="text-zinc-900 font-medium">{activeSubcategory.name}</span></>)}</div></div>
      {activeCategory && (<div className="bg-white border-b border-zinc-200"><div className="container mx-auto px-4 max-w-7xl py-4 flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">{activeCategory.icon}</div><div><h1 className="text-xl font-bold text-zinc-900">{activeSubcategory?.name || activeCategory.name}</h1><p className="text-xs text-zinc-500">{activeSubcategory?.nameBn || activeCategory.nameBn} • {total} products</p></div></div></div>)}
      {!activeCategory && (<div className="bg-white border-b border-zinc-200"><div className="container mx-auto px-4 max-w-7xl py-4"><h1 className="text-xl font-bold text-zinc-900">{title}</h1><p className="text-xs text-zinc-500">{total} products found</p></div></div>)}
      <div className="container mx-auto px-4 max-w-7xl py-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <aside className="hidden lg:block bg-white rounded-xl border border-zinc-200 p-4 h-fit sticky top-32">{renderFilters()}</aside>
        <div className="lg:hidden"><Sheet open={showFilters} onOpenChange={setShowFilters}><SheetTrigger asChild><Button variant="outline" className="w-full"><SlidersHorizontal className="w-4 h-4 mr-2" /> Filters</Button></SheetTrigger><SheetContent side="left" className="w-[300px] overflow-y-auto"><div className="p-4"><h2 className="text-lg font-bold mb-4">Filters</h2>{renderFilters()}</div></SheetContent></Sheet></div>
        <div>
          <div className="flex items-center justify-between mb-4 gap-2"><div className="text-sm text-zinc-600 hidden sm:block">Showing <strong>{products.length}</strong> of <strong>{total}</strong> products</div><div className="flex items-center gap-2 ml-auto"><span className="text-xs text-zinc-500 hidden sm:block">Sort by:</span><Select value={sort} onValueChange={setSort}><SelectTrigger className="w-[160px] h-9 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="popular">Popularity</SelectItem><SelectItem value="price-low">Price: Low to High</SelectItem><SelectItem value="price-high">Price: High to Low</SelectItem><SelectItem value="newest">Newest First</SelectItem><SelectItem value="rating">Top Rated</SelectItem></SelectContent></Select></div></div>
          {loading ? (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">{Array(10).fill(0).map((_, i) => (<div key={i} className="bg-white rounded-xl border border-zinc-200 overflow-hidden"><Skeleton className="aspect-square w-full" /><div className="p-3 space-y-2"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-8 w-full" /></div></div>))}</div>) : products.length === 0 ? (<div className="bg-white rounded-xl border border-zinc-200 p-12 text-center"><div className="text-5xl mb-3">📦</div><h3 className="font-semibold text-zinc-900 mb-1">No products found</h3><p className="text-sm text-zinc-500 mb-4">Try adjusting your filters or browse all products.</p><Button onClick={clearFilters}>Clear Filters</Button></div>) : (<><ProductGrid products={products} cols={5} />{totalPages > 1 && (<div className="flex items-center justify-center gap-1 mt-6"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>{Array.from({ length: Math.min(totalPages, 7) }, (_, i) => { let p: number; if (totalPages <= 7) p = i + 1; else if (page <= 4) p = i + 1; else if (page >= totalPages - 3) p = totalPages - 6 + i; else p = page - 3 + i; return (<Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="w-9 h-9 p-0" onClick={() => setPage(p)}>{p}</Button>); })}<Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>)}</>)}
        </div>
      </div>
    </div>
  );
}
