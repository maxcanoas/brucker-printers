#!/usr/bin/env node
'use strict';

// ===================================
// GERADOR DA IMAGEM SOCIAL (og:image)
// ===================================
// Uso: node scripts/gerar-og-image.js
//
// Produz imagens/og-brucker-printers.png em 1200x630.
//
// A og:image anterior era imagens/logoTransparente.png: um PNG com fundo
// transparente, em proporção de logo. Compartilhado no WhatsApp ou LinkedIn,
// o fundo transparente é renderizado sobre o tema escuro do aplicativo e a
// logo preta simplesmente desaparece. Daí o fundo sólido e o formato fixo.
//
// Depende do sharp, que já existe em tool-assets/node_modules (usado para
// gerar os ícones do app mobile). Não instala nada novo.

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const SAIDA = path.join(RAIZ, 'imagens', 'og-brucker-printers.png');
const LARGURA = 1200;
const ALTURA = 630;

let sharp;
try {
    sharp = require(path.join(RAIZ, 'tool-assets', 'node_modules', 'sharp'));
} catch (e) {
    console.error('sharp não encontrado em tool-assets/node_modules.');
    console.error('Instale com: cd tool-assets && npm install sharp');
    process.exit(1);
}

// Paleta idêntica ao :root do css/style.css.
const COR_FUNDO = '#1A1A1A';
const COR_LARANJA = '#FF8C42';
const COR_VERMELHO = '#be1622';
const COR_TEXTO = '#f8f7f7';
const COR_SECUNDARIA = '#D1D5DB';

function escaparXml(t) {
    return String(t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// O texto é desenhado como SVG e composto por cima do fundo. A pilha de
// fontes precisa existir na máquina que roda o script: no Windows, Segoe UI;
// nos demais, os genéricos no fim resolvem.
const FONTE = 'Segoe UI, Helvetica Neue, Arial, sans-serif';

// Geometria da composição. O texto ocupa a coluna esquerda e a imagem fica
// num card à direita — as duas faixas não se sobrepõem em nenhum ponto.
const TEXTO_X = 72;
const TEXTO_LARGURA_MAX = 520;
const CARD = { x: 648, y: 105, largura: 480, altura: 420, raio: 16 };

function svgFundo(linha1, linha2) {
    const titulo1 = linha1 || 'Impressoras Ricoh';
    const titulo2 = linha2 || 'para produção gráfica';
    const chamada = 'Venda · Locação · Assistência';
    const rodape = 'bruckerprinters.com.br';

    // 46px nesta pilha de fontes ocupa cerca de 480px em 21 caracteres —
    // dentro dos 520px reservados. Títulos mais longos, como as categorias
    // de modelo, reduzem o corpo proporcionalmente para não invadir o card.
    const maiorLinha = Math.max(titulo1.length, titulo2.length);
    const CORPO_TITULO = maiorLinha <= 21 ? 46 : Math.max(28, Math.floor(46 * 21 / maiorLinha));

    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}">
    <rect width="${LARGURA}" height="${ALTURA}" fill="${COR_FUNDO}"/>

    <!-- Faixa da marca na borda esquerda -->
    <rect x="0" y="0" width="14" height="${ALTURA}" fill="${COR_VERMELHO}"/>
    <rect x="14" y="0" width="6" height="${ALTURA}" fill="${COR_LARANJA}"/>

    <!-- Card claro atrás do equipamento, como no carrossel da home -->
    <rect x="${CARD.x}" y="${CARD.y}" width="${CARD.largura}" height="${CARD.altura}" rx="${CARD.raio}" fill="#FFFFFF"/>

    <text x="${TEXTO_X}" y="238" font-family="${FONTE}" font-size="${CORPO_TITULO}" font-weight="700" fill="${COR_TEXTO}">${escaparXml(titulo1)}</text>
    <text x="${TEXTO_X}" y="298" font-family="${FONTE}" font-size="${CORPO_TITULO}" font-weight="700" fill="${COR_LARANJA}">${escaparXml(titulo2)}</text>

    <rect x="${TEXTO_X}" y="336" width="86" height="5" fill="${COR_VERMELHO}"/>

    <text x="${TEXTO_X}" y="396" font-family="${FONTE}" font-size="27" font-weight="400" fill="${COR_SECUNDARIA}">${escaparXml(chamada)}</text>
    <text x="${TEXTO_X}" y="452" font-family="${FONTE}" font-size="26" font-weight="600" fill="${COR_TEXTO}">Brücker Printers</text>
    <text x="${TEXTO_X}" y="492" font-family="${FONTE}" font-size="21" font-weight="400" fill="${COR_SECUNDARIA}">${escaparXml(rodape)}</text>
</svg>`);
}

async function gerar(opcoes) {
    opcoes = opcoes || {};
    const arquivoImagem = opcoes.imagem || 'ricoh-pro-c7200.webp';
    const destino = opcoes.destino || SAIDA;

    const impressora = path.join(RAIZ, 'impressoras', arquivoImagem);
    if (!fs.existsSync(impressora)) {
        console.error('Imagem de referência não encontrada: ' + impressora);
        process.exit(1);
    }

    // A imagem de origem tem fundo branco. Em vez de tentar recortá-la — o
    // que exigiria máscara e deixaria halo nas bordas — ela é assentada sobre
    // um card branco, o mesmo tratamento que o carrossel da home usa.
    const MARGEM = 30;
    const equipamento = await sharp(impressora)
        .resize({
            width: CARD.largura - MARGEM * 2,
            height: CARD.altura - MARGEM * 2,
            fit: 'inside',
            withoutEnlargement: false
        })
        .toBuffer();

    const meta = await sharp(equipamento).metadata();

    const camadas = [
        { input: svgFundo(opcoes.titulo1, opcoes.titulo2), top: 0, left: 0 },
        {
            input: equipamento,
            // Centralizado no card, para a folga não ficar só de um lado.
            top: Math.round(CARD.y + (CARD.altura - meta.height) / 2),
            left: Math.round(CARD.x + (CARD.largura - meta.width) / 2)
        }
    ];

    await sharp({
        create: {
            width: LARGURA,
            height: ALTURA,
            channels: 4,
            background: COR_FUNDO
        }
    })
        .composite(camadas)
        .png({ compressionLevel: 9 })
        .toFile(destino);

    const tamanho = fs.statSync(destino).size;
    console.log('  gerado    imagens/' + path.basename(destino) + '  ' + LARGURA + 'x' + ALTURA +
        '  (' + Math.round(tamanho / 1024) + ' KB)');
}

// Uma imagem por modelo, além da genérica.
//
// Compartilhar a página da Pro C9200 e ver a foto da C7200 seria pior que
// não ter imagem: o card social é o que o destinatário vê antes de clicar.
async function gerarTodas() {
    await gerar({});

    const { modelos } = require('./extrair-specs');
    const T = require('./template');

    for (let i = 0; i < modelos.length; i++) {
        const modelo = modelos[i];
        const entrada = T.MODELOS.find(function (m) { return m.nome === modelo.nome; });
        if (!entrada) {
            console.error('  ignorado  ' + modelo.nome + ' (sem slug em template.js)');
            continue;
        }

        await gerar({
            imagem: modelo.imagem,
            destino: path.join(RAIZ, 'imagens', 'og-' + entrada.slug + '.png'),
            titulo1: modelo.nome,
            titulo2: modelo.categoria
        });
    }
}

gerarTodas().catch(function (erro) {
    console.error('Falhou: ' + erro.message);
    process.exit(1);
});
