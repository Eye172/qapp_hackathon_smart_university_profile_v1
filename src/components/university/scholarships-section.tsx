"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface Scholarship {
  id: string;
  name: string;
  description?: string | null;
  covers?: string | null;
  eligibility?: string | null;
  minGpa?: number | null;
  minIelts?: number | null;
}

interface ScholarshipsSectionProps {
  scholarships: Scholarship[];
  studentGpa: number;
  studentIelts: number;
}

type Relevance = "high" | "medium" | "low";

function getRelevance(s: Scholarship, gpa: number, ielts: number): Relevance {
  const gpaOk = !s.minGpa || gpa >= s.minGpa;
  const ieltsOk = !s.minIelts || ielts >= s.minIelts;
  if (gpaOk && ieltsOk) return "high";
  if (gpaOk || ieltsOk) return "medium";
  return "low";
}

const RELEVANCE_STYLES: Record<
  Relevance,
  { badge: string; dot: string; label: string; cardBorder: string }
> = {
  high: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    label: "High Match",
    cardBorder: "border-emerald-100 hover:border-emerald-200",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    label: "Partial Match",
    cardBorder: "border-amber-100 hover:border-amber-200",
  },
  low: {
    badge: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
    label: "Low Match",
    cardBorder: "border-gray-100 hover:border-gray-200",
  },
};

export function ScholarshipsSection({
  scholarships,
  studentGpa,
  studentIelts,
}: ScholarshipsSectionProps) {
  if (!scholarships.length) return null;

  return (
    <section className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-slate-900 dark:to-slate-900 rounded-3xl border border-blue-100 dark:border-blue-500/20 shadow-sm p-6 md:p-8">
      {/* Decorative wavy pattern */}
      <div className="relative">
        <svg
          className="absolute -top-6 right-0 w-48 h-20 opacity-20 pointer-events-none"
          viewBox="0 0 192 80"
          fill="none"
          aria-hidden
        >
          <path
            d="M0 40 Q24 10 48 40 Q72 70 96 40 Q120 10 144 40 Q168 70 192 40"
            stroke="#2563eb"
            strokeWidth="2"
          />
          <path
            d="M0 54 Q24 24 48 54 Q72 84 96 54 Q120 24 144 54 Q168 84 192 54"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
        </svg>

        <p className="text-xs uppercase tracking-wider text-blue-500 font-semibold mb-0.5">
          Funding
        </p>
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-6">Available Scholarships</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scholarships.map((s, i) => {
          const rel = getRelevance(s, studentGpa, studentIelts);
          const styles = RELEVANCE_STYLES[rel];

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={[
                "bg-white/80 dark:bg-slate-950/55 backdrop-blur-sm rounded-2xl border p-5 space-y-3 hover:shadow-md transition-all",
                styles.cardBorder,
              ].join(" ")}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-snug">{s.name}</p>
                <span
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1 ${styles.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                  {styles.label}
                </span>
              </div>

              {/* Description */}
              {s.description && (
                <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {s.description}
                </p>
              )}

              {/* Eligibility pills */}
              <div className="flex flex-wrap gap-2 pt-0.5">
                {s.covers && (
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 border border-blue-100">
                    💰 {s.covers}
                  </span>
                )}
                {s.minGpa && (
                  <span
                    className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${
                      studentGpa >= s.minGpa
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {studentGpa >= s.minGpa ? "✓" : "✗"} GPA ≥ {s.minGpa}
                  </span>
                )}
                {s.minIelts && (
                  <span
                    className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${
                      studentIelts >= s.minIelts
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {studentIelts >= s.minIelts ? "✓" : "✗"} IELTS ≥ {s.minIelts}
                  </span>
                )}
                {s.eligibility && (
                  <span className="text-[10px] text-gray-500 dark:text-slate-300 bg-gray-50 dark:bg-slate-900 rounded-full px-2.5 py-1 border border-gray-100 dark:border-slate-700">
                    {s.eligibility}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
