from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseLLMAdapter(ABC):
    """Classe base abstrata para todos os adaptadores LLM"""
    
    def __init__(self, api_key: str, model: str = None):
        self.api_key = api_key
        self.model = model
        self.default_temperature = 0.3
    
    @abstractmethod
    def generate_response(
        self, 
        prompt: str, 
        system_prompt: str = None,
        temperature: float = None
    ) -> Dict[str, Any]:
        """
        Gera resposta do LLM
        
        Returns:
            {
                'success': bool,
                'response': str,
                'code': str or None,
                'error': str or None
            }
        """
        pass
    
    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """Testa conexão com a API e retorna detalhes do erro se houver"""
        pass
    
    def extract_code(self, response: str) -> Optional[str]:
        """Extrai código Python da resposta"""
        if '```python' in response:
            try:
                code = response.split('```python')[1].split('```')[0]
                return code.strip()
            except IndexError:
                pass
        
        if '```' in response:
            try:
                code = response.split('```')[1].split('```')[0]
                return code.strip()
            except IndexError:
                pass
                
        return None

