const statusConfig = {
  aberto: { label: 'Aberto', color: '#4D8EF5', bg: 'rgba(77, 142, 245, 0.15)' },
  em_atendimento: { label: 'Em Atendimento', color: '#C9A227', bg: 'rgba(201, 162, 39, 0.15)' },
  aguardando_peca: { label: 'Aguardando Peça', color: '#E84C1E', bg: 'rgba(232, 76, 30, 0.15)' },
  concluido: { label: 'Concluído', color: '#3D9E6B', bg: 'rgba(61, 158, 107, 0.15)' },
  cancelado: { label: 'Cancelado', color: '#8A94A6', bg: 'rgba(138, 148, 166, 0.15)' }
};

const urgenciaConfig = {
  normal: { label: 'Normal', color: '#4D8EF5', bg: 'rgba(77, 142, 245, 0.15)' },
  alta: { label: 'Alta', color: '#C9A227', bg: 'rgba(201, 162, 39, 0.15)' },
  critica: { label: 'Crítica', color: '#E84C1E', bg: 'rgba(232, 76, 30, 0.15)' }
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.aberto;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      color: config.color,
      backgroundColor: config.bg,
      textTransform: 'capitalize'
    }}>
      {config.label}
    </span>
  );
}

export function UrgenciaBadge({ urgencia }) {
  const config = urgenciaConfig[urgencia] || urgenciaConfig.normal;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      color: config.color,
      backgroundColor: config.bg
    }}>
      {config.label}
    </span>
  );
}
