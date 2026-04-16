/**
 * Testes do cliente HTTP (fetch mock).
 * © 2024-2026 PlayLoadX
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlxTranscribeClient } from './plxTranscribeClient.js';
import { EJobStatus, ETranscribeMode } from './transcription.types.js';

test('createPlxTranscribeClient.health usa baseUrl e opcional apiKey', async () => {
  const calls: { url: string; headers: Headers }[] = [];
  const mockFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    const headers = new Headers(init?.headers);
    calls.push({ url, headers });
    return new Response(
      JSON.stringify({
        ok: true,
        service: 'plx-transcribe-service',
        whisperReady: false,
        humanGateEnabled: false,
        skipPreload: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  };
  const client = createPlxTranscribeClient({
    baseUrl: 'https://api.example.com',
    apiKey: 'segredo',
    fetchImpl: mockFetch,
  });
  const h = await client.health();
  assert.equal(h.ok, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/health$/);
  assert.equal(calls[0].headers.get('X-Plx-Api-Key'), 'segredo');
});

test('createJob envia multipart com mode', async () => {
  const mockFetch: typeof fetch = async (_input, init) => {
    assert.ok(init?.body instanceof FormData);
    const fd = init.body as FormData;
    assert.equal(fd.get('audio_language'), 'pt');
    assert.equal(fd.get('mode'), ETranscribeMode.Dolphin);
    return new Response(
      JSON.stringify({
        id: 'j1',
        tenantId: 't1',
        status: EJobStatus.Queued,
        audioLanguage: 'pt',
        mode: ETranscribeMode.Dolphin,
        sourceFilename: 'a.wav',
        createdAtIso: '2026-01-01T00:00:00Z',
        updatedAtIso: '2026-01-01T00:00:00Z',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  };
  const client = createPlxTranscribeClient({
    baseUrl: 'http://localhost:3055',
    fetchImpl: mockFetch,
  });
  const job = await client.createJob({
    file: new Blob(['x'], { type: 'audio/wav' }),
    filename: 'a.wav',
  });
  assert.equal(job.id, 'j1');
});
