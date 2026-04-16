"""Camada mínima de segurança para exposição comercial (API key opcional)."""

from __future__ import annotations

import hmac
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class PlxApiKeyGateMiddleware(BaseHTTPMiddleware):
    """Exige `X-Plx-Api-Key` quando `Settings.internal_api_key` está definido."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        settings = request.app.state.settings
        expected = settings.internal_api_key
        if not expected:
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)
        path = request.url.path
        if path == "/health":
            return await call_next(request)
        supplied = request.headers.get("x-plx-api-key", "")
        try:
            ok = hmac.compare_digest(
                supplied.encode("utf-8"),
                expected.encode("utf-8"),
            )
        except (TypeError, ValueError):
            ok = False
        if not ok:
            return JSONResponse(
                {"detail": "Chave API inválida ou em falta"},
                status_code=401,
            )
        return await call_next(request)
