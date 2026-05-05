"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { IUniversityProfile } from "@/lib/types";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/tailwind-utils";

interface Milestone {
  id: string; universityId: string; universityName: string;
  label: string; date: Date; accent: string; isCustom: boolean; done: boolean;
}

const PALETTE = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16","#f97316","#14b8a6"];
const SP = { type:"spring" as const, stiffness:380, damping:26 };

function accentFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function daysUntil(d: Date) { return Math.ceil((d.getTime() - Date.now()) / 86_400_000); }
function timeLeft(d: Date) {
  const ms = d.getTime() - Date.now();
  if (ms <= 0) return "Passed";
  const h = Math.floor(ms / 3_600_000);
  const days = Math.floor(h / 24), hrs = h % 24;
  if (days === 0 && hrs === 0) return "Today!";
  if (days === 0) return `${hrs}h left`;
  return `${days}d ${hrs}h left`;
}
function fmtShort(d: Date) { return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function fmtFull(d: Date)  { return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}); }
function urgencyColor(days: number) {
  if (days < 0) return "#94a3b8";
  if (days <= 7)  return "#f87171";
  if (days <= 21) return "#fbbf24";
  if (days <= 60) return "#34d399";
  return "#60a5fa";
}
function urgencyPct(d: Date) {
  const days = daysUntil(d);
  if (days < 0) return 100;
  return Math.max(4, Math.min(96, ((90 - days) / 90) * 100));
}

/* -- Decorative wavy SVG --------------------------------------- */
function WavyAccent({ color, className }: { color: string; className?: string }) {
  return (
    <svg className={cn("absolute pointer-events-none select-none",className)} viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden>
      <path d="M0,30 C50,10 100,50 150,30 C200,10 250,50 300,30" stroke={color} strokeWidth="1.5" fill="none" opacity="0.22"/>
      <path d="M0,42 C40,22 90,58 150,42 C210,26 260,58 300,42" stroke={color} strokeWidth="1" fill="none" opacity="0.13"/>
    </svg>
  );
}

/* -- Stat pill ------------------------------------------------- */
function StatPill({ label, color, loading }: { label: string; color: string; loading?: boolean }) {
  if (loading) return <div className="h-6 w-24 rounded-full animate-pulse" style={{background:"var(--color-border)"}}/>;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold" style={{background:`${color}18`,color}}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background:color}}/>
      {label}
    </span>
  );
}

/* -- Section header -------------------------------------------- */
function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <h2 className="text-[length:var(--text-fluid-base)] font-bold text-[color:var(--color-text)]">{label}</h2>
      {sub && <p className="text-[10px] text-[color:var(--color-muted)] hidden sm:block">{sub}</p>}
    </div>
  );
}

/* ==================================================================
   SECTION A — HORIZONTAL MASTER TIMELINE
================================================================== */
function HorizontalMasterTimeline({ nodes, onToggle }: { nodes: Milestone[]; onToggle: (id: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState<string|null>(null);
  const drag = React.useRef({ on: false, startX: 0, scrollLeft: 0 });

  const sorted = [...nodes].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!sorted.length) return null;

  const now = new Date();
  const PAD = 20 * 86_400_000;
  const minT = Math.min(sorted[0].date.getTime(), now.getTime()) - PAD;
  const maxT = sorted[sorted.length-1].date.getTime() + PAD;
  const span = maxT - minT;
  const TRACK = Math.max(900, sorted.length * 180);
  const px = (t: number) => ((t - minT) / span) * TRACK;
  const nowX = px(now.getTime());

  /* drag scroll */
  const onMD = (e: React.MouseEvent) => { drag.current = { on:true, startX:e.clientX, scrollLeft: ref.current?.scrollLeft ?? 0 }; };
  const onMM = (e: React.MouseEvent) => { if (!drag.current.on || !ref.current) return; ref.current.scrollLeft = drag.current.scrollLeft + (drag.current.startX - e.clientX); };
  const onMU = () => { drag.current.on = false; };

  /* duration arrows between consecutive nodes of same university */
  const byUni = new Map<string, Milestone[]>();
  sorted.forEach(n => { if(!byUni.has(n.universityId)) byUni.set(n.universityId,[]); byUni.get(n.universityId)!.push(n); });
  const arrows: React.ReactNode[] = [];
  byUni.forEach(uns => {
    for (let i=0; i<uns.length-1; i++) {
      const ax = px(uns[i].date.getTime()), bx = px(uns[i+1].date.getTime());
      const diff = Math.round((uns[i+1].date.getTime()-uns[i].date.getTime())/86_400_000);
      const col = uns[i].accent;
      arrows.push(
        <div key={`ar-${uns[i].id}`} className="absolute top-1/2 -translate-y-1/2 pointer-events-none flex items-center" style={{left:ax+18,width:bx-ax-36}}>
          <div className="flex-1 h-px" style={{background:`${col}35`}}/>
          <svg width="6" height="8" viewBox="0 0 6 8" fill="none" style={{color:col}}>
            <path d="M0 0 L6 4 L0 8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
          </svg>
          <span className="absolute left-1/2 -translate-x-1/2 -top-4 text-[8px] font-bold whitespace-nowrap" style={{color:col}}>{diff}d</span>
        </div>
      );
    }
  });

  return (
    <section className="mx-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel label="Master Timeline" sub="Drag to explore · click node to complete"/>
        <span className="text-[10px] text-[color:var(--color-muted)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block"/>
          {fmtShort(now)}
        </span>
      </div>
      <div className="rounded-2xl border border-[color:var(--color-border)] overflow-hidden relative"
        style={{background:"var(--color-surface-glass)",backdropFilter:"blur(16px)",boxShadow:"var(--shadow-glass)"}}>
        <WavyAccent color="var(--color-accent)" className="top-0 right-0 w-64 h-20 opacity-30"/>
        <div ref={ref} className="overflow-x-auto cursor-grab active:cursor-grabbing select-none py-10 px-6"
          style={{scrollbarWidth:"none"}} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
          <div className="relative" style={{width:TRACK,height:80}}>
            {/* track */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px" style={{background:"var(--color-border-strong)"}}/>
            {/* arrows */}
            {arrows}
            {/* TODAY line */}
            <div className="absolute top-0 bottom-0 w-px" style={{left:nowX,background:"var(--color-accent)",boxShadow:"0 0 10px var(--color-accent)"}}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black text-white whitespace-nowrap"
                style={{background:"var(--color-accent)",boxShadow:"0 2px 8px var(--color-accent)60"}}>TODAY</div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white"
                style={{background:"var(--color-accent)",boxShadow:"0 0 12px var(--color-accent)"}}/>
            </div>
            {/* nodes */}
            {sorted.map((n, i) => {
              const x = px(n.date.getTime()); const days = daysUntil(n.date); const past = days < 0;
              return (
                <div key={n.id} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{left:x,zIndex:hovered===n.id?10:1}}
                  onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}>
                  <motion.button type="button" onClick={() => onToggle(n.id)} whileHover={{scale:1.18}} whileTap={{scale:0.9}} transition={SP}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                    style={{background:n.done||past?"#94a3b8":n.accent,
                      boxShadow:n.done||past?"0 2px 6px rgba(0,0,0,0.2)":`0 0 14px ${n.accent}60,0 2px 8px rgba(0,0,0,0.2)`,
                      opacity:n.done?0.35:1}}>
                    {n.done?"?":i+1}
                  </motion.button>
                  {/* tooltip */}
                  <AnimatePresence>
                    {hovered===n.id && (
                      <motion.div initial={{opacity:0,y:8,scale:0.88}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:0.88}} transition={SP}
                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                        <div className="rounded-xl px-3 py-2.5 min-w-[130px] max-w-[180px]"
                          style={{background:"var(--color-surface-glass)",backdropFilter:"blur(20px)",
                            border:`1px solid ${n.accent}40`,boxShadow:`0 8px 24px rgba(0,0,0,0.18),0 0 0 1px ${n.accent}20`}}>
                          <p className="text-[11px] font-bold text-[color:var(--color-text)] truncate">{n.label}</p>
                          <p className="text-[10px] text-[color:var(--color-muted)] mt-0.5 truncate">{n.universityName}</p>
                          <p className="text-[10px] font-bold mt-1" style={{color:urgencyColor(days)}}>{timeLeft(n.date)}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* date label */}
                  <p className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[8px] text-[color:var(--color-muted)] whitespace-nowrap font-medium">{fmtShort(n.date)}</p>
                </div>
              );
            })}
          </div>
        </div>
        {/* edge labels */}
        <div className="absolute bottom-3 left-6 right-6 flex justify-between pointer-events-none">
          <span className="text-[9px] text-[color:var(--color-muted)]">{fmtFull(sorted[0].date)}</span>
          <span className="text-[9px] text-[color:var(--color-muted)]">{fmtFull(sorted[sorted.length-1].date)}</span>
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
   SECTION B — COUNTDOWN SLIDERS
================================================================== */
function CountdownSliderCard({ node }: { node: Milestone }) {
  const days = daysUntil(node.date);
  const color = urgencyColor(days);
  const pct = urgencyPct(node.date);
  return (
    <motion.div layout initial={{opacity:0,y:8}} animate={{opacity:node.done?0.4:1,y:0}} transition={SP}
      className="rounded-2xl p-4 border border-[color:var(--color-border)] relative overflow-hidden"
      style={{background:"var(--color-surface-glass)",backdropFilter:"blur(12px)",borderTop:`2px solid ${node.accent}`}}>
      <WavyAccent color={node.accent} className="top-0 right-0 w-36 h-14 opacity-50"/>
      <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[color:var(--color-muted)] uppercase tracking-wider truncate">{node.universityName}</p>
          <p className="text-[12px] font-semibold text-[color:var(--color-text)] mt-0.5 leading-snug truncate">{node.label}</p>
        </div>
        <span className="shrink-0 text-[10px] font-bold rounded-full px-2.5 py-1 whitespace-nowrap"
          style={{background:`${color}20`,color}}>{timeLeft(node.date)}</span>
      </div>
      <div className="relative z-10">
        <div className="h-1.5 rounded-full overflow-hidden" style={{background:"var(--color-border)"}}>
          <motion.div className="h-full rounded-full" initial={{width:0}}
            animate={{width:`${node.done?100:pct}%`}}
            transition={{type:"spring",stiffness:110,damping:20,delay:0.15}}
            style={{background:node.done?"#34d399":`linear-gradient(90deg,${node.accent}70,${color})`}}/>
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-[9px] text-[color:var(--color-muted)]">{fmtShort(new Date())}</p>
          <p className="text-[9px] text-[color:var(--color-muted)]">{fmtFull(node.date)}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ==================================================================
   SECTION C — MILESTONE ROW (inside university cards)
================================================================== */
function MilestoneRow({ node, isLast, accent, onToggle, onRemove }: {
  node: Milestone; isLast: boolean; accent: string;
  onToggle:(id:string)=>void; onRemove:(id:string)=>void;
}) {
  const days = daysUntil(node.date);
  const col = urgencyColor(days);
  return (
    <div className="relative flex gap-3 group">
      {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-px" style={{background:`${accent}25`}}/>}
      <motion.button type="button" onClick={()=>onToggle(node.id)} whileHover={{scale:1.12}} whileTap={{scale:0.9}} transition={SP}
        className="relative z-10 shrink-0 w-5 h-5 rounded-full border-2 border-white shadow-sm mt-0.5 flex items-center justify-center"
        style={{background:node.done?"#34d399":accent,boxShadow:node.done?`0 0 8px #34d39940`:`0 0 8px ${accent}40`,opacity:node.done?0.7:1}}>
        <motion.svg width="7" height="7" viewBox="0 0 8 8" fill="none" initial={false}
          animate={{opacity:node.done?1:0,scale:node.done?1:0.5}} transition={SP}>
          <path d="M1.5 4l2 2L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </motion.button>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-[12px] font-semibold leading-snug",node.done?"line-through opacity-45 text-[color:var(--color-muted)]":"text-[color:var(--color-text)]")}>{node.label}</p>
          <button type="button" onClick={()=>onRemove(node.id)}
            className="shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full text-[color:var(--color-muted)] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all duration-150">
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-[9px] text-[color:var(--color-muted)]">{fmtFull(node.date)}</p>
          <span className="w-1 h-1 rounded-full shrink-0" style={{background:col}}/>
          <p className="text-[9px] font-semibold" style={{color:col}}>{timeLeft(node.date)}</p>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   SECTION C — UNIVERSITY ROADMAP CARD
=================================================================== */
function UniversityRoadmapCard({ university, nodes, accent, onToggle, onRemove, onNavigate, onColorChange, onAddMilestone }: {
  university: IUniversityProfile; nodes: Milestone[]; accent: string;
  onToggle:(id:string)=>void; onRemove:(id:string)=>void; onNavigate:(id:string)=>void;
  onColorChange:(uid:string,color:string)=>void; onAddMilestone:(uid:string,label:string,date:string)=>void;
}) {
  const colorRef = React.useRef<HTMLInputElement>(null);
  const [adding, setAdding] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState("");
  const [newDate,  setNewDate]  = React.useState("");
  const sorted = [...nodes].sort((a,b)=>a.date.getTime()-b.date.getTime());
  const done = sorted.filter(n=>n.done).length;
  const prog = sorted.length ? (done/sorted.length)*100 : 0;

  return (
    <motion.article layout initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={SP}
      className="rounded-3xl border border-[color:var(--color-border)] overflow-hidden flex flex-col"
      style={{background:"var(--color-surface)",boxShadow:"var(--shadow-glass)"}}>
      {/* header */}
      <div className="relative px-5 py-4 overflow-hidden" style={{background:`linear-gradient(135deg,${accent}18,${accent}08)`,borderBottom:`1px solid ${accent}20`}}>
        <WavyAccent color={accent} className="top-0 right-0 w-48 h-16"/>
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button type="button" title="Change color" onClick={()=>colorRef.current?.click()}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-[13px] transition hover:scale-105"
              style={{background:accent,boxShadow:`0 4px 12px ${accent}50`}}>
              {university.name.charAt(0)}
            </button>
            <input ref={colorRef} type="color" defaultValue={accent} onChange={e=>onColorChange(university.id,e.target.value)} className="sr-only"/>
            <div className="min-w-0">
              <button type="button" onClick={()=>onNavigate(university.id)}
                className="text-[13px] font-bold text-[color:var(--color-text)] hover:text-[color:var(--color-accent)] transition-colors text-left truncate block max-w-[160px]">
                {university.name}
              </button>
              <p className="text-[10px] text-[color:var(--color-muted)] mt-0.5 truncate">
                {university.country}{university.worldRank?` · #${university.worldRank}`:""}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[12px] font-black text-[color:var(--color-text)]">{done}/{sorted.length}</p>
            <p className="text-[9px] text-[color:var(--color-muted)]">done</p>
          </div>
        </div>
        {/* progress bar */}
        <div className="relative z-10 mt-3 h-1 rounded-full overflow-hidden" style={{background:`${accent}20`}}>
          <motion.div className="h-full rounded-full" initial={{width:0}} animate={{width:`${prog}%`}}
            transition={{type:"spring",stiffness:120,damping:20}} style={{background:accent}}/>
        </div>
      </div>
      {/* stepper */}
      <div className="flex-1 px-5 pt-5 pb-2">
        {sorted.length===0
          ? <p className="text-[11px] text-[color:var(--color-muted)] text-center py-6 opacity-60">No deadlines yet</p>
          : sorted.map((n,i)=>(
              <MilestoneRow key={n.id} node={n} isLast={i===sorted.length-1} accent={accent} onToggle={onToggle} onRemove={onRemove}/>
            ))
        }
        <AnimatePresence>
          {adding && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden">
              <div className="pt-3 border-t border-[color:var(--color-border)] mt-1 flex flex-col gap-2">
                <input type="text" placeholder="Task label…" value={newLabel} onChange={e=>setNewLabel(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-border)] px-3 py-2 text-[12px] bg-[color:var(--color-surface)] text-[color:var(--color-text)] outline-none focus:border-[color:var(--color-accent)] transition"/>
                <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-border)] px-3 py-2 text-[12px] bg-[color:var(--color-surface)] text-[color:var(--color-text)] outline-none focus:border-[color:var(--color-accent)] transition"/>
                <div className="flex gap-2">
                  <button type="button" onClick={()=>{setAdding(false);setNewLabel("");setNewDate("");}}
                    className="flex-1 h-8 rounded-lg text-[11px] border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-border)] transition">Cancel</button>
                  <button type="button" disabled={!newLabel.trim()||!newDate}
                    onClick={()=>{onAddMilestone(university.id,newLabel.trim(),newDate);setAdding(false);setNewLabel("");setNewDate("");}}
                    className="flex-1 h-8 rounded-lg text-[11px] font-semibold text-white disabled:opacity-40 transition hover:opacity-90"
                    style={{background:accent}}>Add</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* footer add button */}
      <div className="px-5 pb-4">
        <button type="button" onClick={()=>setAdding(v=>!v)}
          className="w-full h-8 rounded-xl border border-dashed border-[color:var(--color-border)] text-[11px] text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors flex items-center justify-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Add task
        </button>
      </div>
    </motion.article>
  );
}

/* ===================================================================
   ADD DEADLINE MODAL
=================================================================== */
function AddDeadlineModal({ onClose, onAdd }: { onClose:()=>void; onAdd:(label:string,date:string)=>void }) {
  const [label, setLabel] = React.useState("");
  const [date,  setDate]  = React.useState("");
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}
      className="fixed inset-0 flex items-center justify-center" style={{zIndex:"var(--z-modal)",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(10px)"}}
      onClick={onClose}>
      <motion.div initial={{scale:0.92,y:16,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:0.92,y:16,opacity:0}}
        transition={{type:"spring",stiffness:380,damping:26}}
        className="w-[340px] rounded-3xl p-6" style={{background:"var(--color-surface)",border:"1px solid var(--color-border-strong)",boxShadow:"var(--shadow-card)"}}
        onClick={e=>e.stopPropagation()}>
        <h3 className="text-[15px] font-bold text-[color:var(--color-text)] mb-1">Add custom deadline</h3>
        <p className="text-[11px] text-[color:var(--color-muted)] mb-5">Appears on the master timeline</p>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-muted)] block mb-1.5">Label</label>
            <input type="text" value={label} onChange={e=>setLabel(e.target.value)} autoFocus placeholder="e.g. Essay draft due"
              onKeyDown={e=>e.key==="Enter"&&label.trim()&&date&&(onAdd(label.trim(),date),onClose())}
              className="w-full rounded-xl border border-[color:var(--color-border)] px-3.5 py-2.5 text-[13px] bg-[color:var(--color-surface)] text-[color:var(--color-text)] outline-none focus:border-[color:var(--color-accent)] transition"/>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-muted)] block mb-1.5">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--color-border)] px-3.5 py-2.5 text-[13px] bg-[color:var(--color-surface)] text-[color:var(--color-text)] outline-none focus:border-[color:var(--color-accent)] transition"/>
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 rounded-xl text-[12px] font-medium border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-border)] transition">Cancel</button>
          <button type="button" disabled={!label.trim()||!date} onClick={()=>{onAdd(label.trim(),date);onClose();}}
            className="flex-1 h-10 rounded-xl text-white text-[12px] font-bold disabled:opacity-40 transition hover:opacity-90"
            style={{background:"var(--color-accent)",boxShadow:"0 4px 16px var(--color-accent)40"}}>Add deadline</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===================================================================
   MAIN PAGE
=================================================================== */
export default function TimelinePage() {
  const router = useRouter();
  const t = useTranslation();
  const saved = useAlgorithmStore(s => s.savedUniversities);

  const [universities, setUniversities] = React.useState<IUniversityProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [nodes, setNodes] = React.useState<Milestone[]>([]);
  const [accents, setAccents] = React.useState<Record<string,string>>({});
  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/universities")
      .then(r=>r.ok?r.json() as Promise<IUniversityProfile[]>:[])
      .then(setUniversities).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  React.useEffect(() => {
    const savedUnis = universities.filter(u=>saved.includes(u.id));
    const newAcc = {...accents};
    const built: Milestone[] = [];
    for (const u of savedUnis) {
      if (!newAcc[u.id]) newAcc[u.id] = accentFor(u.id);
      if (u.applicationDeadline) {
        built.push({ id:`${u.id}-app`, universityId:u.id, universityName:u.name, label:"Application deadline",
          date:new Date(u.applicationDeadline), accent:newAcc[u.id], isCustom:false, done:false });
      }
    }
    setAccents(newAcc);
    setNodes(prev => {
      const custom = prev.filter(n=>n.isCustom);
      const doneMap = new Map(prev.filter(n=>!n.isCustom).map(n=>[n.id,n.done]));
      return [...built.map(n=>({...n,done:doneMap.get(n.id)??false})), ...custom];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universities, saved]);

  const toggleDone = React.useCallback((id:string) =>
    setNodes(prev=>prev.map(n=>n.id===id?{...n,done:!n.done}:n)), []);
  const removeNode = React.useCallback((id:string) =>
    setNodes(prev=>prev.filter(n=>n.id!==id)), []);
  const addCustom = React.useCallback((label:string, date:string) =>
    setNodes(prev=>[...prev,{id:`custom-${Date.now()}`,universityId:"custom",universityName:"Personal",
      label,date:new Date(date),accent:"#6366f1",isCustom:true,done:false}]), []);
  const addMilestoneToUni = React.useCallback((uid:string,label:string,date:string) => {
    setNodes(prev=>[...prev,{id:`${uid}-custom-${Date.now()}`,universityId:uid,
      universityName:universities.find(u=>u.id===uid)?.name??"",label,date:new Date(date),
      accent:accents[uid]??accentFor(uid),isCustom:false,done:false}]);
  }, [universities, accents]);
  const changeAccent = React.useCallback((uid:string,color:string) => {
    setAccents(prev=>({...prev,[uid]:color}));
    setNodes(prev=>prev.map(n=>n.universityId===uid?{...n,accent:color}:n));
  }, []);

  const savedUnis = React.useMemo(()=>universities.filter(u=>saved.includes(u.id)),[universities,saved]);
  const uniNodes = React.useMemo(()=>{
    const map = new Map<string,Milestone[]>();
    nodes.filter(n=>!n.isCustom).forEach(n=>{ const a=map.get(n.universityId)??[]; a.push(n); map.set(n.universityId,a); });
    return map;
  }, [nodes]);
  const customNodes = nodes.filter(n=>n.isCustom);
  const upcoming = nodes.filter(n=>!n.isCustom&&daysUntil(n.date)>=0&&!n.done);
  const overdue  = nodes.filter(n=>!n.isCustom&&daysUntil(n.date)<0&&!n.done);
  const countdownSet = [...upcoming].sort((a,b)=>a.date.getTime()-b.date.getTime()).slice(0,6);
  const allTimeline  = nodes.filter(n=>!n.isCustom);

  return (
    <main className="min-h-screen flex flex-col" style={{background:"var(--color-bg)"}}>
      {/* -- Header -- */}
      <header className="shrink-0 px-6 pt-8 pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-bold tracking-tight leading-none" style={{fontSize:"var(--text-fluid-2xl)",color:"var(--color-text)"}}>
              {t.nav.deadlines}
            </h1>
            <p className="mt-1.5 text-[12px] text-[color:var(--color-muted)]">Track every milestone across your applications</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatPill color="#3b82f6" label={`${upcoming.length} upcoming`} loading={loading}/>
              {overdue.length>0 && <StatPill color="#f87171" label={`${overdue.length} overdue`}/>}
              <StatPill color="#8b5cf6" label={`${savedUnis.length} universities`} loading={loading}/>
              {customNodes.length>0 && <StatPill color="#6366f1" label={`${customNodes.length} personal`}/>}
            </div>
          </div>
          <motion.button type="button" onClick={()=>setShowAdd(true)}
            whileHover={{scale:1.04}} whileTap={{scale:0.96}} transition={SP}
            className="shrink-0 flex items-center gap-2 px-4 h-10 rounded-xl text-white text-[12px] font-bold shadow-lg"
            style={{background:"var(--color-accent)",boxShadow:"0 4px 20px var(--color-accent)40"}}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Add deadline
          </motion.button>
        </div>
      </header>

      <div className="mx-6 h-px" style={{background:"var(--color-border)"}}/>

      {loading ? (
        <div className="px-6 pt-6 space-y-6 animate-pulse">
          <div className="h-28 rounded-2xl" style={{background:"var(--color-border)"}}/>
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i=><div key={i} className="h-20 rounded-2xl" style={{background:"var(--color-border)"}}/>)}
          </div>
          <div className="grid gap-5" style={{gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))"}}>
            {[1,2,3].map(i=><div key={i} className="h-64 rounded-3xl" style={{background:"var(--color-border)"}}/>)}
          </div>
        </div>
      ) : saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-24 text-center px-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{background:"var(--color-surface)",boxShadow:"var(--shadow-glass)",border:"1px solid var(--color-border)"}}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="opacity-30">
              <rect x="8" y="6" width="24" height="28" rx="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 14h12M14 20h8M14 26h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[color:var(--color-muted)] text-sm mb-3">No saved universities yet.</p>
          <button type="button" className="text-[color:var(--color-accent)] text-sm font-semibold underline underline-offset-2"
            onClick={()=>router.push("/feed")}>Discover universities →</button>
        </div>
      ) : (
        <>
          {/* A — MASTER TIMELINE */}
          <div className="pt-5">
            <HorizontalMasterTimeline nodes={[...allTimeline,...customNodes]} onToggle={toggleDone}/>
          </div>

          {/* B — COUNTDOWN SLIDERS */}
          {countdownSet.length>0 && (
            <section className="mx-6 mb-6">
              <SectionLabel label="Active Countdowns" sub="Sorted by urgency · click to complete"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {countdownSet.map(n=><CountdownSliderCard key={n.id} node={n}/>)}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* C — UNIVERSITY ROADMAPS */}
          <section className="mx-6 mb-10">
            <SectionLabel label="University Roadmaps" sub="Click milestone dots to complete · tap accent to recolor"/>
            <div className="grid gap-5" style={{gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))"}}>
              <AnimatePresence mode="popLayout">
                {savedUnis.map(u=>(
                  <UniversityRoadmapCard key={u.id} university={u} nodes={uniNodes.get(u.id)??[]}
                    accent={accents[u.id]??accentFor(u.id)} onToggle={toggleDone} onRemove={removeNode}
                    onNavigate={uid=>router.push(`/university/${uid}`)} onColorChange={changeAccent}
                    onAddMilestone={addMilestoneToUni}/>
                ))}
                {customNodes.length>0 && (
                  <motion.article key="personal" layout initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={SP}
                    className="rounded-3xl border border-[color:var(--color-border)] overflow-hidden flex flex-col"
                    style={{background:"var(--color-surface)",boxShadow:"var(--shadow-glass)"}}>
                    <div className="relative px-5 py-4 overflow-hidden" style={{background:"rgba(99,102,241,0.12)",borderBottom:"1px solid rgba(99,102,241,0.2)"}}>
                      <WavyAccent color="#6366f1" className="top-0 right-0 w-48 h-16"/>
                      <div className="relative z-10 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-white text-[13px]">P</div>
                        <div>
                          <p className="text-[13px] font-bold text-[color:var(--color-text)]">Personal</p>
                          <p className="text-[10px] text-[color:var(--color-muted)]">Custom deadlines</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 px-5 pt-5 pb-4">
                      <AnimatePresence mode="popLayout">
                        {customNodes.map((n,i)=>(
                          <MilestoneRow key={n.id} node={n} isLast={i===customNodes.length-1} accent="#6366f1" onToggle={toggleDone} onRemove={removeNode}/>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.article>
                )}
              </AnimatePresence>
            </div>
          </section>
        </>
      )}

      <AnimatePresence>
        {showAdd && <AddDeadlineModal onClose={()=>setShowAdd(false)} onAdd={addCustom}/>}
      </AnimatePresence>
    </main>
  );
}

