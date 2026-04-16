/**
 * Pipeline stub até integrar Whisper / workers.
 * © 2024-2026 PlayLoadX
 */

import type { MemoryJobStore } from './memory-job-store.js';
import { EJobStatus } from '../../../contracts/transcription.types.js';

export async function runStubPipeline(jobId: string, store: MemoryJobStore, delayMs: number): Promise<void> {
  const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
  const step = async (status: EJobStatus): Promise<void> => {
    if (delayMs > 0) {
      await sleep(delayMs);
    }
    store.patch(jobId, { status });
  };

  await step(EJobStatus.Preprocessing);
  await step(EJobStatus.Transcribing);
  await step(EJobStatus.PostProcessing);
  store.patch(jobId, {
    status: EJobStatus.Done,
    fullText: '[stub PLX] Whisper/worker ainda não ligado — job concluída para testes de API.',
    segments: [{ startSec: 0, endSec: 0.5, text: '[stub PLX]' }],
  });
}
