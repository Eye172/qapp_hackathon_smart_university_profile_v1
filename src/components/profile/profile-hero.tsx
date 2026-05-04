"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { IUniversityProfile } from "@/lib/types";
import { TagPill } from "@/components/ui/badge";
import { cn } from "@/lib/tailwind-utils";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1800&q=80";

export interface ProfileHeroProps extends React.HTMLAttributes<HTMLElement> {
  university: IUniversityProfile;
}

export const ProfileHero = React.forwardRef<HTMLElement, ProfileHeroProps>(
  function ProfileHero({ university, className, ...props }, ref) {
    const localRef = React.useRef<HTMLElement | null>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLElement);

    const { scrollYProgress } = useScroll({
      target: localRef,
      offset: ["start start", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

    return (
      <header
        ref={localRef}
        className={cn(
          "relative h-[40vh] w-full overflow-visible isolate",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
          <motion.div
            style={{ y, scale }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={university.heroImageUrl ?? FALLBACK_HERO}
              alt={`${university.name} campus hero`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          <div
            className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-black/30"
            aria-hidden
          />
        </div>

        <div
          className={cn(
            "absolute bottom-[-2rem] left-8 right-8",
            "bg-white/90 backdrop-blur-md rounded-2xl p-6",
            "shadow-glass border border-[color:var(--color-border)]",
          )}
          style={{ zIndex: "var(--z-sticky)" }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[length:var(--text-fluid-xs)] uppercase tracking-wider text-[color:var(--color-muted)]">
                {university.country}
                {university.worldRank
                  ? ` · World rank #${university.worldRank}`
                  : ""}
              </p>
              <h1 className="font-display text-[length:var(--text-fluid-3xl)] leading-tight">
                {university.name}
              </h1>
              <p className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                {university.city}, {university.country}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 max-w-md">
              {university.tags.slice(0, 5).map((tag) => (
                <TagPill key={tag} variant="neutral">
                  {tag}
                </TagPill>
              ))}
            </div>
          </div>
        </div>
      </header>
    );
  },
);

ProfileHero.displayName = "ProfileHero";
