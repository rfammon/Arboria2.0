# Multi-LLM QGIS Agent

Este plugin permite interagir com o QGIS através de comandos em linguagem natural, utilizando diversas APIs de LLM (Groq, Qwen, OpenAI).

## Instalação

1.  Copie a pasta `multi_llm_qgis_agent` para o diretório de plugins do QGIS no seu sistema:
    *   **Windows:** `%APPDATA%\QGIS\QGIS3\profiles\default\python\plugins\`
    *   **Linux:** `~/.local/share/QGIS/QGIS3/profiles/default/python/plugins/`
    *   **macOS:** `~/Library/Application Support/QGIS/QGIS3/profiles/default/python/plugins/`

2.  Abra o QGIS e vá em **Plugins > Gerenciar e Instalar Plugins...**
3.  Procure por **Multi-LLM QGIS Agent** e ative-o.

## Configuração

1.  Clique no ícone do plugin na barra de ferramentas.
2.  No painel que abrir, escolha seu provedor (Recomenda-se **Groq** para uso gratuito com Llama 3).
3.  Insira sua Chave API.
4.  Clique em **Testar Conexão**.

## Como Usar

1.  Digite um comando na caixa de texto (ex: "Adicione o OpenStreetMap", "Crie um buffer de 1km na camada selecionada").
2.  Clique em **Gerar Código**.
3.  Revise o código Python gerado no campo abaixo.
4.  Clique em **Executar no QGIS** para aplicar as mudanças.

## Estrutura do Projeto

*   `multi_llm_agent.py`: Lógica principal do plugin.
*   `llm/`: Adaptadores para diferentes provedores de IA.
*   `prompts/`: Instruções de sistema para a IA.
*   `utils/`: Funções auxiliares e gerenciamento de configurações.
*   `agent_dockwidget_base.ui`: Interface visual (Qt Designer).
