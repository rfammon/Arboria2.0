# Módulo Técnico: Avaliação de Riscos e Biomecânica Arbórea

## Introdução

A gestão de riscos arbóreos transcende a simples identificação de árvores mortas; trata-se de uma análise sistemática da interação entre a biologia da árvore (fisiologia e biomecânica) e o ambiente urbano (alvos e exposição). O objetivo primordial não é a eliminação total do risco — uma impossibilidade biológica — mas a redução deste a níveis aceitáveis através do conceito de "cuidado razoável" (Reasonable Care).

Este módulo adota a metodologia quantitativa e qualitativa preconizada pela *International Society of Arboriculture* (ISA) e adaptada por diretrizes governamentais (USDA Forest Service, TRAM Hong Kong, CBMMG), focando na tríade: **Falha x Impacto x Consequência**. O engenheiro florestal deve atuar como um "patologista forense" da árvore, interpretando sinais externos (defeitos) como manifestações de falhas estruturais internas ou comprometimento da ancoragem.

## Seções Técnicas

### A Matriz de Risco: Metodologia e Cálculo

A avaliação de risco moderna abandona a intuição em favor de uma abordagem estruturada baseada em três fatores determinantes. O risco é a interseção da probabilidade de uma falha ocorrer, a probabilidade de um alvo ser atingido e a severidade das consequências.

#### A Fórmula de Risco
A classificação final é derivada da síntese dos seguintes componentes:

1.  **Probabilidade de Falha (Likelihood of Failure):** Avaliada de *Improvável* a *Iminente*, baseada na presença e severidade de defeitos (ex: podridão avançada, fissuras ativas) e nas condições de carga (vento, neve, peso próprio).
2.  **Probabilidade de Impacto (Likelihood of Impact):** Avaliada com base na taxa de ocupação do alvo.
    *   *Muito Baixa:* Áreas raramente usadas (florestas densas sem trilhas).
    *   *Alta:* Ruas movimentadas, alvos fixos (imóveis) contínuos.
3.  **Consequências do Falha (Consequences):** A magnitude do dano (lesões leves, morte, danos materiais severos).

**RISCO = (Probabilidade de Falha) x (Probabilidade de Impacto) x (Consequências)**

### Indicadores Visuais de Falha Biomecânica

O avaliador deve buscar sinais que indiquem a perda de integridade mecânica da madeira:

*   **Casca Inclusa (Included Bark):** Uma união fraca entre galhos ou troncos codominantes onde a casca fica presa dentro da junção, impedindo a união da madeira. É um ponto de falha comum em tempestades.
*   **Fungos Xilófagos (Wood Decay Fungi):** A presença de cogumelos (corpos de frutificação) no tronco ou raízes indica podridão interna ativa. Ex: *Ganoderma spp.*, *Armillaria spp.*.
*   **Rachaduras e Fissuras:** Aberturas longitudinais no tronco indicam estresse de cisalhamento ou torção. Rachaduras transversais são sinais de falha iminente das fibras.
*   **Raízes Estranguladoras (Girdling Roots):** Raízes que circundam e comprimem o colo do tronco, restringindo o fluxo de seiva e estabilidade, podendo causar a queda repentina da árvore inteira.

### Níveis de Risco e Mitigação

A categorização final orienta a ação:

*   **Risco Baixo:** Monitoramento anual; nenhuma ação imediata necessária.
*   **Risco Moderado:** Monitoramento frequente; poda de redução de peso ou instalação de cabos em prazos definidos.
*   **Risco Alto:** Intervenção necessária. Poda de segurança, isolamento da área ou supressão se o alvo não puder ser movido.
*   **Risco Extremo:** Falha iminente. Isolamento imediato da área e supressão de emergência.

## Avaliação de Conhecimento

```json
{
  "type": "quiz",
  "minScore": 7.5,
  "questions": [
    {
      "text": "Na metodologia de Avaliação de Risco da ISA (TRAQ), quais são os três componentes essenciais que devem ser combinados para determinar a Classificação de Risco final?",
      "options": [
        "Probabilidade de Falha, Probabilidade de Impacto (no Alvo) e Consequências da Falha.",
        "Altura da Árvore, Diâmetro do Tronco (DAP) e Idade Estimada.",
        "Espécie da Árvore, Presença de Pragas e Estética da Copa.",
        "Custo da Remoção, Urgência do Cliente e Clima Local."
      ],
      "correctAnswer": 0,
      "explanation": "O risco é uma combinação probabilística de ALGO falhar, ATINGIR alguém/algo e causar DANO."
    },
    {
      "text": "O que caracteriza biomecanicamente a 'Casca Inclusa' (Included Bark) e por que ela é considerada um defeito estrutural grave?",
      "options": [
        "É a invaginação da casca entre dois fustes ou galhos codominantes, que impede a conexão física das fibras de madeira, criando um ponto fraco propenso a rasgar sob tensão (união em 'V').",
        "É o espessamento excessivo da casca na base do tronco, protegendo contra fogo.",
        "É a presença de musgos e liquens cobrindo a casca, escondendo defeitos.",
        "É a regeneração da casca sobre uma ferida antiga, indicando boa saúde."
      ],
      "correctAnswer": 0,
      "explanation": "A casca inclusa age como uma cunha interna, impedindo que a árvore forme madeira de conexão forte entre os galhos ('V' fraco vs 'U' forte)."
    },
    {
      "text": "De acordo com a metodologia ISA/TRAQ, como classificar o risco de uma árvore com defeito grave em área remota?",
      "options": [
        "Risco Baixo ou Nulo, pois não existe um Alvo (Target).",
        "Risco Alto, pois a falha é provável.",
        "Risco Moderado, devido à incerteza.",
        "Risco Extremo, para garantir segurança ambiental."
      ],
      "correctAnswer": 0,
      "explanation": "Risco = Probabilidade de Falha x Impacto x Consequência. Sem alvo, não há risco de dano (Consequência = 0)."
    },
    {
      "text": "Sobre raízes estranguladoras (Stem Girdling Roots), qual o limiar crítico para Alto Risco?",
      "options": [
        "Compressão do tronco afetando mais de 40% da circunferência do colo da árvore.",
        "Presença de qualquer raiz superficial.",
        "Raízes visíveis na superfície sem compressão.",
        "Raízes adventícias na base."
      ],
      "correctAnswer": 0,
      "explanation": "A compressão >40% compromete significativamente a estabilidade e o fluxo vascular."
    }
  ]
}
```
