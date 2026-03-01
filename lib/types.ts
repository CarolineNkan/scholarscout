export type Profile = {
  name: string;
  program: string;
  gpaRange: string;
  country: string;
  year: string;
  demographicsEnabled: boolean;
  demographics: string;
  interests: string;
};

export type ScholarshipRecord = {
  id: string;
  title: string;
  url: string;
  provider: "university" | "gov" | "org" | "other";
  country?: string;
  deadline?: string;
  amount?: string;
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

export type MatchResult = {
  scholarship: ScholarshipRecord;
  score: number;      // 0–100
  why: string[];      // reasons
  gaps: string[];     // missing items / risks
  docs: string[];     // required docs
};