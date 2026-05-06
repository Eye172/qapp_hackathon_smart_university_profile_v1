"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { IStudentDocument } from "@/lib/types";

interface DocumentsChecklistProps {
  docs: IStudentDocument[];
}

async function uploadDoc(
  docId: string,
  file: File,
): Promise<{ ok: boolean; url?: string; fileName?: string }> {
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("docId", docId);
    const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { url?: string; fileName?: string };
    return { ok: true, url: data.url, fileName: data.fileName };
  } catch {
    return { ok: false };
  }
}

type Group = "ready" | "review" | "missing";

function getGroup(doc: IStudentDocument): Group {
  if (doc.status === "verified") return "ready";
  if (doc.status === "uploaded") return "review";
  return "missing";
}

const GROUP_META: Record<
  Group,
  {
    icon: string;
    iconBg: string;
    iconText: string;
    badgeText: string;
    badgeBg: string;
    label: string;
  }
> = {
  ready: {
    icon: "✓",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    badgeText: "Verified",
    badgeBg: "bg-emerald-100 text-emerald-700",
    label: "Ready",
  },
  review: {
    icon: "⏳",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    badgeText: "In Review",
    badgeBg: "bg-blue-100 text-blue-600",
    label: "In Review",
  },
  missing: {
    icon: "!",
    iconBg: "bg-red-50",
    iconText: "text-red-500",
    badgeText: "Missing",
    badgeBg: "bg-red-50 text-red-500",
    label: "Needs Action",
  },
};

export function DocumentsChecklist({ docs: initialDocs }: DocumentsChecklistProps) {
  const [docs, setDocs] = React.useState<IStudentDocument[]>(initialDocs);
  const [uploading, setUploading] = React.useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = React.useState<Record<string, boolean>>({});
  const [verifyReason, setVerifyReason] = React.useState<Record<string, string>>({});
  const fileRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  async function handleVerify(docId: string) {
    setVerifying((p) => ({ ...p, [docId]: true }));
    setVerifyReason((p) => ({ ...p, [docId]: "" }));
    try {
      const res = await fetch(`/api/documents/${docId}/verify`, { method: "POST" });
      const data = (await res.json()) as { status?: string; verified?: boolean; reason?: string; error?: string };
      if (res.ok && data.status) {
        setDocs((prev) =>
          prev.map((d) => d.id === docId ? { ...d, status: data.status as IStudentDocument["status"] } : d),
        );
        setVerifyReason((p) => ({ ...p, [docId]: data.reason ?? "" }));
      } else {
        setVerifyReason((p) => ({ ...p, [docId]: data.error ?? "Verification failed." }));
      }
    } catch {
      setVerifyReason((p) => ({ ...p, [docId]: "Network error. Try again." }));
    }
    setVerifying((p) => ({ ...p, [docId]: false }));
  }

  async function handleFileChange(docId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading((p) => ({ ...p, [docId]: true }));
    const result = await uploadDoc(docId, file);
    if (result.ok) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === docId
            ? { ...d, status: "uploaded" as const, fileName: result.fileName ?? file.name, url: result.url }
            : d,
        ),
      );
    }
    setUploading((p) => ({ ...p, [docId]: false }));
    e.target.value = "";
  }

  const readyCount = docs.filter((d) => d.status === "verified").length;
  const total = docs.length;
  const pct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  const grouped: Record<Group, IStudentDocument[]> = {
    ready: docs.filter((d) => getGroup(d) === "ready"),
    review: docs.filter((d) => getGroup(d) === "review"),
    missing: docs.filter((d) => getGroup(d) === "missing"),
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
      <p className="text-xs uppercase tracking-wider text-blue-500 font-semibold mb-0.5">
        Documents
      </p>
      <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-5">Application Checklist</h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500 dark:text-slate-400">
            {readyCount} of {total} documents verified
          </span>
          <span className="font-bold text-gray-700 dark:text-slate-200">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Grouped document rows */}
      <div className="space-y-5">
        {(["missing", "review", "ready"] as Group[]).map((group) => {
          const items = grouped[group];
          if (!items.length) return null;
          const meta = GROUP_META[group];

          return (
            <div key={group}>
              <p
                className={`text-[10px] uppercase tracking-widest font-bold mb-2.5 ${meta.iconText}`}
              >
                {meta.label} ({items.length})
              </p>
              <ul className="space-y-2">
                {items.map((d, i) => (
                  <motion.li
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border border-gray-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-500/30 hover:bg-blue-50/25 dark:hover:bg-blue-950/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={[
                          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                          meta.iconBg,
                          meta.iconText,
                        ].join(" ")}
                      >
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-100 capitalize">
                          {d.kind.replace(/_/g, " ")}
                        </p>
                        {d.fileName ? (
                          d.url ? (
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-500 hover:underline truncate block"
                            >
                              {d.fileName}
                            </a>
                          ) : (
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{d.fileName}</p>
                          )
                        ) : null}
                      </div>
                    </div>

                    {group === "missing" ? (
                      <>
                        <input
                          ref={(el) => { fileRefs.current[d.id] = el; }}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleFileChange(d.id, e)}
                        />
                        <button
                          type="button"
                          disabled={uploading[d.id]}
                          onClick={() => fileRefs.current[d.id]?.click()}
                          className="flex-shrink-0 text-xs text-blue-600 border border-blue-200 rounded-xl px-3 py-1.5 hover:bg-blue-50 font-semibold transition-all active:scale-95 disabled:opacity-50"
                        >
                          {uploading[d.id] ? "Uploading…" : "Upload"}
                        </button>
                      </>
                    ) : group === "review" ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative">
                          <button
                            type="button"
                            disabled={verifying[d.id]}
                            onClick={() => handleVerify(d.id)}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 font-semibold transition-all active:scale-95 disabled:opacity-50"
                          >
                            {verifying[d.id] ? (
                              <>
                                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                                </svg>
                                Verifying…
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verify
                              </>
                            )}
                          </button>
                        </div>
                        {verifyReason[d.id] && (
                          <span className="text-[10px] text-gray-500 max-w-[140px] leading-tight hidden group-hover:inline">
                            {verifyReason[d.id]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`flex-shrink-0 text-[10px] font-bold rounded-full px-2.5 py-1 ${meta.badgeBg}`}
                      >
                        {meta.badgeText}
                      </span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>
          );
        })}

        {docs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No documents on your profile yet.
          </p>
        )}
      </div>
    </section>
  );
}
