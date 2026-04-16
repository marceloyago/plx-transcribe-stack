/**
 * Servidor HTTP Node (MVP API Fase 1).
 * © 2024-2026 PlayLoadX
 */

import { serve } from '@hono/node-server';
import { createTranscriptionApiApp } from './app.js';
import { MemoryJobStore } from './memory-job-store.js';

const jobStore = new MemoryJobStore();
const rawDelay = Number(process.env.PLX_STUB_PIPELINE_MS ?? '15');
const stubPipelineDelayMs = Number.isFinite(rawDelay) && rawDelay >= 0 ? rawDelay : 15;
const port = Number(process.env.PORT ?? '3044');

const app = createTranscriptionApiApp({ jobStore, stubPipelineDelayMs });

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`[plx-transcribe-api] http://127.0.0.1:${info.port} (stub pipeline ${stubPipelineDelayMs}ms)`);
  },
);
