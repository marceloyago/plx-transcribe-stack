/**
 * Domínio de transcrição — contratos PlayLoadX.
 * Variáveis em inglês; comentários em português.
 *
 * © 2024-2026 PlayLoadX
 */

/** Estado da pipeline de uma job */
export enum EJobStatus {
  Queued = 'queued',
  Preprocessing = 'preprocessing',
  Transcribing = 'transcribing',
  PostProcessing = 'post_processing',
  AwaitingHumanReview = 'awaiting_human_review',
  Done = 'done',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

/** Modo comercial (mapeado para modelo/custo no worker) */
export enum ETranscribeMode {
  Cheetah = 'cheetah',
  Dolphin = 'dolphin',
  Whale = 'whale',
}

/** Formato de export pedido */
export enum EExportFormat {
  Json = 'json',
  Txt = 'txt',
  Srt = 'srt',
  Vtt = 'vtt',
}

/** Erro de domínio serializável */
export interface IJobError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
}

/** Segmento com tempo e opcional speaker */
export interface ITranscriptSegment {
  readonly startSec: number;
  readonly endSec: number;
  readonly text: string;
  readonly speakerLabel?: string;
}

/** Pedido de criação de job (API) */
export interface ICreateTranscriptionJobInput {
  readonly audioLanguage: string;
  readonly mode: ETranscribeMode;
  readonly enableSpeakerRecognition: boolean;
  readonly speakerCount?: number | 'auto';
  readonly enableAudioRestore: boolean;
  readonly transcribeToEnglish: boolean;
  readonly sourceObjectKey: string;
  readonly exportFormats: readonly EExportFormat[];
}

/** Job persistida / resposta */
export interface ITranscriptionJob {
  readonly id: string;
  readonly tenantId: string;
  readonly status: EJobStatus;
  readonly input: ICreateTranscriptionJobInput;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
  readonly error?: IJobError;
  readonly segments?: readonly ITranscriptSegment[];
  readonly fullText?: string;
}

/** Opções de segmentação SRT (espelho funcional do help público TurboScribe) */
export interface ISrtSegmentationOptions {
  readonly maxWordsPerSegment: number;
  readonly maxDurationSecPerSegment?: number;
  readonly maxCharsPerSegment?: number;
  readonly sentenceAware: boolean;
}

/** Resultado utilitário de geração de legendas */
export type TSrtGenerationResult =
  | { readonly ok: true; readonly content: string }
  | { readonly ok: false; readonly error: IJobError };
