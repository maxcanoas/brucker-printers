export const colors = {
  bg: '#0D1117',
  card: '#141920',
  border: '#1E2533',
  accent: '#E84C1E',
  text: '#FFFFFF',
  textSecondary: '#8A94A6',
  green: '#3D9E6B',
  blue: '#4D8EF5',
  yellow: '#C9A227',
  red: '#E84C1E',
};

export const statusColors = {
  aberto: colors.blue,
  em_atendimento: colors.yellow,
  aguardando_peca: colors.red,
  concluido: colors.green,
  cancelado: colors.textSecondary,
};

export const statusLabels = {
  aberto: 'Aberto',
  em_atendimento: 'Em Atendimento',
  aguardando_peca: 'Aguardando Peça',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const urgenciaColors = {
  normal: colors.blue,
  alta: colors.yellow,
  critica: colors.red,
};
