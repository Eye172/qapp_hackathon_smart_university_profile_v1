import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/tailwind-utils";

export const badgeVariants = cva(
  cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
    "transition-colors ease-snappy border",
  ),
  {
    variants: {
      variant: {
        success: "bg-[#5E7A66]/12 text-[#3F5847] border-[#5E7A66]/30",
        warning: "bg-[#C2956E]/15 text-[#7A5A36] border-[#C2956E]/35",
        error: "bg-[#9E6464]/12 text-[#6E3D3D] border-[#9E6464]/30",
        neutral:
          "bg-[#81583A]/8 text-[#2A2626] border-[#81583A]/20",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface TagPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const TagPill = React.forwardRef<HTMLSpanElement, TagPillProps>(
  function TagPill({ className, variant, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

TagPill.displayName = "TagPill";
