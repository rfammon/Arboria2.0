export interface FirstAidProtocol {
  id: string;
  label: string;
  icon: string;
  severity: 'high' | 'medium';
  steps: string[];
  warning: string;
}

export const FIRST_AID_PROTOCOLS: FirstAidProtocol[] = [
  {
    id: 'corte-hemorragia',
    label: 'Corte/Hemorragia',
    icon: 'scissors',
    severity: 'high',
    steps: [
      'Lave as mãos antes de iniciar o atendimento.',
      'Aplique pressão direta sobre o ferimento com um pano limpo ou gaze.',
      'Mantenha a pressão por pelo menos 5 a 10 minutos sem interrupção.',
      'Se o pano ficar encharcado de sangue, coloque outro por cima sem remover o primeiro.',
      'Eleve o membro atingido, se possível.',
    ],
    warning: 'Não utilize torniquetes a menos que seja treinado e a hemorragia seja incontrolável.',
  },
  {
    id: 'queda-altura',
    label: 'Queda de Altura',
    icon: 'arrow-down',
    severity: 'high',
    steps: [
      'Verifique se o local é seguro para você e para a vítima.',
      'Chame o serviço de emergência imediatamente.',
      'Não mova a vítima sob nenhuma circunstância, a menos que haja risco iminente de explosão ou incêndio.',
      'Mantenha a vítima calma e acordada, se possível.',
      'Controle hemorragias visíveis apenas com pressão superficial.',
    ],
    warning: 'NÃO MOVA A VÍTIMA. Risco grave de lesão na medula espinhal.',
  },
  {
    id: 'picada-animal',
    label: 'Picada de Animal',
    icon: 'bug',
    severity: 'medium',
    steps: [
      'Lave o local com água e sabão em abundância.',
      'Mantenha a vítima em repouso e o membro picado elevado.',
      'Tente identificar o animal (se possível, tire uma foto à distância segura).',
      'Remova anéis, pulseiras ou relógios que possam prender com o inchaço.',
      'Procure atendimento médico o mais rápido possível.',
    ],
    warning: 'Não tente sugar o veneno nem fazer cortes no local da picada.',
  },
  {
    id: 'mal-subito',
    label: 'Mal Súbito/Desmaio',
    icon: 'user-minus',
    severity: 'medium',
    steps: [
      'Deite a pessoa de costas e eleve as pernas dela acima do nível do coração.',
      'Afrouxe roupas apertadas (cintos, golas).',
      'Verifique se a pessoa está respirando.',
      'Se ela não acordar em 1 minuto, chame emergência.',
      'Quando ela acordar, não a deixe levantar rapidamente.',
    ],
    warning: 'Não ofereça nada para beber ou comer até que a pessoa esteja totalmente consciente.',
  },
  {
    id: 'choque-eletrico',
    label: 'Choque Elétrico',
    icon: 'zap',
    severity: 'high',
    steps: [
      'NÃO TOQUE NA VÍTIMA se ela ainda estiver em contato com a fonte de energia.',
      'Desligue a chave geral de energia ou afaste o fio com um objeto seco e não condutor (madeira ou plástico).',
      'Uma vez seguro, verifique a respiração e os batimentos.',
      'Inicie RCP se necessário (apenas se treinado).',
      'Cubra queimaduras com gaze estéril seca.',
    ],
    warning: 'Mesmo que a vítima pareça bem, ela deve ser avaliada por um médico devido a riscos internos.',
  },
  {
    id: 'outros',
    label: 'Outros',
    icon: 'help-circle',
    severity: 'medium',
    steps: [
      'Mantenha a calma e avalie a situação.',
      'Chame o suporte central ou supervisor.',
      'Forneça informações claras sobre o estado da vítima e localização.',
      'Acompanhe a vítima até a chegada do socorro.',
    ],
    warning: 'Na dúvida, não realize procedimentos invasivos.',
  },
];
