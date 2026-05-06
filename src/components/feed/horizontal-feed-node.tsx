"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, AnimatePresence } from "framer-motion";
import type { IUniversityProfile } from "@/lib/types";
import { AIFitRing } from "@/components/ui/ai-fit-ring";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { localizeUniversity } from "@/lib/i18n";
import { cn } from "@/lib/tailwind-utils";

/* ─── Tag classification ─────────────────────────────────────────────────── */
type TagVariant = "match" | "nomatch" | "neutral";

function classifyTag(tag: string, university: IUniversityProfile): TagVariant {
  const profile = useSessionStore.getState().profile;
  const t = tag.toLowerCase();

  // Interest match
  if (
    profile.interests.some(
      (i) =>
        i.toLowerCase().includes(t) ||
        t.includes(i.toLowerCase().split(" ")[0]),
    )
  ) {
    return "match";
  }

  // Country match
  if (
    profile.preferredCountries.some(
      (c) =>
        c.toLowerCase().includes(t) ||
        t.includes(c.toLowerCase().split(" ")[0]),
    )
  ) {
    return "match";
  }

  // Budget-friendly match
  if (
    profile.budgetUsdPerYear &&
    (t.includes("scholarship") || t.includes("grant") || t.includes("free"))
  ) {
    return "match";
  }

  // English medium → match for English-speaking student
  if (
    t.includes("english") &&
    profile.ielts.overall >= 6.0
  ) {
    return "match";
  }

  // Language barrier → no-match
  if (
    (t.includes("german-medium") ||
      t.includes("chinese-medium") ||
      t.includes("russian-medium") ||
      t.includes("french-medium")) &&
    !profile.interests.some((i) => i.toLowerCase().includes("german") ||
      i.toLowerCase().includes("chinese") ||
      i.toLowerCase().includes("russian"))
  ) {
    return "nomatch";
  }

  // Tuition exceeds budget → surface on cheapest program tags
  const cheapest =
    university.programs.length > 0
      ? university.programs.reduce((min, p) =>
          p.tuitionUsdPerYear < min.tuitionUsdPerYear ? p : min,
        )
      : null;
  if (
    cheapest &&
    profile.budgetUsdPerYear &&
    cheapest.tuitionUsdPerYear > profile.budgetUsdPerYear &&
    t.includes("tuition")
  ) {
    return "nomatch";
  }

  return "neutral";
}

/* ─── Campus image with fallback ─────────────────────────────────────────── */
const CAMPUS_FALLBACK = "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=900&q=70";

function CampusImage({ src, alt }: { src?: string; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  const resolved = (!src || errored) ? CAMPUS_FALLBACK : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      onError={() => setErrored(true)}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

/* ─── Inline icon helpers ────────────────────────────────────────────────── */
function IconStar({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1.5l1.6 3.2 3.5.5-2.6 2.5.6 3.5L7 9.7l-3.1 1.5.6-3.5L2 5.2l3.5-.5L7 1.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 2l10 10M5.5 5.6A2.5 2.5 0 009.4 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M3 6.2C4 4.7 5.4 3.5 7 3.5c.7 0 1.4.2 2 .6M11 7.8C10 9.3 8.6 10.5 7 10.5c-.7 0-1.4-.2-2-.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M2.5 6.5h8M7 3.5l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Tag chip ────────────────────────────────────────────────────────────── */
function TagChip({ tag, university }: { tag: string; university: IUniversityProfile }) {
  const variant = classifyTag(tag, university);
  const cls =
    variant === "match"
      ? "bg-emerald-500/18 text-emerald-300 ring-1 ring-emerald-400/30"
      : variant === "nomatch"
        ? "bg-red-500/15 text-red-300 ring-1 ring-red-400/25"
        : "bg-white/10 text-white/75 ring-1 ring-white/15";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-[2px] text-[9px] font-semibold tracking-wide leading-none", cls)}>
      {variant === "match" && <span className="mr-0.5 text-emerald-600">✓</span>}
      {variant === "nomatch" && <span className="mr-0.5">✗</span>}
      {tag}
    </span>
  );
}

/* ─── Stat chip ───────────────────────────────────────────────────────────── */
function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center px-2.5 py-1.5 rounded-xl min-w-0"
      style={{ background: "rgba(36,99,235,0.22)", border: "1px solid rgba(96,165,250,0.18)" }}
    >
      <span className="text-[9px] uppercase tracking-wider font-semibold leading-none" style={{ color: "rgba(147,197,253,0.70)" }}>{label}</span>
      <span className="text-[11px] font-bold leading-tight mt-0.5 tabular-nums text-white">{value}</span>
    </div>
  );
}

/* ─── Component props ────────────────────────────────────────────────────── */
export interface HorizontalFeedNodeProps
  extends Omit<HTMLMotionProps<"article">, "children"> {
  university: IUniversityProfile;
  rsScore?: number;  // computed per-user RS; falls back to university.recommendationScore
  onEnter?: (id: string) => void;
  isActive?: boolean;
}

/* ─── HorizontalFeedNode ─────────────────────────────────────────────────── */
export const HorizontalFeedNode = React.forwardRef<
  HTMLElement,
  HorizontalFeedNodeProps
>(function HorizontalFeedNode(
  { university, rsScore, onEnter, isActive = true, className, ...props },
  ref,
) {
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const saveNode = useAlgorithmStore((s) => s.saveNode);
  const hideNode = useAlgorithmStore((s) => s.hideNode);

  const lang = useSettingsStore((s) => s.language);
  const { name: localName } = localizeUniversity(university, lang);

  const isSaved = saved.includes(university.id);
  const isHidden = hidden.includes(university.id);

  const cheapestTuition = React.useMemo(() => {
    if (university.programs.length === 0) return null;
    const min = university.programs.reduce((a, b) =>
      b.tuitionUsdPerYear < a.tuitionUsdPerYear ? b : a,
    );
    return min.tuitionUsdPerYear > 0 ? min : null;
  }, [university.programs]);

  const displayScore = rsScore ?? university.recommendationScore ?? university.fitScore;
  const hasScholarship = university.programs.some((p) => p.scholarshipAvailable);

  return (
    <motion.article
      ref={ref}
      className={cn(
        "group relative h-[68vh] w-[21rem] rounded-[28px] overflow-hidden select-none gpu-smooth",
        "shadow-[0_40px_110px_-32px_rgba(0,60,255,0.40),0_20px_52px_-22px_rgba(4,8,26,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]",
        className,
      )}
      whileHover={isActive ? { y: -4, scale: 1.008 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      aria-hidden={isActive ? undefined : true}
      tabIndex={isActive ? undefined : -1}
      inert={isActive ? undefined : true}
      {...props}
    >
      {/* ── Campus photo ─────────────────────────────────────────── */}
      <CampusImage
        src={university.heroImageUrl ?? university.campusPhoto ?? university.photos?.[0]}
        alt={`${university.name} campus`}
      />

      {/* ── Photo gradient overlay ──────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 48% 16%, rgba(36,99,235,0.22), transparent 36%), linear-gradient(to top, rgba(4,8,26,0.98) 0%, rgba(6,14,40,0.70) 38%, rgba(6,14,40,0.14) 66%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* ── TOP BADGE ROW ───────────────────────────────────────── */}
      <div className="absolute top-4 inset-x-4 flex items-start justify-between">
        {/* Country + city */}
        <div
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/90 leading-none"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
        >
          {university.city}, {university.country}
        </div>

        {/* RS badge */}
        {displayScore > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
            className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white leading-none flex items-center gap-1"
            style={{ background: "rgba(37,99,235,0.88)", backdropFilter: "blur(8px)" }}
          >
            <span className="text-blue-200 text-[8px]">RS</span>
            {Math.round(displayScore)}
          </motion.div>
        )}
      </div>

      {/* ── GLASS BOTTOM PANEL ─────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col">

        {/* ── Horizontal top boundary of the glass panel ────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div
          className="px-4 pt-4 pb-4 flex flex-col gap-3"
          style={{ background: "rgba(4,8,28,0.78)", backdropFilter: "blur(28px) saturate(170%)" }}
        >
          {/* Name row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-2">
                {localName}
              </h3>
              {university.worldRank && (
                <p className="text-[10px] text-white/50 mt-0.5 font-medium">
                  #{university.worldRank} World Ranking
                </p>
              )}
            </div>
            {/* Mini RS ring */}
            <div className="shrink-0 mt-0.5">
              <AIFitRing score={displayScore} size={44} strokeWidth={4} showLabel />
            </div>
          </div>

          {/* ── Stat chips widget ─────────────────────────────────── */}
          <div className="flex gap-1.5 flex-wrap">
            {university.programs.length > 0 && (
              <StatChip label="Programs" value={String(university.programs.length)} />
            )}
            {cheapestTuition && (
              <StatChip
                label="From"
                value={`$${(cheapestTuition.tuitionUsdPerYear / 1000).toFixed(0)}k/yr`}
              />
            )}
            {cheapestTuition === null && (
              <StatChip label="Tuition" value="Free" />
            )}
            {hasScholarship && (
              <StatChip label="Aid" value="✓ Avail" />
            )}
            {university.type && (
              <StatChip label="Type" value={university.type.slice(0, 6)} />
            )}
          </div>

          {/* ── Tag chips ──────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-1">
            {university.tags.slice(0, 4).map((tag) => (
              <TagChip key={tag} tag={tag} university={university} />
            ))}
          </div>

          {/* ── Horizontal divider ─────────────────────────────────── */}
          <div className="h-px bg-white/10" />

          {/* ── Action row ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Save */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); saveNode(university.id); }}
              aria-label={isSaved ? "Saved" : "Save"}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-200",
                isSaved
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/18 ring-1 ring-white/15",
              )}
            >
              <IconStar filled={isSaved} />
              {isSaved ? "Saved" : "Save"}
            </motion.button>

            {/* Hide */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); hideNode(university.id); }}
              aria-label="Hide"
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-200",
                isHidden
                  ? "bg-gray-600 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/18 ring-1 ring-white/15",
              )}
            >
              <IconEyeOff />
              Hide
            </motion.button>

            <div className="flex-1" />

            {/* View Details */}
            <AnimatePresence>
              {isActive && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  onClick={() => onEnter?.(university.id)}
                  className="flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3.5 py-1.5 shadow-lg shadow-blue-900/40 transition-colors duration-150"
                >
                  View Details <IconArrow />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

HorizontalFeedNode.displayName = "HorizontalFeedNode";
