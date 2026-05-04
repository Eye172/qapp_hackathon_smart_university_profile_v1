"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import type { RSDetail } from "@/lib/rs-score";

interface AIInsightsProps {
  rsDetail: RSDetail;
  universityName: string;
  studentGpa: number;
  studentIelts: number;
  uniMinGpa?: number;
  uniMinIelts?: number;
  uniMinSat?: number;
  studentSat?: number;
  missingDocs?: string[];
  className?: string;
}

/* ─── Score pill color ──────────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 75) return { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" };
  if (score >= 50) return { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" };
  if (score >= 30) return { bg: "#fef9c3", text: "#a16207", dot: "#eab308" };
  return { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" };
}

/* ─── Match row ─────────────────────────────────────────────── */
function MatchRow({
  label,
  weight,
  isMatch,
}: {
  label: string;
  weight: number;
  isMatch: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold",
          isMatch
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-50 text-amber-600",
        )}
      >
        {isMatch ? "✓" : "!"}
      </span>
      <span className="text-xs text-gray-700 leading-snug flex-1">{label}</span>
      <span className="flex-shrink-0 text-[10px] font-semibold tabular-nums text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">
        ×{weight}
      </span>
    </li>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────── */
function SkeletonBlock() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {[80, 95, 70, 88].map((w, i) => (
        <div
          key={i}
          className="h-3.5 rounded-full bg-gray-200"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export function AIInsightsClient({
  rsDetail,
  universityName,
  studentGpa,
  studentIelts,
  uniMinGpa = 0,
  uniMinIelts = 0,
  uniMinSat,
  studentSat,
  missingDocs = [],
  className,
}: AIInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setIsAnalyzing(false), 900);
    return () => clearTimeout(t);
  }, []);

  const { score, matches, mismatches } = rsDetail;
  const colors = scoreColor(score);

  // Academic requirement gaps (not in RS engine — separate layer)
  const academicGaps: string[] = [];
  if (uniMinGpa > 0 && studentGpa < uniMinGpa)
    academicGaps.push(
      `GPA ${studentGpa} below min ${uniMinGpa} — may be ineligible`,
    );
  if (uniMinIelts > 0 && studentIelts < uniMinIelts)
    academicGaps.push(
      `IELTS ${studentIelts} below min ${uniMinIelts} — language requirement unmet`,
    );
  if (uniMinSat && studentSat && studentSat < uniMinSat)
    academicGaps.push(
      `SAT ${studentSat} below min ${uniMinSat}`,
    );
  missingDocs.forEach((d) =>
    academicGaps.push(`Missing document: ${d}`),
  );

  return (
    <div className={cn("h-full flex flex-col gap-4", className)}>
      {/* RS badge */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: colors.bg, color: colors.text }}
        >
          <span
            className={cn("w-1.5 h-1.5 rounded-full")}
            style={{ background: isAnalyzing ? "#93c5fd" : colors.dot }}
          />
          {isAnalyzing ? "Computing RS…" : `RS Score: ${score}`}
        </span>
        {!isAnalyzing && score > 0 && (
          <span className="text-[10px] text-gray-400">
            {score >= 75
              ? "Strong match"
              : score >= 50
                ? "Good match"
                : score >= 30
                  ? "Partial match"
                  : "Low match"}{" "}
            · weighted by your priorities
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="skel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1"
          >
            <div className="space-y-3">
              <div className="h-4 w-36 rounded-full bg-gray-200 animate-pulse" />
              <SkeletonBlock />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-28 rounded-full bg-gray-200 animate-pulse" />
              <SkeletonBlock />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1"
          >
            {/* ── Why it's a Fit ──────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> Why it&apos;s a Fit
              </h3>
              {matches.length === 0 ? (
                <p className="text-xs text-gray-400 leading-relaxed">
                  No strong preference matches for {universityName}. Consider
                  updating your preferences in the Profile tab.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {matches.map((m, i) => (
                    <MatchRow
                      key={i}
                      label={m.label}
                      weight={m.weight}
                      isMatch={true}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* ── Gaps & Risks ──────────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="text-amber-500">⚠</span> Gaps &amp; Risks
              </h3>
              {mismatches.length === 0 && academicGaps.length === 0 ? (
                <p className="text-xs text-emerald-600 font-medium leading-snug">
                  No critical gaps detected — strong candidate.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {mismatches.map((m, i) => (
                    <MatchRow
                      key={i}
                      label={m.label}
                      weight={m.weight}
                      isMatch={false}
                    />
                  ))}
                  {academicGaps.map((g, i) => (
                    <li key={`acad-${i}`} className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-[9px] font-bold text-red-600">
                        ✗
                      </span>
                      <span className="text-xs text-gray-700 leading-snug">
                        {g}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
