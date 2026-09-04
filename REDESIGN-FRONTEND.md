# Redesign do frontend — registro

Trabalho na branch `redesign-frontend`, a partir de `medicao/ga4-antipoluicao`.

**Nada em `brucker-chamados/` foi lido ou alterado.** **Nenhuma palavra do
conteúdo mudou** — verificado extraindo o texto visível das 19 páginas antes e
depois e comparando: 19 de 19 idênticas.

---

## Por que este trabalho existiu

O site funcionava e estava bem resolvido em SEO, acessibilidade e medição, mas
não tinha projeto visual.

Ele já havia passado por uma des-decoração: `css/interna.css` identificou
corretamente o preset que todo gerador de página produz — card arredondado,
sombra suave, barra colorida na lateral, ícone em círculo com gradiente — e o
removeu. O problema é que o que sobrou não era sobriedade, era ausência: grade
de células com hairline cinza, fonte do sistema, tudo centralizado, e a
alternância branco/cinza como único recurso de ritmo.

Três grades consecutivas na home somavam **15 cards visualmente idênticos**.

---

## Conceito: a prova de impressão

A empresa vende máquinas de impressão de produção. A linguagem visual veio do
artefato que essas máquinas produzem: marca de registro, barra de controle de
cor, marca de corte, a folha saindo em velocidade. Cada elemento é estrutura,
não enfeite.

### Paleta

Os doze tokens continuam com **o mesmo valor**. O que mudou foi o papel de cada
um. Nenhuma cor nova entrou.

| Papel | Valor | Era |
|---|---|---|
| `--tinta` | `#000000` | `--primary-black` |
| `--papel` | `#f8f7f7` | `--primary-white` |
| `--registro` | `#be1622` | `--secondary-red` — ação |
| `--marca` | `#ebcc01` | `--accent-yellow` — **estava declarado e não era usado em regra nenhuma** |
| `--chapa` | `#1A1A1A` | `--gray-900` |
| `--hairline` | `#D1D5DB` | `--gray-300` |

Tons derivados por escurecimento, sem matiz novo: `--registro-fundo` `#9a111a`,
`--marca-fundo` `#cfb401`, `--laranja-fundo` `#e67a30`.

`--eyebrow` `#B54B00` continua sendo o laranja escurecido até passar em WCAG AA
(5,3:1 sobre branco; o `#FF8C42` puro dá 2,31:1 e reprova). Vale para **todo**
texto pequeno em laranja.

**Regra dos botões:** sobre tinta o botão é a marca (amarelo, 13:1 de contraste
sobre preto); sobre papel é o registro (vermelho). O amarelo salta no escuro,
onde o vermelho apagaria, e é a cor da bandeira do logo.

### Tipografia

| Papel | Fonte | Peso |
|---|---|---|
| Display e corpo | Archivo variável, eixo 400–800 | 34,9 KB |
| Dados e rótulos | Azeret Mono 500 | 10,9 KB |

Archivo é a grotesca de sinalização mais próxima do logotipo "BRÜCKER" no mundo
aberto — a escolha veio do logo, não do gosto. A mono carrega o que é dado:
rótulos de seção, breadcrumb, specs, meta do blog, labels de formulário.

O eixo de largura da Archivo ficou de fora: medido, custava **55 KB a mais**
(90 KB contra 34,9 KB). A presença de display vem de peso, tracking negativo e
escala fluida com `clamp()`.

### Estrutura e assinatura

**A margem de registro** — coluna de 72px à esquerda que atravessa a página,
com hairline contínua e uma marca de registro por seção, anel em amarelo.
Desenhada em pseudo-elemento, sem nenhuma marcação nova em 19 páginas. Some
abaixo de 900px.

**A diagonal do hero** — tinta à esquerda, papel à direita, com a máquina em
`mix-blend-mode: multiply`, o que dissolve o fundo branco das fotos sem recortar
imagem nenhuma. Sobre o corte corre a barra de controle de cor, recortada pelo
**mesmo par de pontos** do bloco de tinta (63% no topo, 39% na base) — é isso
que a faz acompanhar a diagonal em qualquer altura de viewport. Uma faixa girada
por `rotate()` só casaria numa altura.

A diagonal aparece **uma vez só**. Repetida entre seções viraria o clichê de
2015 que essa escolha existe para evitar.

### As três grades

Sem mexer numa palavra nem na ordem das seções:

| Seção | Tratamento |
|---|---|
| Soluções (4) | grade ampla, listas em mono, links alinhados na base |
| Vantagens (6) | régua de seis colunas, tipografia menor e densa |
| Diferenciais (5) | **linhas**, não cards: título à esquerda, texto à direita |

---

## O que mudou no pipeline

### `css/site.css` substitui `style.css` + `interna.css`

Antes eram dois arquivos em conflito aberto: `interna.css` desfazia metade de
`style.css`, e os dois viajavam concatenados no mesmo bloco de estilo inline.
Quinze classes estavam definidas nos dois lugares.

**A armadilha que isso escondia:** `css/style.css` não estava em `ALVOS` de
`build-assets.js` e seu `.min` era minificado à mão. Editar `css/style.css` não
tinha efeito nenhum no site — o arquivo parecia a fonte da verdade e não era.
Medido, deixar o minificador cuidar dele custa 82 bytes (0,4%), cerca de 20
depois do gzip.

`css/style.css`, `css/interna.css` e `css/style-impressora.css` foram removidos.

### Fontes em `fontes/`

Self-hosted. Três pontos que não são óbvios:

1. **`aplicarBase()` passou a reescrever `url("` também**, não só `href` e
   `src`. O CSS vai inline e as páginas vivem em três profundidades; sem isso o
   `url()` da fonte quebraria em `/impressoras` e `/blog` — e **passaria nos
   gates**, porque `verificar-seo.js` só inspeciona `href` e `src`. Exige aspas
   duplas no `url()`, que é como o `site.css` escreve.

2. **O preload precisa de `crossorigin` mesmo sendo same-origin.** Sem ele o
   navegador usa um modo de CORS diferente do fetch do `@font-face` e baixa a
   fonte **duas vezes**.

3. **`preparar-deploy.js` aprendeu a seguir `url()` do CSS embutido.** Ele só
   seguia `href` e `src`, então a mono — que não tem preload, para não competir
   com o elemento de LCP — ficava fora do pacote: o site subiria, a fonte daria
   404 e o navegador cairia no fallback, sem erro visível em lugar nenhum.

`.htaccess` ganhou `AddType font/woff2` e expiração de um ano. Não havia
`ExpiresDefault`, então as fontes seriam revalidadas a cada navegação.

### Movimento

Revelação ao rolar e parallax do hero com `animation-timeline`, em CSS, dentro
de `@supports`. Onde o recurso não existe, o bloco é ignorado e o conteúdo
aparece normalmente — nada depende de JS para ser visto. **Nenhum listener de
scroll em JS.**

`js/script.js` perdeu o reveal por `IntersectionObserver`, que escrevia
`opacity`, `transform` e `transition` como **estilo inline**. Estilo inline
vence qualquer folha, inclusive `@media (prefers-reduced-motion: reduce)`: quem
pedia menos movimento recebia a animação assim mesmo.

---

## Defeitos corrigidos de passagem

- **`impressoras.html`** gerava os seis cards de modelo **sem o wrapper
  `.relacionados-grid`** que as outras 14 páginas usam — perdiam o grid.
  Corrigido em `gerar-paginas-modelo.js`.
- **`politica-privacidade-chamados.html`** tinha `<header class="header">` sem
  o `id="header"`. `js/script.js` procura esse id, então o efeito de cabeçalho
  ao rolar nunca ativava naquela página.
- **A política tinha um `<style>` próprio**, a única exceção do site. Absorvido
  pelo `site.css`.
- **`style="margin-bottom: 1rem"`** repetido em 19 páginas e
  `style="margin-top: 1.5rem"` em 6. Espaçamento virou regra de folha.

---

## Onde mexer agora

| Quero mudar | Edite | Depois rode |
|---|---|---|
| Qualquer coisa visual | `css/site.css` | o ciclo abaixo |
| Head, menu, rodapé, breadcrumb, FAQ, CTA | `scripts/template.js` | idem |
| Hero e seções da home | `index.html` à mão | idem |
| Páginas de modelo e hub | `scripts/gerar-paginas-modelo.js` | idem |
| Páginas de serviço | `scripts/gerar-paginas-servico.js` | idem |
| Blog | `scripts/gerar-blog.js` | idem |

```bash
node scripts/build-assets.js
node scripts/gerar-paginas-modelo.js
node scripts/gerar-paginas-servico.js
node scripts/gerar-blog.js
node scripts/sincronizar-html.js
node scripts/gerar-sitemap.js
node scripts/verificar-seo.js
node scripts/validar-schema.js
```

**Nunca edite `css/site.min.css`** — é gerado.

---

## Contratos que não podem quebrar

| Contrato | Consequência |
|---|---|
| `<nav class="nav"`, `<footer class="footer">`, `class="whatsapp-float"` como string literal | `sincronizar-html.js` aborta |
| Marcadores `<!-- BP:CSS -->` e `<!-- BP:GTAG -->` | idem |
| FAQ em `<details class="faq-item"><summary>…</summary><p>…</p>` | **falha silenciosa**: o `FAQPage` some do JSON-LD da home |
| Âncoras `#home #sobre #solucoes #vantagens #diferenciais #faq #contato` | gate falha |
| IDs do JS: `#carouselContainer #prevBtn #nextBtn #indicators #clientsCarousel #menuToggle #nav #header #contactForm #formStatus #currentYear` | carrossel, menu e formulário param **sem erro** |
| `data-origem` e `data-evento` | medição de lead morre **em silêncio** |
| Aspas duplas em `url()` no CSS | fonte quebra fora da raiz do domínio |

---

## Verificação feita

| Item | Resultado |
|---|---|
| `verificar-seo` | 19 páginas, 0 erros |
| `validar-schema` | 62 blocos, 0 erros — 12 `FAQPage`, iguais à linha de base |
| Texto visível das 19 páginas | **idêntico**, palavra por palavra |
| `data-origem` / `data-evento` / `data-modelo` | contagens idênticas em todas as páginas |
| CLS | **0**, mantido (`size-adjust` no fallback da fonte) |
| Fontes | uma requisição por face, ambas no pacote de deploy |
| Mobile 390px | sem scroll lateral, hamburguer e submenus funcionando |
| Foco de teclado | visível em todos os focáveis (contorno em tinta + anel amarelo) |
| `prefers-reduced-motion` | nenhum elemento fica invisível — o reveal só existe dentro de `no-preference` |
| `sincronizar-html` rodado duas vezes | idempotente; botão flutuante não acumula |

**Custo:** +1,3 KB gzip por página no CSS inline, mais 46 KB de fontes que são
cacheadas entre navegações.

---

## Oportunidade não aproveitada

O CSS inline hoje serve tudo a todas as páginas. Medido no trabalho anterior,
**56% do CSS antigo servia só a `index.html`** e 46% só às internas. Dividir o
`site.css` em `base` + `home` + `internas` faria as 16 internas — que são as
páginas de destino da busca orgânica — carregarem bem menos.

Não foi feito porque cria um modo de falha que **nenhum gate detecta**: a página
recebe o bundle errado, fica visualmente quebrada, e `verificar-seo` e
`validar-schema` continuam verdes. Se for feito depois, vale marcar os blocos do
`site.css` com comentários de escopo antes, para que o corte seja mecânico.
