/**
 * Formulário de upload — Server Action + useActionState.
 * © 2024-2026 PlayLoadX
 */

"use client";

import { useActionState } from "react";
import type { ReactElement } from "react";

import { ETranscribeMode } from "@contracts/transcription.types";

import {
  INITIAL_JOB_FORM_STATE,
  createTranscriptionJobAction,
  type TCreateJobFormState,
} from "@/app/actions/transcribe-actions";

function errorMessage(state: TCreateJobFormState | undefined): string | null {
  if (!state || state.status !== "error") {
    return null;
  }
  return state.message;
}

export function JobUploadForm(): ReactElement {
  const [state, formAction, isPending] = useActionState(
    createTranscriptionJobAction,
    INITIAL_JOB_FORM_STATE,
  );
  const err = errorMessage(state);

  return (
    <form action={formAction} className="space-y-8">
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-10 text-center backdrop-blur-md transition hover:border-violet-400/40">
        <label htmlFor="file" className="cursor-pointer text-sm text-zinc-300">
          <span className="font-medium text-white">Arrasta ou escolhe</span> um ficheiro
          de áudio ou vídeo
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept="audio/*,video/*,.wav,.mp3,.m4a,.webm,.mp4,.mov"
          className="mt-6 block w-full cursor-pointer text-sm text-zinc-400 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-400"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="audio_language"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Idioma do áudio
          </label>
          <input
            id="audio_language"
            name="audio_language"
            type="text"
            defaultValue="pt"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-violet-500/50 transition focus:ring-2"
          />
        </div>
        <div>
          <label
            htmlFor="mode"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Modo
          </label>
          <select
            id="mode"
            name="mode"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-violet-500/50 transition focus:ring-2"
          >
            <option value={ETranscribeMode.Cheetah}>Cheetah (rápido)</option>
            <option value={ETranscribeMode.Dolphin}>Dolphin (equilíbrio)</option>
            <option value={ETranscribeMode.Whale}>Whale (máx. qualidade)</option>
          </select>
        </div>
      </div>

      {err ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-sm text-rose-100"
        >
          {err}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-lg shadow-violet-600/30 transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "A enviar…" : "Iniciar transcrição"}
      </button>
    </form>
  );
}
