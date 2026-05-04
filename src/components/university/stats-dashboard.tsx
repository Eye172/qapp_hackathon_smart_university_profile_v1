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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import type { IUniversityProfile } from "@/lib/types";

/* ── colour palette ──────────────────────────────────────────────────────── */
const BAR_PALETTE = [
  "#6366f1", "#3b82f6", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
];
const MAJOR_PALETTE = [
  "#6366f1", "#8b5cf6", "#3b82f6", "#0ea5e9",
  "#10b981", "#f59e0b",
];

function metColor(student: number, min: number) {
  if (min <= 0) return "#3b82f6";
  return student >= min ? "#10b981" : "#ef4444";
}

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.97)",
  border: "1px solid rgba(99,102,241,0.12)",
  borderRadius: "14px",
  boxShadow: "0 8px 32px rgba(15,23,42,0.12)",
  fontSize: 12,
  padding: "10px 14px",
};

interface StatsDashboardProps {
  university: IUniversityProfile;
  studentIelts: number;
  studentGpa: number;
  studentSat?: number;
}

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
    (university.statsDemographics.enrollment || university.statsDemographics.gender);
  const hasFinancials =
    university.statsFinancials &&
    (university.statsFinancials.tuition_intl_usd || university.statsFinancials.tuition_domestic_usd);

  /* score comparison data */
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
            name: "SAT /160",
            Your: Math.round(studentSat / 160),
            Required: Math.round(university.minSat / 160),
            fill: metColor(studentSat, university.minSat),
          },
        ]
      : []),
  ];

  /* acceptance / employment radar */
  const radarData = [
    { subject: "Acceptance\nRate", A: university.acceptanceRate ?? 0 },
    { subject: "Employment\n6mo", A: university.employmentRate6mo ?? 0 },
    { subject: "Student/\nFaculty", A: Math.min(100, (university.studentFacultyRatio ?? 0) * 4) },
    { subject: "Int'l\nStudents", A: university.statsDemographics?.intl_student_pct ?? 0 },
    { subject: "First Gen\n%", A: university.statsDemographics?.first_gen_pct ?? 0 },
  ].filter((d) => d.A > 0);

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* header */}
      <div className="px-6 md:px-8 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 16 16">
            <rect x="2" y="8" width="3" height="6" rx="1" fill="currentColor"/>
            <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor"/>
            <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-violet-500 font-bold">Analytics</p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">University Statistics</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-gray-100/80">

        {/* ── 1. Score Comparison ──────────────────────────────────── */}
        <div className="bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700">Your Scores vs Requirements</p>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-emerald-400 to-blue-500 inline-block"/>You</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block"/>Min</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scoreData} barCategoryGap="28%" barGap={4}>
              <defs>
                {scoreData.map((entry, i) => (
                  <linearGradient key={`sg-${i}`} id={`scoreGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.fill} stopOpacity={0.95}/>
                    <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(99,102,241,0.06)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0, 10]} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={20}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(99,102,241,0.04)", radius: 8 }}/>
              <Bar dataKey="Your" radius={[8, 8, 0, 0]} maxBarSize={48} name="Your score">
                {scoreData.map((entry, i) => (
                  <Cell key={`sc-${i}`} fill={`url(#scoreGrad${i})`}/>
                ))}
              </Bar>
              <Bar dataKey="Required" fill="#e2e8f0" radius={[8, 8, 0, 0]} maxBarSize={48} name="Min required"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── 2. Top Fields of Study ───────────────────────────────── */}
        {hasTopMajors ? (
          <div className="bg-white p-6 space-y-4">
            <p className="text-xs font-bold text-gray-700">Top Fields of Study</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={university.statsTopMajors!.slice(0, 6)} layout="vertical" barCategoryGap="18%">
                <defs>
                  {university.statsTopMajors!.slice(0, 6).map((_, i) => (
                    <linearGradient key={`mg-${i}`} id={`majorGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={MAJOR_PALETTE[i % MAJOR_PALETTE.length]} stopOpacity={1}/>
                      <stop offset="100%" stopColor={MAJOR_PALETTE[(i + 2) % MAJOR_PALETTE.length]} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(99,102,241,0.06)" vertical={true} horizontal={false}/>
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`}/>
                <YAxis type="category" dataKey="name" tick={{ fill: "#475569", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} width={90}/>
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(99,102,241,0.04)" }} formatter={(v: number) => [`${v}%`, "Students"]}/>
                <Bar dataKey="percent" radius={[0, 8, 8, 0]} maxBarSize={22}>
                  {university.statsTopMajors!.slice(0, 6).map((_, i) => (
                    <Cell key={`mj-${i}`} fill={`url(#majorGrad${i})`}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : university.description ? (
          <div className="bg-white p-6 space-y-3">
            <p className="text-xs font-bold text-gray-700">About This University</p>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-[9]">{university.description}</p>
          </div>
        ) : null}

        {/* ── 3. Quick Stats + Demographics ───────────────────────── */}
        <div className="bg-white p-6 space-y-5">

          {/* Stat pills */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Acceptance Rate", value: university.acceptanceRate ? `${university.acceptanceRate}%` : null, color: "from-blue-500 to-indigo-500" },
              { label: "Employment 6mo", value: university.employmentRate6mo ? `${university.employmentRate6mo}%` : null, color: "from-emerald-500 to-teal-500" },
              { label: "Student:Faculty", value: university.studentFacultyRatio ? `${university.studentFacultyRatio}:1` : null, color: "from-violet-500 to-purple-500" },
              { label: "Avg Salary", value: university.avgStartingSalaryUsd ? `$${Math.round(university.avgStartingSalaryUsd / 1000)}k` : null, color: "from-amber-500 to-orange-500" },
            ].filter((s) => s.value).map((s) => (
              <div key={s.label} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className={`h-1 w-full bg-gradient-to-r ${s.color}`}/>
                <div className="px-3 py-2.5">
                  <p className="text-base font-extrabold text-gray-900 leading-none">{s.value}</p>
                  <p className="text-[9px] text-gray-400 font-medium mt-0.5 uppercase tracking-wide">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gender breakdown */}
          {university.statsDemographics?.gender && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender Split</p>
              <div className="h-5 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${university.statsDemographics.gender.female}%` }}
                  className="bg-gradient-to-r from-pink-400 to-rose-500 transition-all"
                />
                <div className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500"/>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400 inline-block"/>Female {university.statsDemographics.gender.female}%</span>
                <span className="flex items-center gap-1">Male {university.statsDemographics.gender.male}%<span className="w-2 h-2 rounded-full bg-sky-400 inline-block"/></span>
              </div>
            </div>
          )}

          {/* Enrollment */}
          {university.statsDemographics?.enrollment && (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-lg font-extrabold text-indigo-700">
                  {university.statsDemographics.enrollment.toLocaleString()}
                </p>
                <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wide">Total Enrollment</p>
              </div>
            </div>
          )}

          {/* Financials */}
          {hasFinancials && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tuition</p>
              {university.statsFinancials!.tuition_intl_usd && (
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 border border-gray-100">
                  <span className="text-xs text-gray-500">International</span>
                  <span className="text-xs font-bold text-gray-800">${university.statsFinancials!.tuition_intl_usd.toLocaleString()}/yr</span>
                </div>
              )}
              {university.statsFinancials!.tuition_domestic_usd && (
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 border border-gray-100">
                  <span className="text-xs text-gray-500">Domestic</span>
                  <span className="text-xs font-bold text-gray-800">${university.statsFinancials!.tuition_domestic_usd.toLocaleString()}/yr</span>
                </div>
              )}
              {university.statsFinancials!.avg_after_aid_usd && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 border border-emerald-100">
                  <span className="text-xs text-emerald-600">After Aid</span>
                  <span className="text-xs font-bold text-emerald-700">${university.statsFinancials!.avg_after_aid_usd.toLocaleString()}/yr</span>
                </div>
              )}
            </div>
          )}

          {/* Quick facts fallback */}
          {!hasDemographics && !hasFinancials && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick Facts</p>
              {[
                { label: "Min. GPA", value: university.minGpa },
                { label: "Min. IELTS", value: university.minIelts },
                { label: "Min. SAT", value: university.minSat },
                { label: "Languages", value: university.languages },
              ].filter((r) => r.value).map((r) => (
                <div key={r.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-bold text-gray-800">{String(r.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 4. Bar chart for diversity breakdown (if data) ────────── */}
        {university.statsDemographics?.diversity && Object.keys(university.statsDemographics.diversity).length > 1 && (
          <div className="bg-white p-6 space-y-4 md:col-span-2 xl:col-span-1">
            <p className="text-xs font-bold text-gray-700">Student Diversity</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={Object.entries(university.statsDemographics.diversity).map(([k, v]) => ({ name: k, pct: Number(v) }))}
                barCategoryGap="30%"
              >
                <defs>
                  {Object.keys(university.statsDemographics.diversity).map((_, i) => (
                    <linearGradient key={`dg-${i}`} id={`divGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BAR_PALETTE[i % BAR_PALETTE.length]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={BAR_PALETTE[i % BAR_PALETTE.length]} stopOpacity={0.5}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(99,102,241,0.06)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={28} tickFormatter={(v) => `${v}%`}/>
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(99,102,241,0.04)" }} formatter={(v: number) => [`${v}%`, "Students"]}/>
                <Bar dataKey="pct" radius={[8, 8, 0, 0]} maxBarSize={52}>
                  {Object.keys(university.statsDemographics.diversity).map((_, i) => (
                    <Cell key={`div-${i}`} fill={`url(#divGrad${i})`}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── 5. Radar chart for key metrics (if enough data) ─────── */}
        {radarData.length >= 3 && (
          <div className="bg-white p-6 space-y-4">
            <p className="text-xs font-bold text-gray-700">Key Performance Metrics</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
                <PolarGrid stroke="rgba(99,102,241,0.12)" strokeDasharray="4 4"/>
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}/>
                <Radar name="University" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </section>
  );
}
