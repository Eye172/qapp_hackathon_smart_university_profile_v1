"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { IUniversityProfile } from "@/lib/types";
import { ActionButton } from "@/components/ui/button";
import { AIFitRing } from "@/components/ui/ai-fit-ring";
import { CheckCircle, ChevronRight, XCircle } from "@/components/ui/icon";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { useSessionStore } from "@/store/useSessionStore";
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

/* ─── Tag pill component ─────────────────────────────────────────────────── */
function TagChip({
  tag,
  university,
  className,
}: {
  tag: string;
  university: IUniversityProfile;
  className?: string;
}) {
  const variant = classifyTag(tag, university);

  const styles: Record<TagVariant, string> = {
    match:
      "bg-[color:var(--color-tag-match)] text-[color:var(--color-tag-match-text)] border border-[color:var(--color-tag-match-text)]/20",
    nomatch:
      "bg-[color:var(--color-tag-no-match)] text-[color:var(--color-tag-no-match-text)] border border-[color:var(--color-tag-no-match-text)]/20",
    neutral:
      "bg-white/20 text-white border border-white/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
        styles[variant],
        className,
      )}
    >
      {tag}
    </span>
  );
}

/* ─── Campus image with fallback ─────────────────────────────────────────── */
function CampusImage({ src, alt }: { src?: string; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  const show = src && !errored;

  if (show) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        onError={() => setErrored(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300"
      aria-hidden
    />
  );
}

/* ─── Component props ────────────────────────────────────────────────────── */
export interface HorizontalFeedNodeProps
  extends Omit<HTMLMotionProps<"article">, "children"> {
  university: IUniversityProfile;
  onEnter?: (id: string) => void;
  isActive?: boolean;
}

/* ─── HorizontalFeedNode ─────────────────────────────────────────────────── */
export const HorizontalFeedNode = React.forwardRef<
  HTMLElement,
  HorizontalFeedNodeProps
>(function HorizontalFeedNode(
  { university, onEnter, isActive = true, className, ...props },
  ref,
) {
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const saveNode = useAlgorithmStore((s) => s.saveNode);
  const hideNode = useAlgorithmStore((s) => s.hideNode);

  const isSaved = saved.includes(university.id);
  const isHidden = hidden.includes(university.id);

  const cheapestProgram = React.useMemo(() => {
    if (university.programs.length === 0) return null;
    return university.programs.reduce((min, p) =>
      p.tuitionUsdPerYear < min.tuitionUsdPerYear ? p : min,
    );
  }, [university.programs]);

  const displayScore = university.recommendationScore ?? university.fitScore;

  return (
    <motion.article
      ref={ref}
      layout
      className={cn(
        "relative h-[80vh] w-[22rem] rounded-3xl overflow-hidden select-none",
        "card-shadow",
        className,
      )}
      whileHover={isActive ? { y: -3 } : undefined}
      transition={{ ease: "circOut", duration: 0.22 }}
      aria-hidden={isActive ? undefined : true}
      tabIndex={isActive ? undefined : -1}
      inert={isActive ? undefined : true}
      {...props}
    >
      {/* Campus photo */}
      <CampusImage
        src={university.heroImageUrl ?? university.campusPhoto}
        alt={`${university.name} campus`}
      />

      {/* Gradient overlay — stronger at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.10) 100%)",
        }}
        aria-hidden
      />

      {/* Top-right: RS score badge */}
      {university.recommendationScore != null && (
        <div
          className="absolute top-4 right-4 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{
            background: "rgba(129,88,58,0.85)",
            color: "#fff",
            backdropFilter: "blur(8px)",
          }}
        >
          RS {university.recommendationScore}
        </div>
      )}

      {/* Header */}
      <header className="absolute top-4 left-4 right-16 text-white">
        <h3 className="font-display text-[length:var(--text-fluid-xl)] leading-tight drop-shadow-md line-clamp-2">
          {university.name}
        </h3>
        <p className="text-[length:var(--text-fluid-xs)] opacity-80 mt-0.5">
          {university.city}, {university.country}
          {university.worldRank ? ` · #${university.worldRank} world` : ""}
        </p>
      </header>

      {/* Bottom content */}
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        {/* Left: score ring + tags + price */}
        <div className="flex flex-col items-start gap-2 text-white max-w-[58%]">
          <AIFitRing score={displayScore} size={80} strokeWidth={7} />

          {/* Colored tags */}
          <div className="flex flex-wrap gap-1">
            {university.tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} tag={tag} university={university} />
            ))}
          </div>

          {/* Cheapest program price */}
          {cheapestProgram && cheapestProgram.tuitionUsdPerYear > 0 ? (
            <p className="text-[length:var(--text-fluid-xs)] opacity-85">
              from{" "}
              <span className="font-semibold tabular-nums">
                ${cheapestProgram.tuitionUsdPerYear.toLocaleString()}/yr
              </span>
              {cheapestProgram.scholarshipAvailable ? " · scholarship" : ""}
            </p>
          ) : null}
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-1.5">
            <ActionButton
              variant={isSaved ? "primary" : "glass"}
              size="icon"
              aria-label={isSaved ? "Saved" : "Save"}
              aria-pressed={isSaved}
              onClick={(e) => {
                e.stopPropagation();
                saveNode(university.id);
              }}
            >
              <CheckCircle size={16} />
            </ActionButton>
            <ActionButton
              variant={isHidden ? "primary" : "glass"}
              size="icon"
              aria-label={isHidden ? "Hidden" : "Hide"}
              aria-pressed={isHidden}
              onClick={(e) => {
                e.stopPropagation();
                hideNode(university.id);
              }}
            >
              <XCircle size={16} />
            </ActionButton>
          </div>
          {isActive && (
            <ActionButton
              variant="primary"
              size="md"
              onClick={() => onEnter?.(university.id)}
            >
              Enter <ChevronRight size={14} />
            </ActionButton>
          )}
        </div>
      </div>
    </motion.article>
  );
});

HorizontalFeedNode.displayName = "HorizontalFeedNode";
