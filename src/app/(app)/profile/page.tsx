"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { ActionButton } from "@/components/ui/button";
import { TagPill } from "@/components/ui/badge";
import { RequirementRow } from "@/components/profile/requirement-row";
import { PreferencesEditor } from "@/components/profile/preferences-editor";
import { cn } from "@/lib/tailwind-utils";
import type { StudyLevel, DocumentStatus, IUniversityProfile } from "@/lib/types";

const GRADE_LEVELS = [9, 10, 11, 12];
const GPA_SCALES = [4.0, 5.0, 10.0, 100] as const;
const STUDY_LEVELS: StudyLevel[] = ["bachelor", "master", "phd"];

/* ─── Mini university card ───────────────────────────────────────────────── */
function UniMiniCard({
  id,
  universitiesMap,
  onAction,
  actionLabel,
  actionClass,
}: {
  id: string;
  universitiesMap: Record<string, IUniversityProfile>;
  onAction: (id: string) => void;
  actionLabel: string;
  actionClass?: string;
}) {
  const router = useRouter();
  const uni = universitiesMap[id];
  const name = uni?.name ?? id;
  const country = uni?.country ?? "";
  const rank = uni?.worldRank;

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl",
        "border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
        "hover:border-[color:var(--color-accent)]/40 hover:bg-[color:var(--color-accent)]/5",
        "transition-colors duration-150 cursor-pointer",
      )}
      onClick={() => router.push(`/university/${id}`)}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[length:var(--text-fluid-sm)] font-medium leading-snug truncate">
          {name}
        </p>
        {(country || rank) && (
          <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] truncate">
            {[country, rank ? `#${rank}` : ""].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAction(id);
        }}
        className={cn(
          "shrink-0 text-[length:var(--text-fluid-xs)] rounded-full px-2.5 py-1",
          "border border-transparent transition-colors duration-150",
          "hover:border-current",
          actionClass ?? "text-[color:var(--color-muted)] hover:text-red-500",
        )}
      >
        {actionLabel}
      </button>
    </div>
  );
}

/* ─── Two-column saved / excluded panel ─────────────────────────────────── */
function UniversityLists({
  saved,
  hidden,
  universitiesMap,
  unsaveNode,
  unhideNode,
}: {
  saved: string[];
  hidden: string[];
  universitiesMap: Record<string, IUniversityProfile>;
  unsaveNode: (id: string) => void;
  unhideNode: (id: string) => void;
}) {
  return (
    <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-4">
      <h2 className="font-display text-[length:var(--text-fluid-xl)]">
        My universities
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Saved */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[length:var(--text-fluid-sm)] font-medium">
              Saved
            </span>
            <TagPill variant="success">{saved.length}</TagPill>
          </div>
          <div
            className={cn(
              "rounded-2xl border border-[color:var(--color-border)]",
              "bg-[color:var(--color-surface-2,#f9f9f9)]",
              "p-2 flex flex-col gap-1.5 overflow-y-auto",
              saved.length > 0 ? "min-h-[120px] max-h-[300px]" : "h-20",
            )}
          >
            {saved.length === 0 ? (
              <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] text-center m-auto">
                No saved universities yet
              </p>
            ) : (
              saved.map((id) => (
                <UniMiniCard
                  key={id}
                  id={id}
                  universitiesMap={universitiesMap}
                  onAction={unsaveNode}
                  actionLabel="remove"
                  actionClass="text-[color:var(--color-muted)] hover:text-red-500"
                />
              ))
            )}
          </div>
        </div>

        {/* Hidden / Excluded */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[length:var(--text-fluid-sm)] font-medium">
              Excluded
            </span>
            <TagPill variant="warning">{hidden.length}</TagPill>
          </div>
          <div
            className={cn(
              "rounded-2xl border border-[color:var(--color-border)]",
              "bg-[color:var(--color-surface-2,#f9f9f9)]",
              "p-2 flex flex-col gap-1.5 overflow-y-auto",
              hidden.length > 0 ? "min-h-[120px] max-h-[300px]" : "h-20",
            )}
          >
            {hidden.length === 0 ? (
              <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] text-center m-auto">
                No excluded universities
              </p>
            ) : (
              hidden.map((id) => (
                <UniMiniCard
                  key={id}
                  id={id}
                  universitiesMap={universitiesMap}
                  onAction={unhideNode}
                  actionLabel="restore"
                  actionClass="text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-dark,#6366f1)]"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { data: session } = useSession();
  const profile = useSessionStore((s) => s.profile);
  const updateProfile = useSessionStore((s) => s.updateProfile);
  const updateDocumentStatus = useSessionStore((s) => s.updateDocumentStatus);
  const hydrateFromServer = useSessionStore((s) => s.hydrateFromServer);
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const unsaveNode = useAlgorithmStore((s) => s.unsaveNode);
  const unhideNode = useAlgorithmStore((s) => s.unhideNode);

  // Hydrate store from real DB profile on mount
  React.useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) hydrateFromServer(data); })
      .catch(() => {});
  }, [hydrateFromServer]);

  // University name resolution
  const [universitiesMap, setUniversitiesMap] = React.useState<
    Record<string, IUniversityProfile>
  >({});

  React.useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((data: IUniversityProfile[]) => {
        const map: Record<string, IUniversityProfile> = {};
        for (const u of data) map[u.id] = u;
        setUniversitiesMap(map);
      })
      .catch(() => {});
  }, []);

  // Local form state
  const [fullName, setFullName] = React.useState(profile.fullName);
  const [nationality, setNationality] = React.useState(profile.nationality);
  const [currentCountry, setCurrentCountry] = React.useState(
    profile.currentCountry,
  );
  const [gradeLevel, setGradeLevel] = React.useState(
    String(profile.gradeLevel),
  );
  const [gpa, setGpa] = React.useState(String(profile.gpa));
  const [gpaScale, setGpaScale] = React.useState(String(profile.gpaScale));
  const [ieltsOverall, setIeltsOverall] = React.useState(
    String(profile.ielts.overall),
  );
  const [ieltsWriting, setIeltsWriting] = React.useState(
    String(profile.ielts.writing),
  );
  const [satTotal, setSatTotal] = React.useState(
    String(profile.sat?.total ?? ""),
  );
  const [interests, setInterests] = React.useState(
    profile.interests.join(", "),
  );
  const [budget, setBudget] = React.useState(
    String(profile.budgetUsdPerYear ?? ""),
  );
  const [studyLevel, setStudyLevel] = React.useState(
    profile.preferredStudyLevel,
  );
  const [saved_, setSaved_] = React.useState(false);

  // Sync from store when profile loads from server
  React.useEffect(() => {
    setFullName(profile.fullName);
    setNationality(profile.nationality);
    setCurrentCountry(profile.currentCountry);
    setGradeLevel(String(profile.gradeLevel));
    setGpa(String(profile.gpa));
    setGpaScale(String(profile.gpaScale));
    setIeltsOverall(String(profile.ielts.overall));
    setIeltsWriting(String(profile.ielts.writing));
    setSatTotal(String(profile.sat?.total ?? ""));
    setInterests(profile.interests.join(", "));
    setBudget(String(profile.budgetUsdPerYear ?? ""));
    setStudyLevel(profile.preferredStudyLevel);
  }, [profile]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      nationality: nationality.trim(),
      currentCountry: currentCountry.trim(),
      gradeLevel: Number(gradeLevel),
      gpa: parseFloat(gpa),
      gpaScale: parseFloat(gpaScale) as typeof profile.gpaScale,
      ielts: {
        ...profile.ielts,
        overall: parseFloat(ieltsOverall),
        writing: parseFloat(ieltsWriting),
      },
      sat: satTotal
        ? {
            ...(profile.sat ?? {
              math: 0,
              evidenceBasedReadingWriting: 0,
            }),
            total: parseInt(satTotal, 10),
          }
        : undefined,
      interests: interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      budgetUsdPerYear: budget ? parseInt(budget, 10) : undefined,
      preferredStudyLevel: studyLevel as StudyLevel,
    });
    setSaved_(true);
    setTimeout(() => setSaved_(false), 2000);
  }

  const verified = profile.documents.filter((d) => d.status === "verified").length;
  const total = profile.documents.length;
  const [docUploading, setDocUploading] = React.useState<Record<string, boolean>>({});
  const [docVerifying, setDocVerifying] = React.useState<Record<string, boolean>>({});
  const [docVerifyReason, setDocVerifyReason] = React.useState<Record<string, string>>({});
  const docFileRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  async function handleDocVerify(docId: string) {
    setDocVerifying((p) => ({ ...p, [docId]: true }));
    setDocVerifyReason((p) => ({ ...p, [docId]: "" }));
    try {
      const res = await fetch(`/api/documents/${docId}/verify`, { method: "POST" });
      const data = (await res.json()) as { status?: string; reason?: string; error?: string };
      if (res.ok && data.status) {
        updateDocumentStatus(docId, data.status as DocumentStatus);
        setDocVerifyReason((p) => ({ ...p, [docId]: data.reason ?? "" }));
      } else {
        setDocVerifyReason((p) => ({ ...p, [docId]: data.error ?? "Verification failed." }));
      }
    } catch {
      setDocVerifyReason((p) => ({ ...p, [docId]: "Network error." }));
    }
    setDocVerifying((p) => ({ ...p, [docId]: false }));
  }

  async function handleDocUpload(docId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading((p) => ({ ...p, [docId]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docId", docId);
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = (await res.json()) as { fileName: string; status: string; url?: string };
        updateDocumentStatus(docId, data.status as DocumentStatus);
      }
    } catch { /* swallow */ } finally {
      setDocUploading((p) => ({ ...p, [docId]: false }));
      e.target.value = "";
    }
  }

  const inputCls = cn(
    "rounded-2xl border border-[color:var(--color-border)] px-4 py-2.5",
    "bg-[color:var(--color-surface)] text-[color:var(--color-text)] text-[length:var(--text-fluid-sm)] outline-none",
    "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
  );

  return (
    <main className="min-h-screen pt-8 pb-16 px-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="font-display text-[length:var(--text-fluid-2xl)]">
          My profile
        </h1>
        <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
          {session?.user?.email ?? profile.email}
        </p>
      </header>

      {/* Academic profile form */}
      <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-6">
        <h2 className="font-display text-[length:var(--text-fluid-xl)]">
          Academic profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Nationality</span>
              <input value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputCls} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Current country</span>
              <input value={currentCountry} onChange={(e) => setCurrentCountry(e.target.value)} className={inputCls} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Grade level</span>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className={cn(inputCls, "focus:ring-0")}
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">GPA</span>
              <input type="number" step="0.01" value={gpa} onChange={(e) => setGpa(e.target.value)} className={inputCls} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">GPA scale</span>
              <select
                value={gpaScale}
                onChange={(e) => setGpaScale(e.target.value)}
                className={cn(inputCls, "focus:ring-0")}
              >
                {GPA_SCALES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">IELTS overall</span>
              <input type="number" step="0.5" min="0" max="9" value={ieltsOverall} onChange={(e) => setIeltsOverall(e.target.value)} className={inputCls} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">IELTS writing</span>
              <input type="number" step="0.5" min="0" max="9" value={ieltsWriting} onChange={(e) => setIeltsWriting(e.target.value)} className={inputCls} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">SAT total (optional)</span>
              <input type="number" value={satTotal} onChange={(e) => setSatTotal(e.target.value)} placeholder="e.g. 1380" className={inputCls} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">Budget (USD/year)</span>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 25000" className={inputCls} />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Interests (comma-separated)
            </span>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Computer Science, AI, Product Design"
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Preferred study level
            </span>
            <select
              value={studyLevel}
              onChange={(e) => setStudyLevel(e.target.value as StudyLevel)}
              className={cn(inputCls, "focus:ring-0")}
            >
              {STUDY_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <ActionButton type="submit" variant="primary" size="lg">
              Save changes
            </ActionButton>
            {saved_ ? <TagPill variant="success">Saved ✓</TagPill> : null}
          </div>
        </form>
      </section>

      {/* Documents */}
      <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[length:var(--text-fluid-xl)]">Documents</h2>
          <TagPill variant={verified === total ? "success" : "warning"}>
            {verified} / {total} ready
          </TagPill>
        </div>

        <div className="space-y-2">
          {profile.documents.map((d) => {
            const reqStatus =
              d.status === "verified"
                ? "ready"
                : d.status === "uploaded"
                  ? "pending_review"
                  : d.status === "rejected"
                    ? "rejected"
                    : "missing";

            return (
              <div key={d.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <RequirementRow
                    title={d.fileName || `${d.kind} document`}
                    status={reqStatus}
                    subtext={d.kind}
                  />
                </div>
                {d.status !== "verified" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={(el) => { docFileRefs.current[d.id] = el; }}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleDocUpload(d.id, e)}
                    />
                    <button
                      type="button"
                      disabled={docUploading[d.id]}
                      onClick={() => docFileRefs.current[d.id]?.click()}
                      className={cn(
                        "text-[length:var(--text-fluid-xs)] rounded-full px-3 py-1",
                        "border border-[color:var(--color-border)] text-[color:var(--color-muted)]",
                        "hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
                        "ease-snappy transition-colors disabled:opacity-50",
                      )}
                    >
                      {docUploading[d.id] ? "Uploading…" : d.status === "uploaded" ? "Replace" : "Upload"}
                    </button>
                    {d.status === "uploaded" && (
                      <button
                        type="button"
                        disabled={docVerifying[d.id]}
                        onClick={() => handleDocVerify(d.id)}
                        title={docVerifyReason[d.id] || "Verify with GPT"}
                        className={cn(
                          "text-[length:var(--text-fluid-xs)] rounded-full px-3 py-1",
                          "border border-indigo-200 text-indigo-600",
                          "hover:bg-indigo-50 ease-snappy transition-colors disabled:opacity-50",
                        )}
                      >
                        {docVerifying[d.id] ? "Verifying…" : "Verify"}
                      </button>
                    )}
                  </div>
                )}
                {d.url && (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[length:var(--text-fluid-xs)] text-[color:var(--color-accent)] hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Saved & Excluded universities — two-column */}
      <UniversityLists
        saved={saved}
        hidden={hidden}
        universitiesMap={universitiesMap}
        unsaveNode={unsaveNode}
        unhideNode={unhideNode}
      />

      {/* Preferences & priorities */}
      <section className="bg-white rounded-3xl border border-[color:var(--color-border)] p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-[length:var(--text-fluid-xl)]">
            Preferences &amp; priorities
          </h2>
          <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)]">
            Tag what matters, then weight each factor. AI re-evaluates university fit whenever priorities change.
          </p>
        </div>
        <PreferencesEditor />
      </section>
    </main>
  );
}
