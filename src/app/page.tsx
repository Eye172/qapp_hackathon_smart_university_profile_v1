import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <span className="font-bold text-lg tracking-tight">
          Q<span className="text-indigo-600">App</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 transition-colors"
          >
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-4 py-1.5 mb-8">
          ✦ AI-powered study abroad guidance
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6">
          Find your perfect{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
            university
          </span>{" "}
          with AI
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          QApp matches you with universities worldwide based on your GPA, IELTS scores, budget, and interests —
          then gives you a personalised counselor&apos;s verdict powered by GPT-4.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto text-base font-semibold bg-indigo-600 text-white rounded-2xl px-8 py-3.5 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-base font-medium border border-gray-200 rounded-2xl px-8 py-3.5 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            I have an account
          </Link>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-gray-100 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Universities" },
            { value: "40+", label: "Countries" },
            { value: "GPT-4o", label: "AI Engine" },
            { value: "100%", label: "Free to use" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-indigo-600">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 text-center mb-3">What you get</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
          Everything in one smart platform
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🎯",
              title: "AI Fit Score",
              desc: "Each university gets a personal fit score calculated from your academic profile, budget, and preferences — not generic rankings.",
              color: "bg-indigo-50 border-indigo-100",
            },
            {
              icon: "📊",
              title: "Smart Feed",
              desc: "Swipe through a curated carousel of universities sorted by how well they match you. Save the ones you like, hide the ones you don't.",
              color: "bg-violet-50 border-violet-100",
            },
            {
              icon: "🤖",
              title: "GPT-4 Counselor",
              desc: "Dr. Alex Morgan — our AI persona — writes a detailed, personalised verdict for each university: strengths, gaps, action plan and chart commentary.",
              color: "bg-emerald-50 border-emerald-100",
            },
            {
              icon: "📋",
              title: "Document Tracker",
              desc: "Track which application documents are ready, in review, or still missing. Upload files directly from the university page.",
              color: "bg-amber-50 border-amber-100",
            },
            {
              icon: "🌍",
              title: "Global Coverage",
              desc: "500+ universities across 40+ countries — from MIT and TU Berlin to NURIS and Nazarbayev University — all in one place.",
              color: "bg-blue-50 border-blue-100",
            },
            {
              icon: "⚡",
              title: "Instant Preferences",
              desc: "Set your priorities in minutes: pick countries, fields, languages and tags using smart chip selectors — no typing required.",
              color: "bg-rose-50 border-rose-100",
            },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className={`rounded-3xl border p-6 ${color}`}>
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 text-center mb-3">How it works</p>
          <h2 className="text-3xl font-bold text-center mb-14">Three steps to your shortlist</h2>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Build your profile",
                desc: "Enter your GPA, IELTS scores, budget, and study interests. Takes under 3 minutes.",
              },
              {
                step: "02",
                title: "Set your preferences",
                desc: "Pick target countries and cities, fields of study, university tags, and how much each factor matters to you.",
              },
              {
                step: "03",
                title: "Explore your matches",
                desc: "Browse your personalised feed, open any university for a full AI analysis, track deadlines, and manage your documents.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start">
                <span className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-200">
                  {step}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to find your university?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Free to use. No credit card. Get your AI-powered shortlist in minutes.
        </p>
        <Link
          href="/register"
          className="inline-block text-base font-semibold bg-indigo-600 text-white rounded-2xl px-10 py-4 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Create your profile →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-xs text-gray-400">
        © 2026 QApp · Built for QApp Impact Hackathon
      </footer>
    </main>
  );
}
