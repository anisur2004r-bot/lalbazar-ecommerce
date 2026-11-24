import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) return NextResponse.json({ valid: false, error: "Invalid or inactive coupon" });
    if (new Date() < coupon.startDate || new Date() > coupon.endDate) return NextResponse.json({ valid: false, error: "Coupon expired" });
    if (subtotal < coupon.minOrder) return NextResponse.json({ valid: false, error: `Minimum order ৳${coupon.minOrder} required` });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ valid: false, error: "Coupon usage limit reached" });

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount ?? Infinity);
    } else {
      discount = coupon.value;
    }
    return NextResponse.json({ valid: true, discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
