// lib/engine/heuristics.ts

import crypto from "crypto";
import { ScholarshipRecord } from "@/lib/types/scholarship";

function providerFromUrl(url: string) {
  const host = new URL(url).hostname.toLowerCase();

  if (
    host.endsWith(".edu") ||
    host.endsWith(".ac") ||
    host.endsWith(".ca") ||
    host.includes("university") ||
    host.includes("college")
  ) {
    return "university";
  }

  if (host.endsWith(".gc.ca") || host.endsWith(".gov")) {
    return "gov";
  }

  if (host.endsWith(".org")) {
    return "org";
  }

  return "other";
}

function pickFirstMatch(text: string, patterns: RegExp[]) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[0]) return m[0].trim();
  }
  return undefined;
}

function extractAmount(text: string) {
  const patterns = [
    /\$\s?\d[\d,]*(?:\.\d{2})?\s?(?:CAD|USD|EUR|GBP)?/gi,
    /\b\d[\d,]*(?:\.\d{2})?\s?(?:CAD|USD|EUR|GBP)\b/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (!matches?.length) continue;

    for (const raw of matches) {
      const cleaned = raw.trim();

      // Ignore obviously tiny false positives like "$1" unless that's all there is
      const digitsOnly = cleaned.replace(/[^\d]/g, "");
      if (digitsOnly.length >= 4) {
        return cleaned;
      }
    }

    // fallback to first match if nothing had 4+ digits
    return matches[0].trim();
  }

  return undefined;
}

function extractDeadline(text: string) {
  return pickFirstMatch(text, [
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/i,
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
    /\bdeadline[:\s]+[^\n]{0,60}\b/i,
  ]);
}

function parseDate(dateStr?: string) {
  if (!dateStr) return undefined;

  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) return undefined;

  return new Date(parsed);
}

function computeStatus(deadline?: string) {
  const parsed = parseDate(deadline);
  if (!parsed) return "unknown";

  const now = new Date();
  return parsed >= now ? "open" : "closed";
}

function extractGPA(text: string) {
  const match = text.match(/\bGPA\s*(?:of)?\s*(\d\.\d{1,2})\b/i);
  if (match?.[1]) return Number(match[1]);
  return undefined;
}

function extractDocs(text: string) {
  const docs: string[] = [];
  const lower = text.toLowerCase();

  const candidates = [
    ["transcript", "Transcript"],
    ["resume", "Resume"],
    ["cv", "CV"],
    ["reference", "Reference letter"],
    ["recommendation", "Recommendation letter"],
    ["personal statement", "Personal statement"],
    ["essay", "Essay"],
    ["proof of enrollment", "Proof of enrollment"],
    ["budget", "Budget"],
    ["portfolio", "Portfolio"],
  ] as const;

  for (const [needle, label] of candidates) {
    if (lower.includes(needle)) docs.push(label);
  }

  return Array.from(new Set(docs));
}

function extractEssays(text: string) {
  const essays: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes("personal statement")) essays.push("Personal statement");
  if (lower.includes("essay")) essays.push("Essay");
  if (lower.includes("statement of purpose"))
    essays.push("Statement of purpose");

  return Array.from(new Set(essays));
}

export function heuristicScholarshipFromPage(args: {
  url: string;
  title: string;
  text: string;
  excerpt?: string;
}): ScholarshipRecord & { status: "open" | "closed" | "unknown" } {
  const { url, title, text, excerpt } = args;

  const id = crypto
    .createHash("sha1")
    .update(url)
    .digest("hex")
    .slice(0, 12);

  const provider = providerFromUrl(url);
  const deadline = extractDeadline(text);
  const amount = extractAmount(text);
  const gpaMin = extractGPA(text);

  const docs = extractDocs(text);
  const essays = extractEssays(text);

  const status = computeStatus(deadline);

  return {
    id,
    title,
    url,
    provider,
    deadline,
    amount,
    eligibility: {
      gpaMin,
    },
    requirements: {
      docs,
      essays,
    },
    rawTextSnippet: excerpt || text.slice(0, 600),
    status,
  };
}