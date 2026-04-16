/**
 * Cliente HTTP tipado para integrar apps (user client / BFF) com plx-transcribe-service.
 * Variáveis em inglês; comentários em português.
 *
 * © 2024-2026 PlayLoadX
 */

import {
  ETranscribeMode,
  type EJobStatus,
  type IJobError,
  type ITranscriptSegment,
} from './transcription.types';

/** Resposta GET /health */
export interface IPlxTranscribeHealth {
  readonly ok: boolean;
  readonly service: string;
  readonly whisperReady: boolean;
  readonly humanGateEnabled: boolean;
  readonly skipPreload: boolean;
}

/** Corpo JSON de uma job (POST criação / GET estado) — alinhado ao Python `to_public_dict`. */
export interface IPlxTranscribeJob {
  readonly id: string;
  readonly tenantId: string;
  readonly status: EJobStatus;
  readonly audioLanguage: string;
  readonly mode: ETranscribeMode;
  readonly sourceFilename: string;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
  readonly fullText?: string;
  readonly segments?: readonly ITranscriptSegment[];
  readonly error?: IJobError;
}

export interface IPlxTranscribePeersView {
  readonly services: readonly Record<string, unknown>[];
  readonly [key: string]: unknown;
}

export interface IPlxTranscribeClientConfig {
  /** URL base (ex.: https://transcribe.seudominio.com) sem barra final. */
  readonly baseUrl: string;
  /** Valor de `X-Plx-Api-Key` quando o serviço tem `PLX_INTERNAL_API_KEY`. */
  readonly apiKey?: string;
  /** Cabeçalho `x-tenant-id` (opcional). */
  readonly tenantId?: string;
  /** Injeta `fetch` (ex.: edge runtime). */
  readonly fetchImpl?: typeof fetch;
}

function joinUrl(base: string, path: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/** API Python devolve snake_case em /health — normaliza para camelCase. */
function parseHealthPayload(raw: unknown): IPlxTranscribeHealth {
  if (typeof raw !== 'object' || raw === null) {
    throw new TypeError('Resposta /health inválida');
  }
  const o = raw as Record<string, unknown>;
  return {
    ok: Boolean(o.ok),
    service: String(o.service ?? ''),
    whisperReady: Boolean(o.whisperReady ?? o.whisper_ready),
    humanGateEnabled: Boolean(o.humanGateEnabled ?? o.human_gate_enabled),
    skipPreload: Boolean(o.skipPreload ?? o.skip_preload),
  };
}

function headersJson(config: IPlxTranscribeClientConfig): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (config.apiKey) {
    h['X-Plx-Api-Key'] = config.apiKey;
  }
  if (config.tenantId) {
    h['x-tenant-id'] = config.tenantId;
  }
  return h;
}

function parseJob(raw: unknown): IPlxTranscribeJob {
  if (typeof raw !== 'object' || raw === null) {
    throw new TypeError('Resposta de job inválida');
  }
  const o = raw as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    tenantId: String(o.tenantId ?? ''),
    status: o.status as EJobStatus,
    audioLanguage: String(o.audioLanguage ?? ''),
    mode: o.mode as ETranscribeMode,
    sourceFilename: String(o.sourceFilename ?? ''),
    createdAtIso: String(o.createdAtIso ?? ''),
    updatedAtIso: String(o.updatedAtIso ?? ''),
    fullText: typeof o.fullText === 'string' ? o.fullText : undefined,
    segments: Array.isArray(o.segments) ? (o.segments as ITranscriptSegment[]) : undefined,
    error: typeof o.error === 'object' && o.error !== null ? (o.error as IJobError) : undefined,
  };
}

export interface IPlxTranscribeClient {
  readonly health: () => Promise<IPlxTranscribeHealth>;
  readonly peers: () => Promise<IPlxTranscribePeersView>;
  readonly createJob: (input: {
    readonly file: Blob;
    readonly filename: string;
    readonly audioLanguage?: string;
    readonly mode?: ETranscribeMode;
    readonly signal?: AbortSignal;
  }) => Promise<IPlxTranscribeJob>;
  readonly getJob: (jobId: string, signal?: AbortSignal) => Promise<IPlxTranscribeJob>;
  readonly humanApprove: (jobId: string, signal?: AbortSignal) => Promise<IPlxTranscribeJob>;
}

export function createPlxTranscribeClient(config: IPlxTranscribeClientConfig): IPlxTranscribeClient {
  const f = config.fetchImpl ?? globalThis.fetch;
  if (typeof f !== 'function') {
    throw new TypeError('fetch não disponível — passe fetchImpl no config');
  }

  return {
    async health(): Promise<IPlxTranscribeHealth> {
      const r = await f(joinUrl(config.baseUrl, '/health'), {
        method: 'GET',
        headers: headersJson(config),
      });
      if (!r.ok) {
        throw new Error(`health falhou: HTTP ${r.status}`);
      }
      return parseHealthPayload(await r.json());
    },

    async peers(): Promise<IPlxTranscribePeersView> {
      const r = await f(joinUrl(config.baseUrl, '/v1/peers'), {
        method: 'GET',
        headers: headersJson(config),
      });
      if (!r.ok) {
        throw new Error(`peers falhou: HTTP ${r.status}`);
      }
      return (await r.json()) as IPlxTranscribePeersView;
    },

    async createJob(input): Promise<IPlxTranscribeJob> {
      const form = new FormData();
      form.append('file', input.file, input.filename);
      form.append('audio_language', input.audioLanguage ?? 'pt');
      form.append('mode', input.mode ?? ETranscribeMode.Dolphin);
      const h: Record<string, string> = { Accept: 'application/json' };
      if (config.apiKey) {
        h['X-Plx-Api-Key'] = config.apiKey;
      }
      if (config.tenantId) {
        h['x-tenant-id'] = config.tenantId;
      }
      const r = await f(joinUrl(config.baseUrl, '/v1/jobs'), {
        method: 'POST',
        headers: h,
        body: form,
        signal: input.signal,
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`createJob falhou: HTTP ${r.status} ${t.slice(0, 200)}`);
      }
      return parseJob(await r.json());
    },

    async getJob(jobId: string, signal?: AbortSignal): Promise<IPlxTranscribeJob> {
      const r = await f(joinUrl(config.baseUrl, `/v1/jobs/${encodeURIComponent(jobId)}`), {
        method: 'GET',
        headers: headersJson(config),
        signal,
      });
      if (!r.ok) {
        throw new Error(`getJob falhou: HTTP ${r.status}`);
      }
      return parseJob(await r.json());
    },

    async humanApprove(jobId: string, signal?: AbortSignal): Promise<IPlxTranscribeJob> {
      const r = await f(
        joinUrl(config.baseUrl, `/v1/jobs/${encodeURIComponent(jobId)}/human-approve`),
        {
          method: 'POST',
          headers: headersJson(config),
          signal,
        },
      );
      if (!r.ok) {
        throw new Error(`humanApprove falhou: HTTP ${r.status}`);
      }
      return parseJob(await r.json());
    },
  };
}
