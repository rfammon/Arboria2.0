# Avaliação de Risco de Árvores

## Índice

- [Introdução](#introdução)
- [Metodologia TRAQ](#metodologia-traq)
- [Categorias de Risco](#categorias-de-risco)
- [Matriz de Avaliação](#matriz-de-avaliação)
- [Fatores de Risco](#fatores-de-risco)
- [Decision Trees](#decision-trees)
- [Referências](#referências)

---

## Introdução

A avaliação de risco de árvores é um processo sistemático que identifica, analisa e prioriza árvores que representam potencial de causar danos a pessoas ou propriedades. A padronização dessa avaliação é crítica para garantir consistência entre equipes e facilit

ar priorização de intervenções.

> ⚠️ **Padronização:** Este módulo segue a metodologia **TRAQ (Tree Risk Assessment Qualification)** da International Society of Arboriculture (ISA).

---

## Metodologia TRAQ

### 1. Identificação de Alvos

**Alvo:** Qualquer bem ou pessoa que possa ser atingida por falha da árvore.

**Categorias de Alvo:**
- 🏠 **Estruturas permanentes** (residências, edifícios comerciais)
- 🚗 **Veículos estacionados** (ruas, estacionamentos)
- 🚶 **Pedestres** (calçadas, praças, parques)
- ⚡ **Infraestrutura** (fiação, tubulação)

**Ocupação do Alvo:**
- **Alta:** Uso constante (>50% do tempo) - ex: calçada movimentada
- **Média:** Uso esporádico (10-50%) - ex: garagem residencial
- **Baixa:** Uso raro (<10%) - ex: quintal privado
- **Infrequente:** Uso ocasional - ex: trilha em reserva

---

### 2. Avaliação de Probabilidade de Falha

Analisar **3 componentes estruturais:**

#### A. Sistema Radicular
- [ ] Raízes expostas com podridão
- [ ] Inclinação recente do tronco
- [ ] Solo rachado/elevado ao redor da base
- [ ] Corte de raízes por obra (>30% circunferência)
- [ ] Podridão em raízes principais

#### B. Tronco
- [ ] Cavidades (>30% diâmetro)
- [ ] Rachaduras/fissuras verticais
- [ ] Fungos de podridão (ex: *Ganoderma*)
- [ ] Cancro ativo
- [ ] Inclinação excessiva (>10°)
- [ ] Descascamento extenso

#### C. Copa/Galhos
- [ ] Galhos mortos >10cm diâmetro
- [ ] Co-dominância com casca inclusa
- [ ] Galhos quebrados ou pendurados
- [ ] Desequilíbrio excessivo (peso assimétrico)
- [ ] Ângulos de inserção <30°

**Probabilidade de Falha:**
- **Iminente:** Falha esperada em qualquer momento
- **Provável:** Falha esperada em 1-2 anos
- **Possível:** Falha eventual (2-10 anos)
- **Improvável:** Falha rara em condições normais

---

### 3. Determinação de Consequência

**Impacto da Falha:**
- **Severo:** Morte ou ferimentos graves, danos estruturais significativos
- **Significativo:** Ferimentos moderados, danos reparáveis
- **Menor:** Ferimentos leves ou danos cosméticos
- **Negligenciável:** Sem ferimentos ou danos materiais

---

### 4. Classificação Final de Risco

Combinando **Probabilidade, Alvo e Consequência**:

| Probabilidade | Ocupação Alta | Ocupação Média | Ocupação Baixa |
|---------------|---------------|----------------|----------------|
| **Iminente**  | EXTREMO       | ALTO           | MODERADO       |
| **Provável**  | ALTO          | MODERADO       | BAIXO          |
| **Possível**  | MODERADO      | BAIXO          | BAIXO          |
| **Improvável**| BAIXO         | BAIXO          | BAIXO          |

---

## Categorias de Risco

### 🔴 Risco EXTREMO
**Ação:** Intervenção imediata (< 24h)

**Características:**
- Falha iminente + alvo de alta ocupação
- Risco de vida imediato
- Isolamento de área obrigatório

**Exemplos:**
- Galho grande quebrado sobre calçada movimentada
- Árvore inclinada sobre residência após tempestade
- Copa inteira morta em praça pública

---

### 🟠 Risco ALTO
**Ação:** Intervenção urgente (< 1 semana)

**Características:**
- Falha provável + alvo de ocupação média/alta
- Risco significativo de danos

**Exemplos:**
- Cavidade grande no tronco próxima a estacionamento
- Co-dominância com rachadura em avenida
- Raízes apodrecidas em parque urbano

---

### 🟡 Risco MODERADO
**Ação:** Planejamento de intervenção (1-6 meses)

**Características:**
- Falha possível OU alvo de baixa ocupação
- Monitoramento necessário

**Exemplos:**
- Galhos secos em quintal residencial
- Inclinação leve sem sinais de falha
- Defeit

os estruturais monitoráveis

---

### 🟢 Risco BAIXO
**Ação:** Manutenção de rotina (> 6 meses)

**Características:**
- Falha improvável
- Consequências mínimas
- Manutenção preventiva

**Exemplos:**
- Poda de limpeza em área pouco movimentada
- Avaliação de rotina de árvore saudável
- Monitoramento anual

---

## Matriz de Avaliação

### Worksheet de Campo

```
IDENTIFICAÇÃO DA ÁRVORE:
ID: ____________  Espécie: ____________  DAP: ______cm

LOCALIZAÇÃO:
Endereço: _____________________________________
Coordenadas: ___________________________________

ALVO:
Tipo: [  ] Estrutura  [  ] Pessoas  [  ] Veículos  [  ] Infra
Ocupação: [  ] Alta  [  ] Média  [  ] Baixa  [  ] Infrequente

SISTEMA RADICULAR:
[  ] Raízes saudáveis
[  ] Raízes expostas/podres
[  ] Inclinação recente
[  ] Solo perturbado
Notas: _________________________________________

TRONCO:
[  ] Tronco íntegro
[  ] Cavidade (<30% / >30%)
[  ] Rachadura
[  ] Fungos
[  ] Cancro
Notas: _________________________________________

COPA:
[  ] Copa saudável
[  ] Galhos mortos (diâmetro: ___cm)
[  ] Co-dominância
[  ] Desequilíbrio
[  ] Galhos quebrados
Notas: _________________________________________

PROBABILIDADE DE FALHA:
[  ] Iminente  [  ] Provável  [  ] Possível  [  ] Improvável

CONSEQUÊNCIA:
[  ] Severa  [  ] Significativa  [  ] Menor  [  ] Negligenciável

CLASSIFICAÇÃO DE RISCO:
[  ] EXTREMO  [  ] ALTO  [  ] MODERADO  [  ] BAIXO

AÇÃO RECOMENDADA:
[  ] Intervenção imediata (<24h)
[  ] Urgente (<1 sem)
[  ] Programada (1-6 meses)
[  ] Rotina (>6 meses)
[  ] Apenas monitoramento

OBSERVAÇÕES:
____________________________________________________
____________________________________________________

AVALIADOR: ________________  DATA: ___/___/______
```

---

## Fatores de Risco

### Fatores Agravantes

**Aumentam probabilidade ou severidade:**
- ⬆️ Espécie com madeira quebradiça (*Sibipiruna, Tipuana*)
- ⬆️ Histórico de queda na região
- ⬆️ Ventos fortes frequentes
- ⬆️ Área costeira (sal e vento)
- ⬆️ Solo compactado/impermeabilizado
- ⬆️ Proximidade com obras/escavações
- ⬆️ Poda drástica anterior
- ⬆️ Pragas ou doenças ativas

### Fatores Atenuantes

**Diminuem risco:**
- ⬇️ Espécie resistente (*Ipê, Jacarandá*)
- ⬇️ Solo profundo e fértil
- ⬇️ Manutenção regular comprovada
- ⬇️ Sistema radicular bem desenvolvido
- ⬇️ Área protegida de ventos fortes
- ⬇️ Gestão preventiva de pragas

---

## Decision Trees

### Árvore de Decisão 1: Ação Imediata?

```
Início
  |
  ├─ Falha iminente? ────┐
  |                      |
  SIM                   NÃO
   |                      |
   ├─ Alvo presente? ────┐  └─> Continuar avaliação
   |                     |
   SIM                  NÃO
    |                    |
    └─> EXTREMO       ALTO (monitorar)
       (isolar + intervir)
```

### Árvore de Decisão 2: Priorização de Intervenção

```
Risco identificado
  |
  ├─ Classificação?
  |
  ├─ EXTREMO ──> PRIORIDADE 1 (<24h)
  |              • Isolar área
  |              • Acionar equipe emergência
  |              • Notificar autoridades
  |
  ├─ ALTO ─────> PRIORIDADE 2 (<1 sem)
  |              • Programar intervenção urgente
  |              • Sinalizar área
  |              • Notificar proprietário
  |
  ├─ MODERADO ─> PRIORIDADE 3 (1-6 meses)
  |              • Incluir em plano de manejo
  |              • Monitoramento periódico
  |              • Documentar evolução
  |
  └─ BAIXO ────> PRIORIDADE 4 (>6 meses)
                 • Manutenção de rotina
                 • Avaliação anual
```

---

## Referências

**Fontes Técnicas:**

1. **Manual de Bombeiros - Vistoria Poda e Corte de Árvores**  
   Corpo de Bombeiros Militar | Metodologia TRAQ adaptada

2. **Procedimento - Corte e Poda de Árvores Rev00**  
   Documento técnico interno | Matrizes de risco e protocolos

**Normas e Metodologias:**

- **TRAQ (Tree Risk Assessment Qualification)** - ISA (International Society of Arboriculture)
- **NBR 16246-2:2013** - Avaliação de árvores
- **Best Management Practices - Tree Risk Assessment** - ISA, 2011

**Conceitos Técnicos:**

- **Alvo:** Objeto ou pessoa que pode ser impactada por falha
- **Probabilidade de Falha:** Estimativa da chance de ocorrência
- **Consequência:** Magnitude dos danos potenciais
- **Casca Inclusa:** Casca comprimida entre galhos co-dominantes, criando ponto fraco estrutural
- **Cancro:** Área de tecido morto no tronco ou galho, geralmente causada por fungo ou bactéria

---

**Última atualização:** 2025-12-13  
**Versão:** 1.0  
**Autor:** Equipe Arboria - Material adaptado de metodologia TRAQ e fontes técnicas nacionais
