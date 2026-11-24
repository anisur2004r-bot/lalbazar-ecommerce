import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseImages } from "@/lib/format";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({
      where: { slug },
      include: { category: true, reviews: { include: { user: true }, orderBy: { createdAt: "desc" } } },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const related = await db.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
      take: 8, orderBy: { soldCount: "desc" },
    });
    return NextResponse.json({
      product: {
        ...product, images: parseImages(product.images),
        categoryName: product.category?.name, categorySlug: product.category?.slug,
        reviews: product.reviews.map((r) => ({
          id: r.id, userId: r.userId, userName: r.user?.name || "Anonymous",
          productId: r.productId, rating: r.rating, comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        })),
      },
      related: related.map((p) => ({ ...p, images: parseImages(p.images) })),
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { session, ...data } = body;
    if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const updated = await db.product.update({
      where: { slug },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameBn !== undefined && { nameBn: data.nameBn || null }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc || null }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.brand !== undefined && { brand: data.brand || null }),
        ...(data.sku !== undefined && { sku: data.sku || null }),
        ...(data.unit !== undefined && { unit: data.unit || null }),
        ...(data.regularPrice !== undefined && { regularPrice: Number(data.regularPrice) }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice ? Number(data.salePrice) : null }),
        ...(data.stock !== undefined && { stock: Number(data.stock) }),
        ...(data.weight !== undefined && { weight: data.weight ? Number(data.weight) : null }),
        ...(data.images && { images: JSON.stringify(data.images) }),
        ...(data.tags !== undefined && { tags: data.tags || null }),
        ...(data.isFeatured !== undefined && { isFeatured: !!data.isFeatured }),
        ...(data.isBestSeller !== undefined && { isBestSeller: !!data.isBestSeller }),
        ...(data.isNewArrival !== undefined && { isNewArrival: !!data.isNewArrival }),
        ...(data.isSpecialOffer !== undefined && { isSpecialOffer: !!data.isSpecialOffer }),
        ...(data.isActive !== undefined && { isActive: !!data.isActive }),
      },
    });
    return NextResponse.json({ product: updated });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    if (body?.session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await db.product.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
