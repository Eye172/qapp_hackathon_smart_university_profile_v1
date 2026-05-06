import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sessionId } = await params;

  const chatSession = await db.chatSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chatSession || chatSession.userId !== userId) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  return Response.json(chatSession.messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sessionId } = await params;

  const chatSession = await db.chatSession.findUnique({
    where: { id: sessionId },
  });
  if (!chatSession || chatSession.userId !== userId) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  let body: { role: "user" | "assistant"; content: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = await db.chatMessage.create({
    data: { sessionId, role: body.role, content: body.content },
  });

  // Update session timestamp
  await db.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });

  return Response.json(message, { status: 201 });
}
