"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import { useSettingsStore, type Language } from "@/store/useSettingsStore";
import { useTranslation } from "@/lib/i18n";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-[color:var(--color-surface)] rounded-2xl border border-[color:var(--color-border)] p-5">{children}</div>;
}

function Row({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[color:var(--color-border)] last:border-0">
      <div>
        <p className="text-[13px] font-medium text-[color:var(--color-text)]">{label}</p>
        {sub && <p className="text-[11px] text-[color:var(--color-muted)] mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2 px-1">{children}</p>;
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
        <h3 className="text-[15px] font-semibold text-center mb-1 text-[color:var(--color-text)]">Sign out?</h3>
        <p className="text-[12px] text-[color:var(--color-muted)] text-center mb-5">
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

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "ENG" },
  { code: "ru", label: "RUS" },
  { code: "kz", label: "KAZ" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showSignOut, setShowSignOut] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { language, theme, setLanguage, toggleTheme } = useSettingsStore();
  const t = useTranslation();

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
    <main className="min-h-screen bg-[color:var(--color-bg)]">
      <header className="px-8 pt-7 pb-6">
        <h1 className="text-[22px] font-semibold text-[color:var(--color-text)] tracking-tight leading-none">{t.settings.title}</h1>
        <p className="text-[11px] text-[color:var(--color-muted)] mt-1">{t.settings.subtitle}</p>
      </header>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6 mb-6" />

      <div className="px-8 pb-10 max-w-lg space-y-5">

        {/* Account */}
        <div>
          <SectionLabel>{t.settings.account}</SectionLabel>
          <Card>
            <Row
              label={t.settings.email}
              sub={t.settings.emailSub}
              right={
                <button type="button" onClick={copyEmail}
                  className={cn(
                    "text-[11px] font-medium rounded-lg px-2.5 py-1 transition-all",
                    copied ? "bg-green-50 text-green-600" : "bg-[color:var(--color-bg)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-accent)]/10 hover:text-[color:var(--color-accent)]",
                  )}>
                  {copied ? "Copied ✓" : (session?.user?.email ?? "—")}
                </button>
              }
            />
            <Row
              label={t.settings.status}
              right={
                <span className={cn(
                  "text-[11px] font-semibold rounded-full px-2.5 py-1",
                  status === "authenticated" ? "bg-green-50 text-green-700" : "bg-[color:var(--color-bg)] text-[color:var(--color-muted)]",
                )}>
                  {status === "authenticated" ? t.settings.statusActive : status}
                </span>
              }
            />
          </Card>
        </div>

        {/* Language */}
        <div>
          <SectionLabel>{t.settings.language}</SectionLabel>
          <Card>
            <Row
              label={t.settings.language}
              sub={t.settings.languageSub}
              right={
                <div className="flex gap-1">
                  {LANGS.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguage(code)}
                      className={cn(
                        "text-[10px] font-bold rounded-lg px-2.5 py-1.5 transition-all",
                        language === code
                          ? "bg-[color:var(--color-accent)] text-white shadow-sm"
                          : "bg-[color:var(--color-bg)] text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              }
            />
            <Row
              label={t.settings.theme}
              sub={t.settings.themeSub}
              right={
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-semibold rounded-xl px-3 py-1.5 transition-all",
                    theme === "dark"
                      ? "bg-slate-800 text-slate-200 border border-slate-700"
                      : "bg-amber-50 text-amber-700 border border-amber-100",
                  )}
                >
                  {theme === "dark" ? "🌙 " + t.settings.themeDark : "☀️ " + t.settings.themeLight}
                </button>
              }
            />
          </Card>
        </div>

        {/* App */}
        <div>
          <SectionLabel>{t.settings.application}</SectionLabel>
          <Card>
            <Row
              label={t.settings.version}
              sub="QApp Smart University Profile"
              right={<span className="text-[11px] text-[color:var(--color-muted)] font-mono">v0.1.0-beta</span>}
            />
            <Row
              label={t.settings.data}
              sub={t.settings.dataSub}
              right={<span className="text-[11px] text-[color:var(--color-muted)]">Live · Prisma</span>}
            />
            <Row
              label={t.settings.aiEngine}
              sub={t.settings.aiEngineSub}
              right={
                <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 bg-green-50 text-green-700">
                  OpenAI GPT-4o
                </span>
              }
            />
          </Card>
        </div>

        {/* About */}
        <div>
          <SectionLabel>{t.settings.about}</SectionLabel>
          <Card>
            <div className="py-2 space-y-1">
              <p className="text-[13px] font-semibold text-[color:var(--color-text)]">QApp — Smart University Profile</p>
              <p className="text-[12px] text-[color:var(--color-muted)] leading-relaxed">{t.settings.aboutDesc}</p>
              <p className="text-[11px] text-[color:var(--color-muted)] mt-2">{t.settings.aboutBuilt}</p>
            </div>
          </Card>
        </div>

        {/* Session */}
        <div>
          <SectionLabel>{t.settings.session}</SectionLabel>
          <Card>
            <Row
              label={t.settings.signOut}
              sub={t.settings.signOutSub}
              right={
                <button
                  type="button"
                  onClick={() => setShowSignOut(true)}
                  className="h-8 px-4 rounded-xl bg-red-50 text-red-600 text-[12px] font-semibold hover:bg-red-100 transition-colors"
                >
                  {t.settings.signOut}
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
