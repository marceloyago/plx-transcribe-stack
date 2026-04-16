"""Fluxo human-in-the-loop (Regra 0)."""

from __future__ import annotations

import io
import time

import pytest
from fastapi.testclient import TestClient


def test_human_approve_after_review(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PLX_SKIP_WHISPER_PRELOAD", "1")
    monkeypatch.setenv("PLX_REQUIRE_HUMAN_APPROVAL", "true")

    def fake_run(_settings: object, _job: object) -> tuple[str, list[dict[str, float | str]]]:
        return "precisa aprovacao", [{"startSec": 0.0, "endSec": 0.3, "text": "precisa"}]

    monkeypatch.setattr("plx_transcribe.pipeline._run_whisper_blocking", fake_run)

    from plx_transcribe.main import create_app

    with TestClient(create_app()) as client:
        files = {"file": ("a.wav", io.BytesIO(b"RIFF" + b"\x00" * 40), "audio/wav")}
        res = client.post("/v1/jobs", files=files, data={"audio_language": "pt", "mode": "dolphin"})
        assert res.status_code == 201
        job_id = res.json()["id"]
        deadline = time.time() + 5.0
        while time.time() < deadline:
            st = client.get(f"/v1/jobs/{job_id}").json()["status"]
            if st == "awaiting_human_review":
                break
            time.sleep(0.05)
        assert st == "awaiting_human_review"
        apr = client.post(f"/v1/jobs/{job_id}/human-approve")
        assert apr.status_code == 200
        assert apr.json()["status"] == "done"
