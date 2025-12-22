# Pesquisa Técnica: Migração Arboria 3.0

**Data:** 2025-12-11
**Status:** Rascunho Inicial
**Foco:** Validação do Stack (React/Tauri/Capacitor) e Estratégias de Migração

## 1. Estratégia de Codebase Unificado (Tauri + Capacitor)

A pesquisa confirma que a melhor abordagem é manter um **único projeto React (Vite)** que serve como "core" para ambas as plataformas.

### Estrutura Recomendada
*   **Core:** React + Vite + TypeScript.
*   **Build System:** Vite configurado para output agnóstico.
*   **Desktop (Windows):** Tauri consome o build do Vite diretamente (devUrl em desenvolvimento).
*   **Mobile (Android):** Capacitor sincroniza a pasta de build (`dist`) para o projeto nativo.

### Benefícios Validados
*   **Reuso de Código:** ~95% do código (RN de UI, Lógica, Estado) é compartilhado.
*   **Desenvolvimento Rápido:** HMR (Hot Module Replacement) do Vite funciona para ambos.
*   **Plugins:** Possibilidade de criar uma camada de abstração para plugins (ex: `useCamera()` que detecta se é Tauri ou Capacitor e chama a API correta).

## 2. Migração de Mapas (Leaflet vs React-Leaflet)

A migração de Vanilla JS Leaflet para `react-leaflet` requer cuidados específicos de performance, especialmente para os mapas pesados do Arboria.

### Desafios e Soluções
*   **Performance de Markers:** `react-leaflet` pode ser lento com milhares de markers se renderizados como componentes individuais.
    *   **Solução:** Uso de **Clusters** (`SuperCluster`) é obrigatório.
    *   **Solução:** Renderização em **Canvas** (`preferCanvas={true}`) em vez de SVG para grandes datasets.
*   **Re-renders:** Mapas em React tendem a re-renderizar desnecessariamente.
    *   **Solução:** Uso estrito de `useMemo` para props de GeoJSON e componentes `React.memo` para camadas estáticas.
*   **Contexto:** O estado do mapa (zoom, center) deve ser gerenciado com cuidado para não "brigar" com o estado do React.

## 3. Integração Supabase (Vanilla -> React)

A mudança de chamadas diretas para um paradigma reativo é a maior mudança arquitetural.

### Padrões de Migração
*   **Data Fetching:** Substituir chamadas `await supabase...` soltas por **TanStack Query (React Query)**.
    *   *Benefício:* Cache automático, deduplicação de requests, estados de loading/error nativos e **persistência offline**.
*   **Auth:** `AuthProvider` global ouvindo `onAuthStateChange` para gerenciar sessão em tempo real.
*   **Types:** Geração automática de tipos TypeScript a partir do schema do Supabase (`supabase gen types`) para garantir type-safety em todo o frontend.

## 4. Estratégia Offline-First

Como o sistema é usado em campo, o suporte offline é crítico.

*   **Mobile (Capacitor):** Suporte nativo robusto. Uso de SQLite local ou `ionic-storage` para cache de dados críticos.
*   **Desktop (Tauri):** Plugin `tauri-plugin-sql` (SQLite) para persistência local similar ao mobile.
*   **Sincronização:** Implementar padrão de "Action Queue": ações feitas offline entram numa fila (Zustand persist) e são processadas quando a conexão retorna.

## Conclusão Preliminar

O stack **React + Vite + TypeScript** combinado com **Tauri** e **Capacitor** é tecnicamente viável e altamente recomendado para o Arboria 3.0. A complexidade principal não está no setup, mas na **migração da lógica de mapas** e na implementação robusta da **sincronização offline** para duas plataformas diferentes.

**Recomendação:** Seguir com a criação do **Product Brief** para consolidar essas definições técnicas com a visão de produto.
