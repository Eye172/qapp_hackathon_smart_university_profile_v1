import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { ProfileHydrator } from "@/components/app/profile-hydrator";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ProfileHydrator />
      <Sidebar />
      {/* Offset content by sidebar width */}
      <div
        className="flex-1 min-w-0"
        style={{ paddingLeft: "var(--sidebar-w)" }}
      >
        {children}
      </div>
    </div>
  );
}
