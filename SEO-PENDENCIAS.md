# SEO — Pendências

O que depende de decisão ou informação humana. Complementa o `SEO-CHANGELOG.md`,
que registra o que já foi feito.

Cada item traz o que falta, onde impacta e o que acontece se ficar como está.

---

## 1. Bloqueiam a publicação

### 1.1 Testar o `.htaccess` em produção

O arquivo era 0 bytes e agora concentra HTTPS, redirects 301, `ErrorDocument`,
gzip e cache. **Nada disso é testável localmente** — não há Apache aqui.

Se `AllowOverride` estiver restrito na HostGator, o arquivo inteiro é ignorado
**em silêncio**: nenhum erro aparece, e as regras simplesmente não valem.

Logo após publicar, conferir:

| URL | Esperado |
|---|---|
| `http://bruckerprinters.com.br/` | 301 para `https://` |
| `https://www.bruckerprinters.com.br/` | 301 para sem `www` |
| `https://bruckerprinters.com.br/index.html` | 301 para `/` |
| `https://bruckerprinters.com.br/impressoras/` | 301 para `/impressoras.html` |
| `https://bruckerprinters.com.br/pagina-inexistente` | 404 com a página personalizada |
| `https://bruckerprinters.com.br/imagens/` | 403 ou 404, **nunca** a listagem de arquivos |

Conferir também se o gzip está ativo — o cabeçalho `Content-Encoding: gzip` deve
aparecer na resposta do HTML. **É o item de maior impacto em performance:** sem
compressão, a nota de Performance cai de 97 para 86 e o LCP sobe de 1,4 s para
3,9 s.

> Se o `.htaccess` for ignorado, abrir chamado na HostGator pedindo
> `AllowOverride All` para o diretório do site.

### 1.2 Verificar o site no Google Search Console

Sem isso não há como acompanhar indexação, consultas de busca nem erros de
rastreamento — e não há como saber se o trabalho funcionou.

1. Search Console → Adicionar propriedade → Prefixo do URL
2. Escolher verificação por **tag HTML**
3. Colar a tag no `index.html`, onde está o `<!-- TODO -->` (por volta da linha 44)
4. Enviar `https://bruckerprinters.com.br/sitemap.xml` em Sitemaps

### 1.3 Validar os dados estruturados

O validador local (`node scripts/validar-schema.js`) cobre as regras
documentadas do Google, mas **não é autoridade** — a lista de campos muda com o
tempo. O Rich Results Test exige URL pública, então só roda depois do deploy.

Testar em <https://search.google.com/test/rich-results>:

- `https://bruckerprinters.com.br/` — LocalBusiness, WebSite, FAQPage
- `https://bruckerprinters.com.br/impressoras/ricoh-pro-c9200.html` — Product, Offer, FAQPage
- `https://bruckerprinters.com.br/locacao-de-impressoras-ricoh.html` — Service
- `https://bruckerprinters.com.br/blog/como-calcular-custo-por-pagina-em-grafica-rapida.html` — Article

**Dois avisos são esperados e deliberados:**

- `Offer` sem `price` — não há preço público, e inventar seria pior que omitir.
- `LocalBusiness` sem `geo` — ver item 3.1.

Qualquer outra coisa é regressão.

---

## 2. Medição: sem isso, os eventos não viram relatório

### 2.1 Registrar as dimensões personalizadas no GA4

Os sete eventos já disparam, mas os parâmetros `origem`, `modelo`, `pagina`,
`titulo_pagina` e `modelo_interesse` **não aparecem em nenhum relatório**
enquanto não forem registrados. Ficam gravados no evento, e não retroagem: só
valem a partir do registro.

Admin → Definições personalizadas → Criar dimensão personalizada, escopo Evento:

| Nome | Parâmetro |
|---|---|
| Origem do contato | `origem` |
| Modelo | `modelo` |
| Página | `pagina` |
| Título da página | `titulo_pagina` |
| Modelo de interesse | `modelo_interesse` |

Sem isso é possível ver *quantos* cliques houve, mas não *de onde* vieram — e
saber que o botão do rodapé converte mais que o do hero é justamente o que
permite decidir onde investir.

### 2.2 Marcar `generate_lead` como conversão

Admin → Eventos → marcar `generate_lead` como evento principal.

Vale considerar `contato_whatsapp` também: no fluxo do site, o clique no
WhatsApp é lead tanto quanto o envio do formulário.

### 2.3 Conferir os eventos no DebugView

Extensão Google Analytics Debugger ligada, navegar pelo site e confirmar que os
sete disparam: `contato_whatsapp`, `contato_telefone`, `contato_email`,
`generate_lead`, `acesso_area_cliente`, `scroll_75`, `engajamento_30s`.

### 2.4 Filtrar o tráfego interno

Cerca de 43% dos usuários do diagnóstico eram bots de data center. Em
Admin → Configurações de dados → Filtros de dados, ativar o filtro de tráfego
interno e cadastrar o IP do escritório em Definições de tráfego interno.

Sem isso, as próprias visitas de vocês contaminam a medição — e num site com
28 usuários por mês, isso distorce tudo.

**O preview já não contamina mais.** `js/gtag-init.js` só mede em
`bruckerprinters.com.br` e `www.bruckerprinters.com.br`; em qualquer outro
host — GitHub Pages, `localhost`, `file://` — liga a flag `ga-disable` e nem
chega a baixar o `gtag.js`. Era a origem das páginas `/brucker-printers/...`
que apareciam no relatório.

Se algum dia o site mudar de domínio, é essa lista que precisa ser atualizada,
senão a medição para sem avisar.

---

## 3. Conteúdo e dados que faltam

### 3.1 Latitude e longitude do endereço

O `LocalBusiness` tem o endereço completo, mas falta o campo `geo`, que ajuda em
buscas com intenção local ("impressoras perto de mim").

Obter no Google Maps: buscar o endereço, clicar com o botão direito no ponto e
copiar as coordenadas.

Onde entra: `scripts/template.js`, função `schemaOrganizacao()`, onde está o
`TODO`. Depois rodar os geradores e o `sincronizar-html.js`.

> Não foi preenchido por estimativa: coordenada aproximada aponta o negócio para
> o lugar errado no mapa.

### 3.2 Validar as especificações contra o datasheet da Ricoh

As 84 especificações vieram do que já estava publicado em `impressoras.html` —
não foram inventadas, mas também **não foram conferidas contra fonte oficial**.

Antes de usar qualquer página de modelo como material comercial, conferir contra
o datasheet da Ricoh. Há um `<!-- TODO -->` em cada uma das seis páginas.

Se algum número mudar: corrigir em `scripts/dados-modelos.json` e rodar
`node scripts/gerar-paginas-modelo.js`.

### 3.3 Dados ausentes na ficha de origem

Duas células do comparativo mostram "Não informado":

- **Ricoh Pro C5200** — volume mensal recomendado. É o único modelo sem esse
  dado, e ele é o principal critério de escolha de um equipamento de produção.
- **Ricoh MP C2004** — formato de papel suportado.

### 3.4 Condições de garantia dos seminovos

A página de venda menciona equipamentos seminovos, mas o site não informa prazo
de garantia, cobertura nem critérios de seleção. Sem isso, o argumento fica no
ar justamente onde o comprador tem mais dúvida.

`venda-de-impressoras-ricoh.html`, seção "Novos e seminovos".

### 3.5 Escopo comercial do outsourcing

É a única das quatro linhas de serviço sem card correspondente no site original.
A página foi construída a partir de Consultoria Técnica, Contratos de Manutenção
e Locação — mas modalidades de contrato, forma de medição e limites de
atendimento precisam ser definidos por vocês.

### 3.6 Valores de referência para os artigos do blog

Dois artigos ficariam bem melhores com um exemplo numérico fechado:

- **Custo por página** — preço de toner, rendimento real por cobertura, vida
  útil e preço das peças de desgaste. A metodologia está completa; falta a
  planilha preenchida.
- **Locação ou compra** — valor de equipamento, mensalidade típica e custo de
  peças, para montar a comparação de TCO lado a lado.

### 3.7 Depoimento ou case de cliente

Os logos já são prova social, mas logo é o formato mais fraco: mostra que a
empresa é cliente, não o que ela obteve. Um depoimento com nome, cargo e empresa
converte bem mais.

**Nada foi escrito.** Depoimento inventado é fraude, não licença criativa. O
texto precisa vir do cliente, com autorização de uso. Há um `<!-- TODO -->` na
seção de clientes do `index.html`.

### 3.8 Política de privacidade do site

O banner de cookies linka `politica-privacidade-chamados.html`, que cobre o
**app Brucker Chamados** — não o site institucional nem o uso de cookies e GA4.

Do ponto de vista da LGPD, o banner deveria apontar para uma política que
descreva o que o site coleta, com que base legal e por quanto tempo. Duas
saídas: criar uma política do site ou acrescentar uma seção sobre o site na
política existente.

---

## 4. Decisões suas

### 4.1 Link da Área do Cliente

No repositório aponta para **`http://localhost:5173/cliente`** em 38 lugares
(menu e rodapé das 19 páginas). Foi mantido a seu pedido.

**Em produção não é mais assim.** O endereço publicado hoje é
`http://chamado.bruckerprinters.com.br`, trocado direto no servidor, sem
commit. Enquanto o repositório não acompanhar, **todo deploy desfaz a
correção** — daí o passo obrigatório do item 5.0.2.

É também a única exceção ao critério de aceite "nenhum link `http://` interno",
e o `verificar-seo.js` tem esse endereço numa lista de exceções para não acusar
erro a cada execução.

O endereço definitivo já se conhece: `https://chamado.bruckerprinters.com.br`,
que responde em HTTPS. Para adotá-lo e dispensar o passo manual de deploy:
`scripts/template.js`, constante `URL_AREA_CLIENTE`; apagar `EXCECOES_HTTP` de
`scripts/verificar-seo.js`; rodar os geradores e o `sincronizar-html.js`.

### 4.2 `css/style-impressora.min.css` sem uso

Ficou órfão quando o hub migrou para `style.min.css` + `interna.min.css`. Não
foi apagado — remover não traz ganho, já que não é mais servido a ninguém.

Só faz sentido excluir numa limpeza de repositório.

### 4.3 Imagens não referenciadas (~3,2 MB)

Estavam no repositório antes deste trabalho e continuam sem uso:

| Arquivo | Tamanho |
|---|---|
| `imagens/venda-locacao-impressoras-ricoh.png` | 1,86 MB |
| `imagens/venda-locacao-impressoras-ricoh-nova.png` | 934 KB |
| `imagens/logo.png` | 208 KB |
| `imagens/logo.jpg` | 68 KB |
| `imagens/logoTranspFavicon.PNG` | 54 KB |
| `imagens/app.ico` | 15 KB |

Não são baixadas por ninguém e não afetam Core Web Vitals — só ocupam espaço no
repositório e no FTP. `imagens/logoTransparente.png` continua em uso pelo campo
`logo` do schema, apesar de o header já usar a versão WebP.

### 4.4 Ofuscação de e-mail do Cloudflare

Não há `__cf_email__` no código-fonte — o Cloudflare ofusca no HTML servido, não
no arquivo. Como o site ainda não está publicado com estas alterações, não foi
possível verificar o resultado.

Foi adicionado um `<noscript>` com o e-mail legível no rodapé e na seção de
contato. Vale notar que o e-mail já aparece em texto plano no JSON-LD, que o
Cloudflare não ofusca — a proteção contra coleta automatizada já era parcial.

Após o deploy, conferir se o `mailto:` funciona com e sem JavaScript.

Verificado em produção: o Cloudflare **está** ofuscando. No HTML servido o
`mailto:` some e vira `/cdn-cgi/l/email-protection#<hex>`, decodificado no
cliente por `email-decode.min.js`. O `contato_email` continua funcionando —
`analytics.js` lê `link.href`, que já vem decodificado —, mas quem estiver sem
JavaScript vê o link quebrado e depende do `<noscript>`.

Para desligar: Cloudflare → Scrape Shield → **Email Address Obfuscation**.

### 4.6 Caminhos relativos na página 404

`404.html` traz um aviso explícito na linha 74: *"todos os caminhos desta
página precisam ser absolutos"*. Hoje **todos são relativos** — passaram a ser
no commit `ec9cef3`, que tornou o site compatível com subpasta.

O Apache serve esse arquivo para **qualquer** URL inexistente. Em
`bruckerprinters.com.br/pagina-errada` funciona, porque a página está na raiz.
Em `bruckerprinters.com.br/blog/pagina-errada`, os caminhos resolvem a partir
de `/blog/`: o logo, os links do menu e os do rodapé apontam todos para o lugar
errado. O CSS está embutido, então a página não fica sem estilo — o defeito é
silencioso, e é exatamente por isso que passou.

Corrigir exige escolher entre os dois destinos: absoluto (`/imagens/...`) só
funciona com o site na raiz do domínio, e o `verificar-seo.js` recusa caminho
absoluto justamente para o preview em subpasta continuar funcionando. Uma saída
é `<base href="https://bruckerprinters.com.br/">` apenas nesta página.

Não foi alterado: está fora do escopo do trabalho de medição e a decisão de
qual ambiente priorizar no 404 é sua.

---

## 4.5 GitHub Pages: preview funcional

O repositório está publicado no GitHub Pages em **subdiretório**:

- ✅ `https://maxcanoas.github.io/brucker-printers/`
- ❌ `https://maxcanoas.github.io/` — este seria o *user site*, que viria de um
  repositório chamado `maxcanoas.github.io`. Não existe, por isso dá 404.

O site funciona por inteiro nos dois endereços: todos os caminhos internos são
**relativos**, e não absolutos. Um `href="/css/style.css"` só funcionaria com o
site na raiz do domínio; em subpasta ele aponta para fora do projeto.

`scripts/verificar-seo.js` recusa qualquer caminho absoluto em `href` ou `src`,
então a regressão é detectada antes de publicar.

**O que continua absoluto, de propósito:** `canonical`, `og:url` e as URLs
dentro do JSON-LD, todas apontando para `bruckerprinters.com.br`. É o que diz
aos buscadores qual é o endereço oficial e impede que o preview do GitHub Pages
seja indexado como conteúdo duplicado.

### O que o preview não reproduz

O GitHub Pages não lê `.htaccess`. Lá não valem: HTTPS forçado, os redirects
301, o gzip nem a página 404 personalizada (o GitHub tem a própria).

Para testar essas regras, só em produção — ver item 1.1.

---

## 5. Depois de publicar

### 5.0 O deploy é manual, por FTP ou cPanel

Enviar ao GitHub **não publica nada** em `bruckerprinters.com.br`. O site roda
na HostGator e o deploy é feito por FTP ou pelo gerenciador de arquivos do
cPanel.

Para montar o pacote com o que precisa subir:

```bash
node scripts/preparar-deploy.js "C:\caminho\para\a\pasta"
```

O script varre as páginas e copia só o que elas referenciam — 53 arquivos,
2,3 MB. Ficam de fora `scripts/`, os `.css` e `.js` não minificados e a
documentação. Não há pasta `css/` no pacote: as folhas estão embutidas no HTML.

Ordem sugerida:

1. **Backup** — no cPanel, selecionar o conteúdo de `public_html` e Compactar.
   Três arquivos serão sobrescritos e não há como desfazer.
2. **Trocar o link da Área do Cliente no pacote** — ver 5.0.2, é obrigatório.
3. **Enviar** os arquivos preservando as subpastas. Compactar em `.zip` e usar
   "Extrair" no cPanel é mais rápido que 53 uploads.
4. **Conferir o `.htaccess`** (Configurações → Mostrar arquivos ocultos).
5. **Purgar o cache do Cloudflare** — ver 5.0.1, é obrigatório.
6. **Testar** as URLs do item 1.1.

Conteúdo do pacote:

```
404.html                                    (novo)
.htaccess                                   (era vazio — ver item 1.1)
index.html                                  (alterado)
impressoras.html                            (alterado)
politica-privacidade-chamados.html          (alterado)
robots.txt                                  (alterado)
sitemap.xml                                 (alterado)
assistencia-tecnica-ricoh.html              (novo)
impressoras-para-graficas-porto-alegre.html (novo)
locacao-de-impressoras-ricoh.html           (novo)
outsourcing-de-impressao.html               (novo)
venda-de-impressoras-ricoh.html             (novo)
blog/                                       (pasta nova, 4 arquivos)
impressoras/*.html                          (6 arquivos novos, junto dos .webp)
css/interna.css e css/interna.min.css       (novos)
js/analytics.js, analytics.min.js,
   gtag-init.js, gtag-init.min.js           (novos)
js/script.js e script.min.js                (alterados)
clientes/*.webp                             (7 novos)
imagens/logo-brucker.webp                   (novo)
imagens/og-*.png                            (7 novos)
```

Cuidados:

- **O `.htaccess` costuma ficar oculto** em clientes de FTP. Ative a exibição de
  arquivos ocultos, senão ele não sobe — e sem ele não há HTTPS forçado,
  redirects, gzip nem página 404.
- **Não é preciso subir `scripts/`.** São ferramentas de geração, não fazem
  parte do site. O `robots.txt` já bloqueia essa pasta por precaução, caso vá
  junto.
- Os arquivos antigos que continuam no servidor (`css/style-impressora.min.css`,
  imagens não referenciadas) não atrapalham; ver itens 4.2 e 4.3.



### 5.0.1 Purgar o cache do Cloudflare depois de subir

**Obrigatório, não opcional.** O Cloudflare está como proxy do domínio, não
apenas como DNS, e guarda os arquivos estáticos na borda:

```
/css/style.min.css             CF-Cache-Status: HIT   max-age=14400
/js/script.min.js              CF-Cache-Status: HIT   max-age=14400
/imagens/logoTransparente.png  CF-Cache-Status: HIT   max-age=14400
```

`js/script.min.js` já existe hoje com esse mesmo nome e vai ser substituído por
uma versão diferente. Sem purgar, o Cloudflare continua entregando a antiga por
até quatro horas — e o site fica com **HTML novo e JavaScript velho**.

O efeito é traiçoeiro porque não parece defeito: a página abre normalmente, mas
o formulário volta a usar `alert()` e **deixa de disparar o `generate_lead`**. A
medição de conversão, que é o motivo deste trabalho, ficaria quebrada sem exibir
nenhum erro.

No painel do Cloudflare: **Caching → Configuration → Purge Everything**, logo
após enviar os arquivos.

O HTML em si responde `CF-Cache-Status: DYNAMIC`, ou seja, não fica em cache de
borda — o problema é restrito aos assets.

### 5.0.2 Trocar o link da Área do Cliente antes de subir

**Obrigatório, não opcional.** Hoje o repositório e o servidor divergem:

| | Área do Cliente aponta para |
|---|---|
| Repositório | `http://localhost:5173/cliente` |
| **Produção, agora** | `http://chamado.bruckerprinters.com.br` |

A troca foi feita direto no servidor e **nunca voltou para o repositório** — não
há commit dela. Isso significa que **todo deploy desfaz a correção**: o pacote
carrega o endereço local, e o botão volta a apontar para uma máquina que só
existe para quem desenvolve. Quebrado para todo visitante, e sem nada para o
`acesso_area_cliente` medir — justamente o evento que foi marcado como conversão.

Depois de rodar o `preparar-deploy.js` e **antes** de enviar, buscar e
substituir em todos os `.html` do pacote:

```
buscar:      http://localhost:5173/cliente
substituir:  https://chamado.bruckerprinters.com.br
```

São 38 ocorrências, duas por página (menu e rodapé). Qualquer editor com
"substituir em arquivos" resolve; no Windows, o Notepad++ faz em pasta inteira.

Note o **https**: o endereço responde em HTTPS (verificado), e o `http://`
publicado hoje faz o navegador marcar como "não seguro" no momento exato em que
o cliente vai entrar na área dele.

> **Como eliminar este passo de vez:** trocar `URL_AREA_CLIENTE` em
> `scripts/template.js` pela URL de produção e apagar a exceção
> `EXCECOES_HTTP` de `scripts/verificar-seo.js`. Foi mantido como está a seu
> pedido — ver item 4.1.

### 5.1 Medir de novo em produção

Os números do changelog são de servidor local. Em produção entram o TTFB da
HostGator e o CDN do Cloudflare, que podem melhorar (cache de borda) ou piorar
(latência de origem).

Rodar o <https://pagespeed.web.dev/> na home, numa página de modelo e num artigo.
Referência local (mediana de três execuções, com gzip): Performance 97,
Acessibilidade 100, LCP 1,43 s, CLS 0.

### 5.2 Acompanhar a indexação

As dezoito páginas do sitemap levam de dias a semanas para entrar no índice.
Acompanhar em Search Console → Páginas.

Se alguma ficar em "Descoberta – não indexada" por mais de três semanas, usar a
Inspeção de URL e pedir indexação manual.

### 5.3 O que esperar, e em quanto tempo

O ponto de partida eram três usuários orgânicos em 28 dias. As páginas novas
disputam termos de cauda longa e com intenção comercial — "ricoh pro c9200
ficha técnica", "locação de impressora para gráfica", "impressoras porto alegre".

Resultado orgânico não aparece em duas semanas. O prazo realista para medir é de
**três a seis meses**, e a primeira coisa a observar não é posição no ranking, e
sim se as impressões começam a subir no Search Console.

O que **passa a ser mensurável desde o primeiro dia** é a conversão: com os
eventos configurados, dá para saber quantas pessoas clicaram no WhatsApp,
de qual página vieram e qual modelo despertou interesse. Era exatamente isso que
não existia antes.

---

## Resumo

| # | Pendência | Urgência |
|---|---|---|
| 1.1 | Testar `.htaccess` em produção | Alta |
| 1.2 | Verificar no Search Console | Alta |
| 1.3 | Validar schema no Rich Results Test | Alta |
| 2.1 | Dimensões personalizadas no GA4 | Alta |
| 2.2 | Marcar `generate_lead` como conversão | Alta |
| 2.3 | Conferir eventos no DebugView | Média |
| 2.4 | Filtrar tráfego interno | Média |
| 3.1 | Coordenadas do endereço | Média |
| 3.2 | Validar specs contra datasheet Ricoh | Média |
| 3.3 | Volume da C5200 e formato da C2004 | Média |
| 3.4 | Garantia dos seminovos | Baixa |
| 3.5 | Escopo do outsourcing | Baixa |
| 3.6 | Valores para os artigos do blog | Baixa |
| 3.7 | Depoimento ou case | Média |
| 3.8 | Política de privacidade do site | Média |
| 4.1 | Link da Área do Cliente | Sua decisão |
| 4.2 | CSS órfão | Baixa |
| 4.3 | Imagens não referenciadas | Baixa |
| 4.4 | Ofuscação de e-mail | Baixa |
| 4.5 | GitHub Pages é preview parcial, não o site | Informativo |
| 4.6 | Caminhos relativos na página 404 | Média |
| 5.0 | **Subir os arquivos por FTP/cPanel** | **Alta** |
| 5.0.1 | **Purgar o cache do Cloudflare** | **Alta** |
| 5.0.2 | **Trocar o link da Área do Cliente no pacote** | **Alta** |
| 5.1 | Medir em produção | Após deploy |
| 5.2 | Acompanhar indexação | Contínuo |
