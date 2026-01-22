#!/usr/bin/env python3
"""
Antigravity Error Fixer
Resolve o problema: "Cannot read clipboard (this model does not support image input)"
"""

import json
import os
from pathlib import Path

# Caminhos
OPENCODE_CONFIG = (
    Path(__file__).parent.parent.parent / ".opencode" / "oh-my-opencode.json"
)
MCP_CONFIG_DIR = Path(__file__).parent.parent.parent / "MCP_Export_20260121_0726"


def fix_clipboard_error():
    """
    Corrige o erro de clipboard para o modelo antigravity
    """
    print("🔧 BMAD Antigravity Error Fixer")
    print("=" * 50)
    print()

    # Ferramentas que causam o erro de clipboard
    problematic_tools = [
        "clipboard",
        "ask_image",
        "ask_file",
        "read_clipboard",
        "filesystem_read_media_file",
    ]

    print("📋 Ferramentas problemáticas identificadas:")
    for tool in problematic_tools:
        print(f"  ❌ {tool}")
    print()

    # Cria configuração específica para antigravity
    antigravity_config = {
        "model": "google/antigravity-claude-opus-4-5-thinking",
        "disabled_tools": problematic_tools,
        "safe_alternatives": {
            "clipboard": ["read_text_file", "bash"],
            "ask_image": ["ask_text"],
            "ask_file": ["glob", "filesystem_search_files"],
        },
        "capabilities": {
            "image_input": False,
            "clipboard": False,
            "text_input": True,
            "file_read": True,
            "file_write": True,
            "command_exec": True,
            "web_search": True,
        },
        "recommended_tools": [
            "filesystem_read_file",
            "filesystem_write_file",
            "filesystem_edit_file",
            "filesystem_search_files",
            "grep",
            "bash",
            "task",
        ],
    }

    # Salva configuração específica
    config_path = Path(__file__).parent / "antigravity_config.json"
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(antigravity_config, f, indent=2, ensure_ascii=False)

    print(f"✅ Configuração salva em: {config_path}")
    print()

    # Atualiza configuração do OpenCode se possível
    if OPENCODE_CONFIG.exists():
        try:
            with open(OPENCODE_CONFIG, "r", encoding="utf-8") as f:
                config = json.load(f)

            # Adiciona configuração específica para Sisyphus
            if "agents" not in config:
                config["agents"] = {}

            config["agents"]["Sisyphus"] = {
                "model": "google/antigravity-claude-opus-4-5-thinking",
                "system_prompt": "Especialista técnico Claude Opus 4.5 thinking. NÃO USE ferramentas de clipboard ou imagem. Use apenas ferramentas de leitura/escrita de arquivos e busca.",
                "disabled_capabilities": [
                    "image_input",
                    "clipboard",
                    "ask_image",
                    "ask_file",
                ],
            }

            with open(OPENCODE_CONFIG, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            print(f"✅ Configuração do OpenCode atualizada: {OPENCODE_CONFIG}")
        except Exception as e:
            print(f"⚠️  Erro ao atualizar OpenCode: {e}")

    print()
    print("📝 Resumo das correções:")
    print("  • Ferramentas de clipboard desabilitadas")
    print("  • Alternativas seguras configuradas")
    print("  • Prompts atualizados para evitar uso de imagem")
    print()
    print("🔄 Recomendação: Reinicie o agente para aplicar as mudanças")

    return antigravity_config


def create_tool_whitelist():
    """
    Cria lista de ferramentas permitidas para antigravity
    """
    whitelist = {
        "version": "1.0",
        "model": "claude-opus-4-5-thinking",
        "allowed_tools": {
            "filesystem": [
                "filesystem_read_file",
                "filesystem_write_file",
                "filesystem_edit_file",
                "filesystem_search_files",
                "filesystem_list_directory",
                "filesystem_directory_tree",
                "filesystem_get_file_info",
            ],
            "search": ["grep", "glob", "ast_grep_search", "ast_grep_replace"],
            "execution": ["bash", "task", "background_task"],
            "web": ["websearch", "webfetch", "codesearch"],
            "agents": ["delegate", "delegation_read", "delegation_list"],
            "session": ["read_session", "handoff_session"],
            "system": ["look_at", "todowrite", "todoread"],
        },
        "forbidden_tools": [
            "clipboard",
            "ask_image",
            "ask_file",
            "read_clipboard",
            "write_clipboard",
            "filesystem_read_media_file",
            "filesystem_read_image",
            "take_screenshot",
        ],
        "tool_limits": {"max_concurrent": 5, "max_per_minute": 30, "max_per_hour": 200},
    }

    whitelist_path = Path(__file__).parent / "antigravity_whitelist.json"
    with open(whitelist_path, "w", encoding="utf-8") as f:
        json.dump(whitelist, f, indent=2, ensure_ascii=False)

    print(f"✅ Lista de ferramentas permitida criada: {whitelist_path}")
    return whitelist


if __name__ == "__main__":
    fix_clipboard_error()
    print()
    create_tool_whitelist()
