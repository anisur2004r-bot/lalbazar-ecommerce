import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseImages } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) return NextResponse.json({ products: [] });
    const items = await db.wishlist.findMany({
      where: { userId: user.id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    const products = items.map((i) => ({
      ...i.product,
      images: parseImages(i.product.images),
      categoryName: i.product.category?.name,
      categorySlug: i.product.category?.slug,
    }));
    return NextResponse.json({ products });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const { productId } = await req.json();
    const existing = await db.wishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });
    if (existing) {
      await db.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false });
    }
    await db.wishlist.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ added: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
