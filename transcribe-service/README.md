# plx-transcribe-service (Python real)

**Regra 0:** sem transcrição falsa; falhas honestas; human-in-the-loop opcional; registry de peers.

© 2024-2026 PlayLoadX

## Arranque

```bash
cd transcribe-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
uvicorn plx_transcribe.main:app --host 0.0.0.0 --port 3055 --reload
```

## Variáveis (prefixo `PLX_`)

| Variável | Significado |
|----------|-------------|
| `WHISPER_MODEL_SIZE` | `tiny` / `base` / `small` / `medium` / `large-v3` |
| `WHISPER_DEVICE` | `cpu` ou `cuda` |
| `WHISPER_COMPUTE_TYPE` | `int8`, `float16`, … |
| `REQUIRE_HUMAN_APPROVAL` | `1` — após transcrição fica `awaiting_human_review` até aprovação |
| `PEERS_REGISTRY_PATH` | Caminho para YAML (ver `openclaw-workspace/registry/plx-ecosystem.example.yaml`) |
| `SERVICE_ID` | id deste serviço (ex.: `plx-transcribe-service`) |
| `PUBLIC_BASE_URL` | URL pública deste serviço |
| `SKIP_WHISPER_LOAD` | `1` só em CI — health indica `whisper_ready=false` |

## API

- `GET /health`
- `POST /v1/jobs` — `multipart/form-data`: ficheiro `file` + campos `audio_language`, `mode` (`cheetah`|`dolphin`|`whale`)
- `GET /v1/jobs/{id}`
- `POST /v1/jobs/{id}/human-approve` — quando `REQUIRE_HUMAN_APPROVAL=1`
- `GET /v1/peers`

## Testes

```bash
pytest -q
```
