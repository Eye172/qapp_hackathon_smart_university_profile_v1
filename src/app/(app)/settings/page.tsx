"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-gray-100 p-5">{children}</div>;
}

function Row({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-[13px] font-medium text-gray-800">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{children}</p>;
}

function SignOutModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="bg-white rounded-3xl p-6 w-72 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M7 3H3a1 1 0 00-1 1v11a1 1 0 001 1h12a1 1 0 001-1v-4M13 9l4-4m0 0l-4-4m4 4H7"
              stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold text-center mb-1">Sign out?</h3>
        <p className="text-[12px] text-gray-400 text-center mb-5">
          You&apos;ll need to sign in again to access your profile.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 h-9 rounded-xl bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition">
            Sign out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showSignOut, setShowSignOut] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  function copyEmail() {
    const email = session?.user?.email;
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="px-8 pt-7 pb-6">
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight leading-none">Settings</h1>
        <p className="text-[11px] text-gray-400 mt-1">Account &amp; preferences</p>
      </header>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6 mb-6" />

      <div className="px-8 pb-10 max-w-lg space-y-5">

        {/* Account */}
        <div>
          <SectionLabel>Account</SectionLabel>
          <Card>
            <Row
              label="Email"
              sub="Your sign-in address"
              right={
                <button type="button" onClick={copyEmail}
                  className={cn(
                    "text-[11px] font-medium rounded-lg px-2.5 py-1 transition-all",
                    copied ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600",
                  )}>
                  {copied ? "Copied ✓" : (session?.user?.email ?? "—")}
                </button>
              }
            />
            <Row
              label="Status"
              right={
                <span className={cn(
                  "text-[11px] font-semibold rounded-full px-2.5 py-1",
                  status === "authenticated" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500",
                )}>
                  {status === "authenticated" ? "Active" : status}
                </span>
              }
            />
          </Card>
        </div>

        {/* App */}
        <div>
          <SectionLabel>Application</SectionLabel>
          <Card>
            <Row
              label="Version"
              sub="QApp Smart University Profile"
              right={<span className="text-[11px] text-gray-400 font-mono">v0.1.0-beta</span>}
            />
            <Row
              label="Data"
              sub="University database"
              right={<span className="text-[11px] text-gray-400">Live · Prisma</span>}
            />
            <Row
              label="AI Engine"
              sub="Fit scoring & recommendations"
              right={
                <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 bg-blue-50 text-blue-700">
                  Anthropic Claude
                </span>
              }
            />
          </Card>
        </div>

        {/* About */}
        <div>
          <SectionLabel>About</SectionLabel>
          <Card>
            <div className="py-2 space-y-1">
              <p className="text-[13px] font-semibold text-gray-900">QApp — Smart University Profile</p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                AI-powered university recommendation engine. Analyzes your academic profile, preferences,
                and priorities to surface the best-fit universities worldwide.
              </p>
              <p className="text-[11px] text-gray-400 mt-2">Built for QApp Impact Hackathon 2026.</p>
            </div>
          </Card>
        </div>

        {/* Danger zone */}
        <div>
          <SectionLabel>Session</SectionLabel>
          <Card>
            <Row
              label="Sign out"
              sub="End your current session"
              right={
                <button
                  type="button"
                  onClick={() => setShowSignOut(true)}
                  className="h-8 px-4 rounded-xl bg-red-50 text-red-600 text-[12px] font-semibold hover:bg-red-100 transition-colors"
                >
                  Sign out
                </button>
              }
            />
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showSignOut && (
          <SignOutModal onClose={() => setShowSignOut(false)} onConfirm={handleSignOut} />
        )}
      </AnimatePresence>
    </main>
  );
}
