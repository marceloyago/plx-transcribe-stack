"""Motor faster-whisper (inferência real — sem texto falso)."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

_model: WhisperModel | None = None
_model_key: tuple[str, str, str] | None = None


def is_model_loaded() -> bool:
    """Indica se há modelo residente em memória."""
    return _model is not None


def get_or_load_model(model_size: str, device: str, compute_type: str) -> WhisperModel:
    """Carrega ou reutiliza modelo conforme chave (tamanho/device/compute)."""
    global _model, _model_key
    from faster_whisper import WhisperModel

    key = (model_size, device, compute_type)
    if _model is not None and _model_key == key:
        return _model
    logger.info("Carregar WhisperModel size=%s device=%s compute=%s", model_size, device, compute_type)
    _model = WhisperModel(model_size, device=device, compute_type=compute_type)
    _model_key = key
    return _model


def transcribe_sync(
    model: WhisperModel,
    audio_path: Path,
    *,
    language: str | None,
) -> tuple[str, list[dict[str, Any]]]:
    """Executa transcrição síncrona (chamar desde executor)."""
    segments_iter, _info = model.transcribe(
        str(audio_path),
        language=language if language else None,
        beam_size=5,
        vad_filter=True,
    )
    parts: list[dict[str, Any]] = []
    texts: list[str] = []
    for seg in segments_iter:
        parts.append(
            {
                "startSec": float(seg.start),
                "endSec": float(seg.end),
                "text": seg.text.strip(),
            }
        )
        texts.append(seg.text.strip())
    full = " ".join(texts).strip()
    return full, parts
