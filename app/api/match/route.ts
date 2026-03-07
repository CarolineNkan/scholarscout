import { NextResponse } from "next/server";
import { matchScholarships } from "@/lib/engine/match";
import type { Profile, ScholarshipRecord } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const profile = body?.profile as Profile;
    const scholarships = body?.scholarships as ScholarshipRecord[];

    if (!profile) {
      return NextResponse.json(
        { error: "Missing 'profile' in request body." },
        { status: 400 }
      );
    }

    if (!Array.isArray(scholarships)) {
      return NextResponse.json(
        { error: "Missing 'scholarships' array in request body." },
        { status: 400 }
      );
    }

    const results = matchScholarships(profile, scholarships);

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}