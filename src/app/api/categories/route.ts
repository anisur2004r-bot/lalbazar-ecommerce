import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (e: any) {
    console.error("GET /api/categories error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const created = await db.category.create({
      data: {
        name: body.name,
        nameBn: body.nameBn || null,
        slug,
        icon: body.icon || null,
        image: body.image || null,
        parentId: body.parentId || null,
        featured: !!body.featured,
      },
    });
    return NextResponse.json({ category: created });
  } catch (e: any) {
    console.error("POST /api/categories error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
