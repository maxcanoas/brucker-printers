#!/usr/bin/env node
'use strict';

// ===================================
// GERADOR DAS PÁGINAS DE SERVIÇO E DA PÁGINA REGIONAL
// ===================================
// Uso: node scripts/gerar-paginas-servico.js
//
// Gera na raiz:
//   locacao-de-impressoras-ricoh.html
//   venda-de-impressoras-ricoh.html
//   assistencia-tecnica-ricoh.html
//   outsourcing-de-impressao.html
//   impressoras-para-graficas-porto-alegre.html
//
// Origem do conteúdo: as seções Soluções, Vantagens, Diferenciais e FAQ do
// index.html, expandidas. Cada página parte de um ângulo diferente de
// propósito — locação fala de previsibilidade de custo, venda de patrimônio,
// assistência de disponibilidade, outsourcing de gestão. Se duas páginas
// repetirem o mesmo argumento nas mesmas palavras, o Google trata as duas
// como uma só e nenhuma rankeia.
//
// Onde não havia base no site, há TODO em vez de afirmação inventada.

const fs = require('fs');
const path = require('path');
const T = require('./template');

const RAIZ = path.resolve(__dirname, '..');
const esc = T.escapar;

// ===================================
// CONTEÚDO
// ===================================

const PAGINAS = [

// -----------------------------------------------------------------------
{
    slug: 'locacao-de-impressoras-ricoh',
    titulo: 'Locação de Impressoras Ricoh para Gráficas | Brücker Printers',
    descricao: 'Locação de impressoras Ricoh com manutenção, peças originais e franquia de páginas inclusas. Custo mensal fixo e previsível. Peça um orçamento.',
    h1: 'Locação de impressoras Ricoh',
    tipoServico: 'Locação de equipamentos de impressão',
    resumo: 'Mensalidade fixa que já inclui equipamento, manutenção, peças originais e franquia de páginas. Sem investimento inicial e sem custo de manutenção fora do orçamento.',
    zapTexto: 'Olá! Gostaria de um orçamento de locação de impressoras Ricoh.',
    secoes: [
        {
            h2: 'O problema que a locação resolve',
            paragrafos: [
                'Comprar uma impressora de produção é uma decisão de capital: um valor alto sai do caixa de uma vez, e a partir daí todo custo de manutenção é uma surpresa. Uma peça que falha no terceiro ano não estava no orçamento daquele mês — mas a conta chega assim mesmo, junto com o tempo de máquina parada.',
                'A locação inverte essa lógica. Em vez de um desembolso grande seguido de custos imprevisíveis, você tem uma mensalidade fixa que já contém tudo: o equipamento, a manutenção preventiva e corretiva, as peças originais e uma franquia de páginas dimensionada para o seu volume.',
                'Para uma gráfica, isso muda a forma de orçar. O custo por página passa a ser conhecido antes de a página ser impressa, o que permite fechar um trabalho de tiragem longa sem embutir margem de segurança para o imprevisto.'
            ]
        },
        {
            h2: 'O que está incluso no contrato',
            listaIntro: 'Todo contrato de locação da Brücker Printers contempla:',
            lista: [
                'O equipamento, instalado e configurado na sua operação',
                'Manutenção preventiva programada e corretiva sob demanda',
                'Peças e suprimentos originais Ricoh',
                'Suporte técnico com SLA de 24 a 48 horas',
                'Franquia de páginas adaptável ao volume do seu negócio',
                'Possibilidade de troca ou upgrade do equipamento durante a vigência'
            ],
            paragrafos2: [
                'A troca de equipamento é o item que costuma passar despercebido e que mais pesa a longo prazo. Se o seu volume cresce e a máquina atual vira gargalo, você sobe de modelo dentro do mesmo contrato — não precisa revender um equipamento usado por uma fração do que pagou.'
            ]
        },
        {
            h2: 'Como funciona a franquia de páginas',
            paragrafos: [
                'A franquia é o volume de páginas contratado por mês. Ela é definida a partir do que você realmente imprime, não a partir do que o equipamento aguenta imprimir — são coisas diferentes, e confundir as duas é o erro mais comum ao dimensionar um contrato.',
                'Por isso a análise de volume vem antes da proposta. Um contrato dimensionado acima do seu consumo real faz você pagar por páginas que não usa; abaixo, cria excedentes todo mês. Nenhum dos dois cenários interessa a quem vai conviver com o contrato por anos.'
            ]
        },
        {
            h2: 'Quando a locação faz sentido — e quando não faz',
            paragrafos: [
                'A locação costuma ser a escolha certa quando o volume ainda está crescendo, quando oscila entre meses, ou quando parar a produção custa mais caro que a diferença entre as duas modalidades. Também quando a empresa prefere manter o capital em giro em vez de imobilizá-lo num ativo que deprecia.',
                'Ela faz menos sentido quando o volume é baixo, estável e previsível por muitos anos, e a empresa tem capital disponível e equipe técnica própria. Nesse cenário, a compra amortiza e o custo por página cai. Se for o seu caso, vale conhecer as condições de <a href="/venda-de-impressoras-ricoh.html">venda de impressoras Ricoh</a>.'
            ]
        },
        {
            h2: 'Modelos disponíveis para locação',
            paragrafos: [
                'Toda a linha que trabalhamos pode ser locada, da multifuncional de escritório ao equipamento de produção de 1 milhão de páginas mensais. A escolha depende do seu volume e do tipo de papel que você imprime — os dois critérios que eliminam mais opções de uma vez.',
                'Veja o <a href="/impressoras.html">comparativo dos seis modelos</a> para localizar sua faixa, ou fale com a gente e a gente indica.'
            ]
        }
    ],
    faq: [
        { p: 'Qual o prazo mínimo de um contrato de locação?', r: 'Os contratos são personalizados conforme o perfil da operação. Fale com a gente para conhecer as condições aplicáveis ao seu caso.' },
        { p: 'A manutenção está mesmo inclusa na mensalidade?', r: 'Sim. Manutenção preventiva e corretiva, peças originais Ricoh e suporte técnico com SLA de 24 a 48 horas fazem parte do contrato, sem custo adicional por chamado.' },
        { p: 'Posso trocar de equipamento se meu volume aumentar?', r: 'Sim. A troca ou upgrade durante a vigência do contrato é uma das vantagens do modelo — você acompanha o crescimento sem precisar revender o equipamento atual.' },
        { p: 'O que acontece se eu ultrapassar a franquia de páginas?', r: 'A franquia é dimensionada a partir do seu volume real justamente para que isso não seja rotina. As condições de excedente constam do contrato e são apresentadas na proposta.' },
        { p: 'A locação cobre impressoras que já tenho?', r: 'Não. Para equipamentos Ricoh que já são seus, o serviço indicado é o contrato de <a href="/assistencia-tecnica-ricoh.html">assistência técnica</a>.' }
    ],
    cta: { titulo: 'Quer saber quanto ficaria a mensalidade?', texto: 'Conte quantas páginas você imprime por mês e que tipo de trabalho produz. A gente dimensiona a franquia e apresenta a proposta.' },
    relacionadas: ['venda-de-impressoras-ricoh', 'assistencia-tecnica-ricoh', 'outsourcing-de-impressao']
},

// -----------------------------------------------------------------------
{
    slug: 'venda-de-impressoras-ricoh',
    titulo: 'Venda de Impressoras Ricoh Novas e Seminovas | Brücker Printers',
    descricao: 'Venda de impressoras Ricoh novas e seminovas para gráficas e empresas, com garantia estendida disponível. Solicite um orçamento sem compromisso.',
    h1: 'Venda de impressoras Ricoh',
    tipoServico: 'Venda de equipamentos de impressão',
    resumo: 'Equipamentos novos e seminovos para quem prefere ter a impressora como ativo próprio, com garantia estendida disponível e suporte técnico depois da entrega.',
    zapTexto: 'Olá! Gostaria de um orçamento de compra de impressoras Ricoh.',
    secoes: [
        {
            h2: 'Comprar significa ter o ativo',
            paragrafos: [
                'Na compra, o equipamento entra no patrimônio da empresa. Depois de amortizado, o custo por página cai para o valor do consumível e da manutenção — sem mensalidade. Para uma operação com volume estável e horizonte longo, essa é a conta que fecha melhor.',
                'É também a modalidade de quem quer autonomia total: nenhuma franquia de páginas a respeitar, nenhuma cláusula sobre o que pode ou não ser impresso, e liberdade para revender o equipamento quando quiser.'
            ]
        },
        {
            h2: 'Novos e seminovos',
            paragrafos: [
                'Trabalhamos com as duas categorias. O equipamento novo é a escolha natural para quem vai operar no limite da capacidade e precisa de vida útil máxima pela frente.',
                'O seminovo abre uma possibilidade que costuma ser ignorada: colocar um equipamento de faixa superior na operação pelo valor de um novo de faixa inferior. Uma gráfica que precisa de 400 g/m² de gramatura e não tem orçamento para uma C7200 nova pode chegar ao mesmo resultado técnico com uma unidade seminova.'
            ],
            todo: 'condições de garantia dos equipamentos seminovos — prazo, cobertura e critérios de seleção não constam no site'
        },
        {
            h2: 'O que vem depois da compra',
            paragrafos: [
                'Vender o equipamento e desaparecer não é o modelo. A mesma equipe técnica que atende os contratos de locação atende quem comprou, com peças originais Ricoh e o mesmo SLA de 24 a 48 horas.',
                'A diferença é contratual: em vez de estar embutido na mensalidade, o suporte pode ser contratado como <a href="/assistencia-tecnica-ricoh.html">contrato de assistência técnica</a> ou acionado por chamado. A garantia estendida também está disponível na compra, cobrindo o período em que a máquina ainda está se pagando.'
            ]
        },
        {
            h2: 'Quando a compra é a decisão certa',
            listaIntro: 'A compra tende a ser vantajosa quando:',
            lista: [
                'O volume de impressão é estável e previsível por vários anos',
                'A empresa tem capital disponível e prefere imobilizar a manter mensalidade',
                'Existe equipe técnica interna ou contrato de manutenção já estabelecido',
                'O equipamento será usado bem abaixo do teto de volume, prolongando a vida útil',
                'Há interesse em depreciação do ativo no planejamento contábil'
            ],
            paragrafos2: [
                'Se algum desses pontos não se aplica ao seu caso, vale comparar com as condições de <a href="/locacao-de-impressoras-ricoh.html">locação</a> antes de decidir. A conta muda bastante conforme o cenário.'
            ]
        },
        {
            h2: 'Que equipamentos vendemos',
            paragrafos: [
                'A linha Ricoh Pro de produção gráfica e a multifuncional MP C2004 para escritório. São seis modelos, cobrindo de 20 a 115 páginas por minuto e de 220 a 470 g/m² de gramatura.',
                'Antes de indicar qualquer um, analisamos volume de impressão, tipo de trabalho e necessidade de acabamento. O <a href="/impressoras.html">comparativo dos seis modelos</a> ajuda a localizar sua faixa.'
            ]
        }
    ],
    faq: [
        { p: 'Vocês vendem impressoras Ricoh seminovas?', r: 'Sim, trabalhamos com equipamentos novos e seminovos. O seminovo costuma permitir acesso a um modelo de faixa superior pelo valor de um novo de faixa inferior.' },
        { p: 'A compra tem garantia?', r: 'Sim, com garantia estendida disponível. As condições variam conforme o equipamento e são detalhadas na proposta.' },
        { p: 'Depois de comprar, quem faz a manutenção?', r: 'Nossa equipe técnica atende tanto quem loca quanto quem compra, com peças originais Ricoh. O suporte pode ser contratado como contrato de assistência técnica ou acionado por chamado.' },
        { p: 'Compensa mais comprar ou locar?', r: 'Depende de três coisas: estabilidade do seu volume, disponibilidade de capital e quanto custa ficar com a produção parada. Analisamos seu caso antes de recomendar qualquer uma das duas.' }
    ],
    cta: { titulo: 'Quer um orçamento de compra?', texto: 'Diga qual modelo interessa ou descreva sua operação. Indicamos o equipamento certo e apresentamos as condições de novo e seminovo.' },
    relacionadas: ['locacao-de-impressoras-ricoh', 'assistencia-tecnica-ricoh', 'impressoras-para-graficas-porto-alegre']
},

// -----------------------------------------------------------------------
{
    slug: 'assistencia-tecnica-ricoh',
    titulo: 'Assistência Técnica Ricoh com SLA Garantido | Brücker Printers',
    descricao: 'Assistência técnica para impressoras Ricoh com SLA de 24 a 48 horas, peças originais e equipe certificada. Para quem já tem equipamento Ricoh.',
    h1: 'Assistência técnica Ricoh',
    tipoServico: 'Manutenção e assistência técnica de impressoras',
    resumo: 'Para quem já tem equipamento Ricoh e precisa de suporte contínuo: SLA de 24 a 48 horas, peças e suprimentos originais e equipe certificada pela Ricoh.',
    zapTexto: 'Olá! Preciso de assistência técnica para minha impressora Ricoh.',
    secoes: [
        {
            h2: 'O custo real de uma máquina parada',
            paragrafos: [
                'Numa gráfica, o prejuízo de um equipamento parado não é o conserto — é o trabalho que não foi entregue no prazo, o cliente que precisou ser avisado e a fila que se acumula atrás. Esse custo raramente aparece na planilha, mas é o que decide se um contrato de manutenção se paga.',
                'É por isso que nosso compromisso está no prazo de atendimento, não apenas na disponibilidade de peça: SLA de 24 a 48 horas para chamados de manutenção, em todas as regiões do Brasil.'
            ]
        },
        {
            h2: 'Peças e suprimentos originais',
            paragrafos: [
                'Trabalhamos exclusivamente com peças originais Ricoh. Não é preciosismo: peça compatível costuma custar menos na nota e mais na vida útil do conjunto onde foi instalada, além de comprometer a qualidade de impressão de formas que só aparecem semanas depois.',
                'Num equipamento de produção que roda centenas de milhares de páginas por mês, um componente fora de especificação não falha sozinho — ele desgasta o que está em volta.'
            ]
        },
        {
            h2: 'Equipe certificada',
            paragrafos: [
                'A equipe técnica é treinada e certificada pela Ricoh, e o responsável técnico é graduado na área com experiência no segmento gráfico. Isso importa porque equipamento de produção não se diagnostica por tentativa: a diferença entre um técnico que conhece a plataforma e um generalista aparece no número de visitas necessárias para resolver o mesmo problema.'
            ]
        },
        {
            h2: 'Contrato de manutenção ou chamado avulso',
            paragrafos: [
                'O contrato de manutenção dá atendimento prioritário e transforma um custo imprevisível em valor fixo mensal. É o formato indicado para quem depende do equipamento para faturar e não pode tratar manutenção como evento excepcional.',
                'O chamado avulso atende quem tem volume baixo ou equipamento fora de operação crítica. Nos dois casos, as peças são originais e a equipe é a mesma.',
                'Se o equipamento é locado conosco, a manutenção já está inclusa na mensalidade — não é preciso contratar nada à parte. Veja as condições de <a href="/locacao-de-impressoras-ricoh.html">locação</a>.'
            ]
        },
        {
            h2: 'O que a manutenção preventiva evita',
            paragrafos: [
                'A maior parte das paradas em equipamento de produção não é súbita. Ela se anuncia antes — em ruído, em atolamento que ficou mais frequente, em cor que saiu do registro, em rolo que começou a marcar. Quem opera a máquina todo dia percebe; o que costuma faltar é alguém para interpretar o sinal antes que ele vire falha.',
                'A manutenção preventiva existe para isso: substituir componente de desgaste dentro da janela prevista, em horário combinado, em vez de no meio de uma tiragem com prazo. A diferença de custo entre os dois cenários raramente está na peça.'
            ],
            listaIntro: 'Vale abrir chamado quando aparecer:',
            lista: [
                'Aumento na frequência de atolamento de papel sem mudança de substrato',
                'Variação de cor entre tiragens que antes saíam iguais',
                'Marcas, riscos ou sombras recorrentes na mesma posição da folha',
                'Ruído novo durante a alimentação ou o acabamento',
                'Mensagens de erro que se repetem mesmo após reinício'
            ]
        },
        {
            h2: 'Como abrir um chamado',
            paragrafos: [
                'Clientes com contrato ativo têm acesso à Área do Cliente, onde é possível abrir e acompanhar chamados técnicos, com registro do histórico de cada equipamento. O canal direto pelo WhatsApp continua disponível para urgências.',
                'Ter o histórico registrado muda a conversa técnica: em vez de descrever o problema do zero a cada chamado, o técnico chega sabendo o que já foi trocado e quando.'
            ],
            todo: 'endereço público da Área do Cliente — o link do menu ainda aponta para um ambiente de desenvolvimento'
        }
    ],
    faq: [
        { p: 'Qual o prazo de atendimento?', r: 'O SLA é de 24 a 48 horas para chamados de manutenção, válido para todas as regiões do Brasil.' },
        { p: 'Vocês atendem equipamentos que não foram comprados com vocês?', r: 'Sim. A assistência técnica atende empresas que já possuem equipamentos Ricoh, independentemente de onde tenham sido adquiridos.' },
        { p: 'Vocês usam peças originais ou compatíveis?', r: 'Exclusivamente peças e suprimentos originais Ricoh. Peça compatível costuma comprometer a qualidade de impressão e a vida útil dos componentes ao redor.' },
        { p: 'A equipe é certificada pela Ricoh?', r: 'Sim. A equipe técnica é treinada e certificada pela Ricoh, e o responsável técnico é graduado na área com experiência no segmento.' },
        { p: 'Preciso de contrato ou posso chamar quando precisar?', r: 'As duas formas existem. O contrato dá atendimento prioritário e custo mensal fixo; o chamado avulso atende demandas pontuais. Equipamentos locados conosco já têm manutenção inclusa.' }
    ],
    cta: { titulo: 'Sua impressora Ricoh precisa de atendimento?', texto: 'Descreva o equipamento e o problema. A gente avalia e informa o prazo de atendimento.' },
    relacionadas: ['locacao-de-impressoras-ricoh', 'venda-de-impressoras-ricoh', 'outsourcing-de-impressao']
},

// -----------------------------------------------------------------------
{
    slug: 'outsourcing-de-impressao',
    titulo: 'Outsourcing de Impressão para Empresas | Brücker Printers',
    descricao: 'Outsourcing de impressão: diagnóstico do parque, equipamentos, suprimentos e manutenção sob um único contrato. Solicite uma análise da sua operação.',
    h1: 'Outsourcing de impressão',
    tipoServico: 'Terceirização da gestão de parque de impressão',
    resumo: 'Terceirização da gestão do parque de impressão: diagnóstico, equipamentos dimensionados, suprimentos e manutenção sob um contrato único, com custo por página conhecido.',
    zapTexto: 'Olá! Gostaria de saber mais sobre outsourcing de impressão.',
    secoes: [
        {
            h2: 'O que é outsourcing de impressão',
            paragrafos: [
                'Outsourcing é transferir a gestão do parque de impressão para um fornecedor. Não se trata apenas de alugar máquinas: envolve dimensionar quantos equipamentos a operação precisa, onde ficam, quem os abastece e como o custo é medido e cobrado.',
                'A diferença em relação à locação está no escopo. Locar é contratar um equipamento; no outsourcing, o objeto do contrato é o serviço de impressão da empresa inteira — o fornecedor responde pelo funcionamento do conjunto, não por uma máquina específica.'
            ]
        },
        {
            h2: 'Começa por um diagnóstico',
            paragrafos: [
                'Nenhuma proposta séria de outsourcing nasce de um catálogo. Ela nasce de um levantamento do que existe hoje: quantos equipamentos há, onde estão, quanto cada um imprime, quanto consomem de suprimento e com que frequência param.',
                'Esse levantamento quase sempre revela o mesmo padrão — equipamentos subutilizados em um setor e sobrecarregados em outro, e um custo de impressão que ninguém sabia calcular porque estava diluído em várias linhas de despesa.'
            ],
            listaIntro: 'O diagnóstico do parque cobre:',
            lista: [
                'Inventário dos equipamentos em operação',
                'Análise do volume de impressão por setor',
                'Levantamento do consumo de suprimentos',
                'Identificação de gargalos e ociosidade',
                'Proposta de redimensionamento'
            ]
        },
        {
            h2: 'Para quem faz sentido',
            paragrafos: [
                'O outsourcing rende mais em operações com vários equipamentos espalhados, em que ninguém tem visão do custo total. Quanto mais fragmentado o parque, maior a economia que a consolidação costuma revelar.',
                'Para quem tem um único equipamento de produção, a <a href="/locacao-de-impressoras-ricoh.html">locação</a> normalmente entrega o mesmo resultado com menos complexidade contratual. Não faz sentido montar uma estrutura de gestão para administrar uma máquina.'
            ]
        },
        {
            h2: 'O que entra no contrato',
            paragrafos: [
                'A composição varia conforme o diagnóstico, mas o princípio é o mesmo: equipamentos dimensionados para a demanda real, suprimentos, manutenção preventiva e corretiva com peças originais e suporte técnico com SLA de 24 a 48 horas — tudo sob um valor acordado.',
                'O resultado que a empresa leva é previsibilidade: um custo por página conhecido, em vez de despesas de impressão dispersas em compras avulsas de toner, chamados técnicos e reposição de equipamento.'
            ],
            todo: 'escopo comercial do outsourcing — modalidades de contrato, forma de medição e limites de atendimento não constam no site e precisam ser definidos com o cliente'
        },
        {
            h2: 'Onde o custo de impressão costuma se esconder',
            paragrafos: [
                'Quando uma empresa tenta calcular quanto gasta com impressão, o número que aparece quase sempre é só o do toner. É a parte visível, porque tem nota fiscal e aparece na conta de suprimentos.',
                'O custo real inclui itens que estão registrados em outros lugares — ou em lugar nenhum.'
            ],
            listaIntro: 'O que normalmente fica de fora da conta:',
            lista: [
                'Chamados técnicos avulsos, lançados como serviço e não como custo de impressão',
                'Horas de trabalho perdidas quando o equipamento do setor está parado',
                'Impressão refeita por falha de qualidade ou configuração errada',
                'Equipamentos ociosos ocupando espaço e contrato',
                'Compras emergenciais de suprimento, feitas fora de negociação'
            ],
            paragrafos2: [
                'Consolidar tudo sob um contrato único não elimina esses custos por mágica — ele os torna visíveis. E o que é medido pode ser reduzido.'
            ]
        }
    ],
    faq: [
        { p: 'Qual a diferença entre outsourcing e locação?', r: 'Na locação, o objeto do contrato é um equipamento. No outsourcing, é o serviço de impressão da empresa: dimensionamento do parque, suprimentos, manutenção e gestão do conjunto.' },
        { p: 'O diagnóstico do parque tem custo?', r: 'Fale com a gente para conhecer as condições. A análise cobre inventário de equipamentos, volume por setor, consumo de suprimentos e identificação de gargalos.' },
        { p: 'Preciso trocar todos os equipamentos que já tenho?', r: 'Não necessariamente. O diagnóstico avalia o que está em operação antes de propor qualquer substituição — parte do ganho costuma vir de redistribuir o que já existe.' },
        { p: 'Outsourcing serve para uma gráfica ou só para escritório?', r: 'Serve para os dois, mas o ganho é maior onde há vários equipamentos e nenhuma visão consolidada do custo. Com um único equipamento de produção, a locação costuma resolver melhor.' }
    ],
    cta: { titulo: 'Quer entender quanto sua empresa gasta com impressão?', texto: 'A gente faz o diagnóstico do parque e mostra onde está o custo que hoje não aparece.' },
    relacionadas: ['locacao-de-impressoras-ricoh', 'assistencia-tecnica-ricoh', 'venda-de-impressoras-ricoh']
},

// -----------------------------------------------------------------------
{
    slug: 'impressoras-para-graficas-porto-alegre',
    titulo: 'Impressoras para Gráficas em Porto Alegre e Região | Brücker Printers',
    descricao: 'Venda, locação e assistência técnica de impressoras Ricoh para gráficas em Porto Alegre e região metropolitana. Base em Canoas. Peça um orçamento.',
    h1: 'Impressoras para gráficas em Porto Alegre e região metropolitana',
    resumo: 'Nossa base fica em Canoas, na região metropolitana de Porto Alegre. Venda, locação e assistência técnica de impressoras Ricoh para gráficas da Grande POA.',
    zapTexto: 'Olá! Sou de Porto Alegre e gostaria de um orçamento de impressoras Ricoh.',
    regional: true,
    secoes: [
        {
            h2: 'Estamos na região metropolitana',
            paragrafos: [
                'A Brücker Printers fica em Canoas, na Av. Armando Fajardo, 2903 — a poucos quilômetros de Porto Alegre e no eixo que liga a capital a São Leopoldo, Novo Hamburgo e Gravataí.',
                'Atendemos gráficas em todo o Brasil, mas a Grande Porto Alegre é onde estamos fisicamente. Para uma gráfica da região, isso significa lidar com um fornecedor que está no mesmo fuso, no mesmo trânsito e sujeito às mesmas condições de deslocamento que você.'
            ]
        },
        {
            h2: 'O que atendemos na Grande Porto Alegre',
            listaIntro: 'Os mesmos serviços que prestamos nacionalmente, com a diferença da proximidade:',
            lista: [
                '<a href="/locacao-de-impressoras-ricoh.html">Locação de impressoras Ricoh</a>, com manutenção e suprimentos inclusos',
                '<a href="/venda-de-impressoras-ricoh.html">Venda de equipamentos novos e seminovos</a>, com garantia estendida disponível',
                '<a href="/assistencia-tecnica-ricoh.html">Assistência técnica</a> com SLA de 24 a 48 horas e peças originais Ricoh',
                '<a href="/outsourcing-de-impressao.html">Outsourcing de impressão</a> com diagnóstico do parque'
            ]
        },
        {
            h2: 'Por que a proximidade importa em equipamento de produção',
            paragrafos: [
                'Uma impressora de produção não é um item que se troca por outro enquanto o técnico não chega. Quando ela para, a produção para junto — e o tempo entre o chamado e o técnico na frente da máquina é o que define o tamanho do prejuízo.',
                'Nosso SLA de 24 a 48 horas vale para todo o país. A diferença de estar na região é operacional: a logística de peças e o deslocamento são mais simples quando não dependem de transporte interestadual.'
            ]
        },
        {
            h2: 'Qual equipamento para qual gráfica',
            paragrafos: [
                'A região concentra desde gráficas rápidas de bairro até operações comerciais de grande porte, e a resposta muda bastante entre elas. Para tiragem curta com prazo apertado, a <a href="/impressoras/ricoh-pro-c5200.html">Pro C5200</a> resolve. Para produção comercial com acabamento, a <a href="/impressoras/ricoh-pro-c5300.html">Pro C5300</a>. Onde a exigência é cor de marca conferida, a <a href="/impressoras/ricoh-pro-c7200.html">Pro C7200</a>.',
                'Se o volume é alto e monocromático — apostilas, material didático, transacional — a <a href="/impressoras/ricoh-pro-8300.html">Pro 8300</a> imprime 1,5 milhão de páginas por mês e sai mais barato por página que qualquer colorida.',
                'O <a href="/impressoras.html">comparativo completo</a> mostra os seis modelos lado a lado.'
            ]
        },
        {
            h2: 'Cidades que atendemos na região',
            paragrafos: [
                'Estar em Canoas coloca a maior parte do polo gráfico da Grande Porto Alegre a menos de uma hora de deslocamento. Atendemos com a mesma estrutura:'
            ],
            // Uma página só listando a região, e não uma página por cidade com
            // o texto trocado. Páginas de cidade clonadas são doorway pages —
            // o Google trata como manipulação e penaliza o site inteiro.
            lista: [
                'Porto Alegre',
                'Canoas, Esteio e Sapucaia do Sul',
                'São Leopoldo e Novo Hamburgo',
                'Gravataí, Cachoeirinha e Alvorada',
                'Viamão e Guaíba',
                'Demais municípios da região metropolitana'
            ],
            paragrafos2: [
                'Fora da região, o atendimento técnico continua valendo para todo o Brasil, com o mesmo SLA de 24 a 48 horas.'
            ]
        },
        {
            h2: 'Onde nos encontrar',
            endereco: true
        }
    ],
    faq: [
        { p: 'Vocês atendem em Porto Alegre?', r: 'Sim. Nossa base fica em Canoas, na região metropolitana, e atendemos gráficas de Porto Alegre e de toda a Grande POA.' },
        { p: 'Atendem outras cidades além da região metropolitana?', r: 'Sim, prestamos atendimento técnico em todas as regiões do Brasil, com o mesmo SLA de 24 a 48 horas.' },
        { p: 'Qual o endereço da Brücker Printers?', r: 'Av. Armando Fajardo, 2903 - Sala 2, bairro Igara, Canoas - RS, CEP 92412-550.' },
        { p: 'Dá para ver o equipamento funcionando antes de fechar?', r: 'Fale com a gente pelo WhatsApp para combinar. Estamos em Canoas, a poucos quilômetros de Porto Alegre.' }
    ],
    cta: { titulo: 'Sua gráfica é da Grande Porto Alegre?', texto: 'Fale com quem está na mesma região. A gente analisa seu volume e indica venda, locação ou assistência.' },
    relacionadas: ['locacao-de-impressoras-ricoh', 'venda-de-impressoras-ricoh', 'assistencia-tecnica-ricoh']
}

];

// ===================================
// MONTAGEM
// ===================================

function nomeDe(slug) {
    const p = PAGINAS.find(function (x) { return x.slug === slug; });
    return p ? p.h1 : slug;
}

function resumoDe(slug) {
    const p = PAGINAS.find(function (x) { return x.slug === slug; });
    return p ? p.resumo : '';
}

function blocoEndereco() {
    const e = T.ENDERECO;
    // Classe própria, e não .footer-endereco: aquela foi feita para o rodapé
    // escuro e usa cinza claro no texto. Sobre o fundo claro da página, os
    // links de telefone e e-mail ficavam com contraste de 1,33:1 — muito
    // abaixo do mínimo de 4,5:1 e praticamente ilegíveis.
    return `                <address class="endereco-contato">
                    <strong>Brücker Printers</strong><br>
                    ${e.rua}<br>
                    ${e.bairro}, ${e.cidade} - ${e.uf}<br>
                    CEP ${e.cep}<br>
                    <a href="tel:${e.telefoneUrl}" data-origem="pagina_regional">${e.telefone}</a><br>
                    <a href="mailto:${e.email}" data-origem="pagina_regional">${e.email}</a>
                </address>
                <p>Atendimento de segunda a sexta, das 8h às 18h.</p>`;
}

function montarSecao(secao, alternada) {
    const classe = alternada ? 'section section-alt' : 'section';
    const partes = [];

    if (secao.paragrafos) {
        secao.paragrafos.forEach(function (p) { partes.push('                <p>' + p + '</p>'); });
    }

    if (secao.lista) {
        if (secao.listaIntro) partes.push('                <p>' + secao.listaIntro + '</p>');
        partes.push('                <ul>');
        secao.lista.forEach(function (i) { partes.push('                    <li>' + i + '</li>'); });
        partes.push('                </ul>');
    }

    // Fecha a seção com parágrafos que vêm depois da lista.
    if (secao.paragrafos2) {
        secao.paragrafos2.forEach(function (p) { partes.push('                <p>' + p + '</p>'); });
    }

    if (secao.endereco) partes.push(blocoEndereco());

    if (secao.todo) {
        partes.push('                <!-- TODO: confirmar com o cliente — ' + secao.todo + ' -->');
    }

    return `        <section class="${classe}">
            <div class="container conteudo-texto">
                <h2>${esc(secao.h2)}</h2>
${partes.join('\n')}
            </div>
        </section>`;
}

function montarRelacionadas(pagina) {
    const cartoes = pagina.relacionadas.map(function (slug) {
        return '                    <a class="relacionado-card" href="/' + slug + '.html">\n' +
            '                        <strong>' + esc(nomeDe(slug)) + '</strong>\n' +
            '                        <span>' + esc(resumoDe(slug).split('.')[0]) + '.</span>\n' +
            '                    </a>';
    }).join('\n');

    return `                <div class="relacionados-grid">
${cartoes}
                </div>`;
}

function montarPagina(pagina) {
    const url = T.SITE + '/' + pagina.slug + '.html';
    const zap = T.linkWhatsApp(pagina.zapTexto);

    const trilha = [
        { nome: 'Início', url: '/' },
        { nome: pagina.h1, url: '/' + pagina.slug + '.html' }
    ];

    // Alterna o fundo das seções, como no index.
    const secoes = pagina.secoes.map(function (s, i) { return montarSecao(s, i % 2 === 1); }).join('\n\n');
    const parImpar = pagina.secoes.length % 2 === 1;

    const schemas = [T.jsonLdBreadcrumb(trilha)];

    // A página regional descreve onde a empresa atende, não um serviço
    // distinto — marcá-la como Service criaria uma quinta oferta que não
    // existe no catálogo.
    if (!pagina.regional) {
        schemas.push(T.schemaServico({
            nome: pagina.h1,
            descricao: pagina.descricao,
            url: url,
            tipo: pagina.tipoServico
        }));
    }

    schemas.push(T.schemaFaq(pagina.faq));

    const head = T.montarHead({
        titulo: pagina.titulo,
        descricao: pagina.descricao,
        url: url,
        ogTitulo: pagina.h1 + ' | Brücker Printers',
        jsonLd: schemas
    });

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${head}
</head>
<body>
${T.montarHeader({ zap: zap })}

    <main>
        <div class="pagina-topo">
            <div class="container">
${T.montarBreadcrumb(trilha)}
                <h1>${esc(pagina.h1)}</h1>
                <p class="pagina-resumo">${esc(pagina.resumo)}</p>
            </div>
        </div>

${secoes}

        <section class="section${parImpar ? ' section-alt' : ''}">
            <div class="container">
                <h2>Perguntas frequentes</h2>
                <div class="faq-grid">
${T.montarFaq(pagina.faq)}
                </div>
            </div>
        </section>

        <section class="section${parImpar ? '' : ' section-alt'}">
            <div class="container">
                <h2>Veja também</h2>
${montarRelacionadas(pagina)}
            </div>
        </section>

        <section class="section${parImpar ? ' section-alt' : ''}">
            <div class="container">
${T.montarCta({ titulo: pagina.cta.titulo, texto: pagina.cta.texto, zap: zap, origem: 'secao_contato', botao: 'Falar no WhatsApp' })}
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

PAGINAS.forEach(function (pagina) {
    const html = montarPagina(pagina);
    fs.writeFileSync(path.join(RAIZ, pagina.slug + '.html'), html, 'utf8');

    const texto = html
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' ');
    const palavras = texto.split(/\s+/).filter(Boolean).length;

    console.log('  gerado    ' + pagina.slug + '.html  (' + palavras + ' palavras, ' + pagina.faq.length + ' perguntas)');
});

console.log('\n' + PAGINAS.length + ' página(s) gerada(s).');
