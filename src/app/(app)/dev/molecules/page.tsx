"use client";

import { HorizontalFeedNode } from "@/components/feed/horizontal-feed-node";
import { RequirementRow } from "@/components/profile/requirement-row";
import { ProfileHero } from "@/components/profile/profile-hero";
import { AIFitDashboard } from "@/components/profile/ai-fit-dashboard";
import {
  ContextualSidebar,
  type TimelineMilestone,
} from "@/components/profile/contextual-sidebar";
import { MOCK_UNIVERSITIES } from "@/lib/mock-data";
import { useSessionStore } from "@/store/useSessionStore";

const SAMPLE_REASONS = `Aliya's **GPA 4.7/5.0** sits in the top quartile of admitted students; the **IELTS 7.0** clears the program's English floor by **+0.5 bands**, and her interest in **Computer Science** maps cleanly to the BSc track. The **$25,000/yr** budget covers the **$21,500** sticker price with **scholarship** room.

- Strong academic alignment with the BSc Computer Science core
- Language confidence above program floor
- Campus in **Astana** keeps relocation cost low`;

const SAMPLE_GAPS = `The **writing** sub-score (**6.5**) trails the program preference of **7.0** — recommend a focused 4-week prep block. *SOP* and *recommendation* documents are still **pending**; without both, the application cannot be submitted.

- Lift IELTS writing to **7.0+**
- Draft and submit **statement of purpose**
- Secure **two recommendation letters**`;

const MILESTONES: TimelineMilestone[] = [
  {
    id: "ms_1",
    label: "Profile created",
    due: "2026-04-01",
    status: "done",
  },
  {
    id: "ms_2",
    label: "Documents uploaded",
    due: "2026-04-20",
    status: "done",
  },
  {
    id: "ms_3",
    label: "AI Fit review",
    due: "2026-05-08",
    status: "active",
  },
  {
    id: "ms_4",
    label: "Submit application",
    due: "2026-06-15",
    status: "upcoming",
  },
  {
    id: "ms_5",
    label: "Decision window",
    due: "2026-08-20",
    status: "upcoming",
  },
];

export default function MoleculesPage() {
  const profile = useSessionStore((s) => s.profile);
  const featured = MOCK_UNIVERSITIES[0];

  const ready = profile.documents.filter((d) => d.status === "verified").length;
  const total = profile.documents.length;

  return (
    <main className="min-h-screen pt-24 pb-32 max-w-6xl mx-auto px-6 space-y-16">
      <header className="space-y-2">
        <h1 className="font-display text-[length:var(--text-fluid-2xl)]">
          L4 — Molecular & Organismic Modules
        </h1>
        <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
          Discovery node, requirement rows, parallax hero, AI Fit dashboard, and
          sticky sidebar — all live-bound to the session + algorithm stores.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          HorizontalFeedNode
        </h2>
        <div className="flex gap-4 overflow-x-auto py-2">
          {MOCK_UNIVERSITIES.map((u) => (
            <HorizontalFeedNode
              key={u.id}
              university={u}
              onEnter={(id) => console.log("enter", id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          RequirementRow
        </h2>
        <div className="space-y-2 max-w-2xl">
          <RequirementRow
            title="Statement of Purpose"
            status="missing"
            subtext="600–800 word essay on your motivation and goals."
          />
          <RequirementRow
            title="SAT score report"
            status="pending_review"
            subtext="Uploaded 2026-04-15 — verification queued."
          />
          <RequirementRow
            title="High-school transcript"
            status="ready"
            subtext="Verified 2026-04-10 by QApp credential service."
          />
          <RequirementRow
            title="Passport scan"
            status="rejected"
            subtext="Image too low resolution — please re-scan at 300dpi."
          />
        </div>
      </section>

      <section className="space-y-12">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          ProfileHero + AIFitDashboard + ContextualSidebar
        </h2>

        <ProfileHero university={featured} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
          <div className="lg:col-span-2 space-y-8">
            <AIFitDashboard
              score={featured.fitScore}
              reasons={SAMPLE_REASONS}
              gaps={SAMPLE_GAPS}
            />
            <div className="space-y-2">
              <h3 className="font-display text-[length:var(--text-fluid-lg)]">
                Documents in your profile
              </h3>
              {profile.documents.map((d) => {
                const status =
                  d.status === "verified"
                    ? "ready"
                    : d.status === "uploaded"
                      ? "pending_review"
                      : d.status === "rejected"
                        ? "rejected"
                        : "missing";
                return (
                  <RequirementRow
                    key={d.id}
                    title={d.fileName || `Upload ${d.kind}`}
                    status={status}
                    subtext={`Kind: ${d.kind} · uploaded ${new Date(d.uploadedAt).toLocaleDateString()}`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <ContextualSidebar
              totalRequirements={total}
              readyRequirements={ready}
              milestones={MILESTONES}
              onStartApplication={() => console.log("start application")}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
