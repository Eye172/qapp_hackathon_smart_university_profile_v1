"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HorizontalFeedNode } from "@/components/feed/horizontal-feed-node";
import type { IUniversityProfile } from "@/lib/types";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { ChevronLeft, ChevronRight } from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";

/* ─── Carousel slot config ─────────────────────────────────────────────── */
type SlotOffset = -2 | -1 | 0 | 1 | 2;

const SLOT_CONFIG: Record<
  SlotOffset,
  { x: number; scale: number; opacity: number; zIndex: number }
> = {
  [-2]: { x: -520, scale: 0.64, opacity: 0.22, zIndex: 1 },
  [-1]: { x: -285, scale: 0.81, opacity: 0.58, zIndex: 2 },
  [0]:  { x: 0,    scale: 1.00, opacity: 1.00, zIndex: 4 },
  [1]:  { x: 285,  scale: 0.81, opacity: 0.58, zIndex: 2 },
  [2]:  { x: 520,  scale: 0.64, opacity: 0.22, zIndex: 1 },
};

const SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
  mass: 0.9,
};

/** Wrap index within bounds of array length */
function wrapIndex(idx: number, len: number): number {
  return ((idx % len) + len) % len;
}

/* ─── Skeleton placeholder ──────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="shrink-0 w-[22rem] h-[80vh] rounded-3xl bg-white/30 animate-pulse" />
  );
}

/* ─── Navigation dot ────────────────────────────────────────────────────── */
function NavDot({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Go to slide"
      onClick={onClick}
      className={cn(
        "rounded-full transition-all duration-300",
        active
          ? "w-6 h-2 bg-[color:var(--color-accent)]"
          : "w-2 h-2 bg-[color:var(--color-muted)]/30 hover:bg-[color:var(--color-muted)]/60",
      )}
    />
  );
}

/* ─── Feed page ──────────────────────────────────────────────────────────── */
export default function FeedPage() {
  const router = useRouter();
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);

  const [universities, setUniversities] = React.useState<IUniversityProfile[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const dragStartX = React.useRef(0);

  /* Restore scroll position from session storage */
  React.useEffect(() => {
    const stored = sessionStorage.getItem("feed:activeIndex");
    if (stored) setActiveIndex(Number(stored));
  }, []);

  React.useEffect(() => {
    fetch("/api/universities")
      .then((r) => (r.ok ? (r.json() as Promise<IUniversityProfile[]>) : []))
      .then((data) => {
        // Sort by recommendationScore (RS) → fitScore as fallback
        data.sort(
          (a, b) =>
            (b.recommendationScore ?? b.fitScore) -
            (a.recommendationScore ?? a.fitScore),
        );
        setUniversities(data);
      })
      .catch(() => setUniversities([]))
      .finally(() => setLoading(false));
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

  function prev() {
    goTo(clampedIndex - 1);
  }
  function next() {
    goTo(clampedIndex + 1);
  }

  /* Keyboard navigation */
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

  /* Build visible slots */
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
    <main className="min-h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="pt-10 pb-2 px-8 shrink-0">
        <h1 className="font-display text-[length:var(--text-fluid-2xl)] leading-tight">
          Discover
        </h1>
        <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)] mt-0.5">
          {loading
            ? "Loading universities…"
            : `${visible.length} ${visible.length === 1 ? "university" : "universities"} · sorted by AI fit score`}
        </p>
      </header>

      {/* Carousel stage */}
      <section
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        aria-label="University carousel"
      >
        {loading ? (
          <div className="flex items-center gap-6">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-[color:var(--color-muted)] text-center px-8">
            All universities hidden.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => useAlgorithmStore.getState().reset()}
            >
              Reset hidden list
            </button>{" "}
            to see them again.
          </p>
        ) : (
          <>
            {/* Cards container — perspective parent */}
            <div
              className="relative w-full"
              style={{ height: "82vh", perspective: "1400px" }}
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
                  }}
                  style={{
                    x: config.x,
                    y: "-50%",
                    zIndex: config.zIndex,
                    translateX: "-50%",
                  }}
                  transition={SPRING}
                  onClick={offset !== 0 ? () => goTo(clampedIndex + offset) : undefined}
                  /* Drag-to-navigate on center card */
                  drag={offset === 0 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragStart={(_, info) => {
                    dragStartX.current = info.point.x;
                  }}
                  onDragEnd={(_, info) => {
                    const delta = info.offset.x;
                    if (delta < -60) next();
                    else if (delta > 60) prev();
                  }}
                  whileDrag={{ cursor: "grabbing" }}
                >
                  <HorizontalFeedNode
                    university={university}
                    onEnter={offset === 0 ? enter : undefined}
                    isActive={offset === 0}
                  />
                </motion.div>
              ))}
            </div>

            {/* Arrow buttons */}
            <button
              type="button"
              aria-label="Previous university"
              onClick={prev}
              disabled={clampedIndex === 0}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2",
                "w-10 h-10 flex items-center justify-center rounded-full glass",
                "transition-all duration-200 text-[color:var(--color-text)]",
                clampedIndex === 0
                  ? "opacity-25 cursor-not-allowed"
                  : "hover:bg-white/70 hover:scale-105",
              )}
              style={{ zIndex: 10 }}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              aria-label="Next university"
              onClick={next}
              disabled={clampedIndex >= visible.length - 1}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2",
                "w-10 h-10 flex items-center justify-center rounded-full glass",
                "transition-all duration-200 text-[color:var(--color-text)]",
                clampedIndex >= visible.length - 1
                  ? "opacity-25 cursor-not-allowed"
                  : "hover:bg-white/70 hover:scale-105",
              )}
              style={{ zIndex: 10 }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </section>

      {/* Navigation dots */}
      {!loading && visible.length > 1 && (
        <nav
          className="flex items-center justify-center gap-2 py-5 shrink-0"
          aria-label="Slide navigation"
        >
          {visible.map((_, i) => (
            <NavDot
              key={i}
              active={i === clampedIndex}
              onClick={() => goTo(i)}
            />
          ))}
        </nav>
      )}
    </main>
  );
}
