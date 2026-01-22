from qgis.PyQt.QtCore import QSettings, QTranslator, QCoreApplication, Qt
from qgis.PyQt.QtWidgets import QAction, QMessageBox
from qgis.core import QgsProject, QgsMessageLog, Qgis
import os

from .llm.openai_adapter import OpenAIAdapter
from .llm.groq_adapter import GroqAdapter
from .llm.qwen_adapter import QwenAdapter
from .llm.openrouter_adapter import OpenRouterAdapter
from .utils.config import Config
from .prompts.system_prompts import QGIS_SYSTEM_PROMPT

class MultiLLMQGISAgent:
    def __init__(self, iface):
        self.iface = iface
        self.plugin_dir = os.path.dirname(__file__)
        self.config = Config()
        self.llm_adapter = None
        self.dockwidget = None
        
    def log(self, message, level=Qgis.Info):
        QgsMessageLog.logMessage(message, 'Multi-LLM Agent', level)
        
    def initGui(self):
        """Inicializa a interface do plugin"""
        icon_path = os.path.join(self.plugin_dir, 'icon.png')
        self.action = QAction(
            "Multi-LLM QGIS Agent",
            self.iface.mainWindow()
        )
        self.action.triggered.connect(self.run)
        self.iface.addToolBarIcon(self.action)

    def initialize_llm(self, provider: str, api_key: str, model: str = None):
        """Inicializa o adaptador LLM selecionado"""
        adapters = {
            'openai': OpenAIAdapter,
            'groq': GroqAdapter,
            'qwen': QwenAdapter,
            'openrouter_qwen': OpenRouterAdapter,
            'openrouter_grok': OpenRouterAdapter,
            'openrouter': OpenRouterAdapter
        }
        
        models = {
            'openrouter_qwen': 'qwen/qwen-2.5-coder-32b-instruct',
            'openrouter_grok': 'x-ai/grok-2-1212' # Using newer version if available
        }
        
        if provider in adapters:
            target_model = model or models.get(provider)
            self.llm_adapter = adapters[provider](api_key, target_model)
            result = self.llm_adapter.test_connection()
            if not result['success']:
                self.log(f"Falha na conexão com {provider}: {result['error']}", Qgis.Critical)
            return result
        return {'success': False, 'error': f'Provedor {provider} não encontrado.'}

        
    def initialize_llm_from_ui(self):
        """Inicializa o adaptador baseado na UI"""
        provider = self.dockwidget.comboBoxProvider.currentText()
        api_key = self.dockwidget.lineEditApiKey.text()
        
        if not api_key:
            QMessageBox.warning(self.iface.mainWindow(), "Aviso", "Por favor, insira uma chave API.")
            return False
            
        self.log(f"Tentando conectar ao provedor: {provider}")
        result = self.initialize_llm(provider, api_key)
        
        if result['success']:
            self.config.set_api_key(provider, api_key)
            self.config.set_last_provider(provider)
            QMessageBox.information(self.iface.mainWindow(), "Sucesso", f"Conectado ao {provider} com sucesso!")
            return True
        else:
            error_msg = result.get('error', 'Erro desconhecido')
            self.log(f"Erro de conexão: {error_msg}", Qgis.Critical)
            QMessageBox.critical(
                self.iface.mainWindow(), 
                "Erro de Conexão", 
                f"Falha ao conectar ao {provider}.\n\nDetalhes: {error_msg}\n\nVerifique sua chave API, conexão com a internet e se o módulo 'requests' está instalado no Python do QGIS."
            )
            return False


    def process_command(self, command: str) -> dict:
        """Processa comando em linguagem natural"""
        if not self.llm_adapter:
            return {
                'success': False,
                'error': 'LLM não inicializado'
            }
        
        # Adiciona contexto QGIS ao prompt
        context = self.get_qgis_context()
        full_prompt = f"{context}\n\nComando: {command}"
        
        # Gera resposta
        result = self.llm_adapter.generate_response(
            full_prompt,
            system_prompt=QGIS_SYSTEM_PROMPT
        )
        
        return result
    
    def get_qgis_context(self) -> str:
        """Obtém contexto atual do QGIS"""
        layers = QgsProject.instance().mapLayers()
        context = f"Camadas disponíveis: {len(layers)}\n"
        
        for name, layer in layers.items():
            context += f"- {layer.name()} ({layer.type()})\n"
        
        return context
    
    def execute_code(self, code: str, supervised: bool = True):
        """Executa código Python gerado"""
        if supervised:
            reply = QMessageBox.question(
                self.iface.mainWindow(),
                'Confirmar execução',
                f'Executar este código?\n\n{code}',
                QMessageBox.Yes | QMessageBox.No
            )
            if reply == QMessageBox.No:
                return False
        
        try:
            # Prepare namespace with iface and project
            namespace = {
                'iface': self.iface, 
                'QgsProject': QgsProject,
                'project': QgsProject.instance(),
                'Qt': Qt
            }
            exec(code, namespace)
            return True
        except Exception as e:
            QMessageBox.critical(
                self.iface.mainWindow(),
                'Erro na execução',
                str(e)
            )
            return False

    def on_send_command(self):
        """Processa o comando da UI"""
        command = self.dockwidget.lineEditCommand.text()
        if not command:
            return

        # Garante que o LLM está inicializado
        if not self.llm_adapter:
            if not self.initialize_llm_from_ui():
                return

        self.iface.mainWindow().statusBar().showMessage("Processando comando...")
        result = self.process_command(command)
        
        if result['success']:
            self.dockwidget.textEditCode.setPlainText(result['code'] or result['response'])
        else:
            QMessageBox.warning(self.iface.mainWindow(), "Erro no LLM", result['error'])
        
        self.iface.mainWindow().statusBar().clearMessage()

    def on_execute_code(self):
        """Executa o código da UI"""
        code = self.dockwidget.textEditCode.toPlainText()
        if code:
            self.execute_code(code)

    def run(self):
        """Ação principal do plugin"""
        if not self.dockwidget:
            from .agent_dockwidget import AgentDockWidget
            self.dockwidget = AgentDockWidget()
            
            # Carrega configurações salvas
            provider = self.config.get_last_provider()
            self.dockwidget.comboBoxProvider.setCurrentText(provider)
            self.dockwidget.lineEditApiKey.setText(self.config.get_api_key(provider))
            
            # Conecta sinais
            self.dockwidget.pushButtonSend.clicked.connect(self.on_send_command)
            self.dockwidget.pushButtonExecute.clicked.connect(self.on_execute_code)
            self.dockwidget.pushButtonTestConnection.clicked.connect(self.initialize_llm_from_ui)
            self.dockwidget.comboBoxProvider.currentIndexChanged.connect(self.on_provider_changed)
            self.dockwidget.closingPlugin.connect(self.on_dockwidget_closed)


        # Mostra o dockwidget
        self.iface.addDockWidget(Qt.RightDockWidgetArea, self.dockwidget)
        self.dockwidget.show()

    def on_provider_changed(self):
        """Atualiza a chave API exibida quando o provedor muda"""
        provider = self.dockwidget.comboBoxProvider.currentText()
        saved_key = self.config.get_api_key(provider)
        self.dockwidget.lineEditApiKey.setText(saved_key)
        self.llm_adapter = None # Reset adapter when provider changes

    def on_dockwidget_closed(self):

        """Limpa quando o dockwidget é fechado"""
        pass

    def unload(self):
        """Remove o plugin do QGIS"""
        if self.action:
            self.iface.removeToolBarIcon(self.action)
        if self.dockwidget:
            self.iface.removeDockWidget(self.dockwidget)


