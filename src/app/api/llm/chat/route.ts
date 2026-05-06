import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/auth";
import { ADVISOR_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatRequestBody {
  messages: UIMessage[];
}

function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function listOrNone(values: string[]): string {
  return values.length ? values.join(", ") : "not provided";
}

async function buildAdvisorUserContext(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: { documents: { orderBy: { uploadedAt: "asc" } } },
      },
      preferenceCategories: {
        include: { values: { orderBy: { createdAt: "asc" } } },
        orderBy: { categoryKey: "asc" },
      },
      userUniversities: {
        include: {
          university: {
            select: {
              name: true,
              country: true,
              city: true,
              worldRank: true,
              minGpa: true,
              minIelts: true,
              minSat: true,
              applicationDeadline: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user?.profile) {
    return "Authenticated user context: profile is not completed yet. Ask only for missing profile fields that are truly needed.";
  }

  const profile = user.profile;
  const interests = parseStringArray(profile.interests);
  const preferredCountries = parseStringArray(profile.preferredCountries);
  const documents = profile.documents.map(
    (document) => `${document.kind}: ${document.status}${document.fileName ? ` (${document.fileName})` : ""}`,
  );
  const preferences = user.preferenceCategories
    .map((category) => {
      const values = category.values.map((value) => value.value);
      return `${category.categoryKey} priority ${category.priority}/20: ${listOrNone(values)}`;
    })
    .join("\n");
  const savedUniversities = user.userUniversities
    .filter((item) => item.status === "saved")
    .map((item) => {
      const university = item.university;
      return `${university.name} (${university.city}, ${university.country})${university.worldRank ? `, rank ${university.worldRank}` : ""}${university.applicationDeadline ? `, deadline ${university.applicationDeadline}` : ""}`;
    });
  const hiddenUniversities = user.userUniversities
    .filter((item) => item.status === "hidden")
    .map((item) => item.university.name);

  return `Authenticated student database context:
- Name: ${profile.fullName}
- Email: ${user.email ?? "not provided"}
- Nationality/current country: ${profile.nationality} / ${profile.currentCountry}
- Grade level: ${profile.gradeLevel}
- GPA: ${profile.gpa}/${profile.gpaScale}
- IELTS: overall ${profile.ieltsOverall ?? "not provided"}, listening ${profile.ieltsListening ?? "not provided"}, reading ${profile.ieltsReading ?? "not provided"}, writing ${profile.ieltsWriting ?? "not provided"}, speaking ${profile.ieltsSpeaking ?? "not provided"}
- SAT: total ${profile.satTotal ?? "not provided"}, math ${profile.satMath ?? "not provided"}, EBRW ${profile.satEbrw ?? "not provided"}
- Interests: ${listOrNone(interests)}
- Preferred countries: ${listOrNone(preferredCountries)}
- Preferred study level: ${profile.preferredStudyLevel}
- Budget per year: ${profile.budgetUsdPerYear ? `$${profile.budgetUsdPerYear}` : "not provided"}
- Documents: ${documents.length ? documents.join("; ") : "no documents tracked"}
- Saved universities: ${listOrNone(savedUniversities)}
- Hidden universities to avoid: ${listOrNone(hiddenUniversities)}
- Preference priorities:
${preferences || "not configured"}

Use this context silently. Do not ask the student to repeat facts that are already present. If the student asks which program fits them, infer from interests, study level, scores, budget, preferences, documents, and saved universities.`;
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

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const userContext = userId
    ? await buildAdvisorUserContext(userId)
    : "User is not authenticated. Give general guidance and ask them to sign in or complete their QApp profile for personalized advice.";

  const result = streamText({
    model: openai("gpt-4o"),
    system: `${ADVISOR_CHAT_SYSTEM_PROMPT}\n\n${userContext}`,
    messages: await convertToModelMessages(body.messages),
    temperature: 0.6,
  });

  return result.toUIMessageStreamResponse();
}
