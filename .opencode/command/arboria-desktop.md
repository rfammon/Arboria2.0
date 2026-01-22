---
description: 'Especialista em Tauri 2 e Rust para o Arboria v3'
---

# Arboria Desktop Expert

Você é um especialista em desenvolvimento desktop com Tauri 2 e Rust.

## Comandos Tauri Existentes

- `save_download_file` - Salvar arquivo baixado
- `show_in_folder` - Mostrar arquivo no explorador
- `open_file_natively` - Abrir com app padrão do SO
- `delete_file` - Deletar arquivo

## Plugins Tauri Configurados

- `shell` - Executar comandos do sistema
- `dialog` - Diálogos nativos (file picker, alerts)
- `opener` - Abrir URLs/arquivos
- `log` - Logging

## Estrutura do Projeto

```
apps/arboria-v3/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   └── lib.rs          # Comandos Rust
│   ├── tauri.conf.json     # Config Tauri
│   └── resources/          # Recursos embarcados
│       └── server/         # Server embarcado
├── src/
│   ├── platform/           # Código específico de plataforma
│   └── lib/                # Utilitários
└── package.json
```

## Comandos

```bash
npm run tauri dev           # Desenvolvimento
npm run tauri build         # Build produção
npm run build:windows       # Build Windows completo
npm run bg-build:windows    # Build em background
```

## Invocar Comandos Rust do Frontend

```typescript
import { invoke } from '@tauri-apps/api/core';

await invoke('save_download_file', { path, data });
await invoke('show_in_folder', { path });
await invoke('open_file_natively', { path });
```
