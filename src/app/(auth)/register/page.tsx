"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { QAppWordmark } from "@/components/ui/qapp-logo";

import { StepIndicator, type Step } from "@/components/registration/step-indicator";
import { StepAccount } from "@/components/registration/step-account";
import { StepTags } from "@/components/registration/step-tags";
import { StepPriorities } from "@/components/registration/step-priorities";
import type { UserPreferenceData } from "@/lib/preference-categories";

/* ── Constants ───────────────────────────────────────────────────── */

const STEPS: Step[] = [
  { number: 1, label: "Account" },
  { number: 2, label: "Preferences" },
  { number: 3, label: "Priorities" },
];

/* ── Page ────────────────────────────────────────────────────────── */

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Step 1 — loading / error state
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Step 2 / 3 — preferences (populated after account creation + sign-in)
  const [preferences, setPreferences] = useState<UserPreferenceData[]>([]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Step 3 — saving
  const [savingPriorities, setSavingPriorities] = useState(false);

  /* ── Fetch preferences (called after successful login in step 1) ── */
  const loadPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/preferences");
      if (!res.ok) return;
      const data = (await res.json()) as UserPreferenceData[];
      setPreferences(data);
      setPrefsLoaded(true);
    } catch {
      // silently fail
    }
  }, []);

  /* ── Step 1: create account + auto sign-in ──────────────────────── */
  async function handleAccountNext(data: {
    name: string;
    email: string;
    password: string;
  }) {
    setAccountLoading(true);
    setAccountError(null);

    try {
      // 1. Register
      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const regBody = (await regRes.json()) as { error?: string };
      if (!regRes.ok) {
        setAccountError(regBody.error ?? "Registration failed.");
        setAccountLoading(false);
        return;
      }

      // 2. Sign in
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInResult?.error) {
        setAccountError("Account created but sign-in failed. Please log in manually.");
        setAccountLoading(false);
        return;
      }

      // 3. Load default preferences
      await loadPreferences();

      // 4. Advance
      setDirection(1);
      setStep(2);
    } catch {
      setAccountError("An unexpected error occurred. Please try again.");
    } finally {
      setAccountLoading(false);
    }
  }

  /* ── Step 2 helpers: add / delete preference values ─────────────── */
  async function handleAddValue(
    categoryKey: string,
    value: string,
  ): Promise<{ id: string; value: string } | null> {
    try {
      const res = await fetch(`/api/preferences/${categoryKey}/values`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) return null;
      const created = (await res.json()) as { id: string; value: string };

      // Re-fetch to get authoritative state (handles maxValues=1 replace)
      await refreshPrefs();
      return created;
    } catch {
      return null;
    }
  }

  async function handleDeleteValue(categoryKey: string, valueId: string) {
    // Optimistic removal
    setPreferences((prev) =>
      prev.map((p) =>
        p.categoryKey === categoryKey
          ? { ...p, values: p.values.filter((v) => v.id !== valueId) }
          : p,
      ),
    );
    try {
      await fetch(`/api/preferences/${categoryKey}/values/${valueId}`, {
        method: "DELETE",
      });
    } catch {
      await refreshPrefs();
    }
  }

  async function refreshPrefs() {
    try {
      const res = await fetch("/api/preferences");
      if (!res.ok) return;
      const data = (await res.json()) as UserPreferenceData[];
      setPreferences(data);
    } catch { /* ignore */ }
  }

  /* ── Step 3: save priorities + finish ──────────────────────────── */
  async function handlePrioritiesNext(rawPriorities: Record<string, number>) {
    setSavingPriorities(true);
    try {
      const updates = Object.entries(rawPriorities).map(([categoryKey, priority]) => ({
        categoryKey,
        priority,
      }));
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
    } catch { /* fire-and-forget */ }
    setSavingPriorities(false);
    router.push("/feed");
  }

  /* ── Auto-load prefs when reaching step 2 (e.g. HMR back nav) ──── */
  useEffect(() => {
    if (step >= 2 && !prefsLoaded) {
      loadPreferences();
    }
  }, [step, prefsLoaded, loadPreferences]);

  /* ── Slide variants ─────────────────────────────────────────────── */
  const variants = {
    enter: { x: direction * 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: direction * -40, opacity: 0 },
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-md flex flex-col gap-8">
        {/* Wordmark */}
        <div className="text-center flex flex-col items-center gap-2">
          <QAppWordmark size={34} color="#3AABF5" />
          <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>
            {step === 1
              ? "Create your account"
              : step === 2
                ? "Tell us what matters to you"
                : "How important is each preference?"}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7 flex flex-col gap-6"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(28px) saturate(180%)",
            border: "1px solid rgba(36,99,235,0.14)",
            boxShadow: "0 8px 48px rgba(36,99,235,0.10), 0 24px 80px rgba(6,14,40,0.08), inset 0 1px 0 rgba(255,255,255,0.90)",
          }}
        >
          {/* Step indicator */}
          <StepIndicator steps={STEPS} current={step} />

          {/* Animated step content */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {step === 1 && (
                  <StepAccount
                    onNext={handleAccountNext}
                    loading={accountLoading}
                    error={accountError}
                  />
                )}

                {step === 2 && (
                  <StepTags
                    preferences={preferences}
                    onUpdate={() => { /* handled via refreshPrefs */ }}
                    onAddValue={handleAddValue}
                    onDeleteValue={handleDeleteValue}
                    onNext={() => { setDirection(1); setStep(3); }}
                    onBack={() => { setDirection(-1); setStep(1); }}
                  />
                )}

                {step === 3 && (
                  <StepPriorities
                    preferences={preferences}
                    onNext={handlePrioritiesNext}
                    onBack={() => { setDirection(-1); setStep(2); }}
                    loading={savingPriorities}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer link — only on step 1 */}
        {step === 1 && (
          <p className="text-center text-[12px] text-[color:var(--color-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[color:var(--color-accent)] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        )}
    </div>
  );
}
