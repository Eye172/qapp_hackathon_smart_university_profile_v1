"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { DocumentStatus } from "@/lib/types";
import { ActionButton } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  UploadCloud,
  XCircle,
} from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";

export type RequirementStatus =
  | "ready"
  | "pending_review"
  | "missing"
  | "rejected";

export function fromDocumentStatus(status: DocumentStatus): RequirementStatus {
  switch (status) {
    case "verified":
      return "ready";
    case "uploaded":
      return "pending_review";
    case "rejected":
      return "rejected";
    case "pending":
    default:
      return "missing";
  }
}

interface StatusVisual {
  Icon: React.ComponentType<React.SVGAttributes<SVGSVGElement>>;
  iconClass: string;
  label: string;
  actionLabel: string;
  actionVariant: "primary" | "glass" | "outline";
}

const STATUS_MATRIX: Record<RequirementStatus, StatusVisual> = {
  ready: {
    Icon: CheckCircle,
    iconClass: "text-[#5E7A66]",
    label: "Ready",
    actionLabel: "Replace",
    actionVariant: "outline",
  },
  pending_review: {
    Icon: FileText,
    iconClass: "text-[#81583A]",
    label: "Pending review",
    actionLabel: "Verify",
    actionVariant: "outline",
  },
  missing: {
    Icon: AlertCircle,
    iconClass: "text-[#C2956E]",
    label: "Missing",
    actionLabel: "Upload",
    actionVariant: "primary",
  },
  rejected: {
    Icon: XCircle,
    iconClass: "text-[#9E6464]",
    label: "Rejected",
    actionLabel: "Re-upload",
    actionVariant: "primary",
  },
};

export interface RequirementRowProps
  extends Omit<HTMLMotionProps<"div">, "title" | "children"> {
  title: string;
  status: RequirementStatus;
  subtext?: string;
  onAction?: () => void;
}

export const RequirementRow = React.forwardRef<
  HTMLDivElement,
  RequirementRowProps
>(function RequirementRow(
  { title, status, subtext, onAction, className, ...props },
  ref,
) {
  const visual = STATUS_MATRIX[status];
  const ActionIcon = status === "missing" ? UploadCloud : visual.Icon;

  return (
    <motion.div
      layout
      ref={ref}
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)]",
        "bg-white/70 backdrop-blur-md p-4 ease-snappy",
        className,
      )}
      transition={{ ease: "circOut", duration: 0.25 }}
      {...props}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          "bg-[color:var(--color-background)]",
          visual.iconClass,
        )}
        aria-hidden
      >
        <visual.Icon />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-[length:var(--text-fluid-sm)] truncate">
            {title}
          </h4>
          <span
            className={cn(
              "text-[length:var(--text-fluid-xs)] font-semibold",
              visual.iconClass,
            )}
          >
            {visual.label}
          </span>
        </div>
        {subtext ? (
          <p className="mt-0.5 text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] line-clamp-2">
            {subtext}
          </p>
        ) : null}
      </div>

      <ActionButton
        variant={visual.actionVariant}
        size="sm"
        onClick={onAction}
        aria-label={`${visual.actionLabel} ${title}`}
      >
        <ActionIcon />
        {visual.actionLabel}
      </ActionButton>
    </motion.div>
  );
});

RequirementRow.displayName = "RequirementRow";
