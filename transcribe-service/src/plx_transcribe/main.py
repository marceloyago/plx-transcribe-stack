"""Entrada FastAPI — API real, Regra 0 (sem sucesso falso)."""

from __future__ import annotations

import asyncio
import logging
import tempfile
from datetime import datetime, timezone
from collections.abc import AsyncIterator
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from plx_transcribe.job_store import JobStore
from plx_transcribe.learning import append_learning_record
from plx_transcribe.models import JobStatus, TranscribeMode, TranscriptionJob
from plx_transcribe.peers import load_peers_yaml, merge_peers_view
from plx_transcribe.pipeline import run_transcription_pipeline
from plx_transcribe.settings import Settings
from plx_transcribe import whisper_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = Settings()
    store = JobStore()
    executor = ThreadPoolExecutor(max_workers=2)
    app.state.settings = settings
    app.state.store = store
    app.state.executor = executor
    peers_view = merge_peers_view(
        load_peers_yaml(settings.peers_registry_path),
        self_id=settings.service_id,
        self_url=settings.public_base_url,
        self_role="transcription",
    )
    peer_ids = [str(s.get("id", "?")) for s in peers_view.get("services", []) if isinstance(s, dict)]
    logger.info("Registry peers (servicos): %s", ", ".join(peer_ids) or "(vazio)")
    if not settings.skip_whisper_preload:
        dev = settings.whisper_device if settings.whisper_device != "auto" else "cpu"
        whisper_engine.get_or_load_model(
            settings.whisper_model_size,
            dev,
            settings.whisper_compute_type,
        )
    yield
    executor.shutdown(wait=False)


def create_app() -> FastAPI:
    """Constrói aplicação com estado injetado no lifespan."""
    app = FastAPI(title="plx-transcribe-service", lifespan=_lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health(request: Request) -> dict:
        settings: Settings = request.app.state.settings
        return {
            "ok": True,
            "service": "plx-transcribe-service",
            "whisper_ready": whisper_engine.is_model_loaded(),
            "human_gate_enabled": settings.require_human_approval,
            "skip_preload": settings.skip_whisper_preload,
        }

    @app.get("/v1/peers")
    def peers(request: Request) -> dict:
        settings: Settings = request.app.state.settings
        raw = load_peers_yaml(settings.peers_registry_path)
        return merge_peers_view(
            raw,
            self_id=settings.service_id,
            self_url=settings.public_base_url,
            self_role="transcription",
        )

    @app.post("/v1/jobs", status_code=201)
    async def create_job(
        request: Request,
        file: UploadFile = File(..., description="Áudio ou vídeo (ficheiro real)"),
        audio_language: str = Form("pt"),
        mode: TranscribeMode = Form(TranscribeMode.dolphin),
    ) -> dict:
        settings: Settings = request.app.state.settings
        store: JobStore = request.app.state.store
        executor: ThreadPoolExecutor = request.app.state.executor
        tenant_id = request.headers.get("x-tenant-id", "default").strip() or "default"
        suffix = Path(file.filename or "upload.bin").suffix or ".bin"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        job = TranscriptionJob.new_job(
            tenant_id=tenant_id,
            audio_language=audio_language,
            mode=mode,
            source_filename=file.filename or "upload",
        )
        job.temp_audio_path = tmp_path
        store.put(job)
        asyncio.create_task(
            run_transcription_pipeline(
                job.id,
                store=store,
                settings=settings,
                executor=executor,
            ),
        )
        return job.to_public_dict()

    @app.get("/v1/jobs/{job_id}")
    def get_job(job_id: str, request: Request) -> dict:
        store: JobStore = request.app.state.store
        job = store.get(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Job não encontrada")
        return job.to_public_dict()

    @app.post("/v1/jobs/{job_id}/human-approve")
    def human_approve(job_id: str, request: Request) -> dict:
        settings: Settings = request.app.state.settings
        store: JobStore = request.app.state.store
        job = store.get(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Job não encontrada")
        if job.status != JobStatus.awaiting_human_review:
            raise HTTPException(
                status_code=409,
                detail="Job não está em awaiting_human_review",
            )
        job.status = JobStatus.done
        job.updated_at_iso = datetime.now(timezone.utc).isoformat()
        store.update(job)
        if settings.learning_jsonl_path is not None:
            append_learning_record(
                settings.learning_jsonl_path,
                {
                    "event": "human_approve",
                    "job_id": job_id,
                    "text_preview": (job.full_text or "")[:800],
                },
            )
        return job.to_public_dict()

    return app


app = create_app()


def run() -> None:
    """Entrypoint `plx-transcribe-api` e execução local."""
    settings = Settings()
    uvicorn.run(app, host="0.0.0.0", port=settings.api_port)