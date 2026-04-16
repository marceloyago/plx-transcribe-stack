# plx-transcribe-service — imagem de produção
# © 2024-2026 PlayLoadX
# syntax=docker/dockerfile:1
FROM python:3.12-slim-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml README.md ./
COPY src ./src

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir .

ENV PLX_API_PORT=3055
EXPOSE 3055

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:3055/health', timeout=4)"

CMD ["uvicorn", "plx_transcribe.main:app", "--host", "0.0.0.0", "--port", "3055"]
