#!/usr/bin/env node
'use strict';

// ===================================
// GERADOR DOS ARQUIVOS .min
// ===================================
// Uso: node scripts/build-assets.js [--verificar]
//
// O site não tem bundler. Antes, cada .min era editado à mão junto da fonte,
// o que abre espaço para os dois divergirem sem ninguém perceber. Este script
// gera os .min a partir das fontes declaradas em ALVOS.
//
// --verificar  não escreve nada; apenas informa quais .min estão desatualizados
//              (útil antes de publicar).
//
// A minificação é conservadora de propósito: remove comentários e espaço
// redundante, mas não renomeia identificadores nem reordena nada. O ganho real
// vem do gzip do servidor; o objetivo aqui é só não publicar comentário de
// desenvolvimento. Todo resultado é validado antes de ser gravado.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..');

// Fontes gerenciadas por este script.
//
// Antes, style.css ficava de fora daqui e seu .min era minificado à mão. Ou
// seja: editar css/style.css não tinha efeito nenhum no site. Era uma
// armadilha silenciosa — o arquivo parecia a fonte da verdade e não era.
// Medido: deixar o minificador cuidar dele custava 82 bytes (0,4%), cerca de
// 20 depois do gzip. O preço de uma fonte de CSS que mente é bem maior.
//
// Hoje existe um arquivo só, css/site.css, gerado como todos os outros.
const ALVOS = [
    'css/site.css',
    'js/gtag-init.js',
    'js/analytics.js',
    'js/script.js'
];

// ===================================
// MINIFICAÇÃO DE CSS
// ===================================

function minificarCss(origem) {
    let saida = '';
    let i = 0;

    while (i < origem.length) {
        const c = origem[i];

        // Comentário de bloco: única forma de comentário em CSS.
        if (c === '/' && origem[i + 1] === '*') {
            const fim = origem.indexOf('*/', i + 2);
            i = fim === -1 ? origem.length : fim + 2;
            continue;
        }

        // Strings e url() são copiadas literalmente.
        if (c === '"' || c === "'") {
            let j = i + 1;
            while (j < origem.length && origem[j] !== c) {
                if (origem[j] === '\\') j += 1;
                j += 1;
            }
            saida += origem.slice(i, j + 1);
            i = j + 1;
            continue;
        }

        if (/\s/.test(c)) {
            // Colapsa qualquer sequência de espaço em um único espaço.
            while (i < origem.length && /\s/.test(origem[i])) i += 1;
            saida += ' ';
            continue;
        }

        saida += c;
        i += 1;
    }

    return saida
        // Espaço ao redor de pontuação estrutural é sempre descartável.
        .replace(/\s*([{}:;,>])\s*/g, '$1')
        // Reinsere o espaço obrigatório do combinador descendente em seletores
        // e o de valores compostos foi preservado pelo colapso acima.
        .replace(/;}/g, '}')
        .trim();
}

// ===================================
// MINIFICAÇÃO DE JS
// ===================================
// Remove comentários e indentação preservando strings, templates e regex.
// Não colapsa quebras de linha entre statements, para não depender de ASI.

const ANTES_DE_REGEX = /[=(,:;!&|?{}[\]+\-*%~^<>]$/;
const PALAVRAS_ANTES_DE_REGEX = /\b(return|typeof|instanceof|in|of|new|delete|void|case|do|else|yield|await)$/;

function iniciaRegex(anterior) {
    const limpo = anterior.replace(/\s+$/, '');
    if (limpo === '') return true;
    if (ANTES_DE_REGEX.test(limpo)) return true;
    return PALAVRAS_ANTES_DE_REGEX.test(limpo);
}

function minificarJs(origem) {
    let saida = '';
    let i = 0;

    while (i < origem.length) {
        const c = origem[i];
        const proximo = origem[i + 1];

        if (c === '/' && proximo === '/') {
            while (i < origem.length && origem[i] !== '\n') i += 1;
            continue;
        }

        if (c === '/' && proximo === '*') {
            const fim = origem.indexOf('*/', i + 2);
            i = fim === -1 ? origem.length : fim + 2;
            continue;
        }

        if (c === '"' || c === "'" || c === '`') {
            let j = i + 1;
            while (j < origem.length && origem[j] !== c) {
                if (origem[j] === '\\') j += 1;
                j += 1;
            }
            saida += origem.slice(i, j + 1);
            i = j + 1;
            continue;
        }

        if (c === '/' && iniciaRegex(saida)) {
            let j = i + 1;
            let emClasse = false;
            while (j < origem.length) {
                const d = origem[j];
                if (d === '\\') { j += 2; continue; }
                if (d === '[') emClasse = true;
                else if (d === ']') emClasse = false;
                else if (d === '/' && !emClasse) break;
                else if (d === '\n') break;
                j += 1;
            }
            // Inclui as flags (g, i, m...) que seguem a barra final.
            let fim = j + 1;
            while (fim < origem.length && /[a-z]/.test(origem[fim])) fim += 1;
            saida += origem.slice(i, fim);
            i = fim;
            continue;
        }

        saida += c;
        i += 1;
    }

    return saida
        .split('\n')
        .map(function (linha) { return linha.trim(); })
        .filter(function (linha) { return linha !== ''; })
        .join('\n');
}

// ===================================
// VALIDAÇÃO
// ===================================

function validarJs(codigo, rotulo) {
    try {
        new vm.Script(codigo, { filename: rotulo });
    } catch (erro) {
        throw new Error('JS minificado inválido em ' + rotulo + ': ' + erro.message);
    }
}

function validarCss(codigo, rotulo) {
    const abre = (codigo.match(/{/g) || []).length;
    const fecha = (codigo.match(/}/g) || []).length;
    if (abre !== fecha) {
        throw new Error('CSS minificado inválido em ' + rotulo + ': ' + abre + ' "{" para ' + fecha + ' "}"');
    }
}

// ===================================
// EXECUÇÃO
// ===================================

const apenasVerificar = process.argv.includes('--verificar');
let desatualizados = 0;
let erros = 0;

ALVOS.forEach(function (relativo) {
    const caminhoFonte = path.join(RAIZ, relativo);

    if (!fs.existsSync(caminhoFonte)) {
        console.log('  ignorado  ' + relativo + ' (fonte não encontrada)');
        return;
    }

    const extensao = path.extname(relativo);
    const destinoRelativo = relativo.replace(new RegExp('\\' + extensao + '$'), '.min' + extensao);
    const caminhoDestino = path.join(RAIZ, destinoRelativo);

    const fonte = fs.readFileSync(caminhoFonte, 'utf8');
    let minificado;

    try {
        if (extensao === '.css') {
            minificado = minificarCss(fonte);
            validarCss(minificado, destinoRelativo);
        } else {
            minificado = minificarJs(fonte);
            validarJs(minificado, destinoRelativo);
        }
    } catch (erro) {
        console.error('  ERRO      ' + relativo + ' — ' + erro.message);
        erros += 1;
        return;
    }

    const atual = fs.existsSync(caminhoDestino) ? fs.readFileSync(caminhoDestino, 'utf8') : null;

    // Normaliza o fim de linha na comparação: com core.autocrlf=true o git
    // devolve CRLF no checkout e os scripts escrevem LF. Sem isso, todo
    // arquivo recém-baixado pareceria desatualizado.
    const iguais = atual !== null &&
        atual.replace(/\r\n/g, '\n') === minificado.replace(/\r\n/g, '\n');

    if (iguais) {
        console.log('  ok        ' + destinoRelativo);
        return;
    }

    desatualizados += 1;

    if (apenasVerificar) {
        console.log('  DESATUAL. ' + destinoRelativo);
        return;
    }

    fs.writeFileSync(caminhoDestino, minificado, 'utf8');
    const reducao = Math.round((1 - minificado.length / fonte.length) * 100);
    console.log('  gerado    ' + destinoRelativo + '  (' + fonte.length + ' → ' + minificado.length + ' bytes, -' + reducao + '%)');
});

if (erros > 0) {
    console.error('\n' + erros + ' arquivo(s) com erro. Nada foi gravado para eles.');
    process.exit(1);
}

if (apenasVerificar && desatualizados > 0) {
    console.error('\n' + desatualizados + ' arquivo(s) .min desatualizado(s). Rode: node scripts/build-assets.js');
    process.exit(1);
}

console.log('\nConcluído.');
