import { auth } from "@/auth";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import { join, extname } from "path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const KIND_LABELS: Record<string, string> = {
  transcript:     "academic transcript or grade report",
  passport:       "passport or national identity document",
  ielts:          "IELTS certificate or English proficiency test result",
  sop:            "statement of purpose or personal statement essay",
  recommendation: "letter of recommendation or reference letter",
  other:          "official academic or personal document",
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: documentId } = await params;

  // Verify ownership
  const doc = await db.studentDocument.findUnique({
    where: { id: documentId },
    include: { profile: { select: { userId: true } } },
  });
  if (!doc || doc.profile.userId !== userId) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  if (doc.status !== "uploaded") {
    return Response.json({ error: "Document must be uploaded before verifying." }, { status: 400 });
  }
  if (!doc.url) {
    return Response.json({ error: "No file attached to this document." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const kindLabel = KIND_LABELS[doc.kind] ?? KIND_LABELS.other;
  let verified = false;
  let reason = "";

  if (!apiKey) {
    // No API key — mock a plausible response based on filename
    const hasFile = Boolean(doc.fileName && doc.fileName.length > 0);
    verified = hasFile;
    reason = hasFile
      ? `Document "${doc.fileName}" appears to be a valid ${kindLabel}. (Demo mode — connect OpenAI API for real verification)`
      : `No file found. Please re-upload your ${kindLabel}.`;
  } else {
    const modelId = process.env.OPENAI_MODEL ?? "gpt-4o";
    const ext = extname(doc.url).toLowerCase();
    const isImage = IMAGE_EXTS.has(ext);

    const systemPrompt = `You are a strict document verification assistant for a university admissions platform.
Your job is to check if the uploaded file looks like a legitimate ${kindLabel}.
Respond ONLY with valid JSON: { "verified": boolean, "reason": string (1-2 sentences, friendly but professional) }`;

    let body: object;

    if (isImage) {
      // Read file and base64-encode for GPT Vision
      const filePath = join(process.cwd(), "public", doc.url.replace(/^\//, ""));
      let base64 = "";
      try {
        const buf = await readFile(filePath);
        base64 = buf.toString("base64");
      } catch {
        return Response.json({ error: "Could not read file from disk." }, { status: 500 });
      }

      const mimeMap: Record<string, string> = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
      };
      const mime = mimeMap[ext] ?? "image/jpeg";

      body = {
        model: modelId,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please verify this document. It should be a ${kindLabel}. File name: "${doc.fileName}".`,
              },
              {
                type: "image_url",
                image_url: { url: `data:${mime};base64,${base64}`, detail: "low" },
              },
            ],
          },
        ],
      };
    } else {
      // PDF or other — verify by filename + metadata only
      body = {
        model: "gpt-4o-mini",
        max_tokens: 200,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Verify this document entry. Expected type: ${kindLabel}. File name: "${doc.fileName}". File extension: "${ext}". Does this look plausible? If the filename and extension are consistent with a ${kindLabel}, mark verified=true.`,
          },
        ],
      };
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `OpenAI error: ${err}` }, { status: 502 });
      }

      const data = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      const raw = data.choices[0]?.message?.content ?? "{}";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as { verified?: boolean; reason?: string };
      verified = Boolean(parsed.verified);
      reason = parsed.reason ?? (verified ? "Document looks valid." : "Could not confirm document authenticity.");
    } catch {
      return Response.json({ error: "Failed to parse GPT response." }, { status: 502 });
    }
  }

  // Update DB status
  const newStatus = verified ? "verified" : "rejected";
  const updated = await db.studentDocument.update({
    where: { id: documentId },
    data: { status: newStatus },
  });

  return Response.json({
    id: updated.id,
    status: updated.status,
    verified,
    reason,
  });
}
