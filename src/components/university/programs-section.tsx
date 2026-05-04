"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IUniversityProgram } from "@/lib/types";

/* ─── Fit score computation ─────────────────────────────────── */
function computeProgramFit(
  program: IUniversityProgram,
  opts: {
    interests: string[];
    budgetUsdPerYear?: number;
    preferredLevel: string;
  },
): number {
  let score = 48;
  const field = (program.field ?? "").toLowerCase();

  if (
    opts.interests.some(
      (i) =>
        field.includes(i.toLowerCase()) ||
        i.toLowerCase().includes(field.split(" ")[0] ?? ""),
    )
  ) {
    score += 32;
  }
  if ((program.language ?? "").toLowerCase().includes("english")) score += 10;
  if (program.level === opts.preferredLevel) score += 15;
  if (
    opts.budgetUsdPerYear &&
    program.tuitionUsdPerYear > 0 &&
    program.tuitionUsdPerYear <= opts.budgetUsdPerYear
  ) {
    score += 10;
  }
  return Math.min(100, Math.round(score));
}

/* ─── Helpers ────────────────────────────────────────────────── */
function fitStyle(score: number) {
  if (score >= 75)
    return { bg: "bg-emerald-100", text: "text-emerald-700", bar: "#10b981", border: "border-emerald-200" };
  if (score >= 55)
    return { bg: "bg-blue-100", text: "text-blue-700", bar: "#3b82f6", border: "border-blue-200" };
  if (score >= 35)
    return { bg: "bg-amber-100", text: "text-amber-700", bar: "#f59e0b", border: "border-amber-200" };
  return { bg: "bg-gray-100", text: "text-gray-500", bar: "#94a3b8", border: "border-gray-200" };
}

/* ─── Component ─────────────────────────────────────────────── */
interface ProgramsSectionProps {
  programs: IUniversityProgram[];
  interests: string[];
  budgetUsdPerYear?: number;
  preferredLevel: string;
}

export function ProgramsSection({
  programs,
  interests,
  budgetUsdPerYear,
  preferredLevel,
}: ProgramsSectionProps) {
  const [search, setSearch] = React.useState("");
  const [fieldFilter, setFieldFilter] = React.useState("All");
  const [langFilter, setLangFilter] = React.useState("All");
  const [levelFilter, setLevelFilter] = React.useState("All");
  const [showAll, setShowAll] = React.useState(false);

  const fields = React.useMemo(
    () => ["All", ...Array.from(new Set(programs.map((p) => p.field).filter(Boolean)))],
    [programs],
  );
  const langs = React.useMemo(
    () => ["All", ...Array.from(new Set(programs.map((p) => p.language).filter(Boolean)))],
    [programs],
  );
  const levels = React.useMemo(
    () => ["All", ...Array.from(new Set(programs.map((p) => p.level).filter(Boolean)))],
    [programs],
  );

  const enriched = React.useMemo(
    () =>
      programs
        .map((p) => ({
          ...p,
          fitScore: computeProgramFit(p, { interests, budgetUsdPerYear, preferredLevel }),
        }))
        .sort((a, b) => b.fitScore - a.fitScore),
    [programs, interests, budgetUsdPerYear, preferredLevel],
  );

  const filtered = enriched.filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !(p.field ?? "").toLowerCase().includes(q))
      return false;
    if (fieldFilter !== "All" && p.field !== fieldFilter) return false;
    if (langFilter !== "All" && p.language !== langFilter) return false;
    if (levelFilter !== "All" && p.level !== levelFilter) return false;
    return true;
  });

  const visible = showAll ? filtered : filtered.slice(0, 5);

  if (!programs.length) return null;

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-gray-100">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-500 font-semibold mb-0.5">
              Programs
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {programs.length} programmes available
            </h2>
          </div>
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 16 16"
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search programs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-56"
            />
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {(
            [
              { label: "Field", options: fields, value: fieldFilter, set: setFieldFilter },
              { label: "Language", options: langs, value: langFilter, set: setLangFilter },
              { label: "Level", options: levels, value: levelFilter, set: setLevelFilter },
            ] as const
          ).map((f) => (
            <div key={f.label} className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">
                {f.label}:
              </span>
              {f.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => (f.set as React.Dispatch<React.SetStateAction<string>>)(opt)}
                  className={[
                    "text-xs rounded-full px-3 py-1 border transition-all font-medium",
                    f.value === opt
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600",
                  ].join(" ")}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Program list */}
      <ul className="divide-y divide-gray-50/80">
        <AnimatePresence initial={false}>
          {visible.map((p, i) => {
            const s = fitStyle(p.fitScore);
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex items-center gap-5 px-6 md:px-8 py-4 hover:bg-blue-50/35 transition-colors group cursor-default"
              >
                {/* Mini fit bar */}
                <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-1.5 w-12">
                  <span className={`text-sm font-bold ${s.text}`}>{p.fitScore}%</span>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: s.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.fitScore}%` }}
                      transition={{
                        duration: 0.9,
                        ease: [0.16, 1, 0.3, 1],
                        delay: i * 0.05,
                      }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {p.name}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 border border-blue-100">
                      {p.level}
                    </span>
                    {p.scholarshipAvailable && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-100">
                        Scholarship
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex flex-wrap gap-x-3">
                    {p.field && <span>🎓 {p.field}</span>}
                    {p.language && <span>🌐 {p.language}</span>}
                    {p.durationMonths > 0 && <span>⏱ {p.durationMonths / 12} yr{p.durationMonths / 12 !== 1 ? "s" : ""}</span>}
                    {p.deliveryMode && p.deliveryMode !== "on-campus" && (
                      <span className="capitalize">📡 {p.deliveryMode}</span>
                    )}
                  </p>
                </div>

                {/* Tuition */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-800 tabular-nums">
                    {p.tuitionUsdPerYear > 0
                      ? `$${p.tuitionUsdPerYear.toLocaleString()}/yr`
                      : "Free"}
                  </p>
                  {budgetUsdPerYear && p.tuitionUsdPerYear > 0 && (
                    <p
                      className={`text-[10px] font-semibold ${
                        p.tuitionUsdPerYear <= budgetUsdPerYear
                          ? "text-emerald-600"
                          : "text-red-400"
                      }`}
                    >
                      {p.tuitionUsdPerYear <= budgetUsdPerYear
                        ? "Within budget"
                        : "Over budget"}
                    </p>
                  )}
                </div>

                {/* Mobile fit badge */}
                <span
                  className={`flex-shrink-0 text-xs font-bold rounded-full px-2.5 py-1 sm:hidden ${s.bg} ${s.text}`}
                >
                  {p.fitScore}%
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <li className="px-8 py-12 text-center text-sm text-gray-400">
            No programs match your filters.
          </li>
        )}
      </ul>

      {/* Show more / less */}
      {filtered.length > 5 && (
        <div className="px-6 md:px-8 py-5 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors"
          >
            {showAll ? "Show less ↑" : `Show all ${filtered.length} programs ↓`}
          </button>
        </div>
      )}
    </section>
  );
}
