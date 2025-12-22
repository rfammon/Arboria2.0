import type { TRAQRiskCriteria } from '../../types/traq';

export const DEFAULT_TRAQ_CRITERIA: TRAQRiskCriteria[] = [
    { id: 1, categoria: 'Copa e Galhos', criterio: 'Galhos > 5 cm necessitando poda (mortos/pendurados)', peso: 3, failure_prob: 'Possível', ordem: 1, ativo: true },
    { id: 2, categoria: 'Tronco', criterio: 'Existem rachaduras ou fendas no tronco ou galhos principais?', peso: 5, failure_prob: 'Provável', ordem: 2, ativo: true },
    { id: 3, categoria: 'Tronco', criterio: 'Há sinais de apodrecimento (madeira esponjosa, fungos, cavidades)?', peso: 5, failure_prob: 'Provável', ordem: 3, ativo: true },
    { id: 17, categoria: 'Tronco', criterio: 'Cancros no tronco principal (estrutura comprometida)', peso: 3, failure_prob: 'Provável', ordem: 4, ativo: true },
    { id: 4, categoria: 'Estrutura', criterio: 'A árvore possui uniões em "V" com casca inclusa?', peso: 4, failure_prob: 'Possível', ordem: 5, ativo: true },
    { id: 5, categoria: 'Copa e Galhos', criterio: 'Há galhos cruzados ou friccionando entre si?', peso: 2, failure_prob: 'Possível', ordem: 6, ativo: true },
    { id: 6, categoria: 'Copa e Galhos', criterio: 'A árvore apresenta copa assimétrica (>30% de desequilíbrio)?', peso: 2, failure_prob: 'Possível', ordem: 7, ativo: true },
    { id: 7, categoria: 'Estabilidade', criterio: 'Há sinais de inclinação anormal ou recente?', peso: 5, failure_prob: 'Iminente', ordem: 8, ativo: true },
    { id: 8, categoria: 'Alvo', criterio: 'A árvore está próxima a vias públicas ou áreas de circulação?', peso: 5, failure_prob: 'Possível', ordem: 9, ativo: true },
    { id: 9, categoria: 'Alvo', criterio: 'Há risco de queda sobre edificações, veículos ou pessoas?', peso: 5, failure_prob: 'Provável', ordem: 10, ativo: true },
    { id: 10, categoria: 'Conflitos', criterio: 'A árvore interfere em redes elétricas ou estruturas urbanas?', peso: 4, failure_prob: 'Possível', ordem: 11, ativo: true },
    { id: 11, categoria: 'Espécie', criterio: 'A espécie é conhecida por apresentar alta taxa de falhas?', peso: 3, failure_prob: 'Possível', ordem: 12, ativo: true },
    { id: 12, categoria: 'Histórico', criterio: 'A árvore já sofreu podas drásticas ou brotação epicórmica intensa?', peso: 3, failure_prob: 'Possível', ordem: 13, ativo: true },
    { id: 13, categoria: 'Raízes', criterio: 'Há calçadas rachadas ou tubulações expostas próximas à base?', peso: 3, failure_prob: 'Possível', ordem: 14, ativo: true },
    { id: 14, categoria: 'Raízes', criterio: 'Há perda visível de raízes de sustentação (>40%)?', peso: 5, failure_prob: 'Iminente', ordem: 15, ativo: true },
    { id: 15, categoria: 'Raízes', criterio: 'Há sinais de compactação ou asfixia radicular?', peso: 3, failure_prob: 'Possível', ordem: 16, ativo: true },
    { id: 16, categoria: 'Raízes', criterio: 'Há apodrecimento em raízes primárias (>3 cm)?', peso: 5, failure_prob: 'Provável', ordem: 17, ativo: true }
];
