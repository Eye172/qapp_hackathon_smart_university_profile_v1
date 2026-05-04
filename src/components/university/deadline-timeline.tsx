"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface Milestone {
  id: string;
  label: string;
  due: string;
  isPast: boolean;
}

interface DeadlineTimelineProps {
  milestones: Milestone[];
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function DeadlineTimeline({ milestones }: DeadlineTimelineProps) {
  if (!milestones.length) return null;

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
      <p className="text-xs uppercase tracking-wider text-amber-500 font-semibold mb-0.5">
        Timeline
      </p>
      <h2 className="text-lg font-bold text-gray-900 mb-7">Key Deadlines</h2>

      <ol className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 via-blue-200 to-gray-100 rounded-full" />

        {milestones.map((m, i) => {
          const days = daysUntil(m.due);
          const isSoon = !m.isPast && days <= 30 && days > 0;
          const isCritical = !m.isPast && days <= 7 && days > 0;
          const isToday = days === 0;

          const dotStyle = m.isPast
            ? "bg-blue-600 border-blue-600 text-white"
            : isCritical || isToday
            ? "bg-red-500 border-red-500 text-white"
            : isSoon
            ? "bg-amber-400 border-amber-400 text-white"
            : "bg-white border-gray-300 text-gray-400";

          const countdownStyle = isCritical || isToday
            ? "bg-red-100 text-red-700"
            : isSoon
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-500";

          return (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-start gap-5 pb-7 last:pb-0"
            >
              {/* Dot */}
              <span
                className={[
                  "relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-sm transition-all",
                  dotStyle,
                  isCritical ? "animate-pulse" : "",
                ].join(" ")}
              >
                {m.isPast ? "✓" : i + 1}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        m.isPast ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.due)}</p>
                  </div>

                  {!m.isPast && (
                    <span
                      className={`flex-shrink-0 text-xs font-bold rounded-full px-3 py-1 ${countdownStyle}`}
                    >
                      {isToday
                        ? "Today!"
                        : days < 0
                        ? "Passed"
                        : days === 1
                        ? "1 day"
                        : `${days} days`}
                    </span>
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>

      {/* Today marker note */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <p className="text-xs text-gray-400">
          Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </section>
  );
}
