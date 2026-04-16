/**
 * Detalhe de uma job (Server Component, sem polling).
 * © 2024-2026 PlayLoadX
 */

import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

import { EJobStatus } from "@contracts/transcription.types";

import { getTranscribeClient } from "@/lib/get-transcribe-client";

export const dynamic = "force-dynamic";

interface IJobPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function JobDetailPage({
  params,
}: IJobPageProps): Promise<ReactElement> {
  const { id } = await params;
  let body: ReactNode;
  try {
    const client = getTranscribeClient();
    const job = await client.getJob(id);
    body = (
      <div className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200">
            {job.status}
          </span>
          {job.status === EJobStatus.Done ? (
            <span className="text-xs text-emerald-400">Concluída</span>
          ) : null}
        </div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Tenant</dt>
            <dd className="font-mono text-zinc-200">{job.tenantId}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Modo</dt>
            <dd className="text-zinc-200">{job.mode}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Ficheiro</dt>
            <dd className="truncate text-zinc-200">{job.sourceFilename}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Atualizado</dt>
            <dd className="text-xs text-zinc-400">{job.updatedAtIso}</dd>
          </div>
        </dl>
        {job.fullText ? (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Texto
            </h2>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-black/40 p-4 text-sm leading-relaxed text-zinc-200">
              {job.fullText}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Ainda sem texto final — recarrega a página para ver o estado atualizado.
          </p>
        )}
      </div>
    );
  } catch {
    body = (
      <p className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-6 text-sm text-rose-100">
        Não foi possível carregar esta job (id inválido ou API indisponível).
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/jobs/new"
          className="text-xs font-medium uppercase tracking-widest text-zinc-500 transition hover:text-zinc-300"
        >
          ← Nova job
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Job{" "}
          <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
            {id.slice(0, 8)}…
          </span>
        </h1>
      </div>
      {body}
    </div>
  );
}
