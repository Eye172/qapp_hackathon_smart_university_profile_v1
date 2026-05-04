/**
 * RS Score — Recommendation Score engine.
 *
 * Pure function, no server-only imports. Safe to use on both
 * Next.js server components and client components.
 *
 * Score 0-100 = weighted sum of how well a university satisfies
 * each of the user's preference categories, multiplied by the
 * category's priority coefficient.
 */
import type { IUniversityProfile, IStudentProfile } from "@/lib/types";
import type { UserPreferenceData } from "@/lib/preference-categories";

/* ─── Public types ───────────────────────────────────────────── */

export interface RSMatch {
  category: string;
  label: string;
  weight: number;   // priority value (1-20)
  matchPct: number; // 0-1
}

export interface RSDetail {
  score: number;        // 0-100, rounded
  matches: RSMatch[];   // matchPct >= 0.6
  mismatches: RSMatch[]; // matchPct < 0.6
}

/* ─── Helpers ────────────────────────────────────────────────── */

function norm(s: string) {
  return s.toLowerCase().trim();
}

function cheapestTuition(university: IUniversityProfile): number {
  if (!university.programs.length) return 0;
  return Math.min(...university.programs.map((p) => p.tuitionUsdPerYear ?? 0));
}

/* ─── Core engine ────────────────────────────────────────────── */

export function computeRS(
  university: IUniversityProfile,
  preferences: UserPreferenceData[],
  profile?: Pick<IStudentProfile, "gpa" | "ielts" | "sat" | "budgetUsdPerYear">,
): RSDetail {
  const matches: RSMatch[] = [];
  const mismatches: RSMatch[] = [];

  let totalWeight = 0;
  let weightedScore = 0;

  for (const pref of preferences) {
    const { categoryKey, priority, values } = pref;
    if (priority <= 0) continue;

    const vals = values.map((v) => norm(v.value));

    // Categories that need values to be meaningful
    const needsValues = [
      "countries", "cities", "fields", "languages",
      "budget", "rank", "scholarship", "studyLevel",
    ];
    if (needsValues.includes(categoryKey) && vals.length === 0) continue;

    let matchPct = 0;
    let label = "";

    // ── countries ────────────────────────────────────────────────
    if (categoryKey === "countries") {
      const uniC = norm(university.country);
      const hit = vals.some((v) => uniC.includes(v) || v.includes(uniC));
      matchPct = hit ? 1 : 0;
      label = hit
        ? `✓ Located in ${university.country}`
        : `✗ Not in preferred countries (${vals.slice(0, 3).join(", ")})`;
    }

    // ── cities ───────────────────────────────────────────────────
    else if (categoryKey === "cities") {
      const uniCi = norm(university.city);
      const hit = vals.some((v) => uniCi.includes(v) || v.includes(uniCi));
      matchPct = hit ? 1 : 0;
      label = hit
        ? `✓ Located in ${university.city}`
        : `✗ Not in preferred cities`;
    }

    // ── fields ───────────────────────────────────────────────────
    else if (categoryKey === "fields") {
      const progFields = university.programs.map((p) => norm(p.field ?? ""));
      const hitField = vals.find((v) =>
        progFields.some((f) => f.includes(v) || v.includes(f)),
      );
      matchPct = hitField ? 1 : 0;
      label = hitField
        ? `✓ Offers ${hitField} programs`
        : `✗ No matching field (${vals.slice(0, 2).join(", ")})`;
    }

    // ── languages ────────────────────────────────────────────────
    else if (categoryKey === "languages") {
      const progLangs = university.programs.map((p) => norm(p.language ?? ""));
      const tagLangs = university.tags.map((t) => norm(t));
      const allLangs = [...progLangs, ...tagLangs];
      const hit = vals.some((v) => allLangs.some((l) => l.includes(v)));
      matchPct = hit ? 1 : 0;
      label = hit
        ? `✓ Instruction in ${vals[0]}`
        : `✗ Not taught in ${vals.join(" / ")}`;
    }

    // ── budget ───────────────────────────────────────────────────
    else if (categoryKey === "budget") {
      const budget = parseFloat(vals[0]);
      if (isNaN(budget)) continue;
      const cheapest = cheapestTuition(university);
      if (cheapest === 0) {
        matchPct = 1;
        label = `✓ Free / scholarship-only program`;
      } else if (cheapest <= budget) {
        matchPct = 1;
        label = `✓ Tuition $${cheapest.toLocaleString()} fits $${budget.toLocaleString()} budget`;
      } else if (cheapest <= budget * 1.3) {
        matchPct = 0.5;
        label = `⚠ Tuition $${cheapest.toLocaleString()} slightly over $${budget.toLocaleString()} budget`;
      } else {
        matchPct = 0;
        label = `✗ Tuition $${cheapest.toLocaleString()} exceeds $${budget.toLocaleString()} budget`;
      }
    }

    // ── rank ─────────────────────────────────────────────────────
    else if (categoryKey === "rank") {
      const maxRank = parseInt(vals[0], 10);
      if (!university.worldRank) {
        matchPct = 0.4;
        label = `⚠ World ranking not listed`;
      } else if (university.worldRank <= maxRank) {
        matchPct = 1;
        label = `✓ Ranked #${university.worldRank} (within top ${maxRank})`;
      } else {
        // Partial credit: ranked just outside
        const over = (university.worldRank - maxRank) / maxRank;
        matchPct = Math.max(0, 1 - over);
        label = `⚠ Ranked #${university.worldRank} (preferred top ${maxRank})`;
      }
    }

    // ── scholarship ──────────────────────────────────────────────
    else if (categoryKey === "scholarship") {
      const hasAid = university.programs.some((p) => p.scholarshipAvailable);
      matchPct = hasAid ? 1 : 0;
      label = hasAid
        ? `✓ Financial aid / scholarship available`
        : `✗ No scholarship listed`;
    }

    // ── studyLevel ───────────────────────────────────────────────
    else if (categoryKey === "studyLevel") {
      const levels = university.programs.map((p) => norm(p.level));
      const hit = vals.some((v) => levels.includes(v));
      matchPct = hit ? 1 : 0;
      label = hit
        ? `✓ Offers ${vals[0]} programs`
        : `✗ No ${vals[0]} programs found`;
    }

    // ── minGpa ───────────────────────────────────────────────────
    else if (categoryKey === "minGpa") {
      if (!profile) continue;
      const floor = university.minGpa ?? 0;
      if (floor === 0) continue;
      const student = profile.gpa;
      if (student >= floor) {
        matchPct = 1;
        label = `✓ GPA ${student} meets minimum ${floor}`;
      } else {
        matchPct = 0;
        label = `✗ GPA ${student} below minimum ${floor} — ineligible`;
      }
    }

    // Unknown category — skip
    else {
      continue;
    }

    totalWeight += priority;
    weightedScore += priority * matchPct;

    const entry: RSMatch = { category: categoryKey, label, weight: priority, matchPct };
    if (matchPct >= 0.6) matches.push(entry);
    else mismatches.push(entry);
  }

  const score =
    totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  // Sort by weight desc
  matches.sort((a, b) => b.weight - a.weight);
  mismatches.sort((a, b) => b.weight - a.weight);

  return { score, matches, mismatches };
}
