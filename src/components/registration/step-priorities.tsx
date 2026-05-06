"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import {
  PREFERENCE_CATEGORIES,
  PRIORITY_BUDGET,
  PRIORITY_MIN,
  PRIORITY_MAX,
  type UserPreferenceData,
} from "@/lib/preference-categories";

interface StepPrioritiesProps {
  preferences: UserPreferenceData[];
  onNext: (priorities: Record<string, number>) => void;
  onBack: () => void;
  loading?: boolean;
}

export function StepPriorities({
  preferences,
  onNext,
  onBack,
  loading,
}: StepPrioritiesProps) {
  // Build initial priorities from existing preferences or defaults
  const [priorities, setPriorities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const cfg of PREFERENCE_CATEGORIES) {
      const pref = preferences.find((p) => p.categoryKey === cfg.key);
      init[cfg.key] = pref?.priority ?? cfg.defaultPriority;
    }
    return init;
  });

  const total = Object.values(priorities).reduce((a, b) => a + b, 0);
  const overBudget = total > PRIORITY_BUDGET;

  const setOne = useCallback((key: string, val: number) => {
    setPriorities((prev) => ({ ...prev, [key]: Math.max(PRIORITY_MIN, Math.min(PRIORITY_MAX, val)) }));
  }, []);

  function handleSubmit() {
    onNext(priorities);
  }

  // Gauge fill percentage (capped at 100% visually)
  const gaugePct = Math.min(100, (total / PRIORITY_BUDGET) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Budget gauge */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[color:var(--color-muted)]">
            Priority budget
          </span>
          <span
            className={cn(
              "text-[12px] font-semibold tabular-nums transition-colors duration-200",
              overBudget
                ? "text-amber-500"
                : "text-[color:var(--color-accent)]",
            )}
          >
            {total} / {PRIORITY_BUDGET}
          </span>
        </div>

        {/* Track */}
        <div className="relative h-1.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              overBudget ? "bg-amber-400" : "bg-[color:var(--color-accent)]",
            )}
            animate={{ width: `${gaugePct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {overBudget && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-amber-500"
          >
            Over budget — AI will still work, but consider trimming lower-priority items.
          </motion.p>
        )}
      </div>

      {/* Category sliders */}
      <div className="flex flex-col gap-3">
        {PREFERENCE_CATEGORIES.map((cfg) => {
          const val = priorities[cfg.key] ?? cfg.defaultPriority;
          const pref = preferences.find((p) => p.categoryKey === cfg.key);
          const hasValues = (pref?.values.length ?? 0) > 0;
          const pct = ((val - PRIORITY_MIN) / (PRIORITY_MAX - PRIORITY_MIN)) * 100;

          return (
            <div key={cfg.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "text-[12px] font-medium truncate transition-colors",
                      hasValues
                        ? "text-[color:var(--color-text)]"
                        : "text-[color:var(--color-muted)]/60",
                    )}
                  >
                    {cfg.label}
                  </span>
                  {!hasValues && (
                    <span className="text-[9px] text-[color:var(--color-muted)]/40 shrink-0">
                      (no tags)
                    </span>
                  )}
                </div>

                {/* Numeric nudge buttons + value */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setOne(cfg.key, val - 1)}
                    disabled={val <= PRIORITY_MIN}
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 transition-colors text-sm leading-none"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="text-[12px] font-semibold tabular-nums w-6 text-center text-[color:var(--color-text)]">
                    {val}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOne(cfg.key, val + 1)}
                    disabled={val >= PRIORITY_MAX}
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 transition-colors text-sm leading-none"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="relative h-1.5 rounded-full bg-[color:var(--color-border)]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--color-accent)]"
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step={1}
                  value={val}
                  onChange={(e) => setOne(cfg.key, Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                  aria-label={`${cfg.label} priority`}
                />
              </div>

              {/* Min/max labels */}
              <div className="flex justify-between text-[9px] text-[color:var(--color-muted)]/40">
                <span>{PRIORITY_MIN} low</span>
                <span>high {PRIORITY_MAX}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 rounded-xl py-3 text-sm font-medium border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] transition-colors duration-150 disabled:opacity-50"
        >
          ← Back
        </button>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="flex-[2] rounded-xl py-3 text-sm font-semibold bg-[color:var(--color-accent)] text-white hover:opacity-90 transition-opacity duration-200 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Finish setup →"}
        </motion.button>
      </div>
    </motion.div>
  );
}
