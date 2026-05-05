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
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* ── Header + search */}
      <div className="px-6 md:px-8 pt-7 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 mb-0.5">Programs</p>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{programs.length} programmes available</h2>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 16 16">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search programs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all w-52 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ── Filter chip groups */}
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          {([
            { label: "Field",    options: fields, value: fieldFilter, set: setFieldFilter },
            { label: "Language", options: langs,  value: langFilter,  set: setLangFilter  },
            { label: "Level",    options: levels, value: levelFilter, set: setLevelFilter },
          ] as const).map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mr-0.5">{f.label}</span>
              {f.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => (f.set as React.Dispatch<React.SetStateAction<string>>)(opt)}
                  className={[
                    "text-[11px] rounded-full px-2.5 py-1 border font-semibold transition-all active:scale-95",
                    f.value === opt
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                      : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-700",
                  ].join(" ")}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Program rows */}
      <ul className="divide-y divide-slate-50">
        <AnimatePresence initial={false}>
          {visible.map((p, i) => {
            const s = fitStyle(p.fitScore);
            const R = 18; const C = 2 * Math.PI * R;
            const dash = (p.fitScore / 100) * C;
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.035, duration: 0.28 }}
                className="group flex items-center gap-4 px-6 md:px-8 py-4 hover:bg-indigo-50/30 hover:border-l-2 hover:border-l-indigo-400 transition-all cursor-default"
              >
                {/* Circular match ring */}
                <div className="shrink-0 hidden sm:block">
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r={R} fill="none" stroke="#f1f5f9" strokeWidth="3.5"/>
                    <circle cx="22" cy="22" r={R} fill="none" stroke={s.bar} strokeWidth="3.5"
                      strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
                      transform="rotate(-90 22 22)"
                      style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
                    />
                    <text x="22" y="26" textAnchor="middle" fontSize="9" fontWeight="700" fill={s.bar} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.fitScore}%
                    </text>
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 mb-1">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                      {p.name}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 border border-indigo-100 shrink-0">
                      {p.level}
                    </span>
                    {p.scholarshipAvailable && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 rounded-full px-2 py-0.5 border border-teal-100 shrink-0">
                        Scholarship
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 flex flex-wrap gap-x-3">
                    {p.field    && <span>{p.field}</span>}
                    {p.language && <span>· {p.language}</span>}
                    {p.durationMonths > 0 && <span>· {p.durationMonths / 12}yr</span>}
                    {p.deliveryMode && p.deliveryMode !== "on-campus" && <span className="capitalize">· {p.deliveryMode}</span>}
                  </p>
                </div>

                {/* Tuition */}
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-bold text-slate-800 tabular-nums">
                    {p.tuitionUsdPerYear > 0 ? `$${p.tuitionUsdPerYear.toLocaleString()}/yr` : "Free"}
                  </p>
                  {budgetUsdPerYear && p.tuitionUsdPerYear > 0 && (
                    <p className={`text-[10px] font-semibold ${p.tuitionUsdPerYear <= budgetUsdPerYear ? "text-teal-600" : "text-rose-400"}`}>
                      {p.tuitionUsdPerYear <= budgetUsdPerYear ? "✓ budget" : "over budget"}
                    </p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <li className="px-8 py-14 text-center text-sm text-slate-400">No programs match your filters.</li>
        )}
      </ul>

      {/* ── Show more */}
      {filtered.length > 5 && (
        <div className="px-8 py-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showAll ? "Show less ↑" : `Show all ${filtered.length} programs ↓`}
          </button>
        </div>
      )}
    </section>
  );
}
