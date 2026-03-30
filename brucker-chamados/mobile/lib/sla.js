import { colors } from './theme';

export function getSlaInfo(chamado) {
  if (!chamado.sla_vence_em || ['concluido', 'cancelado'].includes(chamado.status)) {
    return null;
  }

  if (chamado.sla_pausado_em) {
    return { text: 'SLA pausado', color: colors.yellow };
  }

  const minutos = chamado.sla_tempo_restante_minutos;
  if (minutos != null) {
    if (minutos <= 0) return { text: 'SLA vencido', color: colors.red };
    const h = Math.floor(minutos / 60);
    const m = Math.floor(minutos % 60);
    if (minutos <= 360) return { text: `${h}h ${m}m`, color: colors.yellow };
    return { text: `${h}h restantes`, color: colors.green };
  }

  // Fallback: cálculo local
  const diff = new Date(chamado.sla_vence_em) - new Date();
  const horas = diff / (1000 * 60 * 60);
  if (horas <= 0) return { text: 'SLA vencido', color: colors.red };
  if (horas <= 6) return { text: `${Math.floor(horas)}h ${Math.floor((horas % 1) * 60)}m`, color: colors.yellow };
  return { text: `${Math.floor(horas)}h restantes`, color: colors.green };
}
