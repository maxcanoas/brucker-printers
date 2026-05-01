const supabase = require('./supabase');
const { ehFeriado } = require('./feriados');

// Predicado central de "dia util" — combina dias da semana configurados
// com a lista de feriados nacionais. Recebe a Date ja em horario local.
function ehDiaUtil(local, config) {
  const diaSemana = local.getDay();
  if (!config.dias.includes(diaSemana)) return false;
  if (ehFeriado(local)) return false;
  return true;
}

// Cache da configuração de horário comercial
let configCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Config padrão caso o banco não retorne
const DEFAULT_CONFIG = {
  inicio: '08:00',
  fim: '18:00',
  dias: [1, 2, 3, 4, 5], // seg=1 a sex=5
  timezone: 'America/Sao_Paulo'
};

async function getConfig() {
  const now = Date.now();
  if (configCache && (now - cacheTimestamp) < CACHE_TTL) {
    return configCache;
  }

  try {
    const { data } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'horario_comercial')
      .single();

    configCache = data?.valor || DEFAULT_CONFIG;
  } catch {
    configCache = DEFAULT_CONFIG;
  }

  cacheTimestamp = now;
  return configCache;
}

/**
 * Converte uma data para o timezone configurado (retorna componentes locais).
 */
function toTimezone(date, timezone) {
  const str = date.toLocaleString('en-US', { timeZone: timezone });
  return new Date(str);
}

/**
 * Verifica se um dado momento é horário comercial.
 */
async function isHorarioComercial(date) {
  const config = await getConfig();
  const local = toTimezone(date, config.timezone);

  if (!ehDiaUtil(local, config)) return false;

  const [hInicio, mInicio] = config.inicio.split(':').map(Number);
  const [hFim, mFim] = config.fim.split(':').map(Number);

  const minutosAtual = local.getHours() * 60 + local.getMinutes();
  const minutosInicio = hInicio * 60 + mInicio;
  const minutosFim = hFim * 60 + mFim;

  return minutosAtual >= minutosInicio && minutosAtual < minutosFim;
}

/**
 * Calcula o deadline do SLA contando apenas horas úteis.
 * Exemplo: 24h úteis a partir de sex 17h (8-18h) = qui 11h da semana seguinte.
 */
async function calcularSlaVenceEm(criadoEm, slaHoras) {
  const config = await getConfig();
  const [hInicio, mInicio] = config.inicio.split(':').map(Number);
  const [hFim, mFim] = config.fim.split(':').map(Number);
  const minutosInicio = hInicio * 60 + mInicio;
  const minutosFim = hFim * 60 + mFim;
  const minutosPorDia = minutosFim - minutosInicio; // ex: 600 min (10h)

  let minutosRestantes = slaHoras * 60;
  let cursor = new Date(criadoEm);

  // Iterar dia a dia contando apenas minutos úteis
  for (let i = 0; i < 365 && minutosRestantes > 0; i++) {
    const local = toTimezone(cursor, config.timezone);

    if (ehDiaUtil(local, config)) {
      const minutosAtual = local.getHours() * 60 + local.getMinutes();

      // Determinar início e fim do período útil NESTE dia a partir do cursor
      const inicioUtil = Math.max(minutosAtual, minutosInicio);
      const fimUtil = minutosFim;

      if (inicioUtil < fimUtil) {
        const minutosDisponiveis = fimUtil - inicioUtil;

        if (minutosRestantes <= minutosDisponiveis) {
          // O SLA termina neste dia
          const minutosFinais = inicioUtil + minutosRestantes;
          const horaFinal = Math.floor(minutosFinais / 60);
          const minFinal = minutosFinais % 60;

          // Construir a data final no timezone local e converter de volta
          const resultado = new Date(local);
          resultado.setHours(horaFinal, minFinal, 0, 0);

          // Converter de volta para UTC
          const utcStr = resultado.toLocaleString('en-US', { timeZone: config.timezone });
          const localDate = new Date(utcStr);
          const diff = localDate.getTime() - resultado.getTime();
          return new Date(resultado.getTime() - diff);
        }

        minutosRestantes -= minutosDisponiveis;
      }
    }

    // Avançar para o próximo dia no início do horário comercial
    const nextLocal = toTimezone(cursor, config.timezone);
    nextLocal.setDate(nextLocal.getDate() + 1);
    nextLocal.setHours(hInicio, mInicio, 0, 0);

    // Converter de volta para UTC
    const utcStr = nextLocal.toLocaleString('en-US', { timeZone: config.timezone });
    const localDate = new Date(utcStr);
    const diff = localDate.getTime() - nextLocal.getTime();
    cursor = new Date(nextLocal.getTime() - diff);
  }

  // Fallback (não deveria chegar aqui)
  return new Date(new Date(criadoEm).getTime() + slaHoras * 60 * 60 * 1000);
}

/**
 * Calcula os minutos úteis entre duas datas (contando só horário comercial).
 */
async function calcularMinutosUteis(dataInicio, dataFim) {
  const config = await getConfig();
  const [hInicio, mInicio] = config.inicio.split(':').map(Number);
  const [hFim, mFim] = config.fim.split(':').map(Number);
  const minutosInicio = hInicio * 60 + mInicio;
  const minutosFim = hFim * 60 + mFim;

  let totalMinutos = 0;
  let cursor = new Date(dataInicio);
  const fim = new Date(dataFim);

  for (let i = 0; i < 365 && cursor < fim; i++) {
    const local = toTimezone(cursor, config.timezone);

    if (ehDiaUtil(local, config)) {
      const minutosAtual = local.getHours() * 60 + local.getMinutes();
      const inicioUtil = Math.max(minutosAtual, minutosInicio);
      const fimUtil = minutosFim;

      if (inicioUtil < fimUtil) {
        // Verificar se dataFim cai neste mesmo dia
        const localFim = toTimezone(fim, config.timezone);
        const mesmoDia = local.getFullYear() === localFim.getFullYear() &&
                         local.getMonth() === localFim.getMonth() &&
                         local.getDate() === localFim.getDate();

        if (mesmoDia) {
          const minutosFimReal = Math.min(localFim.getHours() * 60 + localFim.getMinutes(), fimUtil);
          if (minutosFimReal > inicioUtil) {
            totalMinutos += minutosFimReal - inicioUtil;
          }
          break;
        } else {
          totalMinutos += fimUtil - inicioUtil;
        }
      }
    }

    // Avançar para o próximo dia no início do horário comercial
    const nextLocal = toTimezone(cursor, config.timezone);
    nextLocal.setDate(nextLocal.getDate() + 1);
    nextLocal.setHours(hInicio, mInicio, 0, 0);

    const utcStr = nextLocal.toLocaleString('en-US', { timeZone: config.timezone });
    const localDate = new Date(utcStr);
    const diff = localDate.getTime() - nextLocal.getTime();
    cursor = new Date(nextLocal.getTime() - diff);
  }

  return totalMinutos;
}

/**
 * Calcula o tempo restante de SLA em minutos para um chamado.
 * Retorna minutos (positivo = dentro do SLA, negativo = estourado).
 * Retorna null para chamados concluídos/cancelados.
 */
async function calcularTempoRestanteSla(chamado) {
  if (!chamado.sla_vence_em) return null;
  if (['concluido', 'cancelado'].includes(chamado.status)) return null;

  const agora = new Date();
  const venceEm = new Date(chamado.sla_vence_em);

  // Se o SLA está pausado, calcular os minutos úteis restantes a partir do momento da pausa
  if (chamado.sla_pausado_em) {
    // SLA está pausado — calcular tempo restante como se o relógio parou no momento da pausa
    const pausadoEm = new Date(chamado.sla_pausado_em);
    const minutosUteisPausaAteVencimento = await calcularMinutosUteis(pausadoEm, venceEm);
    return minutosUteisPausaAteVencimento;
  }

  // SLA ativo — calcular minutos úteis de AGORA até o vencimento
  if (agora >= venceEm) {
    // Já passou do deadline — calcular quanto estourou
    const minutosEstourados = await calcularMinutosUteis(venceEm, agora);
    return -minutosEstourados;
  }

  const minutosRestantes = await calcularMinutosUteis(agora, venceEm);
  return minutosRestantes;
}

/**
 * Recalcula sla_vence_em ao retomar de uma pausa (aguardando_peca → em_atendimento).
 * Estende o deadline pelo tempo útil que ficou pausado.
 */
async function recalcularSlaAposResumo(chamado) {
  if (!chamado.sla_pausado_em || !chamado.sla_vence_em) return chamado.sla_vence_em;

  const pausadoEm = new Date(chamado.sla_pausado_em);
  const agora = new Date();

  // Calcular quantos minutos úteis se passaram durante a pausa
  const minutosUteisPausa = await calcularMinutosUteis(pausadoEm, agora);

  // Estender o deadline por esses minutos úteis
  // Para isso, avançamos o deadline em minutos úteis
  const config = await getConfig();
  const [hInicio, mInicio] = config.inicio.split(':').map(Number);
  const [hFim, mFim] = config.fim.split(':').map(Number);
  const minutosInicioConfig = hInicio * 60 + mInicio;
  const minutosFimConfig = hFim * 60 + mFim;

  let minutosParaAdicionar = minutosUteisPausa;
  let cursor = new Date(chamado.sla_vence_em);

  for (let i = 0; i < 365 && minutosParaAdicionar > 0; i++) {
    const local = toTimezone(cursor, config.timezone);

    if (ehDiaUtil(local, config)) {
      const minutosAtual = local.getHours() * 60 + local.getMinutes();
      const inicioUtil = Math.max(minutosAtual, minutosInicioConfig);
      const fimUtil = minutosFimConfig;

      if (inicioUtil < fimUtil) {
        const disponivel = fimUtil - inicioUtil;

        if (minutosParaAdicionar <= disponivel) {
          const minutosFinais = inicioUtil + minutosParaAdicionar;
          const horaFinal = Math.floor(minutosFinais / 60);
          const minFinal = minutosFinais % 60;

          const resultado = new Date(local);
          resultado.setHours(horaFinal, minFinal, 0, 0);

          const utcStr = resultado.toLocaleString('en-US', { timeZone: config.timezone });
          const localDate = new Date(utcStr);
          const diff = localDate.getTime() - resultado.getTime();
          return new Date(resultado.getTime() - diff);
        }

        minutosParaAdicionar -= disponivel;
      }
    }

    const nextLocal = toTimezone(cursor, config.timezone);
    nextLocal.setDate(nextLocal.getDate() + 1);
    nextLocal.setHours(hInicio, mInicio, 0, 0);

    const utcStr = nextLocal.toLocaleString('en-US', { timeZone: config.timezone });
    const localDate = new Date(utcStr);
    const diff = localDate.getTime() - nextLocal.getTime();
    cursor = new Date(nextLocal.getTime() - diff);
  }

  return new Date(chamado.sla_vence_em);
}

/**
 * Enriquece um chamado (ou array de chamados) com sla_tempo_restante_minutos.
 */
async function enriquecerSla(chamadosOuChamado) {
  if (!chamadosOuChamado) return chamadosOuChamado;

  const isArray = Array.isArray(chamadosOuChamado);
  const chamados = isArray ? chamadosOuChamado : [chamadosOuChamado];

  for (const chamado of chamados) {
    chamado.sla_tempo_restante_minutos = await calcularTempoRestanteSla(chamado);
  }

  return isArray ? chamados : chamados[0];
}

module.exports = {
  isHorarioComercial,
  calcularSlaVenceEm,
  calcularMinutosUteis,
  calcularTempoRestanteSla,
  recalcularSlaAposResumo,
  enriquecerSla
};
