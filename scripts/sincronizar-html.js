#!/usr/bin/env node
'use strict';

// ===================================
// SINCRONIZADOR DE MENU E RODAPÉ
// ===================================
// Uso: node scripts/sincronizar-html.js [--verificar]
//
// index.html, politica-privacidade-chamados.html e 404.html são escritos à
// mão: têm conteúdo próprio que não faz sentido gerar. Mas o menu e o rodapé
// deles precisam ser idênticos aos das doze páginas geradas.
//
// Este script substitui apenas dois blocos em cada arquivo — <nav class="nav">
// e <footer class="footer"> — pelo que scripts/template.js produz. Todo o
// resto do arquivo fica intacto.
//
// Sem isto, adicionar uma página nova exigiria lembrar de editar o menu em
// três arquivos à mão, e a primeira vez que alguém esquecesse ninguém notaria.
//
// --verificar  não escreve; só informa quais arquivos estão fora de sincronia.

const fs = require('fs');
const path = require('path');
const T = require('./template');

const RAIZ = path.resolve(__dirname, '..');

// Compara conteúdo ignorando a convenção de fim de linha (CR LF x LF).
function mesmoConteudo(a, b) {
    return String(a).replace(/\r\n/g, '\n') === String(b).replace(/\r\n/g, '\n');
}

// Delimitam o bloco de CSS embutido nos arquivos escritos à mão.
const MARCADOR_CSS_INICIO = '<!-- BP:CSS -->';
const MARCADOR_CSS_FIM = '<!-- /BP:CSS -->';

// O mesmo para o snippet do GA4, e pela mesma razão.
const MARCADOR_GTAG_INICIO = '<!-- BP:GTAG -->';
const MARCADOR_GTAG_FIM = '<!-- /BP:GTAG -->';

// Troca o conteúdo entre dois marcadores de comentário, preservando-os.
// Devolve null quando algum dos dois falta, para o chamador acusar o erro em
// vez de gravar um arquivo pela metade.
function substituirEntreMarcadores(html, inicioMarcador, fimMarcador, novo) {
    const inicio = html.indexOf(inicioMarcador);
    const fim = html.indexOf(fimMarcador);
    if (inicio === -1 || fim === -1) return null;

    return html.slice(0, inicio + inicioMarcador.length) +
        novo +
        html.slice(fim);
}

const ARQUIVOS = [
    { nome: 'index.html', ativo: null, schema: 'home' },
    { nome: 'politica-privacidade-chamados.html', ativo: null, schema: 'interna' },
    // 404 é noindex: dado estruturado ali não serve para nada.
    { nome: '404.html', ativo: null, schema: 'nenhum' }
];

// Substitui o trecho entre a tag de abertura e seu fechamento.
// As tags visadas não se aninham nelas mesmas, então o primeiro fechamento
// encontrado é o correto.
function substituirBloco(html, aberturaParcial, tagFecha, novo) {
    const inicio = html.indexOf(aberturaParcial);
    if (inicio === -1) return null;

    const fim = html.indexOf(tagFecha, inicio);
    if (fim === -1) return null;

    return html.slice(0, inicio) + novo + html.slice(fim + tagFecha.length);
}

// Lê as perguntas do FAQ que está de fato renderizado na página.
//
// O FAQPage precisa descrever conteúdo visível ao usuário — marcar pergunta
// que não aparece na tela é violação das diretrizes do Google. Gerar o schema
// a partir do HTML garante que os dois nunca divirjam, o que já acontecia:
// duas das quatro respostas do schema antigo tinham texto diferente do
// visível na página.
function extrairFaqVisivel(html) {
    const perguntas = [];
    const rx = /<details class="faq-item">\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g;
    let m;
    while ((m = rx.exec(html)) !== null) {
        const limpar = function (t) {
            return t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        };
        perguntas.push({ p: limpar(m[1]), r: limpar(m[2]) });
    }
    return perguntas;
}

function montarSchemas(alvo, html) {
    if (alvo.schema === 'nenhum') return [];

    const blocos = [T.schemaOrganizacao()];

    if (alvo.schema === 'home') {
        blocos.push(T.schemaWebSite());
        const faq = extrairFaqVisivel(html);
        if (faq.length > 0) blocos.push(T.schemaFaq(faq));
    } else {
        blocos.push(T.jsonLdBreadcrumb([
            { nome: 'Início', url: '/' },
            { nome: 'Política de Privacidade', url: '/' + alvo.nome }
        ]));
    }

    return blocos;
}

// Remove todo JSON-LD existente e devolve o HTML limpo.
function removerJsonLd(html) {
    return html
        .replace(/[ \t]*<!--[^\n]*Schema[^\n]*-->\r?\n/gi, '')
        .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\r?\n?/gi, '');
}

const apenasVerificar = process.argv.includes('--verificar');
let alterados = 0;
let falhas = 0;

ARQUIVOS.forEach(function (alvo) {
    const caminho = path.join(RAIZ, alvo.nome);
    if (!fs.existsSync(caminho)) {
        console.error('  ERRO      ' + alvo.nome + ' não encontrado');
        falhas += 1;
        return;
    }

    const original = fs.readFileSync(caminho, 'utf8');
    let html = original;

    // --- Menu ---
    // Reaproveita o header completo do template e extrai só o <nav>, para
    // que exista uma única definição de navegação no projeto.
    const headerModelo = T.montarHeader({ ativo: alvo.ativo });
    const navModelo = headerModelo.slice(
        headerModelo.indexOf('<nav class="nav"'),
        headerModelo.indexOf('</nav>') + '</nav>'.length
    );

    const comNav = substituirBloco(html, '<nav class="nav"', '</nav>', navModelo);
    if (comNav === null) {
        console.error('  ERRO      ' + alvo.nome + ' — bloco <nav class="nav"> não encontrado');
        falhas += 1;
        return;
    }
    html = comNav;

    // --- Botão flutuante + rodapé ---
    // O botão sai colado ao rodapé no template, mas fica FORA do <footer> no
    // HTML. Sem remover o anterior, cada execução deixaria mais um botão
    // acumulado na página.
    // Consome também as linhas em branco que seguem o botão. Sem isso, cada
    // execução removia o botão mas deixava a linha vazia que o separava do
    // rodapé, e a reinserção acrescentava outra — o arquivo crescia um byte
    // por rodada e o modo --verificar nunca dizia "em dia".
    html = html.replace(/[ \t]*<a href="[^"]*" class="whatsapp-float"[\s\S]*?<\/a>[ \t]*\r?\n(?:[ \t]*\r?\n)*/g, '');

    const rodapeModelo = T.montarFooter().replace(/^ {4}/, '');
    const comRodape = substituirBloco(html, '<footer class="footer">', '</footer>', rodapeModelo);
    if (comRodape === null) {
        console.error('  ERRO      ' + alvo.nome + ' — bloco <footer class="footer"> não encontrado');
        falhas += 1;
        return;
    }
    html = comRodape;

    // --- gtag embutido ---
    // Trocar <script src> por inline elimina 865 ms de bloqueio da primeira
    // pintura, causados por uma requisição de 1,4 KB.
    //
    // O bloco fica entre marcadores explícitos, e não por reconhecimento da
    // tag. A versão anterior procurava <script src="/js/gtag-init.min.js">
    // para trocá-la pelo inline — o que funciona uma única vez: a partir da
    // segunda execução o atributo src já não existe, o padrão deixa de casar
    // e o snippet destes três arquivos congela. Pior, o --verificar passava a
    // dizer "em dia", porque o conteúdo de fato não mudava mais. Editar
    // js/gtag-init.js e não ver o efeito na home é o tipo de falha que só
    // aparece semanas depois, quando alguém confere a medição.
    const comGtag = substituirEntreMarcadores(
        html,
        MARCADOR_GTAG_INICIO,
        MARCADOR_GTAG_FIM,
        '\n    <script>' + T.lerAsset('js/gtag-init.min.js') + '</script>\n    '
    );

    if (comGtag === null) {
        console.error('  ERRO      ' + alvo.nome + ' — marcadores ' + MARCADOR_GTAG_INICIO +
            ' / ' + MARCADOR_GTAG_FIM + ' não encontrados no <head>');
        falhas += 1;
        return;
    }
    html = comGtag;

    // --- CSS crítico embutido ---
    // Substitui os <link rel="stylesheet"> bloqueantes pelo crítico inline
    // mais a carga assíncrona das folhas completas.
    // O bloco fica entre marcadores explícitos. Tentar reconhecê-lo por
    // padrão — pelo comentário de abertura até o </style> — falha assim que o
    // conteúdo muda de forma: numa rodada o bloco antigo não é reconhecido, o
    // novo é inserido ao lado, e o <head> acumula folhas duplicadas.
    const inicio = html.indexOf(MARCADOR_CSS_INICIO);
    const fim = html.indexOf(MARCADOR_CSS_FIM);

    if (inicio === -1 || fim === -1) {
        console.error('  ERRO      ' + alvo.nome + ' — marcadores ' + MARCADOR_CSS_INICIO +
            ' / ' + MARCADOR_CSS_FIM + ' não encontrados no <head>');
        falhas += 1;
        return;
    }

    html = html.slice(0, inicio + MARCADOR_CSS_INICIO.length) +
        '\n' + T.montarCss() + '\n    ' +
        html.slice(fim);

    // --- Dados estruturados ---
    // O FAQ é lido do HTML já com o rodapé aplicado, para pegar o conteúdo
    // final da página.
    const schemas = montarSchemas(alvo, html);
    html = removerJsonLd(html);

    if (schemas.length > 0) {
        const blocos = schemas.map(function (obj) {
            return '    <script type="application/ld+json">\n    ' +
                JSON.stringify(obj, null, 4).split('\n').join('\n    ') +
                '\n    </script>';
        }).join('\n');

        // A função de substituição é obrigatória aqui, não estilo.
        // Com string, o replace interpreta $$ como um $ literal — e o
        // priceRange "$$" do LocalBusiness saía do outro lado como "$",
        // mudando a faixa de preço declarada ao Google.
        html = html.replace('</head>', function () { return blocos + '\n</head>'; });
    }

    // Os três arquivos manuais ficam na raiz, então não levam prefixo — mas
    // ainda assim precisam passar por aplicarBase, para converter os caminhos
    // absolutos que o template produz.
    html = T.aplicarBase(html, '');

    // A comparação normaliza o fim de linha.
    //
    // O repositório está com core.autocrlf=true: o git grava LF e devolve
    // CRLF no checkout. Os scripts escrevem LF. Comparando byte a byte, todo
    // arquivo recém-baixado apareceria como "fora de sincronia" mesmo sem
    // nenhuma diferença de conteúdo — e o --verificar nunca ficaria limpo.
    if (mesmoConteudo(html, original)) {
        console.log('  ok        ' + alvo.nome);
        return;
    }

    alterados += 1;

    if (apenasVerificar) {
        console.log('  FORA DE SINCRONIA  ' + alvo.nome);
        return;
    }

    fs.writeFileSync(caminho, html, 'utf8');
    console.log('  sincronizado  ' + alvo.nome);
});

if (falhas > 0) {
    console.error('\n' + falhas + ' arquivo(s) com erro.');
    process.exit(1);
}

if (apenasVerificar && alterados > 0) {
    console.error('\n' + alterados + ' arquivo(s) fora de sincronia. Rode: node scripts/sincronizar-html.js');
    process.exit(1);
}

console.log('\nConcluído.');
