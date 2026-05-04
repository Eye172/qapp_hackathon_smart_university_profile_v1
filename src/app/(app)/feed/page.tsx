"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HorizontalFeedNode } from "@/components/feed/horizontal-feed-node";
import type { IUniversityProfile } from "@/lib/types";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { useSessionStore } from "@/store/useSessionStore";
import { computeRS } from "@/lib/rs-score";
import type { UserPreferenceData } from "@/lib/preference-categories";
import { cn } from "@/lib/tailwind-utils";

/* ─── Carousel slot config ─────────────────────────────────────────────── */
type SlotOffset = -2 | -1 | 0 | 1 | 2;

const SLOT_CONFIG: Record<
  SlotOffset,
  { x: number; scale: number; opacity: number; zIndex: number; blur: number }
> = {
  [-2]: { x: -490, scale: 0.60, opacity: 0.16, zIndex: 1, blur: 4 },
  [-1]: { x: -270, scale: 0.80, opacity: 0.52, zIndex: 2, blur: 1.5 },
  [0]:  { x: 0,    scale: 1.00, opacity: 1.00, zIndex: 4, blur: 0 },
  [1]:  { x: 270,  scale: 0.80, opacity: 0.52, zIndex: 2, blur: 1.5 },
  [2]:  { x: 490,  scale: 0.60, opacity: 0.16, zIndex: 1, blur: 4 },
};

const SPRING = {
  type: "spring" as const,
  stiffness: 160,
  damping: 38,
  mass: 1.2,
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function CardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="shrink-0 w-[21rem] h-[68vh] rounded-[28px] bg-gray-200/60 animate-pulse"
    />
  );
}

/* ─── Inline chevron icons ───────────────────────────────────────────────── */
function ChevL() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M11 4.5L6.5 9 11 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevR() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M7 4.5L11.5 9 7 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Nav dot ────────────────────────────────────────────────────────────── */
function NavDot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Go to slide"
      onClick={onClick}
      animate={{ width: active ? 20 : 6, opacity: active ? 1 : 0.35 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="h-1.5 rounded-full bg-blue-600 origin-left"
    />
  );
}

/* ─── Feed page ──────────────────────────────────────────────────────────── */
export default function FeedPage() {
  const router = useRouter();
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const profile = useSessionStore((s) => s.profile);

  const [universities, setUniversities] = React.useState<IUniversityProfile[]>([]);
  const [rsMap, setRsMap] = React.useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = sessionStorage.getItem("feed:activeIndex");
    if (stored) setActiveIndex(Number(stored));
  }, []);

  React.useEffect(() => {
    let unis: IUniversityProfile[] = [];
    let prefs: UserPreferenceData[] = [];

    Promise.all([
      fetch("/api/universities")
        .then((r) => r.ok ? (r.json() as Promise<IUniversityProfile[]>) : [])
        .then((d) => { unis = d; }),
      fetch("/api/preferences")
        .then((r) => r.ok ? (r.json() as Promise<UserPreferenceData[]>) : [])
        .then((d) => { prefs = d; })
        .catch(() => {}),
    ])
      .then(() => {
        // Compute per-user RS for every university
        const profileSnap = {
          gpa: profile.gpa,
          ielts: profile.ielts,
          sat: profile.sat,
          budgetUsdPerYear: profile.budgetUsdPerYear,
        };
        const map: Record<string, number> = {};
        for (const u of unis) {
          const detail = computeRS(u, prefs, profileSnap);
          // If no preferences set yet, fall back to static DB score
          map[u.id] = detail.score > 0
            ? detail.score
            : (u.recommendationScore ?? u.fitScore);
        }
        setRsMap(map);

        // Sort by computed RS desc
        unis.sort((a, b) => (map[b.id] ?? 0) - (map[a.id] ?? 0));
        setUniversities(unis);
      })
      .catch(() => setUniversities([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = React.useMemo(
    () => universities.filter((u) => !hidden.includes(u.id)),
    [universities, hidden],
  );

  const clampedIndex = Math.min(activeIndex, Math.max(0, visible.length - 1));

  function goTo(idx: number) {
    const next = Math.max(0, Math.min(idx, visible.length - 1));
    setActiveIndex(next);
    sessionStorage.setItem("feed:activeIndex", String(next));
  }
  const prev = () => goTo(clampedIndex - 1);
  const next = () => goTo(clampedIndex + 1);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedIndex, visible.length]);

  function enter(id: string) {
    sessionStorage.setItem("feed:activeIndex", String(clampedIndex));
    router.push(`/university/${id}`);
  }

  const offsets: SlotOffset[] = [-2, -1, 0, 1, 2];
  const slots = offsets
    .map((offset) => {
      const rawIdx = clampedIndex + offset;
      if (rawIdx < 0 || rawIdx >= visible.length) return null;
      return { offset, university: visible[rawIdx], config: SLOT_CONFIG[offset] };
    })
    .filter(Boolean) as Array<{
    offset: SlotOffset;
    university: IUniversityProfile;
    config: (typeof SLOT_CONFIG)[SlotOffset];
  }>;

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-8 pt-7 pb-4">
        <div>
          <h1 className="font-display text-[22px] leading-none text-gray-900 tracking-tight">
            Discover
          </h1>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">
            {loading ? (
              <span className="inline-block w-32 h-3 rounded bg-gray-200 animate-pulse" />
            ) : (
              <>
                <span className="text-blue-600 font-semibold">{visible.length}</span>
                {" "}universities · sorted by AI fit
              </>
            )}
          </p>
        </div>

        {/* Keyboard hint — desktop only */}
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-gray-400 select-none">
          <span className="border border-gray-200 rounded-md px-1.5 py-0.5 bg-white shadow-sm font-mono">←</span>
          <span className="border border-gray-200 rounded-md px-1.5 py-0.5 bg-white shadow-sm font-mono">→</span>
          <span className="ml-1">navigate</span>
        </div>
      </header>

      {/* ── TOP HORIZONTAL RAIL ─────────────────────────────────── */}
      <div className="shrink-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6" />

      {/* ── Carousel Stage ──────────────────────────────────────── */}
      <section
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        aria-label="University carousel"
      >
        {loading ? (
          <div className="flex items-end justify-center gap-5 px-8 h-full pb-6 pt-4">
            {[0.1, 0, 0.1].map((delay, i) => (
              <CardSkeleton key={i} delay={delay} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-8"
          >
            <p className="text-gray-400 text-sm mb-3">All universities hidden.</p>
            <button
              type="button"
              className="text-blue-600 text-sm font-medium underline underline-offset-2"
              onClick={() => useAlgorithmStore.getState().reset()}
            >
              Reset hidden list
            </button>
          </motion.div>
        ) : (
          <>
            {/* Perspective container */}
            <div
              className="relative w-full"
              style={{ height: "72vh", perspective: "1200px" }}
            >
              {slots.map(({ offset, university, config }) => (
                <motion.div
                  key={university.id}
                  className={cn(
                    "absolute top-1/2 left-1/2",
                    offset !== 0 ? "cursor-pointer" : "",
                  )}
                  animate={{
                    x: config.x,
                    scale: config.scale,
                    opacity: config.opacity,
                    y: "-50%",
                    filter: `blur(${config.blur}px)`,
                  }}
                  style={{
                    x: config.x,
                    y: "-50%",
                    zIndex: config.zIndex,
                    translateX: "-50%",
                  }}
                  transition={SPRING}
                  onClick={offset !== 0 ? () => goTo(clampedIndex + offset) : undefined}
                  drag={offset === 0 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -55) next();
                    else if (info.offset.x > 55) prev();
                  }}
                  whileDrag={{ cursor: "grabbing" }}
                >
                  <HorizontalFeedNode
                    university={university}
                    rsScore={rsMap[university.id]}
                    onEnter={offset === 0 ? enter : undefined}
                    isActive={offset === 0}
                  />
                </motion.div>
              ))}
            </div>

            {/* Arrow buttons */}
            <motion.button
              type="button"
              aria-label="Previous"
              onClick={prev}
              disabled={clampedIndex === 0}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "absolute left-5 top-1/2 -translate-y-1/2 z-10",
                "w-9 h-9 flex items-center justify-center rounded-full",
                "bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md text-gray-700",
                "transition-opacity duration-200",
                clampedIndex === 0 ? "opacity-20 cursor-not-allowed" : "hover:border-blue-200 hover:text-blue-600",
              )}
            >
              <ChevL />
            </motion.button>

            <motion.button
              type="button"
              aria-label="Next"
              onClick={next}
              disabled={clampedIndex >= visible.length - 1}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "absolute right-5 top-1/2 -translate-y-1/2 z-10",
                "w-9 h-9 flex items-center justify-center rounded-full",
                "bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md text-gray-700",
                "transition-opacity duration-200",
                clampedIndex >= visible.length - 1
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:border-blue-200 hover:text-blue-600",
              )}
            >
              <ChevR />
            </motion.button>
          </>
        )}
      </section>

      {/* ── BOTTOM HORIZONTAL RAIL ──────────────────────────────── */}
      <div className="shrink-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6" />

      {/* ── Nav controls ────────────────────────────────────────── */}
      <footer className="shrink-0 flex items-center justify-center gap-3 py-4 px-8">
        {!loading && visible.length > 1 && (
          <>
            <span className="text-[10px] text-gray-400 tabular-nums w-12 text-right">
              {clampedIndex + 1} / {visible.length}
            </span>
            <nav className="flex items-center gap-1.5" aria-label="Slide navigation">
              {visible.map((_, i) => (
                <NavDot key={i} active={i === clampedIndex} onClick={() => goTo(i)} />
              ))}
            </nav>
            <span className="w-12" />
          </>
        )}
      </footer>
    </main>
  );
}
