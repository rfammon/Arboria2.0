def classFactory(iface):
    from .multi_llm_agent import MultiLLMQGISAgent
    return MultiLLMQGISAgent(iface)
