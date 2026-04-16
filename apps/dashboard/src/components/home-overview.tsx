/**
 * Conteúdo da home — métricas e estado da API.
 * © 2024-2026 PlayLoadX
 */

import Link from "next/link";
import type { ReactElement } from "react";

import type { THomeStatus } from "@/lib/load-home-status";

interface IHomeOverviewProps {
  readonly status: THomeStatus;
}

export function HomeOverview({ status }: IHomeOverviewProps): ReactElement {
  if (!status.ok) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-8 backdrop-blur-xl">
        <p className="font-[family-name:var(--font-display)] text-lg text-rose-100">
          API offline ou mal configurada
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-rose-200/80">
          {status.message} — confirma que o serviço Python está a correr e que{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-rose-100">
            PLX_TRANSCRIBE_API_URL
          </code>{" "}
          no{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">apps/dashboard/.env.local</code>{" "}
          aponta para o host certo.
        </p>
      </div>
    );
  }

  const { health, peerCount } = status;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-10 shadow-2xl shadow-violet-900/20 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-violet-200/90">
          Estado em tempo real
        </p>
        <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
          Operações de transcrição com presença de produto.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
          Painel comercial mínimo ligado à API canónica PlayLoadX — Whisper real, peers e jobs.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/jobs/new"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Enviar áudio
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Serviço"
          value={health.service}
          accent="violet"
        />
        <MetricCard
          label="Whisper pronto"
          value={health.whisperReady ? "Sim" : "Lazy / não"}
          accent="cyan"
        />
        <MetricCard
          label="Gate humano"
          value={health.humanGateEnabled ? "Ativo" : "Off"}
          accent="violet"
        />
        <MetricCard
          label="Peers registry"
          value={String(peerCount)}
          accent="cyan"
        />
      </section>
    </div>
  );
}

interface IMetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly accent: "violet" | "cyan";
}

function MetricCard({
  label,
  value,
  accent,
}: IMetricCardProps): ReactElement {
  const bar =
    accent === "violet"
      ? "from-violet-500 to-fuchsia-500"
      : "from-cyan-400 to-emerald-400";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition hover:border-white/20">
      <div
        className={`absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r opacity-80 ${bar}`}
      />
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-mono)] text-sm font-medium text-zinc-100">
        {value}
      </p>
    </div>
  );
}
