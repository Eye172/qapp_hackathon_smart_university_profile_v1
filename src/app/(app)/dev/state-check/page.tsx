"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { MOCK_UNIVERSITIES } from "@/lib/mock-data";
import { cn } from "@/lib/tailwind-utils";

type EvalState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; status: number; preview: string }
  | { kind: "error"; status: number; message: string };

export default function StateCheckPage() {
  const profile = useSessionStore((s) => s.profile);
  const updateDocumentStatus = useSessionStore((s) => s.updateDocumentStatus);

  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const saveNode = useAlgorithmStore((s) => s.saveNode);
  const hideNode = useAlgorithmStore((s) => s.hideNode);
  const reset = useAlgorithmStore((s) => s.reset);

  const [evalState, setEvalState] = useState<EvalState>({ kind: "idle" });

  const dedupTest = (() => {
    const before = useAlgorithmStore.getState().savedUniversities.length;
    useAlgorithmStore.getState().saveNode("uni_dedup_probe");
    useAlgorithmStore.getState().saveNode("uni_dedup_probe");
    useAlgorithmStore.getState().saveNode("uni_dedup_probe");
    const after = useAlgorithmStore.getState().savedUniversities.filter(
      (id) => id === "uni_dedup_probe",
    ).length;
    useAlgorithmStore.getState().unsaveNode("uni_dedup_probe");
    return { passed: after === 1, before, after };
  })();

  async function pingEvaluate() {
    setEvalState({ kind: "loading" });
    try {
      const res = await fetch("/api/llm/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfile: profile,
          university: MOCK_UNIVERSITIES[0],
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        setEvalState({
          kind: "error",
          status: res.status,
          message: text.slice(0, 400),
        });
        return;
      }
      setEvalState({
        kind: "ok",
        status: res.status,
        preview: text.slice(0, 600),
      });
    } catch (err) {
      setEvalState({
        kind: "error",
        status: 0,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <main className="min-h-screen px-6 py-24 max-w-5xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-[length:var(--text-fluid-2xl)]">
          L2 State Check
        </h1>
        <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
          Temporary scaffold — verifies session hydration, algorithm dedup, and
          edge route initialization.
        </p>
      </header>

      <section className="shadow-glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          useSessionStore.profile
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-[length:var(--text-fluid-sm)]">
          <dt className="text-[color:var(--color-muted)]">Name</dt>
          <dd>{profile.fullName}</dd>
          <dt className="text-[color:var(--color-muted)]">Nationality</dt>
          <dd>{profile.nationality}</dd>
          <dt className="text-[color:var(--color-muted)]">Grade</dt>
          <dd>{profile.gradeLevel}</dd>
          <dt className="text-[color:var(--color-muted)]">GPA</dt>
          <dd>
            {profile.gpa} / {profile.gpaScale}
          </dd>
          <dt className="text-[color:var(--color-muted)]">IELTS overall</dt>
          <dd>{profile.ielts.overall}</dd>
          <dt className="text-[color:var(--color-muted)]">SAT total</dt>
          <dd>{profile.sat?.total ?? "—"}</dd>
          <dt className="text-[color:var(--color-muted)]">Documents</dt>
          <dd>{profile.documents.length}</dd>
        </dl>
        <details className="pt-2">
          <summary className="cursor-pointer text-[length:var(--text-fluid-xs)] text-[color:var(--color-accent)]">
            Raw JSON
          </summary>
          <pre className="mt-2 text-[length:var(--text-fluid-xs)] overflow-auto max-h-64 bg-black/5 rounded-lg p-3">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </details>
        <button
          type="button"
          onClick={() =>
            updateDocumentStatus(
              profile.documents[2]?.id ?? "doc_sat",
              "verified",
            )
          }
          className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-accent)] underline ease-snappy"
        >
          Mark SAT doc as verified (mutation test)
        </button>
      </section>

      <section className="shadow-glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          useAlgorithmStore
        </h2>
        <p className="text-[length:var(--text-fluid-sm)]">
          <span className="text-[color:var(--color-muted)]">Saved: </span>
          {saved.length === 0 ? "—" : saved.join(", ")}
        </p>
        <p className="text-[length:var(--text-fluid-sm)]">
          <span className="text-[color:var(--color-muted)]">Hidden: </span>
          {hidden.length === 0 ? "—" : hidden.join(", ")}
        </p>
        <div className="flex flex-wrap gap-2">
          {MOCK_UNIVERSITIES.map((u) => (
            <div key={u.id} className="flex gap-1">
              <button
                type="button"
                onClick={() => saveNode(u.id)}
                className="rounded-full px-3 py-1 text-[length:var(--text-fluid-xs)] bg-[color:var(--color-accent)] text-white ease-snappy"
              >
                Save {u.id}
              </button>
              <button
                type="button"
                onClick={() => hideNode(u.id)}
                className="rounded-full px-3 py-1 text-[length:var(--text-fluid-xs)] border border-[color:var(--color-border)] ease-snappy"
              >
                Hide
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-3 py-1 text-[length:var(--text-fluid-xs)] underline"
          >
            Reset
          </button>
        </div>
        <p
          className={cn(
            "text-[length:var(--text-fluid-xs)] mt-2",
            dedupTest.passed ? "text-emerald-700" : "text-red-700",
          )}
        >
          Dedup probe (3× saveNode of same id):{" "}
          {dedupTest.passed
            ? "✓ appended once"
            : `✗ appeared ${dedupTest.after} times`}
        </p>
      </section>

      <section className="shadow-glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          POST /api/llm/evaluate (edge)
        </h2>
        <button
          type="button"
          onClick={pingEvaluate}
          disabled={evalState.kind === "loading"}
          className="rounded-full px-4 py-2 text-[length:var(--text-fluid-sm)] bg-[color:var(--color-accent)] text-white ease-snappy disabled:opacity-50"
        >
          {evalState.kind === "loading" ? "Streaming…" : "Ping evaluate"}
        </button>
        {evalState.kind === "ok" && (
          <div className="space-y-1">
            <p className="text-[length:var(--text-fluid-xs)] text-emerald-700">
              ✓ {evalState.status} — edge runtime initialized
            </p>
            <pre className="text-[length:var(--text-fluid-xs)] overflow-auto max-h-48 bg-black/5 rounded-lg p-3 whitespace-pre-wrap">
              {evalState.preview || "(empty stream)"}
            </pre>
          </div>
        )}
        {evalState.kind === "error" && (
          <div className="space-y-1">
            <p className="text-[length:var(--text-fluid-xs)] text-red-700">
              ✗ {evalState.status} — {evalState.message}
            </p>
            <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Most likely cause: missing OPENAI_API_KEY in .env.local. The route
              registered correctly — only the upstream LLM call failed.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
