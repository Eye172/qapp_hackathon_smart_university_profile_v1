import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SessionProvider } from "@/components/app/session-provider";
import { ThemeApplier } from "@/components/app/theme-applier";
import "./globals.css";
import { cn } from "@/lib/tailwind-utils";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QApp — Study Abroad Intelligence",
  description:
    "AI-driven study abroad guidance, university matching, and application orchestration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geistSans.variable, playfair.variable)}>
      <body
        className={cn(
          "min-h-screen antialiased font-sans",
          "bg-[color:var(--color-bg)] text-[color:var(--color-text)]",
        )}
      >
        <SessionProvider>
          <ThemeApplier />
          {children}
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
