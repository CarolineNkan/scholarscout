import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Not implemented yet (Phase 1: search provider)" },
    { status: 501 }
  );
}