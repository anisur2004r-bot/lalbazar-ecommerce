import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.settings.findUnique({ where: { id: "settings" } });
    return NextResponse.json({ settings });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { session, ...data } = body;
    const settings = await db.settings.upsert({
      where: { id: "settings" },
      update: {
        ...(data.siteName && { siteName: data.siteName }),
        ...(data.tagline !== undefined && { tagline: data.tagline || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.facebook !== undefined && { facebook: data.facebook || null }),
        ...(data.instagram !== undefined && { instagram: data.instagram || null }),
        ...(data.youtube !== undefined && { youtube: data.youtube || null }),
        ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp || null }),
        ...(data.insideDhakaCharge !== undefined && { insideDhakaCharge: Number(data.insideDhakaCharge) }),
        ...(data.outsideDhakaCharge !== undefined && { outsideDhakaCharge: Number(data.outsideDhakaCharge) }),
        ...(data.freeDeliveryThreshold !== undefined && { freeDeliveryThreshold: Number(data.freeDeliveryThreshold) }),
        ...(data.bkashNumber !== undefined && { bkashNumber: data.bkashNumber || null }),
        ...(data.nagadNumber !== undefined && { nagadNumber: data.nagadNumber || null }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle || null }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
      },
      create: { id: "settings", siteName: data.siteName || "LalBazar" },
    });
    return NextResponse.json({ settings });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
