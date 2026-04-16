# plx-transcribe-stack — PlayLoadX

Stack inspirada em capacidades **públicas** do ecossistema tipo **TurboScribe** (turboscribe.ai), com implementação **própria** e **motor em Python real** (faster-whisper), sem caminho principal em “stub”.

**Regra 0 (lei MSI):** `../openclaw-workspace/docs/REGRA-0-NO-STUB-PYTHON-HIL-REGISTRY.md` — Python para ML/áudio; human-in-the-loop; registry de peers; cada agente/projeto conhece os outros.

© 2024-2026 PlayLoadX

## API (canónica)

Pasta **`transcribe-service/`** — FastAPI, `POST /v1/jobs` (multipart com ficheiro real), `GET /v1/jobs/{id}`, `GET /v1/peers`, `POST /v1/jobs/{id}/human-approve` (quando `PLX_REQUIRE_HUMAN_APPROVAL=1`).

Ver `transcribe-service/README.md`.

## Contratos TypeScript

- `contracts/` — tipos partilhados (SRT, domínio legado; alinhar enums com Python em evoluções).

## User client (TypeScript)

- `contracts/plxTranscribeClient.ts` — `createPlxTranscribeClient({ baseUrl, apiKey?, tenantId? })` alinhado à API Python.
- Variáveis de ambiente sugeridas no front: URL público HTTPS + mesma `PLX_INTERNAL_API_KEY` que o serviço (via BFF, se possível).

## Dashboard Next.js (`apps/dashboard`)

- UI comercial mínima (painel + nova job + detalhe) ligada à API Python via **Server Actions** (chave só no servidor).
- Arranque: copiar `apps/dashboard/.env.local.example` para `apps/dashboard/.env.local` → definir `PLX_TRANSCRIBE_API_URL` (ex. `http://127.0.0.1:3055`) → com API Python a correr: `npm run dashboard:dev` → abrir `http://localhost:3000`.
- Build: `npm run dashboard:build` (a partir da raiz, depois de `npm install` dentro de `apps/dashboard`).

## Docker (produção mínima)

```bash
cp deploy.env.example .env
# editar .env (URL público, CORS, API key, webhooks)
docker compose up -d --build
```

## Verificação

```bash
npm install && npm run typecheck && npm test
cd transcribe-service && pip install -e ".[dev]" && pytest -q
```

Smoke Windows (Python + uvicorn em job):

```powershell
$env:PORT='3055'
.\scripts\smoke-api.ps1
```

Webhooks (HMAC): definir `PLX_WEBHOOK_URL` (+ opcional `PLX_WEBHOOK_SECRET`) — ver `transcribe-service/README.md` e `transcribe-service/.env.example`.

## Documentos

- `docs/PUBLIC-RESEARCH-TURBOSCRIBE.md`
- `docs/ARCHITECTURE-PLX.md`
- `docs/FEATURE-BACKLOG-BRUTAL.md`
- `docs/OPERATIONS-COMMERCIAL.md`
