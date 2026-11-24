import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json({ addresses });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const body = await req.json();
    if (body.isDefault) await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    const address = await db.address.create({ data: { userId: user.id, name: body.name, phone: body.phone, district: body.district, area: body.area, addressLine: body.addressLine, landmark: body.landmark || null, isDefault: !!body.isDefault } });
    return NextResponse.json({ address });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
