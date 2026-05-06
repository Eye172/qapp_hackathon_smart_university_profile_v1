"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";

const COLOR_LOW = "#ef4444";
const COLOR_MID = "#f59e0b";
const COLOR_HIGH = "#2563eb";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpHex(from: string, to: string, t: number): string {
  const f = hexToRgb(from);
  const o = hexToRgb(to);
  const tt = clamp(t, 0, 1);
  return rgbToHex(
    f.r + (o.r - f.r) * tt,
    f.g + (o.g - f.g) * tt,
    f.b + (o.b - f.b) * tt,
  );
}

export function fitScoreColor(score: number): string {
  const s = clamp(score, 0, 100);
  if (s <= 50) return lerpHex(COLOR_LOW, COLOR_MID, s / 50);
  return lerpHex(COLOR_MID, COLOR_HIGH, (s - 50) / 50);
}

export interface AIFitRingProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const AIFitRing = React.forwardRef<HTMLDivElement, AIFitRingProps>(
  function AIFitRing(
    {
      score,
      size = 120,
      strokeWidth = 10,
      showLabel = true,
      className,
      ...props
    },
    ref,
  ) {
    const safeScore = clamp(score, 0, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = ((100 - safeScore) / 100) * circumference;
    const stroke = fitScoreColor(safeScore);

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`AI Fit Score ${Math.round(safeScore)} out of 100`}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(37, 99, 235, 0.12)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: targetOffset, stroke }}
            transition={{
              strokeDashoffset: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
              stroke: { duration: 0.4, ease: "circOut" },
            }}
          />
        </svg>

        {showLabel ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display leading-none"
              style={{ fontSize: size * 0.28, color: stroke }}
            >
              {Math.round(safeScore)}
            </span>
            <span
              className="uppercase tracking-wider text-[color:var(--color-muted)] mt-1"
              style={{ fontSize: Math.max(9, size * 0.08) }}
            >
              Fit
            </span>
          </div>
        ) : null}
      </div>
    );
  },
);

AIFitRing.displayName = "AIFitRing";
