"""Append-only JSONL para loop de aprendizagem (correções / aprovações)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def append_learning_record(path: Path, record: dict[str, Any]) -> None:
    """Escreve uma linha JSON (UTF-8) no ficheiro de learning."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")
