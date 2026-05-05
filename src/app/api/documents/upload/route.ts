import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const docId = formData.get("docId") as string | null;

  if (!file || !docId) {
    return Response.json({ error: "Missing file or docId" }, { status: 400 });
  }

  // Verify the document belongs to this user
  const doc = await db.studentDocument.findUnique({
    where: { id: docId },
    include: { profile: { select: { userId: true } } },
  });
  if (!doc || doc.profile.userId !== userId) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  // Write the file to public/uploads/
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "bin";
  const savedName = `${docId}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadsDir, savedName), Buffer.from(bytes));

  const url = `/uploads/${savedName}`;

  const updated = await db.studentDocument.update({
    where: { id: docId },
    data: {
      fileName: file.name,
      url,
      sizeBytes: file.size,
      status: "uploaded",
    },
  });

  return Response.json({
    id: updated.id,
    kind: updated.kind,
    fileName: updated.fileName,
    url: updated.url,
    sizeBytes: updated.sizeBytes,
    status: updated.status,
    uploadedAt: updated.uploadedAt.toISOString(),
  });
}
