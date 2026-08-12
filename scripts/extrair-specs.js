#!/usr/bin/env node
'use strict';

// ===================================
// EXTRATOR DE ESPECIFICAÇÕES
// ===================================
// Uso: node scripts/extrair-specs.js [--json]
//
// Lê as fichas técnicas de impressoras.html e devolve os dados estruturados
// de cada modelo. É a fonte única das especificações usadas pelas páginas
// individuais em /impressoras/.
//
// Existe para que nenhuma spec seja transcrita à mão. Os números que estão
// no site são o único dado técnico disponível; copiá-los manualmente para
// seis páginas novas seria a forma mais provável de introduzir um erro que
// ninguém notaria.
//
// Nada aqui inventa ou completa informação: se um campo não existe no HTML
// de origem, ele simplesmente não aparece na saída.

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEM = path.join(RAIZ, 'impressoras.html');

// impressoras.html deixou de conter as fichas: virou o hub comparativo e as
// especificações passaram para /impressoras/<modelo>.html. Este JSON é a
// cópia congelada do que havia lá, e vira a fonte a partir de então.
//
// Sem ele, regenerar as páginas depois da conversão do hub produziria seis
// arquivos vazios — o script leria um HTML que não tem mais spec nenhuma.
const CACHE = path.join(__dirname, 'dados-modelos.json');

function limpar(texto) {
    return texto
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Devolve o conteúdo interno da <div> que começa em `inicio`, contando
// abertura e fechamento para achar o par correto.
//
// Regex não serve aqui: .spec-value às vezes é <span>, às vezes é uma <div>
// contendo <ul>. Um padrão não-guloso fecha na primeira </div> que encontra
// e trunca o grupo — foi assim que a primeira versão perdeu metade das specs
// silenciosamente, devolvendo 5 linhas onde havia 12.
function conteudoDaDiv(html, inicio) {
    const rx = /<\/?div\b[^>]*>/g;
    rx.lastIndex = inicio;
    let profundidade = 0;
    let inicioConteudo = -1;
    let m;

    while ((m = rx.exec(html)) !== null) {
        if (m[0].charAt(1) === '/') {
            profundidade -= 1;
            if (profundidade === 0) return html.slice(inicioConteudo, m.index);
        } else {
            if (profundidade === 0) inicioConteudo = m.index + m[0].length;
            profundidade += 1;
        }
    }
    return null;
}

// Todos os blocos <div class="X"> de um trecho, já balanceados.
function blocosPorClasse(html, classe) {
    const blocos = [];
    const marcador = 'class="' + classe + '"';
    let de = 0;

    while (true) {
        const achou = html.indexOf(marcador, de);
        if (achou === -1) break;
        const aberturaDiv = html.lastIndexOf('<div', achou);
        if (aberturaDiv === -1) break;
        const conteudo = conteudoDaDiv(html, aberturaDiv);
        if (conteudo === null) break;
        blocos.push(conteudo);
        de = aberturaDiv + conteudo.length;
    }

    return blocos;
}

function extrairModelos(html) {
    const modelos = [];
    const blocos = html.split(/<article class="printer-section"/).slice(1);

    blocos.forEach(function (bloco) {
        const corpo = bloco.split('</article>')[0];

        const id = (corpo.match(/id="([^"]+)"/) || [])[1] || null;
        const nome = limpar((corpo.match(/<h2[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '');
        const categoria = limpar((corpo.match(/<span class="printer-category">([\s\S]*?)<\/span>/) || [])[1] || '');
        const descricao = limpar((corpo.match(/<p class="printer-description"[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '');

        const img = corpo.match(/<img\s+src="([^"]+)"\s+alt="([^"]*)"/) || [];
        const imagem = img[1] ? path.basename(img[1]) : null;
        const imagemAlt = img[2] || '';

        // Destaques: cada .highlight-item tem um <span> decorativo (o ponto)
        // seguido do <span> com o texto.
        const destaques = [];
        blocosPorClasse(corpo, 'highlight-item').forEach(function (item) {
            const spans = item.match(/<span(?![^>]*highlight-dot)[^>]*>([\s\S]*?)<\/span>/g) || [];
            spans.forEach(function (s) {
                const t = limpar(s);
                if (t) destaques.push(t);
            });
        });

        // Grupos de especificação: <h3> seguido das linhas .spec-row.
        const grupos = [];
        blocosPorClasse(corpo, 'spec-category').forEach(function (trecho) {
            const titulo = limpar((trecho.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || '');
            if (!titulo) return;

            const linhas = [];
            blocosPorClasse(trecho, 'spec-row').forEach(function (linha) {
                const rotulo = limpar((linha.match(/<span class="spec-label">([\s\S]*?)<\/span>/) || [])[1] || '');
                if (!rotulo) return;

                // O valor pode ser texto simples ou uma lista de opções.
                const itens = [];
                const rxItem = /<li>([\s\S]*?)<\/li>/g;
                let mI;
                while ((mI = rxItem.exec(linha)) !== null) itens.push(limpar(mI[1]));

                if (itens.length > 0) {
                    linhas.push({ rotulo: rotulo, itens: itens });
                } else {
                    const valor = limpar((linha.match(/<span class="spec-value">([\s\S]*?)<\/span>/) || [])[1] || '');
                    if (valor) linhas.push({ rotulo: rotulo, valor: valor });
                }
            });

            if (linhas.length > 0) grupos.push({ titulo: titulo, linhas: linhas });
        });

        modelos.push({
            id: id,
            nome: nome,
            categoria: categoria,
            descricao: descricao,
            imagem: imagem,
            imagemAlt: imagemAlt,
            destaques: destaques,
            grupos: grupos
        });
    });

    return modelos;
}

// Prefere o HTML enquanto ele ainda tiver as fichas; depois disso, o JSON.
function carregar() {
    if (fs.existsSync(ORIGEM)) {
        const doHtml = extrairModelos(fs.readFileSync(ORIGEM, 'utf8'));
        if (doHtml.length > 0) return { modelos: doHtml, fonte: 'impressoras.html' };
    }
    if (fs.existsSync(CACHE)) {
        return { modelos: JSON.parse(fs.readFileSync(CACHE, 'utf8')), fonte: 'dados-modelos.json' };
    }
    throw new Error('Sem fonte de dados: impressoras.html não tem fichas e scripts/dados-modelos.json não existe.');
}

const carregado = carregar();
const modelos = carregado.modelos;

// Dimensões reais de cada imagem, lidas do cabeçalho do arquivo WebP.
//
// As páginas declaravam width="400" height="333" para todas, mas os arquivos
// têm proporções diferentes (1024x535, 1024x1024, 1024x1536). Declarar uma
// proporção que não é a da imagem faz o navegador reservar um espaço com
// formato errado, e o Lighthouse acusa image-aspect-ratio. Com os valores
// reais o espaço bate, e o CSS continua definindo o tamanho exibido.
//
// A leitura é feita direto no cabeçalho em vez de por biblioteca: o dado está
// em bytes de posição fixa, e isso mantém o script sem dependências e
// síncrono.
function dimensoesWebp(caminho) {
    const buffer = fs.readFileSync(caminho);
    if (buffer.length < 30) return null;
    if (buffer.toString('ascii', 0, 4) !== 'RIFF') return null;
    if (buffer.toString('ascii', 8, 12) !== 'WEBP') return null;

    const formato = buffer.toString('ascii', 12, 16);

    // VP8X (estendido): dimensões em 24 bits little-endian, menos 1.
    if (formato === 'VP8X') {
        return {
            largura: 1 + buffer.readUIntLE(24, 3),
            altura: 1 + buffer.readUIntLE(27, 3)
        };
    }

    // VP8 (com perdas): 14 bits úteis a partir do byte 26.
    if (formato === 'VP8 ') {
        return {
            largura: buffer.readUInt16LE(26) & 0x3fff,
            altura: buffer.readUInt16LE(28) & 0x3fff
        };
    }

    // VP8L (sem perdas): 14 bits de largura e 14 de altura empacotados
    // em 32 bits a partir do byte 21.
    if (formato === 'VP8L') {
        const bits = buffer.readUInt32LE(21);
        return {
            largura: 1 + (bits & 0x3fff),
            altura: 1 + ((bits >> 14) & 0x3fff)
        };
    }

    return null;
}

modelos.forEach(function (modelo) {
    if (!modelo.imagem) return;
    const caminho = path.join(RAIZ, 'impressoras', modelo.imagem);
    if (!fs.existsSync(caminho)) return;
    try {
        const d = dimensoesWebp(caminho);
        if (d) {
            modelo.largura = d.largura;
            modelo.altura = d.altura;
        }
    } catch (erro) {
        // Sem as dimensões, o gerador usa o padrão. Não impede a geração.
    }
});

module.exports = { extrairModelos: extrairModelos, modelos: modelos, fonte: carregado.fonte };

if (require.main === module) {
    if (process.argv.includes('--salvar')) {
        fs.writeFileSync(CACHE, JSON.stringify(modelos, null, 2) + '\n', 'utf8');
        console.log('Dados de ' + modelos.length + ' modelo(s) salvos em scripts/dados-modelos.json (fonte: ' + carregado.fonte + ').');
    } else if (process.argv.includes('--json')) {
        console.log(JSON.stringify(modelos, null, 2));
    } else {
        console.log('Fonte: ' + carregado.fonte);
        modelos.forEach(function (m) {
            const totalLinhas = m.grupos.reduce(function (s, g) { return s + g.linhas.length; }, 0);
            console.log('\n' + m.nome + '  [' + m.id + ']');
            console.log('  categoria : ' + m.categoria);
            console.log('  imagem    : ' + m.imagem);
            console.log('  destaques : ' + m.destaques.length + ' — ' + m.destaques.join(' | '));
            console.log('  grupos    : ' + m.grupos.length + ' (' + totalLinhas + ' linhas de spec)');
            m.grupos.forEach(function (g) {
                console.log('    · ' + g.titulo);
                g.linhas.forEach(function (l) {
                    console.log('        ' + l.rotulo + ': ' + (l.itens ? '[' + l.itens.length + ' itens] ' + l.itens.join('; ') : l.valor));
                });
            });
        });
        console.log('\n' + modelos.length + ' modelo(s) extraído(s).');
    }
}
