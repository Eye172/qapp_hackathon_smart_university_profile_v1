"use client";

import * as React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import type { IUniversityProfile } from "@/lib/types";

/* ── Design tokens (2-accent system: indigo + teal only) ─────────────────── */
const INDIGO = "#4f46e5";
const TEAL   = "#0d9488";

/* ── Glass Tooltip (eliminates Recharts formatter TS errors) ─────────────── */
interface TooltipPayload { name?: string; value?: number | string; fill?: string }
function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.88)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: "1px solid rgba(79,70,229,0.14)",
      borderRadius: 14,
      boxShadow: "0 8px 32px rgba(15,23,42,0.12)",
      padding: "10px 16px",
      fontSize: 12,
    }}>
      {label && <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: 5, fontSize: 11 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: INDIGO, fontWeight: 600 }}>
          {p.name}: <span style={{ fontVariantNumeric: "tabular-nums" }}>{p.value}{typeof p.value === "number" && p.name?.includes("%") ? "%" : ""}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Animated count-up ───────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!target) { setVal(0); return; }
    let frame = 0;
    const frames = Math.round(duration / 16);
    const id = setInterval(() => {
      frame++;
      const progress = frame / frames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased * 10) / 10);
      if (frame >= frames) { setVal(target); clearInterval(id); }
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

/* ── Metric Card ─────────────────────────────────────────────────────────── */
function MetricCard({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const count = useCountUp(value);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/55 p-4 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `radial-gradient(circle, ${INDIGO} 1px, transparent 1px)`,
        backgroundSize: "16px 16px",
      }}/>
      <p className="font-mono text-2xl font-black text-slate-900 dark:text-slate-100 leading-none tabular-nums tracking-tight">
        {count}{suffix}
      </p>
      <p className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

/* ── Section label ───────────────────────────────────────────────────────── */
function SL({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">{children}</p>;
}

/* ── Card wrapper ────────────────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

interface StatsDashboardProps {
  university: IUniversityProfile;
  studentIelts: number;
  studentGpa: number;
  studentSat?: number;
}

export function StatsDashboard({ university, studentIelts, studentGpa, studentSat }: StatsDashboardProps) {
  const majors       = university.statsTopMajors?.slice(0, 6) ?? [];
  const hasFinancials = !!(university.statsFinancials?.tuition_intl_usd ?? university.statsFinancials?.tuition_domestic_usd);
  const diversity     = university.statsDemographics?.diversity;
  const hasDiversity  = diversity && Object.keys(diversity).length > 1;

  const scoreData = [
    { name: "IELTS", You: studentIelts, Required: university.minIelts ?? 0 },
    { name: "GPA",   You: studentGpa,   Required: university.minGpa   ?? 0 },
    ...(studentSat && university.minSat ? [{ name: "SAT /160", You: Math.round(studentSat / 160), Required: Math.round(university.minSat / 160) }] : []),
  ];

  const radarData = [
    { s: "Acceptance",  A: university.acceptanceRate    ?? 0 },
    { s: "Employment",  A: university.employmentRate6mo ?? 0 },
    { s: "S:F Ratio",   A: Math.min(100, (university.studentFacultyRatio ?? 0) * 4) },
    { s: "Intl %",      A: university.statsDemographics?.intl_student_pct ?? 0 },
    { s: "First Gen",   A: university.statsDemographics?.first_gen_pct    ?? 0 },
  ].filter((d) => d.A > 0);

  const metrics = [
    { label: "Acceptance",   value: university.acceptanceRate       ?? 0, suffix: "%" },
    { label: "Employment",   value: university.employmentRate6mo    ?? 0, suffix: "%" },
    { label: "S:F Ratio",    value: university.studentFacultyRatio  ?? 0, suffix: ":1" },
    { label: "Avg Salary",   value: university.avgStartingSalaryUsd ? Math.round(university.avgStartingSalaryUsd / 1000) : 0, suffix: "k$" },
  ].filter((m) => m.value > 0);

  const AXIS_TICK = { fill: "#94a3b8", fontSize: 10 };
  const LABEL_TICK = { fill: "#64748b", fontSize: 11, fontWeight: 600 as const };
  const GRID_STROKE = "rgba(79,70,229,0.06)";

  return (
    <section className="space-y-3">
      {/* ── Section header */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 16 16">
            <rect x="2" y="8" width="3" height="6" rx="1" fill="currentColor"/>
            <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor"/>
            <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">Analytics</p>
          <h2 className="text-base font-bold text-slate-900 leading-none">University Statistics</h2>
        </div>
      </div>

      {/* ── Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* 1 ── Score comparison */}
        <Card>
          <SL>Your Scores vs Requirements</SL>
          <div className="flex gap-4 text-[9px] text-slate-400 mb-4">
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-500"/>You</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-200"/>Min req.</span>
          </div>
          <ResponsiveContainer width="100%" height={216}>
            <BarChart data={scoreData} barCategoryGap="30%" barGap={4}>
              <defs>
                <linearGradient id="sd-you" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INDIGO} stopOpacity={1}/>
                  <stop offset="100%" stopColor={INDIGO} stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false}/>
              <XAxis dataKey="name" tick={LABEL_TICK} axisLine={false} tickLine={false}/>
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={22}/>
              <Tooltip content={<GlassTooltip/>} cursor={{ fill: "rgba(79,70,229,0.04)" }}/>
              <Bar dataKey="You"      fill="url(#sd-you)" radius={[10,10,0,0]} maxBarSize={44} name="You"/>
              <Bar dataKey="Required" fill="#e2e8f0"       radius={[10,10,0,0]} maxBarSize={44} name="Min req."/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 2 ── Top fields or about */}
        {majors.length > 0 ? (
          <Card>
            <SL>Top Fields of Study</SL>
            <ResponsiveContainer width="100%" height={216}>
              <BarChart data={majors} layout="vertical" barCategoryGap="22%">
                <defs>
                  <linearGradient id="sd-major" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor={INDIGO} stopOpacity={1}/>
                    <stop offset="100%" stopColor={TEAL}   stopOpacity={0.85}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false}/>
                <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`}/>
                <YAxis type="category" dataKey="name" tick={{ fill: "#475569", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} width={88}/>
                <Tooltip content={<GlassTooltip/>} cursor={{ fill: "rgba(79,70,229,0.04)" }}/>
                <Bar dataKey="percent" fill="url(#sd-major)" radius={[0,10,10,0]} maxBarSize={20} name="Students %"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        ) : university.description ? (
          <Card>
            <SL>About</SL>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-[10]">{university.description}</p>
          </Card>
        ) : null}

        {/* 3 ── Animated metric cards */}
        {metrics.length > 0 && (
          <Card>
            <SL>Key Metrics</SL>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m) => <MetricCard key={m.label} {...m}/>)}
            </div>
          </Card>
        )}

        {/* 4 ── Gender + Enrollment + Financials */}
        {(university.statsDemographics?.gender ?? hasFinancials ?? university.statsDemographics?.enrollment) && (
          <Card className="space-y-5">
            {university.statsDemographics?.gender && (
              <div>
                <SL>Gender Distribution</SL>
                <div className="h-3 rounded-full overflow-hidden flex mb-2">
                  <div style={{ width: `${university.statsDemographics.gender.female}%`, background: `linear-gradient(to right, #a78bfa, #818cf8)` }} className="rounded-l-full transition-all"/>
                  <div className="flex-1 rounded-r-full" style={{ background: `linear-gradient(to right, ${TEAL}, #0f766e)` }}/>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-violet-400"/>Female {university.statsDemographics.gender.female}%</span>
                  <span className="flex items-center gap-1.5">Male {university.statsDemographics.gender.male}%<span className="inline-block w-2 h-2 rounded-full bg-teal-500"/></span>
                </div>
              </div>
            )}
            {university.statsDemographics?.enrollment && (
              <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="10" cy="7" r="3"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-lg font-black text-indigo-700 tabular-nums">{university.statsDemographics.enrollment.toLocaleString()}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Enrolled</p>
                </div>
              </div>
            )}
            {hasFinancials && (
              <div>
                <SL>Tuition</SL>
                <div className="divide-y divide-dashed divide-slate-100">
                  {university.statsFinancials!.tuition_intl_usd && (
                    <div className="flex justify-between py-2 text-xs"><span className="text-slate-500">International</span><span className="font-mono font-bold text-slate-800">${university.statsFinancials!.tuition_intl_usd.toLocaleString()}/yr</span></div>
                  )}
                  {university.statsFinancials!.tuition_domestic_usd && (
                    <div className="flex justify-between py-2 text-xs"><span className="text-slate-500">Domestic</span><span className="font-mono font-bold text-slate-800">${university.statsFinancials!.tuition_domestic_usd.toLocaleString()}/yr</span></div>
                  )}
                  {university.statsFinancials!.avg_after_aid_usd && (
                    <div className="flex justify-between py-2 text-xs"><span className="text-teal-600 font-semibold">After Aid ✦</span><span className="font-mono font-bold text-teal-700">${university.statsFinancials!.avg_after_aid_usd.toLocaleString()}/yr</span></div>
                  )}
                </div>
              </div>
            )}
            {/* Quick facts fallback */}
            {!university.statsDemographics?.gender && !hasFinancials && (
              <div>
                <SL>Requirements</SL>
                <div className="divide-y divide-dashed divide-slate-100">
                  {[{ l: "Min. GPA", v: university.minGpa }, { l: "Min. IELTS", v: university.minIelts }, { l: "Min. SAT", v: university.minSat }, { l: "Languages", v: university.languages }]
                    .filter((r) => r.v)
                    .map((r) => (
                      <div key={r.l} className="flex justify-between py-2 text-xs">
                        <span className="text-slate-500">{r.l}</span>
                        <span className="font-mono font-bold text-slate-800">{String(r.v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 5 ── Radar with glow */}
        {radarData.length >= 3 && (
          <Card>
            <SL>Performance Radar</SL>
            <ResponsiveContainer width="100%" height={216}>
              <RadarChart data={radarData} margin={{ top: 16, right: 28, bottom: 16, left: 28 }}>
                <defs>
                  <filter id="sd-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <PolarGrid stroke="rgba(79,70,229,0.1)" strokeDasharray="4 4"/>
                <PolarAngleAxis dataKey="s" tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}/>
                <Radar dataKey="A" stroke={INDIGO} fill={INDIGO} fillOpacity={0.15} strokeWidth={2.5}
                  style={{ filter: "drop-shadow(0 0 6px rgba(79,70,229,0.5))" }}/>
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* 6 ── Diversity breakdown */}
        {hasDiversity && (
          <Card className="md:col-span-2 xl:col-span-1">
            <SL>Student Diversity</SL>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={Object.entries(diversity!).map(([k, v]) => ({ name: k, pct: Number(v) }))}
                barCategoryGap="28%"
              >
                <defs>
                  <linearGradient id="sd-div" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={INDIGO} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={TEAL}   stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false}/>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} tickFormatter={(v) => `${v}%`}/>
                <Tooltip content={<GlassTooltip/>} cursor={{ fill: "rgba(79,70,229,0.04)" }}/>
                <Bar dataKey="pct" fill="url(#sd-div)" radius={[10,10,0,0]} maxBarSize={48} name="Students %"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

      </div>
    </section>
  );
}
