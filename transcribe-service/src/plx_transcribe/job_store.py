"""Armazenamento thread-safe em memória."""

from __future__ import annotations

import threading

from plx_transcribe.models import TranscriptionJob


class JobStore:
    """Mapa id → job com lock."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._jobs: dict[str, TranscriptionJob] = {}

    def put(self, job: TranscriptionJob) -> None:
        with self._lock:
            self._jobs[job.id] = job

    def get(self, job_id: str) -> TranscriptionJob | None:
        with self._lock:
            return self._jobs.get(job_id)

    def update(self, job: TranscriptionJob) -> None:
        with self._lock:
            self._jobs[job.id] = job
