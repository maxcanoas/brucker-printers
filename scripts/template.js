'use strict';

// ===================================
// TEMPLATE COMUM DAS PÁGINAS GERADAS
// ===================================
// Head, header, rodapé e navegação de todas as páginas produzidas por
// script. Existe para que uma mudança de menu ou de rodapé seja feita em um
// arquivo só, e não em treze.
//
// index.html, politica-privacidade-chamados.html e 404.html continuam
// escritos à mão — mudanças estruturais precisam ser replicadas neles
// manualmente. NAV e RODAPE abaixo são a referência do que deve constar.

const fs = require('fs');
const path = require('path');

const SITE = 'https://bruckerprinters.com.br';
const WHATSAPP = '5551997371666';

const RAIZ_PROJETO = path.resolve(__dirname, '..');

// Lê um asset já minificado para embutir no HTML.
function lerAsset(relativo) {
    const caminho = path.join(RAIZ_PROJETO, relativo);
    if (!fs.existsSync(caminho)) {
        throw new Error('Asset ausente: ' + relativo + '. Rode antes: node scripts/build-assets.js');
    }
    return fs.readFileSync(caminho, 'utf8').trim();
}

// Endereço confirmado pelo cliente. Usado no rodapé e no schema.
const ENDERECO = {
    rua: 'Av. Armando Fajardo, 2903 - Sala 2',
    bairro: 'Igara',
    cidade: 'Canoas',
    uf: 'RS',
    cep: '92412-550',
    telefone: '(51) 99737-1666',
    telefoneUrl: '+5551997371666',
    email: 'contato@bruckerprinters.com.br'
};

// Área do Cliente: a URL aponta para localhost por decisão do cliente
// (ver SEO-PENDENCIAS.md). Mantida como está; só recebe o atributo de
// medição para o evento acesso_area_cliente.
const URL_AREA_CLIENTE = 'http://localhost:5173/cliente';

const MODELOS = [
    { slug: 'ricoh-pro-c5200', nome: 'Ricoh Pro C5200' },
    { slug: 'ricoh-pro-c5300', nome: 'Ricoh Pro C5300' },
    { slug: 'ricoh-pro-c7200', nome: 'Ricoh Pro C7200' },
    { slug: 'ricoh-pro-c9200', nome: 'Ricoh Pro C9200' },
    { slug: 'ricoh-pro-8300', nome: 'Ricoh Pro 8300' },
    { slug: 'ricoh-mp-c2004', nome: 'Ricoh MP C2004' }
];

const SERVICOS = [
    { slug: 'locacao-de-impressoras-ricoh', nome: 'Locação de impressoras' },
    { slug: 'venda-de-impressoras-ricoh', nome: 'Venda de impressoras' },
    { slug: 'assistencia-tecnica-ricoh', nome: 'Assistência técnica' },
    { slug: 'outsourcing-de-impressao', nome: 'Outsourcing de impressão' }
];

function escapar(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ===================================
// CAMINHOS RELATIVOS À RAIZ DO SITE
// ===================================
// Os geradores escrevem os caminhos como se o site estivesse na raiz do
// domínio ("/css/...", "/impressoras.html"). Esta função converte tudo para
// relativo antes de gravar o arquivo.
//
// Por que não deixar absoluto: em bruckerprinters.com.br o site fica na raiz e
// caminho absoluto funciona, mas no GitHub Pages ele é servido sob
// /brucker-printers/ — ali "/css/style.css" aponta para fora do projeto e dá
// 404. Com caminho relativo, o mesmo arquivo funciona nos dois lugares, e
// também em qualquer subpasta de teste.
//
// O que NÃO é convertido: canonical, og:url e as URLs dentro do JSON-LD.
// Essas continuam absolutas com o domínio de produção, de propósito — é o que
// diz aos buscadores qual é o endereço oficial da página e impede que o
// preview do GitHub Pages seja indexado como conteúdo duplicado.
//
// base é o prefixo até a raiz: "" para páginas na raiz, "../" para as que
// ficam em /impressoras/ ou /blog/.
function aplicarBase(html, base) {
    const prefixo = base || '';

    // "/" e "/#ancora" apontam para o diretório, não para index.html.
    //
    // O .htaccess redireciona /index.html para / com 301, para que a home
    // tenha um endereço só — é o mesmo endereço que o canonical declara.
    // Escrever href="index.html" faria cada clique de menu passar por esse
    // redirecionamento: uma viagem a mais de ida e volta ao servidor por
    // clique, e crawl budget gasto à toa em 186 links internos.
    //
    // "./" na raiz e "../" em subpasta resolvem para o mesmo diretório nos
    // dois ambientes — o site na raiz do domínio em produção e sob
    // /brucker-printers/ no preview. Os validadores já tratam caminho
    // terminado em "/" como o index daquele diretório.
    const raizRelativa = prefixo || './';

    return html
        .replace(/(href)="\/"/g, '$1="' + raizRelativa + '"')
        .replace(/(href)="\/#/g, '$1="' + raizRelativa + '#')
        // Demais caminhos internos. O (?![/#]) evita mexer em "//" (protocolo
        // relativo) e nos casos já tratados acima.
        .replace(/(href|src)="\/(?![/#])/g, '$1="' + prefixo)
        // O CSS vai inline, então o url() das fontes é resolvido em relação ao
        // HTML — e as páginas vivem em três profundidades. aplicarBase já sabe
        // qual é o prefixo de cada uma; só faltava isso valer para url() também.
        // Idempotente: a saída não tem barra inicial, então rodar de novo não
        // muda nada. Exige aspas duplas no url(), que é como o site.css escreve.
        .replace(/url\("\/(?![\/#])/g, 'url("' + prefixo);
}

function linkWhatsApp(mensagem) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensagem);
}

// ===================================
// HEAD
// ===================================
// opcoes: { titulo, descricao, url, ogTitulo, imagem, imagemAlt, noindex,
//           jsonLd: [objetos] }

// Imagem social. 1200x630 com fundo sólido, gerada por
// scripts/gerar-og-image.js. A logo transparente que era usada antes
// desaparecia sobre o tema escuro do WhatsApp e do LinkedIn.
const OG_IMAGEM = SITE + '/imagens/og-brucker-printers.png';
const OG_LARGURA = '1200';
const OG_ALTURA = '630';
const OG_ALT = 'Brücker Printers — impressoras Ricoh Pro para produção gráfica: venda, locação e assistência técnica';

function montarHead(opcoes) {
    const url = opcoes.url;
    const imagem = opcoes.imagem || OG_IMAGEM;
    const ogTitulo = opcoes.ogTitulo || opcoes.titulo;

    const robots = opcoes.noindex
        ? '<meta name="robots" content="noindex, follow">'
        : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

    const canonical = opcoes.noindex ? '' : '\n    <link rel="canonical" href="' + url + '">';

    // A identidade da empresa entra em toda página, sempre com o mesmo @id.
    // É o que permite que Product, Service e Article apenas a referenciem em
    // vez de repetir os dados — e que os buscadores liguem tudo à mesma
    // entidade. Uma página noindex não precisa disso.
    const schemas = [];
    if (!opcoes.noindex) schemas.push(schemaOrganizacao());
    (opcoes.jsonLd || []).forEach(function (obj) { schemas.push(obj); });

    const blocosJsonLd = schemas.map(function (obj) {
        return '    <script type="application/ld+json">\n    ' +
            JSON.stringify(obj, null, 4).split('\n').join('\n    ') +
            '\n    </script>';
    }).join('\n');

    return `    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Preconnect ao GA4: a conexão começa em paralelo com o parse do HTML,
         em vez de só depois que o script de medição pedir o arquivo. -->
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>

    <!-- Google Analytics (GA4) + Consent Mode v2.
         Embutido a partir de js/gtag-init.min.js — não edite aqui, edite o
         arquivo e rode: node scripts/build-assets.js && os geradores.

         Precisa ser inline: como arquivo externo sem defer, estes 1,4 KB
         bloqueavam 865 ms da renderização, porque o navegador abria uma
         conexão e esperava a resposta antes de continuar a ler o HTML. E não
         pode virar defer: o estado de consentimento tem de ser declarado
         antes do gtag('config'), senão o Consent Mode não vale para a
         primeira medição da página. -->
    <script>${lerAsset('js/gtag-init.min.js')}</script>

    <!-- SEO Meta Tags -->
    <title>${escapar(opcoes.titulo)}</title>
    <meta name="description" content="${escapar(opcoes.descricao)}">
    <meta name="author" content="Brücker Printers">
    ${robots}${canonical}

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapar(ogTitulo)}">
    <meta property="og:description" content="${escapar(opcoes.descricao)}">
    <meta property="og:image" content="${imagem}">
    <meta property="og:image:width" content="${OG_LARGURA}">
    <meta property="og:image:height" content="${OG_ALTURA}">
    <meta property="og:image:alt" content="${escapar(opcoes.imagemAlt || OG_ALT)}">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="Brücker Printers">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapar(ogTitulo)}">
    <meta name="twitter:description" content="${escapar(opcoes.descricao)}">
    <meta name="twitter:image" content="${imagem}">
    <meta name="twitter:image:alt" content="${escapar(opcoes.imagemAlt || OG_ALT)}">

    <!-- Geo -->
    <meta name="geo.region" content="BR-RS">
    <meta name="geo.placename" content="${ENDERECO.cidade}">

    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="/imagens/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/imagens/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/imagens/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/imagens/apple-touch-icon.png">
    <meta name="theme-color" content="#be1622">

${montarCss()}
${blocosJsonLd}`;
}
// O CSS inteiro vai embutido no bloco de estilo de cada página, sem <link>.
//
// Por que embutir tudo, e não só o crítico: a versão com crítico inline mais
// folhas assíncronas baixou o LCP de 4,3 s para 3,3 s, mas levou o CLS de 0
// para 0,152 — acima do limite de 0,1. Quando o CSS completo chega depois da
// primeira pintura, todo elemento que ele estiliza se reposiciona. Cobrir isso
// exigiria um "crítico" do tamanho do arquivo inteiro. Embutido não há segunda
// pintura: some o bloqueio de rede e some o deslocamento.
//
// O custo é não ter cache entre páginas. Para tráfego de busca, que chega
// direto na página de destino e costuma ver uma só, a troca compensa.
//
// As fontes são a exceção e ficam em arquivo separado de propósito: são o único
// asset que vale a pena cachear entre navegações. O preload precisa de
// crossorigin mesmo sendo same-origin — sem ele o navegador usa um modo de CORS
// diferente do fetch do @font-face e baixa a fonte duas vezes. Ele também é o
// que faz preparar-deploy.js enxergar o .woff2: aquele script só segue href e
// src, então fonte citada apenas em url() dentro do CSS não iria para o pacote.
//
// Só a Archivo é pré-carregada: é ela que pinta o H1, e somar uma segunda fonte
// de alta prioridade competiria com o elemento de LCP. A mono entra com swap.
function montarCss() {
    return `    <link rel="preload" as="font" type="font/woff2" href="/fontes/archivo-var-latin.woff2" crossorigin>
    <style>${lerAsset('css/site.min.css')}</style>`;
}

// ===================================
// HEADER
// ===================================
// ativo: 'impressoras' | 'solucoes' | null — marca o item corrente.
// zap: link de WhatsApp específico da página, com data-modelo se aplicável.

// A navegação é gerada a partir de MODELOS e SERVICOS: incluir uma página
// nova nessas listas já a coloca no menu e no mapa do site, sem risco de
// alguém criar a página e esquecer de linká-la.

function montarNavegacao(ativo) {
    const itensModelos = MODELOS.map(function (m) {
        return '                        <li><a href="/impressoras/' + m.slug + '.html">' + escapar(m.nome) + '</a></li>';
    }).join('\n');

    const itensServicos = SERVICOS.map(function (s) {
        return '                        <li><a href="/' + s.slug + '.html">' + escapar(s.nome) + '</a></li>';
    }).join('\n');

    const classe = function (nome) { return ativo === nome ? ' active' : ''; };

    return `                <div class="nav-item">
                    <a href="/impressoras.html" class="nav-link${classe('impressoras')}">Impressoras</a>
                    <ul class="nav-submenu" aria-label="Modelos de impressora">
                        <li><a href="/impressoras.html"><strong>Comparar os 6 modelos</strong></a></li>
                        <li class="nav-submenu-separador" aria-hidden="true"></li>
${itensModelos}
                    </ul>
                </div>
                <div class="nav-item">
                    <a href="/#solucoes" class="nav-link${classe('solucoes')}">Soluções</a>
                    <ul class="nav-submenu" aria-label="Soluções">
${itensServicos}
                        <li class="nav-submenu-separador" aria-hidden="true"></li>
                        <li><a href="/impressoras-para-graficas-porto-alegre.html">Atendimento em Porto Alegre</a></li>
                    </ul>
                </div>
                <a href="/#vantagens" class="nav-link">Vantagens</a>
                <a href="/#diferenciais" class="nav-link">Diferenciais</a>
                <a href="/blog/" class="nav-link${classe('blog')}">Blog</a>
                <a href="/#contato" class="nav-link">Contato</a>`;
}

function montarHeader(opcoes) {
    opcoes = opcoes || {};
    const zap = opcoes.zap || linkWhatsApp('Olá! Gostaria de solicitar um orçamento.');
    const dataModelo = opcoes.modelo ? ' data-modelo="' + escapar(opcoes.modelo) + '"' : '';

    return `    <header class="header" id="header">
        <div class="header-container">
            <a href="/" class="logo" aria-label="Página Inicial Brücker Printers">
                <img src="/imagens/logo-brucker.webp" alt="Brücker Printers - Venda e Locação de Impressoras Ricoh" class="logo-image" width="200" height="50" fetchpriority="high" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                <span style="display: none;">Brücker Printers</span>
            </a>
            <nav class="nav" id="nav" aria-label="Navegação Principal">
${montarNavegacao(opcoes.ativo)}
                <a href="${URL_AREA_CLIENTE}" class="nav-link nav-link--subtle" target="_blank" rel="noopener noreferrer" data-evento="area-cliente" data-origem="header">Área do Cliente</a>
                <a href="${zap}" class="btn-header" target="_blank" rel="noopener noreferrer" data-origem="header"${dataModelo}>Falar no WhatsApp</a>
            </nav>
            <button class="menu-toggle" id="menuToggle" aria-label="Menu de Navegação">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>`;
}

// ===================================
// RODAPÉ
// ===================================

const SVG_INSTAGRAM = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>\n' +
    '                    </svg>';

// Mapa do site no rodapé. Garante que toda página esteja a um clique de
// qualquer outra — inclusive as que não cabem no menu principal.
function montarMapaDoSite() {
    const e = ENDERECO;

    const modelos = MODELOS.map(function (m) {
        return '                        <li><a href="/impressoras/' + m.slug + '.html">' + escapar(m.nome) + '</a></li>';
    }).join('\n');

    const servicos = SERVICOS.map(function (s) {
        return '                        <li><a href="/' + s.slug + '.html">' + escapar(s.nome) + '</a></li>';
    }).join('\n');

    return `            <nav class="footer-mapa" aria-label="Mapa do site">
                <div>
                    <h3>Impressoras</h3>
                    <ul>
                        <li><a href="/impressoras.html">Comparar os 6 modelos</a></li>
${modelos}
                    </ul>
                </div>
                <div>
                    <h3>Soluções</h3>
                    <ul>
${servicos}
                    </ul>
                </div>
                <div>
                    <h3>A empresa</h3>
                    <ul>
                        <li><a href="/#sobre">Sobre a Brücker</a></li>
                        <li><a href="/#vantagens">Vantagens da locação</a></li>
                        <li><a href="/#diferenciais">Diferenciais</a></li>
                        <li><a href="/#faq">Perguntas frequentes</a></li>
                        <li><a href="/blog/">Blog</a></li>
                        <li><a href="/impressoras-para-graficas-porto-alegre.html">Atendimento em Porto Alegre</a></li>
                        <li><a href="/politica-privacidade-chamados.html">Política de Privacidade</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Contato</h3>
                    <address class="footer-endereco">
                        ${e.rua}<br>
                        ${e.bairro}, ${e.cidade} - ${e.uf}<br>
                        CEP ${e.cep}<br><br>
                        <a href="tel:${e.telefoneUrl}" data-origem="rodape">${e.telefone}</a><br>
                        <a href="mailto:${e.email}" data-origem="rodape">${e.email}</a>
                        <!-- Se a ofuscação de e-mail do Cloudflare estiver ativa, ela troca o
                             mailto acima por um script que só resolve com JavaScript. Este
                             fallback garante o endereço legível sem JS. -->
                        <noscript><br>${e.email}</noscript>
                    </address>
                </div>
            </nav>
`;
}

// Botão flutuante de WhatsApp.
//
// A classe .whatsapp-float já era escondida no @media print dos dois CSS
// desde antes deste trabalho, mas nunca teve regra de posicionamento nem
// HTML: o botão foi previsto e nunca implementado.
//
// Sai junto do rodapé porque é o rodapé que o sincronizador substitui nos
// arquivos escritos à mão — assim o botão chega às dezenove páginas sem
// precisar de um ponto de inserção próprio.
function montarFooter(opcoes) {
    opcoes = opcoes || {};
    const zap = linkWhatsApp(opcoes.zapTexto || 'Olá! Gostaria de solicitar um orçamento.');
    const dataModelo = opcoes.modelo ? ' data-modelo="' + escapar(opcoes.modelo) + '"' : '';

    return `    <a href="${zap}" class="whatsapp-float" target="_blank" rel="noopener noreferrer"
       data-origem="botao_flutuante"${dataModelo}
       aria-label="Falar no WhatsApp com a Brücker Printers">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.99 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.887 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z"/>
        </svg>
    </a>

    <footer class="footer">
        <div class="footer-content">
${montarMapaDoSite()}
            <div class="footer-info">
                <h3 style="margin-bottom: 1rem;">Brücker Printers</h3>
                <p>Soluções corporativas em impressão para empresas de todos os portes.</p>
                <p>Venda | Locação | Manutenção Especializada</p>
            </div>

            <div class="footer-social">
                <a href="https://www.instagram.com/bruckerprinters/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram Brücker Printers">
                    ${SVG_INSTAGRAM}
                </a>
            </div>

            <div class="footer-links">
                <a href="${URL_AREA_CLIENTE}" target="_blank" rel="noopener noreferrer" data-evento="area-cliente" data-origem="rodape">Área do Cliente</a>
                <a href="/politica-privacidade-chamados.html">Política de Privacidade — Brucker Chamados</a>
            </div>

            <div class="footer-bottom">
                <p>&copy; <span id="currentYear"></span> Brücker Printers. Todos os direitos reservados.</p>
                <div class="dev-credit">
                    <p>Desenvolvido por <a href="https://www.devmrmoraes.com.br" target="_blank" rel="noopener noreferrer">devmrmoraes</a></p>
                </div>
            </div>
        </div>
    </footer>`;
}

function montarScripts() {
    return `    <!-- analytics antes de script: registra o medidor de lead antes do handler do formulário -->
    <script src="/js/analytics.min.js" defer></script>
    <script src="/js/script.min.js" defer></script>`;
}

// ===================================
// BLOCOS REUTILIZÁVEIS
// ===================================

// trilha: [{ nome, url }] — o último item é a página atual, sem link.
function montarBreadcrumb(trilha) {
    const itens = trilha.map(function (item, i) {
        const ultimo = i === trilha.length - 1;
        const conteudo = ultimo
            ? '<span aria-current="page">' + escapar(item.nome) + '</span>'
            : '<a href="' + item.url + '">' + escapar(item.nome) + '</a>';
        return '                        <li>' + conteudo + '</li>';
    }).join('\n');

    return `                <nav class="breadcrumb" aria-label="Trilha de navegação">
                    <ol>
${itens}
                    </ol>
                </nav>`;
}

function jsonLdBreadcrumb(trilha) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trilha.map(function (item, i) {
            return {
                '@type': 'ListItem',
                position: i + 1,
                name: item.nome,
                item: item.url.indexOf('http') === 0 ? item.url : SITE + item.url
            };
        })
    };
}

function montarFaq(perguntas) {
    return perguntas.map(function (item) {
        return '                    <details class="faq-item">\n' +
            '                        <summary>' + escapar(item.p) + '</summary>\n' +
            '                        <p>' + escapar(item.r) + '</p>\n' +
            '                    </details>';
    }).join('\n');
}

function montarCta(opcoes) {
    return `                <div class="cta-bloco">
                    <h2>${escapar(opcoes.titulo)}</h2>
                    <p>${escapar(opcoes.texto)}</p>
                    <a href="${opcoes.zap}" class="btn-cta-interna" target="_blank" rel="noopener noreferrer" data-origem="${opcoes.origem || 'secao_contato'}"${opcoes.modelo ? ' data-modelo="' + escapar(opcoes.modelo) + '"' : ''}>${escapar(opcoes.botao || 'Falar no WhatsApp')}</a>
                </div>`;
}

// ===================================
// DADOS ESTRUTURADOS (JSON-LD)
// ===================================
// Todas as entidades ficam aqui para não divergirem entre páginas.
//
// O encadeamento é feito por @id, e não repetindo o objeto inteiro dentro de
// cada Product ou Service: assim existe uma definição só da empresa, e os
// buscadores entendem que seller, provider, publisher e author são a mesma
// entidade — e não quatro organizações homônimas.

const ID_ORGANIZACAO = SITE + '/#organizacao';
const ID_SITE = SITE + '/#site';

// LocalBusiness completo. A versão anterior declarava addressRegion "Brasil"
// e não tinha rua, cidade nem CEP — LocalBusiness sem endereço físico é
// inválido, e o Google provavelmente descartava o bloco inteiro.
function schemaOrganizacao() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': ID_ORGANIZACAO,
        name: 'Brücker Printers',
        description: 'Venda, locação e assistência técnica de impressoras Ricoh para gráficas e ambientes de produção gráfica.',
        url: SITE,
        logo: SITE + '/imagens/logoTransparente.png',
        // image do LocalBusiness aparece em resultados enriquecidos; a versão
        // 1200x630 com fundo sólido se apresenta melhor que a logo recortada.
        image: SITE + '/imagens/og-brucker-printers.png',
        telephone: '+55-51-99737-1666',
        email: ENDERECO.email,
        priceRange: '$$',
        address: {
            '@type': 'PostalAddress',
            streetAddress: ENDERECO.rua,
            addressLocality: ENDERECO.cidade,
            addressRegion: ENDERECO.uf,
            postalCode: ENDERECO.cep,
            addressCountry: 'BR'
        },
        // TODO: confirmar com o cliente — latitude e longitude do endereço em
        // Canoas, para preencher o campo "geo". Sem coordenadas verificadas,
        // preencher seria inventar a localização do negócio.
        areaServed: { '@type': 'Country', name: 'Brasil' },
        openingHoursSpecification: [{
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '18:00'
        }],
        sameAs: ['https://www.instagram.com/bruckerprinters/']
    };
}

function schemaWebSite() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': ID_SITE,
        name: 'Brücker Printers',
        url: SITE,
        inLanguage: 'pt-BR',
        publisher: { '@id': ID_ORGANIZACAO }
    };
}

// Offer sem price é intencional: não há preço público e inventar um seria
// pior que a ausência. O Rich Results Test emite aviso de campo ausente
// (não erro) e a oferta continua válida, apontando para o orçamento.
function schemaProduto(dados) {
    const propriedades = (dados.specs || []).map(function (s) {
        return { '@type': 'PropertyValue', name: s.rotulo, value: s.valor };
    });

    const produto = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: dados.nome,
        description: dados.descricao,
        image: dados.imagem,
        url: dados.url,
        brand: { '@type': 'Brand', name: 'Ricoh' },
        category: dados.categoria,
        offers: {
            '@type': 'Offer',
            url: dados.url,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': ID_ORGANIZACAO }
        }
    };

    if (propriedades.length > 0) produto.additionalProperty = propriedades;
    return produto;
}

function schemaServico(dados) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: dados.nome,
        description: dados.descricao,
        url: dados.url,
        serviceType: dados.tipo,
        provider: { '@id': ID_ORGANIZACAO },
        areaServed: { '@type': 'Country', name: 'Brasil' }
    };
}

function schemaArtigo(dados) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        // headline acima de 110 caracteres faz o Google ignorar o bloco.
        headline: dados.titulo.slice(0, 110),
        description: dados.descricao,
        url: dados.url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': dados.url },
        datePublished: dados.publicado,
        dateModified: dados.modificado || dados.publicado,
        author: { '@id': ID_ORGANIZACAO },
        publisher: { '@id': ID_ORGANIZACAO },
        image: dados.imagem || SITE + '/imagens/logoTransparente.png',
        inLanguage: 'pt-BR'
    };
}

// Só use com perguntas que estejam visíveis na página. FAQPage marcando
// conteúdo oculto é violação das diretrizes do Google.
function schemaFaq(perguntas) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: perguntas.map(function (item) {
            return {
                '@type': 'Question',
                name: item.p,
                acceptedAnswer: {
                    '@type': 'Answer',
                    // O texto visível pode conter links; o schema quer texto puro.
                    text: String(item.r).replace(/<[^>]+>/g, '')
                }
            };
        })
    };
}

module.exports = {
    aplicarBase: aplicarBase,
    lerAsset: lerAsset,
    montarCss: montarCss,
    ID_ORGANIZACAO: ID_ORGANIZACAO,
    schemaOrganizacao: schemaOrganizacao,
    schemaWebSite: schemaWebSite,
    schemaProduto: schemaProduto,
    schemaServico: schemaServico,
    schemaArtigo: schemaArtigo,
    schemaFaq: schemaFaq,
    montarNavegacao: montarNavegacao,
    montarMapaDoSite: montarMapaDoSite,
    SITE: SITE,
    WHATSAPP: WHATSAPP,
    ENDERECO: ENDERECO,
    MODELOS: MODELOS,
    SERVICOS: SERVICOS,
    URL_AREA_CLIENTE: URL_AREA_CLIENTE,
    escapar: escapar,
    linkWhatsApp: linkWhatsApp,
    montarHead: montarHead,
    montarHeader: montarHeader,
    montarFooter: montarFooter,
    montarScripts: montarScripts,
    montarBreadcrumb: montarBreadcrumb,
    jsonLdBreadcrumb: jsonLdBreadcrumb,
    montarFaq: montarFaq,
    montarCta: montarCta
};
