import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await db.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // just the first message as preview
      },
    },
  });

  return Response.json(sessions);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: string };
  try {
    body = (await req.json()) as { title?: string };
  } catch {
    body = {};
  }

  const chatSession = await db.chatSession.create({
    data: { userId, title: body.title ?? "New conversation" },
  });

  return Response.json(chatSession, { status: 201 });
}
