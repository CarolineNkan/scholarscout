import type { MatchResult, Profile, ScholarshipRecord } from "@/lib/types";

function normalize(text?: string) {
  return (text || "").toLowerCase().trim();
}

function tokenize(text?: string) {
  return normalize(text)
    .split(/[\s,./;:()\-+&]+/)
    .filter(Boolean);
}

function parseGpaRange(gpaRange: string) {
  const lower = normalize(gpaRange);

  if (lower.includes("below 2.5")) return { min: 0, max: 2.49 };
  if (lower.includes("2.5")) return { min: 2.5, max: 2.9 };
  if (lower.includes("3.0")) return { min: 3.0, max: 3.4 };
  if (lower.includes("3.5")) return { min: 3.5, max: 4.0 };

  return { min: 0, max: 4.0 };
}

function matchProgram(profile: Profile, scholarship: ScholarshipRecord) {
  const why: string[] = [];
  let score = 0;

  const profileTerms = [
    ...tokenize(profile.program),
    ...tokenize(profile.interests),
  ];

  const scholarshipTerms = [
    ...tokenize(scholarship.title),
    ...tokenize(scholarship.rawTextSnippet),
    ...(scholarship.eligibility.programKeywords || []).flatMap((x) => tokenize(x)),
  ];

  const overlap = profileTerms.filter((term) => scholarshipTerms.includes(term));

  if (overlap.length >= 3) {
    score = 30;
    why.push("Strong program and interest alignment");
  } else if (overlap.length >= 1) {
    score = 18;
    why.push("Some program/interest alignment detected");
  }

  return { score, why };
}

function matchCountry(profile: Profile, scholarship: ScholarshipRecord) {
  const why: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (!scholarship.country) {
    return { score, why, gaps };
  }

  if (normalize(profile.country) === normalize(scholarship.country)) {
    score = 20;
    why.push("Country match");
  } else {
    gaps.push(`Scholarship may target ${scholarship.country}, not ${profile.country}`);
  }

  return { score, why, gaps };
}

function matchGpa(profile: Profile, scholarship: ScholarshipRecord) {
  const why: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  const profileGpa = parseGpaRange(profile.gpaRange);
  const requiredGpa = scholarship.eligibility.gpaMin;

  if (typeof requiredGpa !== "number") {
    return { score, why, gaps };
  }

  if (profileGpa.max >= requiredGpa) {
    score = 20;
    why.push(`GPA likely meets minimum requirement (${requiredGpa})`);
  } else {
    gaps.push(`GPA may be below required minimum (${requiredGpa})`);
  }

  return { score, why, gaps };
}

function matchYear(profile: Profile, scholarship: ScholarshipRecord) {
  const why: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  const years = scholarship.eligibility.year || [];
  if (!years.length) return { score, why, gaps };

  const profileYear = normalize(profile.year);

  const matched = years.some((y) => normalize(y).includes(profileYear));

  if (matched) {
    score = 15;
    why.push("Year of study match");
  } else {
    gaps.push(`Scholarship may target ${years.join(", ")}`);
  }

  return { score, why, gaps };
}

function matchDemographics(profile: Profile, scholarship: ScholarshipRecord) {
  const why: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  const scholarshipDemographics = scholarship.eligibility.demographics || [];
  if (!scholarshipDemographics.length) return { score, why, gaps };

  if (!profile.demographicsEnabled || !profile.demographics.trim()) {
    gaps.push("Demographic criteria may apply but profile data is not enabled");
    return { score, why, gaps };
  }

  const profileDemo = normalize(profile.demographics);
  const matched = scholarshipDemographics.some((d) =>
    profileDemo.includes(normalize(d))
  );

  if (matched) {
    score = 15;
    why.push("Demographic criteria match detected");
  } else {
    gaps.push(`May require: ${scholarshipDemographics.join(", ")}`);
  }

  return { score, why, gaps };
}

function statusAdjustment(scholarship: ScholarshipRecord) {
  const why: string[] = [];
  const gaps: string[] = [];
  let delta = 0;

  if (scholarship.status === "open") {
    delta += 5;
    why.push("Currently open");
  } else if (scholarship.status === "closed") {
    delta -= 20;
    gaps.push("Application appears closed");
  } else {
    gaps.push("Application status unknown");
  }

  return { delta, why, gaps };
}

export function matchScholarship(
  profile: Profile,
  scholarship: ScholarshipRecord
): MatchResult {
  let score = 0;
  const why: string[] = [];
  const gaps: string[] = [];

  const program = matchProgram(profile, scholarship);
  score += program.score;
  why.push(...program.why);

  const country = matchCountry(profile, scholarship);
  score += country.score;
  why.push(...country.why);
  gaps.push(...country.gaps);

  const gpa = matchGpa(profile, scholarship);
  score += gpa.score;
  why.push(...gpa.why);
  gaps.push(...gpa.gaps);

  const year = matchYear(profile, scholarship);
  score += year.score;
  why.push(...year.why);
  gaps.push(...year.gaps);

  const demographics = matchDemographics(profile, scholarship);
  score += demographics.score;
  why.push(...demographics.why);
  gaps.push(...demographics.gaps);

  const status = statusAdjustment(scholarship);
  score += status.delta;
  why.push(...status.why);
  gaps.push(...status.gaps);

  score = Math.max(0, Math.min(100, score));

  return {
    scholarship,
    score,
    why: Array.from(new Set(why)),
    gaps: Array.from(new Set(gaps)),
    docs: scholarship.requirements.docs || [],
  };
}

export function matchScholarships(
  profile: Profile,
  scholarships: ScholarshipRecord[]
): MatchResult[] {
  return scholarships
    .map((s) => matchScholarship(profile, s))
    .sort((a, b) => b.score - a.score);
}