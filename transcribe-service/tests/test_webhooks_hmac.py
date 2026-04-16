"""Assinatura HMAC dos webhooks."""

from __future__ import annotations

from plx_transcribe.webhooks import build_signature


def test_hmac_deterministic() -> None:
    body = b'{"status":"done","id":"x"}'
    a = build_signature("segredo-teste", body)
    b = build_signature("segredo-teste", body)
    assert a == b
    assert a.startswith("sha256=")


def test_hmac_changes_with_secret() -> None:
    body = b'{}'
    assert build_signature("a", body) != build_signature("b", body)
