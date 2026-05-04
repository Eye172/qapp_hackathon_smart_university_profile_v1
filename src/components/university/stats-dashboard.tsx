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
  Cell,
} from "recharts";
import type { IUniversityProfile } from "@/lib/types";

const GREEN = "#10b981";
const RED = "#ef4444";
const MUTED = "#94a3b8";
const BLUE = "#3b82f6";
const INDIGO = "#6366f1";

function metColor(student: number, min: number) {
  if (min <= 0) return BLUE;
  return student >= min ? GREEN : RED;
}

interface StatsDashboardProps {
  university: IUniversityProfile;
  studentIelts: number;
  studentGpa: number;
  studentSat?: number;
}

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid rgba(37,99,235,0.12)",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(15,23,42,0.10)",
  fontSize: 12,
};

export function StatsDashboard({
  university,
  studentIelts,
  studentGpa,
  studentSat,
}: StatsDashboardProps) {
  const hasTopMajors =
    university.statsTopMajors && university.statsTopMajors.length > 0;
  const hasDemographics =
    university.statsDemographics &&
    (university.statsDemographics.enrollment ||
      university.statsDemographics.gender);
  const hasFinancials =
    university.statsFinancials && university.statsFinancials.tuition;

  const scoreData = [
    {
      name: "IELTS",
      Your: studentIelts,
      Required: university.minIelts ?? 0,
      fill: metColor(studentIelts, university.minIelts ?? 0),
    },
    {
      name: "GPA",
      Your: studentGpa,
      Required: university.minGpa ?? 0,
      fill: metColor(studentGpa, university.minGpa ?? 0),
    },
    ...(studentSat && university.minSat
      ? [
          {
            name: "SAT",
            Your: Math.round(studentSat / 160),
            Required: Math.round(university.minSat / 160),
            fill: metColor(studentSat, university.minSat),
          },
        ]
      : []),
  ];

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-gray-100">
        <p className="text-xs uppercase tracking-wider text-purple-500 font-semibold mb-0.5">
          Analytics
        </p>
        <h2 className="text-lg font-bold text-gray-900">University Statistics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-gray-100">

        {/* ── Score comparison ─────────────────────────────── */}
        <div className="bg-white p-6 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Your Scores vs. Requirements
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.07)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={22}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
              <Bar dataKey="Your" radius={[6, 6, 0, 0]} maxBarSize={44}>
                {scoreData.map((entry) => (
                  <Cell key={`your-${entry.name}`} fill={entry.fill} />
                ))}
              </Bar>
              <Bar dataKey="Required" fill={MUTED} radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              Your score
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />
              Min required
            </span>
          </div>
        </div>

        {/* ── Top majors (if data) ─────────────────────────── */}
        {hasTopMajors ? (
          <div className="bg-white p-6 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Top Fields of Study
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={university.statsTopMajors!.slice(0, 6)}
                layout="vertical"
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(37,99,235,0.07)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={88}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "rgba(99,102,241,0.05)" }}
                />
                <Bar dataKey="percent" fill={INDIGO} radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Placeholder when no data */
          university.description ? (
            <div className="bg-white p-6 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                About
              </p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-[8]">
                {university.description}
              </p>
            </div>
          ) : null
        )}

        {/* ── Demographics + Financials ────────────────────── */}
        <div className="bg-white p-6 space-y-4">
          {hasDemographics && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Demographics
              </p>
              {university.statsDemographics!.enrollment && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex items-center gap-3">
                  <span className="text-xl font-bold text-blue-700">
                    {university.statsDemographics!.enrollment!.toLocaleString()}
                  </span>
                  <span className="text-xs text-blue-500 font-medium">Total enrollment</span>
                </div>
              )}
              {university.statsDemographics!.gender && (
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl bg-pink-50 border border-pink-100 px-3 py-2 text-center">
                    <p className="text-sm font-bold text-pink-700">
                      {university.statsDemographics!.gender!.female}%
                    </p>
                    <p className="text-[10px] text-pink-500">Female</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-sky-50 border border-sky-100 px-3 py-2 text-center">
                    <p className="text-sm font-bold text-sky-700">
                      {university.statsDemographics!.gender!.male}%
                    </p>
                    <p className="text-[10px] text-sky-500">Male</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasFinancials && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Financials
              </p>
              <div className="grid grid-cols-2 gap-2">
                {university.statsFinancials!.tuition && (
                  <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
                    <p className="text-[10px] text-gray-400 mb-0.5">Annual Tuition</p>
                    <p className="text-sm font-bold text-gray-800">
                      ${university.statsFinancials!.tuition!.toLocaleString()}
                    </p>
                  </div>
                )}
                {university.statsFinancials!.room_board && (
                  <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
                    <p className="text-[10px] text-gray-400 mb-0.5">Room & Board</p>
                    <p className="text-sm font-bold text-gray-800">
                      ${university.statsFinancials!.room_board!.toLocaleString()}
                    </p>
                  </div>
                )}
                {university.statsFinancials!.avg_after_aid && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                    <p className="text-[10px] text-emerald-600 mb-0.5">After Aid</p>
                    <p className="text-sm font-bold text-emerald-700">
                      ${university.statsFinancials!.avg_after_aid!.toLocaleString()}
                    </p>
                  </div>
                )}
                {university.statsFinancials!.median_earnings && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
                    <p className="text-[10px] text-blue-500 mb-0.5">Median Earnings</p>
                    <p className="text-sm font-bold text-blue-700">
                      ${university.statsFinancials!.median_earnings!.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasDemographics && !hasFinancials && (
            <div className="h-full flex flex-col justify-center space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Quick Facts
              </p>
              {university.minGpa && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Min. GPA</span>
                  <span className="font-bold text-gray-800">{university.minGpa}</span>
                </div>
              )}
              {university.minIelts && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Min. IELTS</span>
                  <span className="font-bold text-gray-800">{university.minIelts}</span>
                </div>
              )}
              {university.minSat && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Min. SAT</span>
                  <span className="font-bold text-gray-800">{university.minSat}</span>
                </div>
              )}
              {university.languages && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Languages</span>
                  <span className="font-bold text-gray-800">{university.languages}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
