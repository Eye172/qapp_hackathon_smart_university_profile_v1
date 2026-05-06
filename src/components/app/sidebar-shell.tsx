"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GlassSidebar } from "@/components/shared/sidebar";

const COLLAPSED_W = 64;
const EXPANDED_W = 240;
const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      <GlassSidebar
        expanded={expanded}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      />
      <motion.div
        className="flex-1 min-w-0"
        animate={{ paddingLeft: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={SPRING}
        style={{ willChange: "padding-left" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
