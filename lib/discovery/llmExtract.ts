// lib/discovery/llmExtract.ts
import { ScholarshipRecord } from "@/lib/types/scholarship";

/**
 * Provider-agnostic LLM call:
 * - Set LLM_ENDPOINT (your server endpoint)
 * - Set LLM_API_KEY (your key)
 * - Set LLM_MODEL (optional)
 *
 * The endpoint is expected to return: { record: ScholarshipRecord }
 */
export async function extractWithLLM(params: {
  url: string;
  pageTitle: string;
  text: string;
}): Promise<ScholarshipRecord> {
  const endpoint = process.env.LLM_ENDPOINT;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "default";

  if (!endpoint || !apiKey) {
    throw new Error("Missing LLM_ENDPOINT or LLM_API_KEY");
  }

  const prompt = buildPrompt(params);

  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, prompt }),
  });

  const data = await r.json();
  if (!r.ok) {
    throw new Error(
      `LLM request failed: ${r.status} ${JSON.stringify(data).slice(0, 300)}`
    );
  }

  // Expect { record: { ... } }
  if (!data?.record) throw new Error("LLM response missing 'record' field");

  return data.record as ScholarshipRecord;
}

function buildPrompt(params: { url: string; pageTitle: string; text: string }) {
  const { url, pageTitle, text } = params;

  return `
You are an information extraction system.
Return ONLY valid JSON matching this TypeScript type:

type ScholarshipRecord = {
  id: string;
  title: string;
  url: string;
  provider: "university" | "gov" | "org" | "other";
  country?: string;
  deadline?: string;   // ISO if possible, otherwise original string
  amount?: string;     // keep currency symbols
  eligibility: {
    gpaMin?: number;
    programKeywords?: string[];
    demographics?: string[];
    citizenship?: string[];
    year?: string[];
  };
  requirements: {
    docs: string[];
    essays: string[];
  };
  rawTextSnippet?: string;
};

Rules:
- Use the page text as the source of truth. If something is missing, omit the field.
- provider: infer from URL domain (.edu/.ac=university, .gov/.gc.ca=gov, .org=org else other)
- id: stable hash-like string (you can use a short deterministic id based on url)
- docs/essays: list only what is explicitly required or clearly implied.
- deadline: prefer ISO (YYYY-MM-DD) if you can determine it.

URL: ${url}
Page title: ${pageTitle}

PAGE TEXT (trimmed):
${text.slice(0, 12000)}
`.trim();
}