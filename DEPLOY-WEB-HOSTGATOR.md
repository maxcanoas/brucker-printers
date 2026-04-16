# Como Colocar o Sistema de Chamados no Ar (Versao Web)

> **Escrito para:** qualquer pessoa, mesmo sem experiencia tecnica
> **Resultado:** ao final, o sistema estara funcionando em `https://chamados.bruckerprinters.com.br`
> **Tempo estimado:** 1 a 2 horas, seguindo tudo com calma
> **Data:** Abril 2026

---

## O que voce vai montar

O sistema e feito de 3 pecas que trabalham juntas:

```
HOSTGATOR (voce ja tem)                         RENDER (gratuito, voce vai criar)
+-------------------------------+                +-----------------------------+
| Site institucional            |                | API (servidor backend)      |
| bruckerprinters.com.br       |                | brucker-api.onrender.com    |
|                               |                |                             |
| Painel de chamados            | --- chama ---> | Processa logins, chamados,  |
| chamados.bruckerprinters      |                | envia e-mails, gera PDF     |
| .com.br                       |                +-------------+---------------+
+-------------------------------+                              |
                                                  +------------+------------+
                                                  |                         |
                                              SUPABASE              cPANEL SMTP
                                           (banco de dados,         (envia e-mails
                                            fotos dos               de notificacao)
                                            chamados)
```

- **Site institucional** = a pagina que ja existe (nao muda nada)
- **Painel de chamados** = a tela onde admin e clientes fazem login, abrem chamados, etc.
- **API** = o "cerebro" que processa tudo nos bastidores
- **Supabase** = onde ficam os dados (clientes, chamados, fotos, etc.)

O site institucional e o painel de chamados ficam os dois na Hostgator (voce ja paga por ela). A API fica no Render (servico gratuito), porque a hospedagem compartilhada da Hostgator nao roda Node.js.

---

## INDICE

- [Etapa 0 — O que voce precisa ter em maos antes de comecar](#etapa-0--o-que-voce-precisa-ter-em-maos-antes-de-comecar)
- [Etapa 1 — Recolher as chaves do Supabase](#etapa-1--recolher-as-chaves-do-supabase)
- [Etapa 2 — Preparar o Supabase para producao](#etapa-2--preparar-o-supabase-para-producao)
- [Etapa 3 — Criar e-mail no cPanel da Hostgator (SMTP)](#etapa-3--criar-e-mail-no-cpanel-da-hostgator-smtp)
- [Etapa 4 — Colocar a API no ar (Render)](#etapa-4--colocar-a-api-no-ar-render)
- [Etapa 5 — Gerar o build do painel web](#etapa-5--gerar-o-build-do-painel-web)
- [Etapa 6 — Criar o subdominio na Hostgator](#etapa-6--criar-o-subdominio-na-hostgator)
- [Etapa 7 — Enviar o painel para a Hostgator](#etapa-7--enviar-o-painel-para-a-hostgator)
- [Etapa 8 — Travar o CORS da API](#etapa-8--travar-o-cors-da-api)
- [Etapa 9 — Atualizar o link no site institucional](#etapa-9--atualizar-o-link-no-site-institucional)
- [Etapa 10 — Checklist final](#etapa-10--checklist-final)
- [Como atualizar o sistema no futuro](#como-atualizar-o-sistema-no-futuro)
- [Problemas comuns e solucoes](#problemas-comuns-e-solucoes)
- [Glossario](#glossario)

---

## Etapa 0 — O que voce precisa ter em maos antes de comecar

Reuna tudo isso ANTES de comecar. Se faltar algo, voce vai travar no meio do caminho.

### Contas e acessos

| O que | Como conseguir |
|-------|----------------|
| **Login do cPanel da Hostgator** | A Hostgator enviou por e-mail quando voce contratou. O endereco normalmente e `bruckerprinters.com.br:2083` ou `bruckerprinters.com.br/cpanel`. Se nao achar, entre no painel da Hostgator em `financeiro.hostgator.com.br` e procure por "cPanel" |
| **Conta no GitHub** | Acesse `github.com`. O repositorio do projeto e `maxcanoas/brucker-printers`. Voce precisa ter acesso a esse repositorio |
| **Login do Supabase** | Acesse `supabase.com/dashboard`. O projeto ja existe com URL `bzvzxecflpcvtlkxoulm.supabase.co` |
| **E-mail no cPanel** | Para enviar e-mails de notificacao. Crie um e-mail como `chamados@bruckerprinters.com.br` no cPanel da Hostgator (veja Etapa 3) |

### No seu computador

| O que | Para que serve | Como instalar |
|-------|---------------|---------------|
| **Node.js** versao 18 ou superior | Gerar o build do painel web | Acesse `nodejs.org`, baixe a versao LTS (botao verde grande), instale normalmente (avance, avance, concluir) |
| **Git** | Baixar o codigo do GitHub | Acesse `git-scm.com`, baixe e instale (pode deixar todas as opcoes padrao) |

**Como verificar se ja estao instalados:**

1. Aperte `Windows + R`, digite `cmd`, aperte Enter
2. No prompt preto que abriu, digite:
   ```
   node --version
   ```
   Deve aparecer algo como `v18.20.0` ou superior. Se aparecer erro, instale o Node.js
3. Depois digite:
   ```
   git --version
   ```
   Deve aparecer algo como `git version 2.43.0`. Se aparecer erro, instale o Git

### Material de anotacao

Pegue um bloco de notas (pode ser o Notepad do Windows, ou papel e caneta) para anotar chaves e URLs durante o processo. Voce vai precisar consultar essas anotacoes varias vezes.

---

## Etapa 1 — Recolher as chaves do Supabase

O Supabase guarda todas as informacoes do sistema (clientes, chamados, impressoras, etc.). Voce precisa de 3 chaves dele para configurar o resto.

### Passo a passo

1. Acesse `https://supabase.com/dashboard` e faca login
2. Voce vai ver seu projeto na tela principal. Clique nele para abrir
3. No menu lateral esquerdo (barra escura), clique no icone de **engrenagem** (e o ultimo icone, la embaixo). Isso abre o **Project Settings**
4. Na lista que aparece dentro de Settings, clique em **API** (fica na secao "Configuration")
5. Voce vai ver uma tela com varias informacoes. Precisa copiar 3 delas:

```
+--------------------------------------------------+
|  Project Settings > API                          |
|                                                  |
|  Project URL                                     |
|  +--------------------------------------------+  |
|  | https://bzvzxecflpcvtlkxoulm.supabase.co  |  |  <-- COPIE ISSO (1)
|  +--------------------------------------------+  |
|                                                  |
|  Project API Keys                                |
|                                                  |
|  anon (public)                                   |
|  +--------------------------------------------+  |
|  | eyJhbGciOiJIUzI1NiIsInR5cCI6...           |  |  <-- COPIE ISSO (2)
|  +--------------------------------------------+  |
|                                                  |
|  service_role (secret)     [clique no olhinho]   |
|  +--------------------------------------------+  |
|  | eyJhbGciOiJIUzI1NiIsInR5cCI6...           |  |  <-- COPIE ISSO (3)
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

6. Anote as 3 informacoes com os nomes:

| Nome que vou usar neste guia | O que e | Onde vai ser usada |
|-----|---------|----------|
| `SUPABASE_URL` | A URL do projeto (comeca com `https://`) | API + Painel Web |
| `SUPABASE_ANON_KEY` | A chave `anon public` (longa, comeca com `eyJ`) | API + Painel Web |
| `SUPABASE_SERVICE_KEY` | A chave `service_role secret` (precisa clicar no olhinho para revelar) | **Somente na API** — NUNCA compartilhe esta chave |

> **ATENCAO:** A `SUPABASE_SERVICE_KEY` tem acesso total ao banco de dados. Ela so vai para o Render (API). NUNCA coloque ela no painel web ou em lugar publico.

**Como saber se deu certo:** Voce tem 3 textos anotados. A URL comeca com `https://` e as duas chaves comecam com `eyJ`.

---

## Etapa 2 — Preparar o Supabase para producao

### 2.1 Verificar se as tabelas existem

1. No painel do Supabase, clique em **Table Editor** no menu lateral (icone de tabela)
2. No lado esquerdo voce deve ver a lista de tabelas. Confira se existem estas **9 tabelas**:
   - `admins`
   - `avaliacoes`
   - `chamado_atualizacoes`
   - `chamados`
   - `clientes`
   - `configuracoes`
   - `impressoras`
   - `relatorios_atendimento`
   - `tecnicos`

**Se as 9 tabelas ja existem:** pule para o passo 2.2.

**Se NAO existem (ou existem menos que 9):** voce precisa executar o script de criacao:

1. No menu lateral, clique em **SQL Editor** (icone `<>`)
2. Clique em **New query** (canto superior esquerdo)
3. No seu computador, abra o arquivo:
   ```
   D:\Freelas\brucker-printers\brucker-chamados\api\database\migration.sql
   ```
4. Copie TODO o conteudo do arquivo (Ctrl+A para selecionar tudo, Ctrl+C para copiar)
5. Cole no editor SQL do Supabase (Ctrl+V)
6. Clique no botao **Run** (ou aperte Ctrl+Enter)
7. Deve aparecer `Success. No rows returned` — isso e normal, significa que funcionou
8. Volte ao Table Editor e confirme que as 9 tabelas apareceram

### 2.2 Criar o bucket de fotos (Storage)

Quando um cliente abre um chamado, ele pode enviar fotos do problema. Essas fotos ficam guardadas no Supabase Storage.

1. No menu lateral do Supabase, clique em **Storage** (icone de pasta)
2. Clique em **New bucket**
3. Preencha:
   - **Name:** `chamado-fotos` (exatamente assim, com hifen, tudo minusculo)
   - **Public bucket:** marque como **ON** (ligado) — as fotos precisam ser visiveis no painel
4. Clique em **Create bucket**
5. O bucket `chamado-fotos` deve aparecer na lista

Agora voce precisa criar uma regra que permite o envio de fotos:

1. Clique no bucket `chamado-fotos` que acabou de criar
2. Clique na aba **Policies** (no topo)
3. Clique em **New Policy**
4. Selecione **Get started quickly** (ou "For full customization" se essa opcao nao aparecer)
5. Em vez de usar o template, clique em **SQL** (se disponivel) ou use o SQL Editor:

Va no **SQL Editor** e cole este comando:

```sql
-- Permite que qualquer um VEJA as fotos (elas aparecem no painel)
CREATE POLICY "fotos_leitura_publica"
ON storage.objects FOR SELECT
USING (bucket_id = 'chamado-fotos');

-- Permite que a API envie fotos (usando a service_role key)
CREATE POLICY "fotos_upload_api"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chamado-fotos');

-- Permite que a API delete fotos se necessario
CREATE POLICY "fotos_delete_api"
ON storage.objects FOR DELETE
USING (bucket_id = 'chamado-fotos');
```

Clique em **Run**. Deve aparecer `Success`.

**Como saber se deu certo:** Volte em Storage, clique no bucket `chamado-fotos`, e na aba Policies voce deve ver 3 regras listadas.

### 2.3 Criar o administrador

O admin e quem gerencia tudo: clientes, impressoras, tecnicos e chamados. Voce precisa criar o primeiro admin manualmente.

**Passo 1 — Criar o usuario no Auth do Supabase:**

1. No menu lateral, clique em **Authentication** (icone de cadeado)
2. Clique na aba **Users**
3. Clique em **Add user** > **Create new user**
4. Preencha:
   - **Email:** o e-mail do administrador (ex: `luciano@bruckerprinters.com.br`)
   - **Password:** uma senha forte (anote-a! o admin vai usar para fazer login)
   - **Auto Confirm User:** marque como **ON**
5. Clique em **Create user**
6. O usuario deve aparecer na lista. **Copie o UUID dele** (a primeira coluna, algo como `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

**Passo 2 — Registrar como admin na tabela:**

1. Va no **SQL Editor**
2. Cole o comando abaixo, **trocando os valores** pelos dados reais:

```sql
INSERT INTO admins (user_id, nome, email)
VALUES (
  'COLE-O-UUID-AQUI',
  'Luciano',
  'luciano@bruckerprinters.com.br'
);
```

3. Clique em **Run**. Deve aparecer `Success. 1 row affected`

**Como saber se deu certo:** Va no Table Editor, clique na tabela `admins`, e o nome do admin deve aparecer.

---

## Etapa 3 — Criar e-mail no cPanel da Hostgator (SMTP)

O sistema envia e-mails automaticos quando um chamado e criado, quando o status muda, etc. Para isso, ele usa um e-mail proprio do dominio, criado no cPanel da Hostgator.

### Passo a passo

1. Acesse o cPanel da Hostgator (`bruckerprinters.com.br:2083` ou `/cpanel`)
2. Procure a secao **E-mail** e clique em **Contas de e-mail** (ou **Email Accounts**)
3. Clique em **Criar** (ou **Create**) e preencha:
   - **E-mail:** `chamados`
   - **Dominio:** `bruckerprinters.com.br`
   - **Senha:** crie uma senha forte e **anote-a**
4. Clique em **Criar Conta**

> **Dica:** se quiser receber os e-mails tambem no Gmail, configure um encaminhamento (Forwarders) no cPanel para redirecionar `chamados@bruckerprinters.com.br` para o Gmail desejado.

5. Anote estas informacoes para usar na proxima etapa:

| Nome | Valor |
|------|-------|
| `SMTP_HOST` | `mail.bruckerprinters.com.br` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `chamados@bruckerprinters.com.br` |
| `SMTP_PASS` | A senha que voce criou no passo 3 |
| `SMTP_FROM` | `Brucker Chamados <chamados@bruckerprinters.com.br>` |
| `NOTIFY_EMAILS` | `chamados@bruckerprinters.com.br` (e-mails que recebem aviso de novo chamado, separados por virgula) |

**Como saber se deu certo:** A conta de e-mail aparece na lista de contas do cPanel.

---

## Etapa 4 — Colocar a API no ar (Render)

A API e o "cerebro" do sistema. E ela que recebe as requisicoes do painel, processa os dados, e fala com o banco e o e-mail. Ela vai ficar no Render porque a hospedagem compartilhada da Hostgator nao roda esse tipo de programa.

### 4.1 Criar conta no Render

1. Acesse `https://render.com`
2. Clique em **Get Started for Free**
3. Escolha **Sign up with GitHub** (isso ja conecta ao repositorio do projeto — mais facil)
4. Autorize o Render a acessar sua conta do GitHub

### 4.2 Criar o servico da API

1. No painel do Render, clique em **New +** (canto superior direito)
2. Selecione **Web Service**
3. Escolha **Build and deploy from a Git repository** e clique **Next**
4. Na lista de repositorios, encontre **brucker-printers** e clique **Connect**
   - Se o repositorio nao aparecer: clique em **Configure account**, selecione **All repositories** (ou pelo menos `brucker-printers`), e volte a tela anterior
5. Preencha o formulario exatamente assim:

```
+--------------------------------------------------+
|  Create Web Service                              |
|                                                  |
|  Name:              brucker-api                  |
|  Region:            Oregon (US West)             |
|  Branch:            main                         |
|  Root Directory:    brucker-chamados/api         |
|  Runtime:           Node                         |
|  Build Command:     npm install                  |
|  Start Command:     node server.js               |
|                                                  |
|  Instance Type:     (*) Free                     |
+--------------------------------------------------+
```

> **O que e "Root Directory":** como o projeto tem varias pastas (site, web, api, mobile), voce precisa dizer ao Render qual pasta contem a API. E a `brucker-chamados/api`.

### 4.3 Configurar as variaveis de ambiente

Ainda na mesma tela de criacao, role para baixo ate a secao **Environment Variables**.

Clique em **Add Environment Variable** para cada linha da tabela abaixo. **Copie o nome (Key) exatamente como esta, em maiusculas, com underline:**

| Key (nome da variavel) | Value (valor) | De onde vem |
|------------------------|---------------|-------------|
| `SUPABASE_URL` | `https://bzvzxecflpcvtlkxoulm.supabase.co` | Etapa 1 |
| `SUPABASE_SERVICE_KEY` | A chave `service_role secret` (longa, comeca com `eyJ`) | Etapa 1 |
| `SUPABASE_ANON_KEY` | A chave `anon public` (longa, comeca com `eyJ`) | Etapa 1 |
| `JWT_SECRET` | Invente uma frase longa e unica. Ex: `brucker-chamados-prod-2026-chave-segura-xk9m` | Voce inventa agora |
| `PORT` | `3001` | Fixo |
| `NODE_ENV` | `production` | Fixo |
| `FRONTEND_URL` | `*` | Temporario (vamos trocar depois) |
| `SMTP_HOST` | `mail.bruckerprinters.com.br` | Etapa 3 |
| `SMTP_PORT` | `465` | Etapa 3 |
| `SMTP_USER` | `chamados@bruckerprinters.com.br` | Etapa 3 |
| `SMTP_PASS` | A senha do e-mail criado no cPanel | Etapa 3 |
| `SMTP_FROM` | `Brucker Chamados <chamados@bruckerprinters.com.br>` | Etapa 3 |
| `NOTIFY_EMAILS` | `chamados@bruckerprinters.com.br` | Etapa 3 |

> **ATENCAO sobre o `JWT_SECRET`:** essa frase e usada para assinar os logins. Invente algo aleatorio e longo (30+ caracteres). NAO use algo obvio como "123456" ou "brucker". Se alguem descobrir essa frase, consegue forjar logins. **Anote-a** — se voce perder, todos os usuarios vao precisar fazer login de novo.

> **ATENCAO sobre o `FRONTEND_URL`:** estamos colocando `*` (asterisco) temporariamente porque ainda nao temos o subdominio pronto. Isso significa que qualquer site pode acessar a API. Vamos corrigir isso na Etapa 8.

### 4.4 Fazer o deploy

1. Clique em **Create Web Service**
2. O Render vai comecar a instalar tudo. Voce vai ver logs (texto branco em fundo preto) rolando na tela
3. Aguarde ate aparecer uma das seguintes mensagens:
   - `Your service is live` (em verde, no topo da pagina)
   - `API rodando em 0.0.0.0:3001` (nos logs)
4. Isso pode levar de 2 a 5 minutos. **Nao feche a pagina**
5. Quando estiver pronto, o Render mostra a URL do servico no topo da pagina:
   ```
   https://brucker-api.onrender.com
   ```
   (o nome exato pode variar se `brucker-api` ja estiver em uso — pode ser `brucker-api-abc1`)
6. **COPIE ESSA URL** e anote. Voce vai precisar dela na proxima etapa

### 4.5 Testar se a API esta funcionando

1. Abra uma nova aba do navegador
2. Acesse a URL da API seguida de `/api/health`. Exemplo:
   ```
   https://brucker-api.onrender.com/api/health
   ```
3. Deve aparecer algo como:
   ```json
   {"status":"ok","timestamp":"2026-04-12T14:30:00.000Z"}
   ```

**Se apareceu o JSON acima:** a API esta no ar. Prossiga para a proxima etapa.

**Se a pagina ficou carregando por muito tempo ou deu erro:**
- Na primeira vez pode demorar ate 30 segundos (o plano gratuito "adormece" quando nao esta em uso — isso e normal)
- Se deu "Application error", volte ao painel do Render, clique em **Logs** no menu lateral e procure mensagens de erro. Os erros mais comuns sao variaveis de ambiente escritas erradas

> **Sobre o plano gratuito do Render:** quando ninguem acessa a API por 15 minutos, ela "dorme". A proxima pessoa que acessar vai esperar cerca de 30 segundos na primeira vez. Depois disso, fica rapido. Para um uso inicial (poucos chamados por dia), isso nao e problema. Se incomodar, o plano pago custa $7/mes e elimina essa espera.

---

## Etapa 5 — Gerar o build do painel web

O "build" e o processo de transformar o codigo-fonte do painel em arquivos finais (HTML, CSS, JavaScript) prontos para serem servidos por qualquer hospedagem. E como "compilar" o sistema.

### 5.1 Baixar o codigo (se ainda nao tiver no computador)

Se voce ja tem a pasta `D:\Freelas\brucker-printers` no computador, pule para 5.2.

1. Abra o Prompt de Comando (Windows + R, digite `cmd`, Enter)
2. Digite:
   ```
   cd D:\Freelas
   git clone https://github.com/maxcanoas/brucker-printers.git
   ```
3. Aguarde o download terminar

### 5.2 Criar o arquivo de configuracao de producao

O painel web precisa saber qual e a URL da API e do Supabase. Essas informacoes ficam em um arquivo especial chamado `.env.production`.

1. Abra o Explorador de Arquivos do Windows
2. Navegue ate: `D:\Freelas\brucker-printers\brucker-chamados\web`
3. Verifique se ja existe um arquivo chamado `.env.production`:
   - Se ja existir, abra-o com o Bloco de Notas e edite o conteudo
   - Se nao existir, crie um arquivo novo:
     - Clique com o botao direito > **Novo** > **Documento de Texto**
     - Renomeie para `.env.production` (sem o `.txt` no final)
     - O Windows pode avisar sobre mudar a extensao — confirme clicando **Sim**

4. Abra o arquivo `.env.production` com o Bloco de Notas e coloque exatamente este conteudo (trocando pelos valores reais):

```
VITE_API_URL=https://brucker-api.onrender.com/api
VITE_SUPABASE_URL=https://bzvzxecflpcvtlkxoulm.supabase.co
VITE_SUPABASE_ANON_KEY=COLE_AQUI_A_CHAVE_ANON_PUBLIC
```

**Substituicoes:**
- Na primeira linha: troque `https://brucker-api.onrender.com` pela URL real que voce anotou na Etapa 4. **Mantenha o `/api` no final** — e obrigatorio
- Na segunda linha: se a URL do Supabase for a mesma, nao precisa mudar
- Na terceira linha: cole a chave `anon public` que voce anotou na Etapa 1

> **IMPORTANTE:** essas variaveis comecam com `VITE_` — sem esse prefixo, o sistema ignora a variavel. Copie exatamente como esta.

> **IMPORTANTE:** NAO coloque a `SUPABASE_SERVICE_KEY` aqui. O painel web e publico, qualquer pessoa pode ver o que esta dentro dele. Apenas a `anon public` vai aqui.

5. Salve e feche o arquivo

### 5.3 Gerar o build

1. Abra o Prompt de Comando (Windows + R, digite `cmd`, Enter)
2. Digite os comandos abaixo, **um por vez**, apertando Enter apos cada um:

```
cd D:\Freelas\brucker-printers\brucker-chamados\web
```

```
npm install
```

Aguarde a instalacao terminar (pode levar 1-2 minutos, vai aparecer bastante texto). Quando voltar a mostrar o cursor piscando, digite:

```
npm run build
```

3. Quando terminar, deve aparecer uma mensagem como:
   ```
   vite v8.0.0 building for production...
   ✓ 123 modules transformed.
   dist/index.html    0.45 kB │ gzip:  0.30 kB
   dist/assets/...    xxx kB │ gzip:  xxx kB
   ✓ built in 5.00s
   ```
4. Verifique que foi criada a pasta `dist` dentro de `web`:
   ```
   D:\Freelas\brucker-printers\brucker-chamados\web\dist\
   ```
   Dentro dela deve ter um arquivo `index.html` e uma pasta `assets`

### 5.4 Testar localmente (opcional, mas recomendado)

Antes de enviar para a Hostgator, voce pode ver se o build ficou bom:

1. No mesmo Prompt de Comando, digite:
   ```
   npm run preview
   ```
2. Vai aparecer algo como:
   ```
   ➜  Local:   http://localhost:4173/
   ```
3. Abra o navegador e acesse `http://localhost:4173`
4. Se a tela de login aparecer, o build esta correto
5. Volte ao Prompt de Comando e aperte `Ctrl+C` para parar o teste

**Como saber se deu certo:** Existe a pasta `dist` com `index.html` e `assets` dentro.

---

## Etapa 6 — Criar o subdominio na Hostgator

O painel de chamados vai ficar acessivel em `chamados.bruckerprinters.com.br`. Para isso, voce precisa criar um subdominio no cPanel da Hostgator.

### Passo a passo

1. Abra o navegador e acesse o cPanel da Hostgator. O endereco normalmente e um desses:
   - `https://bruckerprinters.com.br:2083`
   - `https://bruckerprinters.com.br/cpanel`
   - Ou o link direto que a Hostgator enviou por e-mail

2. Faca login com usuario e senha do cPanel (NAO e a senha do painel financeiro da Hostgator — e a senha do cPanel especificamente)

3. Na tela principal do cPanel, procure a secao **Dominios** (ou **Domains**)

4. Clique em **Subdominios** (ou **Subdomains**)

```
+--------------------------------------------------+
|  Criar um Subdominio                             |
|                                                  |
|  Subdominio:  [chamados]                         |
|  Dominio:     [bruckerprinters.com.br  v]        |
|  Raiz:        public_html/chamados               |
|               (preenchido automaticamente)        |
|                                                  |
|  [Criar]                                         |
+--------------------------------------------------+
```

5. Preencha:
   - **Subdominio:** `chamados`
   - **Dominio:** selecione `bruckerprinters.com.br` no dropdown
   - **Raiz do documento** (Document Root): o cPanel vai preencher automaticamente como `public_html/chamados`. **Deixe assim**
6. Clique em **Criar** (ou **Create**)
7. Deve aparecer uma mensagem de sucesso

> **Nota sobre DNS:** como o subdominio esta dentro da mesma hospedagem, ele normalmente fica ativo em poucos minutos. Em casos raros, pode levar ate 1 hora. Se `chamados.bruckerprinters.com.br` ainda nao funcionar apos 1 hora, entre em contato com o suporte da Hostgator.

> **Nota sobre SSL (https):** A Hostgator em planos compartilhados inclui SSL gratuito (AutoSSL). O subdominio novo deve receber SSL automaticamente em ate 24 horas. Se ao acessar o subdominio aparecer "Not Secure" ou "Nao seguro":
> - No cPanel, procure **SSL/TLS Status** (ou **Status SSL/TLS**)
> - Clique em **Run AutoSSL** (ou **Executar AutoSSL**)
> - Aguarde alguns minutos e tente novamente

**Como saber se deu certo:** Acessando `https://chamados.bruckerprinters.com.br` no navegador, deve aparecer a pagina padrao do cPanel (ou uma pagina em branco/vazia). Isso e esperado — na proxima etapa vamos enviar o conteudo real.

---

## Etapa 7 — Enviar o painel para a Hostgator

Agora voce vai enviar os arquivos do build (a pasta `dist`) para a Hostgator.

### 7.1 Compactar os arquivos

1. No Explorador de Arquivos do Windows, navegue ate:
   ```
   D:\Freelas\brucker-printers\brucker-chamados\web\dist
   ```
2. **Selecione TODOS os arquivos e pastas dentro de `dist`** (Ctrl+A)
   - Voce deve ver: `index.html`, pasta `assets`, e possivelmente outros arquivos
3. Clique com o botao direito > **Compactar para arquivo ZIP** (ou **Send to > Compressed folder**)
4. Nomeie o arquivo como `dist.zip`
5. O arquivo `dist.zip` deve ter sido criado dentro da pasta `dist`

### 7.2 Enviar para o cPanel

1. No cPanel da Hostgator, procure e clique em **Gerenciador de Arquivos** (ou **File Manager**)

2. Na arvore de pastas do lado esquerdo, navegue ate:
   ```
   public_html > chamados
   ```
   (essa pasta foi criada automaticamente quando voce criou o subdominio)

3. Se a pasta `chamados` tiver algum arquivo padrao (como `cgi-bin` ou `index.html` da Hostgator), **apague-os** (selecione > clique em **Excluir/Delete**)

4. Clique no botao **Carregar** (ou **Upload**) na barra de ferramentas do topo

5. Na tela de upload:
   - Clique em **Selecionar Arquivo** (ou **Select File**)
   - Navegue ate `D:\Freelas\brucker-printers\brucker-chamados\web\dist\dist.zip`
   - Selecione o `dist.zip` e clique **Abrir**
   - Aguarde o upload terminar (a barra de progresso deve chegar a 100%)

6. Clique em **Voltar** (ou **Go Back**) para retornar ao Gerenciador de Arquivos

7. Voce deve ver o `dist.zip` dentro de `public_html/chamados/`

8. **Extrair o ZIP:**
   - Clique com o botao direito no `dist.zip`
   - Selecione **Extract** (ou **Extrair**)
   - Na janela que abrir, confirme que o destino e `/public_html/chamados/`
   - Clique em **Extract Files**

9. Apos a extracao, voce deve ver:
   ```
   public_html/
     chamados/
       index.html       <-- esse e o importante
       assets/           <-- pasta com JS e CSS
       dist.zip          <-- pode apagar
   ```

10. **Apague o `dist.zip`** (selecione > Excluir) — ele nao e mais necessario

### 7.3 Criar o arquivo .htaccess (OBRIGATORIO)

Esse passo e **essencial**. Sem ele, quando alguem acessar `chamados.bruckerprinters.com.br/admin` diretamente (ou recarregar a pagina), vai aparecer um erro 404.

**Por que isso acontece:** O painel e uma SPA (Single Page Application). Ele tem um unico arquivo HTML (`index.html`), e o JavaScript muda o conteudo conforme a URL. O servidor (Apache da Hostgator) nao sabe disso — ele procura uma pasta chamada "admin" que nao existe. O `.htaccess` diz ao servidor: "se o arquivo nao existe, mande para o `index.html` e deixa o JavaScript resolver".

1. No Gerenciador de Arquivos do cPanel, certifique-se de que esta dentro de `public_html/chamados/`

2. Clique no botao **+ Arquivo** (ou **+ File**) na barra de ferramentas do topo

3. Nomeie o arquivo como `.htaccess` (comeca com ponto, sem extensao)
   - O cPanel pode avisar que arquivos com ponto sao ocultos — confirme

4. Clique com o botao direito no `.htaccess` que acabou de criar > **Editar** (ou **Edit**)
   - Se perguntar sobre codificacao (encoding), escolha **UTF-8** e clique em **Edit**

5. Cole este conteudo exatamente como esta:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

6. Clique em **Salvar Alteracoes** (ou **Save Changes**) e depois **Fechar**

> **Explicacao linha por linha (para curiosos):**
> - `RewriteEngine On` — liga o sistema de redirecionamento
> - `RewriteBase /` — define a raiz do subdominio como base
> - `RewriteRule ^index\.html$ - [L]` — se estao pedindo o proprio index.html, entrega normalmente
> - `RewriteCond %{REQUEST_FILENAME} !-f` — SE o arquivo pedido nao existe fisicamente...
> - `RewriteCond %{REQUEST_FILENAME} !-d` — E SE a pasta pedida nao existe fisicamente...
> - `RewriteRule . /index.html [L]` — ENTAO redireciona para o index.html (e o JavaScript cuida do resto)

### 7.4 Testar o subdominio

1. Abra o navegador (de preferencia em aba anonima: Ctrl+Shift+N no Chrome)
2. Acesse: `https://chamados.bruckerprinters.com.br`
3. Deve aparecer a tela de login do sistema (ou a tela inicial do painel)
4. Teste acessar diretamente `https://chamados.bruckerprinters.com.br/admin` — se a pagina carregar (mesmo que de erro de login), o `.htaccess` esta funcionando

**Se aparecer pagina em branco:**
- Aperte `F12` no navegador para abrir o console do desenvolvedor
- Clique na aba **Console**
- Se houver erros em vermelho mencionando arquivos nao encontrados, os caminhos dos assets podem estar errados. Verifique se os arquivos foram extraidos diretamente dentro de `chamados/` e nao dentro de uma subpasta extra

**Se aparecer erro 404:**
- Verifique se o `.htaccess` esta dentro de `public_html/chamados/` (nao em `public_html/`)
- Verifique se o conteudo foi copiado exatamente como mostrado acima

**Como saber se deu certo:** A tela de login do sistema aparece ao acessar `https://chamados.bruckerprinters.com.br`.

---

## Etapa 8 — Travar o CORS da API

Na Etapa 4, colocamos `FRONTEND_URL=*` como valor temporario. Isso significa que qualquer site da internet pode fazer requisicoes a sua API. Agora que o subdominio esta funcionando, vamos restringir para aceitar apenas o seu site.

> **O que e CORS:** e uma regra de seguranca dos navegadores. Quando o painel em `chamados.bruckerprinters.com.br` tenta se comunicar com a API em `brucker-api.onrender.com`, o navegador so permite se a API disser "sim, eu aceito requisicoes desse endereco". O CORS e essa permissao.

### Passo a passo

1. Acesse `https://dashboard.render.com`
2. Clique no servico **brucker-api** (ou o nome que voce deu)
3. No menu lateral esquerdo, clique em **Environment** (ou **Ambiente**)
4. Encontre a variavel `FRONTEND_URL`
5. Clique no icone de edicao (lapis) ao lado dela
6. Apague o `*` e coloque:
   ```
   https://chamados.bruckerprinters.com.br,http://localhost:5173
   ```
   (Mantemos o `localhost:5173` para que o sistema continue funcionando no modo desenvolvimento no seu computador)
7. Clique em **Save Changes**
8. O Render vai reiniciar o servico automaticamente. Aguarde 1-2 minutos

### Testar

1. Acesse `https://chamados.bruckerprinters.com.br`
2. Tente fazer login como admin
3. Se o login funcionar normalmente, o CORS esta correto

**Se aparecer erro de "Network Error" ou o login nao funcionar mais:**
- Volte no Render e verifique se a URL em `FRONTEND_URL` esta escrita **exatamente** como o endereco no navegador
- Sem barra no final (errado: `https://chamados.bruckerprinters.com.br/`)
- Com `https://` no comeco (errado: `chamados.bruckerprinters.com.br`)
- Se o SSL do subdominio ainda nao estiver ativo e voce estiver acessando com `http://`, coloque `http://chamados.bruckerprinters.com.br` tambem na lista (separado por virgula)

**Como saber se deu certo:** O login funciona normalmente apos a mudanca.

---

## Etapa 9 — Atualizar o link no site institucional

O site `bruckerprinters.com.br` tem links que apontam para `localhost:5173` (que so funciona no computador do desenvolvedor). Voce precisa troca-los para o endereco real.

### Passo a passo

1. No cPanel da Hostgator, abra o **Gerenciador de Arquivos** (File Manager)
2. Navegue ate `public_html/` (essa e a raiz do site principal)
3. Encontre o arquivo `index.html`
4. Clique com o botao direito > **Editar** (ou **Edit**)
   - Se perguntar sobre codificacao, escolha **UTF-8**
5. Use Ctrl+F (ou o botao de busca do editor) para procurar por:
   ```
   localhost:5173
   ```
6. Voce deve encontrar 2 ocorrencias:

   **Ocorrencia 1** (por volta da linha 213):
   ```html
   <a href="http://localhost:5173/cliente" class="nav-link nav-link--subtle" target="_blank" rel="noopener noreferrer">Area do Cliente</a>
   ```
   Troque por:
   ```html
   <a href="https://chamados.bruckerprinters.com.br/cliente" class="nav-link nav-link--subtle" target="_blank" rel="noopener noreferrer">Area do Cliente</a>
   ```

   **Ocorrencia 2** (por volta da linha 583):
   ```html
   <a href="http://localhost:5173/cliente" target="_blank" rel="noopener noreferrer">Area do Cliente</a>
   ```
   Troque por:
   ```html
   <a href="https://chamados.bruckerprinters.com.br/cliente" target="_blank" rel="noopener noreferrer">Area do Cliente</a>
   ```

7. Clique em **Salvar Alteracoes** (Save Changes) e depois **Fechar**

### Testar

1. Abra o navegador (aba anonima de preferencia)
2. Acesse `https://bruckerprinters.com.br`
3. Clique em **Area do Cliente**
4. Deve abrir a pagina `https://chamados.bruckerprinters.com.br/cliente` em uma nova aba

**Como saber se deu certo:** Clicar em "Area do Cliente" no site principal leva ao subdominio do sistema de chamados.

---

## Etapa 10 — Checklist final

Teste cada item abaixo. Se algum falhar, consulte a secao "Problemas comuns" no final deste documento.

- [ ] **API respondendo:** Acessar `https://brucker-api.onrender.com/api/health` (troque pela sua URL) mostra `{"status":"ok",...}`
- [ ] **Painel abrindo:** Acessar `https://chamados.bruckerprinters.com.br` mostra a tela de login
- [ ] **Login admin:** Entrar com e-mail e senha do admin (criado na Etapa 2.3) em `/admin`
- [ ] **Cadastrar cliente-teste:** No painel admin, cadastrar um cliente de teste com um codigo de acesso
- [ ] **Login cliente:** Em outra aba (ou aba anonima), acessar `/cliente` e fazer login com o codigo de acesso do cliente-teste
- [ ] **Abrir chamado com foto:** Logado como cliente, abrir um chamado, anexar uma foto, e confirmar que o chamado aparece no painel admin
- [ ] **Foto visivel:** No painel admin, abrir o chamado criado e conferir que a foto aparece
- [ ] **Atribuir tecnico:** No painel admin, atribuir um tecnico ao chamado e conferir que o status muda para "atribuido"
- [ ] **E-mail chegou:** Verificar se o e-mail de notificacao chegou na caixa de entrada configurada em `NOTIFY_EMAILS`
- [ ] **SPA funciona:** Acessar `https://chamados.bruckerprinters.com.br/admin` diretamente (digitando na barra de endereco, nao clicando em link) e a pagina carrega normalmente (testa o `.htaccess`)
- [ ] **Link no site:** Acessar `bruckerprinters.com.br` e clicar em "Area do Cliente" leva ao subdominio correto

**Se todos os itens acima estao marcados: o sistema web esta no ar!**

---

## Como atualizar o sistema no futuro

### Se mudar algo no painel web (telas, layout, cores, etc.)

O painel web e hospedado como arquivo estatico na Hostgator. As variaveis de configuracao (URL da API, Supabase) sao "embutidas" dentro do build. Entao toda vez que o codigo do painel mudar, voce precisa gerar um novo build e enviar para a Hostgator.

1. Abra o Prompt de Comando
2. Atualize o codigo:
   ```
   cd D:\Freelas\brucker-printers
   git pull
   ```
3. Gere o novo build:
   ```
   cd brucker-chamados\web
   npm install
   npm run build
   ```
4. Compacte o conteudo da pasta `dist` em um ZIP (como na Etapa 7.1)
5. No cPanel da Hostgator:
   - Abra o Gerenciador de Arquivos
   - Navegue ate `public_html/chamados/`
   - **Apague todos os arquivos existentes** (EXCETO o `.htaccess`)
   - Envie o novo ZIP e extraia (como na Etapa 7.2)
   - Apague o ZIP

> **ATENCAO:** Nao apague o `.htaccess`! Se apagar, as rotas do sistema vao parar de funcionar. Se isso acontecer, recrie seguindo a Etapa 7.3.

### Se mudar algo na API (regras de negocio, rotas, etc.)

A API esta no Render conectada ao GitHub. A atualizacao e automatica:

1. Faca o `git push` na branch `main`
2. O Render detecta a mudanca e refaz o deploy automaticamente
3. Aguarde 2-5 minutos para o novo deploy ficar no ar
4. Teste acessando `/api/health`

### Se mudar algo no site institucional

1. Edite o arquivo localmente
2. No cPanel > Gerenciador de Arquivos > `public_html/`
3. Envie o arquivo atualizado (substituindo o existente)

### Se mudar algo no banco de dados (nova tabela, nova coluna, etc.)

1. Acesse o Supabase > SQL Editor
2. Cole e execute o SQL da migracao

---

## Problemas comuns e solucoes

### "Pagina em branco" ao acessar o subdominio

**Causa provavel:** Os arquivos nao foram extraidos no local correto.

**Solucao:**
1. No cPanel > Gerenciador de Arquivos, confira que `public_html/chamados/index.html` existe (e nao `public_html/chamados/dist/index.html` — nesse caso os arquivos ficaram dentro de uma subpasta extra)
2. Se estiverem dentro de uma subpasta `dist/`, mova todo o conteudo para um nivel acima e apague a pasta `dist/` vazia

### "Erro 404" ao recarregar pagina em /admin ou /cliente

**Causa:** O `.htaccess` nao existe ou esta no lugar errado.

**Solucao:**
1. Confira que o arquivo `.htaccess` esta em `public_html/chamados/.htaccess`
2. No Gerenciador de Arquivos, ative a opcao "Mostrar arquivos ocultos" (Settings > Show Hidden Files) para ve-lo
3. Se nao existir, crie-o seguindo a Etapa 7.3

### "Network Error" ao fazer login

**Causa:** O painel nao consegue se comunicar com a API.

**Solucao:**
1. Verifique se a variavel `VITE_API_URL` no arquivo `.env.production` esta correta
2. A URL deve terminar com `/api` (ex: `https://brucker-api.onrender.com/api`)
3. **Apos corrigir o `.env.production`, voce PRECISA gerar o build novamente** (`npm run build`) e reenviar para a Hostgator. Ao contrario das variaveis da API no Render, as variaveis do Vite sao inseridas dentro do codigo durante o build — editar o `.env.production` sozinho nao muda nada no que ja esta no ar

### "CORS policy" no console do navegador

**Causa:** A API esta rejeitando requisicoes do painel porque o endereco nao esta na lista permitida.

**Solucao:**
1. No Render, verifique a variavel `FRONTEND_URL`
2. Ela deve conter a URL exata do subdominio (ex: `https://chamados.bruckerprinters.com.br`)
3. Sem barra no final
4. Com `https://` (ou `http://` se o SSL ainda nao estiver ativo)

### API demora para responder (30 segundos) na primeira vez do dia

**Causa:** O plano gratuito do Render "adormece" o servico apos 15 minutos sem uso.

**Solucao:** Isso e comportamento normal do plano gratuito. A primeira requisicao "acorda" o servico. As requisicoes seguintes sao rapidas. Se isso for um problema, faca upgrade para o plano pago do Render ($7/mes).

### "Credenciais invalidas" ao tentar fazer login como admin

**Causa:** O usuario admin nao foi criado corretamente no Supabase.

**Solucao:**
1. No Supabase > Authentication > Users, confirme que o usuario existe e tem status "Confirmed"
2. No Table Editor, confirme que existe um registro na tabela `admins` com o mesmo e-mail
3. O `user_id` na tabela `admins` deve ser o UUID do usuario no Auth
4. Se nada funcionar, delete o usuario e o registro e refaca a Etapa 2.3 do zero

### E-mail de notificacao nao chega

**Causa:** A senha do e-mail no cPanel esta incorreta ou o e-mail nao foi criado corretamente.

**Solucao:**
1. No cPanel, confirme que o e-mail `chamados@bruckerprinters.com.br` existe em **Contas de E-mail**
2. No Render, verifique as variaveis `SMTP_HOST` (`mail.bruckerprinters.com.br`), `SMTP_USER` (e-mail completo) e `SMTP_PASS` (senha do cPanel)
3. Verifique se o e-mail nao caiu na pasta de Spam do destinatario
4. Nos logs do Render (menu Logs), procure por mensagens de erro relacionadas a "SMTP" ou "email"

### Subdominio mostra "Not Secure" (nao seguro)

**Causa:** O certificado SSL ainda nao foi gerado para o subdominio.

**Solucao:**
1. No cPanel, procure **SSL/TLS Status** (ou **Status SSL/TLS**)
2. Encontre `chamados.bruckerprinters.com.br` na lista
3. Clique em **Run AutoSSL** (ou **Executar AutoSSL**)
4. Aguarde ate 30 minutos e tente acessar novamente
5. Se apos 24 horas ainda nao funcionar, entre em contato com o suporte da Hostgator

### Foto nao aparece no chamado / erro ao enviar foto

**Causa:** O bucket de fotos no Supabase nao foi criado ou as policies nao foram configuradas.

**Solucao:**
1. No Supabase > Storage, confirme que o bucket `chamado-fotos` existe (com hifen, tudo minusculo)
2. Confirme que esta marcado como **Public**
3. Na aba Policies do bucket, confirme que existem as 3 regras criadas na Etapa 2.2
4. Se faltar algo, refaca a Etapa 2.2

---

## Glossario

Termos tecnicos usados neste documento, explicados de forma simples:

| Termo | O que significa |
|-------|----------------|
| **SPA** (Single Page Application) | Tipo de site que carrega um unico arquivo HTML e muda o conteudo usando JavaScript, sem recarregar a pagina inteira. O painel de chamados e uma SPA |
| **Build** | Processo de "empacotar" o codigo-fonte em arquivos finais prontos para ir ao ar. O resultado fica na pasta `dist/` |
| **Variavel de ambiente (env var)** | Uma configuracao guardada fora do codigo (chaves secretas, URLs). Fica em um lugar separado para que o mesmo codigo funcione em diferentes ambientes (seu computador, producao, etc.) |
| **CORS** | Regra de seguranca dos navegadores que controla quais sites podem chamar quais APIs. Se o CORS estiver mal configurado, o painel nao consegue falar com a API |
| **SMTP** | Protocolo (forma padrao) usado para enviar e-mails. O cPanel da Hostgator oferece SMTP para enviar e-mails automaticos |
| **Conta de e-mail cPanel** | E-mail criado diretamente no cPanel da Hostgator. O sistema usa esse e-mail para enviar notificacoes automaticas via SMTP |
| **cPanel** | Painel de controle da hospedagem (Hostgator). E onde voce gerencia arquivos, subdominios, e-mails, etc. |
| **Subdominio** | Endereco filho de um dominio. `chamados.bruckerprinters.com.br` e um subdominio de `bruckerprinters.com.br` |
| **Cold start** | Demora de ~30 segundos na primeira requisicao quando o servidor estava "dormindo" (plano gratuito do Render) |
| **API** | Servidor que recebe pedidos, processa, e devolve respostas. O "cerebro" que fica entre o painel/app e o banco de dados |
| **Deploy** | Ato de colocar um sistema no ar (em producao). "Fazer o deploy" = publicar para os usuarios reais acessarem |
| **.htaccess** | Arquivo de configuracao do servidor Apache (que roda na Hostgator). Controla redirecionamentos, seguranca, etc. |
| **Node.js** | Plataforma que permite rodar JavaScript fora do navegador. A API do sistema e feita em Node.js |
| **Render** | Servico de hospedagem na nuvem. Usado aqui para rodar a API (Node.js) porque a Hostgator compartilhada nao suporta |
| **Supabase** | Servico de banco de dados na nuvem. Guarda todos os dados do sistema (clientes, chamados, fotos, etc.) |
| **GitHub** | Plataforma onde o codigo-fonte do projeto esta armazenado. O Render puxa o codigo de la automaticamente |

---

## Resumo visual

```
ANTES (so funciona no computador do desenvolvedor):
  Site institucional  --> localhost:5173/cliente  (nao funciona pra ninguem)
  API                 --> localhost:3001          (so roda no computador)

DEPOIS (funciona pra todo mundo na internet):
  Site institucional  --> chamados.bruckerprinters.com.br/cliente   (Hostgator)
  API                 --> brucker-api.onrender.com                  (Render)
  Banco de dados      --> bzvzxecflpcvtlkxoulm.supabase.co         (Supabase)
  Fotos               --> bzvzxecflpcvtlkxoulm.supabase.co/storage (Supabase Storage)
  E-mails             --> mail.bruckerprinters.com.br               (cPanel SMTP)
```

---

## Custos

| Servico | O que faz | Custo |
|---------|-----------|-------|
| **Hostgator** | Site institucional + painel de chamados | Voce ja paga (nao muda) |
| **Render** | API (backend) | Gratis (plano free). Pago: $7/mes (sem cold start) |
| **Supabase** | Banco de dados + fotos | Gratis ate 500MB de banco + 1GB de storage. Pago: $25/mes |
| **E-mail cPanel** | Envio de e-mails (SMTP) | Incluso na Hostgator |
| **Total extra** | | **R$ 0 no inicio** |

Para uso inicial (poucos chamados por dia), tudo funciona de graca. O unico custo e a Hostgator que voce ja paga.
