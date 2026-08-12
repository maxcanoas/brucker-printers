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

Os sete eventos já disparam, mas os parâmetros `origem`, `modelo`, `pagina` e
`modelo_interesse` **não aparecem em nenhum relatório** enquanto não forem
registrados. Ficam gravados no evento, e não retroagem: só valem a partir do
registro.

Admin → Definições personalizadas → Criar dimensão personalizada, escopo Evento:

| Nome | Parâmetro |
|---|---|
| Origem do contato | `origem` |
| Modelo | `modelo` |
| Página | `pagina` |
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

Aponta para **`http://localhost:5173/cliente`** em seis lugares (menu e rodapé
das páginas). Foi mantido a seu pedido.

Enquanto estiver assim, **o botão está quebrado para todo visitante** — leva a
um endereço que só existe na máquina de quem desenvolve. É também a única
exceção ao critério de aceite "nenhum link `http://` interno", e o
`verificar-seo.js` tem esse endereço numa lista de exceções para não acusar
erro a cada execução.

Quando decidir o endereço definitivo: `scripts/template.js`, constante
`URL_AREA_CLIENTE`, e rodar os geradores e o `sincronizar-html.js`.

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

---

## 4.5 GitHub Pages: preview parcial, não é o site

O repositório está publicado no GitHub Pages, mas em **subdiretório**:

- ✅ `https://maxcanoas.github.io/brucker-printers/`
- ❌ `https://maxcanoas.github.io/` — este é o *user site*, que viria de um
  repositório chamado `maxcanoas.github.io`. Não existe.

**O preview está parcialmente quebrado, e isso é esperado.** Todos os caminhos
do site são absolutos (`/js/...`, `/imagens/...`, `/impressoras.html`), porque a
produção é a HostGator, onde o site fica na raiz do domínio. Num subdiretório,
`/js/` resolve para `maxcanoas.github.io/js/`, que não existe.

O que acontece no GitHub Pages:

| Recurso | Estado |
|---|---|
| CSS | Funciona — está embutido no HTML |
| Conteúdo, textos, schema | Funcionam |
| `/js/analytics.min.js` | 404 — **nenhum evento GA4 dispara ali** |
| `/js/script.min.js` | 404 — carrossel e formulário não funcionam |
| Imagens (`/imagens/`, `/impressoras/`) | 404 |
| Links do menu e do rodapé | 404 |

Em `bruckerprinters.com.br` tudo isso funciona, porque o site fica na raiz.

**Serve para:** conferir texto, títulos, estrutura e dados estruturados.
**Não serve para:** testar navegação, medição, formulário ou performance.

Se em algum momento quiserem um preview fiel, a saída é configurar um domínio
customizado no GitHub Pages (arquivo `CNAME`), que passa a servir na raiz — sem
precisar mexer em nenhum caminho.

---

## 5. Depois de publicar

### 5.0 O deploy é manual, por FTP ou cPanel

Enviar ao GitHub **não publica nada** em `bruckerprinters.com.br`. O site roda
na HostGator e o deploy é feito por FTP ou pelo gerenciador de arquivos do
cPanel.

O que precisa subir para a raiz do site (`public_html` ou equivalente):

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
| 5.0 | **Subir os arquivos por FTP/cPanel** | **Alta** |
| 5.1 | Medir em produção | Após deploy |
| 5.2 | Acompanhar indexação | Contínuo |
