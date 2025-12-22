# Story 2.2: Reabertura de Work Orders

## Contexto
Atualmente, quando uma Work Order (OS) é concluída ou cancelada, ela atinge um estado final. No entanto, GESTORES e PLANEJADORES precisam da capacidade de reabrir essas OSs caso o trabalho precise ser refeito ou ajustado, garantindo que o ciclo de vida da OS reflita a realidade operacional.

## User Story
**Como** Gestor ou Planejador
**Quero** poder reabrir uma Work Order que esteja "Concluída" ou "Cancelada"
**Para** que eu possa reprogramar o trabalho ou corrigir execuções inadequadas.

## Acceptance Criteria

1.  **Botão de Reabertura**:
    - **Given** que sou Gestor ou Planejador
    - **And** estou visualizando uma OS com status "COMPLETED" ou "CANCELLED"
    - **Then** vejo um botão ou opção "Reabrir OS".

2.  **Motivo e Novas Datas**:
    - **When** clico em "Reabrir OS"
    - **Then** devo ver um modal solicitando:
        - Motivo da reabertura (Obrigatório, texto).
        - Novas datas de início e fim (Obrigatório, para o Gantt).

3.  **Processamento**:
    - **When** confirmo a reabertura
    - **Then** o status da OS muda para "IN_PROGRESS" (ou "PLANNED" dependendo da data?). *Decisão: Voltar para PLANNED se data futura, IN_PROGRESS se data atual/passada.*
    - **And** os dados são salvos (motivo deve ser logado ou salvo em observações).

4.  **Restrição de Perfil**:
    - **Given** que sou Executante
    - **Then** NÃO vejo a opção de reabrir OS.

## Tasks

- [x] Create/Update RPC function `reopen_work_order` <!-- id: 0 -->
    - Inputs: `work_order_id`, `reason`, `new_start_date`, `new_end_date`.
    - Logic: Update status, dates. Log reason (added to description). Reset tasks. Sync plan status.
- [x] Implement "Reopen" button in `PlanDetail.tsx` (or `WorkOrderDetails`) <!-- id: 1 -->
- [x] Create "Reopen Modal" with form inputs <!-- id: 2 -->
- [x] Connect Frontend to Backend <!-- id: 3 -->
- [x] Verify Permissions (Manager only) <!-- id: 4 -->

## Outcome
- [x] Gestores can resurrect dead Work Orders.
- [x] Gantt chart remains consistent with new dates.

## Implementation Notes
- **RPC Function:** `public.reopen_work_order` implemented and refined with plan status sync.
- **Frontend:** `PlanDetail.tsx` now contains the re-open logic and dialog.
- **Permissions:** Restricted to 'Gestor', 'Mestre', 'Planejador' via UI profile check and RPC security definer.

## Status
Done (2025-12-18)
