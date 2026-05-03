import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { IUniversityProfile } from "@/lib/types";

// Deserialise JSON string fields stored in SQLite
function parseUniversity(u: {
  id: string;
  name: string;
  nameRu: string | null;
  country: string;
  city: string;
  founded: number | null;
  type: string | null;
  languages: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  campusPhoto: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  worldRank: number | null;
  minGpa: number | null;
  minIelts: number | null;
  minSat: number | null;
  applicationDeadline: string | null;
  description: string | null;
  fitScore: number;
  recommendationScore: number;
  fitScoreBreakdown: string | null;
  programsJson: string;
  tags: string;
}): IUniversityProfile {
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
    programs: JSON.parse(u.programsJson) as IUniversityProfile["programs"],
    tags: JSON.parse(u.tags) as string[],
  };
}

export async function GET() {
  const session = await auth();

  const universities = await db.university.findMany({
    orderBy: { fitScore: "desc" },
  });

  const parsed = universities.map(parseUniversity);

  // Attach user's saved/hidden status if logged in
  if (session?.user) {
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      const userUnis = await db.userUniversity.findMany({
        where: { userId },
        select: { universityId: true, status: true },
      });
      const statusMap = new Map(userUnis.map((u) => [u.universityId, u.status]));
      return Response.json(
        parsed.map((u) => ({ ...u, userStatus: statusMap.get(u.id) ?? null })),
      );
    }
  }

  return Response.json(parsed);
}
