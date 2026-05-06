import { db } from "@/lib/db";
import type { IUniversityProfile } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const u = await db.university.findUnique({ where: { id } });
  if (!u) {
    return Response.json({ error: "University not found." }, { status: 404 });
  }

  const result: IUniversityProfile = {
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

  return Response.json(result);
}
