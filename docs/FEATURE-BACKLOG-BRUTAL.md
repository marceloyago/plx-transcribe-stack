# Backlog brutal — fases

**PlayLoadX** — © 2024-2026

## Fase 0 — Fundação (já espelhada em `contracts/`)

- Modelo de job, estados, erros tipados.
- Modos de transcrição (`cheetah` | `dolphin` | `whale` como nomes de produto).

## Fase 1 — MVP API (em curso)

- [x] `POST /v1/jobs` (JSON + `sourceObjectKey`; upload multipart / URL assinada — pendente).
- [x] `GET /v1/jobs/:id` (polling; SSE — pendente).
- [ ] Webhook HMAC opcional.

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
