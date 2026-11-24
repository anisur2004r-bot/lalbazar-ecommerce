"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ShoppingBag, Package, User as UserIcon, MapPin, CreditCard, Truck, Calendar, Receipt, AlertCircle, Home } from "lucide-react";
import { formatBDT, formatDate } from "@/lib/format";

interface OrderConfirmationViewProps { orderId?: string; }

export function OrderConfirmationView({ orderId }: OrderConfirmationViewProps) {
  const navigate = useStore((s) => s.navigate);
  const clearCart = useStore((s) => s.clearCart);
  const user = useStore((s) => s.user);
  const params = useStore((s) => s.params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { clearCart(); }, [clearCart]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = orderId || params.orderId;
      if (!id) { setNotFound(true); setLoading(false); return; }
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
        if (!res.ok) { if (!cancelled) setNotFound(true); return; }
        const data = await res.json();
        if (!cancelled) setOrder(data.order || null);
      } catch { if (!cancelled) setNotFound(true); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [orderId, params.orderId]);

  if (loading) return (<div className="container mx-auto px-4 max-w-3xl py-10"><Skeleton className="h-48 w-full rounded-2xl mb-6" /><Skeleton className="h-64 w-full rounded-xl" /></div>);

  if (notFound || !order) return (<div className="container mx-auto px-4 max-w-2xl py-16 text-center"><div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4"><AlertCircle className="w-8 h-8 text-amber-600" /></div><h2 className="text-2xl font-bold text-zinc-900 mb-2">Order Not Found</h2><p className="text-sm text-zinc-500 mb-6">We couldn&apos;t find an order with that reference. Please check your order number and try again.</p><div className="flex flex-wrap gap-2 justify-center"><Button onClick={() => navigate("home")}><Home className="w-4 h-4" /> Go Home</Button><Button variant="outline" onClick={() => navigate("order-tracking")}><Package className="w-4 h-4" /> Track an Order</Button></div></div>);

  const isDhaka = order.shippingDistrict.toLowerCase() === "dhaka";
  const etaDays = isDhaka ? "3-5" : "5-7";
  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + (isDhaka ? 5 : 7));

  const statusBadgeClass = (status: string) => {
    switch (status) { case "DELIVERED": return "bg-emerald-600 text-white"; case "SHIPPED": return "bg-indigo-600 text-white"; case "PROCESSING": case "CONFIRMED": return "bg-blue-600 text-white"; case "CANCELLED": return "bg-red-600 text-white"; default: return "bg-amber-500 text-white"; }
  };

  return (
    <div className="container mx-auto px-4 max-w-3xl py-8">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"><CardContent className="pt-8 pb-6 text-center"><div className="mx-auto w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30"><CheckCircle2 className="w-12 h-12 text-white" /></div><h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-1">Order Confirmed!</h1><p className="text-sm text-zinc-600 mb-4">ধন্যবাদ! Thank you for your order. We&apos;ve received it and will start processing right away.</p><div className="inline-flex items-center gap-2 bg-white rounded-full border border-emerald-200 px-4 py-1.5"><Receipt className="w-4 h-4 text-primary" /><span className="text-sm font-medium text-zinc-700">Order Number:</span><span className="text-sm font-bold text-primary">{order.orderNumber}</span></div><div className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-600"><Calendar className="w-4 h-4 text-zinc-400" /> Placed on {formatDate(order.createdAt)}</div></CardContent></Card>
      <div className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3"><Truck className="w-8 h-8 text-primary shrink-0" /><div className="flex-1"><div className="font-semibold text-zinc-900 text-sm">Estimated Delivery</div><div className="text-sm text-zinc-600">{isDhaka ? "Inside Dhaka" : "Outside Dhaka"} • {etaDays} business days • Expected by {formatDate(etaDate)}</div></div>{order.trackingNumber && (<div className="text-right"><div className="text-[11px] text-zinc-500">Tracking #</div><div className="text-sm font-semibold text-zinc-900">{order.trackingNumber}</div></div>)}</div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-3"><CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary" /> Order Items ({order.items.length})</CardTitle></CardHeader><CardContent className="space-y-3">{order.items.map((it) => (<div key={it.id} className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0">{it.image ? (<img src={it.image} alt={it.name} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-zinc-300"><ShoppingBag className="w-5 h-5" /></div>)}</div><div className="flex-1 min-w-0"><div className="text-sm font-medium text-zinc-900 truncate">{it.name}</div><div className="text-xs text-zinc-500">{it.quantity} × {formatBDT(it.price)}{it.unit ? ` / ${it.unit}` : ""}</div></div><div className="text-sm font-semibold text-zinc-900">{formatBDT(it.subtotal)}</div></div>))}</CardContent></Card>
        <Card className="md:col-span-2"><CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader><CardContent className="space-y-2.5 text-sm"><div className="flex justify-between"><span className="text-zinc-600">Subtotal</span><span className="font-medium">{formatBDT(order.subtotal)}</span></div>{order.discount > 0 && (<div className="flex justify-between text-emerald-600"><span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span className="font-medium">-{formatBDT(order.discount)}</span></div>)}<div className="flex justify-between"><span className="text-zinc-600">Delivery Charge</span><span className="font-medium">{order.deliveryCharge === 0 ? "FREE" : formatBDT(order.deliveryCharge)}</span></div><Separator /><div className="flex justify-between text-base"><span className="font-semibold text-zinc-900">Total</span><span className="font-bold text-primary">{formatBDT(order.total)}</span></div><Separator /><div className="pt-1 space-y-1.5"><div className="flex justify-between"><span className="text-zinc-600 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment</span><span className="font-medium">{order.paymentMethod}</span></div><div className="flex justify-between"><span className="text-zinc-600">Payment Status</span><Badge className={order.paymentStatus === "PAID" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}>{order.paymentStatus}</Badge></div><div className="flex justify-between"><span className="text-zinc-600">Order Status</span><Badge className={statusBadgeClass(order.status)}>{order.status}</Badge></div></div></CardContent></Card>
      </div>
      <Card className="mt-4"><CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Shipping Address</CardTitle></CardHeader><CardContent><div className="text-sm text-zinc-700 space-y-0.5"><div className="font-medium text-zinc-900">{order.shippingName}</div><div>{order.shippingPhone}</div><div>{order.shippingAddress}</div><div>{order.shippingArea}, {order.shippingDistrict}</div>{order.notes && (<div className="mt-2 pt-2 border-t text-xs text-zinc-500"><span className="font-medium">Note:</span> {order.notes}</div>)}</div></CardContent></Card>
      <div className="mt-6 flex flex-wrap gap-2 justify-center"><Button onClick={() => navigate("home")} variant="outline" size="lg"><ShoppingBag className="w-4 h-4" /> Continue Shopping</Button><Button onClick={() => navigate("order-tracking", { orderNumber: order.orderNumber })} size="lg"><Package className="w-4 h-4" /> Track Order</Button>{user && (<Button onClick={() => navigate("account")} variant="outline" size="lg"><UserIcon className="w-4 h-4" /> View My Orders</Button>)}</div>
    </div>
  );
}
