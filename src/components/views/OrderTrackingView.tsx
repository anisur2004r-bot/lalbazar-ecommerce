"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search, MapPin, CreditCard, ShoppingBag, Truck, CheckCircle2, Clock, PackageCheck, XCircle, Phone, AlertCircle, Hash } from "lucide-react";
import { formatBDT, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

const STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock, color: "text-amber-500" },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2, color: "text-blue-500" },
  { key: "PROCESSING", label: "Processing", icon: Package, color: "text-blue-500" },
  { key: "SHIPPED", label: "Shipped", icon: Truck, color: "text-indigo-600" },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck, color: "text-emerald-600" },
];
const STEP_ORDER = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderTrackingView() {
  const params = useStore((s) => s.params);
  const navigate = useStore((s) => s.navigate);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => { if (params.orderNumber) { setOrderNumber(params.orderNumber); void doTrack(params.orderNumber, ""); } }, [params.orderNumber]);

  const doTrack = async (ono: string, ph: string) => {
    if (!ono.trim()) { toast.error("Please enter an order number"); return; }
    setLoading(true); setError(null); setSearched(true);
    try {
      const qs = new URLSearchParams({ orderNumber: ono.trim() }); if (ph.trim()) qs.set("phone", ph.trim());
      const res = await fetch(`/api/orders/track?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Order not found"); setOrder(null); } else { setOrder(data.order || null); }
    } catch { setError("Failed to fetch order. Please try again."); setOrder(null); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doTrack(orderNumber, phone); };
  const currentStepIndex = order ? STEP_ORDER.indexOf(order.status) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <div className="container mx-auto px-4 max-w-3xl py-6">
      <div className="mb-6"><h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> Track Your Order</h1><p className="text-sm text-zinc-500 mt-1">অর্ডার ট্র্যাক করুন — Enter your order number to see the latest status.</p></div>
      <Card><CardContent className="pt-6"><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-1.5"><Label htmlFor="ono">Order Number *</Label><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="ono" placeholder="LB20250101ABC123" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="pl-9 uppercase" required /></div><p className="text-[11px] text-zinc-500">Found in your order confirmation email or receipt.</p></div><div className="space-y-1.5"><Label htmlFor="phone">Phone (optional)</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" /></div><p className="text-[11px] text-zinc-500">Add phone for verification.</p></div></div><Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Tracking…</>) : (<><Search className="w-4 h-4" /> Track Order</>)}</Button></form></CardContent></Card>
      <div className="mt-6">
        {loading && (<Card><CardContent className="py-10"><Skeleton className="h-8 w-48 mb-6" /><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div></CardContent></Card>)}
        {!loading && error && (<Card className="border-amber-200 bg-amber-50/50"><CardContent className="py-10 flex flex-col items-center text-center"><div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3"><AlertCircle className="w-7 h-7 text-amber-600" /></div><h3 className="font-semibold text-zinc-900 mb-1">{error}</h3><p className="text-sm text-zinc-600 mb-4">Please double-check your order number and try again. If the issue persists, contact our support.</p><Button variant="outline" onClick={() => navigate("contact")}>Contact Support</Button></CardContent></Card>)}
        {!loading && !error && !order && !searched && (<Card className="border-dashed border-zinc-300 bg-zinc-50/50"><CardContent className="py-12 flex flex-col items-center text-center"><div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Package className="w-8 h-8 text-primary/60" /></div><h3 className="font-semibold text-zinc-900 mb-1">Enter your order number above</h3><p className="text-sm text-zinc-500 max-w-sm">Track your order in real time. View status updates, delivery estimates, and tracking information once shipped.</p></CardContent></Card>)}
        {!loading && !error && order && (<div className="space-y-4">
          <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-base">Order {order.orderNumber}</CardTitle>{isCancelled ? (<Badge className="bg-red-600 text-white"><XCircle className="w-3 h-3" /> CANCELLED</Badge>) : (<Badge className="bg-emerald-600 text-white"><CheckCircle2 className="w-3 h-3" /> {order.status}</Badge>)}</div></CardHeader><CardContent className="text-sm"><div className="flex flex-wrap gap-x-6 gap-y-1 text-zinc-600"><span>Placed: <strong className="text-zinc-900">{formatDateTime(order.createdAt)}</strong></span><span>Updated: <strong className="text-zinc-900">{formatDateTime(order.updatedAt)}</strong></span>{order.trackingNumber && (<span>Tracking #: <strong className="text-zinc-900">{order.trackingNumber}</strong></span>)}</div>{isCancelled && order.cancelReason && (<div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800"><strong>Cancelled reason:</strong> {order.cancelReason}</div>)}</CardContent></Card>
          {!isCancelled && (<Card><CardHeader><CardTitle className="text-base">Order Timeline</CardTitle></CardHeader><CardContent><ol className="relative space-y-5">{STEPS.map((step, idx) => { const Icon = step.icon; const done = idx <= currentStepIndex; const isCurrent = idx === currentStepIndex; return (<li key={step.key} className="flex gap-3 items-start"><div className="flex flex-col items-center"><div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"} ${isCurrent ? "ring-4 ring-primary/20" : ""}`}><Icon className={`w-4 h-4 ${done ? "" : step.color}`} /></div>{idx < STEPS.length - 1 && (<div className={`w-0.5 h-6 ${idx < currentStepIndex ? "bg-primary" : "bg-zinc-200"}`} />)}</div><div className="pt-1"><div className={`text-sm font-medium ${done ? "text-zinc-900" : "text-zinc-500"}`}>{step.label}</div><div className="text-xs text-zinc-500">{done && idx < currentStepIndex && "Completed"}{isCurrent && "In progress"}{idx > currentStepIndex && "Pending"}</div></div></li>); })}</ol></CardContent></Card>)}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="md:col-span-3"><CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary" /> Items ({order.items.length})</CardTitle></CardHeader><CardContent className="space-y-3">{order.items.map((it) => (<div key={it.id} className="flex items-center gap-3"><div className="w-11 h-11 rounded-lg bg-zinc-100 overflow-hidden shrink-0">{it.image ? (<img src={it.image} alt={it.name} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-zinc-300"><ShoppingBag className="w-5 h-5" /></div>)}</div><div className="flex-1 min-w-0"><div className="text-sm font-medium text-zinc-900 truncate">{it.name}</div><div className="text-xs text-zinc-500">{it.quantity} × {formatBDT(it.price)}</div></div><div className="text-sm font-semibold">{formatBDT(it.subtotal)}</div></div>))}</CardContent></Card>
            <Card className="md:col-span-2"><CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-zinc-600">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>{order.discount > 0 && (<div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatBDT(order.discount)}</span></div>)}<div className="flex justify-between"><span className="text-zinc-600">Delivery</span><span>{order.deliveryCharge === 0 ? "FREE" : formatBDT(order.deliveryCharge)}</span></div><Separator /><div className="flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-bold text-primary">{formatBDT(order.total)}</span></div><Separator /><div className="flex justify-between"><span className="text-zinc-600 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Method</span><span>{order.paymentMethod}</span></div><div className="flex justify-between"><span className="text-zinc-600">Payment Status</span><Badge className={order.paymentStatus === "PAID" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}>{order.paymentStatus}</Badge></div></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Shipping Address</CardTitle></CardHeader><CardContent className="text-sm text-zinc-700 space-y-0.5"><div className="font-medium text-zinc-900">{order.shippingName}</div><div>{order.shippingPhone}</div><div>{order.shippingAddress}</div><div>{order.shippingArea}, {order.shippingDistrict}</div></CardContent></Card>
          <div className="flex justify-center pt-2"><Button variant="outline" onClick={() => navigate("contact")}>Need help with this order?</Button></div>
        </div>)}
      </div>
    </div>
  );
}
