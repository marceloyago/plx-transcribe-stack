# plx-transcribe-stack — PlayLoadX

Stack inspirada em capacidades **públicas** do ecossistema tipo **TurboScribe** (turboscribe.ai), com implementação **própria**, API **tua**, e base **open-source** (Whisper / faster-whisper, filas, storage).

**O que isto NÃO é:** engenharia reversa ilegal, caça a backdoors, ou scraping de áreas não públicas de terceiros.

**O que isto É:** pesquisa de produto só em **docs oficiais + marketing + suporte**, matriz de features, e plano de implementação brutal em fases.

© 2024-2026 PlayLoadX

## Documentos

- `docs/PUBLIC-RESEARCH-TURBOSCRIBE.md` — o que o mercado descreve publicamente (fontes citadas).
- `docs/ARCHITECTURE-PLX.md` — camadas, dados, segurança.
- `docs/FEATURE-BACKLOG-BRUTAL.md` — fases de entrega.
- `contracts/` — tipos TypeScript (domínio).

## API (Fase 1 — MVP)

- `GET /health` — estado do serviço.
- `POST /v1/jobs` — cria job (JSON alinhado a `ICreateTranscriptionJobInput`); header opcional `X-Tenant-Id`.
- `GET /v1/jobs/:id` — consulta job (pipeline **stub** até ligar Whisper).

Variáveis: `PORT` (default `3044`), `PLX_STUB_PIPELINE_MS` (default `15`) — atraso entre estados stub.

```bash
npm run start:api
```

Smoke Windows (sobe servidor em background job, curl, encerra):

```powershell
$env:PORT = '3048'
.\scripts\smoke-api.ps1
```

## Verificação local

```bash
cd plx-transcribe-stack
npm install
npm run typecheck
npm test
```
