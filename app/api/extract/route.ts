// app/api/extract/route.ts
import { NextResponse } from "next/server";
import { htmlToReadableText } from "@/lib/discovery/readable";
import { heuristicScholarshipFromPage } from "@/lib/engine/heuristics";
import { extractWithLLM } from "@/lib/discovery/llmExtract";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = String(body?.url ?? "").trim();

    if (!url) {
      return NextResponse.json(
        { error: "Missing 'url' in request body." },
        { status: 400 }
      );
    }

    // 1) Fetch HTML server-side
    const r = await fetch(url, {
      // Some scholarship sites block “empty UA”
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ScholarScoutBot/1.0; +https://example.com/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
    });

    const contentType = r.headers.get("content-type") || "";
    if (!r.ok) {
      return NextResponse.json(
        { error: `Fetch failed: ${r.status}` },
        { status: 500 }
      );
    }
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: `Unsupported content-type: ${contentType}` },
        { status: 400 }
      );
    }

    const html = await r.text();

    // 2) Extract readable text
    const { title, textContent, excerpt } = htmlToReadableText(html, url);

    // 3) Turn into ScholarshipRecord
    const mode = (process.env.EXTRACT_MODE || "heuristic").toLowerCase();
    const record =
      mode === "llm"
        ? await extractWithLLM({ url, pageTitle: title, text: textContent })
        : heuristicScholarshipFromPage({
            url,
            title,
            text: textContent,
            excerpt,
          });

    return NextResponse.json({
      record,
      debug: {
        mode,
        pageTitle: title,
        snippet: excerpt || record.rawTextSnippet,
        textLen: textContent.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}