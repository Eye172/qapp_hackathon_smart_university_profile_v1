"use client";

// Runs once on mount inside the (app) layout.
// Fetches the authenticated user's real profile + saved/hidden universities
// and hydrates the Zustand stores so every page gets live data.

import * as React from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/store/useSessionStore";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import type { IStudentProfile } from "@/lib/types";

export function ProfileHydrator() {
  const { status } = useSession();
  const hydrateProfile = useSessionStore((s) => s.hydrateFromServer);
  const profileLoaded = useSessionStore((s) => s.profileLoaded);
  const hydrateAlgo = useAlgorithmStore((s) => s.hydrateFromServer);
  const synced = useAlgorithmStore((s) => s.synced);

  React.useEffect(() => {
    if (status !== "authenticated") return;

    // Load profile
    if (!profileLoaded) {
      fetch("/api/profile")
        .then((r) => (r.ok ? (r.json() as Promise<IStudentProfile>) : null))
        .then((p) => {
          if (p) hydrateProfile(p);
        })
        .catch(() => null);
    }

    // Load saved / hidden universities
    if (!synced) {
      fetch("/api/universities")
        .then((r) =>
          r.ok
            ? (r.json() as Promise<
                { id: string; userStatus?: "saved" | "hidden" | null }[]
              >)
            : null,
        )
        .then((unis) => {
          if (!unis) return;
          const saved = unis
            .filter((u) => u.userStatus === "saved")
            .map((u) => u.id);
          const hidden = unis
            .filter((u) => u.userStatus === "hidden")
            .map((u) => u.id);
          hydrateAlgo(saved, hidden);
        })
        .catch(() => null);
    }
  }, [status, profileLoaded, synced, hydrateProfile, hydrateAlgo]);

  return null; // purely side-effectful
}
