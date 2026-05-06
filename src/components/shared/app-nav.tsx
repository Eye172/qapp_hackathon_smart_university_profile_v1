"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ActionButton } from "@/components/ui/button";
import { AIChatSheet } from "@/components/shared/ai-chat-sheet";
import { cn } from "@/lib/tailwind-utils";

const NAV_ITEMS = [
  { href: "/feed", label: "Discover" },
  { href: "/profile", label: "Profile" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="fixed inset-x-0 top-0 px-6 py-4"
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <div
        className={cn(
          "max-w-6xl mx-auto flex items-center justify-between gap-4",
          "rounded-full px-4 py-2 shadow-glass",
        )}
      >
        <Link
          href="/feed"
          className="font-display text-[length:var(--text-fluid-lg)]"
        >
          QApp
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[length:var(--text-fluid-sm)] ease-snappy",
                  active
                    ? "bg-[color:var(--color-accent)] text-white"
                    : "text-[color:var(--color-muted)] hover:text-[#2A2626]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {status === "authenticated" && session?.user ? (
            <span className="hidden md:block text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] truncate max-w-[140px]">
              {session.user.name ?? session.user.email}
            </span>
          ) : null}

          <AIChatSheet
            trigger={
              <ActionButton variant="primary" size="sm">
                Ask Advisor
              </ActionButton>
            }
          />

          {status === "authenticated" ? (
            <ActionButton
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign out
            </ActionButton>
          ) : null}
        </div>
      </div>
    </header>
  );
}
