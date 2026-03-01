import type { ScholarshipRecord } from "../types";

export async function extractScholarshipFromUrl(url: string): Promise<ScholarshipRecord> {
  // Phase 0 placeholder: minimal object.
  // Phase 2: fetch page → extract text → AI structured JSON
  return {
    id: crypto.randomUUID(),
    title: "Unknown scholarship",
    url,
    provider: "other",
    eligibility: {},
    requirements: { docs: [], essays: [] },
    rawTextSnippet: "",
  };
}