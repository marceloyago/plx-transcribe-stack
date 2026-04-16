/**
 * Validação HTTP (Zod) alinhada a ICreateTranscriptionJobInput.
 * © 2024-2026 PlayLoadX
 */

import { z } from 'zod';
import { EExportFormat, ETranscribeMode } from '../../../contracts/transcription.types.js';

const zSpeakerCount = z.union([z.literal('auto'), z.number().int().positive()]);

export const zCreateTranscriptionJobBody = z.object({
  audioLanguage: z.string().min(2).max(32),
  mode: z.nativeEnum(ETranscribeMode),
  enableSpeakerRecognition: z.boolean(),
  speakerCount: zSpeakerCount.optional(),
  enableAudioRestore: z.boolean(),
  transcribeToEnglish: z.boolean(),
  sourceObjectKey: z.string().min(1).max(2048),
  exportFormats: z.array(z.nativeEnum(EExportFormat)).min(1).max(16),
});

export type TCreateTranscriptionJobBody = z.infer<typeof zCreateTranscriptionJobBody>;
