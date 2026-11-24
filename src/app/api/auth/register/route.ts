import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie, SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email || !phone || !password) return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const existing = await db.user.findFirst({ where: { OR: [{ email: email.toLowerCase().trim() }, { phone }] } });
    if (existing) return NextResponse.json({ error: "Email or phone already registered" }, { status: 409 });
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({ data: { name, email: email.toLowerCase().trim(), phone, passwordHash, role: "CUSTOMER" } });
    const sessionUser: SessionUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role as "CUSTOMER" | "ADMIN" };
    const token = createSessionToken(sessionUser);
    const res = NextResponse.json({ user: sessionUser });
    setSessionCookie(res, token);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
