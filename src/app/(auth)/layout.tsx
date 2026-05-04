import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen grid place-items-center px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/40 relative overflow-hidden">
      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-indigo-100/30 blur-3xl" />
      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        {/* Wordmark */}
        <div className="select-none">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Q<span className="text-blue-600">App</span>
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
