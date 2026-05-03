import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CATEGORY_MAP } from "@/lib/preference-categories";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ categoryKey: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { categoryKey } = await params;
  const cfg = CATEGORY_MAP.get(categoryKey);
  if (!cfg) return Response.json({ error: "Unknown category." }, { status: 400 });

  let body: { value: string };
  try {
    body = (await req.json()) as { value: string };
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const value = body.value?.trim();
  if (!value) return Response.json({ error: "Value required." }, { status: 400 });

  // Ensure the category row exists
  const category = await db.userPreferenceCategory.upsert({
    where: { userId_categoryKey: { userId, categoryKey } },
    create: { userId, categoryKey, priority: cfg.defaultPriority },
    update: {},
    include: { values: true },
  });

  // Enforce maxValues
  if (cfg.maxValues !== null && category.values.length >= cfg.maxValues) {
    // Replace the single existing value
    const old = category.values[0];
    if (old) {
      const updated = await db.userPreferenceValue.update({
        where: { id: old.id },
        data: { value },
      });
      return Response.json({ id: updated.id, value: updated.value }, { status: 200 });
    }
  }

  const created = await db.userPreferenceValue.create({
    data: { categoryId: category.id, value },
  });

  return Response.json({ id: created.id, value: created.value }, { status: 201 });
}
