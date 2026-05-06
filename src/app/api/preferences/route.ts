import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PREFERENCE_CATEGORIES } from "@/lib/preference-categories";
import type { UserPreferenceData } from "@/lib/preference-categories";

// Returns all preference categories for the current user (creates missing ones with defaults)
export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.userPreferenceCategory.findMany({
    where: { userId },
    include: { values: { orderBy: { createdAt: "asc" } } },
    orderBy: { categoryKey: "asc" },
  });

  const existingKeys = new Set(existing.map((c) => c.categoryKey));

  // Create missing categories with defaults
  const missing = PREFERENCE_CATEGORIES.filter((c) => !existingKeys.has(c.key));
  if (missing.length) {
    await db.userPreferenceCategory.createMany({
      data: missing.map((c) => ({
        userId,
        categoryKey: c.key,
        priority: c.defaultPriority,
      })),
    });
  }

  // Re-fetch after creating missing
  const all = await db.userPreferenceCategory.findMany({
    where: { userId },
    include: { values: { orderBy: { createdAt: "asc" } } },
  });

  const result: UserPreferenceData[] = PREFERENCE_CATEGORIES.map((cfg) => {
    const row = all.find((r) => r.categoryKey === cfg.key);
    return {
      id: row?.id ?? "",
      categoryKey: cfg.key,
      label: cfg.label,
      priority: row?.priority ?? cfg.defaultPriority,
      values: (row?.values ?? []).map((v) => ({ id: v.id, value: v.value })),
    };
  });

  return Response.json(result);
}

// Batch-update priorities: body = { updates: { categoryKey: string; priority: number }[] }
export async function PUT(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { updates: { categoryKey: string; priority: number }[] };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await Promise.all(
    body.updates.map(({ categoryKey, priority }) =>
      db.userPreferenceCategory.upsert({
        where: { userId_categoryKey: { userId, categoryKey } },
        create: {
          userId,
          categoryKey,
          priority: Math.max(1, Math.min(20, priority)),
        },
        update: { priority: Math.max(1, Math.min(20, priority)) },
      }),
    ),
  );

  // Invalidate cached AI evaluations since weights changed
  const profile = await db.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (profile) {
    await db.aIFitEvaluation.deleteMany({}).catch(() => null);
  }

  return Response.json({ ok: true });
}
