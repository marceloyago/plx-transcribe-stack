# Pesquisa pública — referência tipo TurboScribe

**PlayLoadX** — © 2024-2026

## Limite ético e legal

- Fontes: **site oficial**, **help/support**, **blog** público.
- **Não** há, na documentação oficial, API pública: *"TurboScribe does not offer an API or automated access"* ([support](https://turboscribe.ai/support)).
- **Não** faz parte deste projeto: procurar endpoints ocultos, contornar login, ou “camadas duvidosas”.

## Matriz de capacidades (descritas publicamente)

| Área | Comportamento descrito (público) | Sinergia para o teu produto |
|------|-----------------------------------|-----------------------------|
| Upload | Drag-and-drop; até **5 GB**; limite free vs unlimited | Presigned S3/R2; validação MIME; chunk upload |
| Idioma áudio | Escolher idioma do áudio evita transcript errado | `language` obrigatório na job; detecção opcional |
| Modos | **Cheetah / Dolphin / Whale** (velocidade vs precisão) | Mapear para `tiny/base/small` vs `large-v3` ou provedores |
| Diarização | Nº de speakers ou **Detect Automatically** | pyannote / NeMo / provedor cloud com diarization |
| Áudio | **Restore Audio** (IA melhora fala) | pré-processamento: RNNoise, DeepFilterNet, ou API |
| Tradução | Tool no transcript; **Transcribe to English** nas settings | passo 2 pós-transcrição (NLLB, DeepL API, etc.) |
| Batch | Até **50** ficheiros; export pastas até **1000** | fila + worker pool; ZIP export assíncrono |
| Legendas | **SRT** com opções (palavras/linha, duração, chars, sentence-aware) | gerador SRT/VTT com resegmentação |
| Organização | Pastas | `folder_id` no modelo de dados |
| Segurança (claims) | Encriptação em repouso (ex.: AES-256 citado no FAQ) | KMS + encryption at rest no storage |

## Diferencial competitivo (legítimo)

Como o referência **não** expõe API ao cliente, o **plx-transcribe-stack** pode posicionar-se como:

- API REST + webhooks para **automação** (CI, podcasts, contact centers).
- **Self-host** + BYOK (já alinhado ao teu ecossistema CodeForge/OpenRouter).
- **Auditoria** e retenção configurável (empresas, RGPD).
