import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { MOCK_SESSION_PROFILE } from "@/store/useSessionStore";
import { db } from "@/lib/db";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";
import type { UserPreferenceData } from "@/lib/preference-categories";

/* ─── Public types ───────────────────────────────────────────────────────── */
export interface AIFitResult {
  score: number;
  reasons: string;
  gaps: string;
  source: "openai" | "mock";
}

/* ─── Deterministic profile hash (cache key) ─────────────────────────────── */
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
    prefs: preferences?.map((p) => ({
      key: p.categoryKey,
      pri: p.priority,
      vals: p.values.map((v) => v.value),
    })),
  });
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) ^ key.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/* ─── Mock / deterministic fallback ─────────────────────────────────────── */
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

  // Preference-aware score boost (mock mode)
  let adjustedScore = score;
  if (preferences) {
    const countryPref = preferences.find((p) => p.categoryKey === "countries");
    const cityPref    = preferences.find((p) => p.categoryKey === "cities");
    const fieldPref   = preferences.find((p) => p.categoryKey === "fields");

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

    const cW = (countryPref?.priority ?? 0) / 20;
    const ciW = (cityPref?.priority    ?? 0) / 20;
    const fW  = (fieldPref?.priority   ?? 0) / 20;

    let boost = 0;
    if (countryMatch) boost += cW  * 8;
    if (cityMatch)    boost += ciW * 5;
    if (fieldMatch)   boost += fW  * 10;
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

/* ─── LLM response parser ────────────────────────────────────────────────── */
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

/* ─── Preference context block for the Claude prompt ────────────────────── */
function buildPreferenceContext(preferences: UserPreferenceData[]): string {
  if (!preferences.length) return "";
  const lines = preferences
    .filter((p) => p.values.length > 0 || p.priority > 5)
    .map((p) => {
      const vals = p.values.map((v) => v.value).join(", ");
      return `  - ${p.label} (priority ${p.priority}/20)${vals ? `: ${vals}` : ""}`;
    });
  if (!lines.length) return "";
  return `\n\nStudent's weighted preferences (higher priority = more important):\n${lines.join("\n")}`;
}

/* ─── System prompt ──────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are the QApp University Fit Engine — an admissions intelligence model that scores how well a single applicant matches a single university.

You receive two JSON objects in the user message:
- "studentProfile": GPA + scale, IELTS sub-scores, SAT (optional), nationality, interests[], preferredCountries[], preferred study level, annual budget USD.
- "university": name, country, city, world rank, programs[] (level, language, tuitionUsdPerYear, scholarshipAvailable, field), tags[], minGpa, minIelts, minSat.

Respond ONLY with valid JSON in this exact schema:
{
  "fitScore": <integer 0–100>,
  "rationale": "<2–4 sentence narrative explaining the match in plain English, use **bold** for key numbers>",
  "breakdown": {
    "academic": <0–100>,
    "language": <0–100>,
    "financial": <0–100>,
    "interest": <0–100>
  }
}

Rules:
- fitScore = weighted average of breakdown axes (academic 35%, language 25%, financial 20%, interest 20%)
- Be specific: cite actual GPA, IELTS, tuition numbers from the data
- If the student clearly meets all requirements, fitScore should be 75–95
- If there are significant gaps, fitScore should be 40–70
- Respond with JSON only — no markdown code fences, no explanation outside the JSON`;

/* ─── Main export ────────────────────────────────────────────────────────── */
export async function fetchAIFit(
  university: IUniversityProfile,
  studentProfile: IStudentProfile = MOCK_SESSION_PROFILE,
  preferences?: UserPreferenceData[],
): Promise<AIFitResult> {
  const profileHash = hashProfile(studentProfile, preferences);

  // Check DB cache
  const cached = await db.aIFitEvaluation
    .findUnique({
      where: {
        universityId_profileHash: { universityId: university.id, profileHash },
      },
    })
    .catch(() => null);

  if (cached) {
    return {
      score:   cached.score,
      reasons: cached.reasons,
      gaps:    cached.gaps,
      source:  cached.source as AIFitResult["source"],
    };
  }

  // Compute
  let result: AIFitResult;
  const apiKey = process.env.OPENAI_API_KEY;
  const modelId = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 400));
    result = buildMockFit(university, studentProfile, preferences);
  } else {
    try {
      const preferenceContext = preferences ? buildPreferenceContext(preferences) : "";
      const llmResult = await generateText({
        model: openai(modelId),
        system: SYSTEM_PROMPT + preferenceContext,
        prompt: JSON.stringify({ studentProfile, university }),
        temperature: 0.15,
      });

      const parsed = tryParseLLMResponse(llmResult.text, university.fitScore);
      result = parsed
        ? { ...parsed, source: "openai" }
        : buildMockFit(university, studentProfile, preferences);
    } catch (err) {
      console.error("[AI Fit] OpenAI error:", err);
      result = buildMockFit(university, studentProfile, preferences);
    }
  }

  // Persist to cache
  await db.aIFitEvaluation
    .upsert({
      where: {
        universityId_profileHash: { universityId: university.id, profileHash },
      },
      create: {
        universityId: university.id,
        profileHash,
        score:  result.score,
        reasons: result.reasons,
        gaps:   result.gaps,
        source: result.source,
      },
      update: {
        score:  result.score,
        reasons: result.reasons,
        gaps:   result.gaps,
        source: result.source,
      },
    })
    .catch(() => null);

  return result;
}
