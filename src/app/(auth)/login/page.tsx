"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ActionButton } from "@/components/ui/button";
import { cn } from "@/lib/tailwind-utils";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(
          result?.error === "CredentialsSignin"
            ? "Incorrect email or password."
            : result?.error ?? "Sign-in failed. Please try again.",
        );
        setSubmitting(false);
        return;
      }

      router.replace("/feed");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section
      className={cn(
        "w-full max-w-md p-8 rounded-3xl shadow-glass",
        "bg-white/85 backdrop-blur-md border border-[color:var(--color-border)]",
        "space-y-6",
      )}
    >
      <header className="space-y-1 text-center">
        <h1 className="font-display text-[length:var(--text-fluid-2xl)]">
          Welcome back
        </h1>
        <p className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
          Sign in to QApp
        </p>
      </header>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "mt-1 w-full rounded-2xl border border-[color:var(--color-border)]",
              "bg-white/80 px-4 py-2.5 text-[length:var(--text-fluid-sm)] outline-none",
              "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
            )}
          />
        </label>

        <label className="block">
          <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "mt-1 w-full rounded-2xl border border-[color:var(--color-border)]",
              "bg-white/80 px-4 py-2.5 text-[length:var(--text-fluid-sm)] outline-none",
              "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
            )}
          />
        </label>

        {error ? (
          <p className="text-red-600 text-[length:var(--text-fluid-xs)]">
            {error}
          </p>
        ) : null}

        <ActionButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </ActionButton>
      </form>

      <p className="text-center text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[color:var(--color-accent)] underline"
        >
          Create one
        </Link>
      </p>

      <p className="text-center text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] opacity-60">
        Demo: aliya@qapp.kz / password123
      </p>
    </section>
  );
}
