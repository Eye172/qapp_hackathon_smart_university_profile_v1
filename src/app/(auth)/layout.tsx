import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen grid place-items-center px-6 py-12">
      {children}
    </main>
  );
}
