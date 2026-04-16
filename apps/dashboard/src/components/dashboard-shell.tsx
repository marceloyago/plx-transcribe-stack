/**
 * Shell visual — navegação e marca.
 * © 2024-2026 PlayLoadX
 */

import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

interface IDashboardShellProps {
  readonly children: ReactNode;
}

export function DashboardShell({ children }: IDashboardShellProps): ReactElement {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-white">
              PLX
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.35em] text-violet-200/80">
              Transcribe
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 transition hover:bg-white/5 hover:text-white"
            >
              Painel
            </Link>
            <Link
              href="/jobs/new"
              className="rounded-lg bg-gradient-to-r from-violet-500/90 to-cyan-400/90 px-4 py-1.5 font-medium text-black shadow-lg shadow-violet-500/20 transition hover:brightness-110"
            >
              Nova job
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
