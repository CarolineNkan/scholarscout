"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GpaRange = "Below 2.5" | "2.5–2.9" | "3.0–3.4" | "3.5–4.0";
type Year = "1st" | "2nd" | "3rd" | "4th" | "Graduate";

export default function HomePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    program: "",
    gpaRange: "3.0–3.4" as GpaRange,
    country: "Canada",
    year: "3rd" as Year,
    demographicsEnabled: false,
    demographics: "",
    interests: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("scholarscout_profile", JSON.stringify(form));
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] text-[#0B1220]">
      {/* Institutional background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(10,33,74,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,92,47,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.70),rgba(255,255,255,0.25))]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl border border-[#0A214A]/15 bg-white shadow-sm">
              <div className="flex h-full w-full items-center justify-center rounded-2xl font-semibold text-[#0A214A]">
                S
              </div>
            </div>
            <div>
              <p className="text-xs text-[#0A214A]/70">Scholarship intelligence</p>
              <h1 className="text-xl font-semibold tracking-tight">ScholarScout</h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#0A214A]/15 bg-white/70 px-3 py-1 text-sm text-[#0B1220] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Verified sources • Explainable scoring
          </div>
        </header>

        {/* Hero */}
        <section className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-4xl font-semibold tracking-tight text-[#0A214A]">
              Find scholarships you actually qualify for.
            </h2>
            <p className="mt-3 max-w-2xl text-[#0B1220]/75">
              Convert scattered eligibility text into a clear match dashboard:
              score, reasons, gaps, doc checklist, and a personal statement starter.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat label="Sources" value="Gov + Universities" />
              <Stat label="Output" value="Structured records" />
              <Stat label="Clarity" value="Explainable matches" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#0B1220]/60">
              <span className="font-medium text-[#0B1220]/70">Powered by</span>
              <span className="rounded-full border border-[#0A214A]/15 bg-white/70 px-3 py-1 shadow-sm">
                LLM extraction
              </span>
              <span className="rounded-full border border-[#0A214A]/15 bg-white/70 px-3 py-1 shadow-sm">
                Match scoring engine
              </span>
              <span className="rounded-full border border-[#0A214A]/15 bg-white/70 px-3 py-1 shadow-sm">
                Verified source filter
              </span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-[#0A214A]/15 bg-white/70 p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#0A214A]">What you’ll get</p>
              <div className="mt-4 grid gap-3">
                <Pill title="Match score + reasons" desc="Understand why it fits." />
                <Pill title="Gaps + action list" desc="What to fix before applying." />
                <Pill title="Document checklist" desc="What you need, clearly listed." />
                <Pill title="Statement starter" desc="A structured outline to edit." />
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal command bar form */}
        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-[#0A214A]/15 bg-white/75 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-end gap-4">
            <Field label="Name (optional)">
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Caroline"
                className="w-full rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-[#0B1220] outline-none focus:border-[#0A214A]/35"
              />
            </Field>

            <Field label="Program / Major" grow>
              <input
                value={form.program}
                onChange={(e) => update("program", e.target.value)}
                placeholder="Business & IT / Computer Science / Nursing…"
                className="w-full rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-[#0B1220] outline-none focus:border-[#0A214A]/35"
                required
              />
            </Field>

            <Field label="GPA range">
              <select
                value={form.gpaRange}
                onChange={(e) => update("gpaRange", e.target.value as GpaRange)}
                className="w-full rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-[#0B1220] outline-none focus:border-[#0A214A]/35"
              >
                <option>Below 2.5</option>
                <option>2.5–2.9</option>
                <option>3.0–3.4</option>
                <option>3.5–4.0</option>
              </select>
            </Field>

            <Field label="Year">
              <select
                value={form.year}
                onChange={(e) => update("year", e.target.value as Year)}
                className="w-full rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-[#0B1220] outline-none focus:border-[#0A214A]/35"
              >
                <option>1st</option>
                <option>2nd</option>
                <option>3rd</option>
                <option>4th</option>
                <option>Graduate</option>
              </select>
            </Field>

            <Field label="Country">
              <input
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="w-full rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-[#0B1220] outline-none focus:border-[#0A214A]/35"
              />
            </Field>

            <button
              type="submit"
              className="h-10 rounded-2xl bg-[#0A214A] px-6 font-semibold text-white shadow-sm transition hover:bg-[#0A214A]/90 active:translate-y-[1px]"
            >
              Scout →
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#0A214A]/15 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0A214A]">
                    Targeted matching (optional)
                  </p>
                  <p className="mt-1 text-xs text-[#0B1220]/65">
                    Enable only if you want scholarships tailored to identity-based criteria.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => update("demographicsEnabled", !form.demographicsEnabled)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                    form.demographicsEnabled
                      ? "bg-emerald-600 text-white"
                      : "bg-[#0A214A]/10 text-[#0A214A]"
                  }`}
                >
                  {form.demographicsEnabled ? "On" : "Off"}
                </button>
              </div>

              {form.demographicsEnabled && (
                <textarea
                  value={form.demographics}
                  onChange={(e) => update("demographics", e.target.value)}
                  placeholder="e.g., women in STEM, first-gen, underrepresented group…"
                  className="mt-3 w-full rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-[#0B1220] outline-none focus:border-[#0A214A]/35"
                  rows={3}
                />
              )}
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-[#0A214A]/15 bg-white p-4">
              <p className="text-sm font-semibold text-[#0A214A]">Interests / keywords</p>
              <p className="mt-1 text-xs text-[#0B1220]/65">
                Used to rank scholarships and draft statement starters.
              </p>
              <textarea
                value={form.interests}
                onChange={(e) => update("interests", e.target.value)}
                placeholder="AI, fintech, social impact, leadership, community service…"
                className="mt-3 w-full rounded-2xl border border-[#0A214A]/15 bg-white px-3 py-2 text-[#0B1220] outline-none focus:border-[#0A214A]/35"
                rows={3}
              />
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
  grow,
}: {
  label: string;
  children: React.ReactNode;
  grow?: boolean;
}) {
  return (
    <div className={grow ? "min-w-[240px] flex-1" : "min-w-[140px]"}>
      <label className="text-xs font-medium text-[#0B1220]/70">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#0A214A]/15 bg-white/70 p-4 shadow-sm">
      <p className="text-xs text-[#0B1220]/60">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#0A214A]">{value}</p>
    </div>
  );
}

function Pill({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#0A214A]/12 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-[#0A214A]">{title}</p>
      <p className="mt-1 text-xs text-[#0B1220]/65">{desc}</p>
    </div>
  );
}