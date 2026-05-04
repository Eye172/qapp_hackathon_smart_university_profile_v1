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

/* ─── AI Chart Commentary (server, Suspense) ────────────────────────────── */
async function AIChartComments({
  university,
  studentProfile,
  preferences,
}: {
  university: IUniversityProfile;
  studentProfile: IStudentProfile;
  preferences: UserPreferenceData[];
}) {
  const result = await fetchAIFit(university, studentProfile, preferences);
  let rich: { chartComments?: { scores?: string; majors?: string; financial?: string; demographics?: string } } | null = null;
  try { rich = JSON.parse(result.reasons); } catch { return null; }
  const cc = rich?.chartComments;
  if (!cc || !Object.values(cc).some(Boolean)) return null;

  const items = [
    { key: "scores", label: "📊 Scores Analysis", text: cc.scores, color: "bg-blue-50 border-blue-100 text-blue-900" },
    { key: "majors", label: "📚 Field Alignment", text: cc.majors, color: "bg-violet-50 border-violet-100 text-violet-900" },
    { key: "financial", label: "💰 Financial Fit", text: cc.financial, color: "bg-emerald-50 border-emerald-100 text-emerald-900" },
    { key: "demographics", label: "🌍 Campus Environment", text: cc.demographics, color: "bg-amber-50 border-amber-100 text-amber-900" },
  ].filter((i) => i.text);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 text-xs font-bold border border-indigo-100">✦ GPT AI</span>
        <h3 className="text-sm font-bold text-gray-900">Dr. Morgan&apos;s Chart Commentary</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(({ key, label, text, color }) => (
          <div key={key} className={`rounded-2xl p-4 border ${color} space-y-1.5`}>
            <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Rich AI response type ─────────────────────────────────────────────── */
interface RichAIResponse {
  fitScore?: number;
  summary?: string;
  strengths?: string[];
  gaps?: string[];
  actionPlan?: string[];
  chartComments?: { scores?: string; majors?: string; financial?: string; demographics?: string };
  breakdown?: { academic?: number; language?: number; financial?: number; interest?: number };
}

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

  let rich: RichAIResponse | null = null;
  try { rich = JSON.parse(result.reasons) as RichAIResponse; } catch { /* legacy text */ }

  const isRich = rich && (rich.summary || rich.strengths);

  if (isRich && rich) {
    const bd = rich.breakdown ?? {};
    return (
      <div className="space-y-5">
        {/* Summary */}
        {rich.summary && (
          <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">✦</span>
              Counselor&apos;s Verdict
            </p>
            <p className="text-sm text-blue-900 leading-relaxed">{rich.summary}</p>
          </div>
        )}

        {/* Strengths + Gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rich.strengths && rich.strengths.length > 0 && (
            <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200/60 space-y-2">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
                Why You&apos;re a Strong Candidate
              </p>
              <ul className="space-y-2">
                {rich.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-emerald-900">
                    <span className="mt-0.5 text-emerald-400 font-bold shrink-0">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {rich.gaps && rich.gaps.length > 0 && (
            <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200/60 space-y-2">
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px]">!</span>
                Gaps to Address
              </p>
              <ul className="space-y-2">
                {rich.gaps.map((g, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-900">
                    <span className="mt-0.5 text-amber-400 font-bold shrink-0">›</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Breakdown axis pills */}
        {Object.keys(bd).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: "academic", label: "Academic", color: "bg-blue-100 text-blue-700" },
              { key: "language", label: "Language", color: "bg-violet-100 text-violet-700" },
              { key: "financial", label: "Financial", color: "bg-emerald-100 text-emerald-700" },
              { key: "interest", label: "Interest Fit", color: "bg-amber-100 text-amber-700" },
            ].map(({ key, label, color }) => {
              const val = bd[key as keyof typeof bd];
              if (!val) return null;
              return (
                <span key={key} className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 ${color}`}>
                  {label}: {val}/100
                </span>
              );
            })}
          </div>
        )}

        {/* Action Plan */}
        {rich.actionPlan && rich.actionPlan.length > 0 && (
          <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200 space-y-2">
            <p className="text-xs font-bold text-gray-700">Your Action Plan</p>
            <ol className="space-y-1.5">
              {rich.actionPlan.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span>{step.replace(/^\d+\.\s*/, "")}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="text-[10px] text-gray-400 text-right">
          {result.source === "openai" ? "Powered by GPT-4o mini · OpenAI" : "Deterministic evaluation (no API key)"}
        </p>
      </div>
    );
  }

  /* ── Legacy / fallback text display ── */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200/60 space-y-2">
        <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
          Strengths
        </p>
        <div className="text-emerald-900">
          <ReactMarkdown components={MD}>{result.reasons}</ReactMarkdown>
        </div>
      </div>
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


interface UniversityData {
  profile: IUniversityProfile;
  scholarships: Array<{ id: string; name: string; description: string | null; covers: string | null; eligibility: string | null; minGpa: number | null; minIelts: number | null }>;
  deadlines: Array<{ id: string; label: string | null; date: string }>;
}

async function getUniversityFromDB(id: string): Promise<UniversityData | null> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uExt = u as any;

  const scholarships = u.scholarships.map((s) => ({
    id: s.id,
    name: s.name,
    eligibility: s.eligibility ?? null,
    minGpa: s.minGpa ?? null,
    minIelts: s.minIelts ?? null,
    description: s.description ?? null,
    covers: s.covers ?? null,
  }));
  const deadlines = u.deadlines.map((d) => ({
    id: d.id,
    label: d.label ?? null,
    date: d.date,
  }));

  const uniProfile: IUniversityProfile = {
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
    qsWorldRank: uExt.qsWorldRank ?? undefined,
    theWorldRank: uExt.theWorldRank ?? undefined,
    minGpa: u.minGpa ?? undefined,
    minIelts: u.minIelts ?? undefined,
    minSat: u.minSat ?? undefined,
    entGrantMin: uExt.entGrantMin ?? undefined,
    entPaidMin: uExt.entPaidMin ?? undefined,
    entSubject: uExt.entSubject ?? undefined,
    acceptanceRate: uExt.acceptanceRate ?? undefined,
    studentFacultyRatio: uExt.studentFacultyRatio ?? undefined,
    employmentRate6mo: uExt.employmentRate6mo ?? undefined,
    avgStartingSalaryUsd: uExt.avgStartingSalaryUsd ?? undefined,
    campusSizeHa: uExt.campusSizeHa ?? undefined,
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

  return { profile: uniProfile, scholarships, deadlines };
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

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  // Run all DB fetches concurrently
  const [uniData, studentProfile, preferences] = await Promise.all([
    getUniversityFromDB(id),
    userId ? getUserProfile(userId) : Promise.resolve(null),
    userId ? getUserPreferences(userId) : Promise.resolve([]),
  ]);

  if (!uniData) notFound();
  const { profile: university, scholarships, deadlines } = uniData!;
  const profile = studentProfile ?? MOCK_SESSION_PROFILE;
  const docs = profile.documents;

  const rsDetail = computeRS(university, preferences, {
    gpa: profile.gpa,
    ielts: profile.ielts,
    sat: profile.sat,
    budgetUsdPerYear: profile.budgetUsdPerYear,
  });
  const rsScore = rsDetail.score > 0 ? rsDetail.score : (university.recommendationScore ?? university.fitScore);

  const missingDocs = docs
    .filter((d) => d.status === "pending" && !d.fileName)
    .map((d) => d.kind);

  const milestones = deadlines.map((d, i) => ({
    id: `dl_${i}`,
    label: d.label ?? "Deadline",
    due: d.date,
    isPast: new Date(d.date) < new Date(),
  }));

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
                    studentGpa={profile.gpa}
                    studentIelts={profile.ielts.overall}
                    uniMinGpa={university.minGpa}
                    uniMinIelts={university.minIelts}
                    uniMinSat={university.minSat}
                    studentSat={profile.sat?.total}
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
                  studentProfile={profile}
                  preferences={preferences}
                />
              </React.Suspense>
            </section>

            {/* C — Statistics Dashboard */}
            <StatsDashboard
              university={university}
              studentIelts={profile.ielts.overall}
              studentGpa={profile.gpa}
              studentSat={profile.sat?.total}
            />
            {/* C2 — AI chart commentary (streamed in) */}
            <React.Suspense fallback={null}>
              <AIChartComments
                university={university}
                studentProfile={profile}
                preferences={preferences}
              />
            </React.Suspense>

            {/* D — Programs */}
            <ProgramsSection
              programs={university.programs}
              interests={profile.interests}
              budgetUsdPerYear={profile.budgetUsdPerYear}
              preferredLevel={profile.preferredStudyLevel}
            />

            {/* E — Documents + Deadlines (two columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocumentsChecklist docs={docs} />
              <DeadlineTimeline milestones={milestones} />
            </div>

            {/* F — Scholarships */}
            <ScholarshipsSection
              scholarships={scholarships}
              studentGpa={profile.gpa}
              studentIelts={profile.ielts.overall}
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
