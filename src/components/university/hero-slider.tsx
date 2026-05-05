"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { IUniversityProfile } from "@/lib/types";
import { useSettingsStore } from "@/store/useSettingsStore";
import { localizeUniversity } from "@/lib/i18n";

const FALLBACK =
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1800&q=80";

interface HeroSliderProps {
  university: IUniversityProfile;
}

export function HeroSlider({ university }: HeroSliderProps) {
  const lang = useSettingsStore((s) => s.language);
  const { name: localName } = localizeUniversity(university, lang);
  const photos: string[] = (() => {
    const arr = university.photos ?? [];
    if (arr.length > 0) return arr;
    if (university.heroImageUrl) return [university.heroImageUrl];
    return [FALLBACK];
  })();

  const [current, setCurrent] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused || photos.length <= 1) return;
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % photos.length),
      4500,
    );
    return () => clearInterval(id);
  }, [paused, photos.length]);

  return (
    <section
      className="relative h-[58vh] min-h-[400px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={photos[current] ?? FALLBACK}
            alt={`${university.name} campus`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/22 to-transparent pointer-events-none" />

      {/* Decorative wavy pattern — top right */}
      <svg
        className="absolute top-0 right-0 w-72 h-36 opacity-[0.14] pointer-events-none"
        viewBox="0 0 288 144"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 72 Q36 24 72 72 Q108 120 144 72 Q180 24 216 72 Q252 120 288 72"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0 90 Q36 42 72 90 Q108 138 144 90 Q180 42 216 90 Q252 138 288 90"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0 108 Q36 60 72 108 Q108 156 144 108 Q180 60 216 108 Q252 156 288 108"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Dot / pill indicators */}
      {photos.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={[
                "rounded-full transition-all duration-500",
                i === current
                  ? "w-6 h-2.5 bg-white shadow"
                  : "w-2.5 h-2.5 bg-white/45 hover:bg-white/70",
              ].join(" ")}
            />
          ))}
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-9 md:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto"
        >
          {university.worldRank && (
            <span className="inline-block text-white/65 text-xs uppercase tracking-widest mb-2 font-medium">
              World Rank #{university.worldRank}
            </span>
          )}

          <h1 className="font-display text-white text-4xl md:text-5xl xl:text-6xl leading-tight font-semibold mb-1 drop-shadow-lg">
            {localName}
          </h1>

          {lang === "en" && university.nameRu && (
            <p className="text-white/68 text-base md:text-lg mb-3 font-light tracking-wide">
              {university.nameRu}
            </p>
          )}

          <p className="text-white/80 text-sm md:text-base mb-5 flex flex-wrap gap-x-3 gap-y-1 items-center">
            <span>📍 {university.city}, {university.country}</span>
            {university.founded && (
              <>
                <span className="text-white/35">·</span>
                <span>Est. {university.founded}</span>
              </>
            )}
            {university.type && (
              <>
                <span className="text-white/35">·</span>
                <span>{university.type}</span>
              </>
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            {university.tags.slice(0, 7).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm bg-white/14 text-white border border-white/24 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
