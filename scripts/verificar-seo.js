#!/usr/bin/env node
'use strict';

// ===================================
// VERIFICADOR DE SEO
// ===================================
// Uso: node scripts/verificar-seo.js
//
// Checa mecanicamente o que os critérios de aceite exigem e que é fácil
// quebrar sem perceber ao criar dezenas de páginas:
//
//   1. title, meta description, canonical e h1 únicos em cada página
//   5. nenhum link http:// interno
//   7. nenhuma página alcançável só por URL direta (sem link de entrada)
//
//   + links internos apontando para arquivo inexistente
//   + âncoras (#secao) apontando para id que não existe
//
// Sai com código 1 se houver erro, para poder ser usado antes de publicar.
//
// Exceções conhecidas ficam em EXCECOES_HTTP: são decisões do cliente, não
// esquecimentos, e não devem poluir o relatório a cada execução.

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');

// Diretórios que não fazem parte do site estático.
const IGNORAR = new Set(['brucker-chamados', 'node_modules', 'tool-assets', '.git', 'scripts', '.lighthouse']);

// A Área do Cliente aponta para localhost por decisão do cliente
// (registrada em SEO-PENDENCIAS.md). Não é um esquecimento.
const EXCECOES_HTTP = ['http://localhost:5173/cliente'];

// Páginas que não precisam de link de entrada: o 404 é servido pelo Apache.
const SEM_LINK_DE_ENTRADA = new Set(['404.html']);

const erros = [];
const avisos = [];

// ===================================
// COLETA DE ARQUIVOS
// ===================================

function listarHtml(diretorio, acumulado) {
    acumulado = acumulado || [];
    fs.readdirSync(diretorio, { withFileTypes: true }).forEach(function (entrada) {
        if (entrada.name.startsWith('.') && entrada.name !== '.htaccess') return;
        const completo = path.join(diretorio, entrada.name);
        if (entrada.isDirectory()) {
            if (IGNORAR.has(entrada.name)) return;
            listarHtml(completo, acumulado);
        } else if (entrada.name.endsWith('.html')) {
            acumulado.push(completo);
        }
    });
    return acumulado;
}

// ===================================
// EXTRAÇÃO
// ===================================

function extrair(html) {
    const pegar = function (regex) {
        const m = html.match(regex);
        return m ? m[1].trim() : null;
    };

    const todos = function (regex) {
        const lista = [];
        let m;
        const r = new RegExp(regex.source, regex.flags.indexOf('g') === -1 ? regex.flags + 'g' : regex.flags);
        while ((m = r.exec(html)) !== null) lista.push(m[1].trim());
        return lista;
    };

    return {
        titulos: todos(/<title>([\s\S]*?)<\/title>/i),
        descricoes: todos(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i),
        canonicals: todos(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i),
        h1s: todos(/<h1[^>]*>([\s\S]*?)<\/h1>/i),
        robots: pegar(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i),
        hrefs: todos(/<a[^>]+href=["']([^"']*)["']/i),
        ids: todos(/\sid=["']([^"']+)["']/i)
    };
}

function urlDoArquivo(arquivo) {
    return '/' + path.relative(RAIZ, arquivo).split(path.sep).join('/');
}

// ===================================
// EXECUÇÃO
// ===================================

const arquivos = listarHtml(RAIZ);
const paginas = new Map();

arquivos.forEach(function (arquivo) {
    const html = fs.readFileSync(arquivo, 'utf8');
    const dados = extrair(html);
    dados.url = urlDoArquivo(arquivo);
    dados.arquivo = arquivo;
    dados.html = html;
    paginas.set(dados.url, dados);
});

console.log('Analisando ' + paginas.size + ' página(s) HTML.\n');

// --- Unicidade e presença dos elementos de cabeçalho ---

const vistos = { titulo: new Map(), descricao: new Map(), canonical: new Map(), h1: new Map() };

paginas.forEach(function (p) {
    const indexado = !p.robots || p.robots.indexOf('noindex') === -1;

    if (p.titulos.length === 0) erros.push(p.url + ' — sem <title>');
    if (p.titulos.length > 1) erros.push(p.url + ' — ' + p.titulos.length + ' <title> na mesma página');
    if (p.descricoes.length === 0) erros.push(p.url + ' — sem meta description');
    if (p.descricoes.length > 1) erros.push(p.url + ' — ' + p.descricoes.length + ' meta description');
    if (p.h1s.length === 0) erros.push(p.url + ' — sem <h1>');
    if (p.h1s.length > 1) erros.push(p.url + ' — ' + p.h1s.length + ' <h1> (deve haver exatamente 1)');

    // Canonical não se aplica a página noindex.
    if (indexado) {
        if (p.canonicals.length === 0) erros.push(p.url + ' — sem <link rel="canonical">');
        if (p.canonicals.length > 1) erros.push(p.url + ' — ' + p.canonicals.length + ' canonical');
    }

    const registrar = function (mapa, valor, rotulo) {
        if (!valor) return;
        const chave = valor.toLowerCase().replace(/\s+/g, ' ');
        if (mapa.has(chave)) {
            erros.push(rotulo + ' repetido entre ' + mapa.get(chave) + ' e ' + p.url + ': "' + valor.slice(0, 70) + '"');
        } else {
            mapa.set(chave, p.url);
        }
    };

    if (indexado) {
        registrar(vistos.titulo, p.titulos[0], 'title');
        registrar(vistos.descricao, p.descricoes[0], 'meta description');
        registrar(vistos.canonical, p.canonicals[0], 'canonical');
        registrar(vistos.h1, p.h1s[0] && p.h1s[0].replace(/<[^>]+>/g, ''), 'h1');
    }

    // Tamanho da description: fora de 120–165 o Google costuma reescrever.
    const descricao = p.descricoes[0];
    if (descricao && (descricao.length < 120 || descricao.length > 165)) {
        avisos.push(p.url + ' — meta description com ' + descricao.length + ' caracteres (ideal 140–155)');
    }
});

// --- Links: http inseguro, destino inexistente, âncora inexistente ---

const recebemLink = new Set();

paginas.forEach(function (p) {
    p.hrefs.forEach(function (href) {
        if (!href) return;

        if (href.indexOf('http://') === 0) {
            if (EXCECOES_HTTP.indexOf(href) === -1) {
                erros.push(p.url + ' — link http:// inseguro: ' + href);
            }
            return;
        }

        // Externos e protocolos especiais não são resolvidos aqui.
        if (/^(https:|mailto:|tel:|javascript:|data:)/i.test(href)) return;

        const partes = href.split('#');
        const caminho = partes[0];
        const ancora = partes[1];

        let alvo;
        if (caminho === '') {
            alvo = p; // âncora na própria página
        } else {
            const base = caminho.startsWith('/')
                ? path.join(RAIZ, caminho)
                : path.resolve(path.dirname(p.arquivo), caminho);

            // "/" e "/pasta/" resolvem para o index daquele nível.
            let arquivoAlvo = base;
            if (caminho.endsWith('/')) arquivoAlvo = path.join(base, 'index.html');

            if (!fs.existsSync(arquivoAlvo)) {
                // O .htaccess reescreve /pagina para /pagina.html.
                if (fs.existsSync(arquivoAlvo + '.html')) {
                    arquivoAlvo = arquivoAlvo + '.html';
                } else {
                    erros.push(p.url + ' — link para arquivo inexistente: ' + href);
                    return;
                }
            }

            const urlAlvo = urlDoArquivo(arquivoAlvo);
            alvo = paginas.get(urlAlvo);
            if (alvo && alvo.url !== p.url) recebemLink.add(alvo.url);
        }

        if (ancora && alvo && alvo.ids.indexOf(ancora) === -1) {
            erros.push(p.url + ' — âncora #' + ancora + ' não existe em ' + (alvo.url || 'na própria página'));
        }
    });
});

// --- Páginas órfãs ---

paginas.forEach(function (p) {
    const nome = path.basename(p.arquivo);
    if (SEM_LINK_DE_ENTRADA.has(nome)) return;
    if (p.url === '/index.html') return; // é a home
    if (!recebemLink.has(p.url)) {
        erros.push(p.url + ' — nenhuma outra página linka para cá (alcançável só por URL direta)');
    }
});

// --- Distância até a home ---
//
// Receber um link não basta. Um grupo de páginas que só linka entre si fica
// isolado: o visitante nunca chega lá partindo da home, e o rastreador do
// Google distribui pouca autoridade para páginas profundas. A meta é no
// máximo 2 cliques a partir de /index.html.

const CLIQUES_MAXIMOS = 2;

function destinosDe(p) {
    const saidas = new Set();
    p.hrefs.forEach(function (href) {
        if (!href || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(href)) return;
        const caminho = href.split('#')[0];
        if (caminho === '') return;

        const base = caminho.startsWith('/')
            ? path.join(RAIZ, caminho)
            : path.resolve(path.dirname(p.arquivo), caminho);

        let alvo = caminho.endsWith('/') ? path.join(base, 'index.html') : base;
        if (!fs.existsSync(alvo) && fs.existsSync(alvo + '.html')) alvo = alvo + '.html';
        if (!fs.existsSync(alvo)) return;

        const url = urlDoArquivo(alvo);
        if (paginas.has(url)) saidas.add(url);
    });
    return saidas;
}

const distancia = new Map([['/index.html', 0]]);
let fronteira = ['/index.html'];

while (fronteira.length > 0) {
    const proxima = [];
    fronteira.forEach(function (url) {
        const p = paginas.get(url);
        if (!p) return;
        destinosDe(p).forEach(function (destino) {
            if (distancia.has(destino)) return;
            distancia.set(destino, distancia.get(url) + 1);
            proxima.push(destino);
        });
    });
    fronteira = proxima;
}

paginas.forEach(function (p) {
    if (SEM_LINK_DE_ENTRADA.has(path.basename(p.arquivo))) return;
    const d = distancia.get(p.url);
    if (d === undefined) {
        erros.push(p.url + ' — não é alcançável a partir da home por nenhum caminho de links');
    } else if (d > CLIQUES_MAXIMOS) {
        erros.push(p.url + ' — a ' + d + ' cliques da home (máximo ' + CLIQUES_MAXIMOS + ')');
    }
});

// --- Tags estruturais desbalanceadas ---
//
// Um <noscript> aberto e não fechado faz o navegador tratar todo o resto da
// página como conteúdo alternativo: nada renderiza, e nenhuma outra checagem
// deste script percebe — title, canonical e links continuam presentes no
// código-fonte. Foi exatamente o que aconteceu depois de uma limpeza
// automática de <head> que removeu os fechamentos e manteve as aberturas.
//
// A contagem é textual e simples de propósito: cobre o erro que de fato
// acontece (par sem fechamento) sem tentar ser um parser de HTML.

const TAGS_CRITICAS = ['noscript', 'style', 'script', 'main', 'header', 'footer', 'form', 'table', 'select'];

paginas.forEach(function (p) {
    // Comentários saem da contagem: eles descrevem markup sem ser markup.
    // Um comentário explicando "por que este script não usa src" contém a
    // sequência de abertura sem abrir tag alguma.
    const semComentarios = p.html.replace(/<!--[\s\S]*?-->/g, '');

    TAGS_CRITICAS.forEach(function (tag) {
        const abre = (semComentarios.match(new RegExp('<' + tag + '(\\s[^>]*)?>', 'gi')) || []).length;
        const fecha = (semComentarios.match(new RegExp('</' + tag + '\\s*>', 'gi')) || []).length;
        if (abre !== fecha) {
            erros.push(p.url + ' — <' + tag + '> desbalanceado: ' + abre +
                ' abertura(s) para ' + fecha + ' fechamento(s)');
        }
    });
});

// --- Parágrafos repetidos entre páginas ---
//
// Conteúdo igual em duas URLs faz o Google escolher uma e ignorar a outra.
// O risco é maior justamente nas páginas de serviço, que falam de assuntos
// vizinhos e tendem a repetir os mesmos argumentos.
//
// Header e rodapé são idênticos de propósito e ficam de fora: só entram
// parágrafos de dentro de <main>, com tamanho suficiente para serem
// conteúdo de verdade e não uma frase de ligação.

const TAMANHO_MINIMO_PARAGRAFO = 120;
const paragrafosVistos = new Map();

paginas.forEach(function (p) {
    const miolo = (p.html.match(/<main[\s\S]*?<\/main>/i) || [''])[0];
    const encontrados = miolo.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];

    encontrados.forEach(function (bruto) {
        const texto = bruto
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (texto.length < TAMANHO_MINIMO_PARAGRAFO) return;

        const chave = texto.toLowerCase();
        if (paragrafosVistos.has(chave)) {
            const origem = paragrafosVistos.get(chave);
            if (origem !== p.url) {
                erros.push('parágrafo repetido entre ' + origem + ' e ' + p.url +
                    ': "' + texto.slice(0, 60) + '..."');
            }
        } else {
            paragrafosVistos.set(chave, p.url);
        }
    });
});

// ===================================
// RELATÓRIO
// ===================================

if (avisos.length > 0) {
    console.log('AVISOS (' + avisos.length + '):');
    avisos.forEach(function (a) { console.log('  · ' + a); });
    console.log('');
}

if (erros.length > 0) {
    console.log('ERROS (' + erros.length + '):');
    erros.forEach(function (e) { console.log('  ✗ ' + e); });
    console.log('');
    process.exit(1);
}

console.log('Nenhum erro. ' + paginas.size + ' página(s) conferida(s).');
