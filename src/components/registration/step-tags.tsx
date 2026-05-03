"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import {
  PREFERENCE_CATEGORIES,
  type UserPreferenceData,
} from "@/lib/preference-categories";

interface StepTagsProps {
  preferences: UserPreferenceData[];
  onUpdate: (categoryKey: string, values: { id: string; value: string }[]) => void;
  onAddValue: (categoryKey: string, value: string) => Promise<{ id: string; value: string } | null>;
  onDeleteValue: (categoryKey: string, valueId: string) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

export function StepTags({
  preferences,
  onAddValue,
  onDeleteValue,
  onNext,
  onBack,
}: StepTagsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loadingAdd, setLoadingAdd] = useState<Record<string, boolean>>({});
  const [loadingDel, setLoadingDel] = useState<Record<string, string | null>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Focus input when a category becomes active
  useEffect(() => {
    if (activeCategory) {
      inputRefs.current[activeCategory]?.focus();
    }
  }, [activeCategory]);

  async function handleAdd(key: string) {
    const raw = inputValues[key]?.trim();
    if (!raw) return;
    setLoadingAdd((p) => ({ ...p, [key]: true }));
    const result = await onAddValue(key, raw);
    if (result) {
      setInputValues((p) => ({ ...p, [key]: "" }));
    }
    setLoadingAdd((p) => ({ ...p, [key]: false }));
  }

  async function handleDelete(categoryKey: string, valueId: string) {
    setLoadingDel((p) => ({ ...p, [valueId]: categoryKey }));
    await onDeleteValue(categoryKey, valueId);
    setLoadingDel((p) => ({ ...p, [valueId]: null }));
  }

  function handleKeyDown(e: React.KeyboardEvent, key: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(key);
    }
    if (e.key === "Escape") setActiveCategory(null);
  }

  // Count filled categories for progress hint
  const filledCount = preferences.filter((p) => p.values.length > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Hint bar */}
      <div className="flex items-center justify-between text-[11px] text-[color:var(--color-muted)]/70">
        <span>Add what matters to you</span>
        <span>
          {filledCount}/{PREFERENCE_CATEGORIES.length} filled
        </span>
      </div>

      {/* Category rows */}
      <div className="flex flex-col gap-1.5">
        {PREFERENCE_CATEGORIES.map((cfg) => {
          const pref = preferences.find((p) => p.categoryKey === cfg.key);
          const values = pref?.values ?? [];
          const isActive = activeCategory === cfg.key;
          const inputVal = inputValues[cfg.key] ?? "";
          const busy = loadingAdd[cfg.key] ?? false;

          return (
            <motion.div
              key={cfg.key}
              layout
              className={cn(
                "rounded-xl border transition-colors duration-200",
                isActive
                  ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-surface)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
              )}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Category label */}
                <span
                  className={cn(
                    "text-[13px] font-medium flex-1 min-w-0 truncate transition-colors duration-150",
                    values.length > 0
                      ? "text-[color:var(--color-text)]"
                      : "text-[color:var(--color-muted)]",
                  )}
                >
                  {cfg.label}
                </span>

                {/* Value count badge */}
                <AnimatePresence>
                  {values.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="text-[10px] font-semibold text-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10 rounded-full px-2 py-0.5 shrink-0"
                    >
                      {values.length}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Add / collapse button */}
                <motion.button
                  type="button"
                  onClick={() =>
                    setActiveCategory((prev) => (prev === cfg.key ? null : cfg.key))
                  }
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "shrink-0 text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-colors duration-150",
                    isActive
                      ? "bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]"
                      : "bg-[color:var(--color-accent)] text-white",
                  )}
                >
                  {isActive ? "Done" : "Add"}
                </motion.button>
              </div>

              {/* Chips row */}
              <AnimatePresence initial={false}>
                {values.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                      {values.map((v) => (
                        <motion.span
                          key={v.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] rounded-full pl-2.5 pr-1.5 py-0.5"
                        >
                          {v.value}
                          <button
                            type="button"
                            disabled={loadingDel[v.id] != null}
                            onClick={() => handleDelete(cfg.key, v.id)}
                            className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity rounded-full"
                            aria-label={`Remove ${v.value}`}
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline input */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 flex gap-2">
                      {/* Example chips */}
                      {cfg.examples && inputVal === "" && (
                        <div className="flex flex-wrap gap-1 mr-1">
                          {cfg.examples.map((ex) => (
                            <button
                              key={ex}
                              type="button"
                              onClick={() => setInputValues((p) => ({ ...p, [cfg.key]: ex }))}
                              className="text-[10px] text-[color:var(--color-muted)] border border-[color:var(--color-border)] rounded-full px-2 py-0.5 hover:border-[color:var(--color-accent)]/50 hover:text-[color:var(--color-accent)] transition-colors duration-150"
                            >
                              {ex}
                            </button>
                          ))}
                        </div>
                      )}
                      <input
                        ref={(el) => { inputRefs.current[cfg.key] = el; }}
                        type={cfg.inputType === "number" ? "number" : "text"}
                        placeholder={cfg.placeholder}
                        value={inputVal}
                        onChange={(e) => setInputValues((p) => ({ ...p, [cfg.key]: e.target.value }))}
                        onKeyDown={(e) => handleKeyDown(e, cfg.key)}
                        disabled={busy}
                        className={cn(
                          "flex-1 min-w-0 text-sm bg-transparent border-b border-[color:var(--color-border)]",
                          "focus:outline-none focus:border-[color:var(--color-accent)] transition-colors duration-200",
                          "text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)]/40 pb-1",
                        )}
                      />
                      <motion.button
                        type="button"
                        onClick={() => handleAdd(cfg.key)}
                        disabled={busy || !inputVal.trim()}
                        whileTap={{ scale: 0.92 }}
                        className={cn(
                          "shrink-0 text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-all duration-150",
                          inputVal.trim()
                            ? "bg-[color:var(--color-accent)] text-white"
                            : "bg-[color:var(--color-border)] text-[color:var(--color-muted)] cursor-not-allowed",
                        )}
                      >
                        {busy ? "…" : "↵"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl py-3 text-sm font-medium border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] transition-colors duration-150"
        >
          ← Back
        </button>
        <motion.button
          type="button"
          onClick={onNext}
          whileTap={{ scale: 0.98 }}
          className="flex-[2] rounded-xl py-3 text-sm font-semibold bg-[color:var(--color-accent)] text-white hover:opacity-90 transition-opacity duration-200"
        >
          Next: Priorities →
        </motion.button>
      </div>
    </motion.div>
  );
}
