"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useSession, signOut } from "next-auth/react";
import type { AIFitResult } from "@/lib/ai-fit";
import type { IUniversityProfile, StudyLevel } from "@/lib/types";
import { useSessionStore } from "@/store/useSessionStore";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { HorizontalFeedNode } from "@/components/feed/horizontal-feed-node";
import { ProfileHero } from "@/components/profile/profile-hero";
import { AIFitDashboard } from "@/components/profile/ai-fit-dashboard";
import { AIFitSkeleton } from "@/components/profile/ai-fit-skeleton";
import { RequirementRow } from "@/components/profile/requirement-row";
import {
  ContextualSidebar,
  type TimelineMilestone,
} from "@/components/profile/contextual-sidebar";
import { AIChatSheet } from "@/components/shared/ai-chat-sheet";
import { ActionButton } from "@/components/ui/button";
import { cn } from "@/lib/tailwind-utils";

const MILESTONES: TimelineMilestone[] = [
  { id: "ms_1", label: "Profile created", due: "2026-04-01", status: "done" },
  { id: "ms_2", label: "Documents uploaded", due: "2026-04-20", status: "done" },
  { id: "ms_3", label: "AI Fit review", due: "2026-05-08", status: "active" },
  {
    id: "ms_4",
    label: "Submit application",
    due: "2026-06-15",
    status: "upcoming",
  },
  {
    id: "ms_5",
    label: "Decision window",
    due: "2026-08-20",
    status: "upcoming",
  },
];

interface FeedSlideProps {
  university: IUniversityProfile;
  onPick: (id: string) => void;
}

function FeedSlide({ university, onPick }: FeedSlideProps) {
  const { ref, entry } = useInView({
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: "0px -25% 0px -25%",
  });

  const ratio = entry?.intersectionRatio ?? 0;
  const scale = 0.86 + ratio * 0.14;
  const opacity = 0.55 + ratio * 0.45;
  const blur = (1 - ratio) * 4;
  const isCentered = ratio >= 0.85;

  return (
    <motion.div
      ref={ref}
      animate={{ scale, opacity, filter: `blur(${blur.toFixed(1)}px)` }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
      className={cn(
        "snap-center shrink-0 ease-carousel will-change-transform",
        isCentered ? "z-[var(--z-carousel-center)]" : "z-[var(--z-carousel-adjacent)]",
      )}
    >
      <HorizontalFeedNode
        university={university}
        onEnter={onPick}
        isActive={isCentered}
      />
    </motion.div>
  );
}

export function UnifiedShell() {
  const profile = useSessionStore((s) => s.profile);
  const updateProfile = useSessionStore((s) => s.updateProfile);
  const resetProfile = useSessionStore((s) => s.resetProfile);
  const { data: session } = useSession();
  const auth = { isAuthenticated: !!session, email: session?.user?.email ?? null };

  const saved = useAlgorithmStore((s) => s.savedUniversities);
  const hidden = useAlgorithmStore((s) => s.hiddenUniversities);
  const unsaveNode = useAlgorithmStore((s) => s.unsaveNode);
  const unhideNode = useAlgorithmStore((s) => s.unhideNode);
  const resetAlgo = useAlgorithmStore((s) => s.reset);

  const [emailIn, setEmailIn] = React.useState(profile.email);
  const [pwdIn] = React.useState("demo");
  const [interestsStr, setInterestsStr] = React.useState(
    profile.interests.join(", "),
  );

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const detailRef = React.useRef<HTMLElement | null>(null);
  const [universities, setUniversities] = React.useState<IUniversityProfile[]>([]);
  const [feedLoading, setFeedLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/universities")
      .then((r) => (r.ok ? (r.json() as Promise<IUniversityProfile[]>) : []))
      .then((data) => {
        data.sort((a, b) => (b.recommendationScore ?? b.fitScore) - (a.recommendationScore ?? a.fitScore));
        setUniversities(data);
      })
      .catch(() => [])
      .finally(() => setFeedLoading(false));
  }, []);

  const selected = React.useMemo(
    () => (selectedId ? universities.find((u) => u.id === selectedId) ?? null : null),
    [selectedId, universities],
  );

  const visibleFeed = React.useMemo(
    () => universities.filter((u) => !hidden.includes(u.id)),
    [universities, hidden],
  );

  const [fitState, setFitState] = React.useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; data: AIFitResult }
    | { status: "err"; message: string }
  >({ status: "idle" });

  React.useEffect(() => {
    setInterestsStr(profile.interests.join(", "));
  }, [profile.interests]);

  React.useEffect(() => {
    if (!selected) {
      setFitState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setFitState({ status: "loading" });

    void (async () => {
      try {
        const res = await fetch("/api/fit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ university: selected, studentProfile: profile }),
        });
        const data = (await res.json()) as AIFitResult & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setFitState({
            status: "err",
            message: data.error ?? `HTTP ${res.status}`,
          });
          return;
        }
        setFitState({ status: "ok", data });
      } catch (e) {
        if (!cancelled) {
          setFitState({
            status: "err",
            message: e instanceof Error ? e.message : "Request failed",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected, profile]);

  React.useEffect(() => {
    if (selectedId && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedId]);

  function applyProfile(ev: React.FormEvent) {
    ev.preventDefault();
    const ints = interestsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateProfile({
      email: emailIn.trim(),
      interests: ints.length ? ints : profile.interests,
    });
  }

  function quickSignIn() {
    // Redirect to login page
    window.location.href = "/login";
  }

  const docs = profile.documents;
  const verified = docs.filter((d) => d.status === "verified").length;

  return (
    <div className="min-h-screen pb-24">
      <header
        className="sticky top-0 z-[var(--z-sticky)] px-4 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/90 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-[length:var(--text-fluid-xl)]">
            QApp · всё на одном экране
          </h1>
          <div className="flex items-center gap-2">
            <AIChatSheet
              trigger={
                <ActionButton variant="primary" size="sm" type="button">
                  Советник (ИИ)
                </ActionButton>
              }
            />
            {auth.isAuthenticated ? (
              <ActionButton variant="outline" size="sm" type="button" onClick={() => signOut()}>
                Выйти
              </ActionButton>
            ) : (
              <ActionButton variant="outline" size="sm" type="button" onClick={quickSignIn}>
                Войти (демо)
              </ActionButton>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-10">
        <section className="shadow-glass rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-[length:var(--text-fluid-lg)]">
            Профиль (влияет на AI Fit)
          </h2>
          <form
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
            onSubmit={applyProfile}
          >
            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Email
              </span>
              <input
                className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 bg-white/90"
                value={emailIn}
                onChange={(e) => setEmailIn(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Имя
              </span>
              <input
                className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 bg-white/90"
                value={profile.fullName}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                GPA / шкала {profile.gpaScale}
              </span>
              <input
                type="number"
                step="0.01"
                className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 bg-white/90"
                value={profile.gpa}
                onChange={(e) =>
                  updateProfile({ gpa: Number.parseFloat(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                IELTS overall
              </span>
              <input
                type="number"
                step="0.5"
                className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 bg-white/90"
                value={profile.ielts.overall}
                onChange={(e) =>
                  updateProfile({
                    ielts: {
                      ...profile.ielts,
                      overall: Number.parseFloat(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Бюджет USD/год
              </span>
              <input
                type="number"
                className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 bg-white/90"
                value={profile.budgetUsdPerYear ?? ""}
                onChange={(e) =>
                  updateProfile({
                    budgetUsdPerYear:
                      Number.parseInt(e.target.value, 10) || undefined,
                  })
                }
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Интересы (через запятую)
              </span>
              <input
                className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 bg-white/90"
                value={interestsStr}
                onChange={(e) => setInterestsStr(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Уровень учёбы
              </span>
              <select
                className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 bg-white/90"
                value={profile.preferredStudyLevel}
                onChange={(e) =>
                  updateProfile({
                    preferredStudyLevel: e.target.value as StudyLevel,
                  })
                }
              >
                <option value="bachelor">bachelor</option>
                <option value="master">master</option>
                <option value="phd">phd</option>
              </select>
            </label>
            <ActionButton variant="primary" type="submit" className="w-full sm:col-span-2">
              Сохранить в сессию
            </ActionButton>
          </form>
          {!auth.isAuthenticated ? (
            <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Демо-вход: пароль любой («{pwdIn}»), кнопка «Войти (демо)» выше или здесь можно
              обойтись без неё — профиль уже подставляется в ИИ.
            </p>
          ) : (
            <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Вы вошли как {auth.email}
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="shadow-glass rounded-3xl p-4 space-y-2">
            <h3 className="font-display text-[length:var(--text-fluid-base)]">
              Сохранённые ({saved.length})
            </h3>
            {saved.length === 0 ? (
              <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Нажми ✓ на карточке
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {saved.map((id) => {
                  const u = universities.find((x) => x.id === id);
                  if (!u) return null;
                  return (
                    <li key={id}>
                      <ActionButton
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setSelectedId(id)}
                      >
                        {u.name}
                      </ActionButton>
                      <button
                        type="button"
                        className="ml-1 text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] underline"
                        onClick={() => unsaveNode(id)}
                      >
                        убрать
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="shadow-glass rounded-3xl p-4 space-y-2">
            <h3 className="font-display text-[length:var(--text-fluid-base)]">
              Скрытые ({hidden.length})
            </h3>
            {hidden.length === 0 ? (
              <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Скрыть — значок ✕ на карточке
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {hidden.map((id) => {
                  const u = universities.find((x) => x.id === id);
                  return (
                    <li key={id}>
                      <span className="text-[length:var(--text-fluid-sm)]">
                        {u?.name ?? id}
                      </span>{" "}
                      <button
                        type="button"
                        className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-accent)] underline"
                        onClick={() => unhideNode(id)}
                      >
                        вернуть
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-[length:var(--text-fluid-xl)] mb-3">
            Лента вузов
          </h2>
          <p className="text-[color:var(--color-muted)] text-[length:var(--text-fluid-sm)] mb-4">
            Горизонтальный скролл · «Enter» — блок деталей и AI ниже · сохранение и скрытие синхронны
            списками.
          </p>
          <div
            className={cn(
              "flex gap-6 overflow-x-auto snap-x snap-mandatory items-center",
              "px-[calc(50vw-11rem)] py-6 scrollbar-thin scroll-smooth -mx-4",
            )}
          >
            {feedLoading ? (
              <div className="flex gap-6 items-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="shrink-0 h-[68vh] w-[21rem] rounded-[28px] bg-gray-100 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
                ))}
              </div>
            ) : visibleFeed.length === 0 ? (
              <p className="text-[color:var(--color-muted)] mx-auto">
                Все скрыты. Верни из списка «Скрытые» или сброс ниже.
              </p>
            ) : (
              visibleFeed.map((u) => (
                <FeedSlide key={u.id} university={u} onPick={setSelectedId} />
              ))
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            <ActionButton variant="outline" size="sm" type="button" onClick={resetAlgo}>
              Сбросить сохранённые/скрытые
            </ActionButton>
            <ActionButton variant="outline" size="sm" type="button" onClick={resetProfile}>
              Сбросить профиль
            </ActionButton>
          </div>
        </section>

        <section ref={detailRef}>
          {!selected ? (
            <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] p-12 text-center text-[color:var(--color-muted)]">
              Выбери вуз в ленте (кнопка Enter) или из сохранённых — здесь появится профиль вуза,
              программы и AI Fit под твои поля сверху.
            </div>
          ) : (
            <div className="space-y-8">
              <ProfileHero university={selected} />

              <div className="space-y-2">
                {fitState.status === "loading" ? <AIFitSkeleton /> : null}
                {fitState.status === "ok" ? (
                  <div className="space-y-2">
                    <AIFitDashboard
                      score={fitState.data.score}
                      reasons={fitState.data.reasons}
                      gaps={fitState.data.gaps}
                    />
                    <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)] text-right">
                      Источник:{" "}
                      {fitState.data.source === "openai"
                        ? "GPT-4o mini · OpenAI"
                        : "mock / без ключа"}
                    </p>
                  </div>
                ) : null}
                {fitState.status === "err" ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-[length:var(--text-fluid-sm)] text-red-900">
                    {fitState.message}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <section className="space-y-3">
                    <h2 className="font-display text-[length:var(--text-fluid-xl)]">
                      Программы
                    </h2>
                    <ul className="space-y-2">
                      {selected.programs.map((p) => (
                        <li
                          key={p.id}
                          className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-[color:var(--color-border)] bg-white/70 backdrop-blur-md p-4"
                        >
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                              {p.level} · {p.durationMonths} мес · {p.language} ·{" "}
                              {p.deliveryMode}
                            </p>
                          </div>
                          <div className="text-right tabular-nums font-semibold">
                            ${p.tuitionUsdPerYear.toLocaleString()}/год
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h2 className="font-display text-[length:var(--text-fluid-xl)]">
                      Документы
                    </h2>
                    <div className="space-y-2">
                      {docs.map((d) => {
                        const status =
                          d.status === "verified"
                            ? "ready"
                            : d.status === "uploaded"
                              ? "pending_review"
                              : d.status === "rejected"
                                ? "rejected"
                                : "missing";
                        return (
                          <RequirementRow
                            key={d.id}
                            title={d.fileName || `Загрузить ${d.kind}`}
                            status={status}
                            subtext={d.kind}
                          />
                        );
                      })}
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-4">
                  <ContextualSidebar
                    totalRequirements={docs.length}
                    readyRequirements={verified}
                    milestones={MILESTONES}
                    ctaLabel="Дальше в заявке"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
