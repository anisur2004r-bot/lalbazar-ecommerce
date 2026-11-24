import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie, SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    const sessionUser: SessionUser = {
      id: user.id, name: user.name, email: user.email, phone: user.phone,
      role: user.role as "CUSTOMER" | "ADMIN", avatar: user.avatar,
    };
    const token = createSessionToken(sessionUser);
    const res = NextResponse.json({ user: sessionUser });
    setSessionCookie(res, token);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
