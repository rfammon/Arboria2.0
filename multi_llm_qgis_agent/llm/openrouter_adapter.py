from .base_adapter import BaseLLMAdapter
import requests
from typing import Dict, Any

class OpenRouterAdapter(BaseLLMAdapter):
    """Adaptador para OpenRouter API (OpenAI-compatible)"""
    
    API_URL = "https://openrouter.ai/api/v1/chat/completions"
    
    def __init__(self, api_key: str, model: str = "qwen/qwen-2.5-coder-32b-instruct"):
        super().__init__(api_key, model)
    
    def generate_response(
        self, 
        prompt: str, 
        system_prompt: str = None,
        temperature: float = None
    ) -> Dict[str, Any]:
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/arboria/multi_llm_qgis_agent", # Recommended by OpenRouter
            "X-Title": "Multi-LLM QGIS Agent"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or self.default_temperature
        }
        
        try:
            response = requests.post(self.API_URL, json=data, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            if 'choices' in result and len(result['choices']) > 0:
                response_text = result['choices'][0]['message']['content']
                code = self.extract_code(response_text)
                
                return {
                    'success': True,
                    'response': response_text,
                    'code': code,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'response': None,
                    'code': None,
                    'error': f"Resposta inesperada do OpenRouter: {result}"
                }
        except Exception as e:
            return {
                'success': False,
                'response': None,
                'code': None,
                'error': str(e)
            }
    
    def test_connection(self) -> Dict[str, Any]:
        try:
            return self.generate_response("Test connection")
        except Exception as e:
            return {
                'success': False,
                'response': None,
                'code': None,
                'error': str(e)
            }
