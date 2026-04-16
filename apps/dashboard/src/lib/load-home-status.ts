/**
 * Agrega estado para a home (Server Component).
 * © 2024-2026 PlayLoadX
 */

import "server-only";

import type {
  IPlxTranscribeHealth,
  IPlxTranscribePeersView,
} from "@contracts/plxTranscribeClient";

import { getTranscribeClient } from "@/lib/get-transcribe-client";

export type THomeStatus =
  | {
      readonly ok: true;
      readonly health: IPlxTranscribeHealth;
      readonly peers: IPlxTranscribePeersView;
      readonly peerCount: number;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export async function loadHomeStatus(): Promise<THomeStatus> {
  try {
    const client = getTranscribeClient();
    const health = await client.health();
    const peers = await client.peers();
    const services = peers.services;
    const peerCount = Array.isArray(services) ? services.length : 0;
    return { ok: true, health, peers, peerCount };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Falha ao contactar a API.";
    return { ok: false, message };
  }
}
