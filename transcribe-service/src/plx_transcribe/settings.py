"""Configuração via ambiente (Pydantic Settings)."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated, Literal

from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _empty_str_to_none(value: object) -> str | None:
    if value is None:
        return None
    if isinstance(value, str) and value.strip() == "":
        return None
    return str(value) if value is not None else None


TEmptyAsNone = Annotated[str | None, BeforeValidator(_empty_str_to_none)]


class Settings(BaseSettings):
    """Definições carregadas de variáveis PLX_* (maiúsculas no ambiente)."""

    model_config = SettingsConfigDict(
        env_prefix="PLX_",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    whisper_model_size: Literal["tiny", "base", "small", "medium", "large-v3"] = "base"
    whisper_device: Literal["cpu", "cuda", "auto"] = "cpu"
    whisper_compute_type: str = "int8"
    require_human_approval: bool = False
    peers_registry_path: Path | None = None
    service_id: str = "plx-transcribe-service"
    public_base_url: str = "http://127.0.0.1:3055"
    api_port: int = 3055
    skip_whisper_preload: bool = False
    learning_jsonl_path: Path | None = None
    webhook_url: str | None = None
    webhook_secret: str | None = None
    # Lista separada por vírgulas; vazio = permitir qualquer origem (apenas dev).
    cors_allow_origins: TEmptyAsNone = None
    # Se definido, todas as rotas exceto GET /health exigem header X-Plx-Api-Key.
    internal_api_key: TEmptyAsNone = None


def map_mode_to_model_size(mode: str) -> Literal["tiny", "base", "small", "medium", "large-v3"]:
    """Mapeia modo de produto para tamanho de modelo Whisper."""
    mapping: dict[str, Literal["tiny", "base", "small", "medium", "large-v3"]] = {
        "cheetah": "tiny",
        "dolphin": "small",
        "whale": "large-v3",
    }
    return mapping.get(mode, "base")
