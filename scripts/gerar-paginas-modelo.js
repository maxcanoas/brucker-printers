#!/usr/bin/env node
'use strict';

// ===================================
// GERADOR DAS PÁGINAS DE MODELO
// ===================================
// Uso: node scripts/gerar-paginas-modelo.js
//
// Escreve /impressoras/<slug>.html para cada um dos seis modelos.
//
// Divisão de responsabilidade, que é o ponto deste arquivo:
//
//   ESPECIFICAÇÕES  vêm de scripts/extrair-specs.js, lidas de
//                   impressoras.html. Nenhum número é digitado aqui.
//
//   TEXTO EDITORIAL está em CONTEUDO, abaixo. Foi escrito a partir das
//                   próprias specs e das seções Soluções, Vantagens,
//                   Diferenciais e FAQ do index.html. Onde faltou base no
//                   site, há um comentário TODO na página gerada em vez de
//                   uma afirmação inventada.
//
// Regenerar é seguro: as páginas são sobrescritas por inteiro.

const fs = require('fs');
const path = require('path');
const { modelos } = require('./extrair-specs');
const T = require('./template');

const RAIZ = path.resolve(__dirname, '..');
const DESTINO = path.join(RAIZ, 'impressoras');
const SITE = T.SITE;
const WHATSAPP = T.WHATSAPP;

// ===================================
// CONTEÚDO EDITORIAL
// ===================================

const CONTEUDO = {
    'ricoh-c5200': {
        slug: 'ricoh-pro-c5200',
        titulo: 'Ricoh Pro C5200 | Venda, Locação e Ficha Técnica | Brücker Printers',
        descricao: 'Ricoh Pro C5200: 65 ppm em cores, 1200 x 4800 dpi e papéis de até 350 g/m². Veja a ficha técnica completa e solicite um orçamento de venda ou locação.',
        resumo: 'Impressora de produção colorida para gráficas rápidas e departamentos internos de impressão, com 65 ppm em cores e a maior resolução declarada da linha: 1200 x 4800 dpi.',
        visaoGeral: [
            'A Ricoh Pro C5200 ocupa a faixa de entrada da linha de produção da Ricoh. Ela entrega 65 páginas por minuto tanto em cores quanto em preto e branco, o que significa que trabalhos mistos não perdem cadência quando alternam entre páginas coloridas e monocromáticas — um detalhe que pesa em produção real.',
            'Entre os seis modelos que trabalhamos, é a que declara a maior resolução: 1200 x 4800 dpi, contra 1200 x 1200 dpi das demais. Na prática, isso favorece trabalhos com degradês, fotografia e tipografia miúda.',
            'A gramatura vai de 52 a 350 g/m², cobrindo do papel de miolo ao cartão para capas e cartões de visita, sem exigir um segundo equipamento para o acabamento mais pesado.'
        ],
        paraQuem: {
            texto: 'A C5200 é indicada para operações que precisam de qualidade de produção sem o volume — nem o investimento — de um equipamento industrial:',
            itens: [
                'Gráficas rápidas que trabalham com tiragens curtas e prazo apertado',
                'Departamentos internos de impressão em empresas de médio porte',
                'Operações que imprimem material promocional em cartão de até 350 g/m²',
                'Quem precisa de resolução alta para trabalhos com imagem e degradê'
            ],
            // O site não declara volume mensal recomendado para este modelo,
            // ao contrário dos outros cinco. Não há base para estimar.
            todo: 'volume mensal recomendado da C5200 — é o único modelo sem esse dado no site'
        },
        vendaOuLocacao: [
            'A C5200 é o modelo em que a conta entre comprar e locar fica mais equilibrada, porque o valor de entrada é o menor da linha de produção. Para uma operação com volume estável e previsível, a compra transforma o equipamento em ativo próprio, com garantia estendida disponível.',
            'A locação faz mais sentido quando o volume ainda está crescendo ou oscila entre meses. Você troca o investimento inicial por uma mensalidade fixa que já inclui manutenção, suprimentos e a possibilidade de subir para um modelo maior sem precisar revender o atual.'
        ],
        faq: [
            {
                p: 'Qual a gramatura máxima que a Ricoh Pro C5200 aceita?',
                r: 'A C5200 trabalha com papéis de 52 a 350 g/m², o que cobre desde papel de miolo até cartão para capas e cartões de visita.'
            },
            {
                p: 'Qual a diferença de resolução entre a C5200 e os modelos maiores?',
                r: 'A C5200 declara 1200 x 4800 dpi, enquanto a C5300, a C7200 e a C9200 trabalham com 1200 x 1200 dpi. A contrapartida é a velocidade: 65 ppm contra 80, 85 e 115 ppm respectivamente.'
            },
            {
                p: 'Quantas folhas a C5200 comporta sem recarga?',
                r: 'A entrada padrão é de 2.500 folhas, expansível até 8.500 folhas com os módulos adicionais de alimentação.'
            },
            {
                p: 'A C5200 imprime em formato SRA3?',
                r: 'Sim. Ela trabalha de A6 até SRA3 (320 x 488 mm), formato usual para impor múltiplas peças numa mesma folha e reduzir desperdício.'
            }
        ],
        notaLocacao: 'Como a C5200 é o único modelo da linha sem volume mensal declarado na ficha técnica, o dimensionamento da franquia parte do que você imprime hoje, medido, e não de um teto teórico do equipamento.',
        relacionados: ['ricoh-c5300', 'ricoh-c7200', 'ricoh-c2004']
    },

    'ricoh-c5300': {
        slug: 'ricoh-pro-c5300',
        titulo: 'Ricoh Pro C5300 | Venda, Locação e Ficha Técnica | Brücker Printers',
        descricao: 'Ricoh Pro C5300: 80 ppm, até 500.000 páginas/mês e cores especiais Branco e Clear. Ficha técnica completa e orçamento de venda ou locação sem compromisso.',
        resumo: 'Sistema de produção colorida com tecnologia LED de 5ª geração, 80 ppm e volume mensal de até 500.000 páginas — com opção de cores especiais Branco e Clear.',
        visaoGeral: [
            'A Ricoh Pro C5300 é o primeiro modelo da linha que declara volume mensal: até 500.000 páginas. Esse número é o que separa um equipamento de produção de um equipamento de escritório reforçado — ele indica quanto a máquina aguenta rodar mês após mês sem comprometer a vida útil dos componentes.',
            'O diferencial mais relevante em relação à C5200 não é a velocidade de 80 ppm, e sim a estação opcional de cores especiais: além do CMYK, a C5300 pode aplicar Branco e Clear (verniz). Branco permite imprimir sobre substratos escuros ou transparentes; Clear cria efeitos de brilho localizado sem passar por um processo de acabamento separado.',
            'A gramatura sobe para 400 g/m² e o equipamento aceita banner de até 700 mm, ampliando o que dá para produzir sem terceirizar.'
        ],
        paraQuem: {
            texto: 'A C5300 atende operações comerciais que já vendem acabamento como diferencial:',
            itens: [
                'Gráficas com volume constante acima de 100.000 páginas por mês',
                'Operações que fazem embalagem, rótulo ou material promocional em cartão até 400 g/m²',
                'Quem quer oferecer efeitos de verniz localizado ou impressão em branco sem terceirizar',
                'Produção que exige encadernação em brochura e inserção de capas na própria máquina'
            ]
        },
        vendaOuLocacao: [
            'Num equipamento que roda perto do teto de 500.000 páginas mensais, o custo de manutenção deixa de ser um evento ocasional e vira item fixo do orçamento. É justamente aí que a locação muda de figura: manutenção preventiva, corretiva e peças originais entram na mensalidade, e uma parada deixa de ser um custo imprevisto.',
            'A compra continua fazendo sentido para quem tem capital disponível e volume comprovadamente estável — o equipamento vira patrimônio e o custo por página cai depois de amortizado. A pergunta que costuma decidir é quanto tempo sua operação consegue ficar parada esperando uma peça.'
        ],
        faq: [
            {
                p: 'O que são as cores Branco e Clear da Ricoh Pro C5300?',
                r: 'São estações de cor opcionais além do CMYK. O Branco permite imprimir sobre substratos escuros ou transparentes, e o Clear aplica verniz localizado direto na impressão, sem uma etapa separada de acabamento.'
            },
            {
                p: 'Qual o volume mensal suportado pela C5300?',
                r: 'Até 500.000 páginas por mês. Esse é o volume que o equipamento suporta de forma sustentada, não um pico ocasional.'
            },
            {
                p: 'A C5300 imprime banner?',
                r: 'Sim, em folhas de até 700 mm de comprimento, além do formato padrão de A6 até SRA3 (330 x 488 mm).'
            },
            {
                p: 'A C5300 faz encadernação sozinha?',
                r: 'Com os módulos de acabamento, ela faz grampeamento de até 100 folhas, dobras em C e Z, perfuração, corte, encadernação em brochura e inserção de capas e separadores.'
            }
        ],
        notaLocacao: 'Se a estação de cores especiais Branco e Clear fizer parte da configuração, ela entra no dimensionamento: são consumíveis adicionais, com curva de consumo própria, que precisam ser considerados na franquia desde o início.',
        relacionados: ['ricoh-c5200', 'ricoh-c7200', 'ricoh-c9200']
    },

    'ricoh-c7200': {
        slug: 'ricoh-pro-c7200',
        titulo: 'Ricoh Pro C7200 | Venda, Locação e Ficha Técnica | Brücker Printers',
        descricao: 'Ricoh Pro C7200: 85 ppm, 750.000 páginas/mês e 95% do gamut Pantone. Veja a ficha técnica completa e solicite orçamento de venda ou locação.',
        resumo: 'Produção industrial com 85 ppm, volume mensal de até 750.000 páginas e cobertura de 95% do gamut Pantone — para quem precisa entregar cor conferida contra referência.',
        visaoGeral: [
            'A Ricoh Pro C7200 é o modelo que aparece quando a exigência sai da produtividade e entra na fidelidade de cor. Ela é a única da linha que declara cobertura de gamut: 95% do Pantone. Para quem imprime material de marca, esse número é mais decisivo que velocidade — é o que determina se o azul do cliente vai sair aprovado na primeira prova ou na terceira.',
            'O volume mensal de até 750.000 páginas e a alimentação de até 12.000 folhas colocam a C7200 na faixa de operação contínua, com menos paradas para recarga ao longo do turno.',
            'Ela também amplia o que pode ser impresso: além de papel e cartão até 400 g/m², aceita substratos texturizados, adesivos e envelopes, e banner de até 762 mm. O controlador Fiery ou TotalFlow traz imposição automática, gestão de cores e rastreamento de trabalhos.'
        ],
        paraQuem: {
            texto: 'A C7200 é para operações em que a cor é o produto:',
            itens: [
                'Gráficas comerciais que imprimem material de marca com cor conferida contra referência Pantone',
                'Operações com volume sustentado acima de 300.000 páginas mensais',
                'Quem trabalha com substratos fora do papel comum: texturizados, adesivos e envelopes',
                'Produção que depende de imposição automática e rastreamento de trabalhos no fluxo'
            ]
        },
        vendaOuLocacao: [
            'Equipamentos dessa faixa raramente são comprados à vista. A decisão costuma ser entre financiar a compra ou locar — e a diferença está em quem assume o risco técnico. Na compra, uma falha fora da garantia é um custo seu, e o valor de revenda depende de quanto a tecnologia avançou nesse meio-tempo.',
            'Na locação, a manutenção preventiva e corretiva, as peças originais Ricoh e o SLA de atendimento entram no contrato. Para uma operação que fatura por trabalho entregue no prazo, previsibilidade de disponibilidade costuma valer mais que a posse do ativo.'
        ],
        faq: [
            {
                p: 'O que significa a C7200 cobrir 95% do gamut Pantone?',
                r: 'Significa que o equipamento consegue reproduzir 95% das cores do sistema Pantone, referência usada para especificar cor em identidade visual. Quanto maior a cobertura, menor a chance de uma cor de marca sair fora do esperado.'
            },
            {
                p: 'Qual o volume mensal da Ricoh Pro C7200?',
                r: 'Até 750.000 páginas por mês, com entrada padrão de 4.000 folhas e capacidade máxima de 12.000 folhas.'
            },
            {
                p: 'A C7200 imprime em adesivo e papel texturizado?',
                r: 'Sim. Ela aceita substratos especiais como texturizados, adesivos e envelopes, além de papel e cartão de 52 a 400 g/m².'
            },
            {
                p: 'Qual controlador acompanha a C7200?',
                r: 'Fiery integrado ou TotalFlow, com recursos de rastreamento de trabalhos, imposição automática e gestão de cores.'
            }
        ],
        notaLocacao: 'A escolha do controlador — Fiery integrado ou TotalFlow — costuma ser definida junto com o contrato, porque muda o fluxo de trabalho da operação inteira e não apenas a máquina. Vale decidir isso antes, não depois da instalação.',
        relacionados: ['ricoh-c9200', 'ricoh-c5300', 'ricoh-pro-8300']
    },

    'ricoh-c9200': {
        slug: 'ricoh-pro-c9200',
        titulo: 'Ricoh Pro C9200 | Venda, Locação e Ficha Técnica | Brücker Printers',
        descricao: 'Ricoh Pro C9200: 115 ppm, 1 milhão de páginas/mês, 470 g/m² e cores neon. Ficha técnica completa e orçamento de venda ou locação sem compromisso.',
        resumo: 'O topo da linha: 115 ppm, até 1 milhão de páginas por mês, papéis de até 470 g/m², banner de 1,3 m e cores especiais Branco, Clear, Neon Pink e Neon Yellow.',
        visaoGeral: [
            'A Ricoh Pro C9200 é o equipamento mais capaz do portfólio em todos os eixos ao mesmo tempo: a mais rápida (115 ppm), a de maior volume (1 milhão de páginas mensais), a que aceita o papel mais pesado (470 g/m²) e a de maior formato (SRA3+ em 330 x 660 mm, com banner de até 1.300 mm).',
            'A paleta de cores especiais vai além do Branco e Clear da C5300: inclui Neon Pink e Neon Yellow, que ampliam o gamut para tons fluorescentes impossíveis de atingir só com CMYK.',
            'O que costuma justificar o investimento, porém, é a automação. O sistema IQ-501 faz calibração e registro automáticos com scanner inline — a máquina se ajusta sozinha durante a tiragem, em vez de depender de um operador parando para conferir. Numa operação de grande porte, isso é menos refugo e menos dependência de mão de obra especializada.'
        ],
        paraQuem: {
            texto: 'A C9200 é para operações gráficas comerciais de grande porte:',
            itens: [
                'Gráficas com produção contínua em mais de um turno',
                'Operações que imprimem cartão pesado até 470 g/m² para embalagem e capa dura',
                'Trabalhos que exigem formato maior que SRA3 ou banner de até 1,3 m',
                'Quem precisa de cor fluorescente ou branco sobre substrato escuro',
                'Produção em que o custo do refugo já justifica calibração automática inline'
            ]
        },
        vendaOuLocacao: [
            'Nesta faixa, a conversa raramente é sobre o preço do equipamento e quase sempre sobre custo por página e disponibilidade. Uma máquina que roda um milhão de páginas mensais parada por dois dias representa um prejuízo que supera com folga a diferença entre comprar e locar.',
            'Por isso a locação predomina aqui: a mensalidade fixa inclui manutenção, peças originais e SLA de atendimento, e a franquia de páginas é dimensionada para o seu volume real. Para quem prefere a compra, a consultoria técnica avalia o parque atual antes de recomendar — o equipamento certo depende do que você produz, não do que ele aguenta produzir.'
        ],
        faq: [
            {
                p: 'Qual o volume mensal da Ricoh Pro C9200?',
                r: 'Até 1.000.000 de páginas por mês, com alimentação de 5.000 folhas na configuração padrão e até 15.000 folhas com os módulos adicionais.'
            },
            {
                p: 'Que cores especiais a C9200 imprime?',
                r: 'Além do CMYK, ela trabalha com Branco, Clear (verniz), Neon Pink e Neon Yellow — as duas últimas ampliam o gamut para tons fluorescentes fora do alcance do CMYK.'
            },
            {
                p: 'O que é o sistema IQ-501 da C9200?',
                r: 'É o módulo de automação com scanner inline que faz calibração de cor e ajuste de registro automaticamente durante a tiragem, reduzindo refugo e a necessidade de intervenção do operador.'
            },
            {
                p: 'Qual o formato máximo que a C9200 imprime?',
                r: 'SRA3+ em 330 x 660 mm no formato padrão, e banner de até 1.300 mm de comprimento.'
            },
            {
                p: 'A C9200 imprime em cartão pesado?',
                r: 'Sim, de 52 a 470 g/m² — a maior gramatura da linha, adequada para embalagem e capa dura.'
            }
        ],
        notaLocacao: 'Num equipamento desse porte, a instalação tem requisitos próprios de espaço, energia e acesso. Fazemos essa avaliação antes de fechar o contrato, para que a data de entrega não esbarre em adequação predial.',
        relacionados: ['ricoh-c7200', 'ricoh-c5300', 'ricoh-pro-8300']
    },

    'ricoh-8300': {
        slug: 'ricoh-pro-8300',
        titulo: 'Ricoh Pro 8300 | Venda, Locação e Ficha Técnica | Brücker Printers',
        descricao: 'Ricoh Pro 8300 monocromática: 96 ppm, 1,5 milhão de páginas/mês e 18.000 folhas de alimentação. Ficha técnica completa e orçamento de venda ou locação.',
        resumo: 'Produção monocromática de altíssimo volume: 96 ppm, até 1,5 milhão de páginas por mês, 18.000 folhas de alimentação e primeira página em 3,5 segundos.',
        visaoGeral: [
            'A Ricoh Pro 8300 é o único equipamento monocromático do portfólio, e existe por um motivo específico: para quem imprime em volume alto sem cor, uma máquina colorida é cara demais por página e lenta demais por natureza.',
            'Ela declara o maior volume mensal de toda a linha — 1,5 milhão de páginas, 50% acima da C9200 colorida. A alimentação máxima de 18.000 folhas também é a maior, o que reduz paradas de recarga em tiragens longas.',
            'O tempo de primeira saída de 3,5 segundos é um dado que só ela informa e que importa num perfil bem definido de trabalho: muitos jobs curtos em sequência, em que o tempo de arranque se soma e pesa mais que a velocidade de regime.',
            'Apesar de monocromática, entrega 1200 x 1200 dpi com 256 níveis de cinza — suficiente para reproduzir fotografia em preto e branco com gradação, não apenas texto.'
        ],
        paraQuem: {
            texto: 'A Pro 8300 é indicada para produção monocromática intensiva:',
            itens: [
                'Impressão de livros, apostilas e material didático em tiragem longa',
                'Produção transacional: faturas, extratos, boletos e correspondência em massa',
                'Operações com muitos trabalhos curtos em sequência, em que o tempo de arranque conta',
                'Gráficas que já têm equipamento colorido e querem tirar o volume mono de cima dele'
            ]
        },
        vendaOuLocacao: [
            'Em produção monocromática de alto volume, o custo por página é o número que decide — e ele depende diretamente do preço do toner e da frequência de troca de peças de desgaste. Uma máquina que roda 1,5 milhão de páginas mensais consome consumível numa escala em que pequenas diferenças de preço unitário viram valores relevantes no fim do mês.',
            'A locação com franquia de páginas resolve isso de forma direta: suprimentos e manutenção entram no valor acordado, e o custo por página passa a ser conhecido antes de a página ser impressa. É o modelo que permite orçar um trabalho de tiragem longa sem embutir margem de segurança para o imprevisto.'
        ],
        faq: [
            {
                p: 'A Ricoh Pro 8300 imprime em cores?',
                r: 'Não. É um equipamento exclusivamente monocromático, projetado para produção em preto e branco de altíssimo volume. Para cor, os modelos indicados são a Pro C5200, C5300, C7200 ou C9200.'
            },
            {
                p: 'Qual o volume mensal da Pro 8300?',
                r: 'Até 1.500.000 páginas por mês — o maior de toda a linha, inclusive acima dos modelos coloridos.'
            },
            {
                p: 'Quantas folhas a Pro 8300 comporta?',
                r: 'Entrada padrão de 6.000 folhas, expansível até 18.000 folhas, a maior capacidade do portfólio.'
            },
            {
                p: 'A qualidade em preto e branco serve para imprimir fotografia?',
                r: 'Sim. Ela trabalha com 1200 x 1200 dpi e 256 níveis de cinza, o que reproduz gradação em imagem monocromática, não apenas texto e traço.'
            }
        ],
        notaLocacao: 'Em produção monocromática, a franquia de páginas é a variável que mais pesa no valor final, porque o volume é alto e o custo por página é baixo. Errar o dimensionamento para mais ou para menos custa caro nos dois sentidos.',
        relacionados: ['ricoh-c9200', 'ricoh-c7200', 'ricoh-c5200']
    },

    'ricoh-c2004': {
        slug: 'ricoh-mp-c2004',
        titulo: 'Ricoh MP C2004 | Venda, Locação e Ficha Técnica | Brücker Printers',
        descricao: 'Ricoh MP C2004: multifuncional colorida com impressão, cópia, scanner 600 dpi e fax opcional. Ficha técnica completa e orçamento de venda ou locação.',
        resumo: 'Multifuncional colorida compacta para escritórios: impressão, cópia e digitalização em 20 ppm, scanner de 600 dpi a 50 ipm em frente e verso, e fax opcional.',
        visaoGeral: [
            'A Ricoh MP C2004 é o único equipamento do portfólio que não é de produção gráfica. Ela existe para o outro lado da operação: o escritório, a recepção, o setor administrativo da própria gráfica.',
            'A comparação com os modelos Pro não faz sentido em velocidade — 20 ppm contra 65 a 115 ppm — e sim em função. A C2004 imprime, copia, digitaliza e envia fax (opcional) num único equipamento compacto, com volume mensal de até 50.000 páginas.',
            'O scanner é a parte mais relevante para uso administrativo: 600 dpi a 50 imagens por minuto em frente e verso, com saída em PDF, TIFF e JPEG. Para digitalização de contratos e notas em lote, esse conjunto resolve sem estação separada.',
            'A conectividade cobre impressão a partir de celular via AirPrint, Mopria e Smart Device Connector, com Wi-Fi opcional.'
        ],
        paraQuem: {
            texto: 'A MP C2004 é indicada para uso administrativo, não para produção:',
            itens: [
                'Escritórios e pequenas empresas com volume até 50.000 páginas mensais',
                'Setores administrativos de gráficas que já têm equipamento de produção',
                'Operações que precisam digitalizar documentos em lote, frente e verso',
                'Ambientes em que impressão, cópia, digitalização e fax precisam caber num só equipamento'
            ]
        },
        vendaOuLocacao: [
            'Multifuncionais de escritório são o caso clássico de locação, e por uma razão prática: o custo relevante não é o equipamento, é o toner ao longo dos anos. Um contrato com franquia de páginas transforma um gasto que aparece em picos imprevisíveis numa linha fixa do orçamento mensal.',
            'A compra costuma compensar quando o volume é baixo e constante, e a empresa prefere não ter contrato recorrente. Como o valor de entrada da C2004 é bem menor que o dos modelos de produção, essa é uma escolha mais de preferência administrativa que de matemática financeira.'
        ],
        faq: [
            {
                p: 'A Ricoh MP C2004 serve para uma gráfica?',
                r: 'Para o setor administrativo, sim. Para produção gráfica, não: ela imprime 20 ppm e suporta até 50.000 páginas mensais, enquanto os modelos da linha Pro vão de 65 a 115 ppm com volume de 500.000 a 1,5 milhão de páginas.'
            },
            {
                p: 'A C2004 tem fax?',
                r: 'O fax é opcional. Na configuração padrão ela faz impressão colorida, cópia colorida e digitalização colorida.'
            },
            {
                p: 'Qual a velocidade do scanner da MP C2004?',
                r: '50 imagens por minuto em frente e verso, com resolução de 600 dpi e saída em PDF, TIFF ou JPEG.'
            },
            {
                p: 'Dá para imprimir do celular na C2004?',
                r: 'Sim, via AirPrint, Mopria ou Smart Device Connector. O Wi-Fi é opcional; na configuração padrão a conexão é por Ethernet ou USB.'
            }
        ],
        notaLocacao: 'Em multifuncional de escritório, o dimensionamento costuma partir do número de usuários e da divisão entre cor e preto e branco — duas informações que quase nunca estão medidas, e que valem levantar antes de contratar.',
        relacionados: ['ricoh-c5200', 'ricoh-c5300', 'ricoh-c7200']
    }
};

// ===================================
// AUXILIARES
// ===================================

const escapar = T.escapar;

function linkWhatsApp(nomeModelo) {
    return T.linkWhatsApp('Olá! Gostaria de um orçamento para a ' + nomeModelo + '.');
}

function porId(id) {
    return modelos.find(function (m) { return m.id === id; });
}

// ===================================
// BLOCOS DA PÁGINA
// ===================================

function tabelaSpecs(modelo) {
    const corpo = modelo.grupos.map(function (grupo) {
        const linhas = grupo.linhas.map(function (linha) {
            const valor = linha.itens
                ? '<ul>' + linha.itens.map(function (i) { return '<li>' + escapar(i) + '</li>'; }).join('') + '</ul>'
                : escapar(linha.valor);
            return '                        <tr>\n' +
                   '                            <th scope="row">' + escapar(linha.rotulo) + '</th>\n' +
                   '                            <td>' + valor + '</td>\n' +
                   '                        </tr>';
        }).join('\n');

        return '                    <tbody>\n' +
               '                        <tr class="spec-grupo">\n' +
               '                            <th colspan="2" scope="colgroup">' + escapar(grupo.titulo) + '</th>\n' +
               '                        </tr>\n' + linhas + '\n' +
               '                    </tbody>';
    }).join('\n');

    // O <thead> é necessário, não decorativo: sem ele a primeira linha da
    // tabela é o cabeçalho de grupo com colspan, e leitores de tela (e o
    // axe-core) o interpretam como uma legenda improvisada em vez de um
    // cabeçalho de seção.
    return '                <table class="tabela-specs">\n' +
           '                    <caption>Especificações técnicas da ' + escapar(modelo.nome) + '</caption>\n' +
           '                    <thead>\n' +
           '                        <tr>\n' +
           '                            <th scope="col">Característica</th>\n' +
           '                            <th scope="col">Especificação</th>\n' +
           '                        </tr>\n' +
           '                    </thead>\n' +
           corpo + '\n' +
           '                </table>';
}

function blocoRelacionados(conteudo) {
    const cartoes = conteudo.relacionados.map(function (idOuSlug) {
        // relacionados aceita o id do artigo original ou o slug da página.
        const chave = Object.keys(CONTEUDO).find(function (k) {
            return k === idOuSlug || CONTEUDO[k].slug === idOuSlug;
        });
        const alvo = CONTEUDO[chave];
        const dados = porId(chave);
        return '                    <a class="relacionado-card" href="/impressoras/' + alvo.slug + '.html">\n' +
               '                        <strong>' + escapar(dados.nome) + '</strong>\n' +
               '                        <span>' + escapar(dados.categoria) + '</span>\n' +
               '                    </a>';
    }).join('\n');

    return '                <div class="relacionados-grid">\n' + cartoes + '\n                </div>';
}

function blocoFaq(conteudo) {
    return conteudo.faq.map(function (item) {
        return '                    <details class="faq-item">\n' +
               '                        <summary>' + escapar(item.p) + '</summary>\n' +
               '                        <p>' + escapar(item.r) + '</p>\n' +
               '                    </details>';
    }).join('\n');
}

function jsonLdBreadcrumb(modelo, conteudo) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: SITE + '/' },
            { '@type': 'ListItem', position: 2, name: 'Impressoras', item: SITE + '/impressoras.html' },
            { '@type': 'ListItem', position: 3, name: modelo.nome, item: SITE + '/impressoras/' + conteudo.slug + '.html' }
        ]
    }, null, 4);
}

// ===================================
// TEMPLATE
// ===================================

function montarPagina(modelo, conteudo) {
    const url = SITE + '/impressoras/' + conteudo.slug + '.html';
    const zap = linkWhatsApp(modelo.nome);
    const destaques = modelo.destaques.map(function (d) {
        return '                        <li>' + escapar(d) + '</li>';
    }).join('\n');

    const paraQuemItens = conteudo.paraQuem.itens.map(function (i) {
        return '                        <li>' + escapar(i) + '</li>';
    }).join('\n');

    const todoParaQuem = conteudo.paraQuem.todo
        ? '\n                    <!-- TODO: confirmar com o cliente — ' + conteudo.paraQuem.todo + ' -->'
        : '';

    const trilha = [
        { nome: 'Início', url: '/' },
        { nome: 'Impressoras', url: '/impressoras.html' },
        { nome: modelo.nome, url: '/impressoras/' + conteudo.slug + '.html' }
    ];

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${T.montarHead({
        titulo: conteudo.titulo,
        descricao: conteudo.descricao,
        url: url,
        ogTitulo: modelo.nome + ' | Venda e Locação — Brücker Printers',
        // Cada modelo tem sua própria imagem social, gerada por
        // scripts/gerar-og-image.js. O alt descreve o card compartilhado,
        // não a foto do equipamento dentro dele.
        imagem: SITE + '/imagens/og-' + conteudo.slug + '.png',
        imagemAlt: modelo.nome + ' — ' + modelo.categoria + '. Venda, locação e assistência técnica na Brücker Printers.',
        jsonLd: [
            T.jsonLdBreadcrumb(trilha),
            T.schemaProduto({
                nome: modelo.nome,
                descricao: modelo.descricao,
                imagem: SITE + '/impressoras/' + modelo.imagem,
                url: url,
                categoria: modelo.categoria,
                // As specs viram additionalProperty: expõe os dados técnicos
                // de forma legível por máquina, sem duplicar o texto visível.
                specs: modelo.grupos.reduce(function (acc, g) {
                    g.linhas.forEach(function (l) {
                        if (l.valor) acc.push({ rotulo: l.rotulo + ' (' + g.titulo + ')', valor: l.valor });
                    });
                    return acc;
                }, [])
            }),
            T.schemaFaq(conteudo.faq)
        ]
    })}
</head>
<body>
${T.montarHeader({ zap: zap, modelo: modelo.nome, ativo: 'impressoras' })}

    <main>
        <div class="pagina-topo">
            <div class="container">
${T.montarBreadcrumb(trilha)}
                <h1>${escapar(modelo.nome)}</h1>
                <p class="pagina-resumo">${escapar(conteudo.resumo)}</p>
            </div>
        </div>

        <section class="section">
            <div class="container">
                <h2>Visão geral</h2>
                <div class="about-content">
                    <div class="about-text">
${conteudo.visaoGeral.map(function (p) { return '                        <p>' + escapar(p) + '</p>'; }).join('\n')}
                        <p><strong>${escapar(modelo.categoria)}</strong></p>
                        <ul>
${destaques}
                        </ul>
                    </div>
                    <div class="about-image">
                        <img src="${modelo.imagem}" alt="${escapar(modelo.imagemAlt)}" width="${modelo.largura || 400}" height="${modelo.altura || 333}" loading="eager" decoding="async">
                    </div>
                </div>
            </div>
        </section>

        <section class="section section-alt">
            <div class="container">
                <h2>Especificações técnicas</h2>
                <!-- TODO: confirmar com o cliente — especificações reaproveitadas de impressoras.html; validar contra o datasheet oficial da Ricoh antes de usar em proposta comercial -->
                <div class="tabela-wrapper">
${tabelaSpecs(modelo)}
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container conteudo-texto">
                <h2>Para qual operação é indicada</h2>
                <p>${escapar(conteudo.paraQuem.texto)}</p>
                <ul>
${paraQuemItens}
                </ul>${todoParaQuem}
            </div>
        </section>

        <section class="section section-alt">
            <div class="container conteudo-texto">
                <h2>Venda ou locação: qual faz sentido</h2>
${conteudo.vendaOuLocacao.map(function (p) { return '                <p>' + escapar(p) + '</p>'; }).join('\n')}
            </div>
        </section>

        <section class="section">
            <div class="container conteudo-texto">
                <h2>O que está incluso na locação</h2>
                <p>O contrato de locação da ${escapar(modelo.nome)} segue as mesmas condições da nossa linha de produção:</p>
                <ul>
                    <li>O equipamento, instalado e configurado</li>
                    <li>Manutenção preventiva e corretiva</li>
                    <li>Peças e suprimentos originais Ricoh</li>
                    <li>Suporte técnico com SLA de 24 a 48 horas</li>
                    <li>Franquia de páginas dimensionada para o seu volume</li>
                    <li>Possibilidade de upgrade durante a vigência do contrato</li>
                </ul>
                <p>${escapar(conteudo.notaLocacao)}</p>
            </div>
        </section>

        <section class="section section-alt">
            <div class="container">
                <h2>Perguntas frequentes sobre a ${escapar(modelo.nome)}</h2>
                <div class="faq-grid">
${blocoFaq(conteudo)}
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container">
                <h2>Modelos relacionados</h2>
${blocoRelacionados(conteudo)}
                <p><a href="/impressoras.html">Ver a comparação completa dos seis modelos</a></p>
            </div>
        </section>

        <section class="section section-alt">
            <div class="container">
                <div class="cta-bloco">
                    <h2>Quer um orçamento da ${escapar(modelo.nome)}?</h2>
                    <p>Fale com a gente pelo WhatsApp. Analisamos seu volume e seu tipo de trabalho antes de indicar venda ou locação.</p>
                    <a href="${zap}" class="btn-cta-interna" target="_blank" rel="noopener noreferrer" data-origem="pagina_modelo" data-modelo="${escapar(modelo.nome)}">Solicitar orçamento no WhatsApp</a>
                </div>
            </div>
        </section>
    </main>

${T.montarFooter({ zapTexto: 'Olá! Gostaria de um orçamento para a ' + modelo.nome + '.', modelo: modelo.nome })}

${T.montarScripts()}
</body>
</html>
`;
}

// ===================================
// HUB COMPARATIVO (impressoras.html)
// ===================================
// A URL antiga é preservada, mas o conteúdo muda de papel: as fichas
// detalhadas passam a viver em /impressoras/<modelo>.html e esta página
// vira o comparativo que leva a elas. Repetir as specs aqui recriaria o
// problema de conteúdo duplicado que estamos justamente desfazendo.

// Busca uma spec pelo rótulo, opcionalmente restrita a um grupo.
// Devolve null quando o dado não existe — nunca um valor inventado.
function spec(modelo, rotulo, grupoParcial) {
    for (let i = 0; i < modelo.grupos.length; i++) {
        const grupo = modelo.grupos[i];
        if (grupoParcial && grupo.titulo.toLowerCase().indexOf(grupoParcial.toLowerCase()) === -1) continue;
        for (let j = 0; j < grupo.linhas.length; j++) {
            if (grupo.linhas[j].rotulo.toLowerCase() === rotulo.toLowerCase()) {
                return grupo.linhas[j].valor || null;
            }
        }
    }
    return null;
}

function celula(valor) {
    return valor === null
        ? '<td class="sem-dado">Não informado</td>'
        : '<td>' + escapar(valor) + '</td>';
}

function linhaComparativa(modelo) {
    const conteudo = CONTEUDO[modelo.id];
    const velocidade = spec(modelo, 'Cores', 'Velocidade') || spec(modelo, 'Preto e Branco', 'Velocidade');
    const ehMono = spec(modelo, 'Cores', 'Velocidade') === null;

    return '                        <tr>\n' +
        '                            <th scope="row"><a href="/impressoras/' + conteudo.slug + '.html">' + escapar(modelo.nome) + '</a></th>\n' +
        '                            <td>' + escapar(modelo.categoria) + '</td>\n' +
        '                            <td>' + (ehMono ? 'Monocromática' : 'Colorida') + '</td>\n' +
        '                            ' + celula(velocidade) + '\n' +
        '                            ' + celula(spec(modelo, 'Volume mensal')) + '\n' +
        '                            ' + celula(spec(modelo, 'Tamanhos')) + '\n' +
        '                            ' + celula(spec(modelo, 'Gramatura')) + '\n' +
        '                        </tr>';
}

function montarHub() {
    const linhas = modelos.map(linhaComparativa).join('\n');

    // Levanta todas as lacunas da tabela, não só uma coluna: qualquer célula
    // "Não informado" precisa virar pendência para o cliente confirmar.
    const lacunas = [];
    modelos.forEach(function (m) {
        [['Volume mensal', 'Volume mensal'], ['Tamanhos', 'Formato'], ['Gramatura', 'Gramatura']]
            .forEach(function (par) {
                if (spec(m, par[0]) === null) lacunas.push(m.nome + ' (' + par[1] + ')');
            });
    });

    const avisoSemDado = lacunas.length > 0
        ? '                <p class="tabela-nota">Onde consta “Não informado”, o dado não está declarado na ficha técnica de origem. ' +
          'Consulte-nos para o valor oficial.</p>\n' +
          '                <!-- TODO: confirmar com o cliente — dados ausentes na ficha de origem: ' +
          lacunas.join('; ') + ' -->'
        : '';

    const cartoes = modelos.map(function (modelo) {
        const conteudo = CONTEUDO[modelo.id];
        return '                    <a class="relacionado-card" href="/impressoras/' + conteudo.slug + '.html">\n' +
            '                        <strong>' + escapar(modelo.nome) + '</strong>\n' +
            '                        <span>' + escapar(modelo.categoria) + ' — ' + escapar(modelo.destaques[0]) + '</span>\n' +
            '                    </a>';
    }).join('\n');

    const zapGeral = T.linkWhatsApp('Olá! Gostaria de mais informações sobre as impressoras Ricoh.');
    const descricaoHub = 'Compare os 6 modelos de impressora Ricoh lado a lado: velocidade, volume mensal, formato e gramatura. Escolha o equipamento certo e peça um orçamento.';

    const trilhaHub = [
        { nome: 'Início', url: '/' },
        { nome: 'Impressoras', url: '/impressoras.html' }
    ];

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${T.montarHead({
        titulo: 'Impressoras Ricoh Pro | Comparativo dos 6 Modelos | Brücker Printers',
        descricao: descricaoHub,
        url: SITE + '/impressoras.html',
        ogTitulo: 'Impressoras Ricoh Pro | Comparativo dos 6 Modelos',
        jsonLd: [
            T.jsonLdBreadcrumb(trilhaHub),
            // ItemList aponta para as páginas de cada modelo. O detalhe de
            // Product fica lá, não aqui — repetir criaria duas descrições
            // concorrentes do mesmo produto.
            {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Impressoras Ricoh para produção gráfica',
                itemListElement: modelos.map(function (m, i) {
                    return {
                        '@type': 'ListItem',
                        position: i + 1,
                        name: m.nome,
                        url: SITE + '/impressoras/' + CONTEUDO[m.id].slug + '.html'
                    };
                })
            }
        ]
    })}
</head>
<body>
${T.montarHeader({ zap: zapGeral, ativo: 'impressoras' })}

    <main>
        <div class="pagina-topo">
            <div class="container">
${T.montarBreadcrumb(trilhaHub)}
                <h1>Impressoras Ricoh para produção gráfica</h1>
                <p class="pagina-resumo">Seis modelos, de uma multifuncional de escritório a um equipamento de 1 milhão de páginas por mês. Compare lado a lado e abra a ficha técnica completa do que fizer sentido para a sua operação.</p>
            </div>
        </div>

        <section class="section">
            <div class="container">
                <h2>Comparativo dos seis modelos</h2>
                <p>A escolha costuma se resolver em duas perguntas: qual o seu volume mensal e qual o papel mais pesado que você precisa imprimir. A tabela abaixo responde as duas.</p>
                <div class="tabela-wrapper">
                    <table class="tabela-comparativa">
                        <caption>Comparativo técnico das impressoras Ricoh — Brücker Printers</caption>
                        <thead>
                            <tr>
                                <th scope="col">Modelo</th>
                                <th scope="col">Categoria</th>
                                <th scope="col">Cor</th>
                                <th scope="col">Velocidade</th>
                                <th scope="col">Volume mensal</th>
                                <th scope="col">Formato</th>
                                <th scope="col">Gramatura</th>
                            </tr>
                        </thead>
                        <tbody>
${linhas}
                        </tbody>
                    </table>
                </div>
${avisoSemDado}
            </div>
        </section>

        <section class="section section-alt">
            <div class="container">
                <h2>Ficha técnica de cada modelo</h2>
                <p>Cada página traz as especificações completas, para qual operação o equipamento é indicado e o que está incluso no contrato de locação.</p>
                <div class="relacionados-grid">
${cartoes}
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container conteudo-texto">
                <h2>Como escolher entre os modelos</h2>
                <p><strong>Pelo volume.</strong> É o critério que elimina mais opções de uma vez. Até 50.000 páginas por mês, a MP C2004 resolve. Entre 100.000 e 500.000, a Pro C5300. Acima disso, C7200 e C9200. Se o volume é alto mas sem cor, a Pro 8300 imprime 1,5 milhão de páginas mensais e sai mais barato por página que qualquer colorida.</p>
                <p><strong>Pelo papel.</strong> A gramatura máxima varia de 220 g/m² na MP C2004 a 470 g/m² na Pro C9200. Se você imprime embalagem ou capa dura, esse número decide antes de qualquer outro.</p>
                <p><strong>Pelo formato.</strong> Todos os modelos de produção chegam a SRA3. Só a C9200 vai além, com SRA3+ de 330 x 660 mm e banner de até 1,3 m.</p>
                <p><strong>Pela cor.</strong> Se você imprime material de marca com cor especificada em Pantone, a C7200 é a única que declara cobertura de gamut: 95%. Se precisa de branco, verniz ou fluorescente, C5300 e C9200 têm estações de cor especial.</p>
                <p>Na dúvida, fale com a gente. Analisamos seu volume de impressão e suas necessidades técnicas antes de recomendar — inclusive para dizer que o equipamento menor já resolve.</p>
            </div>
        </section>

        <section class="section section-alt">
            <div class="container">
                <div class="cta-bloco">
                    <h2>Não sabe qual modelo atende sua operação?</h2>
                    <p>Conte o que você imprime e em que volume. A gente indica o equipamento certo e diz se compensa mais comprar ou locar.</p>
                    <a href="${zapGeral}" class="btn-cta-interna" target="_blank" rel="noopener noreferrer" data-origem="secao_contato">Falar no WhatsApp</a>
                </div>
            </div>
        </section>
    </main>

${T.montarFooter()}

${T.montarScripts()}
</body>
</html>
`;
}

// ===================================
// EXECUÇÃO
// ===================================

if (!fs.existsSync(DESTINO)) fs.mkdirSync(DESTINO, { recursive: true });

let gerados = 0;

modelos.forEach(function (modelo) {
    const conteudo = CONTEUDO[modelo.id];
    if (!conteudo) {
        console.error('  ERRO      sem conteúdo editorial para o modelo "' + modelo.id + '"');
        process.exitCode = 1;
        return;
    }

    const arquivo = path.join(DESTINO, conteudo.slug + '.html');
    // Páginas em /impressoras/: um nível abaixo da raiz.
    fs.writeFileSync(arquivo, T.aplicarBase(montarPagina(modelo, conteudo), '../'), 'utf8');

    const palavras = montarPagina(modelo, conteudo).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    console.log('  gerado    impressoras/' + conteudo.slug + '.html  (' + palavras + ' palavras, ' +
        modelo.grupos.reduce(function (s, g) { return s + g.linhas.length; }, 0) + ' specs)');
    gerados += 1;
});

// O hub reaproveita a URL antiga e passa a apontar para as páginas acima.
// Fica na raiz, então não leva prefixo.
fs.writeFileSync(path.join(RAIZ, 'impressoras.html'), T.aplicarBase(montarHub(), ''), 'utf8');
console.log('  gerado    impressoras.html  (hub comparativo dos ' + modelos.length + ' modelos)');

console.log('\n' + gerados + ' página(s) de modelo + hub gerados.');
