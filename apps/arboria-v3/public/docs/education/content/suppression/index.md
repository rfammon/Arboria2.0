# Módulo Técnico: Supressão Arbórea e Sistemas de Rigging

## Introdução

A supressão de árvores em ambientes urbanos e florestais transcende o simples corte de madeira; é um procedimento de engenharia de alto risco que exige o gerenciamento preciso de forças físicas, vetores de queda e integridade estrutural. Para o Engenheiro Florestal, a decisão pela supressão (corte final/abate) ocorre quando as medidas de mitigação de risco não são mais suficientes ou quando o indivíduo apresenta patologias irreversíveis.

Este módulo aborda as metodologias de abate direto e desmontagem controlada, com ênfase na física do *rigging* (aparelhamento), uso de *speedlines* para otimização logística e considerações finais sobre o manejo do toco.

## Seções Técnicas

### Abate Direto (Felling) vs. Desmontagem (Dismantling)

A escolha da técnica depende do alvo e da integridade da árvore:

1.  **Abate Direto:** Usado quando há espaço livre (Altura da Árvore + Margem de Segurança). Requer precisão no entalhe direcional e dobradiça.
2.  **Desmontagem:** Obrigatória em ambientes confinados. A árvore é cortada em pedaços (blocking down) de cima para baixo. Requer escalada ou plataforma, e geralmente o uso de cordas para descer as peças controladamente (*Rigging*).

### Sistemas de Rigging (Aparelhamento)

A física do *rigging* envolve o gerenciamento de energia potencial e cinética.

*   **Dispositivos de Fricção (Portawrap/Bollard):** Essenciais na base da árvore. Permitem que o homem de solo controle cargas pesadas apenas com uma mão, convertendo a energia cinética da queda em calor através do atrito, reduzindo o choque na corda e na ancoragem.
*   **Polias e Blocos de Impacto:** Devem ser dimensionados para cargas dinâmicas. O ângulo da corda na polia multiplica a força na ancoragem (ex: 2x a carga se os cabos estiverem paralelos).
*   **Speedline (Tirolesa):** Sistema onde os galhos cortados deslizam por uma corda esticada até a zona de processamento (zona morna), agilizando a limpeza e protegendo a base da árvore ou alvos frágeis (telhados, jardins).

### Destoca

Após a supressão, a remoção do toco elimina riscos de tropeço e rebrote indesejado, além de liberar a área para replantio. Pode ser feita mecanicamente (destocador) ou manual/química (menos comum em áreas urbanas).

## Avaliação de Conhecimento

```json
{
  "type": "quiz",
  "minScore": 7.5,
  "questions": [
    {
      "text": "Qual é a relação força-tensão no ponto de ancoragem (*Rigging Point*) quando se utiliza um bloco roldana para baixar uma carga, considerando que os ramos da corda de entrada e saída são paralelos?",
      "options": [
        "A força exercida sobre o ponto de ancoragem e o bloco é, teoricamente, o dobro (2x) da massa da carga dinâmica.",
        "A força é igual à carga.",
        "A força é dividida pela metade.",
        "A força é nula devido à roldana."
      ],
      "correctAnswer": 0,
      "explanation": "Física de polias: Se a corda entra e sai na mesma direção, a polia deve suportar tanto a carga sendo baixada quanto a força de quem está segurando/puxando."
    },
    {
      "text": "Para que serve a técnica de 'Speedline' (Tirolesa) em operações de desmontagem?",
      "options": [
        "Para transportar galhos cortados diretamente da copa para a zona de processamento, evitando que caiam na base da árvore e agilizando a limpeza.",
        "Para o escalador descer mais rápido.",
        "Para subir a motosserra.",
        "Para medir a altura da árvore."
      ],
      "correctAnswer": 0,
      "explanation": "Speedlines otimizam a logística e protegem alvos frágeis abaixo da copa (como telhados ou jardins)."
    },
    {
      "text": "Ao avaliar uma árvore para desmontagem, o que indica uma 'Ram's Horn' (Fissura Enrolada) no tronco?",
      "options": [
        "Indica que a ferida não fechou adequadamente e as margens enrolaram para dentro. Há sempre decomposição avançada associada, tornando o fuste estruturalmente imprevisível e perigoso para escalada ou ancoragem de cargas.",
        "Dano superficial.",
        "Madeira mais flexível.",
        "Defeito estético apenas."
      ],
      "correctAnswer": 0,
      "explanation": "A fissura enrolada é um sinal clássico de falha grave na compartimentalização e podridão interna extensa."
    },
    {
      "text": "Qual a função do dispositivo de fricção basal (Portawrap) no Rigging?",
      "options": [
        "Converter a energia cinética da queda em calor através do atrito, permitindo o alongamento da corda e reduzindo o pico de carga de choque nos pontos de ancoragem.",
        "Travar a carga instantaneamente.",
        "Aumentar a força do homem de solo.",
        "Substituir o nó de ancoragem."
      ],
      "correctAnswer": 0,
      "explanation": "O atrito controlado permite dissipar a energia suavemente, evitando que a corda, a polia ou a árvore se rompam com o impacto ('shock loading')."
    }
  ]
}
```
