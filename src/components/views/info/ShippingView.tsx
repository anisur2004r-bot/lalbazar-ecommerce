"use client";

import { useStore } from "@/lib/store";
import { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, MapPin, Clock, Package, Bike, Globe2, Navigation, AlertCircle } from "lucide-react";
import { formatBDT } from "@/lib/format";

interface ShippingViewProps { settings?: Settings | null; }

export function ShippingView({ settings }: ShippingViewProps) {
  const navigate = useStore((s) => s.navigate);
  const insideDhaka = settings?.insideDhakaCharge ?? 60;
  const outsideDhaka = settings?.outsideDhakaCharge ?? 120;
  const freeThreshold = settings?.freeDeliveryThreshold ?? 2000;
  return (
    <div className="bg-zinc-50">
      <section className="bg-zinc-900 text-white"><div className="container mx-auto px-4 max-w-7xl py-10"><div className="flex items-center gap-2 text-sm text-zinc-400 mb-2"><Truck className="w-4 h-4" /> Customer Service • ডেলিভারি পলিসি</div><h1 className="text-3xl font-bold mb-2">Shipping Policy</h1><p className="text-sm text-zinc-300">Last updated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p></div></section>
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <InfoCard icon={<MapPin className="w-5 h-5" />} title="Delivery Areas" value="All 64 Districts" color="bg-primary/10 text-primary" />
          <InfoCard icon={<Truck className="w-5 h-5" />} title="Inside Dhaka" value={`${formatBDT(insideDhaka)}`} sub="24-48 hours" color="bg-blue-50 text-blue-600" />
          <InfoCard icon={<Package className="w-5 h-5" />} title="Outside Dhaka" value={`${formatBDT(outsideDhaka)}`} sub="3-7 days" color="bg-amber-50 text-amber-600" />
          <InfoCard icon={<Bike className="w-5 h-5" />} title="Free Delivery" value={`Above ${formatBDT(freeThreshold)}`} sub="Standard delivery" color="bg-emerald-50 text-emerald-600" />
        </div>
        <article className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8">
          <div className="prose prose-zinc max-w-none">
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">Delivery Areas</h2><p className="text-zinc-700 mb-2 leading-relaxed">LalBazar delivers to all 64 districts of Bangladesh. From the busy streets of Dhaka, Chattogram, and Sylhet to remote upazilas, we ensure your orders reach you wherever you are.</p></section>
            <hr className="my-6 border-zinc-200" />
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">Delivery Charges</h2><p className="text-zinc-700 mb-3 leading-relaxed">Delivery charges are calculated based on your delivery location and order value.</p><div className="rounded-lg border border-zinc-200 overflow-hidden mb-3"><table className="w-full text-sm"><thead className="bg-zinc-50"><tr><th className="text-left px-4 py-2">Location</th><th className="text-left px-4 py-2">Charge</th><th className="text-left px-4 py-2">Time</th></tr></thead><tbody className="divide-y"><tr><td className="px-4 py-2.5">Inside Dhaka</td><td className="px-4 py-2.5 font-semibold text-primary">{formatBDT(insideDhaka)}</td><td className="px-4 py-2.5">24-48 hours</td></tr><tr><td className="px-4 py-2.5">Outside Dhaka</td><td className="px-4 py-2.5 font-semibold text-primary">{formatBDT(outsideDhaka)}</td><td className="px-4 py-2.5">3-7 days</td></tr><tr className="bg-emerald-50/50"><td className="px-4 py-2.5">Free Delivery</td><td className="px-4 py-2.5 font-semibold text-emerald-600">FREE</td><td className="px-4 py-2.5">Above {formatBDT(freeThreshold)}</td></tr></tbody></table></div><p className="text-zinc-700 leading-relaxed">Orders above {formatBDT(freeThreshold)} qualify for free standard delivery. Bulky items may incur additional charges shown at checkout.</p></section>
            <hr className="my-6 border-zinc-200" />
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">Delivery Time</h2><p className="text-zinc-700 mb-2 leading-relaxed">Inside Dhaka: 24-48 hours. Outside Dhaka: 3-7 business days. Business days exclude Fridays and public holidays.</p></section>
            <hr className="my-6 border-zinc-200" />
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">Order Processing</h2><p className="text-zinc-700 mb-2 leading-relaxed">Orders are processed within 2-12 hours of confirmation. Once dispatched, you receive a tracking number via SMS and email.</p></section>
            <hr className="my-6 border-zinc-200" />
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">Order Tracking</h2><p className="text-zinc-700 mb-2 leading-relaxed">Track your order in real time on our Track Order page using your order number. Status updates: Order Placed → Confirmed → Processing → Shipped → Delivered.</p></section>
            <hr className="my-6 border-zinc-200" />
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">Same-Day Delivery</h2><p className="text-zinc-700 mb-2 leading-relaxed">Same-day delivery available for select Dhaka areas for orders placed before 12 PM. May incur additional fee.</p></section>
            <hr className="my-6 border-zinc-200" />
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">International Shipping</h2><div className="rounded-lg bg-amber-50 border border-amber-200 p-4"><div className="font-semibold text-amber-900 text-sm">Not Available</div><p className="text-sm text-amber-800 mt-0.5">Currently, LalBazar does not offer international shipping. We deliver only within Bangladesh.</p></div></section>
            <hr className="my-6 border-zinc-200" />
            <section className="scroll-mt-24"><h2 className="text-xl font-bold text-zinc-900 mb-3">Contact</h2><p className="text-zinc-700 leading-relaxed">Email: delivery@lalbazar.com • Phone: {settings?.phone || "+8809613-000000"}</p></section>
          </div>
          <div className="mt-8 pt-6 border-t flex flex-wrap gap-2 justify-end"><Button variant="outline" onClick={() => navigate("returns")}>Return Policy</Button><Button variant="outline" onClick={() => navigate("order-tracking")}>Track an Order</Button><Button onClick={() => navigate("home")}>Back to Home</Button></div>
        </article>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value, sub, color }: { icon: React.ReactNode; title: string; value: string; sub?: string; color: string }) {
  return (<Card className="py-4"><CardContent className="flex items-center gap-3 px-4"><div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>{icon}</div><div className="min-w-0"><div className="text-xs text-zinc-500 truncate">{title}</div><div className="text-base font-bold text-zinc-900 truncate">{value}</div>{sub && <div className="text-[11px] text-zinc-500 truncate">{sub}</div>}</div></CardContent></Card>);
}
