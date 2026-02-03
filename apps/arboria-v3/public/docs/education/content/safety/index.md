# Módulo de Treinamento: Segurança no Trabalho na Arboricultura

## Introdução

**Resumo Executivo**
Este módulo de treinamento foi desenvolvido para engenheiros florestais experientes e profissionais da arboricultura. Ele sintetiza protocolos de segurança críticos derivados de procedimentos operacionais (Petrobras, CBMDF), manuais técnicos (Stihl) e diretrizes internacionais (ISA, USDA). O objetivo é ir além dos conceitos básicos de segurança e abordar riscos específicos de alta consequência associados às operações de cuidado com árvores: esforço ergonômico de maquinário pesado, incidentes de "atingido por" em zonas de queda, riscos de proximidade elétrica e estresse térmico fisiológico.

## Seções Técnicas

### 2.1. Ergonomia na Operação de Motosserras
A motosserra é uma extensão do corpo do operador; a biomecânica inadequada leva à fadiga, perda de controle e lesões crônicas.

*   **Contato de Três Pontos & Empunhadura:** Os operadores devem manter uma empunhadura firme com as duas mãos o tempo todo. A mão esquerda segura o punho dianteiro enquanto a direita segura o punho traseiro (mesmo para canhotos). Crucialmente, os **polegares devem envolver continuamente os punhos** para evitar que a serra se solte durante um evento de rebote (kickback).
*   **Posicionamento Operacional:**
    *   **Limite da Linha do Ombro:** Nunca opere a motosserra acima da altura do ombro. Elevar a serra desloca o centro de gravidade e reduz o controle, aumentando o risco de ferimentos na cabeça/pescoço em caso de rebote.
    *   **Postura de Boxeador:** Mantenha a perna esquerda ligeiramente à frente em um ângulo de 45 graus para estabilidade contra as forças de tração/empurrão da corrente.

### 2.2. Riscos de Zona de Queda e "Atingido Por"
A causa número um de fatalidades na arboricultura não é a queda de altura, mas ser atingido por objetos caindo (galhos, toras, ferramentas).

*   **Zona de Exclusão:** O raio de segurança deve ser **1,5 vezes a altura da árvore**. Se a árvore tem 20m, a zona de exclusão é de 30m. Ninguém, exceto o operador ativo, entra nesta zona.
*   **Ricochete:** Galhos raramente caem em linha reta. Eles batem na copa inferior e são projetados horizontalmente.

### 2.3. Riscos Elétricos e Distâncias de Aproximação (MAD)
Árvores são condutores de eletricidade (devido à água e sais minerais na seiva). O contato direto não é necessário para a eletrocussão; o arco voltaico pode ocorrer pela simples aproximação.

*   **Zona Livre vs. Zona Controlada:** Para arvoristas não qualificados em linha viva, deve-se manter uma distância mínima de 3 a 5 metros de qualquer condutor, dependendo da tensão (Norma NR-10/NBR 16246).
*   **Ferramentas Isoladas:** O uso de podões com haste isolada é obrigatório próximo à rede, mas eles devem ser limpos e testados regularmente.

### 2.4. Estresse Térmico e Hidratação
A fadiga térmica reduz a cognição e o tempo de reação, levando a erros operacionais.

*   **Sintomas:** Tontura, cãibras, confusão mental.
*   **Prevenção:** Pausas programadas à sombra e hidratação obrigatória (não opcional) antes de sentir sede.

## Avaliação de Conhecimento

```json
{
  "type": "quiz",
  "minScore": 7.5,
  "questions": [
    {
      "text": "Qual é a regra ergonômica crítica, muitas vezes violada, referente à altura máxima de operação de uma motosserra para garantir o controle em caso de rebote?",
      "options": [
        "Nunca operar a motosserra acima da altura dos ombros.",
        "Nunca operar acima da altura da cintura.",
        "Nunca operar acima da altura da cabeça.",
        "Não há limite de altura se o operador estiver ancorado."
      ],
      "correctAnswer": 0,
      "explanation": "Operar acima do ombro coloca a serra perto do rosto/pescoço e reduz a alavancagem mecânica dos braços para conter um rebote (kickback)."
    },
    {
      "text": "De acordo com os boletins de segurança do Corpo de Bombeiros e Petrobras, qual é o raio mínimo recomendado para isolamento da 'Zona de Queda' (Drop Zone) em relação à altura da árvore?",
      "options": [
        "A altura da árvore mais 50% (1,5x).",
        "A altura exata da árvore (1,0x).",
        "Duas vezes a altura da árvore (2,0x).",
        "A altura da árvore mais 10 metros."
      ],
      "correctAnswer": 0,
      "explanation": "Tanto o procedimento da Petrobras quanto os boletins dos Bombeiros especificam que o raio deve ser 1,5 vezes a altura da árvore para compensar ricochetes e estilhaços."
    },
    {
      "text": "Um trabalhador de solo está apoiando uma operação de poda usando um podão de haste condutiva. De acordo com a NBR 16246 e procedimentos de segurança, qual a restrição específica em relação a redes elétricas?",
      "options": [
        "A ferramenta não deve ser usada dentro de 5 metros da rede elétrica.",
        "O trabalhador pode tocar os fios se usar luvas dielétricas.",
        "O trabalhador pode operar desde que a tensão seja inferior a 13,8 kV.",
        "Apenas a ponta da serra deve permanecer fora da Distância Mínima."
      ],
      "correctAnswer": 0,
      "explanation": "Procedimentos de segurança proíbem explicitamente o uso de ferramentas condutivas ou hastes de poda não isoladas dentro de 5 metros de redes elétricas para não-eletricistas."
    },
    {
      "text": "Qual dos seguintes NÃO é reconhecido como causa direta de fadiga térmica (estresse térmico) nas operações de arboricultura?",
      "options": [
        "Ingestão excessiva de eletrólitos.",
        "Exposição prolongada ao sol.",
        "Falta de pausas operacionais.",
        "Hidratação insuficiente."
      ],
      "correctAnswer": 0,
      "explanation": "Os manuais citam exposição prolongada, falta de pausas e desidratação como causas. O excesso de eletrólitos não é listado como causa de fadiga térmica; a hidratação é a medida preventiva."
    }
  ]
}
```
