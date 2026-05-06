import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { IStudentDocument } from "@/lib/types";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.studentProfile.findUnique({
    where: { userId },
    include: { documents: { orderBy: { uploadedAt: "asc" } } },
  });

  if (!profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  const docs: IStudentDocument[] = profile.documents.map((d) => ({
    id: d.id,
    kind: d.kind as IStudentDocument["kind"],
    fileName: d.fileName,
    status: d.status as IStudentDocument["status"],
    url: d.url ?? undefined,
    sizeBytes: d.sizeBytes ?? undefined,
    uploadedAt: d.uploadedAt.toISOString(),
  }));

  return Response.json(docs);
}
