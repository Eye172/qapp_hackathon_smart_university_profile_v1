"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { AIChatSheet } from "@/components/shared/ai-chat-sheet";
import {
  Calendar,
  Compass,
  LogOut,
  Search,
  Settings,
  Sparkles,
  User,
} from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";
import { useSettingsStore, type Language } from "@/store/useSettingsStore";
import { useTranslation } from "@/lib/i18n";

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kz", label: "KZ" },
];

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };
const LABEL_SPRING = { type: "spring" as const, stiffness: 420, damping: 32 };

/* ─── Nav items ──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/feed",     navKey: "feed",      icon: Compass,  matchPaths: ["/feed", "/university"] },
  { href: "/search",   navKey: "search",    icon: Search,   matchPaths: ["/search"] },
  { href: "/timeline", navKey: "deadlines", icon: Calendar, matchPaths: ["/timeline"] },
  { href: "/profile",  navKey: "profile",   icon: User,     matchPaths: ["/profile"] },
] as const;

/* ─── Single nav row ──────────────────────────────────────────────────────── */
function NavRow({
  href,
  label,
  icon: Icon,
  active,
  expanded,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  expanded: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center h-10 rounded-xl overflow-hidden",
        "transition-colors duration-150 select-none",
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
          : "text-gray-500 hover:bg-white/70 hover:text-gray-900",
      )}
      style={{ width: "100%" }}
    >
      {/* Icon — fixed 40px zone */}
      <span className="shrink-0 w-10 flex items-center justify-center">
        <Icon size={17} />
      </span>

      {/* Label — slides in when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={LABEL_SPRING}
            className="text-[13px] font-medium whitespace-nowrap leading-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Active left bar */}
      {active && (
        <motion.span
          layoutId="activeBar"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-white/50"
        />
      )}
    </Link>
  );
}

/* ─── GlassSidebar ───────────────────────────────────────────────────────── */
export interface GlassSidebarProps {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function GlassSidebar({ expanded, onMouseEnter, onMouseLeave }: GlassSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const { language, theme, setLanguage, toggleTheme } = useSettingsStore();
  const t = useTranslation();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <motion.aside
      animate={{ width: expanded ? 240 : 64 }}
      transition={SPRING}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-0 top-0 bottom-0 flex flex-col py-5 overflow-hidden"
      style={{
        zIndex: "var(--z-sidebar)",
        background: "var(--color-surface-glass)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderRight: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sidebar)",
        willChange: "width",
      }}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <Link
        href="/feed"
        className="flex items-center h-10 px-3.5 mb-5 gap-3 select-none"
        aria-label="QApp home"
      >
        <span className="shrink-0 w-[33px] h-[33px] flex items-center justify-center rounded-xl bg-blue-600 text-white text-[15px] font-bold leading-none shadow-md shadow-blue-200">
          Q
        </span>
        <AnimatePresence>
          {expanded && (
            <motion.span
              key="brand-text"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={LABEL_SPRING}
              className="text-[15px] font-bold text-[color:var(--color-text)] whitespace-nowrap"
            >
              App
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, navKey, icon, matchPaths }) => {
          const active = (matchPaths as readonly string[]).some((p) => pathname?.startsWith(p));
          return (
            <NavRow
              key={href}
              href={href}
              label={t.nav[navKey]}
              icon={icon}
              active={active}
              expanded={expanded}
            />
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-blue-50" />

      {/* AI Advisor */}
      <div className="px-3">
        <AIChatSheet
          trigger={
            <button
              type="button"
              className={cn(
                "flex items-center h-10 w-full rounded-xl overflow-hidden",
                "bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150",
              )}
            >
              <span className="shrink-0 w-10 flex items-center justify-center">
                <Sparkles size={17} />
              </span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    key="ai-label"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={LABEL_SPRING}
                    className="text-[13px] font-medium whitespace-nowrap leading-none"
                  >
                    AI Advisor
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          }
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom controls */}
      <div className="flex flex-col gap-1 px-3">

        {/* Lang + Theme — only when expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="lang-theme"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Language chips */}
              <div className="flex gap-1 px-1 mb-1">
                {LANGS.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={cn(
                      "flex-1 text-[10px] font-bold rounded-lg py-1.5 transition-all",
                      language === code
                        ? "bg-[color:var(--color-accent)] text-white"
                        : "text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center h-9 w-full rounded-xl px-3 gap-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-accent)]/10 hover:text-[color:var(--color-accent)] transition-colors duration-150 mb-1"
              >
                <span className="text-[15px]">{theme === "dark" ? "🌙" : "☀️"}</span>
                <span className="text-[12px] font-medium whitespace-nowrap">
                  {theme === "dark" ? t.settings.themeDark : t.settings.themeLight}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center h-10 rounded-xl overflow-hidden",
            "text-[color:var(--color-muted)] hover:bg-[color:var(--color-accent)]/10 hover:text-[color:var(--color-text)] transition-colors duration-150",
            pathname?.startsWith("/settings") && "bg-[color:var(--color-accent)] text-white",
          )}
        >
          <span className="shrink-0 w-10 flex items-center justify-center">
            <Settings size={17} />
          </span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="settings-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={LABEL_SPRING}
                className="text-[13px] font-medium whitespace-nowrap leading-none"
              >
                {t.settings.title}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Sign out */}
        {status === "authenticated" && (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center h-10 w-full rounded-xl overflow-hidden text-[color:var(--color-muted)] hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <span className="shrink-0 w-10 flex items-center justify-center">
              <LogOut size={17} />
            </span>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  key="logout-label"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={LABEL_SPRING}
                  className="text-[13px] font-medium whitespace-nowrap leading-none"
                >
                  {t.settings.signOut}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.aside>
  );
}

/* ─── Legacy export kept for compatibility ───────────────────────────────── */
export { GlassSidebar as Sidebar };
