from .base_adapter import BaseLLMAdapter
import requests
from typing import Dict, Any

class GroqAdapter(BaseLLMAdapter):
    """Adaptador para Groq API (Gratuito!)"""
    
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    
    def __init__(self, api_key: str, model: str = "llama-3.1-70b-versatile"):
        super().__init__(api_key, model)
        # Modelos disponíveis: llama-3.1-70b-versatile, mixtral-8x7b-32768
    
    def generate_response(
        self, 
        prompt: str, 
        system_prompt: str = None,
        temperature: float = None
    ) -> Dict[str, Any]:
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or self.default_temperature,
            "max_tokens": 2048
        }
        
        try:
            response = requests.post(self.API_URL, json=data, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            response_text = result['choices'][0]['message']['content']
            code = self.extract_code(response_text)
            
            return {
                'success': True,
                'response': response_text,
                'code': code,
                'error': None
            }
        except Exception as e:
            return {
                'success': False,
                'response': None,
                'code': None,
                'error': str(e)
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Testa conexão com a API"""
        try:
            # Simple test prompt
            return self.generate_response("Test connection")
        except Exception as e:
            return {
                'success': False,
                'response': None,
                'code': None,
                'error': str(e)
            }

