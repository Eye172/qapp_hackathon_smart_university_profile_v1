import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { IStudentProfile, IStudentDocument } from "@/lib/types";

function toStudentProfile(
  p: {
    id: string;
    userId: string;
    fullName: string;
    nationality: string;
    currentCountry: string;
    gradeLevel: number;
    gpa: number;
    gpaScale: number;
    avatarUrl: string | null;
    ieltsOverall: number | null;
    ieltsListening: number | null;
    ieltsReading: number | null;
    ieltsWriting: number | null;
    ieltsSpeaking: number | null;
    ieltsTakenAt: string | null;
    satTotal: number | null;
    satMath: number | null;
    satEbrw: number | null;
    satTakenAt: string | null;
    interests: string;
    preferredCountries: string;
    preferredStudyLevel: string;
    budgetUsdPerYear: number | null;
    createdAt: Date;
    updatedAt: Date;
    documents: {
      id: string;
      kind: string;
      fileName: string;
      status: string;
      url: string | null;
      sizeBytes: number | null;
      uploadedAt: Date;
    }[];
  },
  email: string,
): IStudentProfile {
  return {
    id: p.id,
    fullName: p.fullName,
    email,
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
    documents: p.documents.map(
      (d): IStudentDocument => ({
        id: d.id,
        kind: d.kind as IStudentDocument["kind"],
        fileName: d.fileName,
        status: d.status as IStudentDocument["status"],
        url: d.url ?? undefined,
        sizeBytes: d.sizeBytes ?? undefined,
        uploadedAt: d.uploadedAt.toISOString(),
      }),
    ),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: { documents: { orderBy: { uploadedAt: "asc" } } },
      },
    },
  });

  if (!user?.profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  return Response.json(toStudentProfile(user.profile, user.email ?? ""));
}

export async function PUT(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<IStudentProfile>;
  try {
    body = (await req.json()) as Partial<IStudentProfile>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { profile: { select: { id: true } } },
  });
  if (!user?.profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  const updated = await db.studentProfile.update({
    where: { id: user.profile.id },
    data: {
      ...(body.fullName && { fullName: body.fullName }),
      ...(body.nationality && { nationality: body.nationality }),
      ...(body.currentCountry && { currentCountry: body.currentCountry }),
      ...(body.gradeLevel != null && { gradeLevel: body.gradeLevel }),
      ...(body.gpa != null && { gpa: body.gpa }),
      ...(body.gpaScale != null && { gpaScale: body.gpaScale }),
      ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      ...(body.ielts && {
        ieltsOverall: body.ielts.overall,
        ieltsListening: body.ielts.listening,
        ieltsReading: body.ielts.reading,
        ieltsWriting: body.ielts.writing,
        ieltsSpeaking: body.ielts.speaking,
        ieltsTakenAt: body.ielts.takenAt ?? null,
      }),
      ...(body.sat !== undefined && {
        satTotal: body.sat?.total ?? null,
        satMath: body.sat?.math ?? null,
        satEbrw: body.sat?.evidenceBasedReadingWriting ?? null,
        satTakenAt: body.sat?.takenAt ?? null,
      }),
      ...(body.interests && { interests: JSON.stringify(body.interests) }),
      ...(body.preferredCountries && {
        preferredCountries: JSON.stringify(body.preferredCountries),
      }),
      ...(body.preferredStudyLevel && {
        preferredStudyLevel: body.preferredStudyLevel,
      }),
      ...(body.budgetUsdPerYear !== undefined && {
        budgetUsdPerYear: body.budgetUsdPerYear ?? null,
      }),
    },
    include: { documents: { orderBy: { uploadedAt: "asc" } } },
  });

  const email = session?.user?.email ?? "";
  return Response.json(toStudentProfile(updated, email));
}
