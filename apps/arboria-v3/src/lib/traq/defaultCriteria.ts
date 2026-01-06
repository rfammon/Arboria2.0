import type { TRAQRiskCriteria } from '../../types/traq';

export const DEFAULT_TRAQ_CRITERIA: TRAQRiskCriteria[] = [
    { id: 10, categoria: 'Copa e Galhos', criterio: 'Galhos > 5 cm necessitando poda (mortos/pendurados)', peso: 3, failure_prob: 'Possível', ordem: 1, ativo: true, requires_probability: true },
    { id: 11, categoria: 'Tronco', criterio: 'Existem rachaduras ou fendas no tronco ou galhos principais?', peso: 5, failure_prob: 'Provável', ordem: 2, ativo: true, requires_probability: true },
    { id: 12, categoria: 'Tronco', criterio: 'Há sinais de apodrecimento (madeira esponjosa, fungos, cavidades)?', peso: 5, failure_prob: 'Provável', ordem: 3, ativo: true, requires_probability: true },
    { id: 13, categoria: 'Tronco', criterio: 'Cancros no tronco principal (estrutura comprometida)', peso: 3, failure_prob: 'Provável', ordem: 4, ativo: true, requires_probability: true },
    { id: 14, categoria: 'Estrutura', criterio: 'A árvore possui uniões em "V" com casca inclusa?', peso: 4, failure_prob: 'Possível', ordem: 5, ativo: true, requires_probability: true },
    { id: 15, categoria: 'Copa e Galhos', criterio: 'Há galhos cruzados ou friccionando entre si?', peso: 2, failure_prob: 'Possível', ordem: 6, ativo: true, requires_probability: false },
    { id: 16, categoria: 'Copa e Galhos', criterio: 'A árvore apresenta copa assimétrica (>30% de desequilíbrio)?', peso: 2, failure_prob: 'Possível', ordem: 7, ativo: true, requires_probability: true },
    { id: 17, categoria: 'Estabilidade', criterio: 'Há sinais de inclinação anormal ou recente?', peso: 5, failure_prob: 'Iminente', ordem: 8, ativo: true, requires_probability: true },
    { id: 18, categoria: 'Localização', criterio: 'A árvore está próxima a vias públicas ou áreas de circulação?', peso: 3, failure_prob: 'Possível', ordem: 9, ativo: true, requires_probability: false },
    { id: 19, categoria: 'Impacto', criterio: 'Há risco de queda sobre edificações, veículos ou pessoas?', peso: 5, failure_prob: 'Provável', ordem: 10, ativo: true, requires_probability: false },
    { id: 20, categoria: 'Conflitos', criterio: 'A árvore interfere em redes elétricas ou estruturas urbanas?', peso: 4, failure_prob: 'Possível', ordem: 11, ativo: true, requires_probability: false },
    { id: 21, categoria: 'Espécie', criterio: 'A espécie é conhecida por apresentar alta taxa de falhas?', peso: 3, failure_prob: 'Possível', ordem: 12, ativo: true, requires_probability: false },
    { id: 22, categoria: 'Histórico', criterio: 'A árvore já sofreu podas drásticas ou brotação epicórmica intensa?', peso: 3, failure_prob: 'Possível', ordem: 13, ativo: true, requires_probability: true },
    { id: 23, categoria: 'Raízes', criterio: 'Há calçadas rachadas ou tubulações expostas próximas à base?', peso: 3, failure_prob: 'Possível', ordem: 14, ativo: true, requires_probability: false },
    { id: 24, categoria: 'Raízes', criterio: 'Há perda visível de raízes de sustentação (>40%)?', peso: 5, failure_prob: 'Iminente', ordem: 15, ativo: true, requires_probability: false },
    { id: 25, categoria: 'Raízes', criterio: 'Há sinais de compactação ou asfixia radicular?', peso: 3, failure_prob: 'Possível', ordem: 16, ativo: true, requires_probability: true },
    { id: 26, categoria: 'Raízes', criterio: 'Há apodrecimento em raízes primárias (>3 cm)?', peso: 5, failure_prob: 'Provável', ordem: 17, ativo: true, requires_probability: true }
];
