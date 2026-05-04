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

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };
const LABEL_SPRING = { type: "spring" as const, stiffness: 420, damping: 32 };

/* ─── Nav items ──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/feed",     label: "Discover",  icon: Compass,  matchPaths: ["/feed", "/university"] },
  { href: "/search",   label: "Search",    icon: Search,   matchPaths: ["/search"] },
  { href: "/timeline", label: "Deadlines", icon: Calendar, matchPaths: ["/timeline"] },
  { href: "/profile",  label: "Profile",   icon: User,     matchPaths: ["/profile"] },
];

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
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderRight: "1px solid rgba(37,99,235,0.08)",
        boxShadow: "4px 0 24px -8px rgba(15,23,42,0.07)",
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
              className="text-[15px] font-bold text-gray-900 whitespace-nowrap"
            >
              App
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon, matchPaths }) => {
          const active = matchPaths.some((p) => pathname?.startsWith(p));
          return (
            <NavRow
              key={href}
              href={href}
              label={label}
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
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center h-10 rounded-xl overflow-hidden",
            "text-gray-500 hover:bg-white/70 hover:text-gray-900 transition-colors duration-150",
            pathname?.startsWith("/settings") && "bg-blue-600 text-white",
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
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Sign out */}
        {status === "authenticated" && (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center h-10 w-full rounded-xl overflow-hidden text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
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
                  Sign out
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
