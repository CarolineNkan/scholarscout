import type { Profile, ScholarshipRecord, MatchResult } from "../types";

export function scoreScholarship(profile: Profile, s: ScholarshipRecord): MatchResult {
  // Placeholder scoring logic — we’ll upgrade later
  const why: string[] = [];
  const gaps: string[] = [];

  // crude keyword alignment (Phase 0 only)
  const haystack = `${s.title} ${s.rawTextSnippet ?? ""}`.toLowerCase();
  const needle = `${profile.program} ${profile.interests}`.toLowerCase();

  let score = 50;
  if (needle.split(" ").some((w) => w && haystack.includes(w))) {
    score += 20;
    why.push("Keyword alignment detected");
  }

  if (profile.country && s.country && profile.country.toLowerCase() === s.country.toLowerCase()) {
    score += 10;
    why.push("Country match");
  }

  // GPA min (if present)
  if (typeof s.eligibility.gpaMin === "number") {
    // we’ll parse gpaRange later; for now just flag it
    gaps.push(`Check GPA requirement: minimum ${s.eligibility.gpaMin}`);
  }

  score = Math.max(0, Math.min(100, score));

  return {
    scholarship: s,
    score,
    why: why.length ? why : ["General eligibility likely"],
    gaps,
    docs: s.requirements.docs ?? [],
  };
}