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
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200",
        glass:
          "bg-white/80 backdrop-blur-md text-gray-800 border border-white/60 hover:bg-white/95",
        outline:
          "border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600/8",
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
