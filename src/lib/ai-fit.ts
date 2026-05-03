import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_EVALUATE_PROMPT } from "@/lib/ai-prompts";
import { MOCK_SESSION_PROFILE } from "@/store/useSessionStore";
import { db } from "@/lib/db";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";
import type { UserPreferenceData } from "@/lib/preference-categories";

export interface AIFitResult {
  score: number;
  reasons: string;
  gaps: string;
  source: "anthropic" | "mock";
}

// Deterministic hash for cache keying — includes preferences so priority changes bust the cache
function hashProfile(
  profile: IStudentProfile,
  preferences?: UserPreferenceData[],
): string {
  const key = JSON.stringify({
    gpa: profile.gpa,
    gpaScale: profile.gpaScale,
    ielts: profile.ielts.overall,
    sat: profile.sat?.total,
    interests: profile.interests,
    budget: profile.budgetUsdPerYear,
    studyLevel: profile.preferredStudyLevel,
    // Include preferences so changing priorities busts the cache
    prefs: preferences?.map((p) => ({
      key: p.categoryKey,
      pri: p.priority,
      vals: p.values.map((v) => v.value),
    })),
  });
  // djb2 hash
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) ^ key.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function buildMockFit(
  university: IUniversityProfile,
  profile: IStudentProfile,
  preferences?: UserPreferenceData[],
): AIFitResult {
  const score = university.fitScore;
  const cheapest = university.programs.length
    ? university.programs.reduce(
        (min, p) => (p.tuitionUsdPerYear < min.tuitionUsdPerYear ? p : min),
        university.programs[0],
      )
    : null;

  // Preference-aware score adjustment (mock mode)
  let adjustedScore = score;
  if (preferences) {
    const countryPref = preferences.find((p) => p.categoryKey === "countries");
    const cityPref = preferences.find((p) => p.categoryKey === "cities");
    const fieldPref = preferences.find((p) => p.categoryKey === "fields");

    const countryMatch = countryPref?.values.some(
      (v) => v.value.toLowerCase() === university.country.toLowerCase(),
    );
    const cityMatch = cityPref?.values.some(
      (v) => v.value.toLowerCase() === university.city.toLowerCase(),
    );
    const fieldMatch = fieldPref?.values.some((v) =>
      university.programs.some((p) =>
        p.field.toLowerCase().includes(v.value.toLowerCase()),
      ),
    );

    const countryWeight = (countryPref?.priority ?? 0) / 20;
    const cityWeight = (cityPref?.priority ?? 0) / 20;
    const fieldWeight = (fieldPref?.priority ?? 0) / 20;

    let boost = 0;
    if (countryMatch) boost += countryWeight * 8;
    if (cityMatch) boost += cityWeight * 5;
    if (fieldMatch) boost += fieldWeight * 10;
    adjustedScore = Math.min(100, Math.round(score + boost));
  }

  const reasons = `Your **GPA ${profile.gpa}/${profile.gpaScale}** sits in the top quartile of admitted students at ${university.name}. Your **IELTS ${profile.ielts.overall}** clears the program's English floor, and your interest in **${profile.interests[0] ?? "STEM"}** maps cleanly to the **${cheapest?.name ?? "flagship"}** track. The **$${(profile.budgetUsdPerYear ?? 0).toLocaleString()}/yr** budget covers the **$${(cheapest?.tuitionUsdPerYear ?? 0).toLocaleString()}** tuition${cheapest?.scholarshipAvailable ? " with scholarship room" : ""}.

- Strong academic alignment with the program core
- Language confidence above program floor
- Located in **${university.city}, ${university.country}** — low relocation friction`;

  const writingGap = profile.ielts.writing < 7;
  const gaps = `${writingGap ? `Your **writing** sub-score (**${profile.ielts.writing}**) trails the program preference of **7.0** — recommend a 4-week prep block. ` : ""}**Statement of purpose** and **recommendation letters** remain *pending*; without both, the application cannot be submitted.

- ${writingGap ? "Lift IELTS writing to **7.0+**" : "Polish IELTS writing for safety margin"}
- Draft and submit **statement of purpose**
- Secure **two recommendation letters**`;

  return { score: adjustedScore, reasons, gaps, source: "mock" };
}

function tryParseLLMResponse(
  text: string,
  fallbackScore: number,
): { score: number; reasons: string; gaps: string } | null {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as {
      fitScore?: number;
      rationale?: string;
      breakdown?: Record<string, number>;
    };
    const score = Number(parsed.fitScore ?? fallbackScore);
    const rationale = parsed.rationale ?? "Evaluation complete.";
    const breakdownLine = parsed.breakdown
      ? `**Academic ${parsed.breakdown.academic}** · **Language ${parsed.breakdown.language}** · **Financial ${parsed.breakdown.financial}** · **Interest ${parsed.breakdown.interest}**`
      : "";
    return {
      score,
      reasons: `${rationale}\n\n${breakdownLine}`.trim(),
      gaps: breakdownLine
        ? `Lowest axis: ${
            Object.entries(parsed.breakdown ?? {})
              .sort(([, a], [, b]) => Number(a) - Number(b))[0]
              ?.join(": ") ?? ""
          } — focus your prep here.`
        : "No critical gaps detected.",
    };
  } catch {
    return null;
  }
}

/** Build the preference-weights context block injected into the Claude prompt */
function buildPreferenceContext(preferences: UserPreferenceData[]): string {
  if (!preferences.length) return "";
  const lines = preferences
    .filter((p) => p.values.length > 0 || p.priority > 5)
    .map((p) => {
      const vals = p.values.map((v) => v.value).join(", ");
      return `  - ${p.label} (priority ${p.priority}/20)${vals ? `: ${vals}` : ""}`;
    });
  if (!lines.length) return "";
  return `\n\nStudent's weighted preferences (higher priority = more important to this student):\n${lines.join("\n")}`;
}

export async function fetchAIFit(
  university: IUniversityProfile,
  studentProfile: IStudentProfile = MOCK_SESSION_PROFILE,
  preferences?: UserPreferenceData[],
): Promise<AIFitResult> {
  const profileHash = hashProfile(studentProfile, preferences);

  // --- Check DB cache first ---
  const cached = await db.aIFitEvaluation
    .findUnique({
      where: {
        universityId_profileHash: { universityId: university.id, profileHash },
      },
    })
    .catch(() => null);

  if (cached) {
    return {
      score: cached.score,
      reasons: cached.reasons,
      gaps: cached.gaps,
      source: cached.source as AIFitResult["source"],
    };
  }

  // --- Compute ---
  let result: AIFitResult;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const modelId = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 400));
    result = buildMockFit(university, studentProfile, preferences);
  } else {
    try {
      const preferenceContext = preferences
        ? buildPreferenceContext(preferences)
        : "";

      const llmResult = await generateText({
        model: anthropic(modelId),
        system: SYSTEM_EVALUATE_PROMPT + preferenceContext,
        prompt: JSON.stringify({ studentProfile, university }),
        temperature: 0.15,
      });

      const parsed = tryParseLLMResponse(llmResult.text, university.fitScore);
      result = parsed
        ? { ...parsed, source: "anthropic" }
        : buildMockFit(university, studentProfile, preferences);
    } catch (err) {
      console.error("[AI Fit] Claude error:", err);
      result = buildMockFit(university, studentProfile, preferences);
    }
  }

  // --- Persist to cache ---
  await db.aIFitEvaluation
    .upsert({
      where: {
        universityId_profileHash: { universityId: university.id, profileHash },
      },
      create: {
        universityId: university.id,
        profileHash,
        score: result.score,
        reasons: result.reasons,
        gaps: result.gaps,
        source: result.source,
      },
      update: {
        score: result.score,
        reasons: result.reasons,
        gaps: result.gaps,
        source: result.source,
      },
    })
    .catch(() => null);

  return result;
}
