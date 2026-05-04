"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { IStudentDocument } from "@/lib/types";

interface DocumentsChecklistProps {
  docs: IStudentDocument[];
}

type Group = "ready" | "review" | "missing";

function getGroup(doc: IStudentDocument): Group {
  if (doc.status === "verified") return "ready";
  if (doc.status === "uploaded") return "review";
  return "missing";
}

const GROUP_META: Record<
  Group,
  {
    icon: string;
    iconBg: string;
    iconText: string;
    badgeText: string;
    badgeBg: string;
    label: string;
  }
> = {
  ready: {
    icon: "✓",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    badgeText: "Verified",
    badgeBg: "bg-emerald-100 text-emerald-700",
    label: "Ready",
  },
  review: {
    icon: "⏳",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    badgeText: "In Review",
    badgeBg: "bg-blue-100 text-blue-600",
    label: "In Review",
  },
  missing: {
    icon: "!",
    iconBg: "bg-red-50",
    iconText: "text-red-500",
    badgeText: "Missing",
    badgeBg: "bg-red-50 text-red-500",
    label: "Needs Action",
  },
};

export function DocumentsChecklist({ docs }: DocumentsChecklistProps) {
  const readyCount = docs.filter((d) => d.status === "verified").length;
  const total = docs.length;
  const pct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  const grouped: Record<Group, IStudentDocument[]> = {
    ready: docs.filter((d) => getGroup(d) === "ready"),
    review: docs.filter((d) => getGroup(d) === "review"),
    missing: docs.filter((d) => getGroup(d) === "missing"),
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
      <p className="text-xs uppercase tracking-wider text-blue-500 font-semibold mb-0.5">
        Documents
      </p>
      <h2 className="text-lg font-bold text-gray-900 mb-5">Application Checklist</h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500">
            {readyCount} of {total} documents verified
          </span>
          <span className="font-bold text-gray-700">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Grouped document rows */}
      <div className="space-y-5">
        {(["missing", "review", "ready"] as Group[]).map((group) => {
          const items = grouped[group];
          if (!items.length) return null;
          const meta = GROUP_META[group];

          return (
            <div key={group}>
              <p
                className={`text-[10px] uppercase tracking-widest font-bold mb-2.5 ${meta.iconText}`}
              >
                {meta.label} ({items.length})
              </p>
              <ul className="space-y-2">
                {items.map((d, i) => (
                  <motion.li
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/25 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={[
                          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                          meta.iconBg,
                          meta.iconText,
                        ].join(" ")}
                      >
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {d.kind.replace(/_/g, " ")}
                        </p>
                        {d.fileName && (
                          <p className="text-[10px] text-gray-400 truncate">{d.fileName}</p>
                        )}
                      </div>
                    </div>

                    {group === "missing" ? (
                      <button
                        type="button"
                        className="flex-shrink-0 text-xs text-blue-600 border border-blue-200 rounded-xl px-3 py-1.5 hover:bg-blue-50 font-semibold transition-all active:scale-95"
                      >
                        Upload
                      </button>
                    ) : (
                      <span
                        className={`flex-shrink-0 text-[10px] font-bold rounded-full px-2.5 py-1 ${meta.badgeBg}`}
                      >
                        {meta.badgeText}
                      </span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>
          );
        })}

        {docs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No documents on your profile yet.
          </p>
        )}
      </div>
    </section>
  );
}
