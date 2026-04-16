/**
 * Testes mínimos do gerador SRT (Node built-in test runner).
 * © 2024-2026 PlayLoadX
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSrtFromSegments } from './srt.js';
import type { ITranscriptSegment } from './transcription.types.js';

test('buildSrtFromSegments agrupa por maxWords', () => {
  const segments: readonly ITranscriptSegment[] = [
    { startSec: 0, endSec: 1, text: 'um dois' },
    { startSec: 1, endSec: 2, text: 'tres quatro' },
    { startSec: 2, endSec: 3, text: 'cinco' },
  ];
  const result = buildSrtFromSegments(segments, {
    maxWordsPerSegment: 3,
    sentenceAware: true,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.match(result.content, /1\n/);
  }
});
