"use client";

import { useStore } from "@/lib/store";
import { formatBDT, discountPercent } from "@/lib/format";
import { Product } from "@/lib/types";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact }: ProductCardProps) {
  const navigate = useStore((s) => s.navigate);
  const addToCart = useStore((s) => s.addToCart);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const price = product.salePrice ?? product.regularPrice;
  const disc = discountPercent(product.regularPrice, product.salePrice);
  const inStock = product.stock > 0;

  return (
    <div className="group relative bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all hover:border-primary/30 flex flex-col">
      <div className="relative aspect-square bg-zinc-50 overflow-hidden cursor-pointer" onClick={() => navigate("product", { slug: product.slug })}>
        {!imgError ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" onError={() => setImgError(true)} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300"><ShoppingCart className="w-12 h-12" /></div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {disc > 0 && <Badge className="bg-primary text-white text-[10px] font-bold">-{disc}%</Badge>}
          {product.isNewArrival && <Badge className="bg-emerald-600 text-white text-[10px] font-bold">NEW</Badge>}
          {product.isBestSeller && <Badge className="bg-amber-500 text-white text-[10px] font-bold">BESTSELLER</Badge>}
          {product.isSpecialOffer && <Badge className="bg-purple-600 text-white text-[10px] font-bold">OFFER</Badge>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm transition" aria-label="Add to wishlist">
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-primary text-primary" : "text-zinc-600"}`} />
        </button>
        {!inStock && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-semibold text-sm px-3 py-1 bg-zinc-800 rounded">Out of Stock</span></div>)}
        <button onClick={(e) => { e.stopPropagation(); navigate("product", { slug: product.slug }); }} className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition items-center gap-1.5 bg-white shadow-lg rounded-full px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-white">
          <Eye className="w-3.5 h-3.5" /> Quick View
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        {product.brand && <div className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium mb-0.5">{product.brand}</div>}
        <h3 className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug cursor-pointer hover:text-primary transition mb-1 min-h-[2.5rem]" onClick={() => navigate("product", { slug: product.slug })} title={product.name}>{product.name}</h3>
        {product.unit && <div className="text-xs text-zinc-500 mb-1.5">{product.unit}</div>}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center">{[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />))}</div>
            <span className="text-[10px] text-zinc-500">({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-base font-bold text-primary">{formatBDT(price)}</span>
            {disc > 0 && <span className="text-xs text-zinc-400 line-through">{formatBDT(product.regularPrice)}</span>}
          </div>
          {!compact && (
            <Button size="sm" className="w-full h-8 text-xs font-semibold" disabled={!inStock} onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}>
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />{inStock ? "Add to Cart" : "Notify Me"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
