"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import {
  PREFERENCE_CATEGORIES,
  PRIORITY_BUDGET,
  PRIORITY_MIN,
  PRIORITY_MAX,
  type UserPreferenceData,
} from "@/lib/preference-categories";

/* ── PreferencesEditor ───────────────────────────────────────────── */

export function PreferencesEditor() {
  const [preferences, setPreferences] = useState<UserPreferenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  /* ── Load ──────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/preferences");
      if (!res.ok) return;
      const data = (await res.json()) as UserPreferenceData[];
      setPreferences(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  /* ── Tags: add ─────────────────────────────────────────────────── */
  async function addValue(categoryKey: string, value: string) {
    const res = await fetch(`/api/preferences/${categoryKey}/values`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) return;
    // re-fetch for authoritative state (handles maxValues=1)
    const fresh = await fetch("/api/preferences");
    if (fresh.ok) setPreferences((await fresh.json()) as UserPreferenceData[]);
  }

  /* ── Tags: delete ──────────────────────────────────────────────── */
  async function deleteValue(categoryKey: string, valueId: string) {
    // Optimistic
    setPreferences((prev) =>
      prev.map((p) =>
        p.categoryKey === categoryKey
          ? { ...p, values: p.values.filter((v) => v.id !== valueId) }
          : p,
      ),
    );
    await fetch(`/api/preferences/${categoryKey}/values/${valueId}`, { method: "DELETE" });
  }

  /* ── Priorities: local state derived from loaded prefs ────────── */
  const [priorities, setPriorities] = useState<Record<string, number>>({});
  useEffect(() => {
    if (preferences.length === 0) return;
    const init: Record<string, number> = {};
    for (const cfg of PREFERENCE_CATEGORIES) {
      const pref = preferences.find((p) => p.categoryKey === cfg.key);
      init[cfg.key] = pref?.priority ?? cfg.defaultPriority;
    }
    setPriorities(init);
  }, [preferences]);

  const setOne = (key: string, val: number) =>
    setPriorities((prev) => ({ ...prev, [key]: Math.max(PRIORITY_MIN, Math.min(PRIORITY_MAX, val)) }));

  const total = Object.values(priorities).reduce((a, b) => a + b, 0);
  const overBudget = total > PRIORITY_BUDGET;
  const gaugePct = Math.min(100, (total / PRIORITY_BUDGET) * 100);

  /* ── Save priorities ────────────────────────────────────────────── */
  async function savePriorities() {
    setSaving(true);
    const updates = Object.entries(priorities).map(([categoryKey, priority]) => ({
      categoryKey,
      priority,
    }));
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-[color:var(--color-border)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Tags section ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold text-[color:var(--color-muted)] uppercase tracking-wide">
          Preferences
        </h3>
        <div className="flex flex-col gap-1.5">
          {PREFERENCE_CATEGORIES.map((cfg) => {
            const pref = preferences.find((p) => p.categoryKey === cfg.key);
            const values = pref?.values ?? [];
            return (
              <CategoryRow
                key={cfg.key}
                cfg={cfg}
                values={values}
                onAdd={(v) => addValue(cfg.key, v)}
                onDelete={(id) => deleteValue(cfg.key, id)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Priorities section ────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-[13px] font-semibold text-[color:var(--color-muted)] uppercase tracking-wide">
          Priority coefficients
        </h3>

        {/* Budget gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[color:var(--color-muted)]">Total budget</span>
            <span className={cn(
              "text-[12px] font-semibold tabular-nums",
              overBudget ? "text-amber-500" : "text-[color:var(--color-accent)]",
            )}>
              {total} / {PRIORITY_BUDGET}
            </span>
          </div>
          <div className="relative h-1.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
            <motion.div
              className={cn("absolute inset-y-0 left-0 rounded-full", overBudget ? "bg-amber-400" : "bg-[color:var(--color-accent)]")}
              animate={{ width: `${gaugePct}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          {overBudget && (
            <p className="text-[10px] text-amber-500">
              Over budget — AI still works, but consider balancing priorities.
            </p>
          )}
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-4">
          {PREFERENCE_CATEGORIES.map((cfg) => {
            const val = priorities[cfg.key] ?? cfg.defaultPriority;
            const pref = preferences.find((p) => p.categoryKey === cfg.key);
            const hasValues = (pref?.values.length ?? 0) > 0;
            const pct = ((val - PRIORITY_MIN) / (PRIORITY_MAX - PRIORITY_MIN)) * 100;

            return (
              <div key={cfg.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[12px] font-medium",
                    hasValues ? "text-[color:var(--color-text)]" : "text-[color:var(--color-muted)]/60",
                  )}>
                    {cfg.label}
                    {!hasValues && <span className="ml-1.5 text-[9px] opacity-50">(no tags)</span>}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOne(cfg.key, val - 1)}
                      disabled={val <= PRIORITY_MIN}
                      className="w-5 h-5 rounded flex items-center justify-center text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 text-sm"
                    >−</button>
                    <span className="text-[12px] font-semibold tabular-nums w-6 text-center">{val}</span>
                    <button
                      type="button"
                      onClick={() => setOne(cfg.key, val + 1)}
                      disabled={val >= PRIORITY_MAX}
                      className="w-5 h-5 rounded flex items-center justify-center text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 text-sm"
                    >+</button>
                  </div>
                </div>
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
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <motion.button
            type="button"
            onClick={savePriorities}
            disabled={saving}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[color:var(--color-accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save priorities"}
          </motion.button>
          <AnimatePresence>
            {savedFlash && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[12px] text-emerald-600 font-medium"
              >
                Saved ✓ — AI will re-evaluate on next visit
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── CategoryRow (inline add/remove chips) ───────────────────────── */

interface CategoryRowProps {
  cfg: (typeof PREFERENCE_CATEGORIES)[number];
  values: { id: string; value: string }[];
  onAdd: (value: string) => Promise<void>;
  onDelete: (valueId: string) => Promise<void>;
}

function CategoryRow({ cfg, values, onAdd, onDelete }: CategoryRowProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleAdd() {
    const v = inputVal.trim();
    if (!v) return;
    setAdding(true);
    await onAdd(v);
    setInputVal("");
    setAdding(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border transition-colors duration-150",
        open
          ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-surface)]"
          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={cn(
          "flex-1 text-[13px] font-medium truncate",
          values.length > 0 ? "text-[color:var(--color-text)]" : "text-[color:var(--color-muted)]",
        )}>
          {cfg.label}
        </span>
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
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "shrink-0 text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-colors duration-150",
            open
              ? "bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]"
              : "bg-[color:var(--color-accent)] text-white",
          )}
        >
          {open ? "Done" : "Edit"}
        </motion.button>
      </div>

      {/* Chips */}
      <AnimatePresence initial={false}>
        {values.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
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
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] rounded-full pl-2.5 pr-1.5 py-0.5"
                >
                  {v.value}
                  <button
                    type="button"
                    onClick={() => onDelete(v.id)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
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
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex flex-col gap-2">
              {/* Example chips */}
              {cfg.examples && inputVal === "" && (
                <div className="flex flex-wrap gap-1">
                  {cfg.examples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setInputVal(ex)}
                      className="text-[10px] text-[color:var(--color-muted)] border border-[color:var(--color-border)] rounded-full px-2 py-0.5 hover:border-[color:var(--color-accent)]/50 hover:text-[color:var(--color-accent)] transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type={cfg.inputType === "number" ? "number" : "text"}
                  placeholder={cfg.placeholder}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={adding}
                  className="flex-1 text-sm bg-transparent border-b border-[color:var(--color-border)] focus:outline-none focus:border-[color:var(--color-accent)] transition-colors text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)]/40 pb-1"
                />
                <motion.button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding || !inputVal.trim()}
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "shrink-0 text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-all",
                    inputVal.trim()
                      ? "bg-[color:var(--color-accent)] text-white"
                      : "bg-[color:var(--color-border)] text-[color:var(--color-muted)] cursor-not-allowed",
                  )}
                >
                  {adding ? "…" : "↵ Add"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
