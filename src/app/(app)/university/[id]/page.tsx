import * as React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fetchAIFit } from "@/lib/ai-fit";
import { auth } from "@/auth";
import { ProfileHero } from "@/components/profile/profile-hero";
import { AIFitDashboard } from "@/components/profile/ai-fit-dashboard";
import { AIFitSkeleton } from "@/components/profile/ai-fit-skeleton";
import {
  ContextualSidebar,
  type TimelineMilestone,
} from "@/components/profile/contextual-sidebar";
import { RequirementRow } from "@/components/profile/requirement-row";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";
import type { UserPreferenceData } from "@/lib/preference-categories";
import { MOCK_SESSION_PROFILE } from "@/store/useSessionStore";

interface UniversityPageProps {
  params: Promise<{ id: string }>;
}

const MILESTONES: TimelineMilestone[] = [
  { id: "ms_1", label: "Profile created", due: "2026-04-01", status: "done" },
  { id: "ms_2", label: "Documents uploaded", due: "2026-04-20", status: "done" },
  { id: "ms_3", label: "AI Fit review", due: "2026-05-08", status: "active" },
  { id: "ms_4", label: "Submit application", due: "2026-06-15", status: "upcoming" },
  { id: "ms_5", label: "Decision window", due: "2026-08-20", status: "upcoming" },
];

async function getUniversityFromDB(id: string): Promise<IUniversityProfile | null> {
  const u = await db.university
    .findUnique({
      where: { id },
      include: {
        programs: { orderBy: { name: "asc" } },
        scholarships: { orderBy: { name: "asc" } },
        deadlines: { orderBy: { date: "asc" } },
      },
    })
    .catch(() => null);
  if (!u) return null;

  return {
    id: u.id,
    name: u.name,
    nameRu: u.nameRu ?? undefined,
    country: u.country,
    city: u.city,
    founded: u.founded ?? undefined,
    type: u.type ?? undefined,
    languages: u.languages ?? undefined,
    logoUrl: u.logoUrl ?? undefined,
    heroImageUrl: u.heroImageUrl ?? u.campusPhoto ?? undefined,
    campusPhoto: u.campusPhoto ?? undefined,
    websiteUrl: u.websiteUrl ?? undefined,
    contactEmail: u.contactEmail ?? undefined,
    worldRank: u.worldRank ?? undefined,
    minGpa: u.minGpa ?? undefined,
    minIelts: u.minIelts ?? undefined,
    minSat: u.minSat ?? undefined,
    applicationDeadline: u.applicationDeadline ?? undefined,
    description: u.description ?? undefined,
    fitScore: u.fitScore,
    recommendationScore: u.recommendationScore,
    fitScoreBreakdown: u.fitScoreBreakdown
      ? (JSON.parse(u.fitScoreBreakdown) as IUniversityProfile["fitScoreBreakdown"])
      : undefined,
    // Use relational programs if JSON legacy is empty
    programs: (() => {
      const legacy = JSON.parse(u.programsJson) as IUniversityProfile["programs"];
      if (legacy.length) return legacy;
      // Build legacy-compatible shape from relational data
      return u.programs.map((p, i) => ({
        id: `${u.id}_prog_${i}`,
        name: p.name,
        level: (p.degree?.toLowerCase() as IUniversityProfile["programs"][number]["level"]) ?? "bachelor",
        durationMonths: (p.duration ?? 4) * 12,
        tuitionUsdPerYear: p.tuitionPerYear ?? 0,
        language: p.language ?? "English",
        deliveryMode: "on-campus" as const,
        field: p.field ?? "General",
        scholarshipAvailable: false,
      }));
    })(),
    tags: JSON.parse(u.tags) as string[],
  };
}

async function getUserProfile(userId: string): Promise<IStudentProfile | null> {
  const user = await db.user
    .findUnique({
      where: { id: userId },
      include: {
        profile: { include: { documents: { orderBy: { uploadedAt: "asc" } } } },
      },
    })
    .catch(() => null);

  if (!user?.profile) return null;
  const p = user.profile;

  return {
    id: p.id,
    fullName: p.fullName,
    email: user.email ?? "",
    avatarUrl: p.avatarUrl ?? undefined,
    nationality: p.nationality,
    currentCountry: p.currentCountry,
    gradeLevel: p.gradeLevel,
    gpa: p.gpa,
    gpaScale: p.gpaScale as IStudentProfile["gpaScale"],
    ielts: {
      overall: p.ieltsOverall ?? 0,
      listening: p.ieltsListening ?? 0,
      reading: p.ieltsReading ?? 0,
      writing: p.ieltsWriting ?? 0,
      speaking: p.ieltsSpeaking ?? 0,
      takenAt: p.ieltsTakenAt ?? undefined,
    },
    sat:
      p.satTotal != null
        ? {
            total: p.satTotal,
            math: p.satMath ?? 0,
            evidenceBasedReadingWriting: p.satEbrw ?? 0,
            takenAt: p.satTakenAt ?? undefined,
          }
        : undefined,
    interests: JSON.parse(p.interests) as string[],
    preferredCountries: JSON.parse(p.preferredCountries) as string[],
    preferredStudyLevel: p.preferredStudyLevel as IStudentProfile["preferredStudyLevel"],
    budgetUsdPerYear: p.budgetUsdPerYear ?? undefined,
    documents: p.documents.map((d) => ({
      id: d.id,
      kind: d.kind as IStudentProfile["documents"][number]["kind"],
      fileName: d.fileName,
      status: d.status as IStudentProfile["documents"][number]["status"],
      url: d.url ?? undefined,
      sizeBytes: d.sizeBytes ?? undefined,
      uploadedAt: d.uploadedAt.toISOString(),
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

async function getUserPreferences(userId: string): Promise<UserPreferenceData[]> {
  try {
    const cats = await db.userPreferenceCategory.findMany({
      where: { userId },
      include: { values: { orderBy: { createdAt: "asc" } } },
    });
    return cats.map((c) => ({
      id: c.id,
      categoryKey: c.categoryKey,
      label: c.categoryKey,
      priority: c.priority,
      values: c.values.map((v) => ({ id: v.id, value: v.value })),
    }));
  } catch {
    return [];
  }
}

async function AIFitContent({
  university,
  studentProfile,
  preferences,
}: {
  university: IUniversityProfile;
  studentProfile: IStudentProfile;
  preferences: UserPreferenceData[];
}) {
  const result = await fetchAIFit(university, studentProfile, preferences);
  return (
    <div className="space-y-2">
      <AIFitDashboard
        score={result.score}
        reasons={result.reasons}
        gaps={result.gaps}
      />
      <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] text-right pr-2">
        Source:{" "}
        {result.source === "anthropic"
          ? "Claude AI (Anthropic)"
          : "deterministic mock"}
      </p>
    </div>
  );
}

export default async function UniversityPage({ params }: UniversityPageProps) {
  const { id } = await params;

  const university = await getUniversityFromDB(id);
  if (!university) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const studentProfile = userId
    ? ((await getUserProfile(userId)) ?? MOCK_SESSION_PROFILE)
    : MOCK_SESSION_PROFILE;

  const preferences = userId ? await getUserPreferences(userId) : [];

  const docs = studentProfile.documents;
  const ready = docs.filter((d) => d.status === "verified").length;

  // Build scholarship / deadline data for sidebar
  const dbUni = university.id
    ? await db.university.findUnique({
        where: { id: university.id },
        include: {
          scholarships: { orderBy: { name: "asc" } },
          deadlines: { orderBy: { date: "asc" } },
        },
      }).catch(() => null)
    : null;

  return (
    <main className="min-h-screen pb-24">
      <ProfileHero university={university} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 mt-16 max-w-7xl mx-auto">
        <div className="lg:col-span-8 space-y-8">
          {/* AI Fit */}
          <React.Suspense fallback={<AIFitSkeleton />}>
            <AIFitContent
              university={university}
              studentProfile={studentProfile}
              preferences={preferences}
            />
          </React.Suspense>

          {/* University info */}
          {university.description && (
            <section className="space-y-2">
              <h2 className="font-display text-[length:var(--text-fluid-xl)]">About</h2>
              <p className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)] leading-relaxed">
                {university.description}
              </p>
              <div className="flex flex-wrap gap-3 text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                {university.founded && <span>Founded {university.founded}</span>}
                {university.type && <span>· {university.type}</span>}
                {university.languages && <span>· {university.languages}</span>}
                {university.websiteUrl && (
                  <a
                    href={university.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--color-accent)] underline"
                  >
                    Official website →
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Entry requirements */}
          {(university.minGpa ?? university.minIelts ?? university.minSat) && (
            <section className="space-y-3">
              <h2 className="font-display text-[length:var(--text-fluid-xl)]">Entry requirements</h2>
              <div className="flex flex-wrap gap-3">
                {university.minGpa && (
                  <div className="rounded-xl border border-[color:var(--color-border)] px-4 py-2.5 text-center">
                    <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Min GPA</p>
                    <p className="font-semibold tabular-nums">{university.minGpa}</p>
                  </div>
                )}
                {university.minIelts && (
                  <div className="rounded-xl border border-[color:var(--color-border)] px-4 py-2.5 text-center">
                    <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Min IELTS</p>
                    <p className="font-semibold tabular-nums">{university.minIelts}</p>
                  </div>
                )}
                {university.minSat && (
                  <div className="rounded-xl border border-[color:var(--color-border)] px-4 py-2.5 text-center">
                    <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Min SAT</p>
                    <p className="font-semibold tabular-nums">{university.minSat}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Programs */}
          <section className="space-y-3">
            <h2 className="font-display text-[length:var(--text-fluid-xl)]">Programs</h2>
            <ul className="space-y-2">
              {university.programs.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-[color:var(--color-border)] bg-white/70 backdrop-blur-md p-4"
                >
                  <div>
                    <p className="font-medium text-[length:var(--text-fluid-base)]">{p.name}</p>
                    <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                      {p.level} · {p.durationMonths} months · {p.language} · {p.deliveryMode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums font-semibold">
                      {p.tuitionUsdPerYear > 0
                        ? `$${p.tuitionUsdPerYear.toLocaleString()}/yr`
                        : "Free / Semester fee"}
                    </p>
                    <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                      {p.scholarshipAvailable ? "scholarship available" : "no scholarship"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Scholarships */}
          {dbUni?.scholarships && dbUni.scholarships.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-[length:var(--text-fluid-xl)]">Scholarships</h2>
              <ul className="space-y-2">
                {dbUni.scholarships.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 p-4 space-y-1"
                  >
                    <p className="font-medium text-[length:var(--text-fluid-base)]">{s.name}</p>
                    {s.description && (
                      <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                        {s.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[length:var(--text-fluid-xs)] pt-1">
                      {s.covers && (
                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                          {s.covers}
                        </span>
                      )}
                      {s.minGpa && (
                        <span className="text-[color:var(--color-muted)]">
                          GPA ≥ {s.minGpa}
                        </span>
                      )}
                      {s.minIelts && (
                        <span className="text-[color:var(--color-muted)]">
                          IELTS ≥ {s.minIelts}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Documents */}
          <section className="space-y-3">
            <h2 className="font-display text-[length:var(--text-fluid-xl)]">Your documents</h2>
            <div className="space-y-2">
              {docs.map((d) => {
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
                    subtext={`Kind: ${d.kind}`}
                  />
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <ContextualSidebar
            totalRequirements={docs.length}
            readyRequirements={ready}
            milestones={
              dbUni?.deadlines?.map((d, i) => ({
                id: `dl_${i}`,
                label: d.label ?? "Deadline",
                due: d.date,
                status: new Date(d.date) < new Date() ? "done" : "upcoming",
              })) ?? MILESTONES
            }
          />
        </div>
      </div>
    </main>
  );
}
