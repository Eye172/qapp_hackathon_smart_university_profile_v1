import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ categoryKey: string; valueId: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { valueId } = await params;

  // Verify ownership
  const value = await db.userPreferenceValue.findUnique({
    where: { id: valueId },
    include: { category: { select: { userId: true } } },
  });

  if (!value || value.category.userId !== userId) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  await db.userPreferenceValue.delete({ where: { id: valueId } });
  return Response.json({ ok: true });
}
