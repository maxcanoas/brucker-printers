import { Clock, AlertTriangle } from 'lucide-react';

export function SlaIndicator({ slaVenceEm, slaPausadoEm, status, slaTempoRestanteMinutos }) {
  if (!slaVenceEm || ['concluido', 'cancelado'].includes(status)) return null;

  if (slaPausadoEm) {
    return (
      <span style={{ color: '#C9A227', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={14} /> SLA pausado
      </span>
    );
  }

  // Usar tempo restante calculado pelo servidor (considera horário comercial)
  const minutosRestantes = slaTempoRestanteMinutos != null
    ? slaTempoRestanteMinutos
    : calcularFallback(slaVenceEm);

  if (minutosRestantes <= 0) {
    return (
      <span style={{ color: '#E84C1E', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
        <AlertTriangle size={14} /> SLA vencido
      </span>
    );
  }

  const horas = Math.floor(minutosRestantes / 60);
  const minutos = Math.floor(minutosRestantes % 60);

  if (minutosRestantes <= 360) { // 6 horas
    return (
      <span style={{ color: '#C9A227', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <AlertTriangle size={14} /> {horas}h {minutos}m restantes
      </span>
    );
  }

  return (
    <span style={{ color: '#3D9E6B', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Clock size={14} /> {horas}h restantes
    </span>
  );
}

// Fallback: cálculo simples para quando o servidor não envia sla_tempo_restante_minutos
function calcularFallback(slaVenceEm) {
  const diffMs = new Date(slaVenceEm) - new Date();
  return diffMs / (1000 * 60);
}
