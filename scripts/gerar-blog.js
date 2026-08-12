#!/usr/bin/env node
'use strict';

// ===================================
// GERADOR DO BLOG
// ===================================
// Uso: node scripts/gerar-blog.js
//
// Gera /blog/index.html e um arquivo por artigo em /blog/.
//
// O risco deste bloco é escrever artigos que repetem as páginas de serviço.
// A separação adotada:
//
//   PÁGINA DE SERVIÇO  argumenta por que contratar. É comercial.
//   ARTIGO             ensina a decidir, inclusive contra contratar. É método.
//
// Por isso os artigos trazem fórmula, checklist e critério — não argumento de
// venda. scripts/verificar-seo.js recusa parágrafos repetidos entre páginas,
// então a separação é conferida a cada geração.
//
// Números concretos (preço de toner, valor de mensalidade, custo por página)
// não existem no site e não podem ser estimados: onde entrariam, há TODO.

const fs = require('fs');
const path = require('path');
const T = require('./template');

const RAIZ = path.resolve(__dirname, '..');
const DESTINO = path.join(RAIZ, 'blog');
const esc = T.escapar;

// Data de publicação dos três primeiros artigos.
const PUBLICACAO = '2026-08-12';
const PUBLICACAO_LEGIVEL = '12 de agosto de 2026';

// ===================================
// ARTIGOS
// ===================================

const ARTIGOS = [

// -----------------------------------------------------------------------
{
    slug: 'locacao-ou-compra-impressora-de-producao',
    titulo: 'Locação ou Compra de Impressora de Produção: Como Decidir | Brücker Printers',
    h1: 'Locação ou compra de impressora de produção: como decidir',
    descricao: 'Um método para comparar locação e compra de impressora de produção: os quatro custos do TCO, cinco perguntas que decidem e o erro mais comum na conta.',
    resumo: 'A resposta certa depende de quatro custos que quase nunca aparecem na proposta e de cinco perguntas sobre a sua operação. Este artigo mostra como montar a comparação.',
    // O excerto do índice é escrito à parte do resumo: repetir o mesmo texto
    // em duas URLs é conteúdo duplicado, mesmo dentro do próprio site.
    excerto: 'Multiplicar a mensalidade pelos meses e comparar com o preço à vista é a conta que quase todo mundo faz — e ela está errada em três pontos. Veja o método completo.',
    ctaTitulo: 'Quer montar essa comparação para o seu caso?',
    ctaTexto: 'Levantamos os quatro custos com você, com os números da sua operação, e apresentamos as duas propostas lado a lado.',
    zapTexto: 'Olá! Li o artigo sobre locação ou compra e gostaria de avaliar meu caso.',
    secoes: [
        {
            id: 'nao-existe-resposta-universal',
            h2: 'Por que não existe uma resposta universal',
            p: [
                'Procure "vale mais a pena comprar ou alugar impressora" e você vai encontrar duas respostas categóricas, geralmente escritas por quem vende uma das duas modalidades. Nenhuma das duas serve, porque a conta muda conforme quatro variáveis da sua operação — e essas variáveis não estão no catálogo.',
                'Este artigo não conclui por você. Ele monta a comparação que você precisa fazer, com as variáveis que costumam ficar de fora.'
            ]
        },
        {
            id: 'quatro-custos-tco',
            h2: 'Os quatro custos que compõem o TCO',
            p: [
                'TCO significa custo total de propriedade: tudo que o equipamento custa da assinatura do contrato até a saída dele da sua operação. A maioria das comparações olha só o primeiro dos quatro componentes.'
            ],
            h3: [
                {
                    titulo: '1. Custo de aquisição ou mensalidade',
                    p: [
                        'Na compra, é o valor do equipamento. Na locação, é a soma das mensalidades ao longo do contrato. É o único número que aparece nas duas propostas, e por isso é o único que costuma ser comparado — o que já invalida a maior parte das comparações.'
                    ]
                },
                {
                    titulo: '2. Custo de manutenção e peças',
                    p: [
                        'Na locação, está embutido na mensalidade e é zero como despesa adicional. Na compra, é uma variável: baixo durante a garantia, crescente depois. Peça de desgaste em equipamento de produção não é evento raro — é item de rotina numa máquina que roda centenas de milhares de páginas por mês.',
                        'Para estimar, você precisa de dois dados que o fornecedor deve informar: a lista de peças de desgaste com a vida útil de cada uma, e o preço delas.'
                    ]
                },
                {
                    titulo: '3. Custo do capital imobilizado',
                    p: [
                        'É o item que quase nunca entra na conta. O dinheiro usado na compra deixa de estar disponível para outra coisa — capital de giro, uma segunda máquina, uma dívida mais cara que poderia ser quitada.',
                        'Isso não torna a compra errada. Só significa que comparar o preço à vista com a mensalidade, sem considerar o que o capital renderia ou economizaria em outro lugar, favorece artificialmente a compra.'
                    ]
                },
                {
                    titulo: '4. Custo da indisponibilidade',
                    p: [
                        'Quanto custa um dia de máquina parada na sua operação? Esse número raramente está calculado, e é o que costuma inverter a decisão quando aparece.',
                        'Ele depende de quanto você fatura por dia com aquele equipamento, de existir ou não uma segunda máquina que absorva a produção, e de quanto tempo leva entre o chamado e o técnico na frente da máquina. Um SLA contratual de 24 a 48 horas transforma esse risco em número conhecido; sem contrato, ele é indefinido.'
                    ]
                }
            ]
        },
        {
            id: 'erro-mais-comum',
            h2: 'O erro mais comum: comparar mensalidade com preço à vista',
            p: [
                'A comparação que aparece com mais frequência é esta: multiplica-se a mensalidade pelos meses do contrato e compara-se com o preço de compra. Quando o total da locação passa o preço à vista, conclui-se que comprar é melhor.',
                'A conta está incompleta em três pontos. Primeiro, ela põe do lado da locação custos que na compra existem mas não foram somados — manutenção, peças e suprimentos. Segundo, ignora o valor do capital ao longo do período. Terceiro, atribui ao equipamento comprado um valor residual que só se realiza se ele for efetivamente vendido, pelo preço estimado, no fim do período.',
                'A comparação correta soma os quatro componentes dos dois lados, no mesmo horizonte de tempo.'
            ]
        },
        {
            id: 'cinco-perguntas',
            h2: 'Cinco perguntas que decidem',
            p: [
                'Antes de qualquer planilha, responda estas cinco. Elas costumam resolver a decisão sem que a conta precise ser fechada:'
            ],
            lista: [
                '<strong>Seu volume mensal é estável?</strong> Se oscila muito entre meses, uma franquia de páginas dimensionada corretamente absorve a variação melhor que um ativo comprado para o pico.',
                '<strong>Você consegue prever seu volume daqui a três anos?</strong> Se a resposta é não, comprar significa apostar. A locação permite trocar de modelo dentro do contrato.',
                '<strong>Quanto custa um dia parado?</strong> Se o número for alto, o SLA contratual vale mais que a posse do equipamento.',
                '<strong>Existe equipe técnica interna?</strong> Sem ela, todo chamado é serviço contratado, e o custo de manutenção da compra sobe.',
                '<strong>O capital tem uso alternativo?</strong> Se o dinheiro da compra resolveria outro gargalo do negócio, o custo de imobilizá-lo é real, mesmo sem aparecer em lugar nenhum.'
            ]
        },
        {
            id: 'quando-cada-um-vence',
            h2: 'Quando cada modelo tende a vencer',
            p: [
                'Com os quatro custos somados e as cinco perguntas respondidas, o padrão que costuma aparecer é este.',
                '<strong>A compra tende a vencer</strong> quando o volume é estável e previsível por vários anos, existe equipe técnica ou contrato de manutenção já estabelecido, o equipamento vai operar bem abaixo do teto de volume — o que prolonga a vida útil e adia as trocas de peça — e o capital não tem uso alternativo melhor.',
                '<strong>A locação tende a vencer</strong> quando o volume cresce ou oscila, quando o custo de indisponibilidade é alto, quando não há equipe técnica interna, ou quando a tecnologia do equipamento tende a mudar dentro do horizonte de uso — caso de operações que dependem de cores especiais ou automação de cor.',
                'Se você quer os detalhes contratuais de cada modalidade, eles estão nas páginas de <a href="/locacao-de-impressoras-ricoh.html">locação</a> e de <a href="/venda-de-impressoras-ricoh.html">venda</a>. Este artigo é sobre o método; aquelas são sobre as condições.'
            ],
            todo: 'valores de referência para exemplo numérico — preço de equipamento, mensalidade típica e custo de peças de desgaste não constam no site'
        },
        {
            id: 'proximo-passo',
            h2: 'O próximo passo',
            p: [
                'Se o volume é a variável que você ainda não tem medida, comece por aí: o <a href="/blog/como-calcular-custo-por-pagina-em-grafica-rapida.html">cálculo do custo por página</a> exige o mesmo levantamento e entrega um número que serve tanto para esta decisão quanto para orçar trabalhos.',
                'E se a dúvida ainda é qual equipamento, e não qual modalidade, o <a href="/impressoras.html">comparativo dos seis modelos</a> parte de volume e gramatura — os dois critérios que eliminam mais opções de uma vez.'
            ]
        }
    ]
},

// -----------------------------------------------------------------------
{
    slug: 'como-calcular-custo-por-pagina-em-grafica-rapida',
    titulo: 'Como Calcular o Custo por Página em uma Gráfica Rápida | Brücker Printers',
    h1: 'Como calcular o custo por página em uma gráfica rápida',
    descricao: 'Metodologia completa para calcular custo por página numa gráfica: as seis variáveis, a fórmula, os erros mais comuns e como usar o número para orçar.',
    resumo: 'Quase toda gráfica calcula custo por página só com o toner — e por isso orça no escuro. Este artigo mostra as seis variáveis que entram na conta e como montar o número.',
    excerto: 'O rendimento declarado no catálogo pressupõe 5% de cobertura por cor. Seu folder colorido tem 40%. Este é só o primeiro dos quatro erros que distorcem a conta.',
    ctaTitulo: 'Quer ajuda para levantar esses números?',
    ctaTexto: 'O diagnóstico do parque cobre volume real por setor, consumo de suprimentos e taxa de refugo — as variáveis que a maioria das operações não tem medidas.',
    zapTexto: 'Olá! Li o artigo sobre custo por página e gostaria de uma análise da minha operação.',
    secoes: [
        {
            id: 'por-que-quase-ninguem-calcula-certo',
            h2: 'Por que quase ninguém calcula certo',
            p: [
                'Pergunte a um dono de gráfica rápida quanto custa a página impressa e a resposta virá rápido: o preço do toner dividido pelo rendimento declarado. É a conta que dá para fazer de cabeça, e é justamente por isso que ela é a mais usada.',
                'O problema é que ela responde outra pergunta. Ela informa o custo do consumível, não o custo da página. A diferença entre os dois números costuma ser grande o suficiente para transformar um trabalho lucrativo em prejuízo, especialmente em tiragem longa, onde o erro se multiplica.'
            ]
        },
        {
            id: 'seis-variaveis',
            h2: 'As seis variáveis da conta',
            p: [
                'Um custo por página completo tem seis componentes. Os dois primeiros quase sempre entram; os quatro seguintes quase nunca.'
            ],
            h3: [
                {
                    titulo: '1. Consumível',
                    p: [
                        'Toner, revelador e demais insumos de imagem. O cálculo direto é o preço do item dividido pelo rendimento em páginas.',
                        'A armadilha está no rendimento declarado: ele pressupõe uma cobertura de página padrão, normalmente 5% por cor. Trabalho gráfico real raramente tem 5% de cobertura — um folder colorido chega fácil a 40%. Se você usa o rendimento de catálogo sem ajustar pela sua cobertura média, o custo real pode ser várias vezes o calculado.'
                    ]
                },
                {
                    titulo: '2. Equipamento',
                    p: [
                        'Se locado, é a mensalidade dividida pelo volume mensal. Se comprado, é a depreciação: valor de aquisição menos valor residual estimado, dividido pelo total de páginas previsto para a vida útil.',
                        'Note que na compra esse componente cai conforme você imprime mais — o custo fixo se dilui. Na locação, ele é constante por página dentro da franquia. É por isso que operações com volume muito acima do previsto tendem a se beneficiar da compra, e o contrário na locação.'
                    ]
                },
                {
                    titulo: '3. Manutenção e peças de desgaste',
                    p: [
                        'Cilindros, fusores, correias, rolos de alimentação. Cada item tem vida útil declarada em páginas, o que permite calcular a contribuição por página: preço da peça dividido pela vida útil dela.',
                        'Some todas as peças de desgaste do equipamento. Em contrato de locação com manutenção inclusa, este componente já está dentro da mensalidade e não deve ser somado duas vezes.'
                    ]
                },
                {
                    titulo: '4. Papel',
                    p: [
                        'Entra ou não conforme o que você está calculando. Para comparar equipamentos, deixe fora — o papel é o mesmo nos dois. Para orçar um trabalho, entra obrigatoriamente, e com o desperdício incluído: as folhas de acerto de cor no começo da tiragem são papel comprado que não vira produto.'
                    ]
                },
                {
                    titulo: '5. Refugo',
                    p: [
                        'Toda tiragem produz páginas descartadas: acerto de cor, atolamento, erro de imposição, reimpressão por reclamação. Esse percentual é medível e costuma ficar entre valores que só a sua operação conhece.',
                        'O refugo consome consumível, peça e papel sem gerar receita. Ignorá-lo subestima o custo real de forma proporcional à sua taxa de erro — quanto pior a operação, maior o erro na conta.'
                    ]
                },
                {
                    titulo: '6. Energia e ocupação',
                    p: [
                        'Componentes menores, mas não nulos em equipamento de produção rodando em turno. Se o objetivo é comparar dois equipamentos com consumo declarado muito diferente, vale incluir. Se é orçar um trabalho, costuma ser desprezível diante dos demais.'
                    ]
                }
            ]
        },
        {
            id: 'a-formula',
            h2: 'A fórmula',
            p: [
                'Reunindo os componentes, o custo por página fica:',
                '<strong>Custo por página = (consumível ÷ rendimento ajustado) + (mensalidade ou depreciação ÷ volume) + (soma das peças ÷ vida útil de cada uma) + papel + energia</strong>, tudo dividido por <strong>(1 − taxa de refugo)</strong>.',
                'A divisão pela taxa de refugo no fim é o passo que mais gente esquece. Ela existe porque, se 5% da produção é descartada, cada página boa precisa absorver o custo das páginas perdidas. Somar o refugo como parcela adicional dá um número menor que o correto.'
            ],
            todo: 'valores de referência para um exemplo numérico completo — preço de toner, rendimento real por cobertura, vida útil e preço das peças de desgaste não constam no site'
        },
        {
            id: 'erros-comuns',
            h2: 'Quatro erros que distorcem o resultado',
            lista: [
                '<strong>Usar o rendimento de catálogo sem ajustar a cobertura.</strong> É o erro de maior impacto. Meça a cobertura média dos seus trabalhos e ajuste o rendimento proporcionalmente.',
                '<strong>Somar manutenção num equipamento locado com manutenção inclusa.</strong> Duplica um custo que já está na mensalidade.',
                '<strong>Calcular sobre o volume que o equipamento aguenta, não sobre o que você imprime.</strong> Dilui o custo fixo por um número que não acontece, e o resultado fica artificialmente baixo.',
                '<strong>Ignorar a diferença entre página e clique.</strong> Frente e verso pode contar como uma página ou como dois cliques, conforme o contrato. Confirme antes de comparar propostas.'
            ]
        },
        {
            id: 'usando-o-numero',
            h2: 'Como usar o número depois de calculado',
            p: [
                'Com o custo por página real em mãos, três coisas mudam na operação.',
                'Você passa a orçar sem margem de segurança arbitrária. A margem que hoje protege contra o desconhecido pode virar competitividade ou lucro, conforme a decisão for sua.',
                'Você consegue comparar equipamentos de verdade. Uma máquina mais cara com custo por página menor se paga a partir de um volume que agora dá para calcular — e você descobre se o seu volume chega lá.',
                'E você identifica trabalhos que dão prejuízo. Tiragem curta com muita cobertura costuma ser o caso: o custo de acerto se dilui em poucas páginas e o consumível é alto. Sem o número, esses trabalhos passam despercebidos.',
                'Se o levantamento revelar que o equipamento atual não é adequado ao seu perfil, o <a href="/impressoras.html">comparativo dos modelos</a> organiza as opções por volume e gramatura. Se a dúvida for sobre a modalidade de contratação, veja <a href="/blog/locacao-ou-compra-impressora-de-producao.html">locação ou compra</a>.'
            ]
        }
    ]
},

// -----------------------------------------------------------------------
{
    slug: 'impressora-de-producao-colorida-o-que-avaliar',
    titulo: 'Impressora de Produção Colorida: O Que Avaliar Antes de Contratar | Brücker Printers',
    h1: 'Impressora de produção colorida: o que avaliar antes de contratar',
    descricao: 'Sete critérios técnicos para escolher uma impressora de produção colorida: volume, gramatura, formato, acabamento, gamut de cor, automação e SLA.',
    resumo: 'Sete critérios, na ordem em que eliminam mais opções. Volume e gramatura resolvem a maior parte da decisão antes de você chegar a falar de velocidade.',
    excerto: 'A conversa quase sempre começa pela velocidade, que é o critério que menos elimina opções. Comece pelo volume e pela gramatura — e leve um checklist de sete itens.',
    ctaTitulo: 'Já tem os sete números do checklist?',
    ctaTexto: 'Com eles em mãos, conseguimos recomendar o equipamento certo — inclusive dizer que o modelo menor já resolve, quando for o caso.',
    zapTexto: 'Olá! Li o artigo sobre o que avaliar numa impressora de produção e quero uma recomendação.',
    secoes: [
        {
            id: 'ordem-importa',
            h2: 'A ordem em que você avalia importa',
            p: [
                'A conversa sobre impressora de produção quase sempre começa pela velocidade, porque é o número que aparece maior no material do fabricante. É também o critério que menos elimina opções — todos os equipamentos de produção são rápidos o bastante para a maioria das operações.',
                'Os critérios abaixo estão na ordem em que reduzem a lista mais rápido. Seguindo essa ordem, a escolha costuma se resolver nos dois primeiros.'
            ]
        },
        {
            id: 'volume-mensal',
            h2: '1. Volume mensal: o número que elimina mais opções',
            p: [
                'Volume mensal declarado é quanto o equipamento suporta imprimir por mês de forma sustentada, sem comprometer a vida útil dos componentes. Não é um pico ocasional, e não é uma meta a atingir.',
                'O erro clássico é escolher pelo teto: contratar uma máquina de 1 milhão de páginas para imprimir 80 mil. O custo fixo se dilui mal e você paga por capacidade ociosa. O erro oposto é pior: operar constantemente no teto encurta a vida das peças e aumenta a frequência de parada.',
                'A referência prática é escolher um equipamento cujo volume declarado acomode seu volume real com folga confortável para crescimento, sem que a folga vire ociosidade permanente.',
                'Na linha que trabalhamos, a faixa vai de 50 mil páginas mensais na <a href="/impressoras/ricoh-mp-c2004.html">MP C2004</a> a 1 milhão na <a href="/impressoras/ricoh-pro-c9200.html">Pro C9200</a>, passando por 500 mil na <a href="/impressoras/ricoh-pro-c5300.html">Pro C5300</a> e 750 mil na <a href="/impressoras/ricoh-pro-c7200.html">Pro C7200</a>.'
            ]
        },
        {
            id: 'gramatura',
            h2: '2. Gramatura: o critério que decide antes de todos',
            p: [
                'Se você imprime embalagem, capa dura ou cartão pesado, a gramatura máxima elimina opções antes de qualquer outro critério — e não há como contornar. Um equipamento que aceita até 300 g/m² simplesmente não imprime um cartão de 400 g/m², por mais rápido que seja.',
                'Confira dois números, não um: a gramatura máxima na bandeja principal e a gramatura máxima em impressão frente e verso automática. Eles nem sempre coincidem, e a diferença aparece justamente no trabalho que você quer produzir.',
                'Vale também verificar a gramatura mínima. Papel muito leve tem seus próprios problemas de alimentação, e operações que imprimem miolo de livro em papel fino esbarram nesse limite.'
            ]
        },
        {
            id: 'formato',
            h2: '3. Formato e banner',
            p: [
                'Praticamente todo equipamento de produção chega a SRA3. A diferença aparece acima disso.',
                'Formato maior permite impor mais peças por folha, o que reduz o custo por peça e o tempo de acabamento. Se você produz muito material pequeno — cartões, tags, convites — a diferença entre SRA3 e SRA3+ pode representar uma peça a mais por folha, e isso se acumula.',
                'Comprimento de banner é um requisito à parte, e binário: ou o equipamento faz o comprimento que você precisa, ou não faz. Verifique também se o banner suporta a gramatura que você usa, porque os dois limites costumam ser declarados separadamente.'
            ]
        },
        {
            id: 'acabamento',
            h2: '4. Acabamento inline ou offline',
            p: [
                'Acabamento inline acontece no fluxo da impressão: a folha sai grampeada, dobrada, perfurada ou encadernada sem passar por outra máquina. Offline é a etapa separada, feita depois.',
                'Inline reduz manuseio, reduz erro e reduz tempo total do trabalho. Mas encarece o equipamento e adiciona pontos de falha — um módulo de acabamento com problema pode parar a impressão inteira.',
                'A decisão depende do seu mix. Se a maior parte dos trabalhos usa o mesmo acabamento, inline compensa. Se cada trabalho pede um acabamento diferente, um equipamento mais simples com acabamento offline flexível pode servir melhor.',
                'Verifique especificamente a capacidade de grampeamento, os tipos de dobra disponíveis e se há encadernação — perfeita ou em brochura são coisas diferentes.'
            ]
        },
        {
            id: 'cor',
            h2: '5. Gamut de cor e cores especiais',
            p: [
                'Se você imprime material de marca com cor especificada, o gamut é o critério que separa aprovação na primeira prova de retrabalho. Nem todo fabricante declara cobertura de gamut; quando declara, é um dado comparável e vale pedir.',
                'Cores especiais são outra categoria. Branco permite imprimir sobre substrato escuro ou transparente. Clear aplica verniz localizado sem etapa separada. Fluorescentes ampliam o gamut para tons inatingíveis com CMYK.',
                'Cada estação de cor especial adiciona consumível, tempo de troca e complexidade. Só faz sentido se houver demanda real — não como possibilidade futura.',
                'Entre os modelos que trabalhamos, a <a href="/impressoras/ricoh-pro-c7200.html">Pro C7200</a> é a que declara cobertura de gamut, e a <a href="/impressoras/ricoh-pro-c9200.html">Pro C9200</a> é a de paleta especial mais ampla.'
            ]
        },
        {
            id: 'automacao',
            h2: '6. Automação e calibração',
            p: [
                'Equipamentos de produção derivam cor ao longo da tiragem: temperatura, umidade e desgaste alteram o resultado entre a primeira e a última folha. A pergunta é quem corrige isso.',
                'Sem automação, corrige o operador — parando a máquina, medindo e ajustando. Com scanner inline e calibração automática, o equipamento se ajusta durante a produção.',
                'O ganho aparece em duas frentes: menos refugo e menos dependência de operador experiente. Em operações de grande volume, onde o refugo tem peso real no custo por página, esse item costuma se pagar. Em volumes menores, é um custo que não retorna.'
            ]
        },
        {
            id: 'sla',
            h2: '7. SLA e disponibilidade de peças',
            p: [
                'Este é o critério que não está na ficha técnica e que costuma decidir a satisfação com o equipamento dois anos depois.',
                'Pergunte três coisas antes de assinar: qual o prazo contratual de atendimento, se as peças de desgaste são originais e onde elas ficam estocadas. Um SLA de 24 a 48 horas só significa alguma coisa se houver estrutura para cumpri-lo.',
                'Vale calcular quanto custa um dia de máquina parada na sua operação antes dessa conversa. Com o número em mãos, fica claro quanto vale a pena investir em prazo de atendimento — e a resposta costuma ser mais do que parece. As condições de <a href="/assistencia-tecnica-ricoh.html">assistência técnica</a> merecem a mesma atenção que a ficha técnica.'
            ]
        },
        {
            id: 'checklist',
            h2: 'Checklist para levar à conversa',
            p: [
                'Antes de pedir proposta, tenha estes números da sua própria operação:'
            ],
            lista: [
                'Volume mensal real dos últimos doze meses, mês a mês — e não a média',
                'Gramatura máxima e mínima que você imprime hoje, e a que gostaria de imprimir',
                'Formato dos trabalhos mais frequentes e maior formato necessário',
                'Acabamentos que você faz hoje e quais são terceirizados',
                'Se há exigência de cor de marca conferida contra referência',
                'Taxa de refugo atual, se medida',
                'Quanto custa um dia de máquina parada'
            ],
            p2: [
                'Com esses sete itens, qualquer fornecedor sério consegue recomendar o equipamento certo — inclusive dizendo que o modelo menor já resolve. Sem eles, a recomendação vira palpite.',
                'Se quiser partir do comparativo, o <a href="/impressoras.html">quadro dos seis modelos</a> organiza volume, gramatura e formato lado a lado.'
            ]
        }
    ]
}

];

// ===================================
// MONTAGEM
// ===================================

function montarSumario(artigo) {
    const itens = artigo.secoes.map(function (s) {
        return '                        <li><a href="#' + s.id + '">' + esc(s.h2) + '</a></li>';
    }).join('\n');

    return `                <nav class="sumario" aria-label="Sumário do artigo">
                    <h2>Neste artigo</h2>
                    <ol>
${itens}
                    </ol>
                </nav>`;
}

function montarSecoes(artigo) {
    return artigo.secoes.map(function (s) {
        const partes = ['                <h2 id="' + s.id + '">' + esc(s.h2) + '</h2>'];

        (s.p || []).forEach(function (p) { partes.push('                <p>' + p + '</p>'); });

        (s.h3 || []).forEach(function (sub) {
            partes.push('                <h3>' + esc(sub.titulo) + '</h3>');
            sub.p.forEach(function (p) { partes.push('                <p>' + p + '</p>'); });
        });

        if (s.lista) {
            partes.push('                <ul>');
            s.lista.forEach(function (i) { partes.push('                    <li>' + i + '</li>'); });
            partes.push('                </ul>');
        }

        (s.p2 || []).forEach(function (p) { partes.push('                <p>' + p + '</p>'); });

        if (s.todo) {
            partes.push('                <!-- TODO: confirmar com o cliente — ' + s.todo + ' -->');
        }

        return partes.join('\n');
    }).join('\n\n');
}

function montarArtigo(artigo) {
    const url = T.SITE + '/blog/' + artigo.slug + '.html';
    const zap = T.linkWhatsApp(artigo.zapTexto);

    const trilha = [
        { nome: 'Início', url: '/' },
        { nome: 'Blog', url: '/blog/' },
        { nome: artigo.h1, url: '/blog/' + artigo.slug + '.html' }
    ];

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${T.montarHead({
        titulo: artigo.titulo,
        descricao: artigo.descricao,
        url: url,
        ogTitulo: artigo.h1,
        jsonLd: [
            T.jsonLdBreadcrumb(trilha),
            T.schemaArtigo({
                // headline usa o H1, não o <title>: o title carrega o nome da
                // marca no fim, que não faz parte do título do artigo.
                titulo: artigo.h1,
                descricao: artigo.descricao,
                url: url,
                publicado: PUBLICACAO
            })
        ]
    })}
</head>
<body>
${T.montarHeader({ zap: zap })}

    <main>
        <div class="pagina-topo">
            <div class="container">
${T.montarBreadcrumb(trilha)}
                <h1>${esc(artigo.h1)}</h1>
                <p class="pagina-resumo">${esc(artigo.resumo)}</p>
                <p class="blog-meta">Publicado em <time datetime="${PUBLICACAO}">${PUBLICACAO_LEGIVEL}</time> · Brücker Printers</p>
            </div>
        </div>

        <section class="section">
            <div class="container">
                <article class="artigo-corpo">
${montarSumario(artigo)}

${montarSecoes(artigo)}
                </article>
            </div>
        </section>

        <section class="section section-alt">
            <div class="container">
${T.montarCta({
        titulo: artigo.ctaTitulo,
        texto: artigo.ctaTexto,
        zap: zap,
        origem: 'blog',
        botao: 'Falar no WhatsApp'
    })}
            </div>
        </section>

        <section class="section">
            <div class="container">
                <h2>Outros artigos</h2>
                <div class="relacionados-grid">
${ARTIGOS.filter(function (outro) { return outro.slug !== artigo.slug; }).map(function (outro) {
        return '                    <a class="relacionado-card" href="/blog/' + outro.slug + '.html">\n' +
            '                        <strong>' + esc(outro.h1) + '</strong>\n' +
            '                        <span>' + esc(outro.excerto.split('.')[0]) + '.</span>\n' +
            '                    </a>';
    }).join('\n')}
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

function montarIndice() {
    const url = T.SITE + '/blog/';
    const zap = T.linkWhatsApp('Olá! Gostaria de falar sobre impressoras Ricoh.');

    const trilha = [
        { nome: 'Início', url: '/' },
        { nome: 'Blog', url: '/blog/' }
    ];

    const cartoes = ARTIGOS.map(function (artigo) {
        return `                    <article class="blog-card">
                        <p class="blog-meta"><time datetime="${PUBLICACAO}">${PUBLICACAO_LEGIVEL}</time></p>
                        <h2><a href="/blog/${artigo.slug}.html">${esc(artigo.h1)}</a></h2>
                        <p>${esc(artigo.excerto)}</p>
                        <a class="blog-link" href="/blog/${artigo.slug}.html">Ler o artigo →</a>
                    </article>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${T.montarHead({
        titulo: 'Blog | Impressão de Produção e Gestão de Custos | Brücker Printers',
        descricao: 'Artigos sobre impressão de produção: como calcular custo por página, decidir entre locação e compra e avaliar uma impressora antes de contratar.',
        url: url,
        ogTitulo: 'Blog da Brücker Printers',
        jsonLd: [T.jsonLdBreadcrumb(trilha)]
    })}
</head>
<body>
${T.montarHeader({ zap: zap })}

    <main>
        <div class="pagina-topo">
            <div class="container">
${T.montarBreadcrumb(trilha)}
                <h1>Blog</h1>
                <p class="pagina-resumo">Método e critério para decisões de impressão de produção. Sem catálogo disfarçado de conteúdo: aqui entram fórmula, checklist e comparação.</p>
            </div>
        </div>

        <section class="section">
            <div class="container">
                <div class="blog-grid">
${cartoes}
                </div>
            </div>
        </section>

        <section class="section section-alt">
            <div class="container">
${T.montarCta({
        titulo: 'Prefere conversar direto?',
        texto: 'Conte o que você imprime e em que volume. A gente indica o caminho — inclusive quando ele não passa por trocar de equipamento.',
        zap: zap,
        origem: 'blog',
        botao: 'Falar no WhatsApp'
    })}
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

function contarPalavras(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length;
}

// Tudo em /blog/: um nível abaixo da raiz.
ARTIGOS.forEach(function (artigo) {
    const html = T.aplicarBase(montarArtigo(artigo), '../');
    fs.writeFileSync(path.join(DESTINO, artigo.slug + '.html'), html, 'utf8');
    console.log('  gerado    blog/' + artigo.slug + '.html  (' + contarPalavras(html) + ' palavras, ' + artigo.secoes.length + ' seções)');
});

const indice = T.aplicarBase(montarIndice(), '../');
fs.writeFileSync(path.join(DESTINO, 'index.html'), indice, 'utf8');
console.log('  gerado    blog/index.html  (índice com ' + ARTIGOS.length + ' artigos)');

console.log('\n' + (ARTIGOS.length + 1) + ' página(s) do blog gerada(s).');
