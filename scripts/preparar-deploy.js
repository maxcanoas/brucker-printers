#!/usr/bin/env node
'use strict';

// ===================================
// PREPARADOR DE DEPLOY
// ===================================
// Uso: node scripts/preparar-deploy.js "<pasta de destino>"
//
// Copia para a pasta indicada exatamente os arquivos que precisam subir para
// a HostGator, com a mesma estrutura de diretórios.
//
// A lista não é fixa: o script varre as páginas HTML e recolhe tudo que elas
// referenciam — CSS, JS, imagens, favicons, og:image e as URLs de imagem do
// JSON-LD. Manter uma lista escrita à mão daria certo hoje e ficaria
// desatualizada na primeira página nova.
//
// Fora do pacote, de propósito:
//   scripts/          ferramentas de geração, não fazem parte do site
//   *.css e *.js não minificados   só os .min são servidos
//   SEO-*.md          documentação do trabalho
//   brucker-chamados/, tool-assets/, .git/
//   imagens não referenciadas por página nenhuma

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const SITE = 'https://bruckerprinters.com.br';
const IGNORAR_DIR = new Set(['brucker-chamados', 'node_modules', 'tool-assets', '.git', 'scripts', '.lighthouse', '.claude']);

// Precisam ir mesmo sem nenhuma página apontar para eles.
const OBRIGATORIOS = ['.htaccess', 'robots.txt', 'sitemap.xml'];

const destino = process.argv[2];
if (!destino) {
    console.error('Informe a pasta de destino:');
    console.error('  node scripts/preparar-deploy.js "C:\\caminho\\para\\pasta"');
    process.exit(1);
}

function listarHtml(dir, acc) {
    acc = acc || [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
        if (e.name.startsWith('.')) return;
        const completo = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (!IGNORAR_DIR.has(e.name)) listarHtml(completo, acc);
        } else if (e.name.endsWith('.html')) {
            acc.push(completo);
        }
    });
    return acc;
}

const necessarios = new Set();

function registrar(caminhoAbsoluto) {
    if (!caminhoAbsoluto) return;
    const rel = path.relative(RAIZ, caminhoAbsoluto);
    // Fora da raiz do projeto, ignora.
    if (rel.startsWith('..')) return;
    if (!fs.existsSync(caminhoAbsoluto)) return;
    if (fs.statSync(caminhoAbsoluto).isDirectory()) return;
    necessarios.add(rel.split(path.sep).join('/'));
}

const paginas = listarHtml(RAIZ);

paginas.forEach(function (arquivo) {
    registrar(arquivo);
    const html = fs.readFileSync(arquivo, 'utf8');
    const pasta = path.dirname(arquivo);

    // href e src de qualquer tag.
    const rxAtributo = /(?:href|src)="([^"]+)"/g;
    let m;
    while ((m = rxAtributo.exec(html)) !== null) {
        const valor = m[1];
        if (/^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(valor)) continue;
        const semAncora = valor.split('#')[0].split('?')[0];
        if (!semAncora) continue;
        // "/blog/" e afins apontam para o index daquele diretório.
        const alvo = semAncora.endsWith('/')
            ? path.resolve(pasta, semAncora, 'index.html')
            : path.resolve(pasta, semAncora);
        registrar(alvo);
    }

    // url() dentro do CSS embutido — hoje só as fontes.
    //
    // Sem isto, um .woff2 citado apenas no @font-face não vai para o pacote: o
    // site sobe, o navegador não acha a fonte e cai no fallback, sem erro
    // visível em lugar nenhum. Foi o que aconteceu com a mono, que não tem
    // preload porque pré-carregar duas faces competiria com o elemento de LCP.
    const rxUrlCss = /url\("([^"]+)"\)/g;
    while ((m = rxUrlCss.exec(html)) !== null) {
        const valor = m[1];
        if (/^(https?:|data:|\/\/)/i.test(valor)) continue;
        registrar(path.resolve(pasta, valor.split('?')[0]));
    }

    // og:image, twitter:image e demais metas que apontam para arquivo do site.
    const rxMeta = /content="(https:\/\/bruckerprinters\.com\.br\/[^"]+)"/g;
    while ((m = rxMeta.exec(html)) !== null) {
        registrar(path.join(RAIZ, m[1].replace(SITE, '')));
    }

    // Imagens declaradas no JSON-LD (logo, image do LocalBusiness e do Product).
    const rxJson = /"(?:image|logo)":\s*"(https:\/\/bruckerprinters\.com\.br\/[^"]+)"/g;
    while ((m = rxJson.exec(html)) !== null) {
        registrar(path.join(RAIZ, m[1].replace(SITE, '')));
    }
});

OBRIGATORIOS.forEach(function (nome) {
    registrar(path.join(RAIZ, nome));
});

// ===================================
// CÓPIA
// ===================================

if (!fs.existsSync(destino)) fs.mkdirSync(destino, { recursive: true });

const lista = Array.from(necessarios).sort();
const porPasta = {};
let bytes = 0;

lista.forEach(function (rel) {
    const origem = path.join(RAIZ, rel);
    const alvo = path.join(destino, rel);
    fs.mkdirSync(path.dirname(alvo), { recursive: true });
    fs.copyFileSync(origem, alvo);

    const tamanho = fs.statSync(origem).size;
    bytes += tamanho;

    const grupo = rel.indexOf('/') === -1 ? '(raiz)' : rel.slice(0, rel.indexOf('/'));
    if (!porPasta[grupo]) porPasta[grupo] = { n: 0, bytes: 0 };
    porPasta[grupo].n += 1;
    porPasta[grupo].bytes += tamanho;
});

console.log('Copiados para: ' + destino + '\n');

Object.keys(porPasta).sort().forEach(function (g) {
    console.log('  ' + g.padEnd(16) + String(porPasta[g].n).padStart(3) + ' arquivo(s)   ' +
        String(Math.round(porPasta[g].bytes / 1024)).padStart(6) + ' KB');
});

console.log('\n  TOTAL           ' + String(lista.length).padStart(3) + ' arquivo(s)   ' +
    String(Math.round(bytes / 1024)).padStart(6) + ' KB');

// O .htaccess costuma ficar oculto em cliente de FTP; se não subir, HTTPS,
// redirects, gzip e a página 404 personalizada não valem.
if (necessarios.has('.htaccess')) {
    console.log('\n  ATENÇÃO: .htaccess está no pacote, mas fica OCULTO na maioria');
    console.log('  dos clientes de FTP. Ative a exibição de arquivos ocultos antes');
    console.log('  de enviar — sem ele não há HTTPS forçado, 301, gzip nem 404.');
}
