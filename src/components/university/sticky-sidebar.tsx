"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { AIFitRing } from "@/components/ui/ai-fit-ring";

interface StickySidebarProps {
  universityId: string;
  rsScore: number;
  pendingCount: number;
  university: {
    city: string;
    country: string;
    founded?: number;
    type?: string;
    languages?: string;
    applicationDeadline?: string;
    websiteUrl?: string;
    contactEmail?: string;
  };
}

/* ── Match label ────────────────────────────────────────────────────────── */
function matchMeta(score: number) {
  if (score >= 75) return { label: "Strong Match", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (score >= 55) return { label: "Good Match",   cls: "text-indigo-700  bg-indigo-50  border-indigo-200"  };
  if (score >= 35) return { label: "Partial Match", cls: "text-amber-700  bg-amber-50   border-amber-200"   };
  return             { label: "Low Match",   cls: "text-red-600   bg-red-50    border-red-200"    };
}

/* ── Lucide-style SVG icons ─────────────────────────────────────────────── */
function IconPin()      { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418-4.418-7-7.582-7-11a7 7 0 1114 0c0 3.418-2.582 6.582-7 11z"/><circle cx="12" cy="10" r="2" fill="currentColor" strokeWidth="0"/></svg>; }
function IconBuilding() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path strokeLinecap="round" d="M8 7V5a4 4 0 018 0v2"/><path strokeLinecap="round" d="M9 12h6M9 16h6"/></svg>; }
function IconGlobe()    { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M3.5 9h17M3.5 15h17M12 3c-3 4-3 14 0 18M12 3c3 4 3 14 0 18"/></svg>; }
function IconCalendar() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4"/></svg>; }
function IconGrad()     { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 8l10 5 10-5-10-5zM2 8v6m20-6v6M6 10.6V17c0 1.657 2.686 3 6 3s6-1.343 6-3v-6.4"/></svg>; }
function IconArrowLeft(){ return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"/></svg>; }
function IconMail()     { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path strokeLinecap="round" d="M2 7l10 7 10-7"/></svg>; }
function IconExternalLink() { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>; }
function IconBookmark({ filled }: { filled: boolean }) {
  return <svg className="w-3.5 h-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
}
function IconEyeOff() { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }

export function StickySidebar({ universityId, rsScore, pendingCount, university }: StickySidebarProps) {
  const router     = useRouter();
  const saveNode   = useAlgorithmStore((s) => s.saveNode);
  const unsaveNode = useAlgorithmStore((s) => s.unsaveNode);
  const hideNode   = useAlgorithmStore((s) => s.hideNode);
  const saved      = useAlgorithmStore((s) => s.savedUniversities);
  const hidden     = useAlgorithmStore((s) => s.hiddenUniversities);

  const isSaved  = saved.includes(universityId);
  const isHidden = hidden.includes(universityId);
  const match    = matchMeta(rsScore);

  const infoItems = [
    { icon: <IconPin/>,      label: "Location",  value: `${university.city}, ${university.country}`, highlight: false },
    university.founded       ? { icon: <IconBuilding/>, label: "Founded",   value: String(university.founded), highlight: false } : null,
    university.type          ? { icon: <IconGrad/>,     label: "Type",      value: university.type,   highlight: false } : null,
    university.languages     ? { icon: <IconGlobe/>,    label: "Languages", value: university.languages, highlight: false } : null,
    university.applicationDeadline ? { icon: <IconCalendar/>, label: "Deadline", value: university.applicationDeadline, highlight: true } : null,
  ].filter(Boolean) as Array<{ icon: React.ReactNode; label: string; value: string; highlight: boolean }>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      {/* ── Fit score card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center gap-4">
        {/* Glow wrapper around ring */}
        <div style={{ filter: `drop-shadow(0 0 18px rgba(79,70,229,${Math.round(rsScore / 100 * 0.45 * 100) / 100}))` }}>
          <AIFitRing score={rsScore} size={120} strokeWidth={11}/>
        </div>

        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-3.5 py-1.5 border ${match.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"/>
          {match.label}
        </span>

        {pendingCount > 0 && (
          <div className="w-full text-center rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-500/25 px-3 py-2.5">
            <p className="text-xs font-bold text-amber-700">
              {pendingCount} action{pendingCount > 1 ? "s" : ""} needed
            </p>
          </div>
        )}
      </div>

      {/* ── Quick info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3.5">Quick Info</p>
        <div className="space-y-3">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 ${item.highlight ? "text-amber-500" : "text-slate-400"}`}>
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide leading-none mb-0.5">{item.label}</p>
                <p className={`text-xs font-semibold truncate ${item.highlight ? "text-amber-600" : "text-slate-800 dark:text-slate-100"}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => isSaved ? unsaveNode(universityId) : saveNode(universityId)}
            className={[
              "flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all active:scale-95",
              isSaved
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-700",
            ].join(" ")}
          >
            <IconBookmark filled={isSaved}/>{isSaved ? "Saved" : "Save"}
          </button>

          <button
            type="button"
            onClick={() => hideNode(universityId)}
            className={[
              "flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all active:scale-95",
              isHidden
                ? "bg-slate-700 text-white border-slate-700"
                : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
            ].join(" ")}
          >
            <IconEyeOff/>{isHidden ? "Hidden" : "Hide"}
          </button>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-0.5">
          {university.contactEmail && (
            <a href={`mailto:${university.contactEmail}`}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/25 transition-all font-medium">
              <IconMail/> Email Admissions
            </a>
          )}
          {university.websiteUrl && (
            <a href={university.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/25 transition-all font-medium">
              <IconExternalLink/> Official Website
            </a>
          )}
          <button type="button" onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium">
            <IconArrowLeft/> Back to Feed
          </button>
        </div>
      </div>
    </motion.div>
  );
}
