import { NextResponse } from "next/server";
import { ensureSchema, hasDb, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDb || !sql) return NextResponse.json({ ok: true, db: "not configured" });
  try {
    await ensureSchema();
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true, db: "connected" });
  } catch {
    return NextResponse.json({ ok: false, db: "error" }, { status: 503 });
  }
}
