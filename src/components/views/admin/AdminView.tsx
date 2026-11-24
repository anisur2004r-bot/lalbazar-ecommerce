"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Product, Category, Order, Coupon, Banner, Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT, formatDateTime, formatDate, parseImages } from "@/lib/format";
import { LayoutDashboard, Package, ShoppingCart, Users, Image as ImageIcon, Ticket, Settings as SettingsIcon, FolderTree, Plus, Edit, Trash2, Eye, Search, Menu, LogOut, TrendingUp, DollarSign, ShoppingBag, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
};

export function AdminView() {
  const user = useStore((s) => s.user);
  const navigate = useStore((s) => s.navigate);
  const setUser = useStore((s) => s.setUser);
  const [tab, setTab] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      toast.error("Admin access required");
      navigate("login");
    }
  }, [user, navigate]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-zinc-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "banners", label: "Banners", icon: ImageIcon },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const NavContent = () => (
    <div className="space-y-1">
      <div className="px-3 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">L</div>
          <div>
            <div className="font-bold text-white text-sm">LalBazar Admin</div>
            <div className="text-[10px] text-zinc-400">{user.name}</div>
          </div>
        </div>
      </div>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => { setTab(item.id); setMobileNav(false); }}
          className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition ${tab === item.id ? "bg-primary text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
        >
          <item.icon className="w-4 h-4" /> {item.label}
        </button>
      ))}
      <Separator className="my-2 bg-zinc-800" />
      <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); navigate("home"); toast.success("Logged out"); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-zinc-300 hover:bg-zinc-800">
        <LogOut className="w-4 h-4" /> Logout
      </button>
      <button onClick={() => navigate("home")} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-zinc-300 hover:bg-zinc-800">
        <ArrowUpRight className="w-4 h-4" /> View Store
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex">
      <aside className="hidden lg:flex w-64 bg-zinc-900 flex-col h-screen sticky top-0">
        <NavContent />
      </aside>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-3 left-3 z-50 bg-zinc-900 text-white border-zinc-700">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-zinc-900">
          <NavContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {tab === "dashboard" && <Dashboard />}
          {tab === "products" && <ProductsAdmin />}
          {tab === "orders" && <OrdersAdmin />}
          {tab === "customers" && <CustomersAdmin />}
          {tab === "categories" && <CategoriesAdmin />}
          {tab === "banners" && <BannersAdmin />}
          {tab === "coupons" && <CouponsAdmin />}
          {tab === "settings" && <SettingsAdmin />}
        </div>
      </main>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/dashboard").then((r) => r.json()).then(setData); }, []);
  if (!data) return <SkeletonLoader />;
  const { stats, recentOrders, topProducts, months, statusCounts } = data;
  const maxRevenue = Math.max(...months.map((m: any) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-sm text-zinc-500">Welcome back to LalBazar admin panel</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatBDT(stats.totalRevenue)} icon={DollarSign} trend="+12.5%" color="bg-emerald-500" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} trend={`${stats.pendingOrders} pending`} color="bg-blue-500" />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} trend="+8.2%" color="bg-purple-500" />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} trend={`${stats.completedOrders} delivered`} color="bg-amber-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Revenue (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {months.map((m: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-zinc-100 rounded-t relative flex items-end" style={{ height: "100%" }}>
                    <div className="w-full bg-gradient-to-t from-primary to-rose-400 rounded-t transition-all hover:opacity-80" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: m.revenue > 0 ? "8px" : "0" }} title={formatBDT(m.revenue)} />
                  </div>
                  <div className="text-xs text-zinc-600 font-medium">{m.label}</div>
                  <div className="text-[10px] text-zinc-500">{formatBDT(m.revenue)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statusCounts.map((s: any) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <Badge className={STATUS_COLORS[s.status] || "bg-zinc-100"} variant="secondary">{s.status}</Badge>
                  <span className="font-medium">{s.count}</span>
                </div>
              ))}
              {statusCounts.length === 0 && <div className="text-sm text-zinc-500 text-center py-4">No orders yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentOrders.slice(0, 6).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                  <div><div className="text-sm font-medium">{o.orderNumber}</div><div className="text-xs text-zinc-500">{o.customerName} • {formatDate(o.createdAt)}</div></div>
                  <div className="text-right"><div className="text-sm font-semibold">{formatBDT(o.total)}</div><Badge className={STATUS_COLORS[o.status]} variant="secondary">{o.status}</Badge></div>
                </div>
              ))}
              {recentOrders.length === 0 && <div className="text-sm text-zinc-500 text-center py-4">No orders yet</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top Selling Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProducts.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                  <div className="w-6 text-zinc-400 font-bold">{i + 1}</div>
                  <img src={parseImages(p.images)[0]} alt="" className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium line-clamp-1">{p.name}</div><div className="text-xs text-zinc-500">{p.soldCount} sold</div></div>
                  <div className="text-sm font-semibold text-primary">{formatBDT(p.salePrice ?? p.regularPrice)}</div>
                </div>
              ))}
              {topProducts.length === 0 && <div className="text-sm text-zinc-500 text-center py-4">No sales yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <div className="text-xs text-zinc-500 mb-1">{title}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-zinc-500 mt-1">{trend}</div>
    </CardContent></Card>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      <Skeleton className="h-64" />
    </div>
  );
}

function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/products?admin=true&limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`).then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])); load(); }, []);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${slug}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session: { role: "ADMIN" } }) });
    if (res.ok) { toast.success("Product deleted"); load(); } else toast.error("Delete failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Products</h1><p className="text-sm text-zinc-500">{products.length} products</p></div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10" /></TableCell></TableRow>) :
                products.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell><div className="flex items-center gap-2"><img src={parseImages(p.images)[0]} alt="" className="w-10 h-10 rounded object-cover" /><div className="min-w-0"><div className="text-sm font-medium line-clamp-1">{p.name}</div><div className="text-xs text-zinc-500">{p.sku}</div></div></div></TableCell>
                    <TableCell className="text-sm">{p.categoryName || "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{formatBDT(p.salePrice ?? p.regularPrice)}</TableCell>
                    <TableCell><Badge variant={p.stock > 10 ? "secondary" : p.stock > 0 ? "outline" : "destructive"}>{p.stock}</Badge></TableCell>
                    <TableCell><Badge variant={p.isActive ? "secondary" : "outline"}>{p.isActive ? "Active" : "Hidden"}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => { setEditing(p); setDialogOpen(true); }}><Edit className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={() => handleDelete(p.slug)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ProductEditor open={dialogOpen} onOpenChange={setDialogOpen} product={editing} categories={categories} onSaved={() => { setDialogOpen(false); load(); }} />
    </div>
  );
}

function ProductEditor({ open, onOpenChange, product, categories, onSaved }: any) {
  const [form, setForm] = useState<any>(product || {});
  useEffect(() => { setForm(product ? { ...product, images: parseImages(product.images).join("\n") } : {}); }, [product]);
  const flatCats = useMemo(() => {
    const out: { id: string; name: string }[] = [];
    categories.forEach((c: Category) => { out.push({ id: c.id, name: c.name }); c.children?.forEach((sub) => out.push({ id: sub.id, name: `${c.name} → ${sub.name}` })); });
    return out;
  }, [categories]);

  const submit = async () => {
    if (!form.name || !form.categoryId || !form.regularPrice) return toast.error("Name, category and price are required");
    const isEdit = !!product;
    const url = isEdit ? `/api/products/${product.slug}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";
    const body: any = { ...form, session: { role: "ADMIN" }, images: typeof form.images === "string" ? form.images.split("\n").filter(Boolean) : form.images };
    if (!isEdit) body.slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast.success(isEdit ? "Product updated" : "Product created"); onSaved(); }
    else { const e = await res.json(); toast.error(e.error || "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Bengali Name</Label><Input value={form.nameBn || ""} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className="font-bengali" /></div>
          <div><Label>Brand</Label><Input value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
          <div><Label>Category *</Label><Select value={form.categoryId || ""} onValueChange={(v) => setForm({ ...form, categoryId: v })}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{flatCats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Unit</Label><Input value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="1 kg, 500 g..." /></div>
          <div><Label>Regular Price *</Label><Input type="number" value={form.regularPrice || ""} onChange={(e) => setForm({ ...form, regularPrice: Number(e.target.value) })} /></div>
          <div><Label>Sale Price</Label><Input type="number" value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} /></div>
          <div><Label>Stock</Label><Input type="number" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
          <div><Label>SKU</Label><Input value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div className="col-span-2"><Label>Description</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div className="col-span-2"><Label>Image URLs (one per line)</Label><Textarea value={typeof form.images === "string" ? form.images : ""} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3} placeholder="https://..." /></div>
          <div className="col-span-2"><Label>Tags (comma separated)</Label><Input value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <label className="flex items-center gap-2"><Checkbox checked={!!form.isFeatured} onCheckedChange={(c) => setForm({ ...form, isFeatured: !!c })} /> Featured</label>
            <label className="flex items-center gap-2"><Checkbox checked={!!form.isBestSeller} onCheckedChange={(c) => setForm({ ...form, isBestSeller: !!c })} /> Best Seller</label>
            <label className="flex items-center gap-2"><Checkbox checked={!!form.isNewArrival} onCheckedChange={(c) => setForm({ ...form, isNewArrival: !!c })} /> New Arrival</label>
            <label className="flex items-center gap-2"><Checkbox checked={!!form.isSpecialOffer} onCheckedChange={(c) => setForm({ ...form, isSpecialOffer: !!c })} /> Special Offer</label>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit}>{product ? "Update" : "Create"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("ALL");

  const load = () => { setLoading(true); fetch("/api/orders?role=ADMIN").then((r) => r.json()).then((d) => setOrders(d.orders || [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) { toast.success(`Order marked as ${status}`); load(); if (selected?.id === id) { const d = await res.json(); setSelected(d.order); } }
    else toast.error("Update failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Orders</h1><p className="text-sm text-zinc-500">{orders.length} total orders</p></div>
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Orders</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="CONFIRMED">Confirmed</SelectItem><SelectItem value="PROCESSING">Processing</SelectItem><SelectItem value="SHIPPED">Shipped</SelectItem><SelectItem value="DELIVERED">Delivered</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent></Select>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10" /></TableCell></TableRow>) :
                filtered.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                    <TableCell><div className="text-sm font-medium">{o.customerName}</div><div className="text-xs text-zinc-500">{o.customerPhone}</div></TableCell>
                    <TableCell className="text-xs">{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="text-sm">{o.items?.length || 0}</TableCell>
                    <TableCell className="font-semibold">{formatBDT(o.total)}</TableCell>
                    <TableCell><div className="text-xs">{o.paymentMethod}</div><div className="text-[10px] text-zinc-500">{o.paymentStatus}</div></TableCell>
                    <TableCell><Badge className={STATUS_COLORS[o.status]} variant="secondary">{o.status}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => setSelected(o)}><Eye className="w-3 h-3 mr-1" /> View</Button></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle>Order {selected.orderNumber}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-zinc-500">Customer</div><div className="font-medium">{selected.customerName}</div><div className="text-xs">{selected.customerPhone}</div></div>
                <div><div className="text-xs text-zinc-500">Date</div><div>{formatDateTime(selected.createdAt)}</div></div>
                <div className="col-span-2"><div className="text-xs text-zinc-500">Shipping Address</div><div>{selected.shippingAddress}, {selected.shippingArea}, {selected.shippingDistrict}</div></div>
              </div>
              <Separator />
              <div className="space-y-2">
                {selected.items?.map((it: any) => (
                  <div key={it.id} className="flex gap-2 items-center"><img src={it.image} alt="" className="w-10 h-10 rounded object-cover" /><div className="flex-1 text-sm">{it.name} <span className="text-xs text-zinc-500">× {it.quantity}</span></div><div className="font-semibold text-sm">{formatBDT(it.subtotal)}</div></div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatBDT(selected.discount)}</span></div>}
                <div className="flex justify-between"><span>Delivery</span><span>{formatBDT(selected.deliveryCharge)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatBDT(selected.total)}</span></div>
              </div>
              <Separator />
              <div>
                <Label>Update Order Status</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                    <Button key={s} size="sm" variant={selected.status === s ? "default" : "outline"} disabled={selected.status === s} onClick={() => updateStatus(selected.id, s)}>{s}</Button>
                  ))}
                </div>
                {selected.trackingNumber && <div className="mt-3 text-xs text-zinc-600">Tracking: <span className="font-mono">{selected.trackingNumber}</span></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomersAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers || [])).finally(() => setLoading(false)); }, []);
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold">Customers</h1><p className="text-sm text-zinc-500">{customers.length} registered customers</p></div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Orders</TableHead><TableHead>Total Spent</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? Array(3).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10" /></TableCell></TableRow>) :
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell className="text-sm">{c.phone}</TableCell>
                    <TableCell className="text-sm">{c.orders?.length || 0}</TableCell>
                    <TableCell className="font-semibold">{formatBDT(c.orders?.reduce((s: number, o: any) => s + o.total, 0) || 0)}</TableCell>
                    <TableCell className="text-xs">{formatDate(c.createdAt)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", nameBn: "", icon: "", parentId: "", featured: false });
  useEffect(() => { fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])); }, []);
  const submit = async () => {
    if (!form.name) return toast.error("Name required");
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, session: { role: "ADMIN" } }) });
    if (res.ok) { toast.success("Category added"); setForm({ name: "", nameBn: "", icon: "", parentId: "", featured: false }); fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])); }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <Card><CardHeader><CardTitle className="text-base">Add New Category</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Bengali Name</Label><Input value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className="font-bengali" /></div>
          <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🛒" /></div>
          <div><Label>Parent</Label><Select value={form.parentId} onValueChange={(v) => setForm({ ...form, parentId: v })}><SelectTrigger><SelectValue placeholder="None (top level)" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          <label className="flex items-center gap-2 col-span-2"><Checkbox checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: !!c })} /> Featured (shown on homepage)</label>
          <Button onClick={submit} className="col-span-2"><Plus className="w-4 h-4 mr-1" /> Add Category</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="border-b border-zinc-100 pb-3 last:border-0">
              <div className="flex items-center gap-2"><span className="text-xl">{c.icon}</span><span className="font-medium">{c.name}</span>{c.featured && <Badge variant="secondary">Featured</Badge>}{c.nameBn && <span className="text-xs text-zinc-500 font-bengali">{c.nameBn}</span>}</div>
              {c.children && c.children.length > 0 && (<div className="ml-7 mt-1 flex flex-wrap gap-1">{c.children.map((sub) => <Badge key={sub.id} variant="outline" className="text-[10px]">{sub.name}</Badge>)}</div>)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "", buttonText: "Shop Now", position: "HERO", order: 1 });
  useEffect(() => { fetch("/api/banners").then((r) => r.json()).then((d) => setBanners(d.banners || [])); }, []);
  const submit = async () => {
    if (!form.title || !form.image) return toast.error("Title and image required");
    const res = await fetch("/api/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, session: { role: "ADMIN" } }) });
    if (res.ok) { toast.success("Banner added"); setForm({ title: "", subtitle: "", image: "", link: "", buttonText: "Shop Now", position: "HERO", order: 1 }); fetch("/api/banners").then((r) => r.json()).then((d) => setBanners(d.banners || [])); }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Banners</h1>
      <Card><CardHeader><CardTitle className="text-base">Add Banner</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
            <div className="col-span-2"><Label>Image URL *</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Link (e.g. shop?category=grocery)</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
            <div><Label>Button Text</Label><Input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} /></div>
            <div><Label>Position</Label><Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="HERO">Hero</SelectItem><SelectItem value="MIDDLE">Middle</SelectItem><SelectItem value="SIDEBAR">Sidebar</SelectItem></SelectContent></Select></div>
            <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
          </div>
          <Button onClick={submit}><Plus className="w-4 h-4 mr-1" /> Add Banner</Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {banners.map((b) => (
          <Card key={b.id}>
            <div className="aspect-[3/1] bg-zinc-100 rounded-t-lg overflow-hidden"><img src={b.image} alt={b.title} className="w-full h-full object-cover" /></div>
            <CardContent className="p-3"><div className="font-medium text-sm">{b.title}</div><div className="text-xs text-zinc-500">{b.subtitle}</div><div className="flex items-center justify-between mt-2"><Badge variant="secondary">{b.position}</Badge><span className="text-xs text-zinc-500">Order: {b.order}</span></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: 10, minOrder: 0, maxDiscount: 0, usageLimit: 100, startDate: new Date().toISOString().slice(0, 10), endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), isActive: true });
  useEffect(() => { fetch("/api/admin/coupons").then((r) => r.json()).then((d) => setCoupons(d.coupons || [])); }, []);
  const submit = async () => {
    if (!form.code) return toast.error("Code required");
    const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, session: { role: "ADMIN" } }) });
    if (res.ok) { toast.success("Coupon created"); fetch("/api/admin/coupons").then((r) => r.json()).then((d) => setCoupons(d.coupons || [])); }
    else { const e = await res.json(); toast.error(e.error); }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <Card><CardHeader><CardTitle className="text-base">Create Coupon</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="uppercase" /></div>
          <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Percentage</SelectItem><SelectItem value="FIXED">Fixed Amount</SelectItem></SelectContent></Select></div>
          <div><Label>Value</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
          <div><Label>Min Order</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} /></div>
          <div><Label>Max Discount</Label><Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} /></div>
          <div><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} /></div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
          <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          <div className="flex items-end"><Button onClick={submit} className="w-full"><Plus className="w-4 h-4 mr-1" /> Create</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Min Order</TableHead><TableHead>Used</TableHead><TableHead>Status</TableHead><TableHead>Ends</TableHead></TableRow></TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-bold">{c.code}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.type === "PERCENTAGE" ? `${c.value}%` : formatBDT(c.value)}</TableCell>
                  <TableCell>{formatBDT(c.minOrder)}</TableCell>
                  <TableCell>{c.usedCount}/{c.usageLimit ?? "∞"}</TableCell>
                  <TableCell><Badge variant={c.isActive ? "secondary" : "outline"}>{c.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-xs">{formatDate(c.endDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsAdmin() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { fetch("/api/settings").then((r) => r.json()).then((d) => setS(d.settings)); }, []);
  if (!s) return <SkeletonLoader />;
  const save = async () => {
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...s, session: { role: "ADMIN" } }) });
    if (res.ok) toast.success("Settings saved");
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card><CardHeader><CardTitle className="text-base">Store Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div><Label>Site Name</Label><Input value={s.siteName || ""} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></div>
          <div><Label>Tagline</Label><Input value={s.tagline || ""} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={s.phone || ""} onChange={(e) => setS({ ...s, phone: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={s.email || ""} onChange={(e) => setS({ ...s, email: e.target.value })} /></div>
          <div className="col-span-2"><Label>Address</Label><Input value={s.address || ""} onChange={(e) => setS({ ...s, address: e.target.value })} /></div>
          <div><Label>Facebook</Label><Input value={s.facebook || ""} onChange={(e) => setS({ ...s, facebook: e.target.value })} /></div>
          <div><Label>Instagram</Label><Input value={s.instagram || ""} onChange={(e) => setS({ ...s, instagram: e.target.value })} /></div>
          <div><Label>YouTube</Label><Input value={s.youtube || ""} onChange={(e) => setS({ ...s, youtube: e.target.value })} /></div>
          <div><Label>WhatsApp</Label><Input value={s.whatsapp || ""} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} /></div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="text-base">Delivery Charges</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div><Label>Inside Dhaka (৳)</Label><Input type="number" value={s.insideDhakaCharge || 0} onChange={(e) => setS({ ...s, insideDhakaCharge: Number(e.target.value) })} /></div>
          <div><Label>Outside Dhaka (৳)</Label><Input type="number" value={s.outsideDhakaCharge || 0} onChange={(e) => setS({ ...s, outsideDhakaCharge: Number(e.target.value) })} /></div>
          <div><Label>Free Delivery Above (৳)</Label><Input type="number" value={s.freeDeliveryThreshold || 0} onChange={(e) => setS({ ...s, freeDeliveryThreshold: Number(e.target.value) })} /></div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="text-base">Payment Numbers</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div><Label>bKash Number</Label><Input value={s.bkashNumber || ""} onChange={(e) => setS({ ...s, bkashNumber: e.target.value })} /></div>
          <div><Label>Nagad Number</Label><Input value={s.nagadNumber || ""} onChange={(e) => setS({ ...s, nagadNumber: e.target.value })} /></div>
        </CardContent>
      </Card>
      <Button onClick={save} size="lg">Save Settings</Button>
    </div>
  );
}
