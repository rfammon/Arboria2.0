# Módulo de Treinamento: Preparação Operacional e Configuração do Sítio (Site Setup)

## Introdução

A fase de preparação não é meramente logística; é a barreira primária de segurança na arboricultura técnica e supressão vegetal. O sucesso e a segurança de uma operação de manejo arbóreo dependem da execução rigorosa de protocolos prévios à intervenção física na árvore.

Este módulo aborda o estabelecimento de zonas de controle, a definição de canais de comunicação redundantes e a verificação final da integridade biomecânica do espécime. O objetivo é transformar o ambiente variável e caótico de uma floresta ou área urbana em um cenário controlado, onde riscos cinéticos (queda de galhos) e estáticos (falha estrutural) são mitigados através de planejamento rigoroso e sinalização ostensiva.

## Seções Técnicas

### Sinalização e Delimitação da Zona de Trabalho (Zoning)

A delimitação física da área de trabalho é obrigatória para proteger transeuntes e a própria equipe. 

*   **Cálculo do Raio de Segurança:**
    O perímetro de exclusão (Zona Quente) deve ser calculado com base na altura da árvore.
    *   **Padrão Geral:** O raio deve ser de **1,5 vezes a altura da árvore** (ou do galho a ser cortado + 50%).
    *   **Áreas de Tráfego:** Em vias públicas, deve-se considerar faixas adicionais para amortecimento de tráfego.

*   **Zoneamento Operacional:**
    1.  **Zona Quente (Área de Risco):** Acesso restrito apenas aos operadores diretos. Raio de 1,5x a altura.
    2.  **Zona Morna:** Localização da equipe de apoio, triturador e processamento de solo.
    3.  **Zona Fria:** Área livre para circulação pública fora do raio de perigo.

### Protocolos de Comunicação

O ruído das máquinas torna a comunicação verbal ineficaz e perigosa.

*   **Comando de Voz/Apito:** O sistema "Command & Response" é vital. Antes de deixar cair qualquer peça, o escalador deve gritar "LINHA!" ou "MADEIRA!", e só soltar após a resposta positiva ("LIVRE!") da equipe de solo. Apitos são usados para emergências (ex: um silvo longo = PARAR TUDO).
*   **Rádios Comunicadores:** Essenciais em operações complexas ou quando não há visualização direta entre escalador e solo (ex: copa densa). Devem estar fixados no capacete (hands-free).
*   **Sinais de Mão:** Estabelecer sinais claros para "Ligar Motor", "Desligar", "Subir", "Descer", "Pare Instantaneamente".

## Inspeção Pré-Escalada (Pre-Climb Check)

A "Volta Olímpica" ao redor da árvore:

1.  **Inspeção Basal:** Verificar fissuras no solo (root heave), cogumelos ou cavidades no colar.
2.  **Inspeção do Tronco:** Procurar rachaduras longitudinais, casca solta ou inclusa.
3.  **Inspeção da Copa:** Identificar galhos mortos ("Widow Makers") suspensos que podem cair com a vibração da escalada.

## Avaliação de Conhecimento

```json
{
  "type": "quiz",
  "minScore": 7.5,
  "questions": [
    {
      "text": "Qual é a regra padrão para calcular o raio da 'Zona de Queda' (Drop Zone) segura em uma operação de abate ou poda?",
      "options": [
        "Deve ser de pelo menos 1,5 a 2 vezes a altura da árvore, considerando o efeito de ricochete dos galhos ao atingirem outros obstáculos ou o solo.",
        "Deve ser igual à altura exata da árvore.",
        "Deve ser de 10 metros para qualquer árvore.",
        "Deve ser restrita apenas à área sob a projeção da copa (dripline)."
      ],
      "correctAnswer": 0,
      "explanation": "Objetos em queda livre raramente caem em linha reta devido a colisões. A margem de segurança de 150-200% da altura cobre essas variáveis cinéticas."
    },
    {
      "text": "No protocolo de comunicação 'Command & Response' entre escalador e solo, qual é a sequência correta antes de liberar uma peça cortada?",
      "options": [
        "O escalador anuncia a intenção (ex: 'VAI DESCER!'), aguarda a confirmação verbal ou visual do solo (ex: 'LIVRE!'), e somente então realiza o corte ou soltura.",
        "O escalador grita 'MADEIRA!' simultaneamente ao corte para agilizar o processo.",
        "O homem de solo apita constantemente para indicar que a área está livre.",
        "Não é necessária comunicação se a área estiver isolada com fita."
      ],
      "correctAnswer": 0,
      "explanation": "A comunicação de duas vias (closed-loop) é a única forma de garantir que a equipe de solo não entrou na zona de perigo no último segundo."
    },
    {
      "text": "Durante o planejamento de rotas de fuga para o operador de motosserra no abate direcional, qual é a geometria correta recomendada?",
      "options": [
        "As rotas de fuga devem ser a 45º no sentido oposto à queda; ferramentas devem ser abandonadas se necessário para garantir a evasão rápida.",
        "A rota de fuga deve ser exatamente oposta (180º) à direção da queda.",
        "O operador deve correr lateralmente (90º) para evitar o tronco.",
        "O operador deve permanecer próximo ao tronco para monitorar a dobradiça."
      ],
      "correctAnswer": 0,
      "explanation": "Recuar a 180º é perigoso em caso de rebote do tronco (kickback) ou se a árvore rachar (barber chair). O ângulo de 45º afasta o operador da zona de perigo primária e secundária."
    },
    {
      "text": "Ao realizar a inspeção de equipamentos no 'Palco de Materiais', qual condição específica relacionada à corda demanda descarte imediato?",
      "options": [
        "A corda possui diâmetro inconsistente (sinal de dano interno/hérnia) ou pontos moles profundos.",
        "A corda apresenta leve descoloração por uso normal.",
        "A corda está suja de terra.",
        "A corda tem 11mm de diâmetro."
      ],
      "correctAnswer": 0,
      "explanation": "Diâmetro inconsistente indica dano interno estrutural na corda (alma rompida ou deformada), exigindo descarte imediato."
    }
  ]
}
```
