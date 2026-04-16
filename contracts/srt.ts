/**
 * Geração simples de SRT a partir de segmentos.
 * © 2024-2026 PlayLoadX
 */

import type { IJobError, ITranscriptSegment, ISrtSegmentationOptions, TSrtGenerationResult } from './transcription.types.js';

function formatTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 1000);
  const pad = (n: number, len: number): string => n.toString().padStart(len, '0');
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(ms, 3)}`;
}

/** Agrupa segmentos consecutivos respeitando limite de palavras (MVP). */
export function buildSrtFromSegments(
  segments: readonly ITranscriptSegment[],
  options: ISrtSegmentationOptions,
): TSrtGenerationResult {
  if (segments.length === 0) {
    const err: IJobError = {
      code: 'EMPTY_SEGMENTS',
      message: 'Nenhum segmento para gerar SRT.',
      retryable: false,
    };
    return { ok: false, error: err };
  }

  const blocks: string[] = [];
  let index = 1;
  let buffer: ITranscriptSegment[] = [];
  let wordCount = 0;

  const flush = (): void => {
    if (buffer.length === 0) {
      return;
    }
    const start = buffer[0].startSec;
    const end = buffer[buffer.length - 1].endSec;
    const text = buffer.map((s) => s.text.trim()).join(' ').trim();
    blocks.push(`${index}\n${formatTimestamp(start)} --> ${formatTimestamp(end)}\n${text}\n`);
    index += 1;
    buffer = [];
    wordCount = 0;
  };

  for (const seg of segments) {
    const words = seg.text.trim().split(/\s+/).filter(Boolean);
    const addCount = words.length;
    if (wordCount + addCount > options.maxWordsPerSegment && buffer.length > 0) {
      flush();
    }
    buffer.push(seg);
    wordCount += addCount;
    if (wordCount >= options.maxWordsPerSegment) {
      flush();
    }
  }
  flush();

  return { ok: true, content: blocks.join('\n') };
}
