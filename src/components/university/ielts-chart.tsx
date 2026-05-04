"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface IeltsChartProps {
  studentIelts: number;
  uniMinIelts: number;
  studentGpa: number;
  uniMinGpa: number;
}

const BLUE = "#2563eb";
const GREEN = "#16a34a";
const RED = "#dc2626";
const MUTED = "#94a3b8";

function metColor(student: number, min: number) {
  return student >= min ? GREEN : RED;
}

export function IeltsChart({
  studentIelts,
  uniMinIelts,
  studentGpa,
  uniMinGpa,
}: IeltsChartProps) {
  const data = [
    {
      name: "IELTS",
      Your: studentIelts,
      Required: uniMinIelts,
      fill: metColor(studentIelts, uniMinIelts),
    },
    {
      name: "GPA",
      Your: studentGpa,
      Required: uniMinGpa,
      fill: metColor(studentGpa, uniMinGpa),
    },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <p className="text-[length:var(--text-fluid-xs)] uppercase tracking-wider text-[color:var(--color-muted)] font-semibold">
        Your scores vs. Requirements
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.08)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid rgba(37,99,235,0.15)",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(15,23,42,0.10)",
              fontSize: 12,
            }}
            cursor={{ fill: "rgba(37,99,235,0.05)" }}
          />
          <Bar dataKey="Your" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry) => (
              <Cell key={`your-${entry.name}`} fill={entry.fill} />
            ))}
          </Bar>
          <Bar dataKey="Required" fill={MUTED} radius={[6, 6, 0, 0]} maxBarSize={48} />
          <ReferenceLine
            y={uniMinIelts}
            stroke={BLUE}
            strokeDasharray="4 3"
            strokeWidth={1.5}
            ifOverflow="visible"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-[length:var(--text-fluid-xs)] text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
          Your score
        </span>
        <span className="flex items-center gap-1.5 text-[length:var(--text-fluid-xs)] text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />
          Min. required
        </span>
      </div>
    </div>
  );
}
