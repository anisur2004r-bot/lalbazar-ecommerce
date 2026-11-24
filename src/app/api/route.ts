import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "LalBazar API", status: "running" });
}
