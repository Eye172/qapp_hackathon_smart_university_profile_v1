"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-medium select-none ease-snappy",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50",
    "disabled:pointer-events-none disabled:opacity-50",
    "transition-colors will-change-transform",
  ),
  {
    variants: {
      variant: {
        primary:
          "text-white transition-all"
          + " [background:linear-gradient(135deg,#0a1840_0%,#1e3a8a_40%,#2463eb_100%)]"
          + " [box-shadow:0_4px_18px_rgba(36,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.14)]"
          + " hover:[box-shadow:0_6px_28px_rgba(36,99,235,0.45),inset_0_1px_0_rgba(255,255,255,0.18)]",
        glass:
          "bg-white/78 backdrop-blur-md border border-white/50 hover:bg-white/92"
          + " [box-shadow:0_2px_12px_rgba(36,99,235,0.07)]"
          + " text-[color:var(--color-text)]",
        outline:
          "border border-[rgba(36,99,235,0.35)] text-[color:var(--color-accent)] bg-transparent"
          + " hover:bg-[rgba(36,99,235,0.07)] hover:border-[color:var(--color-accent)]",
      },
      size: {
        sm: "h-8 px-3 text-[length:var(--text-fluid-xs)]",
        md: "h-10 px-5 text-[length:var(--text-fluid-sm)]",
        lg: "h-12 px-6 text-[length:var(--text-fluid-base)]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type MotionButtonProps = HTMLMotionProps<"button">;

export interface ButtonProps
  extends Omit<MotionButtonProps, "children">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const MotionSlot = motion.create(Slot);

export const ActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function ActionButton(
    { className, variant, size, asChild = false, children, ...props },
    ref,
  ) {
    const Component = asChild ? MotionSlot : motion.button;

    return (
      <Component
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ ease: "circOut", duration: 0.18 }}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

ActionButton.displayName = "ActionButton";
