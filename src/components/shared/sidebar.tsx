"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AIChatSheet } from "@/components/shared/ai-chat-sheet";
import {
  Compass,
  User,
  Sparkles,
  LogOut,
} from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";

/* ─── Tooltip wrapper ───────────────────────────────────────────────────── */
function Tip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <span
        className={cn(
          "pointer-events-none absolute left-[calc(100%+10px)]",
          "rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap",
          "bg-[color:var(--color-text)] text-white",
          "opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0",
          "transition-all duration-200 ease-out",
          "shadow-md",
        )}
        style={{ zIndex: "var(--z-modal)" }}
      >
        {label}
        {/* Arrow */}
        <span className="absolute -left-[5px] top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[color:var(--color-text)]" />
      </span>
    </div>
  );
}

/* ─── Nav link item ──────────────────────────────────────────────────────── */
function SidebarLink({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Tip label={label}>
      <Link
        href={href}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          "transition-all duration-200 ease-out",
          active
            ? "bg-[color:var(--color-accent)] text-white shadow-md"
            : "text-[color:var(--color-muted)] hover:bg-white/60 hover:text-[color:var(--color-text)]",
        )}
        aria-current={active ? "page" : undefined}
      >
        {icon}
      </Link>
    </Tip>
  );
}

/* ─── Button item (no href) ─────────────────────────────────────────────── */
function SidebarButton({
  label,
  icon,
  onClick,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Tip label={label}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          "transition-all duration-200 ease-out",
          "text-[color:var(--color-muted)] hover:bg-white/60 hover:text-[color:var(--color-text)]",
          className,
        )}
      >
        {icon}
      </button>
    </Tip>
  );
}

/* ─── Main Sidebar ───────────────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 glass-sidebar flex flex-col items-center py-5 gap-2"
      style={{ width: "var(--sidebar-w)", zIndex: "var(--z-sidebar)" }}
      aria-label="Main navigation"
    >
      {/* Brand mark */}
      <Link
        href="/feed"
        className={cn(
          "mb-4 font-display text-xl leading-none",
          "text-[color:var(--color-accent)] hover:opacity-80 transition-opacity",
        )}
        aria-label="QApp home"
      >
        Q
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col items-center gap-1.5 w-full px-3">
        <SidebarLink
          href="/feed"
          label="Discover"
          icon={<Compass size={18} />}
          active={!!pathname?.startsWith("/feed") || !!pathname?.startsWith("/university")}
        />
        <SidebarLink
          href="/profile"
          label="Profile"
          icon={<User size={18} />}
          active={!!pathname?.startsWith("/profile")}
        />
      </nav>

      {/* Divider */}
      <div className="w-7 border-t border-[color:var(--color-border)] my-1" />

      {/* AI Advisor chat */}
      <AIChatSheet
        trigger={
          <Tip label="AI Advisor">
            <button
              type="button"
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                "transition-all duration-200 ease-out",
                "bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]",
                "hover:bg-[color:var(--color-accent)] hover:text-white",
              )}
            >
              <Sparkles size={18} />
            </button>
          </Tip>
        }
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sign out */}
      {status === "authenticated" && (
        <SidebarButton
          label="Sign out"
          icon={<LogOut size={18} />}
          onClick={handleSignOut}
          className="hover:bg-red-50 hover:text-red-600"
        />
      )}
    </aside>
  );
}
