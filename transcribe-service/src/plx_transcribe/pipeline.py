"""Pipeline assíncrona de transcrição (executor + faster-whisper real)."""

from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from plx_transcribe.job_store import JobStore
from plx_transcribe.models import JobStatus, TranscriptionJob
from plx_transcribe.settings import Settings, map_mode_to_model_size
from plx_transcribe import whisper_engine
from plx_transcribe.webhooks import schedule_job_webhook

logger = logging.getLogger(__name__)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _run_whisper_blocking(settings: Settings, job: TranscriptionJob) -> tuple[str, list]:
    """Parte bloqueante: carregar modelo e transcrever ficheiro."""
    if not job.temp_audio_path:
        raise ValueError("temp_audio_path em falta")
    path = Path(job.temp_audio_path)
    if not path.is_file():
        raise FileNotFoundError(path)
    model_size = map_mode_to_model_size(job.mode.value)
    device = settings.whisper_device
    if device == "auto":
        device = "cpu"
    model = whisper_engine.get_or_load_model(
        model_size,
        device,
        settings.whisper_compute_type,
    )
    lang = job.audio_language.strip() if job.audio_language.strip() else None
    return whisper_engine.transcribe_sync(model, path, language=lang)


async def run_transcription_pipeline(
    job_id: str,
    *,
    store: JobStore,
    settings: Settings,
    executor: ThreadPoolExecutor,
) -> None:
    """Avança estados até done ou awaiting_human_review ou failed."""
    job = store.get(job_id)
    if job is None:
        return
    try:
        job.status = JobStatus.preprocessing
        job.updated_at_iso = _now_iso()
        store.update(job)

        job.status = JobStatus.transcribing
        job.updated_at_iso = _now_iso()
        store.update(job)

        loop = asyncio.get_event_loop()

        def _call_whisper() -> tuple[str, list]:
            current = store.get(job_id)
            if current is None:
                raise RuntimeError("job desapareceu do store")
            return _run_whisper_blocking(settings, current)

        full_text, segments = await loop.run_in_executor(executor, _call_whisper)

        job = store.get(job_id)
        if job is None:
            return
        job.status = JobStatus.post_processing
        job.updated_at_iso = _now_iso()
        job.full_text = full_text
        job.segments = segments
        store.update(job)

        job = store.get(job_id)
        if job is None:
            return
        if settings.require_human_approval:
            job.status = JobStatus.awaiting_human_review
        else:
            job.status = JobStatus.done
        job.updated_at_iso = _now_iso()
        store.update(job)
        schedule_job_webhook(job_id, store=store, settings=settings)
    except Exception as exc:  # noqa: BLE001 — registo de falha real
        logger.exception("Job %s falhou na pipeline", job_id)
        failed = store.get(job_id)
        if failed is not None:
            failed.status = JobStatus.failed
            failed.error_code = "TRANSCRIBE_FAILED"
            failed.error_message = str(exc)
            failed.updated_at_iso = _now_iso()
            store.update(failed)
            schedule_job_webhook(job_id, store=store, settings=settings)
