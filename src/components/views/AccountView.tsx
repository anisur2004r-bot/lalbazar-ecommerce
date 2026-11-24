"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Order, Address } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutDashboard, Package, Heart, MapPin, User as UserIcon, Lock, LogOut, ChevronDown, ChevronUp, ShoppingBag, Clock, CheckCircle2, Truck, Plus, Pencil, Trash2, Mail, Phone, MapPin as Pin, Star, AlertCircle, ShieldCheck, TrendingUp } from "lucide-react";
import { formatBDT, formatDate, formatDateTime, DISTRICTS, getAreasForDistrict } from "@/lib/format";
import { toast } from "sonner";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Product } from "@/lib/types";

type TabKey = "dashboard" | "orders" | "wishlist" | "addresses" | "profile" | "password";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-500 text-white",
  CONFIRMED: "bg-blue-600 text-white",
  PROCESSING: "bg-blue-600 text-white",
  SHIPPED: "bg-indigo-600 text-white",
  DELIVERED: "bg-emerald-600 text-white",
  CANCELLED: "bg-red-600 text-white",
};

export function AccountView() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const navigate = useStore((s) => s.navigate);
  const wishlist = useStore((s) => s.wishlist);
  const [tab, setTab] = useState<TabKey>("dashboard");

  useEffect(() => {
    if (!user) { toast.error("Please sign in to access your account"); navigate("login"); }
  }, [user, navigate]);

  if (!user) {
    return (<div className="container mx-auto px-4 max-w-md py-16 text-center"><div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4"><AlertCircle className="w-8 h-8 text-amber-600" /></div><h2 className="text-xl font-bold mb-1">Sign in required</h2><p className="text-sm text-zinc-500 mb-4">Please sign in to view your account dashboard.</p><Button onClick={() => navigate("login")}>Sign In</Button></div>);
  }

  const isAdmin = user.role === "ADMIN";
  const handleLogout = async () => { try { await fetch("/api/auth/logout", { method: "POST" }); } catch {} setUser(null); toast.success("You have been signed out"); navigate("home"); };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shrink-0">{user.name.charAt(0).toUpperCase()}</div><div><h1 className="text-xl font-bold text-zinc-900">{user.name}</h1><p className="text-xs text-zinc-500">{user.email} • {user.phone}</p></div></div>
        <div className="flex items-center gap-2">{isAdmin && (<Button variant="outline" size="sm" onClick={() => navigate("admin")}><ShieldCheck className="w-4 h-4" /> Admin Panel</Button>)}<Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /> Logout</Button></div>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
        <div className="lg:hidden"><TabsList className="w-full grid grid-cols-3 h-auto"><TabsTrigger value="dashboard" className="py-2"><LayoutDashboard className="w-4 h-4" /></TabsTrigger><TabsTrigger value="orders" className="py-2"><Package className="w-4 h-4" /></TabsTrigger><TabsTrigger value="wishlist" className="py-2"><Heart className="w-4 h-4" /></TabsTrigger><TabsTrigger value="addresses" className="py-2"><MapPin className="w-4 h-4" /></TabsTrigger><TabsTrigger value="profile" className="py-2"><UserIcon className="w-4 h-4" /></TabsTrigger><TabsTrigger value="password" className="py-2"><Lock className="w-4 h-4" /></TabsTrigger></TabsList></div>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          <aside className="hidden lg:block"><Card className="p-2"><nav className="space-y-1"><SideLink active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" /><SideLink active={tab === "orders"} onClick={() => setTab("orders")} icon={<Package className="w-4 h-4" />} label="My Orders" /><SideLink active={tab === "wishlist"} onClick={() => setTab("wishlist")} icon={<Heart className="w-4 h-4" />} label="My Wishlist" badge={wishlist.length || undefined} /><SideLink active={tab === "addresses"} onClick={() => setTab("addresses")} icon={<MapPin className="w-4 h-4" />} label="Addresses" /><SideLink active={tab === "profile"} onClick={() => setTab("profile")} icon={<UserIcon className="w-4 h-4" />} label="Profile" /><SideLink active={tab === "password"} onClick={() => setTab("password")} icon={<Lock className="w-4 h-4" />} label="Change Password" /><Separator className="my-2" /><button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 transition"><LogOut className="w-4 h-4" /> Logout</button></nav></Card></aside>
          <div className="min-w-0"><TabsContent value="dashboard" className="mt-0"><DashboardTab /></TabsContent><TabsContent value="orders" className="mt-0"><OrdersTab /></TabsContent><TabsContent value="wishlist" className="mt-0"><WishlistTab /></TabsContent><TabsContent value="addresses" className="mt-0"><AddressesTab /></TabsContent><TabsContent value="profile" className="mt-0"><ProfileTab /></TabsContent><TabsContent value="password" className="mt-0"><PasswordTab /></TabsContent></div>
        </div>
      </Tabs>
    </div>
  );
}

function SideLink({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (<button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition ${active ? "bg-primary text-white font-medium" : "text-zinc-700 hover:bg-zinc-100"}`}>{icon} <span className="flex-1 text-left">{label}</span>{badge !== undefined && badge > 0 && (<span className={`text-xs px-1.5 rounded-full ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>{badge}</span>)}</button>);
}

function DashboardTab() {
  const user = useStore((s) => s.user)!;
  const navigate = useStore((s) => s.navigate);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { let cancelled = false; (async () => { try { const res = await fetch("/api/orders"); const data = await res.json(); if (!cancelled) setOrders(data.orders || []); } catch {} finally { if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; }; }, []);

  const stats = useMemo(() => { const total = orders.length; const pending = orders.filter((o) => ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)).length; const completed = orders.filter((o) => o.status === "DELIVERED").length; const totalSpent = orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.total, 0); return { total, pending, completed, totalSpent }; }, [orders]);
  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-4">
      <div><h2 className="text-lg font-semibold text-zinc-900 mb-1">Hello, {user.name.split(" ")[0]}!</h2><p className="text-sm text-zinc-500">Here&apos;s an overview of your account activity.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><StatCard label="Total Orders" value={loading ? "—" : String(stats.total)} icon={<Package className="w-5 h-5" />} color="bg-blue-50 text-blue-600" /><StatCard label="Pending" value={loading ? "—" : String(stats.pending)} icon={<Clock className="w-5 h-5" />} color="bg-amber-50 text-amber-600" /><StatCard label="Completed" value={loading ? "—" : String(stats.completed)} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" /><StatCard label="Total Spent" value={loading ? "—" : formatBDT(stats.totalSpent)} icon={<TrendingUp className="w-5 h-5" />} color="bg-primary/10 text-primary" /></div>
      <Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Recent Orders</CardTitle><Button variant="ghost" size="sm" onClick={() => navigate("account")}>View All</Button></div></CardHeader><CardContent>{loading ? (<div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>) : recent.length === 0 ? (<div className="py-8 text-center text-sm text-zinc-500"><ShoppingBag className="w-8 h-8 mx-auto mb-2 text-zinc-300" />You haven&apos;t placed any orders yet.<div className="mt-3"><Button size="sm" onClick={() => navigate("shop")}>Start Shopping</Button></div></div>) : (<div className="space-y-2">{recent.map((o) => (<div key={o.id} className="flex items-center gap-3 py-2 border-b last:border-0"><div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-zinc-500" /></div><div className="flex-1 min-w-0"><div className="text-sm font-medium text-zinc-900">{o.orderNumber}</div><div className="text-xs text-zinc-500">{formatDate(o.createdAt)} • {o.items.length} items</div></div><div className="text-right"><div className="text-sm font-semibold text-zinc-900">{formatBDT(o.total)}</div><Badge className={STATUS_BADGE[o.status] || "bg-zinc-500 text-white"}>{o.status}</Badge></div></div>))}</div>)}</CardContent></Card>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (<Card className="py-4"><CardContent className="flex items-center gap-3 px-4"><div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>{icon}</div><div className="min-w-0"><div className="text-xs text-zinc-500 truncate">{label}</div><div className="text-lg font-bold text-zinc-900 truncate">{value}</div></div></CardContent></Card>);
}

function OrdersTab() {
  const navigate = useStore((s) => s.navigate);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { let cancelled = false; (async () => { try { const res = await fetch("/api/orders"); const data = await res.json(); if (!cancelled) setOrders(data.orders || []); } catch {} finally { if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; }; }, []);

  if (loading) return (<Card><CardContent className="space-y-2 py-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>);
  if (orders.length === 0) return (<Card className="border-dashed"><CardContent className="py-12 text-center"><Package className="w-10 h-10 mx-auto mb-3 text-zinc-300" /><h3 className="font-semibold mb-1">No orders yet</h3><p className="text-sm text-zinc-500 mb-4">When you place orders, they will appear here.</p><Button onClick={() => navigate("shop")}><ShoppingBag className="w-4 h-4" /> Start Shopping</Button></CardContent></Card>);

  return (<div className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">My Orders ({orders.length})</h2></div>{orders.map((o) => (<Card key={o.id}><CardHeader className="pb-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="font-semibold text-zinc-900">{o.orderNumber}</div><div className="text-xs text-zinc-500">{formatDateTime(o.createdAt)}</div></div><Badge className={STATUS_BADGE[o.status] || "bg-zinc-500 text-white"}>{o.status}</Badge></div></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3 text-sm"><div className="text-zinc-600">{o.items.length} item{o.items.length !== 1 ? "s" : ""} • Total: <span className="font-semibold text-zinc-900">{formatBDT(o.total)}</span></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>{expanded === o.id ? <><ChevronUp className="w-3.5 h-3.5" /> Hide</> : <><ChevronDown className="w-3.5 h-3.5" /> View Details</>}</Button><Button size="sm" variant="ghost" onClick={() => navigate("order-tracking", { orderNumber: o.orderNumber })}><Truck className="w-3.5 h-3.5" /> Track</Button></div></div>{expanded === o.id && (<div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 space-y-2">{o.items.map((it) => (<div key={it.id} className="flex items-center gap-2"><div className="w-9 h-9 rounded bg-white overflow-hidden shrink-0">{it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}</div><div className="text-sm flex-1 min-w-0"><div className="truncate text-zinc-900">{it.name}</div><div className="text-xs text-zinc-500">{it.quantity} × {formatBDT(it.price)}</div></div><div className="text-sm font-medium">{formatBDT(it.subtotal)}</div></div>))}<Separator className="my-1" /><div className="text-xs text-zinc-600 flex justify-between"><span>Shipping: {o.shippingArea}, {o.shippingDistrict}</span><span>Payment: {o.paymentMethod} ({o.paymentStatus})</span></div></div>)}</CardContent></Card>))}</div>);
}

function WishlistTab() {
  const user = useStore((s) => s.user)!;
  const wishlist = useStore((s) => s.wishlist);
  const navigate = useStore((s) => s.navigate);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { let cancelled = false; (async () => { setLoading(true); try { if (user) { const res = await fetch("/api/wishlist"); const data = await res.json(); if (!cancelled) setProducts(data.products || []); } else { const res = await fetch("/api/products?limit=200"); const data = await res.json(); const all: Product[] = data.products || []; if (!cancelled) setProducts(all.filter((p) => wishlist.includes(p.id))); } } catch { if (!cancelled) setProducts([]); } finally { if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; }; }, [user, wishlist]);

  if (loading) return (<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}</div>);
  if (products.length === 0) return (<Card className="border-dashed"><CardContent className="py-12 text-center"><Heart className="w-10 h-10 mx-auto mb-3 text-zinc-300" /><h3 className="font-semibold mb-1">Your wishlist is empty</h3><p className="text-sm text-zinc-500 mb-4">Save products you love by tapping the heart icon.</p><Button onClick={() => navigate("wishlist")}>Browse Wishlist Page</Button></CardContent></Card>);
  return <ProductGrid products={products} cols={4} />;
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = async () => { setLoading(true); try { const res = await fetch("/api/addresses"); const data = await res.json(); setAddresses(data.addresses || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id: string) => { if (!confirm("Delete this address?")) return; try { await fetch(`/api/addresses?id=${id}`, { method: "DELETE" }); toast.success("Address deleted"); refresh(); } catch { toast.error("Failed to delete"); } };

  return (<div className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Saved Addresses ({addresses.length})</h2>{!showForm && (<Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4" /> Add New</Button>)}</div>{loading ? (<Card><CardContent className="space-y-2 py-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</CardContent></Card>) : addresses.length === 0 && !showForm ? (<Card className="border-dashed"><CardContent className="py-10 text-center"><MapPin className="w-10 h-10 mx-auto mb-3 text-zinc-300" /><h3 className="font-semibold mb-1">No saved addresses</h3><p className="text-sm text-zinc-500 mb-4">Add an address to make checkout faster.</p><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Address</Button></CardContent></Card>) : (<>{!showForm && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{addresses.map((a) => (<Card key={a.id} className={a.isDefault ? "border-primary/40" : ""}><CardContent className="py-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-medium text-zinc-900">{a.name}</span>{a.isDefault && <Badge className="bg-primary text-white text-[10px]">Default</Badge>}</div><div className="text-sm text-zinc-600 space-y-0.5"><div className="flex items-start gap-1.5"><Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {a.phone}</div><div className="flex items-start gap-1.5"><Pin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {a.addressLine}</div><div className="pl-5">{a.area}, {a.district}</div>{a.landmark && <div className="pl-5 text-xs text-zinc-500">Landmark: {a.landmark}</div>}</div></div></div><div className="flex gap-2 mt-3 pt-3 border-t"><Button size="sm" variant="outline" onClick={() => { setEditing(a); setShowForm(true); }}><Pencil className="w-3.5 h-3.5" /> Edit</Button><Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button></div></CardContent></Card>))}</div>)}{showForm && (<AddressForm initial={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSaved={() => { setShowForm(false); setEditing(null); refresh(); }} />)}</>)}</div>);
}

function AddressForm({ initial, onCancel, onSaved }: { initial: Address | null; onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [district, setDistrict] = useState(initial?.district || "");
  const [area, setArea] = useState(initial?.area || "");
  const [addressLine, setAddressLine] = useState(initial?.addressLine || "");
  const [landmark, setLandmark] = useState(initial?.landmark || "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false);
  const [saving, setSaving] = useState(false);
  const areas = district ? getAreasForDistrict(district) : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !district || !area || !addressLine) { toast.error("Please fill all required fields"); return; }
    if (!/^01\d{9}$/.test(phone)) { toast.error("Phone must be 11 digits starting with 01"); return; }
    setSaving(true);
    try {
      const method = initial ? "PUT" : "POST";
      const url = initial ? `/api/addresses?id=${initial.id}` : "/api/addresses";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, district, area, addressLine, landmark, isDefault }) });
      if (!res.ok) { const data = await res.json(); toast.error(data.error || "Failed to save address"); return; }
      toast.success(initial ? "Address updated" : "Address added");
      onSaved();
    } catch { toast.error("Failed to save address"); } finally { setSaving(false); }
  };

  return (<Card><CardHeader><CardTitle className="text-base">{initial ? "Edit Address" : "Add New Address"}</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-3"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Full Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipient name" required /></div><div className="space-y-1.5"><Label>Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" maxLength={11} required /></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="space-y-1.5"><Label>District *</Label><Select value={district} onValueChange={(v) => { setDistrict(v); setArea(""); }}><SelectTrigger className="w-full"><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label>Area *</Label><Select value={area} onValueChange={setArea} disabled={!district}><SelectTrigger className="w-full"><SelectValue placeholder="Select area" /></SelectTrigger><SelectContent>{areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div></div><div className="space-y-1.5"><Label>Address Line *</Label><Textarea value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="House #, Road #, Block" required /></div><div className="space-y-1.5"><Label>Landmark (optional)</Label><Input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near mosque, school etc." /></div><div className="flex items-center gap-2"><Checkbox id="default" checked={isDefault} onCheckedChange={(v) => setIsDefault(Boolean(v))} /><Label htmlFor="default">Set as default address</Label></div><div className="flex gap-2 pt-2"><Button type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Update Address" : "Save Address"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div></form></CardContent></Card>);
}

function ProfileTab() {
  const user = useStore((s) => s.user)!;
  const setUser = useStore((s) => s.setUser);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email] = useState(user.email);
  const [saving, setSaving] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    if (!/^01\d{9}$/.test(phone)) { toast.error("Phone must be 11 digits starting with 01"); return; }
    setSaving(true);
    setTimeout(() => { setUser({ ...user, name, phone }); toast.success("Profile updated (local). Server-side profile update requires an additional endpoint."); setSaving(false); }, 400);
  };

  return (<Card><CardHeader><CardTitle className="text-base">Profile Information</CardTitle><CardDescription className="text-sm">Update your personal details.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-3 max-w-md"><div className="space-y-1.5"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div><div className="space-y-1.5"><Label>Email Address</Label><Input value={email} disabled className="bg-zinc-50 text-zinc-500" /><p className="text-[11px] text-zinc-500">Email cannot be changed.</p></div><div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={11} /></div><div className="flex items-center gap-2 text-xs text-zinc-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5"><Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />Profile updates are saved locally for this demo. Server-side profile update requires an additional API endpoint.</div><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button></form></CardContent></Card>);
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) { toast.error("Please fill all fields"); return; }
    if (next.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (next !== confirm) { toast.error("Passwords do not match"); return; }
    setSaving(true);
    setTimeout(() => { toast.info("Password change endpoint requires server-side implementation. Please contact support for now."); setSaving(false); setCurrent(""); setNext(""); setConfirm(""); }, 500);
  };

  return (<Card><CardHeader><CardTitle className="text-base">Change Password</CardTitle><CardDescription className="text-sm">Update your account password regularly for security.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-3 max-w-md"><div className="space-y-1.5"><Label>Current Password</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required /></div><div className="space-y-1.5"><Label>New Password</Label><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required /><p className="text-[11px] text-zinc-500">Min 6 characters.</p></div><div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required /></div><div className="flex items-center gap-2 text-xs text-zinc-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5"><Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />Password change requires server-side implementation. Please contact support to update your password.</div><Button type="submit" disabled={saving}>{saving ? "Updating…" : "Update Password"}</Button></form></CardContent></Card>);
}
