"""Testes HTTP — mocks só aqui (Regra 0)."""

from __future__ import annotations

import io
import time

import pytest
from fastapi.testclient import TestClient


def test_health_ok(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["service"] == "plx-transcribe-service"


def test_peers_includes_self(client: TestClient) -> None:
    response = client.get("/v1/peers")
    assert response.status_code == 200
    data = response.json()
    assert "services" in data
    assert any(s.get("self") for s in data["services"] if isinstance(s, dict))


def test_job_pipeline_mock_whisper(monkeypatch: pytest.MonkeyPatch, client: TestClient) -> None:
    """Evita download de modelo: substitui só a parte bloqueante (teste)."""

    def fake_run(
        _settings: object,
        _job: object,
    ) -> tuple[str, list[dict[str, float | str]]]:
        return "texto real simulado em teste", [
            {"startSec": 0.0, "endSec": 0.4, "text": "texto"},
        ]

    monkeypatch.setattr(
        "plx_transcribe.pipeline._run_whisper_blocking",
        fake_run,
    )
    files = {"file": ("test.wav", io.BytesIO(b"RIFF" + b"\x00" * 40), "audio/wav")}
    response = client.post(
        "/v1/jobs",
        files=files,
        data={"audio_language": "pt", "mode": "dolphin"},
    )
    assert response.status_code == 201
    job_id = response.json()["id"]
    deadline = time.time() + 5.0
    status = "queued"
    while time.time() < deadline:
        get_r = client.get(f"/v1/jobs/{job_id}")
        assert get_r.status_code == 200
        body = get_r.json()
        status = str(body["status"])
        if status == "done":
            assert "texto" in (body.get("fullText") or "")
            return
        time.sleep(0.05)
    raise AssertionError(f"timeout status={status}")
