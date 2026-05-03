"use client";

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { AIFitRing } from "@/components/ui/ai-fit-ring";
import { cn } from "@/lib/tailwind-utils";

export interface AIFitDashboardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  reasons: string;
  gaps: string;
  ringSize?: number;
}

const MARKDOWN_COMPONENTS: Components = {
  p: (props) => (
    <p
      className="text-[length:var(--text-fluid-sm)] leading-relaxed text-[#2A2626] mb-2 last:mb-0"
      {...props}
    />
  ),
  strong: (props) => (
    <strong
      className="font-semibold text-[color:var(--color-accent)] tabular-nums"
      {...props}
    />
  ),
  em: (props) => <em className="italic text-[#2A2626]/80" {...props} />,
  ul: (props) => (
    <ul
      className="list-disc pl-5 space-y-1 text-[length:var(--text-fluid-sm)]"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal pl-5 space-y-1 text-[length:var(--text-fluid-sm)]"
      {...props}
    />
  ),
  li: (props) => <li className="leading-snug" {...props} />,
  code: (props) => (
    <code
      className="rounded bg-[color:var(--color-background)] px-1.5 py-0.5 text-[0.85em] font-mono text-[color:var(--color-accent)]"
      {...props}
    />
  ),
};

export const AIFitDashboard = React.forwardRef<
  HTMLDivElement,
  AIFitDashboardProps
>(function AIFitDashboard(
  { score, reasons, gaps, ringSize = 160, className, ...props },
  ref,
) {
  const reasonsTree = React.useMemo(
    () => (
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>{reasons}</ReactMarkdown>
    ),
    [reasons],
  );

  const gapsTree = React.useMemo(
    () => <ReactMarkdown components={MARKDOWN_COMPONENTS}>{gaps}</ReactMarkdown>,
    [gaps],
  );

  const roundedScore = React.useMemo(
    () => Math.max(0, Math.min(100, Math.round(score))),
    [score],
  );

  return (
    <section
      ref={ref}
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-3xl shadow-sm",
        "border border-[color:var(--color-border)]",
        className,
      )}
      aria-label="AI Fit summary"
      {...props}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <AIFitRing score={roundedScore} size={ringSize} strokeWidth={12} />
        <p className="text-[length:var(--text-fluid-xs)] uppercase tracking-wider text-[color:var(--color-muted)]">
          AI Fit Score
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-[length:var(--text-fluid-lg)]">
          Why this fits
        </h3>
        {reasonsTree}
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-[length:var(--text-fluid-lg)]">
          What to close
        </h3>
        {gapsTree}
      </div>
    </section>
  );
});

AIFitDashboard.displayName = "AIFitDashboard";
