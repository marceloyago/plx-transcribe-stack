# plx-transcribe-stack — PlayLoadX

Stack inspirada em capacidades **públicas** do ecossistema tipo **TurboScribe** (turboscribe.ai), com implementação **própria** e **motor em Python real** (faster-whisper), sem caminho principal em “stub”.

**Regra 0 (lei MSI):** `../openclaw-workspace/docs/REGRA-0-NO-STUB-PYTHON-HIL-REGISTRY.md` — Python para ML/áudio; human-in-the-loop; registry de peers; cada agente/projeto conhece os outros.

© 2024-2026 PlayLoadX

## API (canónica)

Pasta **`transcribe-service/`** — FastAPI, `POST /v1/jobs` (multipart com ficheiro real), `GET /v1/jobs/{id}`, `GET /v1/peers`, `POST /v1/jobs/{id}/human-approve` (quando `PLX_REQUIRE_HUMAN_APPROVAL=1`).

Ver `transcribe-service/README.md`.

## Contratos TypeScript

- `contracts/` — tipos partilhados (SRT, domínio legado; alinhar enums com Python em evoluções).

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

## Documentos

- `docs/PUBLIC-RESEARCH-TURBOSCRIBE.md`
- `docs/ARCHITECTURE-PLX.md`
- `docs/FEATURE-BACKLOG-BRUTAL.md`
