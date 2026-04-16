/**
 * Server Actions — transcrição via API Python.
 * © 2024-2026 PlayLoadX
 */

"use server";

import { redirect } from "next/navigation";

import { ETranscribeMode } from "@contracts/transcription.types";

import { getTranscribeClient } from "@/lib/get-transcribe-client";

export type TCreateJobFormState =
  | { readonly status: "idle" }
  | { readonly status: "error"; readonly message: string };

export const INITIAL_JOB_FORM_STATE: TCreateJobFormState = {
  status: "idle",
};

function parseMode(value: FormDataEntryValue | null): ETranscribeMode {
  const raw = typeof value === "string" ? value : "";
  if (raw === ETranscribeMode.Cheetah) {
    return ETranscribeMode.Cheetah;
  }
  if (raw === ETranscribeMode.Whale) {
    return ETranscribeMode.Whale;
  }
  return ETranscribeMode.Dolphin;
}

export async function createTranscriptionJobAction(
  _prevState: TCreateJobFormState | undefined,
  formData: FormData,
): Promise<TCreateJobFormState> {
  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Seleciona um ficheiro de áudio ou vídeo." };
  }
  const audioLanguageRaw = formData.get("audio_language");
  const audioLanguage =
    typeof audioLanguageRaw === "string" && audioLanguageRaw.trim() !== ""
      ? audioLanguageRaw.trim()
      : "pt";
  const mode = parseMode(formData.get("mode"));
  let jobId: string;
  try {
    const client = getTranscribeClient();
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], {
      type: file.type && file.type.length > 0 ? file.type : "application/octet-stream",
    });
    const job = await client.createJob({
      file: blob,
      filename: file.name,
      audioLanguage,
      mode,
    });
    jobId = job.id;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar job.";
    return { status: "error", message };
  }
  redirect(`/jobs/${jobId}`);
}
