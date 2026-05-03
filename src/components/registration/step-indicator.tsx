"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";

export interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number; // 1-based
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const done = step.number < current;
        const active = step.number === current;
        const last = i === steps.length - 1;

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            {/* Dot + label */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <motion.div
                animate={{
                  backgroundColor: done || active
                    ? "var(--color-accent)"
                    : "transparent",
                  borderColor: done || active
                    ? "var(--color-accent)"
                    : "rgba(129,88,58,0.3)",
                  scale: active ? 1.15 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center",
                  "text-[11px] font-semibold",
                  done || active ? "text-white" : "text-[color:var(--color-muted)]",
                )}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  active
                    ? "text-[color:var(--color-accent)]"
                    : done
                      ? "text-[color:var(--color-muted)]"
                      : "text-[color:var(--color-muted)]/50",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!last && (
              <div className="flex-1 h-px mx-3 mb-5 bg-[color:var(--color-border)] relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[color:var(--color-accent)]"
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
