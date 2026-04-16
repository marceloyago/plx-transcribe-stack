# Operações comerciais — plx-transcribe-stack

Checklist mínimo antes de expor a clientes pagantes. © 2024-2026 PlayLoadX

## Infra

- **HTTPS** obrigatório na borda (reverse proxy / CDN); `PLX_PUBLIC_BASE_URL` com `https://`.
- **Docker:** `cp deploy.env.example .env`, preencher segredos, `docker compose up -d --build`.
- **GPU:** em `PLX_WHISPER_DEVICE=cuda` usar imagem base com drivers NVIDIA (Compose `deploy.resources.reservations.devices` ou VM dedicada).

## Segurança

- **`PLX_INTERNAL_API_KEY`:** definir em produção; user clients enviam `X-Plx-Api-Key` (ver `contracts/plxTranscribeClient.ts`).
- **`PLX_CORS_ALLOW_ORIGINS`:** lista CSV das origens do front; nunca deixar `*` em público.
- **`PLX_WEBHOOK_SECRET` + HMAC:** validar assinatura no receiver antes de processar eventos.
- **Multi-tenant:** usar cabeçalho `x-tenant-id` por cliente; auditar logs sem gravar áudio em disco além do necessário.

## Observabilidade

- Health: `GET /health` (probes Kubernetes / balanceador).
- Métricas: expor Prometheus via sidecar ou proxy (não incluído no MVP — roadmap).
- Logs estruturados JSON no próximo passo recomendado.

## Contrato com user client

- Importar `createPlxTranscribeClient` de `contracts/plxTranscribeClient.ts` (copiar ficheiro ou submodule git).
- Variável `NEXT_PUBLIC_PLX_TRANSCRIBE_URL` (ou equivalente) = URL público da API.

## Conformidade / produto

- Política de retenção de jobs (hoje em memória — reinício perde estado; produção exige fila + BD).
- RGPD / consentimento para processamento de voz, se aplicável.
