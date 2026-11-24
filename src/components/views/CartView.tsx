"use client";

import { useState } from "react";
import { useStore, useCartTotals } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, Truck } from "lucide-react";
import { toast } from "sonner";
import { Settings } from "@/lib/types";

export function CartView({ settings }: { settings: Settings | null }) {
  const navigate = useStore((s) => s.navigate);
  const items = useStore((s) => s.cartItems);
  const updateQty = useStore((s) => s.updateCartQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);
  const couponCode = useStore((s) => s.couponCode);
  const setCoupon = useStore((s) => s.setCoupon);

  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { subtotal, itemCount, deliveryCharge, total, freeThreshold } = useCartTotals();
  const finalTotal = Math.max(0, subtotal - discount) + deliveryCharge;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponInput.toUpperCase(), subtotal }) });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setCoupon(couponInput.toUpperCase());
        setCouponMsg({ type: "success", text: `Coupon applied! You saved ${formatBDT(data.discount)}` });
        toast.success(`Coupon applied - saved ${formatBDT(data.discount)}`);
      } else {
        setDiscount(0);
        setCoupon(null);
        setCouponMsg({ type: "error", text: data.error || "Invalid coupon" });
        toast.error(data.error || "Invalid coupon");
      }
    } catch { toast.error("Failed to validate coupon"); }
  };

  const removeCoupon = () => { setCoupon(null); setDiscount(0); setCouponInput(""); setCouponMsg(null); };

  if (items.length === 0) {
    return (
      <div className="bg-zinc-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center"><ShoppingBag className="w-12 h-12 text-zinc-400" /></div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Your cart is empty</h1>
          <p className="text-zinc-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button size="lg" onClick={() => navigate("shop")}><ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Shopping Cart ({itemCount})</h1>
          <Button variant="ghost" size="sm" onClick={() => { clearCart(); toast.success("Cart cleared"); }}><Trash2 className="w-4 h-4 mr-1" /> Clear Cart</Button>
        </div>
        {remainingForFree > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-3"><Truck className="w-5 h-5 text-amber-600 shrink-0" /><div className="text-sm text-amber-800">Add <strong>{formatBDT(remainingForFree)}</strong> more to get <strong>FREE delivery</strong>!</div></div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-center gap-3"><Truck className="w-5 h-5 text-emerald-600 shrink-0" /><div className="text-sm text-emerald-800">You've unlocked <strong>FREE delivery</strong>!</div></div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-3">{items.map((item) => (<Card key={item.productId} className="overflow-hidden"><CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4"><div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-zinc-100 shrink-0 cursor-pointer" onClick={() => navigate("product", { slug: item.slug })}><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><h3 className="font-medium text-sm sm:text-base text-zinc-900 line-clamp-2 mb-1 cursor-pointer hover:text-primary" onClick={() => navigate("product", { slug: item.slug })}>{item.name}</h3>{item.unit && <div className="text-xs text-zinc-500 mb-1">{item.unit}</div>}<div className="flex items-baseline gap-2 mb-2"><span className="font-bold text-primary">{formatBDT(item.price)}</span>{item.regularPrice > item.price && (<span className="text-xs text-zinc-400 line-through">{formatBDT(item.regularPrice)}</span>)}</div><div className="flex items-center gap-2"><div className="flex items-center border border-zinc-200 rounded-lg"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none" onClick={() => updateQty(item.productId, item.quantity - 1)}><Minus className="w-3 h-3" /></Button><span className="w-10 text-center text-sm font-medium tabular-nums">{item.quantity}</span><Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none" onClick={() => updateQty(item.productId, Math.min(item.stock, item.quantity + 1))} disabled={item.quantity >= item.stock}><Plus className="w-3 h-3" /></Button></div><Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { removeFromCart(item.productId); toast.success("Removed from cart"); }}><Trash2 className="w-3 h-3 mr-1" /> Remove</Button></div></div><div className="text-right shrink-0 hidden sm:block"><div className="text-xs text-zinc-500 mb-1">Subtotal</div><div className="font-bold text-zinc-900">{formatBDT(item.price * item.quantity)}</div></div></CardContent></Card>))}</div>
          <div className="lg:sticky lg:top-32 h-fit space-y-3">
            <Card><CardHeader className="pb-3"><CardTitle className="text-base">Order Summary</CardTitle></CardHeader><CardContent className="space-y-3"><div><div className="flex gap-2"><Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className="h-9 text-sm uppercase" />{couponCode ? (<Button variant="outline" size="sm" onClick={removeCoupon}><X className="w-3 h-3" /></Button>) : (<Button size="sm" onClick={applyCoupon} disabled={!couponInput.trim()}>Apply</Button>)}</div>{couponMsg && (<div className={`text-xs mt-1.5 ${couponMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{couponMsg.text}</div>)}{!couponCode && (<div className="text-[10px] text-zinc-500 mt-1">Try: WELCOME10, LALBAZAR50, MEGA100</div>)}</div><Separator /><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-zinc-600">Subtotal ({itemCount} items)</span><span className="font-medium">{formatBDT(subtotal)}</span></div>{discount > 0 && (<div className="flex justify-between text-emerald-600"><span>Discount {couponCode && <Badge variant="secondary" className="text-[9px] ml-1">{couponCode}</Badge>}</span><span>-{formatBDT(discount)}</span></div>)}<div className="flex justify-between"><span className="text-zinc-600">Delivery Charge</span><span className="font-medium">{deliveryCharge === 0 ? <span className="text-emerald-600">FREE</span> : formatBDT(deliveryCharge)}</span></div></div><Separator /><div className="flex justify-between items-baseline"><span className="font-semibold">Total</span><span className="text-xl font-bold text-primary">{formatBDT(finalTotal)}</span></div><Button size="lg" className="w-full" onClick={() => navigate("checkout")}>Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" /></Button><Button variant="outline" size="sm" className="w-full" onClick={() => navigate("shop")}>Continue Shopping</Button></CardContent></Card>
            <Card><CardContent className="p-3 text-xs text-zinc-600 space-y-1.5"><div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Fast & reliable delivery</div><div className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> COD, bKash, Nagad accepted</div></CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
}
