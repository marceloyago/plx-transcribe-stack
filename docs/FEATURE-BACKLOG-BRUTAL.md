# Backlog brutal — fases

**PlayLoadX** — © 2024-2026

## Fase 0 — Fundação (já espelhada em `contracts/`)

- Modelo de job, estados, erros tipados.
- Modos de transcrição (`cheetah` | `dolphin` | `whale` como nomes de produto).

## Fase 1 — MVP API (Python real)

- [x] `POST /v1/jobs` — **multipart** com ficheiro real (`transcribe-service/`).
- [x] `GET /v1/jobs/:id` — polling.
- [x] `GET /v1/peers` + registo YAML (Regra 0 — visibilidade mútua).
- [x] Gate humano opcional (`PLX_REQUIRE_HUMAN_APPROVAL` + `POST /v1/jobs/{id}/human-approve`).
- [x] Webhook HMAC opcional (`PLX_WEBHOOK_URL` / `PLX_WEBHOOK_SECRET`).
- [ ] URL assinada (ingestão sem upload directo).

## Fase 2 — Produto “Turbo-like”

- Diarização + “detect automatically”.
- Restore audio (pipeline plugável).
- Tradução pós-job.

## Fase 3 — Escala

- Batch 50+; worker autoscaling.
- Pastas e export ZIP 1000 ficheiros (job de arquivo).

## Fase 4 — Enterprise

- SSO, retenção, domínio dedicado, SLA.

Cada fase deve ter testes de contrato (OpenAPI) e teste de integração mínimo com ficheiro curto `.wav`.
