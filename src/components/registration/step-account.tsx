"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";

interface StepAccountProps {
  onNext: (data: { name: string; email: string; password: string }) => void;
  loading?: boolean;
  error?: string | null;
}

const inputBase =
  "w-full bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl px-4 py-3 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)]/50 focus:outline-none focus:border-[color:var(--color-accent)] transition-colors duration-200";

export function StepAccount({ onNext, loading, error }: StepAccountProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setLocalError("Name is required."); return; }
    if (!email.trim() || !email.includes("@")) { setLocalError("Valid email is required."); return; }
    if (password.length < 8) { setLocalError("Password must be at least 8 characters."); return; }
    setLocalError(null);
    onNext({ name: name.trim(), email: email.trim(), password });
  }

  const displayError = error ?? localError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col gap-6"
    >
      {/* Social buttons */}
      <div className="flex flex-col gap-2.5">
        {[
          { id: "google", label: "Continue with Google", icon: GoogleIcon },
          { id: "apple",  label: "Continue with Apple",  icon: AppleIcon  },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            disabled
            title="Coming soon"
            className={cn(
              "flex items-center justify-center gap-2.5 w-full rounded-xl border border-[color:var(--color-border)]",
              "py-3 text-sm font-medium text-[color:var(--color-muted)] bg-[color:var(--color-surface)]",
              "cursor-not-allowed opacity-60 select-none",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            <span className="ml-auto text-[10px] font-normal opacity-60 mr-1">Soon</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[color:var(--color-border)]" />
        <span className="text-[11px] text-[color:var(--color-muted)]/60 font-medium">or</span>
        <div className="flex-1 h-px bg-[color:var(--color-border)]" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <input
          className={inputBase}
          type="text"
          placeholder="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <input
          className={inputBase}
          type="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          className={inputBase}
          type="password"
          placeholder="Password (min 8 characters)"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {displayError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500"
          >
            {displayError}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "mt-1 w-full rounded-xl py-3 text-sm font-semibold",
            "bg-[color:var(--color-accent)] text-white",
            "hover:opacity-90 transition-opacity duration-200",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          {loading ? "Creating account…" : "Create account →"}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ── Inline SVG icons ───────────────────────────────────────────── */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.98 9.055c-.02-2.062 1.683-3.062 1.758-3.108-1.158-1.616-2.882-1.836-3.498-1.856-1.479-.15-2.9.878-3.652.878-.763 0-1.92-.86-3.163-.836C1.703 4.16.411 5.103-.267 6.5c-1.376 2.385-.352 5.912.97 7.846.65.94 1.416 1.987 2.422 1.95.976-.04 1.343-.625 2.521-.625 1.168 0 1.503.625 2.52.606 1.053-.018 1.714-.945 2.352-1.893.75-1.08 1.056-2.142 1.07-2.197-.023-.01-2.046-.783-2.067-3.132ZM9.496 2.66C10.019 2.03 10.374 1.159 10.276.28c-.753.032-1.672.503-2.213 1.124-.484.555-.913 1.45-.797 2.305.837.064 1.692-.426 2.23-1.05Z"/>
    </svg>
  );
}
