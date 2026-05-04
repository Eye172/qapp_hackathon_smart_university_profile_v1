"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import {
  PREFERENCE_CATEGORIES,
  type PreferenceCategoryConfig,
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

interface CategoryRowProps {
  cfg: PreferenceCategoryConfig;
  values: { id: string; value: string }[];
  isActive: boolean;
  search: string;
  busyAdd: boolean;
  loadingDel: Record<string, string | null>;
  numericValue: string;
  onToggle: () => void;
  onSearchChange: (s: string) => void;
  onNumericChange: (v: string) => void;
  onNumericAdd: () => void;
  onChipToggle: (option: string, selected: { id: string; value: string } | undefined) => void;
}

function CategoryRow({
  cfg, values, isActive, search, busyAdd, loadingDel,
  numericValue, onToggle, onSearchChange, onNumericChange, onNumericAdd, onChipToggle,
}: CategoryRowProps) {
  const filteredOptions = useMemo(() => {
    if (!cfg.options) return [];
    if (!search) return cfg.options;
    return cfg.options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  }, [cfg.options, search]);

  const isOptions = !!cfg.options;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); onNumericAdd(); }
  }

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border transition-colors duration-200",
        isActive
          ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-surface)]"
          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className={cn(
          "text-[13px] font-medium flex-1 min-w-0 truncate",
          values.length > 0 ? "text-[color:var(--color-text)]" : "text-[color:var(--color-muted)]",
        )}>
          {cfg.label}
        </span>
        {values.length > 0 && (
          <span className="text-[10px] font-semibold text-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10 rounded-full px-2 py-0.5 shrink-0">
            {values.length} selected
          </span>
        )}
        <span className={cn(
          "shrink-0 text-[10px] font-bold rounded-lg px-2.5 py-1 transition-colors",
          isActive
            ? "bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]"
            : "bg-[color:var(--color-accent)] text-white",
        )}>
          {isActive ? "Done ✓" : "Select"}
        </span>
      </button>

      {/* Selected chips preview (collapsed) */}
      <AnimatePresence initial={false}>
        {!isActive && values.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {values.map((v) => (
                <span key={v.id} className="inline-flex items-center gap-1 text-[11px] font-medium bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] rounded-full pl-2.5 pr-1.5 py-0.5">
                  {v.value}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChipToggle(v.value, v); }}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            {isOptions ? (
              /* ── Chip selector ── */
              <div className="px-4 pb-4 space-y-3">
                {cfg.options!.length > 10 && (
                  <input
                    type="text"
                    placeholder="Filter options…"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[color:var(--color-accent)] transition-colors"
                  />
                )}
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                  {filteredOptions.map((option) => {
                    const selected = values.find((v) => v.value === option);
                    return (
                      <motion.button
                        key={option}
                        type="button"
                        whileTap={{ scale: 0.93 }}
                        disabled={busyAdd && !selected}
                        onClick={() => onChipToggle(option, selected)}
                        className={cn(
                          "text-[11px] font-semibold rounded-full px-3 py-1 border transition-all duration-150 active:scale-95",
                          selected
                            ? "bg-[color:var(--color-accent)] text-white border-[color:var(--color-accent)] shadow-sm"
                            : "bg-white text-[color:var(--color-muted)] border-[color:var(--color-border)] hover:border-[color:var(--color-accent)]/50 hover:text-[color:var(--color-accent)]",
                          loadingDel[selected?.id ?? ""] ? "opacity-50" : "",
                        )}
                      >
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ── Numeric free-text input ── */
              <div className="px-4 pb-3 flex gap-2 items-center">
                <input
                  type="number"
                  placeholder={cfg.placeholder}
                  value={numericValue}
                  onChange={(e) => onNumericChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={busyAdd}
                  className={cn(
                    "flex-1 min-w-0 text-sm bg-transparent border-b border-[color:var(--color-border)]",
                    "focus:outline-none focus:border-[color:var(--color-accent)] transition-colors duration-200",
                    "text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)]/40 pb-1",
                  )}
                />
                <button
                  type="button"
                  onClick={onNumericAdd}
                  disabled={busyAdd || !numericValue.trim()}
                  className={cn(
                    "shrink-0 text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-all active:scale-95",
                    numericValue.trim()
                      ? "bg-[color:var(--color-accent)] text-white"
                      : "bg-[color:var(--color-border)] text-[color:var(--color-muted)] cursor-not-allowed",
                  )}
                >
                  {busyAdd ? "…" : "↵"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StepTags({
  preferences,
  onAddValue,
  onDeleteValue,
  onNext,
  onBack,
}: StepTagsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [numericInputs, setNumericInputs] = useState<Record<string, string>>({});
  const [chipSearch, setChipSearch] = useState<Record<string, string>>({});
  const [loadingAdd, setLoadingAdd] = useState<Record<string, boolean>>({});
  const [loadingDel, setLoadingDel] = useState<Record<string, string | null>>({});

  const filledCount = preferences.filter((p) => p.values.length > 0).length;

  async function handleToggleChip(key: string, option: string, alreadySelected: { id: string; value: string } | undefined) {
    if (alreadySelected) {
      setLoadingDel((p) => ({ ...p, [alreadySelected.id]: key }));
      await onDeleteValue(key, alreadySelected.id);
      setLoadingDel((p) => ({ ...p, [alreadySelected.id]: null }));
    } else {
      const cfg = PREFERENCE_CATEGORIES.find((c) => c.key === key);
      const pref = preferences.find((p) => p.categoryKey === key);
      if (cfg?.maxValues && (pref?.values.length ?? 0) >= cfg.maxValues) return;
      setLoadingAdd((p) => ({ ...p, [key]: true }));
      await onAddValue(key, option);
      setLoadingAdd((p) => ({ ...p, [key]: false }));
    }
  }

  async function handleNumericAdd(key: string) {
    const raw = numericInputs[key]?.trim();
    if (!raw) return;
    setLoadingAdd((p) => ({ ...p, [key]: true }));
    const result = await onAddValue(key, raw);
    if (result) setNumericInputs((p) => ({ ...p, [key]: "" }));
    setLoadingAdd((p) => ({ ...p, [key]: false }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col gap-4"
    >
      {/* Hint bar */}
      <div className="flex items-center justify-between text-[11px] text-[color:var(--color-muted)]/70">
        <span>Select what matters to you</span>
        <span>{filledCount}/{PREFERENCE_CATEGORIES.length} filled</span>
      </div>

      {/* Category rows */}
      <div className="flex flex-col gap-2">
        {PREFERENCE_CATEGORIES.map((cfg) => {
          const pref = preferences.find((p) => p.categoryKey === cfg.key);
          const values = pref?.values ?? [];
          return (
            <CategoryRow
              key={cfg.key}
              cfg={cfg}
              values={values}
              isActive={activeCategory === cfg.key}
              search={chipSearch[cfg.key] ?? ""}
              busyAdd={loadingAdd[cfg.key] ?? false}
              loadingDel={loadingDel}
              numericValue={numericInputs[cfg.key] ?? ""}
              onToggle={() => setActiveCategory((prev) => (prev === cfg.key ? null : cfg.key))}
              onSearchChange={(s) => setChipSearch((p) => ({ ...p, [cfg.key]: s }))}
              onNumericChange={(v) => setNumericInputs((p) => ({ ...p, [cfg.key]: v }))}
              onNumericAdd={() => handleNumericAdd(cfg.key)}
              onChipToggle={(option, selected) => handleToggleChip(cfg.key, option, selected)}
            />
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
