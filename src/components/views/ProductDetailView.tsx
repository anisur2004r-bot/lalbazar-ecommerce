"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Product, Review, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ProductGrid } from "@/components/product/ProductGrid";
import { formatBDT, discountPercent, formatDate } from "@/lib/format";
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, Truck, Shield, RefreshCw, ChevronRight, Home, Check } from "lucide-react";
import { toast } from "sonner";

interface ProductDetailViewProps { slug: string; categories: Category[]; }

export function ProductDetailView({ slug, categories }: ProductDetailViewProps) {
  const navigate = useStore((s) => s.navigate);
  const addToCart = useStore((s) => s.addToCart);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const user = useStore((s) => s.user);
  const addRecentlyViewed = useStore((s) => s.addRecentlyViewed);

  const [data, setData] = useState<{ product: any; related: Product[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`).then((r) => r.json()).then((d) => {
      setData(d);
      if (d.product) addRecentlyViewed(d.product.id);
      setActiveImg(0);
      setQty(1);
    }).finally(() => setLoading(false));
  }, [slug, addRecentlyViewed]);

  if (loading) {
    return (<div className="container mx-auto px-4 max-w-7xl py-6"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="aspect-square w-full rounded-xl" /><div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></div></div></div>);
  }

  if (!data?.product) {
    return (<div className="container mx-auto px-4 max-w-7xl py-16 text-center"><div className="text-5xl mb-3">🔍</div><h2 className="text-xl font-bold mb-2">Product Not Found</h2><Button onClick={() => navigate("shop")}>Browse Products</Button></div>);
  }

  const p = data.product;
  const price = p.salePrice ?? p.regularPrice;
  const disc = discountPercent(p.regularPrice, p.salePrice);
  const isWishlisted = wishlist.includes(p.id);
  const inStock = p.stock > 0;

  const handleAddToCart = () => { addToCart(p, qty); toast.success(`Added ${qty} × ${p.name} to cart`); };
  const handleBuyNow = () => { addToCart(p, qty); navigate("checkout"); };

  const submitReview = async () => {
    if (!user) { toast.error("Please login to leave a review"); navigate("login"); return; }
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: p.id, rating: newReview.rating, comment: newReview.comment }) });
    if (res.ok) { toast.success("Review submitted successfully"); setNewReview({ rating: 5, comment: "" }); fetch(`/api/products/${slug}`).then((r) => r.json()).then(setData); }
    else { toast.error("Failed to submit review"); }
  };

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="bg-white border-b border-zinc-200"><div className="container mx-auto px-4 max-w-7xl py-3 flex items-center gap-1 text-xs text-zinc-500 flex-wrap"><button onClick={() => navigate("home")} className="flex items-center gap-1 hover:text-primary"><Home className="w-3 h-3" /> Home</button><ChevronRight className="w-3 h-3" /><button onClick={() => navigate("shop", { category: p.categorySlug })} className="hover:text-primary">{p.categoryName}</button><ChevronRight className="w-3 h-3" /><span className="text-zinc-900 font-medium line-clamp-1">{p.name}</span></div></div>
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-6">
          <div>
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden aspect-square mb-3"><img src={p.images[activeImg]} alt={p.name} className="w-full h-full object-cover" /></div>
            {p.images.length > 1 && (<div className="flex gap-2 overflow-x-auto no-scrollbar">{p.images.map((img: string, i: number) => (<button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 ${i === activeImg ? "border-primary" : "border-zinc-200"}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>))}</div>)}
          </div>
          <div>
            {p.brand && <div className="text-xs uppercase tracking-wide text-zinc-500 font-semibold mb-1">{p.brand}</div>}
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2 leading-snug">{p.name}</h1>
            {p.nameBn && <div className="font-bengali text-zinc-600 mb-3">{p.nameBn}</div>}
            <div className="flex items-center gap-3 mb-3"><div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`w-4 h-4 ${s <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />))}</div><span className="text-sm text-zinc-600">{p.rating.toFixed(1)} ({p.reviewCount} reviews)</span><span className="text-sm text-zinc-600">•</span><span className="text-sm text-zinc-600">{p.soldCount} sold</span></div>
            <div className="bg-primary/5 rounded-lg p-3 mb-4"><div className="flex items-baseline gap-2 flex-wrap"><span className="text-3xl font-bold text-primary">{formatBDT(price)}</span>{disc > 0 && (<><span className="text-base text-zinc-400 line-through">{formatBDT(p.regularPrice)}</span><Badge className="bg-primary text-white">-{disc}%</Badge></>)}</div>{p.unit && <div className="text-xs text-zinc-500 mt-1">Price for {p.unit}</div>}</div>
            <div className="mb-3">{inStock ? (<span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium"><Check className="w-4 h-4" /> In Stock ({p.stock} available)</span>) : (<span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">Out of Stock</span>)}</div>
            {p.shortDesc && (<p className="text-sm text-zinc-700 mb-4">{p.shortDesc}</p>)}
            <div className="flex items-center gap-3 mb-4"><div className="flex items-center border border-zinc-200 rounded-lg"><Button variant="ghost" size="icon" className="h-10 w-10 rounded-r-none" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}><Minus className="w-4 h-4" /></Button><Input type="number" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value) || 1)))} className="w-14 h-10 text-center border-0 rounded-none focus-visible:ring-0" /><Button variant="ghost" size="icon" className="h-10 w-10 rounded-l-none" onClick={() => setQty(Math.min(p.stock, qty + 1))} disabled={qty >= p.stock}><Plus className="w-4 h-4" /></Button></div><Button variant="outline" size="icon" className="h-10 w-10" onClick={() => { toggleWishlist(p.id); toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist"); }}><Heart className={`w-5 h-5 ${isWishlisted ? "fill-primary text-primary" : ""}`} /></Button><Button variant="outline" size="icon" className="h-10 w-10" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}><Share2 className="w-5 h-5" /></Button></div>
            <div className="grid grid-cols-2 gap-2 mb-4"><Button size="lg" variant="outline" onClick={handleAddToCart} disabled={!inStock} className="h-12"><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</Button><Button size="lg" onClick={handleBuyNow} disabled={!inStock} className="h-12">Buy Now</Button></div>
            <div className="grid grid-cols-3 gap-2 text-xs"><div className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-zinc-200"><Truck className="w-5 h-5 text-primary" /><span className="text-center text-zinc-600">Fast Delivery</span></div><div className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-zinc-200"><Shield className="w-5 h-5 text-primary" /><span className="text-center text-zinc-600">Secure Payment</span></div><div className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-zinc-200"><RefreshCw className="w-5 h-5 text-primary" /><span className="text-center text-zinc-600">Easy Returns</span></div></div>
          </div>
          <aside className="space-y-3">
            <div className="bg-white rounded-xl border border-zinc-200 p-4"><h3 className="font-semibold text-sm mb-3">Delivery Information</h3><div className="space-y-2 text-xs text-zinc-700"><div className="flex items-start gap-2"><Truck className="w-4 h-4 mt-0.5 text-primary shrink-0" /><div><div className="font-medium">Inside Dhaka</div><div>24-48 hours</div></div></div><div className="flex items-start gap-2"><Truck className="w-4 h-4 mt-0.5 text-primary shrink-0" /><div><div className="font-medium">Outside Dhaka</div><div>3-7 business days</div></div></div><div className="flex items-start gap-2"><Shield className="w-4 h-4 mt-0.5 text-primary shrink-0" /><div><div className="font-medium">Free Delivery</div><div>On orders above ৳2,000</div></div></div></div></div>
            <div className="bg-white rounded-xl border border-zinc-200 p-4"><h3 className="font-semibold text-sm mb-2">SKU</h3><div className="text-xs text-zinc-600">{p.sku || "N/A"}</div>{p.tags && (<><h3 className="font-semibold text-sm mt-3 mb-2">Tags</h3><div className="flex flex-wrap gap-1">{p.tags.split(",").map((t: string) => (<Badge key={t} variant="secondary" className="text-[10px]">{t.trim()}</Badge>))}</div></>)}</div>
          </aside>
        </div>
        <div className="mt-8 bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <Tabs defaultValue="description"><TabsList className="w-full justify-start border-b"><TabsTrigger value="description">Description</TabsTrigger><TabsTrigger value="reviews">Reviews ({p.reviewCount})</TabsTrigger><TabsTrigger value="shipping">Shipping</TabsTrigger></TabsList>
            <TabsContent value="description" className="mt-4 prose prose-sm max-w-none"><p className="text-zinc-700 whitespace-pre-line">{p.description}</p></TabsContent>
            <TabsContent value="reviews" className="mt-4"><div className="border border-zinc-200 rounded-lg p-4 mb-4 bg-zinc-50"><h4 className="font-semibold text-sm mb-3">Write a Review</h4><div className="flex items-center gap-2 mb-3"><span className="text-xs text-zinc-600">Rating:</span>{[1, 2, 3, 4, 5].map((s) => (<button key={s} onClick={() => setNewReview({ ...newReview, rating: s })}><Star className={`w-5 h-5 ${s <= newReview.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} /></button>))}</div><Textarea placeholder="Share your experience with this product..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} className="mb-3" rows={3} /><Button onClick={submitReview} size="sm">Submit Review</Button></div><div className="space-y-4">{p.reviews && p.reviews.length > 0 ? (p.reviews.map((r: Review) => (<div key={r.id} className="border-b border-zinc-100 pb-3"><div className="flex items-center justify-between mb-1"><div className="font-medium text-sm">{r.userName}</div><div className="text-xs text-zinc-500">{formatDate(r.createdAt)}</div></div><div className="flex items-center gap-1 mb-1">{[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />))}</div>{r.comment && <p className="text-sm text-zinc-700">{r.comment}</p>}</div>))) : (<div className="text-center py-8 text-zinc-500"><div className="text-3xl mb-2">💬</div><p className="text-sm">No reviews yet. Be the first to review!</p></div>)}</div></TabsContent>
            <TabsContent value="shipping" className="mt-4 prose prose-sm max-w-none"><h4 className="font-semibold mb-2">Delivery & Returns</h4><ul className="space-y-2 text-zinc-700 text-sm list-disc pl-5"><li>Delivery inside Dhaka: 24-48 hours, charge ৳60</li><li>Delivery outside Dhaka: 3-7 business days, charge ৳120</li><li>Free delivery on orders above ৳2,000</li><li>Cash on Delivery available nationwide</li><li>Online payment via bKash, Nagad, SSLCommerz</li><li>Return within 24 hours for perishables, 7 days for non-perishables</li><li>Items must be unused and in original packaging for returns</li></ul></TabsContent>
          </Tabs>
        </div>
        {data.related && data.related.length > 0 && (<div className="mt-8"><h2 className="text-lg font-bold text-zinc-900 mb-4">Related Products</h2><ProductGrid products={data.related.slice(0, 5)} cols={5} /></div>)}
      </div>
    </div>
  );
}
