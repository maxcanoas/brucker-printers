# SEO — Registro de alterações

Trabalho realizado na branch `seo/otimizacao-organica`, a partir de `main`.

**Nada em `brucker-chamados/` foi alterado.** O sistema de chamados (API, painel
React e app Expo) não faz parte deste trabalho e não foi tocado.

---

## Por que este trabalho existiu

Diagnóstico do GA4 em 28 dias: 28 usuários ativos, cerca de 43% deles bots de
data center, **3 usuários vindos de busca orgânica**, 3 segundos de engajamento
médio e **nenhum evento de conversão configurado** — não havia como provar que o
site gerava lead.

Do lado orgânico, a causa estrutural era a arquitetura: seis modelos de
impressora numa única página e nenhuma página para as quatro linhas de serviço.
Uma URL não disputa seis intenções de busca diferentes.

---

## Resultado em números

| | Antes | Depois |
|---|---:|---:|
| Páginas HTML | 3 | **19** |
| Palavras de conteúdo | ~2.400 | **~17.700** |
| Links internos por página | ~7 | **40 a 55** |
| Eventos de conversão no GA4 | 0 | **7** |
| Blocos de dados estruturados | 5 | **62** |
| URLs no sitemap | 3 | 18 |

### Lighthouse (mobile)

Três execuções por cenário; os valores são a **mediana**, não a melhor rodada.

| Cenário | Performance | Acessibilidade | LCP |
|---|---:|---:|---:|
| `main`, sem compressão | 86 | 92 | 3,9 s |
| `main`, com gzip | 97 | 92 | 2,34 s |
| **Final, com gzip** | **97** | **100** | **1,43 s** |

Leitura honesta desses números:

- **A pontuação de Performance não melhorou** — 97 antes, 97 depois. O site já
  era rápido quando servido com compressão. O que o trabalho fez foi *manter*
  essa pontuação depois de acrescentar medição, um CSS novo e dezesseis páginas.
- **O LCP caiu 39%** (2,34 s → 1,43 s), bem abaixo do limite de 2,5 s.
- **A acessibilidade subiu de 92 para 100.**
- O ganho de 86 → 97 entre as duas primeiras linhas vem do **gzip**, que hoje
  não está ativo em produção (o `.htaccess` estava vazio) e passou a ser
  configurado neste trabalho. Esse ganho é real, mas é do servidor, não do
  código.

Medido em servidor local. Em produção entram o TTFB da HostGator e o CDN do
Cloudflare — repetir a medição no PageSpeed Insights após o deploy (ver
`SEO-PENDENCIAS.md`).

---

## Bloco 1 — Medição

### Eventos GA4

`js/analytics.js` — um único listener delegado em `document`, identificando os
CTAs pelo `href` e não por classe, para não quebrar quando o HTML mudar.
Nenhum evento bloqueia navegação.

| Ação | Evento | Parâmetros |
|---|---|---|
| Clique em `wa.me` | `contato_whatsapp` | `origem`, `modelo` |
| Clique em `tel:` | `contato_telefone` | `origem` |
| Clique em `mailto:` | `contato_email` | `origem` |
| Envio do formulário | `generate_lead` | `origem`, `modelo_interesse` |
| Clique em Área do Cliente | `acesso_area_cliente` | — |
| 75% de rolagem | `scroll_75` | `pagina` |
| 30 s engajado | `engajamento_30s` | `pagina` |

`engajamento_30s` conta tempo com a aba **visível** — uma aba aberta em segundo
plano por dez minutos não vira engajamento. `generate_lead` sai antes do
redirecionamento, com `event_callback` e limite de 300 ms.

**Descoberta que ampliou o escopo:** `contato_telefone` e `contato_email` não
tinham o que medir. O site não tinha nenhum `tel:` e o e-mail era `<span>` de
texto puro — não discava no celular nem era clicável. Os dois links foram
criados, com o estilo do `<span>` replicado para a aparência não mudar.

### Consentimento (LGPD)

Google Consent Mode v2 com padrão negado nos quatro sinais. `analytics_storage`
passa a `granted` apenas após o aceite; os `ad_*` seguem negados mesmo depois,
porque o site mede e não faz remarketing.

Banner sem biblioteca externa, injetado por JS — o que dispensa markup nas
dezenove páginas.

### Higiene do gtag

Já estava correto: um snippet por página, sem duplicação. Em vez de manter três
cópias sincronizadas à mão, o snippet passou a viver só em `js/gtag-init.js`.

---

## Bloco 2 — Arquitetura de conteúdo

### Seis páginas de modelo

`/impressoras/ricoh-pro-c5200.html` e as outras cinco. Entre 783 e 903 palavras
cada, com especificações em `<table>` real, FAQ próprio, breadcrumb, modelos
relacionados e WhatsApp pré-preenchido com o nome do equipamento.

**As 84 especificações não foram transcritas à mão.** `scripts/extrair-specs.js`
lê as fichas de `impressoras.html` e uma checagem de integridade confirma que
nada se perdeu (84 linhas, 36 grupos, 30 itens de lista — mesmos números na
origem e na saída). A primeira versão do extrator devolvia 5 de 11 specs para um
modelo: regex não-gulosa fechava na primeira `</div>` e truncava o grupo em
silêncio. Foi trocada por parsing com contagem de profundidade.

### Hub comparativo

`impressoras.html` manteve a URL e virou o comparativo dos seis modelos. As
fichas detalhadas saíram daqui: mantê-las duplicaria as páginas novas, que é o
problema que o bloco existe para resolver.

Corrigidos de passagem: `<main>` duplicado e não fechado, e sete `<h2>`
concorrentes na mesma página.

### Quatro páginas de serviço e uma regional

`locacao-de-impressoras-ricoh` (908 palavras), `venda-de-impressoras-ricoh`
(718), `assistencia-tecnica-ricoh` (872), `outsourcing-de-impressao` (802) e
`impressoras-para-graficas-porto-alegre` (743).

Cada uma parte de um ângulo diferente de propósito — locação fala de
previsibilidade de custo, venda de patrimônio, assistência de disponibilidade,
outsourcing de gestão. `scripts/verificar-seo.js` recusa parágrafos repetidos
entre páginas, e a checagem roda a cada geração.

A página regional é **uma só**, cobrindo Porto Alegre, Canoas e demais
municípios da região — e não uma página por cidade com o texto trocado, que
seria doorway page e motivo de penalização.

### Blog

`/blog/` com índice e três artigos de 1.229 a 1.437 palavras, com sumário
ancorado e links internos.

A separação adotada, documentada no gerador: **página de serviço argumenta por
que contratar; artigo ensina a decidir, inclusive contra contratar.** Por isso
os artigos trazem fórmula e checklist, não argumento de venda.

### Menu e rodapé

Menu com submenus para os seis modelos e as quatro soluções, em CSS puro, com
abertura por `:focus-within` para funcionar por teclado. Rodapé com mapa do site
em quatro colunas e o endereço real.

A navegação é gerada a partir das listas `MODELOS` e `SERVICOS` de
`scripts/template.js`: incluir uma página nessas listas já a coloca no menu e no
rodapé.

---

## Bloco 3 — Dados estruturados

O `LocalBusiness` anterior declarava `addressRegion: "Brasil"` e não tinha rua,
cidade nem CEP — inválido. Agora tem o `PostalAddress` completo de Canoas,
`openingHoursSpecification` estruturado e `@id` fixo.

O `@id` é o que amarra o grafo: `Product.offers.seller`, `Service.provider`,
`Article.author` e `Article.publisher` **referenciam** a organização em vez de
repeti-la. Sem isso os buscadores veriam quatro organizações homônimas.

Adicionados: `Product` + `Offer` nas seis páginas de modelo (com as specs em
`additionalProperty`), `Service` nas quatro de serviço, `Article` nos três posts,
`BreadcrumbList` em toda interna, `ItemList` no hub.

**O `FAQPage` passou a ser gerado a partir do FAQ visível na página.** A auditoria
tinha apontado que duas das quatro respostas do schema divergiam do texto
renderizado; agora não têm como divergir, e o validador recusa qualquer pergunta
marcada que não esteja visível.

62 blocos, zero erros no validador local.

---

## Bloco 4 — SEO técnico

- **`.htaccess`** — era 0 bytes. Ganhou HTTPS, host canônico, `ErrorDocument`,
  redirects 301, gzip e cache. Duas armadilhas contornadas: o redirecionamento
  HTTPS ingênuo criaria **laço infinito** com Cloudflare em modo Flexible (a
  regra checa `X-Forwarded-Proto` junto com `%{HTTPS}`), e `/impressoras/`
  passaria a devolver 403 ao virar diretório de páginas — tem 301 explícito.
- **`sitemap.xml`** gerado por script, com `lastmod` vindo do git e não do
  `mtime` (as páginas são regeneradas em lote; o `mtime` faria o site inteiro
  parecer alterado a cada build). Arquivo com alteração não commitada usa a data
  de hoje. A URL vem do `canonical` da página.
- **`robots.txt`** — removido `Disallow: /404.html`, que bloqueava justamente o
  arquivo que declara o próprio `noindex` (URL bloqueada não é lida, e o
  `noindex` nunca seria visto).
- **`og:image`** — sete imagens 1200×630 com fundo sólido: uma genérica e **uma
  por modelo**. Compartilhar a página da C9200 e aparecer a foto da C7200 seria
  pior que não ter imagem.
- `hreflang` autorreferente removido; `geo.region` de `BR` para `BR-RS`;
  `og:image:width/height/alt` e `twitter:image:alt` adicionados; placeholder da
  verificação do Search Console.

---

## Bloco 5 — Performance

- **`gtag-init` embutido** — 1,4 KB bloqueavam 865 ms como arquivo externo sem
  `defer`. Não podia virar `defer`: o consentimento tem de ser declarado antes
  do `config`.
- **CSS embutido por inteiro.** A primeira tentativa foi crítico inline +
  folhas assíncronas, o padrão recomendado: baixou o LCP de 4,3 s para 3,3 s,
  **mas levou o CLS de 0 para 0,152** — acima do limite de 0,1. Quando o CSS
  completo chega depois da primeira pintura, tudo que ele estiliza se
  reposiciona. Embutido, não há segunda pintura. O custo é não ter cache entre
  páginas, aceitável para tráfego de busca, que chega direto na página de
  destino.
- **`logoTransparente.png`: 101 KB → 8 KB.** Tinha 869×287 px para exibir
  200×50. Sete logos de clientes convertidos para WebP (37 KB → 18 KB).
- Dimensões reais lidas do cabeçalho WebP e declaradas no HTML — as páginas
  usavam `400×333` para imagens de proporções diferentes.

---

## Bloco 6 — Conversão

- **Botão flutuante de WhatsApp** nas dezenove páginas. A classe
  `.whatsapp-float` já era escondida no `@media print` desde antes deste
  trabalho, mas nunca teve regra de posicionamento nem HTML.
- **Formulário à prova de erro** — validação por campo com mensagem inline,
  `aria-describedby` e `aria-invalid`, foco no primeiro campo inválido, botão
  desabilitado durante o envio (impede duplo clique gerar dois `generate_lead`)
  e confirmação visual. Os dois `alert()` foram removidos.
- **Select "Modelo de interesse"** alimentando `modelo_interesse`.
- **Prova social** — apenas um `<!-- TODO -->`. Depoimento inventado é fraude;
  o texto precisa vir do cliente, com autorização de uso.

---

## Correções de acessibilidade

A pontuação subiu de 92 para 100. Três das falhas foram introduzidas por este
trabalho e corrigidas; duas eram pré-existentes.

| Problema | Contraste | Origem | Correção |
|---|---|---|---|
| Botões de CTA e aceite de cookies | 2,31:1 | Introduzido aqui | Trocados para `--secondary-red` (6,7:1), já usado em `.btn-header` |
| Endereço na página regional | 1,33:1 | Introduzido aqui | Classe `.endereco-contato` própria para fundo claro |
| `aspect-ratio` fixo nas imagens | — | Introduzido aqui | Removido; dimensões reais no HTML |
| `.section-subtitle` | 2,31:1 | **Pré-existente** | `#B54B00` (5,3:1 no branco, 4,8:1 no cinza) — autorizado |
| Indicadores do carrossel | 12×12 px | **Pré-existente** | Área clicável estendida por `::after` invisível; o visual não mudou |

O primeiro tom testado para o subtítulo (`#C25100`) passava sobre branco mas
ficava em 4,26:1 sobre o cinza das seções alternadas — ainda reprovado.

---

## Dois defeitos sérios encontrados durante o trabalho

**`<noscript>` órfão derrubava três páginas.** Uma limpeza automática de `<head>`
removeu os `</noscript>` e manteve as aberturas. Um `<noscript>` sem fechamento
faz o navegador tratar todo o resto da página como conteúdo alternativo:
`index.html`, `politica-privacidade-chamados.html` e `404.html` **não renderizavam
nada**.

O agravante é que nenhuma verificação pegou: `title`, `canonical`, `h1` e links
continuavam presentes no código-fonte, e o Lighthouse dava acessibilidade 100 na
home justamente porque não havia conteúdo renderizado para avaliar. Foi um
screenshot que revelou. `verificar-seo.js` ganhou checagem de balanceamento de
tags estruturais.

**Bug de `$$` no `String.replace`.** O `priceRange` do `LocalBusiness` saía como
`"$"` em vez de `"$$"`: em string de substituição, `$$` é escape para um `$`
literal. Corrigido com função de substituição.

---

## Ferramentas criadas

Doze scripts em `scripts/`, Node puro e sem dependências externas (exceto os de
imagem, que usam o `sharp` já presente em `tool-assets/`).

| Script | Função |
|---|---|
| `template.js` | Head, header, rodapé, navegação e schemas — fonte única |
| `extrair-specs.js` | Lê as specs das fichas; congela em `dados-modelos.json` |
| `gerar-paginas-modelo.js` | Seis páginas de modelo e o hub |
| `gerar-paginas-servico.js` | Quatro serviços e a regional |
| `gerar-blog.js` | Índice e artigos |
| `sincronizar-html.js` | Aplica menu, rodapé, CSS e schema nos três HTML manuais |
| `build-assets.js` | Gera os `.min` com validação de sintaxe |
| `gerar-sitemap.js` | Sitemap com `lastmod` do git |
| `gerar-og-image.js` | As sete imagens sociais |
| `otimizar-imagens.js` | Conversão para WebP e análise de descompasso |
| `verificar-seo.js` | Unicidade de head, links, órfãs, duplicação, tags |
| `validar-schema.js` | JSON-LD contra as exigências do Google |

### Comandos

```bash
# Ciclo completo após editar conteúdo ou CSS
node scripts/build-assets.js
node scripts/gerar-paginas-modelo.js
node scripts/gerar-paginas-servico.js
node scripts/gerar-blog.js
node scripts/sincronizar-html.js
node scripts/gerar-sitemap.js

# Verificação antes de publicar (todos aceitam --verificar)
node scripts/verificar-seo.js
node scripts/validar-schema.js
```

### Estado da verificação

```
build-assets --verificar      .min em dia
sincronizar-html --verificar  3 arquivos em sincronia
gerar-sitemap --verificar     18 URLs em dia
verificar-seo                 19 páginas, 0 erros
validar-schema                62 blocos, 0 erros
```

---

## O que não foi alterado, e por quê

- **`css/style.css` e `css/style.min.css`** — o CSS original ficou intacto.
  Tudo que é novo está em `css/interna.css`.
- **`css/style-impressora.min.css`** ficou **sem uso** quando o hub migrou para
  `style.min.css` + `interna.min.css`. Não foi apagado; ver pendências.
- **Link da Área do Cliente** — aponta para `http://localhost:5173/cliente` em
  seis lugares. Mantido a seu pedido; ver pendências.
- **Imagens órfãs** (~3,2 MB, incluindo um PNG de 1,86 MB não referenciado) —
  não são servidas e não afetam Core Web Vitals. Ver pendências.
- **Especificações técnicas** — reaproveitadas literalmente, sem alteração de
  nenhum número.

---

## Sobre os dados

Nenhum dado técnico, preço, prazo, certificação, número de clientes ou tempo de
mercado foi inventado. Onde faltou informação, há `<!-- TODO -->` no código e
registro em `SEO-PENDENCIAS.md`.

Dois exemplos: a Pro C5200 é o único modelo sem volume mensal declarado e a
MP C2004 não tem formato de papel na ficha de origem. As duas células do
comparativo mostram "Não informado" em itálico, com nota visível ao leitor.
Estimar teria sido fácil e ninguém notaria.
