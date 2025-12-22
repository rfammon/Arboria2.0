---
stepsCompleted: [1]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'advanced_gps_algorithms'
research_goals: 'Identificar a melhor estratégia de implementação para algoritmos de alta precisão (Hatch Filter, PPP, RTK) no sistema Arboria (Android/Capacitor).'
user_name: 'Ammon'
date: '2025-12-21'
web_research_enabled: true
source_verification: true
---

# Pesquisa Técnica: Algoritmos Avançados de GPS para Arboria

**Data:** 21 de Dezembro de 2025
**Autor:** Antigravity (Pesquisador Técnico AI)
**Status:** Completo

## Sumário Executivo

Esta pesquisa analisa as alternativas técnicas para implementar algoritmos de GPS de alta precisão no aplicativo Arboria (Android via Capacitor). O objetivo é superar a precisão limitada do GPS padrão (3-5m) utilizando medições brutas GNSS (Raw GNSS Measurements) disponíveis em dispositivos Android modernos (API 24+).

A conclusão principal é que a implementação de um **Filtro Hatch (Carrier Phase Smoothing)** nativo em Java é a abordagem de melhor custo-benefício imediato, oferecendo precisão sub-métrica potencial sem a complexidade de portar bibliotecas C (como RTKLIB) via JNI. O Google `gps-measurement-tools` fornece uma referência de implementação direta.

---

## Tabela de Conteúdos

1. [Introdução e Contexto](#1-introdução-e-contexto)
2. [Fundamentos: Raw GNSS no Android](#2-fundamentos-raw-gnss-no-android)
3. [Alternativa A: Hatch Filter (Carrier Phase Smoothing)](#3-alternativa-a-hatch-filter-carrier-phase-smoothing)
4. [Alternativa B: Integração com RTKLIB (RTK/PPP)](#4-alternativa-b-integração-com-rtklib-rtkppp)
5. [Alternativa C: Extended Kalman Filter (Sensor Fusion)](#5-alternativa-c-extended-kalman-filter-sensor-fusion)
6. [Análise Comparativa](#6-análise-comparativa)
7. [Recomendação de Implementação](#7-recomendação-de-implementação)
8. [Referências Bibliográficas](#8-referências-bibliográficas)

---

## 1. Introdução e Contexto

O sistema Arboria requer captura de coordenadas de alta precisão para inventário florestal. Soluções padrão de "Weighted Average" (Média Ponderada) melhoram a estabilidade, mas não corrigem erros sistemáticos da atmosfera e multicaminhamento de forma tão eficaz quanto o uso da Fase da Portadora (Carrier Phase).

Com a disponibilização de medições brutas (Pseudorange, Doppler, Carrier Phase) na API do Android, torna-se possível implementar algoritmos geodésicos diretamente no smartphone. Este documento explora como integrar essas capacidades.

## 2. Fundamentos: Raw GNSS no Android

Desde o Android 7 (Nougat), a classe `GnssMeasurement` fornece acesso a dados de baixo nível.

**Campos Críticos:**
- **Pseudorange**: Distância aproximada ao satélite (sujeita a ruído).
- **Accumulated Delta Range (ADR)**: A medida da Fase da Portadora (em metros). É extremamente precisa (mm) mas ambígua e sujeita a "cycle slips" (perda de sinal momentânea).
- **Accumulated Delta Range State**: Indica se o ADR é válido e síncrono. Essencial para detectar perda de rastreio sob a copa das árvores [2].

**Limitação Florestal (Cycle Slips):**
Em ambientes florestais, o sinal de fase é frequentemente interrompido. Algoritmos robustos devem resetar o filtro ou detectar o "slip" imediatamente para evitar divergir a solução [7].

## 3. Alternativa A: Hatch Filter (Carrier Phase Smoothing)

O Filtro de Hatch é uma técnica clássica que usa a alta precisão da variação da fase para "suavizar" o pseudorange ruidoso ao longo do tempo.

### Implementação
O Google disponibiliza o projeto open-source `gps-measurement-tools` que contém uma implementação Java de um suavizador de pseudorange.

- **Classe Chave**: `PseudorangeSmoother.java`
- **Lógica**: Utiliza o ADR (ou Doppler se ADR não disponível) para propagar a solução entre épocas, reduzindo o ruído do código (pseudorange) [8].
- **Vantagem**: Código puramente Java, facilmente integrável ao plugin `GnssPlugin.java` já criado.
- **Desafio**: Requer lógica para lidar com *duty cycling* do chip GPS (que desliga a fase para economizar bateria). É necessário forçar "Full Duty Cycle" nas opções de desenvolvedor ou via API.

## 4. Alternativa B: Integração com RTKLIB (RTK/PPP)

O RTKLIB é o padrão-ouro open-source para posicionamento de precisão (RTK/PPP), escrito em C.

### Implementação no Android
Existem ports como o `RtkGps` (sctg-development) que encapsulam o RTKLIB com JNI (Java Native Interface) [1].

- **Vantagem**: Capacidade de RTK (Real Time Kinematic) se houver conexão com base NTRIP, ou PPP (Precise Point Positioning) autônomo.
- **Desvantagem**: Altíssima complexidade. Requer compilar código C (NDK), gerenciar arquivos de configuração complexos e alto consumo de bateria.
- **Viabilidade para Arboria**: Excessivo para a fase atual. O PPP leva tempo para convergir (15-30 min), o que pode não ser prático para inventário "Stop-and-Go" rápido.

## 5. Alternativa C: Extended Kalman Filter (Sensor Fusion)

Fusão de GNSS com acelerômetro/giroscópio (IMU).

- **Uso**: Ideal para manter a trajetória quando o GPS falha momentaneamente (ex: caminhando entre árvores densas).
- **Implementação**: Google Fused Location Provider (FLP) já faz isso de forma "caixa preta". Implementar um EKF manual para *melhorar* a precisão estática é difícil sem modelos de erro muito bem calibrados para o hardware específico.
- **Conclusão**: Melhor focar em "Raw GNSS Smoothing" (Hatch) para o ponto estático do que tentar recriar o FLP.

## 6. Análise Comparativa

| Critério | Hatch Filter (Java) | RTKLIB (C/NDK) | Standard Weighted Avg |
| :--- | :--- | :--- | :--- |
| **Precisão Potencial** | < 1m (após 10-20s) | < 10cm (RTK) / < 50cm (PPP) | 2-5m |
| **Complexidade** | Média | Muito Alta | Baixa |
| **Resiliência a Árvores** | Média (reset no slip) | Baixa (perde fix no slip) | Alta (apenas ignora ruim) |
| **Tempo de Convergência** | Rápido (< 5s) | Lento (PPP) ou Rápido (RTK) | Imediato |
| **Dependências** | Nenhuma (Android API) | NDK, Libs Externas | Nenhuma |

## 7. Recomendação de Implementação

Recomendo a abordagem **Faseada**:

1.  **Imediato (Fase 1 - Raw GNSS Smoothing):**
    *   Adaptar a classe `PseudorangeSmoother` do Google para o nosso `GnssPlugin`.
    *   Aplicar o alisamento nas medições brutas e calcular a posição resultante (Weighted Least Squares simples) localmente no dispositivo.
    *   **Meta**: Reduzir "saltos" durante a coleta estática.

2.  **Futuro (Fase 2 - RTK se necessário):**
    *   Se a precisão do Hatch Filter for insuficiente, avaliar integração do RTKLIB via uma *sidecar app* (como "NTRIP Client") que injeta "Mock Locations" de alta precisão no Android, em vez de integrar nativamente no código do Arboria.

**Próximos Passos Técnicos:**
1.  Atualizar `GnssPlugin` para usar `PseudorangeSmoother`.
2.  Implementar detecção de "Cycle Slip" verificando `getAccumulatedDeltaRangeState()`.

## 8. Referências Bibliográficas

[1] sctg-development/RtkGps. GitHub. Disponível em: https://github.com/sctg-development/RtkGps
[2] Google. GnssMeasurement Class definitions. Android Developers.
[3] Google. gps-measurement-tools. GitHub. Disponível em: https://github.com/google/gps-measurement-tools
[7] GSA. GNSS Raw Measurements White Paper. European GNSS Agency.
[8] PseudorangeSmoother.java. Google Source.

---
*Documento gerado automaticamente pelo fluxo de pesquisa BMM.*
