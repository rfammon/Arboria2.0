#!/bin/bash
# BMAD Tool Manager Wrapper Script
# Wrapper para gerenciar ferramentas MCP dinamicamente

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/dynamic_tool_manager.py"
CONFIG_FILE="$SCRIPT_DIR/mcp_dynamic_config.json"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica se Python está disponível
check_python() {
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 não encontrado!"
        exit 1
    fi
}

# Inicializa o gerenciador
init_manager() {
    check_python
    if [ ! -f "$PYTHON_SCRIPT" ]; then
        log_error "Script do gerenciador não encontrado: $PYTHON_SCRIPT"
        exit 1
    fi
}

# Mostra status
cmd_status() {
    init_manager
    python3 "$PYTHON_SCRIPT" status
}

# Otimiza ferramentas
cmd_optimize() {
    init_manager
    log_info "Executando otimização automática..."
    python3 "$PYTHON_SCRIPT" optimize
}

# Configura para modelo específico
cmd_configure() {
    if [ -z "$2" ]; then
        log_error "Nome do modelo não especificado!"
        echo "Uso: $0 configure <model-name>"
        echo "Exemplo: $0 configure claude-opus-4-5-thinking"
        exit 1
    fi
    
    init_manager
    log_info "Configurando para modelo: $2"
    python3 "$PYTHON_SCRIPT" configure "$2"
}

# Registra uso de ferramenta
cmd_record() {
    if [ -z "$2" ]; then
        log_error "Nome da ferramenta não especificado!"
        echo "Uso: $0 record <tool-name> [duration] [success]"
        exit 1
    fi
    
    init_manager
    duration="${3:-0}"
    success="${4:-1}"
    python3 "$PYTHON_SCRIPT" record "$2" "$duration" "$success"
}

# Desabilita ferramenta
cmd_disable() {
    if [ -z "$2" ]; then
        log_error "Nome da ferramenta não especificado!"
        echo "Uso: $0 disable <tool-name>"
        exit 1
    fi
    
    init_manager
    python3 "$PYTHON_SCRIPT" disable "$2"
}

# Habilita ferramenta
cmd_enable() {
    if [ -z "$2" ]; then
        log_error "Nome da ferramenta não especificado!"
        echo "Uso: $0 enable <tool-name>"
        exit 1
    fi
    
    init_manager
    python3 "$PYTHON_SCRIPT" enable "$2"
}

# Gera configuração MCP otimizada
cmd_generate_config() {
    if [ -z "$2" ]; then
        log_error "Arquivo de configuração base não especificado!"
        echo "Uso: $0 generate-config <base-config-path>"
        exit 1
    fi
    
    init_manager
    log_info "Gerando configuração baseada em: $2"
    
    # Cria script Python temporário para geração
    python3 << EOF
import json
import sys
sys.path.insert(0, '$SCRIPT_DIR')
from dynamic_tool_manager import DynamicToolManager, generate_mcp_config

manager = DynamicToolManager()
config = generate_mcp_config(manager, '$2')
print(json.dumps(config, indent=2))
EOF
}

# Configura automaticamente para antigravity
cmd_setup_antigravity() {
    init_manager
    
    log_info "Configurando para antigravity (Claude Opus 4.5 thinking)..."
    
    # Desabilita ferramentas problemáticas
    python3 "$PYTHON_SCRIPT" disable clipboard 2>/dev/null || true
    python3 "$PYTHON_SCRIPT" disable ask_image 2>/dev/null || true
    python3 "$PYTHON_SCRIPT" disable ask_file 2>/dev/null || true
    python3 "$PYTHON_SCRIPT" disable read_image 2>/dev/null || true
    python3 "$PYTHON_SCRIPT" disable image_to_text 2>/dev/null || true
    python3 "$PYTHON_SCRIPT" disable extract_images 2>/dev/null || true
    
    # Configura modelo
    python3 "$PYTHON_SCRIPT" configure "claude-opus-4-5-thinking"
    
    log_info "Configuração para antigravity concluída!"
    echo ""
    echo "Ferramentas desabilitadas:"
    echo "  - clipboard (não suportado pelo modelo)"
    echo "  - ask_image (não suportado pelo modelo)"
    echo "  - ask_file (não suportado pelo modelo)"
    echo ""
    echo "Ferramentas seguras habilitadas:"
    echo "  - read, write, edit, glob, grep, bash"
}

# Mostra ajuda
cmd_help() {
    echo "BMAD Dynamic Tool Manager"
    echo ""
    echo "Uso: $0 <comando> [argumentos]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  status              - Mostra relatório de status das ferramentas"
    echo "  optimize            - Executa otimização automática"
    echo "  configure <model>   - Configura ferramentas para modelo específico"
    echo "  record <tool> [d] [s] - Registra uso de ferramenta"
    echo "  disable <tool>      - Desabilita uma ferramenta"
    echo "  enable <tool>       - Habilita uma ferramenta"
    echo "  generate-config <f> - Gera configuração MCP otimizada"
    echo "  setup-antigravity   - Configura para antigravity (Claude Opus)"
    echo "  help                - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 status"
    echo "  $0 setup-antigravity"
    echo "  $0 configure claude-opus-4-5-thinking"
    echo "  $0 disable clipboard"
}

# Main
case "$1" in
    status)
        cmd_status
        ;;
    optimize)
        cmd_optimize
        ;;
    configure)
        cmd_configure "$@"
        ;;
    record)
        cmd_record "$@"
        ;;
    disable)
        cmd_disable "$@"
        ;;
    enable)
        cmd_enable "$@"
        ;;
    generate-config)
        cmd_generate_config "$@"
        ;;
    setup-antigravity)
        cmd_setup_antigravity
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        log_error "Comando desconhecido: $1"
        cmd_help
        exit 1
        ;;
esac
