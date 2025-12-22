# ArborIA - Documentação do Projeto

**Gerado em:** 2025-12-09  
**Versão:** 2.0  
**Tipo:** Progressive Web Application (PWA)  
**Status:** Produção

---

## Sumário Executivo

ArborIA é um sistema completo de manejo integrado de árvores com foco em gestão de risco, desenvolvido como Progressive Web App (PWA). O sistema oferece funcionalidades de levantamento de dados em campo, criação de planos de intervenção, gestão de projetos, geração de laudos PDF automatizados e visualização em mapas interativos.

### Características Principais

- **PWA Completo**: Funciona offline com Service Worker
- **Mapas Interativos**: MapLibre GL JS para visualização geoespacial
- **Backend Cloud**: Supabase (PostgreSQL + Auth + Storage)
- **Sincronização**: Sistema avançado de sincronização com resolução de conflitos
- **Gestão de Projetos**: Sistema completo com Gantt charts
- **Geração de Laudos**: PDFs automatizados com jsPDF
- **Educação**: Módulo de treinamento técnico integrado

---

## Stack Tecnológico

### Frontend

| Categoria | Tecnologia | Versão/Detalhes |
|-----------|-----------|-----------------|
| **Core** | HTML5, CSS3, JavaScript ES6+ | Vanilla JS (Modules) |
| **Mapas** | MapLibre GL JS | ✅ Atual (Leaflet = legado) |
| **Coordenadas** | Proj4.js | Transformações geográficas |
| **PDF** | jsPDF | Geração de laudos |
| **Compressão** | JSZip | Import/Export de dados |
| **Fontes** | Google Fonts (Inter) | Typography |
| **Ícones** | Font Awesome 6.4.0 | UI Icons |
| **PWA** | Service Worker | Cache e offline |

### Backend & Infraestrutura

| Categoria | Tecnologia | Uso |
|-----------|-----------|-----|
| **Database** | Supabase (PostgreSQL) | Armazenamento principal |
| **Auth** | Supabase Auth | Autenticação de usuários |
| **Storage** | Supabase Storage | Fotos de árvores |
| **Realtime** | Supabase Realtime | Sincronização em tempo real |
| **Hosting** | Static (PWA) | Deploy como app estático |

### Arquitetura

**Padrão:** Modular Service-Based Architecture

```
ArborIA/
├── Frontend Layer (HTML/CSS/JS)
│   ├── UI Components (Modular CSS)
│   ├── Service Layer (*.service.js)
│   ├── UI Layer (*.ui.js)
│   └── Module Layer (*-module.js)
├── Data Layer
│   ├── Supabase Client (API)
│   ├── Local Storage (Offline)
│   └── Sync Service (Conflict Resolution)
└── PWA Layer
    ├── Service Worker (Cache)
    └── Manifest (Install)
```

---

## Estrutura de Diretórios

```
ArborIA - webAPP - BMAD/
├── index.html              # Aplicação principal
├── login.html              # Tela de autenticação
├── report.html             # Visualizador de relatórios
├── manifest.json           # PWA manifest
├── service-worker.js       # Service Worker para offline
├── package.json            # Configuração NPM
│
├── js/                     # Módulos JavaScript (50 arquivos)
│   ├── Core Services
│   │   ├── supabase-client.js       # Cliente Supabase
│   │   ├── auth.guard.js            # Proteção de rotas
│   │   ├── state.js                 # Gerenciamento de estado
│   │   └── utils.js                 # Utilitários gerais
│   │
│   ├── Data Services
│   │   ├── tree.service.js          # Serviço de árvores
│   │   ├── sync.service.js          # Sincronização básica
│   │   ├── advanced-sync.service.js # Sincronização avançada
│   │   ├── conflict-resolution.service.js  # Resolução de conflitos
│   │   ├── validation.service.js    # Validação de dados
│   │   └── database.js              # Camada de dados local
│   │
│   ├── Feature Modules
│   │   ├── arboria-module.js        # Módulo principal de inventário
│   │   ├── projects-module.js       # Gestão de planos (146KB!)
│   │   ├── features.js              # Features principais
│   │   └── content.js               # Gerenciamento de conteúdo
│   │
│   ├── UI Components
│   │   ├── auth.ui.js               # Interface de autenticação
│   │   ├── map.ui.js                # Interface de mapas
│   │   ├── table.ui.js              # Tabelas interativas
│   │   ├── modal.ui.js              # Modais
│   │   ├── tooltip.ui.js            # Tooltips
│   │   ├── sync.ui.js               # UI de sincronização
│   │   └── conflict-resolution.ui.js # UI de conflitos
│   │
│   ├── Specialized Tools
│   │   ├── clinometer.js            # Medição de altura
│   │   ├── dap.estimator.js         # Estimador de DAP
│   │   ├── gps.service.js           # Captura de GPS
│   │   ├── coordinates.service.js   # Serviço de coordenadas
│   │   └── pdf.generator.js         # Geração de PDFs
│   │
│   ├── Checklist System
│   │   ├── checklist.service.js     # Serviço de checklist
│   │   └── checklist.mobile.service.js  # Versão mobile
│   │
│   └── Legacy/Libs
│       ├── leaflet.js               # ⚠️ LEGADO - Remover
│       ├── leaflet.css              # ⚠️ LEGADO - Remover
│       ├── proj4.js                 # Transformações de coordenadas
│       └── jszip.min.js             # Compressão de arquivos
│
├── css/                    # Estilos modulares (26 arquivos)
│   ├── style.css                    # Estilos base
│   └── modules/
│       ├── 01_components.forms.css
│       ├── 01_components.helpers.css
│       ├── 01_components.auth.css
│       ├── 02_feature.sync.css
│       ├── 03_feature.clinometer.css
│       ├── 04_feature.projects.css
│       └── 05_feature.gantt.css
│
├── libs/                   # Bibliotecas externas
│   └── maplibre-gl.css             # MapLibre styles
│
├── img/                    # Assets de imagem
│   ├── icons/                       # Ícones da aplicação
│   └── [imagens de poda/educação]
│
├── sql-scripts/            # Scripts SQL do Supabase
│   ├── [11 arquivos .sql]
│   └── debug_planos_table.sql
│
├── docs/                   # Documentação
│   ├── bmm-workflow-status.yaml
│   └── project-scan-report.json
│
└── supabase/               # Configurações Supabase
    └── config.toml
```

---

## Módulos Principais

### 1. **Arboria Module** (`arboria-module.js` - 90KB)
**Propósito:** Módulo central de inventário arbóreo

**Funcionalidades:**
- Cadastro de árvores com dados dendrométricos
- Avaliação de risco (15 critérios ponderados)
- Captura de fotos com upload para Supabase Storage
- Geolocalização precisa (GPS)
- Cálculo automático de risco
- Sugestão de mitigação

**Dependências:**
- `supabase-client.js`
- `tree.service.js`
- `gps.service.js`
- `validation.service.js`

---

### 2. **Projects Module** (`projects-module.js` - 147KB)
**Propósito:** Gestão completa de planos de intervenção

**Funcionalidades:**
- Criação de planos de intervenção
- Gestão de cronogramas (Gantt chart)
- Sistema de dependências entre tarefas
- KPIs e dashboards
- Distribuição por tipo de intervenção
- Geração de relatórios de plano
- Sincronização com Supabase

**Componentes:**
- Dashboard de KPIs
- Gantt Chart interativo
- Lista de planos
- Editor de planos
- Sistema de dependências

**Tabelas Supabase:**
- `planos` - Planos de intervenção
- `plan_dependencies` - Dependências entre tarefas

---

### 3. **Advanced Sync Service** (`advanced-sync.service.js` - 79KB)
**Propósito:** Sincronização avançada com resolução de conflitos

**Funcionalidades:**
- Sincronização bidirecional
- Detecção de conflitos
- Estratégias de resolução:
  - Server Wins
  - Client Wins
  - Manual Merge
- Versionamento de dados
- Retry automático
- Queue de sincronização

**Algoritmo:**
1. Detecta mudanças locais e remotas
2. Compara timestamps
3. Identifica conflitos
4. Aplica estratégia de resolução
5. Sincroniza mudanças
6. Atualiza estado local

---

### 4. **Conflict Resolution** (`conflict-resolution.service.js` - 34KB)
**Propósito:** Gerenciamento de conflitos de dados

**Tipos de Conflito:**
- Modificação concorrente
- Deleção vs Modificação
- Conflitos de schema

**UI:** `conflict-resolution.ui.js` (31KB)
- Interface visual para resolução manual
- Diff viewer
- Merge tool

---

### 5. **Supabase Client** (`supabase-client.js` - 51KB)
**Propósito:** Camada de abstração para Supabase

**Funcionalidades:**
- Autenticação (login, logout, session)
- CRUD de árvores
- CRUD de planos
- Upload de fotos
- Realtime subscriptions
- Error handling
- Retry logic

**Tabelas:**
- `arvores` - Inventário de árvores
- `planos` - Planos de intervenção
- `plan_dependencies` - Dependências de tarefas
- `users` - Usuários (Supabase Auth)

---

### 6. **Map UI** (`map.ui.js` - 25KB)
**Propósito:** Interface de mapas interativos

**Tecnologia:** MapLibre GL JS (não Leaflet!)

**Funcionalidades:**
- Visualização de árvores no mapa
- Filtros por nível de risco
- Popup com detalhes
- Simbologia por risco:
  - Baixo: Verde
  - Médio: Amarelo
  - Alto: Laranja
  - Muito Alto: Vermelho
- Clustering de pontos
- Controles de zoom/pan

---

### 7. **PDF Generator** (`pdf.generator.js` - 34KB)
**Propósito:** Geração de laudos técnicos

**Tipos de Laudo:**
- Laudo Geral (todas as árvores)
- Laudo Individual (árvore específica)
- Relatório de Plano de Intervenção

**Conteúdo:**
- Cabeçalho com logo
- Tabelas de dados
- Mapas estáticos
- Fotos das árvores
- Análise de risco
- Recomendações

---

### 8. **Validation Service** (`validation.service.js` - 25KB)
**Propósito:** Validação de dados e regras de negócio

**Validações:**
- Dados dendrométricos (altura, DAP)
- Coordenadas geográficas
- Datas de planos
- Conflitos de cronograma
- Integridade referencial

---

### 9. **Education Module** (Integrado no `index.html`)
**Propósito:** Treinamento técnico em manejo florestal

**Conteúdos:**
- Definições e termos técnicos
- Planejamento e avaliação de risco
- Termos legais (ASV)
- Preparação e isolamento
- Técnicas de poda e supressão
- EPIs e análise de risco
- Gestão de resíduos (MTR)
- Glossário geral

---

## Fluxos Principais

### Fluxo 1: Levantamento de Dados

```
1. Usuário acessa "Levantamento de Dados"
2. Preenche formulário:
   - Dados dendrométricos (espécie, altura, DAP)
   - Localização (GPS ou manual)
   - Observações de campo
   - Foto (opcional)
3. Avalia 15 fatores de risco (checklist)
4. Sistema calcula risco total
5. Sugere mitigação
6. Salva no Supabase
7. Atualiza mapa e tabela
```

### Fluxo 2: Criação de Plano de Intervenção

```
1. Usuário acessa "Gestão de Planos"
2. Clica em "Novo Plano"
3. Seleciona árvores do inventário
4. Define cronograma (Gantt)
5. Adiciona dependências entre tarefas
6. Define responsáveis
7. Salva plano
8. Sistema gera dashboard de KPIs
9. Sincroniza com Supabase
```

### Fluxo 3: Sincronização

```
1. Usuário faz mudanças offline
2. Ao reconectar, sync service detecta mudanças
3. Compara com servidor
4. Se conflito:
   - Mostra UI de resolução
   - Usuário escolhe versão ou merge
5. Aplica mudanças
6. Atualiza local e remoto
7. Notifica usuário
```

---

## Banco de Dados (Supabase)

### Tabela: `arvores`

```sql
CREATE TABLE arvores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  data DATE,
  especie TEXT,
  local TEXT,
  altura NUMERIC,
  dap NUMERIC,
  coord_x NUMERIC,
  coord_y NUMERIC,
  avaliador TEXT,
  observacoes TEXT,
  foto_url TEXT,
  risk_score INTEGER,
  risk_level TEXT, -- 'baixo', 'médio', 'alto', 'muito_alto'
  mitigation_action TEXT,
  checklist_data JSONB, -- 15 fatores de risco
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);
```

### Tabela: `planos`

```sql
CREATE TABLE planos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE,
  data_fim DATE,
  status TEXT, -- 'planejamento', 'em_andamento', 'concluido'
  arvores UUID[], -- Array de IDs de árvores
  cronograma JSONB, -- Gantt chart data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);
```

### Tabela: `plan_dependencies`

```sql
CREATE TABLE plan_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES planos(id) ON DELETE CASCADE,
  source_task_id TEXT NOT NULL,
  target_task_id TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'finish-to-start',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Autenticação e Segurança

### Row Level Security (RLS)

**Política atual:** Usuários só veem seus próprios dados

```sql
-- Árvores
CREATE POLICY "Users can view own trees"
  ON arvores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trees"
  ON arvores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Planos
CREATE POLICY "Users can view own plans"
  ON planos FOR SELECT
  USING (auth.uid() = user_id);
```

### Autenticação

- **Provider:** Supabase Auth
- **Métodos:** Email/Password
- **Session:** JWT tokens
- **Guard:** `auth.guard.js` protege rotas

---

## PWA e Offline

### Service Worker

**Estratégias de Cache:**
- **Network First:** Dados dinâmicos (API)
- **Cache First:** Assets estáticos (CSS, JS, imagens)
- **Stale While Revalidate:** Mapas

**Funcionalidades:**
- Instalação como app
- Funciona offline
- Sincronização em background
- Notificações (futuro)

---

## Próximas Funcionalidades (Planejadas)

### Sistema de Instalações (Em Planejamento)

**Objetivo:** Multi-tenancy com isolamento de dados

**Conceitos:**
- **Instalação:** Local físico (município, campus, etc.)
- **Perfis de Usuário:**
  - Mestre (desenvolvedor)
  - Gestor (administrador da instalação)
  - Planejador (edição de planos + inventário)
  - Executante (leitura de planos)
  - Inventariador (levantamento de dados)

**Regras:**
- Usuários podem ter múltiplos perfis
- Perfis são específicos por instalação
- Isolamento total de dados entre instalações
- Aprovação de cadastros por gestores

**Fases:**
1. Backend - Schema, RLS, autenticação
2. Frontend - UI de gerenciamento

---

## Pontos de Atenção

### 🔴 Crítico

1. **Leaflet Legado:** Remover `leaflet.js` e `leaflet.css` - substituído por MapLibre
2. **Tamanho do projects-module.js:** 147KB - considerar code splitting
3. **Sem testes automatizados:** Implementar testes unitários e E2E

### 🟡 Importante

1. **Otimização de imagens:** Pasta `img/` tem 11.6MB
2. **Versionamento de dados:** Implementado mas não totalmente testado
3. **Error handling:** Melhorar tratamento de erros de rede

### 🟢 Melhorias Futuras

1. **TypeScript:** Migrar para TS para type safety
2. **Build process:** Webpack/Vite para otimização
3. **Component framework:** Considerar React/Vue para UI complexa
4. **Testing:** Jest + Playwright
5. **CI/CD:** GitHub Actions para deploy automático

---

## Contato e Manutenção

**Desenvolvedor:** [Informação do autor]  
**Repositório:** GitHub (configurado)  
**Documentação:** Este arquivo + código comentado

---

## Changelog

### v2.0 (Atual)
- ✅ Sistema de gestão de planos completo
- ✅ Gantt chart com dependências
- ✅ Sincronização avançada
- ✅ Resolução de conflitos
- ✅ Módulo de educação
- ✅ Dark mode
- ✅ MapLibre (substituiu Leaflet)

### v1.0
- Inventário básico
- Mapas com Leaflet
- Geração de PDFs
- Autenticação Supabase

---

**Última atualização:** 2025-12-09
