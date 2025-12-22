---
stepsCompleted: [1, 2]
inputDocuments: ['docs/prd.md', 'User Prompt']
---

# Arboria - Breakdown de Épicos: Aprovação e Reabertura

## Overview

Este documento fornece o detalhamento de épicos e histórias para as novas funcionalidades de Aprovação de Tarefas e Reabertura de Ordens de Serviço.

## Requirements Inventory

### Functional Requirements

FR1: O perfil de Gestor deve poder ver as tarefas de todos (Visibilidade Global).
FR2: Gestor e Planejador podem reabrir ordens de serviço do histórico (status Fechado/Concluído).
FR3: Reabertura deve exigir preenchimento de motivo (explicação).
FR4: Motivo da reabertura deve ser acessível ao executante no aplicativo.
FR5: Reabertura deve exigir definição de nova janela de execução (datas início/fim) e atualizar o Gantt Chart.
FR6: Implementar sistema de aprovação: tarefas executadas entram em status "Pendente Aprovação".
FR7: Gestor e Planejador recebem notificação de tarefas pendentes de aprovação.
FR8: Gestor/Planejador podem Aprovar tarefa (transição para "Concluída").
FR9: Gestor/Planejador podem Rejeitar tarefa (transição para "Em Correção" ou similar).
FR10: Rejeição exige motivo obrigatório, acessível ao executante.

### NonFunctional Requirements

NFR1: A atualização do Gantt deve ser imediata após reabertura.
NFR2: Notificações de pendência devem ser em tempo real (Push/Email conforme preferências).

### Additional Requirements

- UI para Fluxo de Aprovação no Painel Administrativo.
- UI para Reabertura com Modais de confirmação e inputs de data.
- Ajuste nas Permissões RLS para permitir leitura global de tarefas por Gestores.

### FR Coverage Map

FR1: Epic 1 - Visibilidade global para gestores.
FR2: Epic 1 - Ação de reabertura.
FR3: Epic 1 - Motivo obrigatório.
FR4: Epic 1 - Visibilidade do motivo.
FR5: Epic 1 - Atualização de datas e Gantt.
FR6: Epic 2 - Novo status Pendente.
FR7: Epic 2 - Notificações de aprovação.
FR8: Epic 2 - Ação de aprovar.
FR9: Epic 2 - Ação de rejeitar.
FR10: Epic 2 - Motivo da rejeição.

## Epic List

### Epic 1: Gestão de Exceções e Visibilidade
Permitir que gestores tenham visibilidade total das operações e possam intervir em processos já finalizados para corrigir erros ou acomodar mudanças, mantendo o planejamento (Gantt) sempre atualizado.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Fluxo de Aprovação e Controle de Qualidade
Estabelecer um processo formal de validação de qualidade onde tarefas executadas requerem aprovação explicita de um supervisor antes de serem consideradas concluídas, garantindo conformidade e reduzindo retrabalho.
**FRs covered:** FR6, FR7, FR8, FR9, FR10
