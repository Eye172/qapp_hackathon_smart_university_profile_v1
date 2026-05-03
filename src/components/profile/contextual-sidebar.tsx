"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/button";
import { CheckCircle, ChevronRight } from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";

export interface TimelineMilestone {
  id: string;
  label: string;
  due?: string;
  status: "done" | "active" | "upcoming";
}

export interface ContextualSidebarProps
  extends React.HTMLAttributes<HTMLElement> {
  totalRequirements: number;
  readyRequirements: number;
  milestones: TimelineMilestone[];
  ctaLabel?: string;
  onStartApplication?: () => void;
}

export const ContextualSidebar = React.forwardRef<
  HTMLElement,
  ContextualSidebarProps
>(function ContextualSidebar(
  {
    totalRequirements,
    readyRequirements,
    milestones,
    ctaLabel = "Start Application",
    onStartApplication,
    className,
    ...props
  },
  ref,
) {
  const safeTotal = Math.max(1, totalRequirements);
  const ratio = Math.min(1, Math.max(0, readyRequirements / safeTotal));
  const percent = Math.round(ratio * 100);

  return (
    <aside
      ref={ref}
      className={cn(
        "sticky top-8 flex flex-col gap-6",
        "p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-[color:var(--color-border)]",
        "shadow-glass",
        className,
      )}
      style={{ zIndex: "var(--z-sticky)" }}
      {...props}
    >
      <section className="space-y-2">
        <header className="flex items-baseline justify-between">
          <h3 className="font-display text-[length:var(--text-fluid-lg)]">
            Application checklist
          </h3>
          <span className="text-[length:var(--text-fluid-sm)] tabular-nums text-[color:var(--color-muted)]">
            {readyRequirements}/{totalRequirements}
          </span>
        </header>
        <div
          className="h-2 w-full rounded-full bg-[color:var(--color-background)] overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`Application checklist ${percent}% complete`}
        >
          <motion.div
            className="h-full rounded-full bg-[color:var(--color-accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ ease: "circOut", duration: 0.8 }}
          />
        </div>
        <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
          {percent}% complete
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-[length:var(--text-fluid-lg)]">
          Timeline
        </h3>
        <ol className="border-l-2 border-[color:var(--color-accent-secondary)] pl-4 space-y-4">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="relative ease-snappy"
            >
              <span
                className={cn(
                  "absolute -left-[22px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2",
                  m.status === "done" &&
                    "bg-[color:var(--color-accent)] border-[color:var(--color-accent)] text-white",
                  m.status === "active" &&
                    "bg-white border-[color:var(--color-accent)]",
                  m.status === "upcoming" &&
                    "bg-white border-[color:var(--color-accent-secondary)]",
                )}
                aria-hidden
              >
                {m.status === "done" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : null}
              </span>
              <p
                className={cn(
                  "text-[length:var(--text-fluid-sm)] font-medium",
                  m.status === "done" &&
                    "text-[color:var(--color-muted)] line-through",
                  m.status === "active" && "text-[#2A2626]",
                  m.status === "upcoming" && "text-[color:var(--color-muted)]",
                )}
              >
                {m.label}
              </p>
              {m.due ? (
                <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                  {m.due}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <ActionButton
        variant="primary"
        size="lg"
        onClick={onStartApplication}
        className="w-full"
      >
        {ctaLabel} <ChevronRight />
      </ActionButton>
    </aside>
  );
});

ContextualSidebar.displayName = "ContextualSidebar";
