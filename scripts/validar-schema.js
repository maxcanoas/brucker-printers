#!/usr/bin/env node
'use strict';

// ===================================
// VALIDADOR DE DADOS ESTRUTURADOS
// ===================================
// Uso: node scripts/validar-schema.js
//
// O Rich Results Test e o Schema Markup Validator do Google só aceitam URL
// pública ou código colado à mão. Enquanto o site não estiver publicado, este
// script cobre o mesmo terreno localmente: extrai todo JSON-LD das páginas e
// confere contra as exigências documentadas do Google.
//
// Ele NÃO substitui a validação oficial depois do deploy — a lista de campos
// obrigatórios muda com o tempo e só o validador do Google é autoridade.
// Serve para não publicar nada obviamente quebrado.
//
// ERRO   impede o rich result ou invalida o bloco.
// AVISO  campo recomendado ausente; o bloco continua válido.

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const IGNORAR = new Set(['brucker-chamados', 'node_modules', 'tool-assets', '.git', 'scripts', '.lighthouse']);

const erros = [];
const avisos = [];

// ===================================
// REGRAS POR TIPO
// ===================================
// obrigatorios: ausência é erro.
// recomendados: ausência é aviso.

const REGRAS = {
    LocalBusiness: {
        obrigatorios: ['name', 'address'],
        recomendados: ['telephone', 'url', 'image', 'priceRange', 'openingHoursSpecification', 'geo']
    },
    Organization: {
        obrigatorios: ['name'],
        recomendados: ['url', 'logo']
    },
    Product: {
        obrigatorios: ['name'],
        recomendados: ['image', 'description', 'offers', 'brand']
    },
    Offer: {
        obrigatorios: ['availability'],
        // price ausente é intencional aqui: não há preço público. Fica como
        // aviso para não sumir do radar, mas não bloqueia.
        recomendados: ['price', 'priceCurrency', 'url']
    },
    Article: {
        obrigatorios: ['headline', 'datePublished'],
        recomendados: ['image', 'author', 'publisher', 'dateModified', 'description']
    },
    BreadcrumbList: {
        obrigatorios: ['itemListElement'],
        recomendados: []
    },
    FAQPage: {
        obrigatorios: ['mainEntity'],
        recomendados: []
    },
    Service: {
        obrigatorios: ['name'],
        recomendados: ['provider', 'areaServed', 'description']
    },
    WebSite: {
        obrigatorios: ['name', 'url'],
        recomendados: ['publisher']
    },
    ItemList: {
        obrigatorios: ['itemListElement'],
        recomendados: ['name']
    },
    PostalAddress: {
        obrigatorios: ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry'],
        recomendados: []
    }
};

// ===================================
// COLETA
// ===================================

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

function extrairJsonLd(html, pagina) {
    const blocos = [];
    const rx = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let m;
    let indice = 0;

    while ((m = rx.exec(html)) !== null) {
        indice += 1;
        try {
            blocos.push({ indice: indice, dados: JSON.parse(m[1]) });
        } catch (e) {
            erros.push(pagina + ' — bloco JSON-LD nº' + indice + ' não é JSON válido: ' + e.message);
        }
    }

    return blocos;
}

// ===================================
// VALIDAÇÃO
// ===================================

const idsDefinidos = new Set();
const idsReferenciados = [];

function validarObjeto(obj, pagina, caminho) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
        obj.forEach(function (item, i) { validarObjeto(item, pagina, caminho + '[' + i + ']'); });
        return;
    }

    if (obj['@id']) {
        // Um objeto que só tem @id é referência; com mais campos, é definição.
        const chaves = Object.keys(obj).filter(function (k) { return k !== '@id'; });
        if (chaves.length === 0) {
            idsReferenciados.push({ id: obj['@id'], pagina: pagina, caminho: caminho });
        } else {
            idsDefinidos.add(obj['@id']);
        }
    }

    const tipo = obj['@type'];
    const regra = tipo && REGRAS[tipo];

    if (regra) {
        regra.obrigatorios.forEach(function (campo) {
            if (obj[campo] === undefined || obj[campo] === null || obj[campo] === '') {
                erros.push(pagina + ' — ' + tipo + ' em ' + caminho + ' sem campo obrigatório "' + campo + '"');
            }
        });
        regra.recomendados.forEach(function (campo) {
            if (obj[campo] === undefined) {
                avisos.push(pagina + ' — ' + tipo + ' sem campo recomendado "' + campo + '"');
            }
        });
    }

    // --- Checagens específicas ---

    if (tipo === 'Article') {
        if (typeof obj.headline === 'string' && obj.headline.length > 110) {
            erros.push(pagina + ' — Article com headline de ' + obj.headline.length +
                ' caracteres (o Google ignora acima de 110)');
        }
        ['datePublished', 'dateModified'].forEach(function (campo) {
            if (obj[campo] && !/^\d{4}-\d{2}-\d{2}/.test(obj[campo])) {
                erros.push(pagina + ' — Article com ' + campo + ' fora do formato ISO 8601: ' + obj[campo]);
            }
        });
    }

    if (tipo === 'BreadcrumbList' && Array.isArray(obj.itemListElement)) {
        obj.itemListElement.forEach(function (item, i) {
            if (item.position !== i + 1) {
                erros.push(pagina + ' — BreadcrumbList com position fora de ordem no item ' + (i + 1));
            }
            if (!item.name) erros.push(pagina + ' — BreadcrumbList item ' + (i + 1) + ' sem name');
            if (!item.item) erros.push(pagina + ' — BreadcrumbList item ' + (i + 1) + ' sem item (URL)');
        });
    }

    if (tipo === 'FAQPage' && Array.isArray(obj.mainEntity)) {
        obj.mainEntity.forEach(function (q, i) {
            if (!q.name) erros.push(pagina + ' — FAQPage pergunta ' + (i + 1) + ' sem name');
            const resposta = q.acceptedAnswer && q.acceptedAnswer.text;
            if (!resposta) {
                erros.push(pagina + ' — FAQPage pergunta ' + (i + 1) + ' sem acceptedAnswer.text');
            } else if (/<[a-z]/i.test(resposta)) {
                erros.push(pagina + ' — FAQPage resposta ' + (i + 1) + ' contém HTML não escapado');
            }
        });
    }

    // URLs precisam ser absolutas para o Google resolver a entidade.
    ['url', 'image', 'logo'].forEach(function (campo) {
        const v = obj[campo];
        if (typeof v === 'string' && v !== '' && !/^https?:\/\//.test(v)) {
            erros.push(pagina + ' — ' + (tipo || caminho) + ' com "' + campo + '" relativo: ' + v);
        }
    });

    Object.keys(obj).forEach(function (chave) {
        if (chave.startsWith('@')) return;
        validarObjeto(obj[chave], pagina, caminho + '.' + chave);
    });
}

// FAQPage precisa espelhar o que está visível. Marcar pergunta que o usuário
// não vê é violação de diretriz e motivo de ação manual.
function conferirFaqVisivel(html, blocos, pagina) {
    const visiveis = [];
    const rx = /<summary>([\s\S]*?)<\/summary>/g;
    let m;
    while ((m = rx.exec(html)) !== null) {
        visiveis.push(m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().toLowerCase());
    }

    blocos.forEach(function (bloco) {
        if (bloco.dados['@type'] !== 'FAQPage') return;
        (bloco.dados.mainEntity || []).forEach(function (q) {
            const pergunta = String(q.name || '').replace(/\s+/g, ' ').trim().toLowerCase();
            if (visiveis.indexOf(pergunta) === -1) {
                erros.push(pagina + ' — FAQPage marca pergunta que não está visível na página: "' +
                    String(q.name).slice(0, 55) + '..."');
            }
        });
    });
}

// ===================================
// EXECUÇÃO
// ===================================

const arquivos = listarHtml(RAIZ);
let totalBlocos = 0;
const contagemPorTipo = {};

arquivos.forEach(function (arquivo) {
    const pagina = '/' + path.relative(RAIZ, arquivo).split(path.sep).join('/');
    const html = fs.readFileSync(arquivo, 'utf8');
    const blocos = extrairJsonLd(html, pagina);

    totalBlocos += blocos.length;

    blocos.forEach(function (bloco) {
        const tipo = bloco.dados['@type'] || '(sem @type)';
        contagemPorTipo[tipo] = (contagemPorTipo[tipo] || 0) + 1;

        if (!bloco.dados['@context']) {
            erros.push(pagina + ' — bloco nº' + bloco.indice + ' sem @context');
        }
        if (!bloco.dados['@type']) {
            erros.push(pagina + ' — bloco nº' + bloco.indice + ' sem @type');
        }

        validarObjeto(bloco.dados, pagina, tipo);
    });

    conferirFaqVisivel(html, blocos, pagina);
});

// Toda referência por @id precisa ter uma definição correspondente em algum
// lugar do site, senão aponta para o vazio.
idsReferenciados.forEach(function (ref) {
    if (!idsDefinidos.has(ref.id)) {
        erros.push(ref.pagina + ' — referência @id sem definição correspondente: ' + ref.id);
    }
});

// ===================================
// RELATÓRIO
// ===================================

console.log('Analisando ' + arquivos.length + ' página(s), ' + totalBlocos + ' bloco(s) JSON-LD.\n');

console.log('Blocos por tipo:');
Object.keys(contagemPorTipo).sort().forEach(function (t) {
    console.log('  ' + String(contagemPorTipo[t]).padStart(3) + '  ' + t);
});

if (avisos.length > 0) {
    // Agrupa: "Offer sem price" em 6 páginas é uma linha, não seis.
    const agrupados = {};
    avisos.forEach(function (a) {
        const chave = a.replace(/^\S+ — /, '');
        agrupados[chave] = (agrupados[chave] || 0) + 1;
    });
    console.log('\nAVISOS (' + avisos.length + ' ocorrências, ' + Object.keys(agrupados).length + ' tipos):');
    Object.keys(agrupados).sort().forEach(function (k) {
        console.log('  · ' + k + '  (' + agrupados[k] + '×)');
    });
}

if (erros.length > 0) {
    console.log('\nERROS (' + erros.length + '):');
    erros.forEach(function (e) { console.log('  ✗ ' + e); });
    process.exit(1);
}

console.log('\nNenhum erro de estrutura. Valide no Rich Results Test após publicar.');
