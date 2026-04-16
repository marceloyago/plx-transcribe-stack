"""Gate opcional X-Plx-Api-Key (produção)."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


def test_health_ignora_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PLX_INTERNAL_API_KEY", "segredo-fixo-teste")
    from plx_transcribe.main import create_app

    with TestClient(create_app()) as client:
        response = client.get("/health")
    assert response.status_code == 200


def test_peers_exige_chave(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PLX_INTERNAL_API_KEY", "segredo-fixo-teste")
    from plx_transcribe.main import create_app

    with TestClient(create_app()) as client:
        denied = client.get("/v1/peers")
        ok = client.get("/v1/peers", headers={"X-Plx-Api-Key": "segredo-fixo-teste"})
    assert denied.status_code == 401
    assert ok.status_code == 200
