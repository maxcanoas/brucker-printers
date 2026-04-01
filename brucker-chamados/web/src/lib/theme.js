export const darkTheme = {
  bg: '#0D1117',
  card: '#141920',
  border: '#1E2533',
  accent: '#E84C1E',
  accentHover: '#D4410F',
  text: '#FFFFFF',
  textSecondary: '#8A94A6',
  inputBg: '#0D1117',
  hoverBg: 'rgba(255, 255, 255, 0.05)',
  overlayBg: 'rgba(0, 0, 0, 0.7)',
  accentBg: 'rgba(232, 76, 30, 0.15)',
  accentBgHover: 'rgba(232, 76, 30, 0.08)',

  // Status (iguais nos dois temas)
  green: '#3D9E6B',
  blue: '#4D8EF5',
  yellow: '#C9A227',
  red: '#E84C1E',
  purple: '#9B59B6',
};

export const lightTheme = {
  bg: '#F5F6F8',
  card: '#FFFFFF',
  border: '#E2E5EA',
  accent: '#E84C1E',
  accentHover: '#D4410F',
  text: '#1A1D24',
  textSecondary: '#6B7280',
  inputBg: '#F0F1F3',
  hoverBg: 'rgba(0, 0, 0, 0.04)',
  overlayBg: 'rgba(0, 0, 0, 0.4)',
  accentBg: 'rgba(232, 76, 30, 0.1)',
  accentBgHover: 'rgba(232, 76, 30, 0.06)',

  // Status (iguais nos dois temas)
  green: '#3D9E6B',
  blue: '#4D8EF5',
  yellow: '#C9A227',
  red: '#E84C1E',
  purple: '#9B59B6',
};

export const statusColors = {
  aberto: darkTheme.blue,
  atribuido: darkTheme.purple,
  em_atendimento: darkTheme.yellow,
  aguardando_peca: darkTheme.red,
  concluido: darkTheme.green,
  cancelado: '#8A94A6',
};

export const statusLabels = {
  aberto: 'Aberto',
  atribuido: 'Atribuído',
  em_atendimento: 'Em Atendimento',
  aguardando_peca: 'Aguardando Peça',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const urgenciaColors = {
  normal: darkTheme.blue,
  alta: darkTheme.yellow,
  critica: darkTheme.red,
};
