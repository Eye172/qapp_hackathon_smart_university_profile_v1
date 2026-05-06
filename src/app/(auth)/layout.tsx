import type { ReactNode } from "react";
import { QAppWordmark, WireframeSphere } from "@/components/ui/qapp-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="min-h-screen grid place-items-center px-6 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f0f5ff 0%, #e4ecff 55%, #dce8ff 100%)" }}
    >
      {/* Animated wavy bg pattern */}
      <div className="pointer-events-none absolute inset-0 bg-pattern-waves" aria-hidden />

      {/* Ambient glow blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full animate-pulse-glow"
        aria-hidden
        style={{ background: "radial-gradient(circle, rgba(36,99,235,0.16) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full animate-pulse-glow"
        aria-hidden
        style={{ background: "radial-gradient(circle, rgba(30,58,138,0.12) 0%, transparent 65%)", animationDelay: "2.5s" }}
      />

      {/* Wireframe sphere decoration */}
      <WireframeSphere
        size={280}
        color="#2463eb"
        opacity={0.07}
        className="pointer-events-none absolute -top-10 right-0 animate-spin-slow"
      />

      <div className="relative z-10 w-full flex flex-col items-center gap-7">
        {/* Wordmark */}
        <div className="select-none">
          <QAppWordmark size={38} color="#3AABF5" />
        </div>
        {children}
      </div>
    </main>
  );
}
