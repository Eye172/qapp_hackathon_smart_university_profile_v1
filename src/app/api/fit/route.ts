import { fetchAIFit } from "@/lib/ai-fit";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";
import type { UserPreferenceData } from "@/lib/preference-categories";

interface FitBody {
  studentProfile?: IStudentProfile;
  university?: IUniversityProfile;
  preferences?: UserPreferenceData[];
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

  try {
    const result = await fetchAIFit(
      body.university,
      body.studentProfile,
      body.preferences,
    );
    return Response.json(result);
  } catch (err) {
    console.error("[/api/fit] Unhandled error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Evaluation failed" },
      { status: 500 },
    );
  }
}
