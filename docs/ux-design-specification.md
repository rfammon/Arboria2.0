---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - 'docs/prd.md'
  - 'docs/prd-executive-summary.md'
  - 'docs/product-brief.md'
  - 'docs/architecture.md'
  - 'docs/epics.md'
workflowType: 'ux-design'
lastStep: 14
project_name: 'Arboria 3.0'
user_name: 'Ammon'
date: '2025-12-12T18:33:22-03:00'
designDirection: 'hybrid-blade-thumb'
partyModeUsed: true
keyDecisions:
  - 'Dual Density Architecture'
  - 'Composition Pattern for Components'
  - 'WCAG AAA Contrast'
  - 'Touch-First Mobile Design'
  - 'Offline-First Core Experience'
  - 'Rugged UX for Field Work'
  - 'Executive Authority for Reports'
  - 'BladeUI with URL-Driven State'
  - 'Thumb Zone Architecture'
  - 'Shadcn/ui Design System with Strict Token Enforcement'
  - 'Point-and-Identify Defining Interaction'
  - 'Visual Foundation: Premium Field Gear'
  - 'Design Direction: Context-Adaptive Precision'
  - 'User Journeys: Verified Burst Mode & Silent Sync'
  - 'Component Strategy: CSS Variables for Density & Split Blade-Drawer'
  - 'Environmental Resilience: Photo Caching & Impact Buttons'
  - 'State & Presence: Functional Skeletons & Live Occupation'
  - 'Technical Strategy: Service Worker Caching & LRU Storage'
  - 'UX Consistency Patterns: Dual-Platform Button & Feedback Logic'
  - 'Responsive Choice: Adaptive Breakpoints (768px)'
  - 'Accessibility Compliance: WCAG AAA Contrast & Shape Redundancy'
---

# UX Design Specification - Arboria 3.0

**Author:** Ammon  
**Date:** 2025-12-12T15:30:20-03:00

---

## 🎯 Diretrizes Estratégicas de Design

### Posicionamento Visual
**Enterprise-grade moderno** alinhado aos grandes players de tecnologia do mercado, abandonando identidade visual legado em favor de tendências atuais enterprise sérias.

### Princípios de Design

**1. Profissionalismo Sóbrio**
- Visual clean e profissional
- Fácil leitura em todas as condições (campo, escritório, mobile)
- Alinhamento com padrões enterprise modernos (Microsoft, Google Cloud, AWS, Salesforce)

**2. Natureza + Tecnologia**
- **Paleta Core:** Tons de azul (tecnologia, confiança) + tons de verde (natureza, sustentabilidade)
- Equilíbrio visual entre ambiente natural e ferramental digital
- Sofisticação sem perder conexão com missão ambiental

**3. Escalabilidade de Dados**
- Interface otimizada para volumes **grandes** (1000+ árvores) e **pequenos** (10 árvores)
- Performance visual consistente independente do tamanho do dataset
- Hierarquia de informação clara para navegação eficiente

### Referências de Mercado
- **Microsoft Azure:** Clean, profissional, azul enterprise
- **Salesforce:** Data-heavy UI, verde sustentável
- **AWS Console:** Densidade de informação gerenciável
- **Google Cloud:** Tipografia legível, espaçamento generoso

---

## Resumo Executivo

### Visão do Projeto

Arboria 3.0 é uma plataforma enterprise-grade de gestão e inventário arbóreo que moderniza completamente um sistema legado para arquitetura multi-plataforma (Desktop Tauri + Mobile Capacitor) com React 18 + TypeScript + Supabase, focada em offline-first e multi-tenant seguro. O projeto abandona a identidade visual legado em favor de tendências enterprise modernas, alinhando-se aos grandes players de tecnologia mantendo conexão com a missão ambiental.

### Usuários-Alvo e Prioridades

**5 Perfis Profissionais (por ordem de horas de uso):**

1. **Planejadores** 🥇 - Uso diário intensivo em escritório (PC). Criam planos de intervenção, analisam inventários, geram cronogramas. Perfil crítico para UX de densidade de informação.

2. **Executantes** 🥈 - Uso contínuo em campo (mobile/tablets). Executam tarefas de manutenção arbórea. **Menor tech literacy** - requer UX extremamente simples com touch targets grandes e fluxos lineares.

3. **Gestores** - Supervisão e coordenação de equipes e instalações (Desktop + Mobile).

4. **Inventariadores** - Campanhas sazonais em campo (mobile/tablets). Documentam árvores com fotos, medições, avaliações. Uso intensivo mas esporádico.

5. **Mestres** - Super-admin com acesso ocasional para configurações globais.

### Contexto de Uso Real

**Campo (Mobile/Tablets):**
- ☀️ **Condições:** Luz do sol direta, tempo bom (preferencialmente dia claro)
- 👥 **Perfis:** Inventariadores (campanhas sazonais) + Executantes (uso contínuo)
- 🔧 **Atividades:** Captura de dados, fotos, medições + execução de tarefas de manutenção
- ⏱️ **Padrão de Uso:** Sessions curtas 2-5min (burst sessions), glanceability crítica
- 📱 **Dispositivos:** Smartphones e tablets Android

**Escritório (Desktop/PCs):**
- 👔 **Perfis:** Planejadores (uso intensivo diário) + Gestores + Mestres
- 📊 **Atividades:** Análise de inventário, criação de planos, monitoramento, gestão
- ⏱️ **Padrão de Uso:** Sessions longas 30min-2h, análise profunda
- 💻 **Dispositivos:** PCs (Windows/Mac)

**Volumes de Dados:**
- **Comum:** 10-500 árvores por instalação
- **Excepcional:** 1000+ árvores (grandes plantas industriais)
- **Otimização:** Priorizar UX para volumes médios (10-500)

---

## Decisões Técnicas Aprovadas

### Arquitetura: Dual Density Pattern

**Conceito:** Não responsive tradicional (mesma UI escalando), mas **Adaptive UX** com 2 templates fundamentalmente differentes compartilhando design tokens.

**Implementação (Refinamento Party Mode):**
Utilizar **CSS Variables** no root para performance máxima em dispositivos Android, em vez de React Context.

```css
/* root.css */
:root[data-density='field'] {
  --spacing-base: 24px;
  --font-size-base: 18px;
  --touch-target: 56px;
  --border-weight: 1.5px;
}

:root[data-density='office'] {
  --spacing-base: 16px;
  --font-size-base: 16px;
  --touch-target: 44px;
  --border-weight: 1px;
}
```

---

## User Journey Flows

### 1. Mobile: "The Robust Inventory Loop" (Burst Mode)
**Target:** <30s per tree with High Confidence.

```mermaid
graph TD
    A[Start: Standing near Tree] --> B{GPS Locked?}
    B -- No --> C[Show Map + 'Locate Me' FAB]
    B -- Yes --> D[Auto-Center Map on User]
    D --> E[Show Nearest Trees as Pins]
    E --> F{Tree Exists?}
    F -- No --> G[Tap 'Plant New Tree' (Alternative Flow)]
    F -- Yes --> H[Tap Nearest Pin]
    H --> I[Open Full-Screen Photo Verify]
    I --> J{Matches Reality?}
    J -- No (User close) --> K[Return to Map for Manual Select]
    J -- Yes (User confirm) --> L[Expand to Full 'Burst Form']
    L --> M[Thumb Zone: Update Risk/Health]
    M --> N[Tap 'Save' (Haptic Confirm)]
    N --> O[Auto-Select Next Nearest Tree]
```

---

## Component Strategy

### Design System Components (Shadcn/ui)
Utilizaremos Shadcn/ui como base de primitivos, estilizados via CSS Variables para suportar a arquitetura de Dual Density.
- **Overlay:** `Sheet` (Base para Blade Desktop), `Dialog` (Confirmações).

### Custom Components (Domain Specific)

#### `TreeKeycard`
- **Purpose:** Representação visual unitária da árvore.
- **Offline Reliability (Hardened):** Um **Service Worker** intercepta e gerencia um cache local (IndexedDB) de thumbnails WebP (~20kb).
- **Storage Management:** Política **LRU (Least Recently Used)** para limpeza automática.
- **State Polish:** Usa **Functional Skeletons** para loading, preservando o layout final.

#### `ImpactNumericInput`
- **Purpose:** Entrada de dados numéricos para ambientes de alta fricção.
- **Design:** Botões grandes de **[-]** e **[+]** (Impact Buttons).
- **Behavior:** Suporte a **Long-Press Acceleration**.
- **Validation:** Implementar **Real-time Pre-Flight** (validação `onBlur`).

#### `SmartScanButton` (FAB)
- **Purpose:** Gatilho principal de campo. 56x56px, pulsante, com haptic feedback.

#### `Blade` vs `Drawer` (Split Strategy)
- **Desktop (Blade):** `Sheet` lateral, URL-synchronized. Inclui **Live Occupation Badges**.
- **Mobile (Drawer):** Bottom-sheet nativo (`Vaul`), foco no Thumb Zone.

---

## UX Consistency Patterns

### Button Hierarchy & Placement
- **Ação Primária:** Azul Arboria (`#0066CC`). Utilizado para salvar e avançar.
- **Ação de Destaque (Interaction):** Safety Orange (`#F97316`). Reservado EXCLUSIVAMENTE para o SmartScan FAB (mobile).
- **Mobile Placement:** Botões flutuantes ou fixos na base (Thumb Zone). Primário sempre à direita.
- **Desktop Placement:** Cabeçalho da Blade ou rodapé de formulários.

### Feedback Patterns
- **Confirmação de Ação:** Triplo feedback no mobile: Visual (Toast), Tátil (Haptic Pulse) e Marcador no Mapa.
- **Estado de Sincronização:** Indicador persistente (Yellow/Blue/Green).
- **Erros Críticos:** Notificações fixas (não dismissible automaticamente).

### Navigation Patterns
- **Contexto Preservado (Desktop):** Navegar entre árvores na lista/mapa em Desktop NÃO fecha a Blade; o conteúdo da Blade é substituído instantaneamente.
- **Mobile:** Foco total no Thumb Zone via Tab Bar inferior fixa.

---

## Responsive Design & Accessibility

### Responsive Strategy
Arboria adota uma abordagem **Adaptive Shell** em vez de responsive fluido tradicional:
- **Mobile (Field):** Foco em "Burst Mode" e uma mão só. Layouts colapsados em wizards lineares.
- **Desktop (Office):** Foco em densidade de informação e preservação de contexto (Blade UI).
- **Tablet:** Híbrido. Landscape herda Desktop (Blade); Portrait herda Mobile (Drawer).

### Breakpoint Strategy
- **Breakpoint Principal:** `768px`.
- **Logic:** 
  - `< 768px`: Shell Mobile (Drawer, Bottom Nav, Touch High-Density).
  - `>= 768px`: Shell Desktop (Blade, Side Nav, Mouse/Keyboard Density).

### Accessibility Strategy (WCAG AA+)
- **Visual Contrast:** WCAG AAA strict para todos os textos (Indispensável para uso sob sol direto).
- **Shape Redundancy:** Marcadores de risco e status NÃO utilizam apenas cor. Eles possuem **Glyphs únicos** e **Padrões de preenchimento** distintos para usuários com daltonismo.
- **Touch Targets:** Mínimo de **56x56px** no mobile para operação segura em campo.
- **Focus Management:** Suporte total a navegação por teclado (Skip links e Focus rings visíveis) no Desktop.

### Testing Strategy
1.  **Mobile Field Test:** Teste físico com luz solar direta para validação de contraste e legibilidade.
2.  **Color Blindness Simulation:** Validação de todos os badges e pins de mapa via simuladores de Daltonismo.
3.  **Keyboard-Only Audit:** Garantir que 100% da gestão de inventário em Desktop possa ser feita via teclado.

### Implementation Guidelines
1.  **Relative Units:** Uso mandatório de `rem` para tipografia e `em` para espaçamento interno de componentes.
2.  **Aria-Labels:** Todo componente decorativo ou ícone sem texto deve possuir `aria-label` descritivo.
3.  **Media Query Rules:** Layouts estruturais devem ser chaveados no breakpoint de `768px` no nível do root element ou layout shell.
