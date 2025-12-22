---
stepsCompleted: [1, 2]
inputDocuments:
  - 'docs/prd.md'
---

# Arboria - Epic Breakdown: Módulo de Execução

## Overview

Este documento detalha o épico do Módulo de Execução para o ArborIA, decompondo os requisitos extraídos das User Stories US-EXECUTANTE-001 até US-EXECUTANTE-008 do PRD em histórias implementáveis.

## Requirements Inventory

### Functional Requirements

**RF7: Módulo de Execução de Intervenções** (A ser documentado no PRD)
- RF7.1 - Visualização de Planos de Trabalho
- RF7.2 - Registro de Execução de Tarefas
- RF7.3 - Gestão de Evidências Fotográficas (5 fotos obrigatórias)
- RF7.4 - Atualização de Progresso em Tempo Real
- RF7.5 - Conclusão de Tarefas com Validação
- RF7.6 - Sincronização Automática com Cronograma
- RF7.7 - Operação Offline com Sincronização Posterior
- RF7.8 - Navegação GPS com Rota Turn-by-Turn (NOVO - Pre-mortem)
- RF7.9 - Dashboard de Monitoramento para Gestores (NOVO - Pre-mortem)

### Non-Functional Requirements

**NFR1: Performance**
- Auto-save IMEDIATO ao preencher campos (não esperar 30s)
- Sincronização em tempo real do progresso
- Carregamento offline (PWA)
- Retry inteligente com backoff exponencial para uploads

**NFR2: Usabilidade**
- Interface mobile-first para uso em campo
- Formulários otimizados para entrada rápida
- Preview de fotos antes de upload

**NFR3: Confiabilidade**
- Funcionalidade offline completa
- Sincronização automática quando online
- Validação de campos obrigatórios
- Prevenção de perda de dados (múltiplas camadas: LocalStorage + IndexedDB)
- Detecção de bateria baixa (<15%) com save forçado
- Conflict detection e resolution UI
- Queue persistente de uploads pendentes

**NFR4: Segurança**
- Perfil Executante tem acesso somente leitura aos planos
- Tarefas concluídas não podem ser editadas (apenas Gestor pode reabrir)
- Geolocalização e timestamp automático nas evidências

**NFR5: Integração**
- Atualização automática do Gantt Chart
- Notificações push para Gestor e Planejador
- Integração com módulo de Planos existente

### Additional Requirements

**From Architecture:**
- Integração com Supabase Storage para armazenamento de fotos
- Compressão e otimização automática de imagens (max 2MB)
- Geolocalização automática via GPS
- Service Worker para operação offline

**From Existing Modules:**
- Módulo GIS para visualização de árvores no mapa
- Módulo de Planos para leitura de intervenções aprovadas
- Sistema de notificações existente

### FR Coverage Map

| Functional Requirement | Epic | Stories |
|------------------------|------|---------|
| RF7.1 - Visualização de Planos | Epic 1 | Story 1.1, 1.2 |
| RF7.8 - Navegação GPS com Rota | Epic 1 | Story 1.3 |
| RF7.2 - Registro de Execução | Epic 1 | Story 1.4 |
| RF7.3 - Evidências Fotográficas (5 fotos) | Epic 1 | Story 1.5 |
| RF7.4 - Atualização de Progresso | Epic 1 | Story 1.6 |
| RF7.5 - Conclusão com Validação | Epic 1 | Story 1.7 |
| RF7.6 - Sincronização Automática | Epic 1 | Story 1.7 |
| RF7.7 - Operação Offline Resiliente | Epic 1 | Story 1.8 |
| RF7.9 - Dashboard de Monitoramento | Epic 1 | Story 1.9 |

## Epic List

1. **Epic 1: Módulo de Execução de Intervenções** - Habilitar executantes a visualizar planos, registrar execução, adicionar evidências e atualizar progresso em tempo real

## Epic 1: Módulo de Execução de Intervenções

**Objetivo do Épico:**  
Criar um módulo mobile-first que permita aos executantes de campo receber seus planos de trabalho, registrar a execução, adicionar evidências fotográficas e atualizar o progresso das tarefas, com sincronização automática do cronograma no Gestor de Planos e suporte a operação offline.

**Valor de Negócio:**  
- Rastreabilidade completa das intervenções executadas
- Evidências fotográficas comprovando qualidade do trabalho
- Visibilidade em tempo real do progresso para Gestores e Planejadores
- Redução de retrabalho e disputas contratuais
- Compliance com normas de segurança

**Personas:**  
- Executante (Perfil primário)
- Gestor (Recebe notificações e monitora progresso)
- Planejador (Recebe notificações e acompanha execução)

### Story 1.1: Solicitar Acesso como Executante

As a **Executante**,  
I want **solicitar acesso a uma instalação selecionando o perfil "Executante"**,  
So that **eu possa visualizar os planos de trabalho que preciso executar**.

**Acceptance Criteria:**

**Given** sou um usuário autenticado no sistema
**When** acesso a página de instalações disponíveis
**Then** vejo lista de instalações onde posso solicitar acesso
**And** posso selecionar o perfil "Executante" na solicitação

**Given** selecionei perfil "Executante" e instalação
**When** clico em "Solicitar Acesso"
**Then** campo de justificativa é obrigatório (mínimo 20 caracteres)
**And** recebo confirmação visual de que solicitação foi enviada

**Given** minha solicitação foi processada
**When** Gestor aprova ou rejeita
**Then** recebo notificação push/email
**And** se rejeitado, vejo justificativa do Gestor

---

### Story 1.2: Visualizar Planos de Intervenção Aprovados

As a **Executante**,  
I want **visualizar lista de planos aprovados com detalhes completos em modo somente leitura**,  
So that **eu saiba exatamente qual trabalho preciso realizar**.

**Acceptance Criteria:**

**Given** tenho perfil de Executante aprovado
**When** acesso o Módulo de Execução
**Then** vejo lista de planos aprovados ordenados por prioridade/data
**And** para cada plano vejo: nome, prioridade, data planejada, status de execução

**Given** estou visualizando lista de planos
**When** clico em um plano
**Then** abro detalhes completos (somente leitura)
**And** vejo: árvores incluídas, tipos de intervenção, cronograma, recursos necessários

**Given** estou visualizando detalhes de um plano
**When** tento editar qualquer campo
**Then** não consigo (todos campos desabilitados)
**And** vejo mensagem informativa "Planos aprovados não podem ser editados"

---

### Story 1.3: Navegação GPS com Rota Turn-by-Turn

As a **Executante**,  
I want **navegação GPS com rota turn-by-turn até a árvore e foto de referência**,  
So that **eu possa encontrar facilmente a árvore certa em áreas densas**.

**Acceptance Criteria:**

**Given** tenho um plano aberto
**When** clico em uma árvore no mapa
**Then** vejo popup com:
**And** Foto de referência da árvore
**And** ID/Código da árvore destacado
**And** Botão "Navegar até Árvore"
**And** Indicador de distância: "Você está a Xm desta árvore"

**Given** cliquei em "Navegar até Árvore"
**When** GPS está disponível
**Then** vejo rota turn-by-turn da minha localização atual até árvore
**And** direção mostrada: "Caminhe 45m nordeste"
**And** distância atualizada em tempo real
**And** indicador de precisão GPS: "Precisão: ±8m"

**Given** GPS tem baixa precisão (>20m)
**When** sistema detecta
**Then** vejo aviso: "GPS impreciso, use mapa visual e foto de referência"
**And** sistema mostra direção cardinal (N, S, L, O) como fallback

**Given** GPS indisponível
**When** tento navegar
**Then** vejo modo bússola com direção cardinal
**And** posso usar foto de referência para identificação visual

**Given** estou offline
**When** uso navegação
**Then** mapa funciona com tiles cacheados (PWA)
**And** rota é calculada usando última localização GPS conhecida

---

### Story 1.4: Registrar Execução de Tarefa com Captura Automática

As a **Executante**,  
I want **iniciar execução com captura automática de timestamp e geolocalização, com observações opcionais via texto**,  
So that **eu possa documentar o trabalho sem perder tempo digitando dados redundantes**.

**Acceptance Criteria:**

**Given** selecionei uma árvore do plano para executar
**When** clico em "Iniciar Execução"
**Then** timestamp de início é capturado automaticamente
**And** geolocalização GPS é capturada automaticamente
**And** campos opcionais: equipe, observações (texto livre)

**Given** estou finalizando trabalho
**When** clico em "Finalizar Execução"
**Then** timestamp de fim é capturado automaticamente
**And** posso registrar desvios do planejado (checkbox + campo texto)
**And** posso registrar ocorrências/incidentes (checkbox + campo texto)
**And** observações finais são opcionais (campo texto)

**Given** estou offline
**When** preencho formulário de execução
**Then** dados são salvos localmente (auto-save a cada 30s)
**And** serão sincronizados quando voltar online

---

### Story 1.5: Sistema de Evidências Fotográficas em 5 Etapas

As a **Executante**,  
I want **captura guiada de 5 fotos obrigatórias em momentos específicos da execução**,  
So that **eu tenha documentação fotográfica completa para compliance e rastreabilidade**.

**Acceptance Criteria:**

**Given** cliquei em "Iniciar Execução"
**When** sou levado à captura de evidências iniciais
**Then** sistema me guia para tirar 3 fotos obrigatórias:
**And** 📷 Foto 1/3: "Árvore Antes da Intervenção" (estado pré-intervenção)
**And** 📷 Foto 2/3: "Frente de Serviço Mobilizada" (equipe e equipamentos posicionados)
**And** 📷 Foto 3/3: "Serviço em Andamento" (trabalho sendo executado)

**Given** cliquei em "Finalizar Execução"
**When** sou levado à captura de evidências finais
**Then** sistema me guia para tirar 2 fotos obrigatórias:
**And** 📷 Foto 4/5: "Detalhe do Trabalho" (galho/defeito removido - close-up)
**And** 📷 Foto 5/5: "Árvore Pós-Intervenção" (estado final - foto geral)

**Given** estou tirando fotos
**When** captura cada imagem
**Then** foto é comprimida automaticamente (max 2MB)
**And** geolocalização e timestamp são capturados automaticamente
**And** vejo preview rápido com opção "Refazer" ou "Confirmar"

**Given** quero prosseguir
**When** tento avançar sem completar todas as 5 fotos
**Then** validação bloqueia progresso
**And** vejo mensagem indicando quais fotos faltam

**Given** estou offline
**When** tiro fotos
**Then** fotos são armazenadas localmente
**And** upload automático quando voltar online

---

### Story 1.6: Atualizar Progresso da Tarefa

As a **Executante**,  
I want **atualizar percentual de conclusão com slider de 0-100%**,  
So that **Gestor e Planejador possam acompanhar andamento em tempo real**.

**Acceptance Criteria:**

**Given** estou executando uma tarefa
**When** acesso controle de progresso
**Then** vejo slider com marcos pré-definidos: 0%, 25%, 50%, 75%, 100%
**And** posso ajustar para qualquer valor entre 0-100%

**Given** atualizo progresso
**When** salvo
**Then** atualização é refletida em tempo real no dashboard do Gestor/Planejador
**And** histórico de atualizações é registrado com timestamp
**And** auto-save preserva progresso automaticamente

**Given** tento retroceder progresso
**When** movo slider para valor menor que atual
**Then** sistema bloqueia e mostra mensagem "Progresso não pode retroceder"

**Given** faço salto > 25%
**When** tento salvar
**Then** sistema solicita confirmação
**And** posso confirmar ou ajustar

---

### Story 1.7: Concluir Tarefa com Validação e Sincronização Automática

As a **Executante**,  
I want **marcar tarefa como concluída após validações, atualizando automaticamente cronograma no Gestor de Planos**,  
So that **o status seja atualizado em tempo real e equipe seja notific ada**.

**Acceptance Criteria:**

**Given** preenchi todos dados de execução
**When** clico em "Concluir Tarefa"
**Then** validação verifica: dados de execução completos + mínimo 2 evidências fotográficas
**And** se validação falhar, vejo lista de pendências

**Given** validação passou
**When** confirmo conclusão
**Then** confirmação obrigatória é exibida: "Tem certeza? Tarefa concluída não pode ser editada"
**And** posso cancelar ou confirmar

**Given** confirmei conclusão
**When** sistema processa
**Then** status atualizado automaticamente no Gestor de Planos
**And** tarefa move para "Concluída" no Gantt Chart
**And** notificação push enviada para Gestor e Planejador
**And** registro data/hora de conclusão

**Given** tarefa foi concluída
**When** tento editar
**Then** todos campos ficam bloqueados
**And** vejo mensagem "Apenas Gestor pode reabrir tarefas concluídas"

---

### Story 1.8: Operação Offline com Sincronização Automática

As a **Executante**,  
I want **usar todas funcionalidades offline e sincronizar automaticamente quando voltar online**,  
So that **eu possa trabalhar em campo sem depender de conexão**.

**Acceptance Criteria:**

**Given** estou offline
**When** uso módulo de execução
**Then** posso visualizar planos (cacheados), registrar execuções, tirar fotos, atualizar progresso
**And** vejo indicador visual "Modo Offline" no cabeçalho

**Given** registrei dados offline
**When** volto online
**Then** sincronização automática inicia em background
**And** vejo progresso da sincronização (ex: "Sincronizando 3 de 5 itens")
**And** notificação quando sincronização completa

**Given** houve conflito na sincronização (tarefa modificada por outro usuário)
**When** sistema detecta conflito
**Then** vejo alerta com detalhes do conflito
**And** posso escolher: manter minha versão, aceitar versão do servidor, ou mesclar manualmente

**Given** sincronização falhou (erro de rede/servidor)
**When** sistema detecta falha
**Then** retry automático com backoff exponencial (3 tentativas)
**And** se todas tentativas falharem, vejo notificação "Sincronização pendente. Tentaremos novamente"


---

### Story 1.9: Dashboard de Monitoramento para Gestores

As a **Gestor/Planejador**,  
I want **dashboard em tempo real com localiza��o e status das execu��es em andamento**,  
So that **eu possa monitor ar o progresso sem microgerenciar e identificar problemas rapidamente**.

**Acceptance Criteria:**

**Given** sou Gestor ou Planejador
**When** acesso m�dulo "Monitoramento de Execu��es"
**Then** vejo mapa em tempo real com execu��es ativas
**And** cada executante ativo tem pin no mapa com cor por status
**And** vejo lista lateral com todas tarefas: N�o Iniciadas | Em Andamento | Conclu�das

**Given** estou visualizando dashboard
**When** clico em uma execu��o em andamento
**Then** vejo detalhes:
**And** Executante respons�vel
**And** �rvore sendo trabalhada (com foto)
**And** Tempo decorrido: "Iniciado h� 45 minutos"
**And** Status de fotos: "3/5 fotos capturadas"
**And** Localiza��o GPS atual do executante

**Given** tarefa est� atrasada
**When** tempo excede estimativa do plano
**Then** tarefa � destacada em vermelho no dashboard
**And** vejo alerta: "Tarefa atrasada em 2 horas"
**And** recebo notifica��o push (opcional)

**Given** executante inicia ou conclui tarefa
**When** sync acontece
**Then** dashboard atualiza automaticamente (real-time)
**And** vejo timeline de eventos: "Jo�o iniciou �rvore #123 �s 14:35"

**Given** quero filtrar dados
**When** uso filtros
**Then** posso filtrar por:
**And** Executante (dropdown)
**And** Status (N�o iniciado | Em andamento | Conclu�do | Atrasado)
**And** Per�odo (Hoje | �ltima semana | Personalizado)
**And** Tipo de interven��o

**Given** quero exportar relat�rio
**When** clico em "Exportar"
**Then** posso gerar PDF ou CSV
**And** relat�rio inclui: tarefas conclu�das, tempo m�dio, fotos anexadas e executantes


---

### Story 1.4A: Modo Equipe - Colabora��o Multi-Executante

As a **Executante L�der de Equipe**,  
I want **permitir que m�ltiplos executantes colaborem na mesma tarefa com um l�der coordenando**,  
So that **equipes de 2-3 pessoas possam trabalhar juntas sem conflitos de registro**.

**Acceptance Criteria:**

**Given** sou l�der de uma equipe
**When** inicio execu��o de tarefa
**Then** posso convidar outros executantes para colaborar (2-3 pessoas max)
**And** vejo status de cada membro: "Online" | "Offline" | "Trabalhando em outra tarefa"

**Given** m�ltiplos executantes est�o na mesma tarefa
**When** qualquer um tira foto
**Then** foto � compartilhada com todos membros da equipe
**And** vejo quem tirou: "Foto 3/5 por Jo�o �s 14:35"

**Given** sou membro da equipe (n�o l�der)
**When** tento concluir tarefa
**Then** sistema bloqueia com mensagem: "Apenas l�der da equipe pode concluir tarefa"
**And** posso tirar fotos e preencher observa��es normalmente

**Given** l�der conclui tarefa
**When** sistema valida
**Then** todos membros da equipe recebem cr�dito de participa��o
**And** registro de execu��o inclui: "Equipe: Jo�o (L�der), Maria, Pedro"

---

### Story 1.6A: Sistema de Alertas e SOS

As a **Executante**,  
I want **bot�o de SOS para pedir ajuda e sistema de alertas para Gestor**,  
So that **eu possa comunicar problemas urgentes e Gestor seja notificado proativamente**.

**Acceptance Criteria:**

**Given** estou executando tarefa
**When** enfrento problema urgente (�rvore n�o encontrada, equipamento quebrado, acesso bloqueado)
**Then** vejo bot�o vermelho grande " Preciso de Ajuda"
**And** ao clicar, abro formul�rio r�pido com op��es:
- �rvore n�o encontrada
- Equipamento quebrado/faltando
- Acesso bloqueado
- Situa��o de risco/emerg�ncia
- Outro (campo texto)

**Given** acionei SOS
**When** confirmo envio
**Then** notifica��o push IMEDIATA enviada para Gestor da instala��o
**And** tarefa fica marcada como "Bloqueada - Aguardando Suporte"
**And** vejo mensagem: "Gestor foi notificado. Aguarde retorno"

**Given** sou Gestor
**When** recebo alerta SOS
**Then** vejo notifica��o destacada: " Jo�o precisa de ajuda - �rvore ID #456"
**And** posso responder via app com orienta��o ou "A caminho"
**And** executante recebe resposta em tempo real

**Given** sou Gestor
**When** configuro alertas no dashboard
**Then** posso ativar notifica��es para:
- Tarefa atrasada > X horas (configur�vel)
- SOS acionado
- Tarefa conclu�da
- Executante offline > X minutos (durante execu��o)

---

### Story 1.10: Sincroniza��o de Mudan�as no Plano Durante Execu��o

As a **Executante**,  
I want **receber notifica��o quando Planejador modifica plano que estou executando**,  
So that **eu sempre trabalhe com informa��es atualizadas e n�o perca mudan�as importantes**.

**Acceptance Criteria:**

**Given** estou executando um plano
**When** Planejador modifica o plano (adiciona �rvore, muda prioridade, cancela tarefa)
**Then** recebo notifica��o push: " Planejador atualizou este plano"
**And** vejo badge "Atualiza��o Dispon�vel" no plano

**Given** vejo "Atualiza��o Dispon�vel"
**When** clico para ver mudan�as
**Then** vejo diff visual:
**And** Verde: " Nova �rvore adicionada: ID #789"
**And** Amarelo: " Prioridade de �rvore #456 mudou: M�dia  Alta"
**And** Vermelho: " �rvore #123 removida do plano"

**Given** mudan�a afeta tarefa que j� executei
**When** visualizo diff
**Then** vejo alerta: "Voc� j� concluiu �rvore #123 que foi removida do plano"
**And** posso marcar: "Ignor ar mudan�a" ou "Reportar ao Planejador"

**Given** novas tarefas foram adicionadas
**When** sincronizo plano
**Then** tarefas novas aparecem como "N�o Iniciadas"
**And** posso continuar trabalhando normalmente



## Epic 2: Gest�o de Exce��es e Visibilidade
Permitir que gestores tenham visibilidade total das opera��es e possam intervir em processos j� finalizados para corrigir erros ou acomodar mudan�as, mantendo o planejamento (Gantt) sempre atualizado.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Story 2.1: Visibilidade Global de Tarefas
**As a** Gestor/Planejador,
**I want** ver todas as tarefas de execu��o independente de quem est� alocado,
**So that** eu tenha uma vis�o completa do progresso da equipe.

**Acceptance Criteria:**
**Given** que sou Gestor ou Planejador
**When** acesso a lista de tarefas
**Then** vejo tarefas de todos os executantes
**And** posso filtrar por executante

### Story 2.2: Reabertura de Work Orders
**As a** Gestor/Planejador,
**I want** reabrir ordens de servi�o j� conclu�das ou fechadas,
**So that** corre��es ou trabalhos adicionais possam ser realizados.

**Acceptance Criteria:**
**Given** uma OS com status 'Conclu�da' ou 'Fechada'
**When** clico na op��o 'Reabrir OS'
**Then** sou solicitado a informar o 'Motivo da Reabertura' (texto obrigat�rio)
**And** devo informar novas datas de In�cio e Fim (nova janela)
**And** o status da OS muda para 'Em Progresso'
**And** o status no Gantt � atualizado

## Epic 3: Fluxo de Aprova��o e Controle de Qualidade
Estabelecer um processo formal de valida��o de qualidade onde tarefas executadas requerem aprova��o explicita de um supervisor antes de serem consideradas conclu�das, garantindo conformidade e reduzindo retrabalho.
**FRs covered:** FR6, FR7, FR8, FR9, FR10

### Story 3.1: Envio para Aprova��o
**As a** Executante,
**I want** que minhas tarefas conclu�das sejam enviadas para aprova��o,
**So that** meu trabalho seja validado antes da conclus�o final.

**Acceptance Criteria:**
**Given** que finalizei uma tarefa
**When** submeto a conclus�o
**Then** o status da tarefa muda para 'Pendente Aprova��o' (ao inv�s de Conclu�da)
**And** Gestores recebem notifica��o de nova tarefa pendente

### Story 3.2: Aprova��o de Tarefas
**As a** Gestor/Planejador,
**I want** aprovar tarefas pendentes,
**So that** elas sejam consideradas oficialmente conclu�das.

**Acceptance Criteria:**
**Given** uma tarefa com status 'Pendente Aprova��o'
**When** reviso e clico em 'Aprovar'
**Then** o status da tarefa muda para 'Conclu�da'
**And** a data de conclus�o � registrada

### Story 3.3: Rejei��o de Tarefas
**As a** Gestor/Planejador,
**I want** rejeitar tarefas inadequadas com um motivo,
**So that** o executante saiba o que precisa corrigir.

**Acceptance Criteria:**
**Given** uma tarefa 'Pendente Aprova��o'
**When** decido rejeitar
**Then** devo preencher um campo 'Motivo da Rejei��o' (obrigat�rio)
**And** o status da tarefa volta para 'Em Progresso' (ou status similar de corre��o)
**And** o executante � notificado com o motivo
