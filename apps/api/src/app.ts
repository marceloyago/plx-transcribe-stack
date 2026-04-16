/**
 * App HTTP Hono — rotas v1 jobs.
 * © 2024-2026 PlayLoadX
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ICreateTranscriptionJobInput } from '../../../contracts/transcription.types.js';
import { EJobStatus } from '../../../contracts/transcription.types.js';
import type { MemoryJobStore } from './memory-job-store.js';
import { zCreateTranscriptionJobBody } from './schemas.js';
import { runStubPipeline } from './job-pipeline-stub.js';

export interface ICreateAppOptions {
  readonly jobStore: MemoryJobStore;
  /** Atraso entre estados stub (0 = avanço o mais rápido possível). */
  readonly stubPipelineDelayMs: number;
}

export function createTranscriptionApiApp(options: ICreateAppOptions): Hono {
  const app = new Hono();
  app.use('/*', cors());

  app.get('/health', (c) => c.json({ ok: true, service: 'plx-transcribe-api' }));

  app.post('/v1/jobs', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: { code: 'INVALID_JSON', message: 'Corpo JSON inválido.' } }, 400);
    }
    const parsed = zCreateTranscriptionJobBody.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } }, 422);
    }
    const tenantId = c.req.header('x-tenant-id')?.trim() || 'default';
    const job = options.jobStore.create(tenantId, parsed.data as ICreateTranscriptionJobInput);
    void runStubPipeline(job.id, options.jobStore, options.stubPipelineDelayMs).catch(() => {
      options.jobStore.patch(job.id, {
        status: EJobStatus.Failed,
        error: { code: 'PIPELINE_CRASH', message: 'Falha inesperada no pipeline stub.', retryable: true },
      });
    });
    return c.json(job, 201);
  });

  app.get('/v1/jobs/:id', (c) => {
    const id = c.req.param('id');
    const job = options.jobStore.get(id);
    if (!job) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Job não encontrada.' } }, 404);
    }
    return c.json(job);
  });

  return app;
}
