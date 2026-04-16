/**
 * Armazenamento em memória das jobs (MVP — substituir por Postgres + fila).
 * © 2024-2026 PlayLoadX
 */

import type { ICreateTranscriptionJobInput, IJobError, ITranscriptionJob, ITranscriptSegment } from '../../../contracts/transcription.types.js';
import { EJobStatus } from '../../../contracts/transcription.types.js';

export interface IJobPatch {
  readonly status?: EJobStatus;
  readonly fullText?: string;
  readonly segments?: readonly ITranscriptSegment[];
  readonly error?: IJobError;
}

export class MemoryJobStore {
  private readonly jobs = new Map<string, ITranscriptionJob>();

  public create(tenantId: string, input: ICreateTranscriptionJobInput): ITranscriptionJob {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const job: ITranscriptionJob = {
      id,
      tenantId,
      status: EJobStatus.Queued,
      input,
      createdAtIso: now,
      updatedAtIso: now,
    };
    this.jobs.set(id, job);
    return job;
  }

  public get(id: string): ITranscriptionJob | undefined {
    return this.jobs.get(id);
  }

  public patch(id: string, patch: IJobPatch): ITranscriptionJob | undefined {
    const current = this.jobs.get(id);
    if (!current) {
      return undefined;
    }
    const next: ITranscriptionJob = {
      ...current,
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.fullText !== undefined ? { fullText: patch.fullText } : {}),
      ...(patch.segments !== undefined ? { segments: patch.segments } : {}),
      ...(patch.error !== undefined ? { error: patch.error } : {}),
      updatedAtIso: new Date().toISOString(),
    };
    this.jobs.set(id, next);
    return next;
  }
}
