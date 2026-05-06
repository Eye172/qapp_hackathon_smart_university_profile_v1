import type { ReactNode } from "react";
import { ProfileHydrator } from "@/components/app/profile-hydrator";
import { SidebarShell } from "@/components/app/sidebar-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProfileHydrator />
      <SidebarShell>{children}</SidebarShell>
    </>
  );
}
