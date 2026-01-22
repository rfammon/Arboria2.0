# BMAD Dynamic Tool Manager - README

## Problema Resolvido
**Erro:** `ERROR: Cannot read "clipboard" (this model does not support image input)`

**Causa:** O modelo `claude-opus-4-5-thinking` (antigravity) não suporta entrada de imagem/clipboard, mas alguma ferramenta estava tentando usar essa funcionalidade.

## Arquivos Criados

### 1. `dynamic_tool_manager.py`
Gerenciador principal de ferramentas MCP com as seguintes funcionalidades:
- Monitoramento de uso de ferramentas
- Fechamento automático de ferramentas inativas
- Configuração por modelo
- Relatórios de status
- Otimização automática

### 2. `tool_manager.sh`
Wrapper bash para facilitar uso do gerenciador:
```bash
./tool_manager.sh status              # Ver status
./tool_manager.sh optimize            # Otimizar automaticamente
./tool_manager.sh setup-antigravity   # Configurar para antigravity
./tool_manager.sh disable <tool>      # Desabilitar ferramenta
./tool_manager.sh enable <tool>       # Habilitar ferramenta
```

### 3. `antigravity_tool_config.yaml`
Configuração específica para o modelo antigravity:
- Ferramentas a desabilitar
- Ferramentas seguras alternativas
- Prioridades por categoria
- Limites de uso

### 4. `fix_antigravity_error.py`
Script de correção específico para o erro de clipboard:
```bash
python fix_antigravity_error.py
```

### 5. `antigravity_config.json`
Configuração gerada com ferramentas permitidas e proibidas.

## Uso Rápido

### Corrigir o erro do antigravity
```bash
# Opção 1: Usar script de correção
cd .bmad/core/tools
python fix_antigravity_error.py

# Opção 2: Usar setup do gerenciador
cd .bmad/core/tools
./tool_manager.sh setup-antigravity
```

### Ver status das ferramentas
```bash
./tool_manager.sh status
```

### Gerenciamento manual
```bash
# Desabilitar ferramenta problemática
./tool_manager.sh disable clipboard

# Habilitar novamente quando necessário
./tool_manager.sh enable clipboard

# Configurar para outro modelo
./tool_manager.sh configure gemini-1.5-pro
```

## Sistema de Fechamento Automático

O gerenciador fecha temporariamente ferramentas quando:
1. **Inativas por muito tempo:** Mais de 7 dias sem uso
2. **Baixo uso:** Menos de 10 utilizações
3. **Alta taxa de erro:** Mais de 20% de falhas
4. **Limite atingido:** Mais de 15 ferramentas ativas simultaneamente

### Categorias e Limites
| Categoria | Mín Ativas | Máx Ativas |
|-----------|-----------|-----------|
| core      | 4         | 6         |
| search    | 1         | 2         |
| agent     | 1         | 2         |
| system    | 1         | 2         |

## Configuração por Modelo

### Claude Opus 4.5 Thinking (Antigravity)
❌ **Desabilitado:** clipboard, ask_image, ask_file, image_input
✅ **Habilitado:** read, write, edit, glob, grep, bash, task

### Gemini 3 Flash
✅ **Suporta:** Imagem, clipboard, texto
⚠️  **Recomendação:** Usar para tarefas multimídia

### Gemini 1.5 Pro
✅ **Suporta:** Imagem, clipboard, texto
⚠️  **Recomendação:** Usar para tarefas complexas

## Troubleshooting

### Problema: "Cannot read clipboard"
1. Execute: `./tool_manager.sh setup-antigravity`
2. Reinicie o agente
3. Verifique: `./tool_manager.sh status`

### Problema: Ferramenta não funciona
1. Verifique status: `./tool_manager.sh status`
2. Habilite: `./tool_manager.sh enable <nome>`
3. Teste novamente

### Problema: Muitas ferramentas ativas
1. Execute otimização: `./tool_manager.sh optimize`
2. Verifique recomendações: `./tool_manager.sh status`

## Integração com BMAD

O gerenciador se integra com:
- **OpenCode:** Configura agentes automaticamente
- **MCP Servers:** Gerencia servidores MCP
- **Agentes BMM:** Configura capacidades por agente

## Manutenção

### Verificar saúde do sistema
```bash
./tool_manager.sh status
```

### Otimizar semanalmente
```bash
./tool_manager.sh optimize
```

### Backup da configuração
A configuração é salva automaticamente em:
- `mcp_dynamic_config.json`
- `tool_usage_log.json`

## Suporte

Para problemas:
1. Execute `./tool_manager.sh status`
2. Verifique recomendações no output
3. Execute `./tool_manager.sh optimize`
4. Se persistir, reporte com o output do status
