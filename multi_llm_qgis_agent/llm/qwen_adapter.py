from .base_adapter import BaseLLMAdapter
import requests
from typing import Dict, Any

class QwenAdapter(BaseLLMAdapter):
    """Adaptador para Qwen API (Gratuito via HuggingFace)"""
    
    API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct"
    
    def __init__(self, api_key: str, model: str = None):
        super().__init__(api_key, model)
    
    def generate_response(
        self, 
        prompt: str, 
        system_prompt: str = None,
        temperature: float = None
    ) -> Dict[str, Any]:
        
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "temperature": temperature or self.default_temperature,
                "max_new_tokens": 2048,
                "return_full_text": False
            }
        }
        
        try:
            response = requests.post(self.API_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                response_text = result[0]['generated_text']
            elif isinstance(result, dict) and 'generated_text' in result:
                response_text = result['generated_text']
            else:
                response_text = str(result)
                
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
            return self.generate_response("Test")
        except Exception as e:
            return {
                'success': False,
                'response': None,
                'code': None,
                'error': str(e)
            }

