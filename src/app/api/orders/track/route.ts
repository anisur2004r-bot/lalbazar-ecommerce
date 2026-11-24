import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");
    const phone = searchParams.get("phone");
    if (!orderNumber) return NextResponse.json({ error: "Order number required" }, { status: 400 });
    const order = await db.order.findFirst({ where: { orderNumber: orderNumber.toUpperCase(), ...(phone ? { customerPhone: phone } : {}) }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
