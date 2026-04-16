/**
 * Testes de integração HTTP (Hono app.fetch).
 * © 2024-2026 PlayLoadX
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { EExportFormat, EJobStatus, ETranscribeMode } from '../../../contracts/transcription.types.js';
import { createTranscriptionApiApp } from './app.js';
import { MemoryJobStore } from './memory-job-store.js';
import type { ITranscriptionJob } from '../../../contracts/transcription.types.js';

test('GET /health responde ok', async () => {
  const store = new MemoryJobStore();
  const app = createTranscriptionApiApp({ jobStore: store, stubPipelineDelayMs: 0 });
  const res = await app.request('/health');
  assert.equal(res.status, 200);
  const body = (await res.json()) as { ok: boolean };
  assert.equal(body.ok, true);
});

test('POST /v1/jobs inválido devolve 422', async () => {
  const store = new MemoryJobStore();
  const app = createTranscriptionApiApp({ jobStore: store, stubPipelineDelayMs: 0 });
  const res = await app.request('/v1/jobs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 422);
});

test('POST /v1/jobs + GET até done (stub)', async () => {
  const store = new MemoryJobStore();
  const app = createTranscriptionApiApp({ jobStore: store, stubPipelineDelayMs: 0 });
  const payload = {
    audioLanguage: 'pt',
    mode: ETranscribeMode.Whale,
    enableSpeakerRecognition: false,
    enableAudioRestore: false,
    transcribeToEnglish: false,
    sourceObjectKey: 'media/demo.mp3',
    exportFormats: [EExportFormat.Json],
  };
  const resPost = await app.request('/v1/jobs', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-tenant-id': 'test-tenant' },
    body: JSON.stringify(payload),
  });
  assert.equal(resPost.status, 201);
  const created = (await resPost.json()) as ITranscriptionJob;
  assert.equal(created.status, EJobStatus.Queued);
  assert.equal(created.tenantId, 'test-tenant');

  let status = EJobStatus.Queued;
  for (let i = 0; i < 80 && status !== EJobStatus.Done && status !== EJobStatus.Failed; i += 1) {
    await new Promise((r) => setTimeout(r, 10));
    const resGet = await app.request(`/v1/jobs/${created.id}`);
    const job = (await resGet.json()) as ITranscriptionJob;
    status = job.status;
  }
  assert.equal(status, EJobStatus.Done);

  const doneRes = await app.request(`/v1/jobs/${created.id}`);
  const doneJob = (await doneRes.json()) as ITranscriptionJob;
  assert.ok(doneJob.fullText?.includes('[stub PLX]'));
});

test('GET /v1/jobs/:id inexistente → 404', async () => {
  const store = new MemoryJobStore();
  const app = createTranscriptionApiApp({ jobStore: store, stubPipelineDelayMs: 0 });
  const res = await app.request('/v1/jobs/00000000-0000-4000-8000-000000000000');
  assert.equal(res.status, 404);
});
