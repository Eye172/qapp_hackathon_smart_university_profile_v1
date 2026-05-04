"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { IUniversityProfile } from "@/lib/types";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { cn } from "@/lib/tailwind-utils";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface DeadlineNode {
  id: string;
  universityId: string;
  universityName: string;
  label: string;
  date: Date;
  accent: string;
  isCustom: boolean;
  done: boolean;
}

/* ─── Accent colors ─────────────────────────────────────────────────── */
const PALETTE = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16"];
function accentFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function daysUntil(d: Date) {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}
function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

/* ─── Countdown bar ──────────────────────────────────────────────────── */
function CountdownBar({ date, accent }: { date: Date; accent: string }) {
  const days = daysUntil(date);
  const past = days < 0;
  const urgent = !past && days <= 14;
  const pct = Math.max(0, Math.min(100, ((180 - Math.max(0, days)) / 180) * 100));
  return (
    <div className="mt-2">
      <p className={cn("text-[9px] font-semibold mb-1", past ? "text-gray-400" : urgent ? "text-red-500" : "text-gray-500")}>
        {past ? `${Math.abs(days)}d ago` : days === 0 ? "Today!" : `${days}d left`}
      </p>
      <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.1 }}
          className="h-full rounded-full"
          style={{ background: past ? "#e5e7eb" : accent }}
        />
      </div>
    </div>
  );
}

/* ─── Deadline card ──────────────────────────────────────────────────── */
function DeadlineCard({
  node, onToggle, onRemove, onNavigate,
}: {
  node: DeadlineNode;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate: (uid: string) => void;
}) {
  const past = daysUntil(node.date) < 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: node.done || past ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="bg-white rounded-2xl border border-gray-100 p-3.5"
      style={{ borderTop: `2.5px solid ${node.accent}` }}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          className={cn(
            "mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all",
            node.done ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-green-400",
          )}
          style={{ width: 18, height: 18 }}
        >
          {node.done && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path d="M1 4l2.5 2.5L7 1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p
            className={cn("text-[12px] font-semibold leading-snug truncate", node.done ? "line-through text-gray-400" : "text-gray-900 cursor-pointer hover:text-blue-600")}
            onClick={() => !node.isCustom && onNavigate(node.universityId)}
          >
            {node.label}
          </p>
          {!node.isCustom && <p className="text-[10px] text-gray-400 truncate">{node.universityName}</p>}
          <p className="text-[10px] text-gray-400 mt-0.5">{fmt(node.date)}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(node.id)}
          className="shrink-0 w-5 h-5 rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
            <path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <CountdownBar date={node.date} accent={node.accent} />
    </motion.div>
  );
}

/* ─── Add deadline modal ─────────────────────────────────────────────── */
function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (label: string, date: string) => void }) {
  const [label, setLabel] = React.useState("");
  const [date, setDate] = React.useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="bg-white rounded-3xl p-6 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-semibold mb-4">Add custom deadline</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Label</label>
            <input
              type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Essay draft due"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Date</label>
            <input
              type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 h-9 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            type="button"
            disabled={!label.trim() || !date}
            onClick={() => { onAdd(label.trim(), date); onClose(); }}
            className="flex-1 h-9 rounded-xl bg-blue-600 text-white text-[12px] font-semibold disabled:opacity-40 hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Global timeline ruler ──────────────────────────────────────────── */
function TimelineRuler({ nodes }: { nodes: DeadlineNode[] }) {
  const now = new Date();
  const sorted = [...nodes].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (sorted.length === 0) return null;

  const first = sorted[0].date;
  const last = sorted[sorted.length - 1].date;
  const span = Math.max(last.getTime() - first.getTime(), 1);

  function pct(d: Date) {
    return ((d.getTime() - first.getTime()) / span) * 100;
  }
  const nowPct = Math.max(0, Math.min(100, pct(now)));

  return (
    <div className="relative h-14 mx-8 my-2">
      {/* Track */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 rounded-full" />

      {/* Now indicator */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 rounded-full"
        style={{ left: `${nowPct}%` }}
      >
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-600 whitespace-nowrap">Now</span>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow shadow-blue-300" />
      </div>

      {/* Deadline dots */}
      {sorted.map((n) => {
        const p = pct(n.date);
        const past = daysUntil(n.date) < 0;
        return (
          <div
            key={n.id}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${p}%` }}
            title={`${n.label} — ${fmt(n.date)}`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full border-2 border-white shadow"
              style={{ background: past ? "#d1d5db" : n.accent }}
            />
          </div>
        );
      })}

      {/* Date labels at edges */}
      <p className="absolute -bottom-4 left-0 text-[9px] text-gray-400">{fmt(first)}</p>
      <p className="absolute -bottom-4 right-0 text-[9px] text-gray-400">{fmt(last)}</p>
    </div>
  );
}

/* ─── University column ──────────────────────────────────────────────── */
function UniversityColumn({
  universityId,
  universityName,
  nodes,
  accent,
  onToggle,
  onRemove,
  onNavigate,
  onColorChange,
}: {
  universityId: string;
  universityName: string;
  nodes: DeadlineNode[];
  accent: string;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate: (uid: string) => void;
  onColorChange: (uid: string, color: string) => void;
}) {
  const colorRef = React.useRef<HTMLInputElement>(null);
  const sorted = [...nodes].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none"
        style={{ background: `${accent}14`, border: `1px solid ${accent}30` }}
        onClick={() => onNavigate(universityId)}
      >
        {/* Color dot / picker */}
        <button
          type="button"
          title="Change color"
          onClick={(e) => { e.stopPropagation(); colorRef.current?.click(); }}
          className="shrink-0 w-3 h-3 rounded-full border-2 border-white shadow transition hover:scale-125"
          style={{ background: accent }}
        />
        <input
          ref={colorRef}
          type="color"
          defaultValue={accent}
          onChange={(e) => onColorChange(universityId, e.target.value)}
          className="sr-only"
        />
        <p className="text-[11px] font-semibold text-gray-800 truncate flex-1">{universityName}</p>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-gray-400" aria-hidden>
          <path d="M2.5 3.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Deadline cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((n) => (
            <DeadlineCard
              key={n.id}
              node={{ ...n, accent }}
              onToggle={onToggle}
              onRemove={onRemove}
              onNavigate={onNavigate}
            />
          ))}
        </AnimatePresence>
        {sorted.length === 0 && (
          <p className="text-[11px] text-gray-400 text-center py-4">No deadlines</p>
        )}
      </div>
    </div>
  );
}

/* ─── Timeline page ──────────────────────────────────────────────────── */
export default function TimelinePage() {
  const router = useRouter();
  const saved = useAlgorithmStore((s) => s.savedUniversities);

  const [universities, setUniversities] = React.useState<IUniversityProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [nodes, setNodes] = React.useState<DeadlineNode[]>([]);
  const [accents, setAccents] = React.useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = React.useState(false);
  const [customCount, setCustomCount] = React.useState(0);

  React.useEffect(() => {
    fetch("/api/universities")
      .then((r) => (r.ok ? (r.json() as Promise<IUniversityProfile[]>) : []))
      .then((data) => setUniversities(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Build nodes from saved universities */
  React.useEffect(() => {
    const savedUnis = universities.filter((u) => saved.includes(u.id));
    const built: DeadlineNode[] = [];
    for (const u of savedUnis) {
      const accent = accents[u.id] ?? accentFor(u.id);
      if (!accents[u.id]) {
        setAccents((prev) => ({ ...prev, [u.id]: accent }));
      }
      if (u.applicationDeadline) {
        built.push({
          id: `${u.id}-app`,
          universityId: u.id,
          universityName: u.name,
          label: "Application deadline",
          date: new Date(u.applicationDeadline),
          accent,
          isCustom: false,
          done: false,
        });
      }
    }
    setNodes((prev) => {
      const custom = prev.filter((n) => n.isCustom);
      return [...built, ...custom];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universities, saved]);

  function toggleDone(id: string) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
  }
  function removeNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }
  function addCustom(label: string, date: string) {
    const id = `custom-${Date.now()}-${customCount}`;
    setCustomCount((c) => c + 1);
    setNodes((prev) => [
      ...prev,
      {
        id,
        universityId: "custom",
        universityName: "Custom",
        label,
        date: new Date(date),
        accent: "#6366f1",
        isCustom: true,
        done: false,
      },
    ]);
  }
  function changeAccent(uid: string, color: string) {
    setAccents((prev) => ({ ...prev, [uid]: color }));
    setNodes((prev) => prev.map((n) => (n.universityId === uid ? { ...n, accent: color } : n)));
  }

  const savedUnis = universities.filter((u) => saved.includes(u.id));
  const customNodes = nodes.filter((n) => n.isCustom);

  /* Group non-custom nodes by university */
  const byUni = React.useMemo(() => {
    const map = new Map<string, DeadlineNode[]>();
    for (const n of nodes.filter((n) => !n.isCustom)) {
      const arr = map.get(n.universityId) ?? [];
      arr.push(n);
      map.set(n.universityId, arr);
    }
    return map;
  }, [nodes]);

  const allNodes = nodes.filter((n) => !n.isCustom);
  const upcomingCount = allNodes.filter((n) => daysUntil(n.date) >= 0 && !n.done).length;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-8 pt-7 pb-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight leading-none">Deadlines</h1>
          <p className="text-[11px] text-gray-400 mt-1">
            {loading ? (
              <span className="inline-block w-28 h-3 rounded bg-gray-200 animate-pulse" />
            ) : (
              <><span className="text-blue-600 font-semibold">{upcomingCount}</span> upcoming</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Add deadline
        </button>
      </header>

      {/* Top rail */}
      <div className="shrink-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6 mb-2" />

      {/* Global timeline ruler */}
      {allNodes.length > 0 && (
        <div className="shrink-0 bg-white mx-6 rounded-2xl border border-gray-100 px-4 py-3 mb-5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Timeline overview</p>
          <TimelineRuler nodes={allNodes} />
          <div className="mt-6" />
        </div>
      )}

      {/* Main grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 rounded-xl bg-gray-100 animate-pulse" />
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-gray-300 mb-3" aria-hidden>
              <rect x="8" y="6" width="24" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M14 14h12M14 20h8M14 26h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <p className="text-gray-400 text-sm mb-2">No saved universities yet.</p>
            <button
              type="button"
              className="text-blue-600 text-sm underline underline-offset-2"
              onClick={() => router.push("/feed")}
            >
              Discover universities →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* University columns */}
            {savedUnis.map((u) => (
              <UniversityColumn
                key={u.id}
                universityId={u.id}
                universityName={u.name}
                nodes={byUni.get(u.id) ?? []}
                accent={accents[u.id] ?? accentFor(u.id)}
                onToggle={toggleDone}
                onRemove={removeNode}
                onNavigate={(uid) => router.push(`/university/${uid}`)}
                onColorChange={changeAccent}
              />
            ))}

            {/* Custom column */}
            {customNodes.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <p className="text-[11px] font-semibold text-indigo-800">Personal</p>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {customNodes.map((n) => (
                      <DeadlineCard
                        key={n.id}
                        node={n}
                        onToggle={toggleDone}
                        onRemove={removeNode}
                        onNavigate={() => {}}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom rail */}
      <div className="shrink-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6" />

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addCustom} />}
      </AnimatePresence>
    </main>
  );
}
