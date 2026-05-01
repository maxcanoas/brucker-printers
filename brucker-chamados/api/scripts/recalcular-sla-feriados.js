// Script unico — recalcula sla_vence_em dos chamados em aberto considerando
// feriados nacionais. Idempotente: rodar de novo nao muda nada se ja correto.
//
// Uso: node scripts/recalcular-sla-feriados.js
//
// Carrega .env automaticamente (mesmo padrao do server.js).

require('dotenv').config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
console.log('[recalc] SUPABASE_URL:', url ? url.replace(/(https:\/\/)([^.]+)/, '$1***') : '(VAZIO)');
console.log('[recalc] SUPABASE_KEY:', key ? `(definida, ${key.length} chars)` : '(VAZIO)');
if (!url || !key) {
  console.error('[recalc] FATAL: faltam SUPABASE_URL e/ou SUPABASE_SERVICE_KEY no .env');
  process.exit(1);
}

const supabase = require('../services/supabase');
const { calcularSlaVenceEm } = require('../services/businessHours');

async function main() {
  const { data: chamados, error } = await supabase
    .from('chamados')
    .select('id, numero, criado_em, sla_horas, sla_vence_em, sla_pausado_em, status')
    .not('sla_vence_em', 'is', null)
    .not('status', 'in', '(concluido,cancelado)');

  if (error) {
    console.error('[recalc] Falha ao buscar chamados:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log(`[recalc] ${chamados.length} chamado(s) em aberto`);

  let alterados = 0;
  for (const c of chamados) {
    const novoVenceEm = await calcularSlaVenceEm(c.criado_em, c.sla_horas);
    const antigo = new Date(c.sla_vence_em);
    const deltaMinutos = Math.round((novoVenceEm.getTime() - antigo.getTime()) / 60000);

    if (deltaMinutos === 0) {
      console.log(`[recalc] #${c.numero} OK (sem mudanca)`);
      continue;
    }

    const { error: errUpdate } = await supabase
      .from('chamados')
      .update({ sla_vence_em: novoVenceEm.toISOString() })
      .eq('id', c.id);

    if (errUpdate) {
      console.error(`[recalc] #${c.numero} FALHA ao atualizar:`, errUpdate.message);
      continue;
    }

    const fmt = (d) => d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    console.log(
      `[recalc] #${c.numero} antigo=${fmt(antigo)} novo=${fmt(novoVenceEm)} (delta: ${deltaMinutos} min)`
    );
    if (c.sla_pausado_em) {
      console.log(`[recalc] #${c.numero}   ATENCAO: chamado estava pausado, extensao de pausa anterior foi descartada`);
    }
    alterados++;
  }

  console.log(`[recalc] Concluido. ${alterados} chamado(s) atualizado(s).`);
}

main().catch((e) => {
  console.error('[recalc] Erro fatal:', e);
  process.exit(1);
});
