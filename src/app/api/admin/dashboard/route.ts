import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const [totalOrders, totalProducts, totalCustomers, pendingOrders, completedOrders, banners, coupons] = await Promise.all([
      db.order.count(), db.product.count(), db.user.count({ where: { role: "CUSTOMER" } }),
      db.order.count({ where: { status: "PENDING" } }), db.order.count({ where: { status: "DELIVERED" } }),
      db.banner.count(), db.coupon.count(),
    ]);
    const revenueResult = await db.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } });
    const totalRevenue = revenueResult._sum.total || 0;
    const recentOrders = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: true } });
    const topProducts = await db.product.findMany({ orderBy: { soldCount: "desc" }, take: 5 });
    const now = new Date();
    const months: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const [rev, ord] = await Promise.all([
        db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: start, lt: end } } }),
        db.order.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);
      months.push({ label: start.toLocaleString("en", { month: "short" }), revenue: rev._sum.total || 0, orders: ord });
    }
    const statusCounts = await db.order.groupBy({ by: ["status"], _count: true });
    return NextResponse.json({ stats: { totalOrders, totalProducts, totalCustomers, pendingOrders, completedOrders, totalRevenue, banners, coupons }, recentOrders, topProducts, months, statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count })) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
