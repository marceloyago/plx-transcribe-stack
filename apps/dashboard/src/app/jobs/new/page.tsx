/**
 * Nova job de transcrição.
 * © 2024-2026 PlayLoadX
 */

import Link from "next/link";
import type { ReactElement } from "react";

import { JobUploadForm } from "@/components/job-upload-form";

export default function NewJobPage(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-widest text-zinc-500 transition hover:text-zinc-300"
        >
          ← Painel
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
          Nova transcrição
        </h1>
        <p className="mt-2 max-w-lg text-sm text-zinc-400">
          O ficheiro é enviado ao serviço Python via Server Action — a chave API fica só no servidor.
        </p>
      </div>
      <JobUploadForm />
    </div>
  );
}
