import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const { productId, rating, comment } = await req.json();
    if (!productId || !rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    const existing = await db.review.findFirst({ where: { userId: user.id, productId } });
    if (existing) await db.review.update({ where: { id: existing.id }, data: { rating, comment } });
    else await db.review.create({ data: { userId: user.id, productId, rating, comment } });
    const reviews = await db.review.findMany({ where: { productId } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await db.product.update({ where: { id: productId }, data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
