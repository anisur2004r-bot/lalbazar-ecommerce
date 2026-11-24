import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSession(req);
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user?.role === "ADMIN" || order.userId === user?.id || order.userId === null) {
      return NextResponse.json({ order });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSession(req);
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const { status, paymentStatus, trackingNumber, cancelReason } = body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === "CONFIRMED") data.confirmedAt = new Date();
      if (status === "SHIPPED") { data.shippedAt = new Date(); data.trackingNumber = trackingNumber || `LB${Date.now().toString(36).toUpperCase()}`; }
      if (status === "DELIVERED") data.deliveredAt = new Date();
      if (status === "CANCELLED") data.cancelledAt = new Date();
    }
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (cancelReason) data.cancelReason = cancelReason;

    const order = await db.order.update({ where: { id }, data, include: { items: true } });

    if (status === "DELIVERED" && order.paymentMethod === "COD") {
      await db.order.update({ where: { id }, data: { paymentStatus: "PAID" } });
    }

    return NextResponse.json({ order });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
