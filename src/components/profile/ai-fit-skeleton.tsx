import { cn } from "@/lib/tailwind-utils";

export interface AIFitSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  ringSize?: number;
}

export function AIFitSkeleton({
  className,
  ringSize = 160,
  ...props
}: AIFitSkeletonProps) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-3xl shadow-sm",
        "border border-[color:var(--color-border)]",
        "animate-pulse",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
      {...props}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className="rounded-full bg-gray-200"
          style={{ width: ringSize, height: ringSize }}
        />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>

      <div className="space-y-3">
        <div className="h-5 w-32 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-11/12 rounded bg-gray-200" />
          <div className="h-3 w-10/12 rounded bg-gray-200" />
          <div className="h-3 w-8/12 rounded bg-gray-200" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-9/12 rounded bg-gray-200" />
          <div className="h-3 w-7/12 rounded bg-gray-200" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-5 w-32 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-10/12 rounded bg-gray-200" />
          <div className="h-3 w-9/12 rounded bg-gray-200" />
          <div className="h-3 w-7/12 rounded bg-gray-200" />
        </div>
      </div>
    </section>
  );
}
