// Feriados nacionais brasileiros para calculo de SLA.
// Lista chumbada (sem cadastro pelo admin) com fixos + moveis baseados na Pascoa.

const cachePorAno = new Map();

// Algoritmo de Pascoa (Meeus/Jones/Butcher) - retorna Date no ano informado.
function calcularPascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function formatarChave(ano, mes1a12, dia) {
  return `${ano}-${String(mes1a12).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function chaveDeData(date) {
  return formatarChave(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function adicionarDias(date, dias) {
  const d = new Date(date);
  d.setDate(d.getDate() + dias);
  return d;
}

function feriadosNacionais(ano) {
  const cached = cachePorAno.get(ano);
  if (cached) return cached;

  const set = new Set();

  // Fixos
  set.add(formatarChave(ano, 1, 1));   // Confraternizacao Universal
  set.add(formatarChave(ano, 4, 21));  // Tiradentes
  set.add(formatarChave(ano, 5, 1));   // Dia do Trabalho
  set.add(formatarChave(ano, 9, 7));   // Independencia
  set.add(formatarChave(ano, 10, 12)); // N. Sra. Aparecida
  set.add(formatarChave(ano, 11, 2));  // Finados
  set.add(formatarChave(ano, 11, 15)); // Proclamacao da Republica
  set.add(formatarChave(ano, 11, 20)); // Consciencia Negra
  set.add(formatarChave(ano, 12, 25)); // Natal

  // Moveis (baseados na Pascoa)
  const pascoa = calcularPascoa(ano);
  set.add(chaveDeData(adicionarDias(pascoa, -48))); // Carnaval (segunda)
  set.add(chaveDeData(adicionarDias(pascoa, -47))); // Carnaval (terca)
  set.add(chaveDeData(adicionarDias(pascoa, -2)));  // Sexta-feira Santa
  set.add(chaveDeData(adicionarDias(pascoa, 60)));  // Corpus Christi

  cachePorAno.set(ano, set);
  return set;
}

// Recebe uma Date ja convertida pro timezone alvo (componentes locais validos)
// e verifica se o dia e feriado nacional.
function ehFeriado(localDate) {
  const ano = localDate.getFullYear();
  return feriadosNacionais(ano).has(chaveDeData(localDate));
}

module.exports = {
  feriadosNacionais,
  ehFeriado,
  calcularPascoa,
};
