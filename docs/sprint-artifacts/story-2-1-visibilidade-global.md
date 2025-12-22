# Story 2.1: Visibilidade Global de Tarefas

**As a** Gestor/Planejador,
**I want** ver todas as tarefas de execução independente de quem está alocado,
**So that** eu tenha uma visão completa do progresso da equipe.

## Acceptance Criteria

- **Given** que sou Gestor ou Planejador
- **When** acesso a lista de tarefas
- **Then** vejo tarefas de todos os executantes
- **And** posso filtrar por executante

## Tasks

- [x] Update RLS policies to allow manager access <!-- id: 0 -->
- [x] Update `get_my_tasks` RPC to support manager visibility override <!-- id: 1 -->
- [x] Verify `useExecution` hook fetches all tasks for managers <!-- id: 2 -->
- [x] Implement/Verify UI filter to switch between `My Tasks` and `All Tasks` (or filter by user) <!-- id: 3 -->
- [x] Manual verification of visibility <!-- id: 4 -->

## Outcome
- [x] Gestores and Planejadores can see all tasks.
- [x] Executantes only see their own tasks.
- [x] Managers can filter the view by user.

## Dev Notes

- Current `tasks` RLS likely restricts to `auth.uid() = assigned_to`.
- Need to check `perfis` (profiles) to determine if user is Gestor/Planejador.
- `useTaskMutations` and `useExecution` are key frontend files.

## Dev Agent Record

### Implementation Plan
[Empty]

### Completion Notes
[Empty]

## File List
[Empty]

## Change Log
- 2025-12-17: Story created.

## Status
Done (2025-12-18)
