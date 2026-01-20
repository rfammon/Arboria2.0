from qgis.PyQt.QtCore import QSettings

class Config:
    """Gerencia as configurações do plugin usando QSettings"""
    
    def __init__(self):
        self.settings = QSettings("Arboria", "MultiLLMQGISAgent")
        
    def get_api_key(self, provider: str) -> str:
        return self.settings.value(f"api_key_{provider}", "")
        
    def set_api_key(self, provider: str, value: str):
        self.settings.setValue(f"api_key_{provider}", value)
        
    def get_last_provider(self) -> str:
        return self.settings.value("last_provider", "groq")
        
    def set_last_provider(self, provider: str):
        self.settings.setValue("last_provider", provider)
        
    def get_last_model(self, provider: str) -> str:
        defaults = {
            'openai': 'gpt-3.5-turbo',
            'groq': 'llama-3.1-70b-versatile',
            'qwen': 'Qwen2.5-Coder-32B-Instruct'
        }
        return self.settings.value(f"last_model_{provider}", defaults.get(provider, ""))
        
    def set_last_model(self, provider: str, model: str):
        self.settings.setValue(f"last_model_{provider}", model)
