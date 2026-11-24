"use client";

import { useEffect, useState } from "react";
import { useStore, useCartTotals } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatBDT, DISTRICTS, getAreasForDistrict, PAYMENT_METHODS } from "@/lib/format";
import { ArrowLeft, ArrowRight, Check, MapPin, CreditCard, Truck, Shield } from "lucide-react";
import { toast } from "sonner";
import { Settings, Address } from "@/lib/types";

export function CheckoutView({ settings }: { settings: Settings | null }) {
  const navigate = useStore((s) => s.navigate);
  const items = useStore((s) => s.cartItems);
  const couponCode = useStore((s) => s.couponCode);
  const user = useStore((s) => s.user);
  const clearCart = useStore((s) => s.clearCart);

  const { subtotal, itemCount } = useCartTotals();
  const [discount, setDiscount] = useState(0);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    addressId: "",
    address: "",
    district: "Dhaka",
    area: "",
    landmark: "",
    notes: "",
    paymentMethod: "COD",
    saveAddress: true,
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetch("/api/addresses").then((r) => r.json()).then((d) => {
        setAddresses(d.addresses || []);
        const def = (d.addresses || []).find((a: Address) => a.isDefault);
        if (def) {
          setForm((f) => ({ ...f, addressId: def.id, name: def.name, phone: def.phone, address: def.addressLine, district: def.district, area: def.area, landmark: def.landmark || "" }));
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (couponCode && subtotal > 0) {
      fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      }).then((r) => r.json()).then((d) => {
        if (d.valid) setDiscount(d.discount);
        else setDiscount(0);
      });
    } else {
      setDiscount(0);
    }
  }, [couponCode, subtotal]);

  const isInsideDhaka = form.district === "Dhaka";
  const inside = settings?.insideDhakaCharge ?? 60;
  const outside = settings?.outsideDhakaCharge ?? 120;
  const freeThreshold = settings?.freeDeliveryThreshold ?? 2000;
  const deliveryCharge = subtotal >= freeThreshold ? 0 : (isInsideDhaka ? inside : outside);
  const total = Math.max(0, subtotal - discount) + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="bg-zinc-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-2xl py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-zinc-500 mb-6">Add some products before checkout.</p>
          <Button onClick={() => navigate("shop")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const selectAddress = (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setForm((f) => ({
        ...f, addressId: id,
        name: addr.name, phone: addr.phone, address: addr.addressLine,
        district: addr.district, area: addr.area, landmark: addr.landmark || "",
      }));
    }
  };

  const placeOrder = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.phone.trim() || !/^01\d{9}$/.test(form.phone.replace(/\D/g, ""))) return toast.error("Valid phone number (01XXXXXXXXX) required");
    if (!form.address.trim()) return toast.error("Delivery address is required");
    if (!form.district) return toast.error("District is required");
    if (!form.area) return toast.error("Area is required");

    setSubmitting(true);
    try {
      let addressId = form.addressId;
      if (user && form.saveAddress && !form.addressId) {
        const addrRes = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, phone: form.phone, district: form.district, area: form.area, addressLine: form.address, landmark: form.landmark, isDefault: addresses.length === 0 }),
        });
        const addrData = await addrRes.json();
        if (addrData.address) addressId = addrData.address.id;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unit: i.unit })),
          customer: { email: form.email },
          shipping: {
            name: form.name, phone: form.phone, address: form.address,
            district: form.district, area: form.area, landmark: form.landmark,
          },
          paymentMethod: form.paymentMethod,
          couponCode,
          notes: form.notes,
          addressId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        setSubmitting(false);
        return;
      }
      if (form.paymentMethod === "COD") {
        toast.success("Order placed successfully!");
        navigate("order-confirmation", { orderId: data.order.id });
      } else if (form.paymentMethod === "BKASH" || form.paymentMethod === "NAGAD") {
        toast.success(`${form.paymentMethod === "BKASH" ? "bKash" : "Nagad"} payment initiated. Complete payment on your mobile, then order will be confirmed.`);
        navigate("order-confirmation", { orderId: data.order.id });
      } else {
        toast.success("Order placed. You will be redirected to SSLCommerz.");
        navigate("order-confirmation", { orderId: data.order.id });
      }
    } catch (e: any) {
      toast.error("Order placement failed: " + e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("cart")} className="mb-3">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-4">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            {user && addresses.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Saved Addresses</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {addresses.map((a) => (
                    <button key={a.id} onClick={() => selectAddress(a.id)} className={`w-full text-left p-3 rounded-lg border-2 transition ${form.addressId === a.id ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-zinc-300"}`}>
                      <div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{a.name}</span>{a.isDefault && <Badge variant="secondary" className="text-[9px]">Default</Badge>}</div>
                      <div className="text-xs text-zinc-600">{a.addressLine}, {a.area}, {a.district}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{a.phone}</div>
                    </button>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setForm((f) => ({ ...f, addressId: "" }))}>+ Use a new address</Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Customer Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label htmlFor="name">Full Name *</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></div>
                <div><Label htmlFor="phone">Phone Number *</Label><Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div>
                <div className="sm:col-span-2"><Label htmlFor="email">Email (optional)</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Delivery Address</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label htmlFor="district">District *</Label><Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v, area: "" })}><SelectTrigger id="district"><SelectValue /></SelectTrigger><SelectContent>{DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label htmlFor="area">Area *</Label><Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}><SelectTrigger id="area"><SelectValue placeholder="Select area" /></SelectTrigger><SelectContent>{getAreasForDistrict(form.district).map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div><Label htmlFor="address">Full Address *</Label><Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House #, Road #, Building name..." rows={2} /></div>
                <div><Label htmlFor="landmark">Landmark (optional)</Label><Input id="landmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Near... (helps courier find you)" /></div>
                {user && (<div className="flex items-center gap-2"><Checkbox id="saveAddr" checked={form.saveAddress} onCheckedChange={(c) => setForm({ ...form, saveAddress: !!c })} /><Label htmlFor="saveAddr" className="text-sm font-normal cursor-pointer">Save this address for next time</Label></div>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Payment Method</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })} className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} htmlFor={`pay-${m.id}`} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${form.paymentMethod === m.id ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-zinc-300"}`}>
                      <RadioGroupItem value={m.id} id={`pay-${m.id}`} className="mt-1" />
                      <div className="text-2xl">{m.icon}</div>
                      <div className="flex-1"><div className="font-medium text-sm">{m.label} <span className="font-bengali text-xs text-zinc-500 ml-1">{m.labelBn}</span></div><div className="text-xs text-zinc-500">{m.desc}</div></div>
                    </label>
                  ))}
                </RadioGroup>
                {(form.paymentMethod === "BKASH" || form.paymentMethod === "NAGAD") && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <div className="font-semibold mb-1">{form.paymentMethod === "BKASH" ? "bKash" : "Nagad"} Payment Instructions:</div>
                    <div>Send money to: <strong>{form.paymentMethod === "BKASH" ? settings?.bkashNumber || "01700000000" : settings?.nagadNumber || "01700000000"}</strong></div>
                    <div>Amount: <strong>{formatBDT(total)}</strong></div>
                    <div>Reference: Your order number (will be generated after placing order)</div>
                    <div className="mt-1 text-[11px]">After placing the order, complete payment within 30 minutes or it will be cancelled.</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Order Notes (optional)</CardTitle></CardHeader>
              <CardContent><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions for delivery..." rows={2} /></CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-32 h-fit">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0"><div className="text-xs font-medium line-clamp-2">{item.name}</div><div className="text-xs text-zinc-500">{item.quantity} × {formatBDT(item.price)}</div></div>
                      <div className="text-xs font-semibold whitespace-nowrap">{formatBDT(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-600">Subtotal ({itemCount})</span><span className="font-medium">{formatBDT(subtotal)}</span></div>
                  {discount > 0 && (<div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatBDT(discount)}</span></div>)}
                  <div className="flex justify-between"><span className="text-zinc-600">Delivery ({form.district})</span><span className="font-medium">{deliveryCharge === 0 ? <span className="text-emerald-600">FREE</span> : formatBDT(deliveryCharge)}</span></div>
                </div>
                <Separator />
                <div className="flex justify-between items-baseline"><span className="font-semibold">Total</span><span className="text-2xl font-bold text-primary">{formatBDT(total)}</span></div>
                <Button size="lg" className="w-full" disabled={submitting} onClick={placeOrder}>
                  {submitting ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" /> Placing Order...</>) : (<>Place Order <Check className="w-4 h-4 ml-1" /></>)}
                </Button>
                <div className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> Your information is secure and encrypted</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
