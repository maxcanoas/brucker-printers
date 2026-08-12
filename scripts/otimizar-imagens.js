#!/usr/bin/env node
'use strict';

// ===================================
// OTIMIZADOR DE IMAGENS
// ===================================
// Uso: node scripts/otimizar-imagens.js [--analisar]
//
// --analisar  só mostra o descompasso entre o tamanho do arquivo e o tamanho
//             em que ele é exibido, sem gravar nada.
//
// O Lighthouse acusava 250 KiB em imagens maiores que o necessário e 103 KiB
// em formatos antigos. O caso mais grave: logoTransparente.png tem 102 KB e
// aparece em 200x50 px no cabeçalho de todas as páginas — o navegador baixa
// e redimensiona uma imagem vinte vezes maior que o espaço onde ela cabe.
//
// Os arquivos originais não são apagados: continuam no repositório como
// fallback e referência.

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');

let sharp;
try {
    sharp = require(path.join(RAIZ, 'tool-assets', 'node_modules', 'sharp'));
} catch (e) {
    console.error('sharp não encontrado em tool-assets/node_modules.');
    process.exit(1);
}

// destino: null gera .webp ao lado do original, mantendo o nome.
// largura/altura: o dobro do tamanho de exibição, para telas com DPR 2.
const ALVOS = [
    {
        origem: 'imagens/logoTransparente.png',
        destino: 'imagens/logo-brucker.webp',
        largura: 400,
        altura: 100,
        exibido: '200x50',
        transparencia: true
    },
    { origem: 'clientes/artpontocom.jpg', largura: 300, altura: 160, exibido: '150x80' },
    { origem: 'clientes/cardnet.png', largura: 300, altura: 160, exibido: '150x80', transparencia: true },
    { origem: 'clientes/ctd.jpg', largura: 300, altura: 160, exibido: '150x80' },
    { origem: 'clientes/grafica-pinguin.jpg', largura: 300, altura: 160, exibido: '150x80' },
    { origem: 'clientes/grafica-valeform.jpg', largura: 300, altura: 160, exibido: '150x80' },
    { origem: 'clientes/grafimax.jpg', largura: 300, altura: 160, exibido: '150x80' },
    { origem: 'clientes/raizler.jpg', largura: 300, altura: 160, exibido: '150x80' }
];

// Imagens já em WebP, conferidas mas não reprocessadas: recomprimir uma
// segunda vez degrada a qualidade sem ganho relevante de tamanho.
const CONFERIR = [
    { arquivo: 'impressoras/ricoh-pro-c5200.webp', exibido: '400x333' },
    { arquivo: 'impressoras/ricoh-pro-c5300.webp', exibido: '400x333' },
    { arquivo: 'impressoras/ricoh-pro-c7200.webp', exibido: '400x333' },
    { arquivo: 'impressoras/ricoh-pro-c9200.webp', exibido: '400x333' },
    { arquivo: 'impressoras/ricoh-pro-c8300.webp', exibido: '400x333' },
    { arquivo: 'impressoras/RicohMPC2004.webp', exibido: '400x333' },
    { arquivo: 'imagens/venda-locacao-impressoras-ricoh-nova.webp', exibido: '600x400' }
];

const analisar = process.argv.includes('--analisar');

function kb(bytes) {
    return Math.round(bytes / 1024) + ' KB';
}

async function processar() {
    console.log('=== Conversão para WebP ===');

    for (let i = 0; i < ALVOS.length; i++) {
        const alvo = ALVOS[i];
        const origem = path.join(RAIZ, alvo.origem);

        if (!fs.existsSync(origem)) {
            console.log('  ignorado  ' + alvo.origem + ' (não encontrado)');
            continue;
        }

        const destinoRel = alvo.destino || alvo.origem.replace(/\.(png|jpe?g)$/i, '.webp');
        const destino = path.join(RAIZ, destinoRel);
        const meta = await sharp(origem).metadata();
        const tamanhoOrigem = fs.statSync(origem).size;

        if (analisar) {
            console.log('  ' + alvo.origem.padEnd(42) + meta.width + 'x' + meta.height +
                '  exibido em ' + alvo.exibido + '  ' + kb(tamanhoOrigem));
            continue;
        }

        await sharp(origem)
            .resize({
                width: alvo.largura,
                height: alvo.altura,
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 88, alphaQuality: 100, effort: 6 })
            .toFile(destino);

        const tamanhoDestino = fs.statSync(destino).size;
        const reducao = Math.round((1 - tamanhoDestino / tamanhoOrigem) * 100);

        console.log('  ' + destinoRel.padEnd(42) +
            kb(tamanhoOrigem) + ' → ' + kb(tamanhoDestino) +
            '  (-' + reducao + '%)');
    }

    console.log('\n=== Já em WebP (conferidas, não reprocessadas) ===');
    for (let i = 0; i < CONFERIR.length; i++) {
        const item = CONFERIR[i];
        const caminho = path.join(RAIZ, item.arquivo);
        if (!fs.existsSync(caminho)) {
            console.log('  ausente   ' + item.arquivo);
            continue;
        }
        const meta = await sharp(caminho).metadata();
        const tamanho = fs.statSync(caminho).size;
        const alvoLargura = parseInt(item.exibido.split('x')[0], 10);
        // Acima do dobro da largura de exibição, o excesso não é aproveitado
        // nem em tela com DPR 2.
        const excesso = meta.width > alvoLargura * 2;
        console.log('  ' + item.arquivo.padEnd(50) + meta.width + 'x' + meta.height +
            '  exibido ' + item.exibido + '  ' + kb(tamanho) + (excesso ? '  ← maior que o necessário' : ''));
    }
}

processar().catch(function (erro) {
    console.error('Falhou: ' + erro.message);
    process.exit(1);
});
