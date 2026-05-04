import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { FIT_SCORE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { fetchUniversityEnrichment } from "@/lib/university-data";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";

export const runtime = "edge";
export const maxDuration = 30;

interface EvaluateRequestBody {
  studentProfile: IStudentProfile;
  university: IUniversityProfile;
}

export async function POST(req: Request): Promise<Response> {
  let body: EvaluateRequestBody;
  try {
    body = (await req.json()) as EvaluateRequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!body?.studentProfile || !body?.university) {
    return new Response(
      JSON.stringify({
        error: "Both 'studentProfile' and 'university' are required.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const enrichment = await fetchUniversityEnrichment(
    body.university.name,
    body.university.country,
  );

  const enrichedUniversity = {
    ...body.university,
    enrichment,
  };

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: FIT_SCORE_SYSTEM_PROMPT,
    prompt: JSON.stringify({
      studentProfile: body.studentProfile,
      university: enrichedUniversity,
    }),
    temperature: 0.2,
  });

  return result.toTextStreamResponse({
    headers: {
      "Cache-Tag": "university-data",
      "x-enrichment-source": enrichment.source,
    },
  });
}
