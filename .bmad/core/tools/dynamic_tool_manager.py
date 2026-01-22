#!/usr/bin/env python3
"""
BMAD Dynamic Tool Manager
Sistema de gerenciamento dinâmico de ferramentas MCP
Fecha temporariamente ferramentas menos usadas e gerencia limites
"""

import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field, asdict
from collections import defaultdict
import threading

# Configuração
CONFIG_PATH = Path(__file__).parent / "mcp_dynamic_config.json"
USAGE_LOG_PATH = Path(__file__).parent / "tool_usage_log.json"
THRESHOLD_USAGE_COUNT = 50  # Fechar ferramentas com menos de 50 usos
THRESHOLD_IDLE_DAYS = 7  # Fechar ferramentas inativas por 7 dias
CACHE_TTL_SECONDS = 300  # 5 minutos de cache

@dataclass
class ToolStats:
    """Estatísticas de uso de uma ferramenta"""
    name: str
    use_count: int = 0
    last_used: Optional[str] = None
    total_duration_ms: float = 0.0
    error_count: int = 0
    success_rate: float = 100.0
    category: str = "general"
    priority: int = 1  # 1 = alta, 2 = média, 3 = baixa
    is_active: bool = True
    last_checked: Optional[str] = None

@dataclass
class ToolCategory:
    """Categoria de ferramentas"""
    name: str
    tools: List[str] = field(default_factory=list)
    min_active: int = 1
    max_active: int = 3

class DynamicToolManager:
    """Gerenciador dinâmico de ferramentas MCP"""
    
    def __init__(self):
        self.tool_stats: Dict[str, ToolStats] = {}
        self.categories: Dict[str, ToolCategory] = {}
        self.usage_cache: Dict[str, float] = {}
        self.lock = threading.Lock()
        self._load_config()
        self._load_usage_log()
        self._init_categories()
    
    def _load_config(self):
        """Carrega configuração existente"""
        if CONFIG_PATH.exists():
            try:
                with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for name, stats_data in data.get('tools', {}).items():
                        self.tool_stats[name] = ToolStats(**stats_data)
            except Exception as e:
                print(f"Erro ao carregar configuração: {e}")
    
    def _save_config(self):
        """Salva configuração"""
        with self.lock:
            config_data = {
                'tools': {name: asdict(stats) for name, stats in self.tool_stats.items()},
                'categories': {name: asdict(cat) for name, cat in self.categories.items()},
                'last_updated': datetime.now().isoformat()
            }
            with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=2, ensure_ascii=False)
    
    def _load_usage_log(self):
        """Carrega histórico de uso"""
        if USAGE_LOG_PATH.exists():
            try:
                with open(USAGE_LOG_PATH, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for entry in data.get('usage', []):
                        tool_name = entry.get('tool')
                        if tool_name:
                            if tool_name not in self.tool_stats:
                                self.tool_stats[tool_name] = ToolStats(name=tool_name)
                            self.tool_stats[tool_name].use_count += 1
                            if 'timestamp' in entry:
                                self.tool_stats[tool_name].last_used = entry['timestamp']
            except Exception as e:
                print(f"Erro ao carregar histórico: {e}")
    
    def _init_categories(self):
        """Inicializa categorias de ferramentas"""
        default_categories = [
            ToolCategory("filesystem", ["filesystem", "read", "write", "edit", "glob", "grep"], 2, 3),
            ToolCategory("mcp_core", ["context7", "sequential-thinking", "supabase-mcp-server"], 2, 2),
            ToolCategory("web", ["websearch", "webfetch", "codesearch"], 1, 2),
            ToolCategory("github", ["github-mcp-server"], 1, 1),
            ToolCategory("devtools", ["debugger", "chrome-devtools"], 1, 2),
            ToolCategory("cloud", ["render", "deepwiki"], 1, 1),
            ToolCategory("mobile", ["android"], 1, 1),
        ]
        for cat in default_categories:
            self.categories[cat.name] = cat
    
    def record_usage(self, tool_name: str, duration_ms: float = 0, success: bool = True):
        """Registra uso de uma ferramenta"""
        with self.lock:
            current_time = datetime.now().isoformat()
            
            if tool_name not in self.tool_stats:
                self.tool_stats[tool_name] = ToolStats(name=tool_name)
            
            stats = self.tool_stats[tool_name]
            stats.use_count += 1
            stats.last_used = current_time
            stats.total_duration_ms += duration_ms
            if not success:
                stats.error_count += 1
            
            # Calcula taxa de sucesso
            if stats.use_count > 0:
                stats.success_rate = ((stats.use_count - stats.error_count) / stats.use_count) * 100
            
            stats.last_checked = current_time
    
    def get_active_tools(self, limit: int = 10) -> List[str]:
        """Retorna ferramentas mais ativas"""
        sorted_tools = sorted(
            self.tool_stats.items(),
            key=lambda x: (x[1].priority, -x[1].use_count, x[1].last_used or ""),
            reverse=False
        )
        return [name for name, _ in sorted_tools[:limit]]
    
    def get_inactive_tools(self) -> List[str]:
        """Retorna ferramentas inativas ou pouco usadas"""
        inactive = []
        current_time = datetime.now()
        
        for name, stats in self.tool_stats.items():
            if not stats.is_active:
                continue
            
            # Verifica se está inativa por tempo
            if stats.last_used:
                last_used = datetime.fromisoformat(stats.last_used)
                if (current_time - last_used) > timedelta(days=THRESHOLD_IDLE_DAYS):
                    inactive.append(name)
                    continue
            
            # Verifica se tem pouco uso
            if stats.use_count < THRESHOLD_USAGE_COUNT and stats.use_count > 0:
                # Só marca como inativa se não foi usada recentemente
                if stats.last_used:
                    last_used = datetime.fromisoformat(stats.last_used)
                    if (current_time - last_used) > timedelta(days=1):
                        inactive.append(name)
        
        return inactive
    
    def disable_tool(self, tool_name: str) -> bool:
        """Desabilita uma ferramenta"""
        if tool_name in self.tool_stats:
            self.tool_stats[tool_name].is_active = False
            self._save_config()
            return True
        return False
    
    def enable_tool(self, tool_name: str) -> bool:
        """Habilita uma ferramenta"""
        if tool_name in self.tool_stats:
            self.tool_stats[tool_name].is_active = True
            self._save_config()
            return True
        return False
    
    def optimize_for_model(self, model_name: str) -> Dict[str, List[str]]:
        """Otimiza ferramentas para um modelo específico"""
        # Modelos que não suportam imagem
        no_image_support = ["claude-opus-4-5-thinking", "gemini-3-flash"]
        
        # Modelos com limitações
        limited_models = {
            "claude-opus-4-5-thinking": {
                "disable": ["clipboard", "ask_image", "ask_file"],
                "prefer": ["read", "write", "grep", "glob"]
            },
            "gemini-3-flash": {
                "disable": ["clipboard", "ask_image"],
                "prefer": ["read", "write"]
            }
        }
        
        result = {"disable": [], "enable": []}
        
        if any(lim_model in model_name.lower() for lim_model in no_image_support):
            for tool in self.tool_stats.keys():
                # Desabilita ferramentas de imagem
                if any(img_term in tool.lower() for img_term in ["image", "clipboard", "picture", "screenshot"]):
                    if self.tool_stats[tool].is_active:
                        self.disable_tool(tool)
                        result["disable"].append(tool)
        
        return result
    
    def get_status_report(self) -> Dict:
        """Gera relatório de status"""
        current_time = datetime.now()
        active_count = sum(1 for s in self.tool_stats.values() if s.is_active)
        inactive_tools = self.get_inactive_tools()
        
        # Agrupa por categoria
        by_category = defaultdict(list)
        for name, stats in self.tool_stats.items():
            category = "uncategorized"
            for cat_name, cat in self.categories.items():
                if name in cat.tools:
                    category = cat_name
                    break
            by_category[category].append({
                "name": name,
                "use_count": stats.use_count,
                "is_active": stats.is_active,
                "success_rate": stats.success_rate
            })
        
        return {
            "timestamp": current_time.isoformat(),
            "total_tools": len(self.tool_stats),
            "active_tools": active_count,
            "inactive_tools": len(inactive_tools),
            "inactive_list": inactive_tools,
            "by_category": dict(by_category),
            "recommendations": self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Gera recomendações de otimização"""
        recommendations = []
        
        # Ferramentas com baixa taxa de sucesso
        low_success = [name for name, s in self.tool_stats.items() 
                      if s.success_rate < 80 and s.use_count > 10]
        if low_success:
            recommendations.append(f"Revisar ferramentas com baixa taxa de sucesso: {', '.join(low_success)}")
        
        # Ferramentas inativas há muito tempo
        long_inactive = [name for name, s in self.tool_stats.items() 
                        if s.last_used and s.is_active]
        if len(long_inactive) > 5:
            recommendations.append("Considere desabilitar ferramentas não utilizadas recentemente")
        
        return recommendations
    
    def auto_optimize(self) -> Dict[str, List[str]]:
        """Otimização automática"""
        changes = {"disabled": [], "enabled": []}
        
        # Desabilita ferramentas inativas
        inactive = self.get_inactive_tools()
        for tool in inactive:
            if self.disable_tool(tool):
                changes["disabled"].append(tool)
        
        # Habilita ferramentas populares se necessário
        if len([s for s in self.tool_stats.values() if s.is_active]) < 5:
            sorted_tools = sorted(
                self.tool_stats.items(),
                key=lambda x: x[1].use_count,
                reverse=True
            )
            for name, stats in sorted_tools:
                if not stats.is_active and stats.use_count > 20:
                    if self.enable_tool(name):
                        changes["enabled"].append(name)
        
        return changes


def generate_mcp_config(manager: DynamicToolManager, base_config_path: str = None) -> Dict:
    """Gera configuração MCP otimizada baseada no uso"""
    
    # Carrega configuração base
    if base_config_path and Path(base_config_path).exists():
        with open(base_config_path, 'r', encoding='utf-8') as f:
            base_config = json.load(f)
    else:
        base_config = {"mcpServers": {}}
    
    # Aplica otimizações
    for server_name, server_config in base_config.get("mcpServers", {}).items():
        if server_name in manager.tool_stats:
            stats = manager.tool_stats[server_name]
            
            # Desabilita servidores inativos
            if not stats.is_active:
                server_config["disabled"] = True
            elif stats.error_count > stats.use_count * 0.2:
                # Desabilita se tem mais de 20% de erro
                if "disabled" not in server_config:
                    server_config["disabled"] = True
    
    return base_config


def main():
    """Função principal"""
    import sys
    
    manager = DynamicToolManager()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "status":
            report = manager.get_status_report()
            print(json.dumps(report, indent=2, ensure_ascii=False))
        
        elif command == "optimize":
            changes = manager.auto_optimize()
            print(json.dumps(changes, indent=2, ensure_ascii=False))
        
        elif command == "record" and len(sys.argv) > 2:
            tool_name = sys.argv[2]
            duration = float(sys.argv[3]) if len(sys.argv) > 3 else 0
            success = sys.argv[4] != "0" if len(sys.argv) > 4 else True
            manager.record_usage(tool_name, duration, success)
            print(f"Registrado uso de: {tool_name}")
        
        elif command == "disable" and len(sys.argv) > 2:
            tool_name = sys.argv[2]
            if manager.disable_tool(tool_name):
                print(f"Ferramenta desabilitada: {tool_name}")
            else:
                print(f"Ferramenta não encontrada: {tool_name}")
        
        elif command == "enable" and len(sys.argv) > 2:
            tool_name = sys.argv[2]
            if manager.enable_tool(tool_name):
                print(f"Ferramenta habilitada: {tool_name}")
            else:
                print(f"Ferramenta não encontrada: {tool_name}")
        
        elif command == "configure" and len(sys.argv) > 2:
            model_name = sys.argv[2]
            result = manager.optimize_for_model(model_name)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        else:
            print("Comandos disponíveis:")
            print("  status           - mostra relatório de status")
            print("  optimize         - executa otimização automática")
            print("  record <tool>    - registra uso de ferramenta")
            print("  disable <tool>   - desabilita ferramenta")
            print("  enable <tool>    - habilita ferramenta")
            print("  configure <model> - configura para modelo específico")
    else:
        # Modo interativo
        print("BMAD Dynamic Tool Manager")
        print("Digite 'status', 'optimize' ou 'quit'")
        
        while True:
            try:
                cmd = input("> ").strip()
                if cmd == "quit" or cmd == "exit":
                    break
                elif cmd == "status":
                    report = manager.get_status_report()
                    print(json.dumps(report, indent=2, ensure_ascii=False))
                elif cmd == "optimize":
                    changes =()
                    print(json manager.auto_optimize.dumps(changes, indent=2, ensure_ascii=False))
                else:
                    print("Comando não reconhecido. Tente: status, optimize, quit")
            except (EOFError, KeyboardInterrupt):
                break


if __name__ == "__main__":
    main()
