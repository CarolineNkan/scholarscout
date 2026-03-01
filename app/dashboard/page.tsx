"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Profile = {
  name: string;
  program: string;
  gpaRange: string;
  country: string;
  year: string;
  demographicsEnabled: boolean;
  demographics: string;
  interests: string;
};

type Scholarship = {
  name: string;
  amount: string;
  deadline: string;
  source: string;
  score: number;
  why: string[];
  gaps: string[];
  docs: string[];
};

type SearchItem = {
  title: string;
  link: string;
};

const MOCK: Scholarship[] = [
  {
    name: "Women in STEM Leadership Scholarship",
    amount: "$2,500",
    deadline: "Mar 15, 2026",
    source: "University (.edu)",
    score: 86,
    why: ["Program alignment (STEM)", "Leadership evidence keywords", "Country eligible"],
    gaps: ["Requires 1 reference letter"],
    docs: ["Transcript", "Resume", "Reference letter", "Short essay (500 words)"],
  },
  {
    name: "Canada Innovation Student Award",
    amount: "$5,000",
    deadline: "Apr 01, 2026",
    source: "Government",
    score: 78,
    why: ["Canada location match", "Innovation/impact interests match"],
    gaps: ["Needs proof of community involvement"],
    docs: ["Transcript", "Proof of enrollment", "Impact statement"],
  },
  {
    name: "First-Gen Future Builders Grant",
    amount: "$1,000",
    deadline: "Rolling",
    source: "University (.edu)",
    score: 64,
    why: ["General eligibility likely", "Keyword alignment"],
    gaps: ["Needs first-gen verification (optional field)"],
    docs: ["Transcript", "Verification form", "Short response"],
  },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selected, setSelected] = useState<Scholarship>(MOCK[0]);

  // Hour 2: live links
  const [liveLinks, setLiveLinks] = useState<SearchItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("scholarscout_profile");
    if (raw) setProfile(JSON.parse(raw));

    const cached = sessionStorage.getItem("scholarscout_links");
    if (cached) setLiveLinks(JSON.parse(cached));
  }, []);

  const sorted = useMemo(() => [...MOCK].sort((a, b) => b.score - a.score), []);

  async function runLiveSearch() {
    setLiveLoading(true);
    setLiveError(null);

    // Build an explainable query from the profile (safe + simple)
    const program = profile?.program?.trim() || "computer science";
    const country = profile?.country?.trim() || "Canada";
    const year = "2026";
    const keywords = profile?.interests?.trim();
    const q = keywords
      ? `scholarship ${program} ${country} ${year} ${keywords}`
      : `scholarship ${program} ${country} ${year}`;

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, num: 8 }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Surface useful debug text (your API route returns detail)
        const detail = data?.detail ? ` • ${String(data.detail).slice(0, 250)}` : "";
        throw new Error((data?.error || "Search failed") + detail);
      }

      const items: SearchItem[] = data.items || [];
      setLiveLinks(items);
      sessionStorage.setItem("scholarscout_links", JSON.stringify(items));
    } catch (err: any) {
      setLiveError(err?.message || "Search failed");
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] text-[#0B1220]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(10,33,74,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(124,92,47,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.65),rgba(255,255,255,0.25))]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-[#0B1220]/65 hover:underline">
              ← New search
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0A214A]">
              Match Dashboard
            </h1>
            <p className="mt-2 text-[#0B1220]/70">
              {profile ? (
                <>
                  <span className="font-semibold text-[#0B1220]">{profile.program}</span>{" "}
                  • {profile.country} • GPA {profile.gpaRange}
                </>
              ) : (
                "Loading profile…"
              )}
            </p>

            {/* Hour 2 trigger */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={runLiveSearch}
                className="rounded-2xl bg-[#0A214A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A214A]/90 active:translate-y-[1px]"
              >
                {liveLoading ? "Searching…" : "Find live scholarships"}
              </button>

              <p className="text-xs text-[#0B1220]/60">
                Searches only your verified sources list (gov + universities).
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#0A214A]/15 bg-white/75 px-4 py-3 shadow-sm">
            <p className="text-xs text-[#0B1220]/60">Top match score</p>
            <p className="mt-1 text-2xl font-semibold text-[#0A214A]">{sorted[0].score}</p>
          </div>
        </header>

        {/* Hour 2: Live links output */}
        <section className="mt-8">
          <div className="rounded-3xl border border-[#0A214A]/15 bg-white/75 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[#0A214A]">Live scholarship links</p>
                <p className="mt-1 text-xs text-[#0B1220]/60">
                  {liveLinks.length
                    ? `Pulled ${liveLinks.length} verified links.`
                    : "Run search to populate results from your verified sources list."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-xs text-[#0B1220]/70">
                  Format: <span className="font-semibold text-[#0B1220]">[{`{ title, link }`}]</span>
                </div>
              </div>
            </div>

            {liveError && (
              <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {liveError}
              </p>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {liveLinks.map((x) => (
                <div
                  key={x.link}
                  className="rounded-2xl border border-[#0A214A]/12 bg-white p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[#0B1220] line-clamp-2">{x.title}</p>
                  <a
                    href={x.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-xs text-[#0A214A] underline"
                  >
                    {x.link}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Horizontal results rail */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0A214A]">Scholarships</p>
            <p className="text-xs text-[#0B1220]/60">{sorted.length} results</p>
          </div>

          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {sorted.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelected(s)}
                className={`min-w-[340px] rounded-3xl border p-5 text-left shadow-sm transition ${
                  selected.name === s.name
                    ? "border-[#0A214A]/30 bg-white"
                    : "border-[#0A214A]/15 bg-white/75 hover:border-[#0A214A]/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0B1220]">{s.name}</p>
                    <p className="mt-1 text-sm text-[#0A214A]">{s.amount}</p>
                    <p className="mt-2 text-xs text-[#0B1220]/65">Deadline: {s.deadline}</p>
                    <p className="mt-1 text-xs text-[#0B1220]/55">{s.source}</p>
                  </div>
                  <ScoreBadge score={s.score} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Insights + Inspector */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card title="✅ Why you qualify">
              <ul className="list-disc pl-5 text-sm text-[#0B1220]/80">
                {selected.why.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card title="⚠️ Gaps / risks">
                {selected.gaps.length ? (
                  <ul className="list-disc pl-5 text-sm text-[#0B1220]/80">
                    {selected.gaps.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#0B1220]/70">No major gaps detected.</p>
                )}
              </Card>

              <Card title="📄 Required documents">
                <ul className="grid gap-2 text-sm text-[#0B1220]/80">
                  {selected.docs.map((d) => (
                    <li key={d} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#0A214A]/60" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card title="✨ Personal statement starter">
              <p className="text-sm text-[#0B1220]/80">
                1) Purpose: why this scholarship matters to you
                <br />
                2) Evidence: 2 achievements with measurable outcomes
                <br />
                3) Alignment: connect your program to the scholarship mission
                <br />
                4) Impact: what you’ll do with the funding
              </p>

              <button className="mt-4 w-full rounded-2xl bg-[#0A214A] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-[#0A214A]/90 active:translate-y-[1px]">
                Generate outline (next)
              </button>
            </Card>
          </div>

          <aside className="rounded-3xl border border-[#0A214A]/15 bg-white/75 p-5 shadow-sm">
            <p className="text-xs text-[#0B1220]/60">Inspector</p>
            <h2 className="mt-2 text-lg font-semibold text-[#0A214A]">{selected.name}</h2>

            <div className="mt-4 rounded-2xl border border-[#0A214A]/15 bg-white p-4 shadow-sm">
              <p className="text-xs text-[#0B1220]/60">Match score</p>
              <p className="mt-1 text-4xl font-semibold text-[#0A214A]">{selected.score}</p>
              <p className="mt-2 text-xs text-[#0B1220]/65">
                Based on program, location, GPA band, and keyword alignment.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <MiniRow label="Amount" value={selected.amount} />
              <MiniRow label="Deadline" value={selected.deadline} />
              <MiniRow label="Source" value={selected.source} />
            </div>

            <button className="mt-6 w-full rounded-2xl border border-[#0A214A]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0A214A] shadow-sm transition hover:bg-[#0A214A]/5 active:translate-y-[1px]">
              Save to shortlist (next)
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[#0A214A]/15 bg-white/75 p-5 shadow-sm">
      <p className="font-semibold text-[#0A214A]">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#0A214A]/15 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-[#0B1220]/60">{label}</p>
      <p className="text-sm text-[#0B1220]/85">{value}</p>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tier = score >= 80 ? "Strong" : score >= 50 ? "Medium" : "Low";
  const cls =
    score >= 80
      ? "bg-emerald-600/15 text-emerald-700 border-emerald-700/20"
      : score >= 50
      ? "bg-amber-500/15 text-amber-700 border-amber-700/20"
      : "bg-rose-500/15 text-rose-700 border-rose-700/20";

  return (
    <div className="shrink-0 text-right">
      <div className={`rounded-2xl border px-3 py-2 text-xs font-semibold ${cls}`}>
        {score} • {tier}
      </div>
      <p className="mt-1 text-[11px] text-[#0B1220]/55">Score</p>
    </div>
  );
}