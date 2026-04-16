"""Webhook HMAC (opcional) — notificação real, sem payload falso."""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import logging
from typing import Any

import httpx

from plx_transcribe.job_store import JobStore
from plx_transcribe.settings import Settings

logger = logging.getLogger(__name__)


def build_signature(secret: str, body_bytes: bytes) -> str:
    """HMAC-SHA256 (header `X-Plx-Signature: sha256=...`)."""
    digest = hmac.new(secret.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


async def post_job_webhook(
    payload: dict[str, Any],
    *,
    url: str,
    secret: str | None,
    timeout_sec: float = 30.0,
) -> None:
    """POST JSON com assinatura opcional."""
    body_bytes = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    headers: dict[str, str] = {"Content-Type": "application/json; charset=utf-8"}
    if secret and secret.strip():
        headers["X-Plx-Signature"] = build_signature(secret.strip(), body_bytes)
    async with httpx.AsyncClient(timeout=timeout_sec) as client:
        response = await client.post(url, content=body_bytes, headers=headers)
        response.raise_for_status()


def schedule_job_webhook(job_id: str, *, store: JobStore, settings: Settings) -> None:
    """Agenda POST assíncrono (não bloqueia pipeline)."""
    if not settings.webhook_url or not str(settings.webhook_url).strip():
        return

    async def _run() -> None:
        job = store.get(job_id)
        if job is None:
            logger.warning("Webhook: job %s inexistente", job_id)
            return
        try:
            await post_job_webhook(
                job.to_public_dict(),
                url=str(settings.webhook_url).strip(),
                secret=settings.webhook_secret,
            )
            logger.info("Webhook OK job=%s", job_id)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Webhook falhou job=%s: %s", job_id, exc)

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        logger.warning("Sem event loop; webhook job=%s ignorado", job_id)
        return
    loop.create_task(_run())
