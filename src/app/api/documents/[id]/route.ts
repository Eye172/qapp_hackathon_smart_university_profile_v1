import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { DocumentStatus } from "@/lib/types";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: documentId } = await params;

  let body: { status?: DocumentStatus; fileName?: string };
  try {
    body = (await req.json()) as { status?: DocumentStatus; fileName?: string };
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Ensure the document belongs to this user
  const doc = await db.studentDocument.findUnique({
    where: { id: documentId },
    include: { profile: { select: { userId: true } } },
  });

  if (!doc || doc.profile.userId !== userId) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const updated = await db.studentDocument.update({
    where: { id: documentId },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.fileName !== undefined && { fileName: body.fileName }),
    },
  });

  return Response.json({
    id: updated.id,
    kind: updated.kind,
    fileName: updated.fileName,
    status: updated.status,
    uploadedAt: updated.uploadedAt.toISOString(),
  });
}
