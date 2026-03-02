// app/api/search/route.ts
import { NextResponse } from "next/server";

type SearchItem = { title: string; link: string };

function buildVerifiedQuery(query: string) {
  // Phase 1.5: tighten discovery quality
  return `
${query}
(site:.edu OR site:.ac OR site:.gc.ca OR site:.gov OR site:.org)
-scholarshipportal -hotcourses -globalsouthopportunities
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    const numRaw = Number(body?.num ?? 8);

    if (!query) {
      return NextResponse.json(
        { error: "Missing 'query' in request body." },
        { status: 400 }
      );
    }

    const num = Number.isFinite(numRaw) ? Math.min(Math.max(numRaw, 1), 10) : 8;

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing SERPAPI_KEY in environment (.env.local)." },
        { status: 500 }
      );
    }

    const verifiedQuery = buildVerifiedQuery(query);

    // SerpAPI: Google Search endpoint
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google");
    url.searchParams.set("q", verifiedQuery);
    url.searchParams.set("num", String(num));
    url.searchParams.set("api_key", apiKey);

    // Optional: bias to Canada + English (safe defaults)
    url.searchParams.set("hl", "en");
    url.searchParams.set("gl", "ca");

    const r = await fetch(url.toString(), { cache: "no-store" });
    const data = await r.json();

    if (!r.ok) {
      return NextResponse.json(
        {
          error: "SerpAPI request failed",
          status: r.status,
          details: data,
        },
        { status: 500 }
      );
    }

    const organic: any[] = Array.isArray(data?.organic_results)
      ? data.organic_results
      : [];

    const results: SearchItem[] = organic
      .map((x) => ({
        title: String(x?.title ?? "").trim(),
        link: String(x?.link ?? "").trim(),
      }))
      .filter((x) => x.title && x.link)
      // Deduplicate by link
      .filter((x, i, arr) => arr.findIndex((y) => y.link === x.link) === i)
      .slice(0, num);

    return NextResponse.json({
      query,
      verifiedQuery,
      num,
      results,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}