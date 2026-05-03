import { fetchAIFit } from "@/lib/ai-fit";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";

interface FitBody {
  studentProfile?: IStudentProfile;
  university?: IUniversityProfile;
}

export async function POST(req: Request): Promise<Response> {
  let body: FitBody;
  try {
    body = (await req.json()) as FitBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.studentProfile || !body?.university) {
    return Response.json(
      { error: "studentProfile and university required" },
      { status: 400 },
    );
  }

  const result = await fetchAIFit(body.university, body.studentProfile);
  return Response.json(result);
}
