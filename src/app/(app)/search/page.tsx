"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { IUniversityProfile } from "@/lib/types";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { cn } from "@/lib/tailwind-utils";

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function useDebounce<T>(value: T, ms: number) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* ─── University row card ─────────────────────────────────────────────── */
function UniCard({
  university,
  onNavigate,
}: {
  university: IUniversityProfile;
  onNavigate: (id: string) => void;
}) {
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const saveNode = useAlgorithmStore((s) => s.saveNode);
  const isSaved = saved.includes(university.id);
  const score = university.recommendationScore ?? university.fitScore;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className="group flex items-center gap-4 glass-ultra rounded-2xl px-5 py-4 cursor-pointer card-lift"
      onClick={() => onNavigate(university.id)}
    >
      {/* Logo / Initials */}
      <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        {university.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={university.logoUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-blue-600 font-bold text-base leading-none">
            {university.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-gray-900 leading-snug truncate group-hover:text-blue-600 transition-colors duration-150">
          {university.name}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {university.city}, {university.country}
          {university.worldRank ? ` · #${university.worldRank} WR` : ""}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {university.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[9px] font-semibold rounded-full px-2 py-0.5 bg-gray-100 text-gray-500"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* RS score pill */}
      {score > 0 && (
        <div className="shrink-0 flex flex-col items-center">
          <span className="text-[11px] font-bold text-blue-600 tabular-nums">{Math.round(score)}</span>
          <span className="text-[8px] text-gray-400 uppercase tracking-wide">RS</span>
        </div>
      )}

      {/* Save toggle */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); saveNode(university.id); }}
        aria-label={isSaved ? "Saved" : "Save"}
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150",
          isSaved ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600",
        )}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
          <path
            d="M6.5 1.5l1.4 2.8 3.1.45-2.25 2.2.53 3.1L6.5 8.6l-2.78 1.45.53-3.1L2 4.75l3.1-.45L6.5 1.5z"
            stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
            fill={isSaved ? "currentColor" : "none"}
          />
        </svg>
      </button>

      {/* Chevron */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0 text-gray-300 group-hover:text-blue-400 transition-colors">
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

/* ─── Search page ─────────────────────────────────────────────────────── */
export default function SearchPage() {
  const router = useRouter();
  const [universities, setUniversities] = React.useState<IUniversityProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = React.useState(false);
  const debouncedQuery = useDebounce(query, 280);

  React.useEffect(() => {
    fetch("/api/universities")
      .then((r) => (r.ok ? (r.json() as Promise<IUniversityProfile[]>) : []))
      .then((data) => {
        data.sort((a, b) => (b.recommendationScore ?? b.fitScore) - (a.recommendationScore ?? a.fitScore));
        setUniversities(data);
      })
      .catch(() => setUniversities([]))
      .finally(() => setLoading(false));
  }, []);

  /* All unique tags across all universities */
  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    universities.forEach((u) => u.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [universities]);

  /* Filtered results */
  const results = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return universities.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTags =
        selectedTags.size === 0 || [...selectedTags].every((t) => u.tags.includes(t));
      return matchesQuery && matchesTags;
    });
  }, [universities, debouncedQuery, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <main className="min-h-screen premium-page flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-pattern-waves" aria-hidden />
      {/* Header */}
      <header className="shrink-0 px-8 pt-7 pb-5 relative z-10">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight leading-none">Search</h1>
        <p className="text-[11px] text-gray-400 mt-1">
          {loading ? (
            <span className="inline-block w-28 h-3 rounded bg-gray-200 animate-pulse" />
          ) : (
            <><span className="text-blue-600 font-semibold">{results.length}</span> results</>
          )}
        </p>
      </header>

      {/* Search bar + filter toggle */}
      <div className="shrink-0 px-8 pb-4 flex gap-3 items-center relative z-10">
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="University name, country, tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl premium-input border text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className={cn(
            "shrink-0 h-10 px-4 rounded-xl border text-[12px] font-medium flex items-center gap-2 transition-all duration-150",
            filterOpen || selectedTags.size > 0
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-300",
          )}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M1 2.5h11M3 6.5h7M5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Filters
          {selectedTags.size > 0 && (
            <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
              {selectedTags.size}
            </span>
          )}
        </button>
      </div>

      {/* Tag filter panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="overflow-hidden shrink-0"
          >
            <div className="px-8 pb-4">
              <div className="glass-ultra rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Filter by tag</p>
                  {selectedTags.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags(new Set())}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150 border",
                        selectedTags.has(tag)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top rail */}
      <div className="shrink-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6" />

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-8 py-5 relative z-10">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-gray-300 mb-4" aria-hidden>
              <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="2" />
              <path d="M27 27l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 18h8M18 14v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <p className="text-gray-400 text-sm">No universities match your search.</p>
            <button
              type="button"
              className="mt-3 text-blue-600 text-sm underline underline-offset-2"
              onClick={() => { setQuery(""); setSelectedTags(new Set()); }}
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {results.map((u) => (
                <UniCard
                  key={u.id}
                  university={u}
                  onNavigate={(id) => router.push(`/university/${id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
