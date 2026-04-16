/**
 * Raiz do dashboard PlayLoadX Transcribe.
 * © 2024-2026 PlayLoadX
 */

import type { Metadata } from "next";
import { DM_Sans, Syne, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { AmbientBackground } from "@/components/ambient-background";
import { DashboardShell } from "@/components/dashboard-shell";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PLX Transcribe — Painel",
  description:
    "Dashboard comercial PlayLoadX para operações de transcrição (API Python).",
};

interface IRootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: IRootLayoutProps): ReactNode {
  return (
    <html lang="pt-BR">
      <body
        className={`${syne.variable} ${dmSans.variable} ${geistMono.variable} font-[family-name:var(--font-body)] antialiased`}
      >
        <AmbientBackground />
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
