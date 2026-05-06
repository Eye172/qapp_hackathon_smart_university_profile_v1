"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";

interface UniversityCTAProps {
  universityId: string;
  websiteUrl?: string;
  contactEmail?: string;
}

export function UniversityCTA({
  universityId,
  websiteUrl,
  contactEmail,
}: UniversityCTAProps) {
  const router = useRouter();
  const saveNode = useAlgorithmStore((s) => s.saveNode);
  const hideNode = useAlgorithmStore((s) => s.hideNode);
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);

  const isSaved = saved.includes(universityId);
  const isHidden = hidden.includes(universityId);

  return (
    <div className="sticky bottom-6 z-10">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg px-5 py-4 flex flex-wrap items-center gap-3">
        {/* Back to Feed */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Feed
        </button>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        {/* Save / Shortlist */}
        <button
          type="button"
          onClick={() => saveNode(universityId)}
          className={[
            "flex items-center gap-1.5 text-sm font-medium rounded-xl px-4 py-2 transition-all",
            isSaved
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100",
          ].join(" ")}
        >
          <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M8 2l1.9 3.8 4.2.6-3 3 .7 4.2L8 11.5 4.2 13.6l.7-4.2-3-3 4.2-.6L8 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isSaved ? "Shortlisted" : "Add to Shortlist"}
        </button>

        {/* Hide */}
        <button
          type="button"
          onClick={() => hideNode(universityId)}
          className={[
            "flex items-center gap-1.5 text-sm font-medium rounded-xl px-4 py-2 transition-all",
            isHidden
              ? "bg-gray-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          ].join(" ")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2 8s2.7-5 6-5 6 5 6 5-2.7 5-6 5-6-5-6-5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.5" />
            {isHidden && (
              <path d="M3 3l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
          {isHidden ? "Hidden" : "Hide"}
        </button>

        <div className="flex-1" />

        {/* Contact */}
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Email Admissions
          </a>
        )}

        {/* Official site */}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 2h5v5M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Official Site
          </a>
        )}

      </div>
    </div>
  );
}
