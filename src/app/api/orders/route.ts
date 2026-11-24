import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    if (role === "ADMIN" && user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const where = user.role === "ADMIN" && role === "ADMIN" ? {} : { userId: user.id };
    const orders = await db.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ orders });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession(req);
    const body = await req.json();
    const { items, customer, shipping, paymentMethod, couponCode, notes, addressId } = body;
    if (!items || items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.district || !shipping.area) return NextResponse.json({ error: "Shipping address is incomplete" }, { status: 400 });
    if (!paymentMethod) return NextResponse.json({ error: "Payment method required" }, { status: 400 });

    let subtotal = 0;
    const orderItemsData: any[] = [];
    for (const item of items) {
      const p = await db.product.findUnique({ where: { id: item.productId } });
      if (!p) continue;
      const price = p.salePrice ?? p.regularPrice;
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      orderItemsData.push({ productId: p.id, name: p.name, image: JSON.parse(p.images)[0] || "", price, quantity: item.quantity, unit: item.unit || p.unit || null, subtotal: lineTotal });
      await db.product.update({ where: { id: p.id }, data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } } });
    }
    if (orderItemsData.length === 0) return NextResponse.json({ error: "No valid products" }, { status: 400 });

    const isInsideDhaka = shipping.district === "Dhaka";
    const settings = await db.settings.findUnique({ where: { id: "settings" } });
    const inside = settings?.insideDhakaCharge ?? 60;
    const outside = settings?.outsideDhakaCharge ?? 120;
    const freeThreshold = settings?.freeDeliveryThreshold ?? 2000;
    const deliveryCharge = subtotal >= freeThreshold ? 0 : (isInsideDhaka ? inside : outside);

    let discount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && new Date() >= coupon.startDate && new Date() <= coupon.endDate && subtotal >= coupon.minOrder && (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit)) {
        if (coupon.type === "PERCENTAGE") discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount ?? Infinity);
        else discount = coupon.value;
        appliedCouponCode = coupon.code;
        await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const total = Math.max(0, subtotal - discount) + deliveryCharge;
    const orderNumber = generateOrderNumber();
    const order = await db.order.create({
      data: { orderNumber, userId: user?.id || null, customerName: shipping.name, customerPhone: shipping.phone, customerEmail: customer.email || null, addressId: addressId || null, shippingName: shipping.name, shippingPhone: shipping.phone, shippingAddress: shipping.address, shippingDistrict: shipping.district, shippingArea: shipping.area, shippingLandmark: shipping.landmark || null, subtotal, discount, deliveryCharge, total, paymentMethod, paymentStatus: "UNPAID", couponCode: appliedCouponCode, notes: notes || null, status: "PENDING", items: { create: orderItemsData } },
      include: { items: true },
    });
    return NextResponse.json({ order });
  } catch (e: any) { console.error("POST /api/orders error:", e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}
