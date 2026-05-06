"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        "inline-flex items-center gap-1.5 text-white/85 hover:text-white",
        "text-[length:var(--text-fluid-sm)] transition-colors duration-150",
        className,
      )}
    >
      <ArrowLeft size={16} />
      Back to feed
    </button>
  );
}
