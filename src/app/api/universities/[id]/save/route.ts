import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: universityId } = await params;

  await db.userUniversity.upsert({
    where: { userId_universityId: { userId, universityId } },
    create: { userId, universityId, status: "saved" },
    update: { status: "saved" },
  });

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: universityId } = await params;

  await db.userUniversity
    .delete({
      where: { userId_universityId: { userId, universityId } },
    })
    .catch(() => null); // ignore if it didn't exist

  return Response.json({ ok: true });
}
