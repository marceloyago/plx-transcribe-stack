"""Leitura do registo de peers (cada serviço conhece os outros — Regra 0)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


def load_peers_yaml(path: Path | None) -> dict[str, Any]:
    """Carrega YAML de ecossistema; devolve estrutura vazia se inexistente."""
    if path is None or not path.is_file():
        return {"version": 0, "services": [], "agents": []}
    raw = path.read_text(encoding="utf-8")
    data = yaml.safe_load(raw)
    if not isinstance(data, dict):
        return {"version": 0, "services": [], "agents": []}
    return data


def merge_peers_view(
    registry: dict[str, Any],
    *,
    self_id: str,
    self_url: str,
    self_role: str,
) -> dict[str, Any]:
    """Agrega registo ficheiro + identidade deste serviço."""
    services = list(registry.get("services", []) or [])
    agents = list(registry.get("agents", []) or [])
    self_entry = {
        "id": self_id,
        "role": self_role,
        "public_base_url": self_url,
        "self": True,
    }
    return {
        "version": registry.get("version", 0),
        "services": [s for s in services if isinstance(s, dict)] + [self_entry],
        "agents": [a for a in agents if isinstance(a, dict)],
    }
