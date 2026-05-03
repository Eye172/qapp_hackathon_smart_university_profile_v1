"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/store/useSessionStore";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { ActionButton } from "@/components/ui/button";
import { TagPill } from "@/components/ui/badge";
import { RequirementRow } from "@/components/profile/requirement-row";
import { PreferencesEditor } from "@/components/profile/preferences-editor";
import { cn } from "@/lib/tailwind-utils";
import type { StudyLevel, DocumentStatus } from "@/lib/types";

const GRADE_LEVELS = [9, 10, 11, 12];
const GPA_SCALES = [4.0, 5.0, 10.0, 100] as const;
const STUDY_LEVELS: StudyLevel[] = ["bachelor", "master", "phd"];

export default function ProfilePage() {
  const { data: session } = useSession();
  const profile = useSessionStore((s) => s.profile);
  const updateProfile = useSessionStore((s) => s.updateProfile);
  const updateDocumentStatus = useSessionStore((s) => s.updateDocumentStatus);
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const unsaveNode = useAlgorithmStore((s) => s.unsaveNode);
  const unhideNode = useAlgorithmStore((s) => s.unhideNode);

  // Local form state
  const [fullName, setFullName] = React.useState(profile.fullName);
  const [nationality, setNationality] = React.useState(profile.nationality);
  const [currentCountry, setCurrentCountry] = React.useState(
    profile.currentCountry,
  );
  const [gradeLevel, setGradeLevel] = React.useState(
    String(profile.gradeLevel),
  );
  const [gpa, setGpa] = React.useState(String(profile.gpa));
  const [gpaScale, setGpaScale] = React.useState(String(profile.gpaScale));
  const [ieltsOverall, setIeltsOverall] = React.useState(
    String(profile.ielts.overall),
  );
  const [ieltsWriting, setIeltsWriting] = React.useState(
    String(profile.ielts.writing),
  );
  const [satTotal, setSatTotal] = React.useState(
    String(profile.sat?.total ?? ""),
  );
  const [interests, setInterests] = React.useState(
    profile.interests.join(", "),
  );
  const [budget, setBudget] = React.useState(
    String(profile.budgetUsdPerYear ?? ""),
  );
  const [studyLevel, setStudyLevel] = React.useState(
    profile.preferredStudyLevel,
  );
  const [saved_, setSaved_] = React.useState(false);

  // Sync from store when profile loads from server
  React.useEffect(() => {
    setFullName(profile.fullName);
    setNationality(profile.nationality);
    setCurrentCountry(profile.currentCountry);
    setGradeLevel(String(profile.gradeLevel));
    setGpa(String(profile.gpa));
    setGpaScale(String(profile.gpaScale));
    setIeltsOverall(String(profile.ielts.overall));
    setIeltsWriting(String(profile.ielts.writing));
    setSatTotal(String(profile.sat?.total ?? ""));
    setInterests(profile.interests.join(", "));
    setBudget(String(profile.budgetUsdPerYear ?? ""));
    setStudyLevel(profile.preferredStudyLevel);
  }, [profile]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      nationality: nationality.trim(),
      currentCountry: currentCountry.trim(),
      gradeLevel: Number(gradeLevel),
      gpa: parseFloat(gpa),
      gpaScale: parseFloat(gpaScale) as typeof profile.gpaScale,
      ielts: {
        ...profile.ielts,
        overall: parseFloat(ieltsOverall),
        writing: parseFloat(ieltsWriting),
      },
      sat: satTotal
        ? {
            ...(profile.sat ?? {
              math: 0,
              evidenceBasedReadingWriting: 0,
            }),
            total: parseInt(satTotal, 10),
          }
        : undefined,
      interests: interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      budgetUsdPerYear: budget ? parseInt(budget, 10) : undefined,
      preferredStudyLevel: studyLevel as StudyLevel,
    });
    setSaved_(true);
    setTimeout(() => setSaved_(false), 2000);
  }

  const verified = profile.documents.filter((d) => d.status === "verified").length;
  const total = profile.documents.length;

  return (
    <main className="min-h-screen pt-24 pb-16 px-6 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="font-display text-[length:var(--text-fluid-2xl)]">
          My profile
        </h1>
        <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
          {session?.user?.email ?? profile.email}
        </p>
      </header>

      {/* Academic profile form */}
      <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-6">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          Academic profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Full name
              </span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Nationality
              </span>
              <input
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Current country
              </span>
              <input
                value={currentCountry}
                onChange={(e) => setCurrentCountry(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Grade level
              </span>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)]",
                )}
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                GPA
              </span>
              <input
                type="number"
                step="0.01"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                GPA scale
              </span>
              <select
                value={gpaScale}
                onChange={(e) => setGpaScale(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                )}
              >
                {GPA_SCALES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                IELTS overall
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="9"
                value={ieltsOverall}
                onChange={(e) => setIeltsOverall(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                IELTS writing
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="9"
                value={ieltsWriting}
                onChange={(e) => setIeltsWriting(e.target.value)}
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                SAT total (optional)
              </span>
              <input
                type="number"
                value={satTotal}
                onChange={(e) => setSatTotal(e.target.value)}
                placeholder="e.g. 1380"
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Budget (USD/year)
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 25000"
                className={cn(
                  "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                  "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                  "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                )}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Interests (comma-separated)
            </span>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Computer Science, AI, Product Design"
              className={cn(
                "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
                "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
              )}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Preferred study level
            </span>
            <select
              value={studyLevel}
              onChange={(e) => setStudyLevel(e.target.value as StudyLevel)}
              className={cn(
                "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
                "bg-white/80 text-[length:var(--text-fluid-sm)] outline-none",
              )}
            >
              {STUDY_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <ActionButton type="submit" variant="primary" size="lg">
              Save changes
            </ActionButton>
            {saved_ ? (
              <TagPill variant="success">Saved ✓</TagPill>
            ) : null}
          </div>
        </form>
      </section>

      {/* Documents */}
      <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[length:var(--text-fluid-xl)]">
            Documents
          </h2>
          <TagPill variant={verified === total ? "success" : "warning"}>
            {verified} / {total} ready
          </TagPill>
        </div>

        <div className="space-y-2">
          {profile.documents.map((d) => {
            const reqStatus =
              d.status === "verified"
                ? "ready"
                : d.status === "uploaded"
                  ? "pending_review"
                  : d.status === "rejected"
                    ? "rejected"
                    : "missing";

            const NEXT_STATUS: Record<DocumentStatus, DocumentStatus> = {
              pending: "uploaded",
              uploaded: "verified",
              verified: "pending",
              rejected: "pending",
            };

            return (
              <div key={d.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <RequirementRow
                    title={d.fileName || `${d.kind} document`}
                    status={reqStatus}
                    subtext={d.kind}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateDocumentStatus(d.id, NEXT_STATUS[d.status])
                  }
                  className={cn(
                    "shrink-0 text-[length:var(--text-fluid-xs)] rounded-full px-3 py-1",
                    "border border-[color:var(--color-border)] text-[color:var(--color-muted)]",
                    "hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
                    "ease-snappy transition-colors",
                  )}
                >
                  Cycle status
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Saved universities */}
      <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-4">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          Saved universities
        </h2>
        {saved.length === 0 ? (
          <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
            None yet — save cards from the Discover feed.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {saved.map((id) => (
              <li key={id} className="flex items-center gap-1.5">
                <TagPill variant="neutral">{id}</TagPill>
                <button
                  type="button"
                  className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] underline"
                  onClick={() => unsaveNode(id)}
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Preferences & priorities */}
      <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-[length:var(--text-fluid-xl)]">
            Preferences &amp; priorities
          </h2>
          <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
            Tag what matters, then weight each factor. AI re-evaluates university fit whenever priorities change.
          </p>
        </div>
        <PreferencesEditor />
      </section>

      {/* Hidden universities */}
      {hidden.length > 0 ? (
        <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-4">
          <h2 className="font-display text-[length:var(--text-fluid-xl)]">
            Hidden universities
          </h2>
          <ul className="flex flex-wrap gap-2">
            {hidden.map((id) => (
              <li key={id} className="flex items-center gap-1.5">
                <TagPill variant="warning">{id}</TagPill>
                <button
                  type="button"
                  className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-accent)] underline"
                  onClick={() => unhideNode(id)}
                >
                  restore
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
