"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Product } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, ArrowRight, Trash2, PackageSearch } from "lucide-react";
import { toast } from "sonner";

export function WishlistView() {
  const navigate = useStore((s) => s.navigate);
  const user = useStore((s) => s.user);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (user) {
          const res = await fetch("/api/wishlist");
          const data = await res.json();
          if (!cancelled) setProducts(data.products || []);
        } else {
          const res = await fetch("/api/products?limit=200");
          const data = await res.json();
          const all: Product[] = data.products || [];
          if (!cancelled) setProducts(all.filter((p) => wishlist.includes(p.id)));
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, wishlist]);

  const moveAllToCart = () => {
    if (products.length === 0) { toast.info("Your wishlist is empty"); return; }
    let added = 0;
    products.forEach((p) => { if (p.stock > 0) { addToCart(p, 1); added++; } });
    toast.success(`${added} item${added !== 1 ? "s" : ""} added to cart`);
  };

  const clearAll = () => {
    products.forEach((p) => toggleWishlist(p.id));
    toast.info("Wishlist cleared");
    setProducts([]);
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-2xl font-bold text-zinc-900">My Wishlist</h1>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            {loading ? "Loading…" : `${products.length} item${products.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        {!loading && products.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={clearAll} className="border-zinc-300">
              <Trash2 className="w-4 h-4" /> Clear All
            </Button>
            <Button onClick={moveAllToCart}>
              <ShoppingCart className="w-4 h-4" /> Move All to Cart
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed border-zinc-300 bg-zinc-50/50">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Your wishlist is empty</h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              Save your favourite products here so you can find them easily later. Tap the heart icon on any product to add it.
            </p>
            <Button onClick={() => navigate("shop")} size="lg">
              <PackageSearch className="w-4 h-4" /> Browse Products <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProductGrid products={products} cols={5} />
      )}
    </div>
  );
}
