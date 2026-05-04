import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { ADVISOR_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export const runtime = "edge";
export const maxDuration = 30;

interface ChatRequestBody {
  messages: UIMessage[];
}

export async function POST(req: Request): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!Array.isArray(body?.messages)) {
    return new Response(
      JSON.stringify({ error: "'messages' must be a UIMessage[] array." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: openai("gpt-4o"),
    system: ADVISOR_CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(body.messages),
    temperature: 0.6,
  });

  return result.toUIMessageStreamResponse();
}
