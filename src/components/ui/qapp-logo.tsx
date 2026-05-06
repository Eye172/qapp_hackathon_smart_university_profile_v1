import * as React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   QApp brand icon — replicates the official logo (image 4):
   • Outer circle ring
   • Inner "q" — small circle + descending stem that loops back in a spiral
   • Optionally shows the "app" wordmark beside it
───────────────────────────────────────────────────────────────────────────── */

export interface QAppIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  color?: string;
}

export function QAppIcon({ size = 36, color = "#3AABF5", ...props }: QAppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      {/* Outer ring */}
      <circle cx="22" cy="22" r="19" stroke={color} strokeWidth="2.8" />

      {/*
        Inner @ / spiral-Q shape — matches the logo photo exactly:
        1. A "C" arc (most of a circle, ~280°) going around inner area
        2. The tail sweeps inward and loops into a small secondary hook,
           creating the snail/spiral effect
      */}

      {/* Inner circle arc (the "C" — open at bottom-right, ~300°) */}
      <path
        d="M 29 22 A 7.5 7.5 0 1 1 26.3 28.3"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Spiral tail: from arc end, curves inward and loops back */}
      <path
        d="M 26.3 28.3 C 28.2 30.2 28.5 33 26.5 34.5 C 24.5 36 21.8 35.5 20.5 33.5 C 19.2 31.5 20 29 22 28.3 C 24 27.6 26 28.5 25.8 30.5"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* Full wordmark: icon + "app" text */
export interface QAppWordmarkProps {
  size?: number;
  color?: string;
  className?: string;
}

export function QAppWordmark({ size = 36, color = "#3AABF5", className }: QAppWordmarkProps) {
  const fontSize = Math.round(size * 0.72);
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.22) }}
    >
      <QAppIcon size={size} color={color} />
      <span
        style={{
          fontFamily: "inherit",
          fontWeight: 600,
          fontSize,
          color,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        app
      </span>
    </span>
  );
}

/* Inline wireframe-sphere decoration — inspired by images 2 & 3 */
export function WireframeSphere({
  size = 180,
  color = "currentColor",
  opacity = 0.18,
  className,
}: {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
}) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ opacity }}
    >
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r - 2} stroke={color} strokeWidth="1.2" />

      {/* Latitude lines */}
      {[-0.65, -0.35, 0, 0.35, 0.65].map((t, i) => {
        const latR = Math.sqrt(1 - t * t) * (r - 2);
        const latCy = cy + t * (r - 2);
        return (
          <ellipse
            key={`lat-${i}`}
            cx={cx}
            cy={latCy}
            rx={latR}
            ry={latR * 0.28}
            stroke={color}
            strokeWidth="0.9"
          />
        );
      })}

      {/* Longitude lines */}
      {[0, 45, 90, 135].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + (r - 2) * Math.cos(rad);
        const y1 = cy + (r - 2) * Math.sin(rad);
        const x2 = cx - (r - 2) * Math.cos(rad);
        const y2 = cy - (r - 2) * Math.sin(rad);
        return (
          <line
            key={`lon-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="0.9"
          />
        );
      })}

      {/* Diagonal grid lines for wireframe feel */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((t, i) => {
        const offset = t * (r - 2);
        return (
          <line
            key={`diag-${i}`}
            x1={cx - (r - 2)}
            y1={cy + offset}
            x2={cx + (r - 2)}
            y2={cy + offset}
            stroke={color}
            strokeWidth="0.7"
            strokeDasharray="3 4"
          />
        );
      })}
    </svg>
  );
}

/* Lightweight geometric diamond — inspired by images 2 & 3 */
export function WireframeDiamond({
  size = 120,
  color = "currentColor",
  opacity = 0.15,
  className,
}: {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
}) {
  const h = size;
  const w = size * 0.68;
  const cx = w / 2;
  const cy = h / 2;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ opacity }}
    >
      {/* Outer diamond */}
      <polygon
        points={`${cx},4 ${w - 4},${cy} ${cx},${h - 4} 4,${cy}`}
        stroke={color}
        strokeWidth="1.2"
      />
      {/* Inner diamond */}
      <polygon
        points={`${cx},${cy - 20} ${cx + 22},${cy} ${cx},${cy + 20} ${cx - 22},${cy}`}
        stroke={color}
        strokeWidth="1"
      />
      {/* Lines connecting outer to inner */}
      {[
        [cx, 4,       cx, cy - 20],
        [w - 4, cy,   cx + 22, cy],
        [cx, h - 4,   cx, cy + 20],
        [4, cy,       cx - 22, cy],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
      ))}
    </svg>
  );
}
