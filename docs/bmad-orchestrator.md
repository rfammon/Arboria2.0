# BMad Orchestrator Agent

## Descrição

O BMad Orchestrator é um agente especialista em métodos e orquestrador mestre. Seu propósito principal é coordenar fluxos de trabalho e orientar os usuários ao agente especializado mais adequado para uma determinada tarefa. O orquestrador pode transformar-se dinamicamente em outros agentes conforme necessário.

## Funcionalidades

### Agentes Disponíveis

1. **Analyst Agent**
   - Especializado em análise de projetos, documentação e pesquisa
   - Capacidades: `analyze-codebase`, `generate-documentation`, `perform-research`

2. **Project Manager Agent**
   - Lida com planejamento de projetos, requisitos e histórias
   - Capacidades: `create-prd`, `manage-epics`, `sprint-planning`

3. **Architect Agent**
   - Focado em decisões de arquitetura e design do sistema
   - Capacidades: `create-architecture`, `validate-design`, `solution-architecture`

4. **UX Designer Agent**
   - Lida com design de experiência do usuário e interfaces
   - Capacidades: `create-ux-design`, `design-interfaces`, `user-research`

5. **Test Architect Agent**
   - Especializado em estratégia de testes e revisões de testabilidade
   - Capacidades: `test-architecture`, `test-strategy`, `review-testability`

6. **Scrum Master Agent**
   - Gerencia planejamento de sprint e processos ágeis
   - Capacidades: `sprint-planning`, `agile-process`, `team-facilitation`

### Recursos do Orquestrador

- **Transformação Dinâmica**: Pode transformar-se em qualquer um dos agentes especializados
- **Coordenação de Workflow**: Coordena a execução de workflows complexos
- **Recomendação de Agentes**: Sugere o agente mais adequado para uma tarefa específica
- **Histórico de Workflows**: Mantém um registro de workflows executados
- **Rastreamento de Status**: Monitora o status de workflows ativos e completos

## Localização do Arquivo

O BMad Orchestrator está localizado na pasta de agentes BMad como um agente autônomo:

- `.bmad/bmm/agents/orchestrator.md` - Implementação do orquestrador no formato BMad

## Utilização

O orquestrador pode ser utilizado como um agente BMad que pode ser ativado no sistema. Ele é projetado para ser um agente especializado em coordenação de workflows que pode transformar-se em outros agentes especializados conforme necessário.

O agente segue o formato padrão BMad com menu de opções e manipuladores de workflow.

### Tipos de Agentes Suportados

O orquestrador pode transformar-se nos seguintes agentes especializados:

1. **Analyst Agent**
2. **Project Manager Agent**
3. **Architect Agent**
4. **UX Designer Agent**
5. **Test Architect Agent**
6. **Scrum Master Agent**

## Workflows Suportados

O orquestrador pode coordenar os seguintes workflows BMad:

- `coordinate-workflow` - Coordenar e executar um workflow complexo
- `select-agent` - Recomendar e selecionar o agente mais adequado
- `transform-analyst` - Transformar em Analyst Agent
- `transform-pm` - Transformar em Project Manager Agent
- `transform-architect` - Transformar em Architect Agent
- `transform-ux-designer` - Transformar em UX Designer Agent
- `transform-tea` - Transformar em Test Architect Agent
- `transform-sm` - Transformar em Scrum Master Agent
- `workflow-status` - Obter status do orquestrador e workflows ativos

## Estrutura do Agente

- `.bmad/bmm/agents/bmad-orchestrator.md` - Agente BMad no formato markdown com XML

## Licença

Este projeto faz parte do ArborIA - webAPP - BMAD e está sob a mesma licença do projeto principal.