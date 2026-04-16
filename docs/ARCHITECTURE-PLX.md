# Arquitetura — plx-transcribe-stack

**PlayLoadX** — © 2024-2026

## Visão

```mermaid
flowchart LR
  subgraph clients [Clientes]
    Web[Web UI]
    API[API Clients]
  end
  subgraph edge [Edge]
    GW[API Gateway + Auth]
  end
  subgraph core [Core]
    Q[Job Queue]
    W[Workers Transcribe]
  end
  subgraph data [Dados]
    OBJ[(Object Storage)]
    PG[(Postgres)]
  end
  Web --> GW
  API --> GW
  GW --> Q
  Q --> W
  W --> OBJ
  W --> PG
```

## Camadas

1. **Ingestão** — upload multipart ou URL assinada; vírus scan opcional; limite de tamanho por plano.
2. **Orquestração** — estado da job: `queued` → `preprocessing` → `transcribing` → `postprocess` → `done` / `failed`.
3. **Motor** — Whisper local (CUDA/CPU), ou provedor; modo mapeado para modelo/custo.
4. **Pós-processo** — diarização, tradução, SRT, resegmentação.
5. **Entrega** — download, webhook `job.completed`, export ZIP.

## Segurança

- JWT ou sessão; quotas por `tenant_id`.
- Segredos só em env / vault; nunca em repo.
- Logs sem conteúdo de transcript.
