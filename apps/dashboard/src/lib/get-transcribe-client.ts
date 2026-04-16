/**
 * Cliente server-side para API Python (chave nunca exposta ao browser).
 * © 2024-2026 PlayLoadX
 */

import "server-only";

import {
  createPlxTranscribeClient,
  type IPlxTranscribeClient,
} from "@contracts/plxTranscribeClient";

export function getTranscribeClient(): IPlxTranscribeClient {
  const baseUrl = process.env.PLX_TRANSCRIBE_API_URL?.trim();
  if (!baseUrl) {
    throw new Error(
      "Define PLX_TRANSCRIBE_API_URL no .env.local (ex.: http://127.0.0.1:3055).",
    );
  }
  const apiKey = process.env.PLX_TRANSCRIBE_API_KEY?.trim();
  return createPlxTranscribeClient({
    baseUrl,
    apiKey: apiKey ? apiKey : undefined,
    tenantId: process.env.PLX_TRANSCRIBE_TENANT_ID?.trim() || undefined,
  });
}
