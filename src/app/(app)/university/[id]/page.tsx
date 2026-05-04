import * as React from "react";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { fetchAIFit } from "@/lib/ai-fit";
import { computeRS } from "@/lib/rs-score";
import { HeroSlider } from "@/components/university/hero-slider";
import { AIInsightsClient } from "@/components/university/ai-insights-client";
import { UniversityCTA } from "@/components/university/university-cta";
import { StickySidebar } from "@/components/university/sticky-sidebar";
import { ProgramsSection } from "@/components/university/programs-section";
import { DeadlineTimeline } from "@/components/university/deadline-timeline";
import { DocumentsChecklist } from "@/components/university/documents-checklist";
import { ScholarshipsSection } from "@/components/university/scholarships-section";
import { StatsDashboard } from "@/components/university/stats-dashboard";
import { AIFitRing } from "@/components/ui/ai-fit-ring";
import { AIFitSkeleton } from "@/components/profile/ai-fit-skeleton";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";
import type { UserPreferenceData } from "@/lib/preference-categories";
import { MOCK_SESSION_PROFILE } from "@/store/useSessionStore";

/* ─── Markdown config ────────────────────────────────────────────────────── */
const MD: Components = {
  p:      (p) => <p className="text-sm leading-relaxed mb-2 last:mb-0" {...p} />,
  strong: (p) => <strong className="font-semibold" {...p} />,
  em:     (p) => <em className="italic opacity-80" {...p} />,
  ul:     (p) => <ul className="list-disc pl-4 space-y-1 text-sm" {...p} />,
  li:     (p) => <li className="leading-snug" {...p} />,
};

/* ─── Real Claude AI Advisor (server-side Suspense) ─────────────────────── */
async function AIAdvisorSection({
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200/60 space-y-2">
        <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
          Strengths
        </p>
        <div className="text-emerald-900">
          <ReactMarkdown components={MD}>{result.reasons}</ReactMarkdown>
        </div>
      </div>
      {/* Risks */}
      <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200/60 space-y-2">
        <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">!</span>
          Risks &amp; Gaps
        </p>
        <div className="text-amber-900">
          <ReactMarkdown components={MD}>{result.gaps}</ReactMarkdown>
        </div>
      </div>
      <p className="col-span-full text-[10px] text-gray-400 text-right -mt-2">
        {result.source === "openai" ? "Powered by GPT-4o mini · OpenAI" : "Deterministic evaluation (no API key)"}
      </p>
    </div>
  );
}

interface UniversityPageProps {
  params: Promise<{ id: string }>;
}


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
    photos: (() => {
      try { return JSON.parse(u.photosJson) as string[]; } catch { return []; }
    })(),
    statsTestScores: u.statsTestScores
      ? (JSON.parse(u.statsTestScores) as IUniversityProfile["statsTestScores"])
      : undefined,
    statsDemographics: u.statsDemographics
      ? (JSON.parse(u.statsDemographics) as IUniversityProfile["statsDemographics"])
      : undefined,
    statsFinancials: u.statsFinancials
      ? (JSON.parse(u.statsFinancials) as IUniversityProfile["statsFinancials"])
      : undefined,
    statsTopMajors: u.statsTopMajors
      ? (JSON.parse(u.statsTopMajors) as IUniversityProfile["statsTopMajors"])
      : undefined,
    extendedProfile: u.extendedProfile
      ? (JSON.parse(u.extendedProfile) as IUniversityProfile["extendedProfile"])
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

  // Compute per-user RS score from preferences
  const rsDetail = computeRS(university, preferences, {
    gpa: studentProfile.gpa,
    ielts: studentProfile.ielts,
    sat: studentProfile.sat,
    budgetUsdPerYear: studentProfile.budgetUsdPerYear,
  });
  const rsScore = rsDetail.score > 0 ? rsDetail.score : (university.recommendationScore ?? university.fitScore);

  const dbUni = university.id
    ? await db.university
        .findUnique({
          where: { id: university.id },
          include: {
            scholarships: { orderBy: { name: "asc" } },
            deadlines: { orderBy: { date: "asc" } },
          },
        })
        .catch(() => null)
    : null;

  const missingDocs = docs
    .filter((d) => d.status === "pending" && !d.fileName)
    .map((d) => d.kind);

  const milestones =
    dbUni?.deadlines?.map((d, i) => ({
      id: `dl_${i}`,
      label: d.label ?? "Deadline",
      due: d.date,
      isPast: new Date(d.date) < new Date(),
    })) ?? [];

  const pendingCount = docs.filter((d) => d.status === "pending").length;

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      {/* ── Hero Slider ───────────────────────────────────────────── */}
      <HeroSlider university={university} />

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-10">
        <div className="flex gap-7 xl:gap-9 items-start">

          {/* ── Main content column ───────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* A — AI Fit card (ring + instant insights) */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex flex-wrap sm:flex-nowrap items-start gap-6">
                <div className="flex-shrink-0">
                  <AIFitRing score={rsScore} size={140} strokeWidth={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-blue-500 font-semibold mb-1">
                    AI Fit Analysis
                  </p>
                  <h2 className="text-base font-bold text-gray-900 mb-4">
                    How {university.name.split(" ")[0]} matches your profile
                  </h2>
                  <AIInsightsClient
                    rsDetail={rsDetail}
                    universityName={university.name}
                    studentGpa={studentProfile.gpa}
                    studentIelts={studentProfile.ielts.overall}
                    uniMinGpa={university.minGpa}
                    uniMinIelts={university.minIelts}
                    uniMinSat={university.minSat}
                    studentSat={studentProfile.sat?.total}
                    missingDocs={missingDocs}
                  />
                </div>
              </div>
            </section>

            {/* B — GPT Personalised Evaluation */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 rounded-full px-3 py-1 text-xs font-bold border border-blue-100">
                  ✦ GPT AI
                </span>
                <h2 className="text-base font-bold text-gray-900">Personalised Evaluation</h2>
              </div>
              <React.Suspense fallback={<AIFitSkeleton />}>
                <AIAdvisorSection
                  university={university}
                  studentProfile={studentProfile}
                  preferences={preferences}
                />
              </React.Suspense>
            </section>

            {/* C — Statistics Dashboard */}
            <StatsDashboard
              university={university}
              studentIelts={studentProfile.ielts.overall}
              studentGpa={studentProfile.gpa}
              studentSat={studentProfile.sat?.total}
            />

            {/* D — Programs */}
            <ProgramsSection
              programs={university.programs}
              interests={studentProfile.interests}
              budgetUsdPerYear={studentProfile.budgetUsdPerYear}
              preferredLevel={studentProfile.preferredStudyLevel}
            />

            {/* E — Documents + Deadlines (two columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocumentsChecklist docs={docs} />
              <DeadlineTimeline milestones={milestones} />
            </div>

            {/* F — Scholarships */}
            <ScholarshipsSection
              scholarships={dbUni?.scholarships ?? []}
              studentGpa={studentProfile.gpa}
              studentIelts={studentProfile.ielts.overall}
            />
          </div>

          {/* ── Sticky sidebar (desktop only) ─────────────────────── */}
          <aside className="hidden lg:block w-[296px] xl:w-[316px] flex-shrink-0 sticky top-6 self-start">
            <StickySidebar
              universityId={university.id}
              rsScore={rsScore}
              pendingCount={pendingCount}
              university={{
                city: university.city,
                country: university.country,
                founded: university.founded,
                type: university.type,
                languages: university.languages,
                applicationDeadline: university.applicationDeadline,
                websiteUrl: university.websiteUrl,
                contactEmail: university.contactEmail,
              }}
            />
          </aside>
        </div>
      </div>

      {/* Mobile-only floating actions bar */}
      <div className="lg:hidden">
        <UniversityCTA
          universityId={university.id}
          websiteUrl={university.websiteUrl}
          contactEmail={university.contactEmail}
        />
      </div>
    </main>
  );
}
