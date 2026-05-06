"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/button";
import { TagPill } from "@/components/ui/badge";
import { AIFitRing, fitScoreColor } from "@/components/ui/ai-fit-ring";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  FileText,
  UploadCloud,
  XCircle,
} from "@/components/ui/icon";

export default function PrimitivesPage() {
  const [score, setScore] = useState(75);

  const scoreSamples = [10, 25, 40, 55, 70, 85, 95];

  return (
    <main className="min-h-screen px-6 py-24 max-w-5xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="font-display text-[length:var(--text-fluid-2xl)]">
          L3 — Atomic Primitives
        </h1>
        <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
          Visual QA surface for ActionButton, TagPill, AIFitRing, and Icon
          abstractions. Hover the buttons (scale 1.03), drag the slider to see
          the ring re-interpolate red → yellow → green.
        </p>
      </header>

      <section className="shadow-glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          ActionButton
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton variant="primary">
            Primary <ChevronRight />
          </ActionButton>
          <ActionButton variant="glass">
            <UploadCloud /> Glass
          </ActionButton>
          <ActionButton variant="outline">Outline</ActionButton>
          <ActionButton variant="primary" size="sm">
            Small
          </ActionButton>
          <ActionButton variant="primary" size="lg">
            Large
          </ActionButton>
          <ActionButton variant="primary" disabled>
            Disabled
          </ActionButton>
          <ActionButton variant="outline" asChild>
            <a href="#a">asChild link</a>
          </ActionButton>
        </div>
      </section>

      <section className="shadow-glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          TagPill
        </h2>
        <div className="flex flex-wrap gap-2">
          <TagPill variant="success">Verified</TagPill>
          <TagPill variant="warning">Pending review</TagPill>
          <TagPill variant="error">Rejected</TagPill>
          <TagPill variant="neutral">Neutral</TagPill>
        </div>
      </section>

      <section className="shadow-glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          AIFitRing
        </h2>

        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center gap-2">
            <AIFitRing score={score} size={160} strokeWidth={12} />
            <input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-40 accent-[#81583A]"
            />
            <span
              className="text-[length:var(--text-fluid-xs)] tabular-nums"
              style={{ color: fitScoreColor(score) }}
            >
              {score} → {fitScoreColor(score)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 pt-2">
          {scoreSamples.map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <AIFitRing score={s} size={72} strokeWidth={7} />
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                {s}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="shadow-glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          Icon abstraction
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-[#2A2626]">
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="text-[#5E7A66]" /> CheckCircle
          </span>
          <span className="inline-flex items-center gap-2">
            <XCircle className="text-[#9E6464]" /> XCircle
          </span>
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="text-[#C2956E]" /> AlertCircle
          </span>
          <span className="inline-flex items-center gap-2">
            <UploadCloud /> UploadCloud
          </span>
          <span className="inline-flex items-center gap-2">
            <FileText /> FileText
          </span>
          <span className="inline-flex items-center gap-2">
            <ChevronRight /> ChevronRight
          </span>
        </div>
      </section>
    </main>
  );
}
