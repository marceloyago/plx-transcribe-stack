"""Fixtures pytest — ambiente sem pré-carregar Whisper no boot."""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("PLX_SKIP_WHISPER_PRELOAD", "1")


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch):
    """App isolada por teste (context manager activa lifespan / app.state)."""
    monkeypatch.setenv("PLX_SKIP_WHISPER_PRELOAD", "1")
    from plx_transcribe.main import create_app

    with TestClient(create_app()) as test_client:
        yield test_client
