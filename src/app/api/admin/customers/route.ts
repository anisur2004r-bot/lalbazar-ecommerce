import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const customers = await db.user.findMany({ where: { role: "CUSTOMER" }, orderBy: { createdAt: "desc" }, include: { orders: { select: { id: true, total: true, status: true } } } });
    return NextResponse.json({ customers });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
