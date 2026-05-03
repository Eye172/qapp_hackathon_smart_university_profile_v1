"use client";

import * as React from "react";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { ActionButton } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Globe, Mail, EyeOff } from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";

interface ActionsBarProps {
  universityId: string;
  websiteUrl?: string;
  contactEmail?: string;
}

export function ActionsBar({
  universityId,
  websiteUrl,
  contactEmail,
}: ActionsBarProps) {
  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const saveNode = useAlgorithmStore((s) => s.saveNode);
  const unsaveNode = useAlgorithmStore((s) => s.unsaveNode);
  const hideNode = useAlgorithmStore((s) => s.hideNode);
  const unhideNode = useAlgorithmStore((s) => s.unhideNode);

  const isSaved = saved.includes(universityId);
  const isHidden = hidden.includes(universityId);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-[var(--sidebar-w)] right-0",
        "glass border-t border-[color:var(--color-border)]",
        "px-6 py-3 flex items-center gap-3 flex-wrap",
      )}
      style={{ zIndex: "var(--z-overlay)" }}
    >
      {/* Save / unsave */}
      <ActionButton
        variant={isSaved ? "primary" : "outline"}
        size="sm"
        onClick={() => (isSaved ? unsaveNode(universityId) : saveNode(universityId))}
      >
        {isSaved ? (
          <>
            <BookmarkCheck size={15} /> Saved
          </>
        ) : (
          <>
            <Bookmark size={15} /> Save
          </>
        )}
      </ActionButton>

      {/* Visit website */}
      {websiteUrl && (
        <ActionButton
          variant="outline"
          size="sm"
          onClick={() => window.open(websiteUrl, "_blank", "noopener")}
        >
          <Globe size={15} /> Visit website
        </ActionButton>
      )}

      {/* Email admissions */}
      {contactEmail && (
        <ActionButton
          variant="outline"
          size="sm"
          onClick={() => window.open(`mailto:${contactEmail}`, "_blank")}
        >
          <Mail size={15} /> Email admissions
        </ActionButton>
      )}

      <div className="flex-1" />

      {/* Hide */}
      <ActionButton
        variant="outline"
        size="sm"
        onClick={() => (isHidden ? unhideNode(universityId) : hideNode(universityId))}
        className="border-transparent text-[color:var(--color-muted)] hover:text-red-600 hover:border-red-200"
      >
        <EyeOff size={14} />
        {isHidden ? "Unhide" : "Hide from feed"}
      </ActionButton>
    </div>
  );
}
