"""Modelos de domínio (enums e job)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any
from uuid import uuid4


class JobStatus(StrEnum):
    """Estado da pipeline — inclui gate humano (Regra 0)."""

    queued = "queued"
    preprocessing = "preprocessing"
    transcribing = "transcribing"
    post_processing = "post_processing"
    awaiting_human_review = "awaiting_human_review"
    done = "done"
    failed = "failed"
    cancelled = "cancelled"


class TranscribeMode(StrEnum):
    """Modo comercial."""

    cheetah = "cheetah"
    dolphin = "dolphin"
    whale = "whale"


@dataclass
class TranscriptionJob:
    """Job de transcrição persistida em memória (MVP)."""

    id: str
    tenant_id: str
    status: JobStatus
    audio_language: str
    mode: TranscribeMode
    source_filename: str
    created_at_iso: str
    updated_at_iso: str
    temp_audio_path: str | None = None
    full_text: str | None = None
    segments: list[dict[str, Any]] = field(default_factory=list)
    error_code: str | None = None
    error_message: str | None = None

    @staticmethod
    def new_job(
        *,
        tenant_id: str,
        audio_language: str,
        mode: TranscribeMode,
        source_filename: str,
    ) -> TranscriptionJob:
        """Cria job em estado queued."""
        now = datetime.now(UTC).isoformat()
        return TranscriptionJob(
            id=str(uuid4()),
            tenant_id=tenant_id,
            status=JobStatus.queued,
            audio_language=audio_language,
            mode=mode,
            source_filename=source_filename,
            created_at_iso=now,
            updated_at_iso=now,
        )

    def to_public_dict(self) -> dict[str, Any]:
        """Serialização para respostas HTTP."""
        data: dict[str, Any] = {
            "id": self.id,
            "tenantId": self.tenant_id,
            "status": self.status.value,
            "audioLanguage": self.audio_language,
            "mode": self.mode.value,
            "sourceFilename": self.source_filename,
            "createdAtIso": self.created_at_iso,
            "updatedAtIso": self.updated_at_iso,
        }
        if self.full_text is not None:
            data["fullText"] = self.full_text
        if self.segments:
            data["segments"] = self.segments
        if self.error_code is not None:
            data["error"] = {
                "code": self.error_code,
                "message": self.error_message,
                "retryable": False,
            }
        return data
