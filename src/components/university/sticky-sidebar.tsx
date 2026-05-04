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

function matchMeta(score: number) {
  if (score >= 75)
    return {
      label: "Strong Match",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    };
  if (score >= 55)
    return {
      label: "Good Match",
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    };
  if (score >= 35)
    return {
      label: "Partial Match",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    };
  return {
    label: "Low Match",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  };
}

export function StickySidebar({
  universityId,
  rsScore,
  pendingCount,
  university,
}: StickySidebarProps) {
  const router = useRouter();
  const saveNode = useAlgorithmStore((s) => s.saveNode);
  const unsaveNode = useAlgorithmStore((s) => s.unsaveNode);
  const hideNode = useAlgorithmStore((s) => s.hideNode);
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);

  const isSaved = saved.includes(universityId);
  const isHidden = hidden.includes(universityId);
  const match = matchMeta(rsScore);

  const infoItems = [
    { icon: "📍", label: "Location", value: `${university.city}, ${university.country}` },
    university.founded
      ? { icon: "🏛", label: "Founded", value: String(university.founded) }
      : null,
    university.type ? { icon: "🎓", label: "Type", value: university.type } : null,
    university.languages
      ? { icon: "🌐", label: "Languages", value: university.languages }
      : null,
    university.applicationDeadline
      ? {
          icon: "📅",
          label: "Deadline",
          value: university.applicationDeadline,
          highlight: true,
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: string;
    label: string;
    value: string;
    highlight?: boolean;
  }>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* ── Score card ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
        <AIFitRing score={rsScore} size={116} strokeWidth={11} />

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3.5 py-1.5 border ${match.color} ${match.bg} ${match.border}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {match.label}
        </span>

        {pendingCount > 0 && (
          <div className="w-full text-center rounded-2xl bg-amber-50 border border-amber-200 px-3 py-2.5">
            <p className="text-xs font-bold text-amber-700">
              ⚠ {pendingCount} action{pendingCount > 1 ? "s" : ""} needed
            </p>
          </div>
        )}
      </div>

      {/* ── Quick info ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">
          Quick Info
        </p>
        <div className="space-y-3">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="text-base w-5 text-center flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400 leading-none mb-0.5">{item.label}</p>
                <p
                  className={`text-xs font-semibold truncate ${
                    item.highlight ? "text-amber-600" : "text-gray-800"
                  }`}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => (isSaved ? unsaveNode(universityId) : saveNode(universityId))}
            className={[
              "text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all active:scale-95",
              isSaved
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
            ].join(" ")}
          >
            {isSaved ? "★ Saved" : "☆ Save"}
          </button>

          <button
            type="button"
            onClick={() => hideNode(universityId)}
            className={[
              "text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all active:scale-95",
              isHidden
                ? "bg-gray-600 text-white border-gray-600"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
            ].join(" ")}
          >
            {isHidden ? "Hidden" : "Hide"}
          </button>
        </div>

        <div className="pt-1 border-t border-gray-100 space-y-1.5">
          {university.contactEmail && (
            <a
              href={`mailto:${university.contactEmail}`}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 py-1 transition-colors"
            >
              ✉ Email Admissions
            </a>
          )}
          {university.websiteUrl && (
            <a
              href={university.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 py-1 transition-colors"
            >
              🌐 Official Website ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
          >
            ← Back to Feed
          </button>
        </div>
      </div>
    </motion.div>
  );
}
