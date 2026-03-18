import { Clock, AlertTriangle } from 'lucide-react';

export function SlaIndicator({ slaVenceEm, slaPausadoEm, status }) {
  if (!slaVenceEm || ['concluido', 'cancelado'].includes(status)) return null;

  if (slaPausadoEm) {
    return (
      <span style={{ color: '#C9A227', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={14} /> SLA pausado
      </span>
    );
  }

  const agora = new Date();
  const vence = new Date(slaVenceEm);
  const diffMs = vence - agora;
  const diffHoras = diffMs / (1000 * 60 * 60);

  if (diffHoras <= 0) {
    return (
      <span style={{ color: '#E84C1E', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
        <AlertTriangle size={14} /> SLA vencido
      </span>
    );
  }

  if (diffHoras <= 6) {
    const horas = Math.floor(diffHoras);
    const minutos = Math.floor((diffHoras - horas) * 60);
    return (
      <span style={{ color: '#C9A227', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <AlertTriangle size={14} /> {horas}h {minutos}m restantes
      </span>
    );
  }

  const horas = Math.floor(diffHoras);
  return (
    <span style={{ color: '#3D9E6B', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Clock size={14} /> {horas}h restantes
    </span>
  );
}
