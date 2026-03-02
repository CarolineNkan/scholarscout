// lib/types/scholarship.ts
export type ScholarshipRecord = {
  id: string;
  title: string;
  url: string;
  provider: string; // university, gov, org, other
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