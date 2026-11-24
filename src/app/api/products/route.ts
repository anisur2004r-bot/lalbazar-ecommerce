import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseImages } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const featured = searchParams.get("featured");
    const bestSeller = searchParams.get("bestSeller");
    const newArrival = searchParams.get("newArrival");
    const specialOffer = searchParams.get("specialOffer");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popular";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brand = searchParams.get("brand");
    const inStock = searchParams.get("inStock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const adminView = searchParams.get("admin") === "true";

    const where: any = {};
    if (!adminView) where.isActive = true;
    if (category) {
      const cat = await db.category.findUnique({ where: { slug: category }, include: { children: true } });
      if (cat) {
        const catIds = [cat.id, ...cat.children.map((c) => c.id)];
        if (subcategory && subcategory !== category) {
          const sub = await db.category.findUnique({ where: { slug: subcategory } });
          if (sub) where.categoryId = sub.id;
          else where.categoryId = { in: catIds };
        } else {
          where.categoryId = { in: catIds };
        }
      }
    }
    if (featured === "true") where.isFeatured = true;
    if (bestSeller === "true") where.isBestSeller = true;
    if (newArrival === "true") where.isNewArrival = true;
    if (specialOffer === "true") where.isSpecialOffer = true;
    if (brand) where.brand = brand;
    if (inStock === "true") where.stock = { gt: 0 };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameBn: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { brand: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      where.OR = [
        { AND: [{ salePrice: { gte: Number(minPrice) || 0 } }, { salePrice: { lte: Number(maxPrice) || 9999999 } }] },
        { AND: [{ salePrice: null }, { regularPrice: { gte: Number(minPrice) || 0 } }, { regularPrice: { lte: Number(maxPrice) || 9999999 } }] },
      ];
    }

    const orderBy: any = {};
    if (sort === "popular") orderBy.soldCount = "desc";
    else if (sort === "price-low") orderBy.regularPrice = "asc";
    else if (sort === "price-high") orderBy.regularPrice = "desc";
    else if (sort === "newest") orderBy.createdAt = "desc";
    else if (sort === "rating") orderBy.rating = "desc";

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { category: true } }),
    ]);

    const result = products.map((p) => ({
      ...p, images: parseImages(p.images),
      categoryName: p.category?.name, categorySlug: p.category?.slug, category: undefined,
    }));

    return NextResponse.json({ products: result, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    console.error("GET /api/products error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session, ...data } = body;
    if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const created = await db.product.create({
      data: {
        name: data.name, nameBn: data.nameBn || null,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description: data.description || "", shortDesc: data.shortDesc || null,
        categoryId: data.categoryId, brand: data.brand || null, sku: data.sku || null, unit: data.unit || null,
        regularPrice: Number(data.regularPrice), salePrice: data.salePrice ? Number(data.salePrice) : null,
        stock: Number(data.stock || 0), weight: data.weight ? Number(data.weight) : null,
        images: JSON.stringify(data.images || []), tags: data.tags || null,
        isFeatured: !!data.isFeatured, isBestSeller: !!data.isBestSeller,
        isNewArrival: !!data.isNewArrival, isSpecialOffer: !!data.isSpecialOffer,
        isActive: data.isActive !== false,
      },
    });
    return NextResponse.json({ product: created });
  } catch (e: any) {
    console.error("POST /api/products error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
