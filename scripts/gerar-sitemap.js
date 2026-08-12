#!/usr/bin/env node
'use strict';

// ===================================
// GERADOR DE SITEMAP
// ===================================
// Uso: node scripts/gerar-sitemap.js [--verificar]
//
// Varre os HTML do site e reescreve sitemap.xml.
//
// O sitemap anterior tinha três URLs e lastmod de março, mantido à mão. Com
// dezenove páginas geradas por script, manter à mão significa esquecer —
// e um sitemap desatualizado é pior que nenhum: ele diz ao Google que a
// página não mudou quando mudou.
//
// lastmod sai da data do último commit que tocou o arquivo, não do mtime do
// sistema: regenerar as páginas atualiza o mtime de todas ao mesmo tempo,
// o que faria o site inteiro parecer alterado a cada build. Sem git
// disponível, cai para o mtime.
//
// Páginas com <meta name="robots" content="noindex"> ficam de fora: pedir
// indexação no sitemap e negar na página é sinal contraditório.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const SITE = 'https://bruckerprinters.com.br';
const IGNORAR = new Set(['brucker-chamados', 'node_modules', 'tool-assets', '.git', 'scripts', '.lighthouse']);

// Prioridade e frequência por tipo de página. São dicas fracas para o
// rastreador — o Google as ignora em boa parte —, mas ficam coerentes.
function classificar(url) {
    if (url === '/') return { prioridade: '1.0', frequencia: 'weekly' };
    if (url === '/impressoras.html') return { prioridade: '0.9', frequencia: 'monthly' };
    if (url.startsWith('/impressoras/')) return { prioridade: '0.8', frequencia: 'monthly' };
    if (url === '/blog/') return { prioridade: '0.7', frequencia: 'weekly' };
    if (url.startsWith('/blog/')) return { prioridade: '0.6', frequencia: 'yearly' };
    if (url.indexOf('politica') !== -1) return { prioridade: '0.3', frequencia: 'yearly' };
    return { prioridade: '0.8', frequencia: 'monthly' };
}

function listarHtml(dir, acc) {
    acc = acc || [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
        if (e.name.startsWith('.')) return;
        const completo = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (!IGNORAR.has(e.name)) listarHtml(completo, acc);
        } else if (e.name.endsWith('.html')) {
            acc.push(completo);
        }
    });
    return acc;
}

function rodarGit(argumentos) {
    try {
        return execFileSync('git', argumentos, {
            cwd: RAIZ,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
        }).trim();
    } catch (e) {
        return null;
    }
}

const HOJE = new Date().toISOString().slice(0, 10);

function dataDoGit(arquivo) {
    // Arquivo com alteração ainda não commitada: a data do último commit
    // estaria desatualizada no momento em que o site for publicado, e
    // lastmod antigo faz o Google adiar a revisita de uma página que mudou.
    const pendente = rodarGit(['status', '--porcelain', '--', arquivo]);
    if (pendente) return HOJE;

    const saida = rodarGit(['log', '-1', '--format=%cs', '--', arquivo]);
    return saida && /^\d{4}-\d{2}-\d{2}$/.test(saida) ? saida : null;
}

function dataDoArquivo(arquivo) {
    return fs.statSync(arquivo).mtime.toISOString().slice(0, 10);
}

// URL pública do arquivo. index.html vira o diretório: servir a mesma página
// em /blog/ e /blog/index.html duplicaria a URL no sitemap.
function urlPublica(arquivo) {
    const rel = path.relative(RAIZ, arquivo).split(path.sep).join('/');
    if (rel === 'index.html') return '/';
    if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
    return '/' + rel;
}

const entradas = [];
let ignoradasPorNoindex = 0;
let semGit = 0;

listarHtml(RAIZ).forEach(function (arquivo) {
    const html = fs.readFileSync(arquivo, 'utf8');

    const robots = (html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) || [])[1] || '';
    if (robots.toLowerCase().indexOf('noindex') !== -1) {
        ignoradasPorNoindex += 1;
        return;
    }

    const url = urlPublica(arquivo);
    const classe = classificar(url);

    let data = dataDoGit(arquivo);
    if (!data) {
        data = dataDoArquivo(arquivo);
        semGit += 1;
    }

    // O canonical é a URL oficial da página; se ele existir, é ele que vai
    // para o sitemap — divergir dos dois confunde o rastreador.
    const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) || [])[1];

    entradas.push({
        loc: canonical || SITE + url,
        lastmod: data,
        changefreq: classe.frequencia,
        priority: classe.prioridade
    });
});

entradas.sort(function (a, b) {
    if (a.priority !== b.priority) return b.priority.localeCompare(a.priority);
    return a.loc.localeCompare(b.loc);
});

const corpo = entradas.map(function (e) {
    return '  <url>\n' +
        '    <loc>' + e.loc + '</loc>\n' +
        '    <lastmod>' + e.lastmod + '</lastmod>\n' +
        '    <changefreq>' + e.changefreq + '</changefreq>\n' +
        '    <priority>' + e.priority + '</priority>\n' +
        '  </url>';
}).join('\n');

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!-- Gerado por scripts/gerar-sitemap.js - nao edite a mao. -->\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    corpo + '\n' +
    '</urlset>\n';

const destino = path.join(RAIZ, 'sitemap.xml');
const atual = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : null;

if (process.argv.includes('--verificar')) {
    if (atual === xml) {
        console.log('sitemap.xml em dia (' + entradas.length + ' URLs).');
    } else {
        console.error('sitemap.xml desatualizado. Rode: node scripts/gerar-sitemap.js');
        process.exit(1);
    }
} else {
    fs.writeFileSync(destino, xml, 'utf8');
    console.log('sitemap.xml gerado com ' + entradas.length + ' URLs.');
    if (ignoradasPorNoindex > 0) {
        console.log('  ' + ignoradasPorNoindex + ' página(s) fora do sitemap por estarem como noindex.');
    }
    if (semGit > 0) {
        console.log('  ' + semGit + ' página(s) sem histórico no git; lastmod veio do mtime do arquivo.');
    }
}
