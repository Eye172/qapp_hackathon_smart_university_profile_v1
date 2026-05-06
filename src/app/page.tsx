import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { QAppWordmark, WireframeSphere, WireframeDiamond } from "@/components/ui/qapp-logo";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(160deg, #f0f5ff 0%, #e4ecff 55%, #dce8ff 100%)", color: "var(--color-text)" }}>
      {/* ── Background decor ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Animated wavy pattern */}
        <div className="absolute inset-0 bg-pattern-waves" />
        {/* Ambient glow top-left */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(36,99,235,0.18) 0%, transparent 65%)" }} />
        {/* Ambient glow top-right */}
        <div className="absolute -top-20 -right-32 w-[500px] h-[500px] rounded-full animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 65%)", animationDelay: "2s" }} />
        {/* Wireframe sphere top-right corner */}
        <WireframeSphere size={320} color="#2463eb" opacity={0.07} className="absolute -top-16 right-12" />
        {/* Wireframe diamond bottom-left */}
        <WireframeDiamond size={220} color="#1e3a8a" opacity={0.06} className="absolute bottom-32 -left-12 animate-float-slow" />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4" style={{ background: "rgba(240,245,255,0.82)", backdropFilter: "blur(24px) saturate(180%)", borderBottom: "1px solid rgba(36,99,235,0.10)" }}>
        <QAppWordmark size={32} color="#3AABF5" />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200" style={{ color: "#5a6a8a" }}>
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold rounded-xl px-5 py-2.5 transition-all duration-200 hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2463eb 100%)", color: "#fff", boxShadow: "0 4px 18px rgba(36,99,235,0.32), 0 1px 0 rgba(255,255,255,0.15) inset" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-40 pb-28 px-6 text-center max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-1.5 mb-9"
          style={{ background: "rgba(36,99,235,0.09)", color: "#1e3a8a", border: "1px solid rgba(36,99,235,0.18)" }}
        >
          <span style={{ color: "#2463eb" }}>✦</span> AI-powered study abroad guidance
        </div>
        <h1 className="font-display text-5xl sm:text-[3.6rem] leading-[1.12] tracking-tight mb-7" style={{ color: "#0d1635" }}>
          Find your perfect{" "}
          <span className="text-gradient-royal">
            university
          </span>
          <br className="hidden sm:block" />
          {" "}with AI
        </h1>
        <p className="text-lg leading-relaxed max-w-xl mx-auto mb-11" style={{ color: "#5a6a8a", lineHeight: 1.72 }}>
          QApp matches you with universities worldwide based on your GPA, IELTS scores,
          budget, and interests — then delivers a personalised verdict powered by GPT-4.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto text-base font-semibold rounded-2xl px-9 py-4 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #0a1840 0%, #1e3a8a 40%, #2463eb 100%)", color: "#fff", boxShadow: "0 6px 28px rgba(36,99,235,0.38), 0 1px 0 rgba(255,255,255,0.12) inset" }}
          >
            Start for free →
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-base font-medium rounded-2xl px-9 py-4 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "rgba(255,255,255,0.72)", color: "#0d1635", border: "1px solid rgba(36,99,235,0.18)", backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(36,99,235,0.06)" }}
          >
            I have an account
          </Link>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="relative z-10 py-10 px-6">
        <div
          className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-3xl p-5"
          style={{ background: "rgba(255,255,255,0.62)", backdropFilter: "blur(20px) saturate(170%)", border: "1px solid rgba(36,99,235,0.13)", boxShadow: "0 8px 40px rgba(36,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.80)" }}
        >
          {[
            { value: "500+", label: "Universities" },
            { value: "40+", label: "Countries" },
            { value: "GPT-4o", label: "AI Engine" },
            { value: "100%", label: "Free" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center py-3 px-2">
              <p className="text-[1.9rem] font-bold leading-none tracking-tight" style={{ background: "linear-gradient(135deg, #1e3a8a, #2463eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{value}</p>
              <p className="text-xs font-medium mt-1.5" style={{ color: "#5a6a8a" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-28 px-6 max-w-5xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-center mb-3" style={{ color: "#2463eb" }}>What you get</p>
        <h2 className="font-display text-3xl sm:text-4xl text-center mb-14" style={{ color: "#0d1635", letterSpacing: "-0.025em" }}>
          Everything in one smart platform
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "🎯", title: "AI Fit Score", desc: "Each university gets a personal fit score from your academic profile, budget, and preferences — not generic rankings.", accent: "rgba(36,99,235,0.08)" },
            { icon: "📊", title: "Smart Feed", desc: "Swipe a curated carousel sorted by match quality. Save what you like, hide what you don't.", accent: "rgba(30,58,138,0.07)" },
            { icon: "🤖", title: "GPT-4 Counselor", desc: "Dr. Alex Morgan writes a detailed personalised verdict: strengths, gaps, action plan, and chart commentary.", accent: "rgba(16,185,129,0.07)" },
            { icon: "📋", title: "Document Tracker", desc: "Track application documents by status. Upload files directly from each university page.", accent: "rgba(245,158,11,0.07)" },
            { icon: "🌍", title: "Global Coverage", desc: "500+ universities across 40+ countries — MIT, TU Berlin, NURIS, Nazarbayev University and more.", accent: "rgba(36,99,235,0.06)" },
            { icon: "⚡", title: "Instant Preferences", desc: "Set priorities in minutes: countries, fields, languages, tags — all via smart chip selectors.", accent: "rgba(244,63,94,0.07)" },
          ].map(({ icon, title, desc, accent }) => (
            <div
              key={title}
              className="rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1"
              style={{ background: `rgba(255,255,255,0.72)`, backdropFilter: "blur(16px) saturate(160%)", border: "1px solid rgba(36,99,235,0.12)", boxShadow: `0 4px 28px ${accent}, inset 0 1px 0 rgba(255,255,255,0.80)` }}
            >
              <div className="text-3xl mb-5">{icon}</div>
              <h3 className="font-semibold mb-2.5" style={{ color: "#0d1635", fontSize: "0.975rem" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5a6a8a", lineHeight: 1.68 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 py-24 px-6" style={{ background: "rgba(36,99,235,0.04)" }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-center mb-3" style={{ color: "#2463eb" }}>How it works</p>
          <h2 className="font-display text-3xl text-center mb-14" style={{ color: "#0d1635", letterSpacing: "-0.025em" }}>Three steps to your shortlist</h2>
          <div className="space-y-6">
            {[
              { step: "01", title: "Build your profile", desc: "Enter your GPA, IELTS scores, budget, and study interests. Takes under 3 minutes." },
              { step: "02", title: "Set your preferences", desc: "Pick target countries, cities, fields of study, and how much each factor matters to you." },
              { step: "03", title: "Explore your matches", desc: "Browse your personalised feed, open any university for full AI analysis, track deadlines, and manage documents." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 items-start p-5 rounded-2xl transition-all duration-200 hover:scale-[1.01]" style={{ background: "rgba(255,255,255,0.62)", backdropFilter: "blur(14px)", border: "1px solid rgba(36,99,235,0.10)", boxShadow: "0 2px 16px rgba(36,99,235,0.06)" }}>
                <span
                  className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: "linear-gradient(140deg, #0a1840, #2463eb)", boxShadow: "0 4px 14px rgba(36,99,235,0.35)" }}
                >
                  {step}
                </span>
                <div className="pt-0.5">
                  <h3 className="font-semibold mb-1" style={{ color: "#0d1635" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5a6a8a" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-28 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl mb-5" style={{ color: "#0d1635", letterSpacing: "-0.025em" }}>
            Ready to find your university?
          </h2>
          <p className="mb-10" style={{ color: "#5a6a8a", lineHeight: 1.7 }}>
            Free to use. No credit card. Get your AI-powered shortlist in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block text-base font-semibold rounded-2xl px-11 py-4 transition-all duration-200 hover:scale-[1.04] hover:shadow-2xl"
            style={{ background: "linear-gradient(135deg, #0a1840 0%, #1e3a8a 45%, #2463eb 100%)", color: "#fff", boxShadow: "0 8px 36px rgba(36,99,235,0.42), 0 1px 0 rgba(255,255,255,0.14) inset" }}
          >
            Create your profile →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 px-6 text-center text-xs" style={{ borderTop: "1px solid rgba(36,99,235,0.10)", color: "#8899bb" }}>
        © 2026 QApp · Built for QApp Impact Hackathon
      </footer>
    </main>
  );
}
