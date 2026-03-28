
# Guia Completo de Implantacao - Sistema Brucker Printers

> **Data:** 22/03/2026
> **Projeto:** Site institucional + Sistema de Chamados Tecnicos (Web + API + App Mobile)
> **Dominio atual:** www.bruckerprinters.com.br

---

## INDICE

1. [Visao Geral do Sistema](#1-visao-geral-do-sistema)
2. [O Que Voce Precisa Ter/Contratar ANTES de Comecar](#2-o-que-voce-precisa-tercontratar-antes-de-comecar)
3. [ETAPA 1 - Banco de Dados (Supabase)](#3-etapa-1---banco-de-dados-supabase)
4. [ETAPA 2 - Servidor da API (Backend)](#4-etapa-2---servidor-da-api-backend)
5. [ETAPA 3 - Painel Web do Sistema de Chamados](#5-etapa-3---painel-web-do-sistema-de-chamados)
6. [ETAPA 4 - Atualizar o Site Institucional](#6-etapa-4---atualizar-o-site-institucional)
7. [ETAPA 5 - Notificacoes WhatsApp (Twilio)](#7-etapa-5---notificacoes-whatsapp-twilio)
8. [ETAPA 6 - App Mobile (Play Store e Apple Store)](#8-etapa-6---app-mobile-play-store-e-apple-store)
9. [ETAPA 7 - Testes Completos](#9-etapa-7---testes-completos)
10. [ETAPA 8 - Cadastros Iniciais (Primeiros Dados)](#10-etapa-8---cadastros-iniciais-primeiros-dados)
11. [Fluxo Completo: Como Tudo Funciona no Dia a Dia](#11-fluxo-completo-como-tudo-funciona-no-dia-a-dia)
12. [Custos Mensais Estimados](#12-custos-mensais-estimados)
13. [Manutencao e Monitoramento](#13-manutencao-e-monitoramento)
14. [Problemas Comuns e Solucoes](#14-problemas-comuns-e-solucoes)
15. [Glossario de Termos Tecnicos](#15-glossario-de-termos-tecnicos)

---

## 1. Visao Geral do Sistema

O sistema da Brucker Printers e composto por **4 partes** que trabalham juntas:

```
+----------------------------+       +----------------------------+
|   SITE INSTITUCIONAL       |       |   APP MOBILE               |
|   bruckerprinters.com.br   |       |   (Play Store / App Store) |
|                            |       |                            |
|   - Pagina inicial         |       |   - Login de Tecnico       |
|   - Pagina de impressoras  |       |   - Login de Admin         |
|   - Botao "Abrir Chamado"--+--+    |   - Ver chamados           |
+----------------------------+  |    |   - Atualizar status       |
                                |    |   - Gerar relatorio        |
                                |    +-------------+--------------+
                                |                  |
                                v                  v
                    +----------------------------+
                    |   PAINEL WEB (CHAMADOS)    |
                    |   chamados.bruckerprinters  |
                    |   .com.br                  |
                    |                            |
                    |   - Login do Cliente       |
                    |   - Login do Admin         |
                    |   - Abrir chamados         |
                    |   - Gerenciar tudo         |
                    +-------------+--------------+
                                  |
                                  v
                    +----------------------------+
                    |   API (SERVIDOR BACKEND)   |
                    |   api.bruckerprinters      |
                    |   .com.br                  |
                    |                            |
                    |   - Processa requisicoes   |
                    |   - Regras de negocio      |
                    |   - Autenticacao           |
                    +-------------+--------------+
                                  |
                                  v
                    +----------------------------+
                    |   BANCO DE DADOS           |
                    |   (Supabase/PostgreSQL)    |
                    |                            |
                    |   - Clientes               |
                    |   - Chamados               |
                    |   - Tecnicos               |
                    |   - Impressoras            |
                    +----------------------------+
```

### Quem usa o que:

| Pessoa         | O que usa                         | Como acessa                              |
|----------------|-----------------------------------|------------------------------------------|
| **Cliente**    | Site + Painel Web                 | Clica "Abrir Chamado" no site, loga com codigo de acesso |
| **Tecnico**    | App Mobile                        | Baixa o app na loja, loga com email/senha |
| **Admin**      | Painel Web + App Mobile           | Acessa o painel web OU o app             |

---

## 2. O Que Voce Precisa Ter/Contratar ANTES de Comecar

Antes de colocar tudo no ar, voce precisa ter estas contas e servicos contratados:

### 2.1 Contas OBRIGATORIAS (sem isso nao funciona)

| Servico | Para que serve | Custo | Link |
|---------|---------------|-------|------|
| **Supabase** | Banco de dados na nuvem | Gratis ate 500MB (plano Free) | https://supabase.com |
| **Render** ou **Railway** | Hospedar a API (servidor backend) | ~$7/mes (Render) ou ~$5/mes (Railway) | https://render.com ou https://railway.app |
| **Vercel** | Hospedar o Painel Web de chamados | Gratis (plano Hobby) | https://vercel.com |
| **Conta Google Play** | Publicar app Android na Play Store | $25 (unica vez) | https://play.google.com/console |
| **Conta Apple Developer** | Publicar app iOS na App Store | $99/ano (~R$500/ano) | https://developer.apple.com |
| **Conta Expo (EAS)** | Compilar o app para as lojas | Gratis ate 30 builds/mes | https://expo.dev |

### 2.2 Contas OPCIONAIS (melhoram a experiencia)

| Servico | Para que serve | Custo | Link |
|---------|---------------|-------|------|
| **Twilio** | Enviar notificacoes por WhatsApp | ~$0.05 por mensagem | https://twilio.com |
| **Dominio extra** | Subdominio `chamados.bruckerprinters.com.br` | Ja incluso no dominio atual | Painel da hospedagem |

### 2.3 O que voce JA TEM e vai continuar usando

- **Dominio:** bruckerprinters.com.br (ja ativo)
- **Hospedagem do site:** Onde o site atual esta hospedado (provavelmente um servidor com cPanel/Apache)
- **Supabase:** Ja existe um projeto criado (URL: `bzvzxecflpcvtlkxoulm.supabase.co`)

### 2.4 Ferramentas no seu computador (para fazer o deploy)

Voce precisa ter instalado no seu computador:

| Ferramenta | Para que serve | Como instalar |
|------------|---------------|---------------|
| **Node.js** (v18 ou superior) | Rodar o projeto localmente | https://nodejs.org (baixar LTS) |
| **Git** | Controle de versao e deploy | https://git-scm.com |
| **npm** | Instalar dependencias | Ja vem com o Node.js |

Para verificar se ja tem instalado, abra o terminal e digite:
```bash
node --version    # Deve mostrar v18.x.x ou superior
npm --version     # Deve mostrar 9.x.x ou superior
git --version     # Deve mostrar git version 2.x.x
```

---

## 3. ETAPA 1 - Banco de Dados (Supabase)

O banco de dados ja esta criado no Supabase. Mas voce precisa garantir que tudo esta configurado corretamente.

### 3.1 Acessar o Supabase

1. Va ate https://supabase.com e faca login
2. Voce deve ver o projeto ja criado (o URL e `bzvzxecflpcvtlkxoulm.supabase.co`)
3. Clique no projeto para abrir o painel

### 3.2 Verificar se as tabelas existem

1. No menu lateral esquerdo, clique em **"Table Editor"**
2. Voce deve ver estas 7 tabelas:
   - `admins`
   - `chamado_atualizacoes`
   - `chamados`
   - `clientes`
   - `impressoras`
   - `relatorios_atendimento`
   - `tecnicos`

**Se as tabelas NAO existirem**, voce precisa executar o script de migracao:

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Abra o arquivo `brucker-chamados/api/database/migration.sql` no seu computador
4. Copie TODO o conteudo do arquivo
5. Cole no editor SQL do Supabase
6. Clique no botao **"Run"** (ou pressione Ctrl+Enter)
7. Deve aparecer "Success" sem erros

### 3.3 Verificar o Realtime

O sistema usa atualizacoes em tempo real. Para verificar:

1. No menu lateral, clique em **"Database"** > **"Replication"**
2. Na secao "Realtime", verifique se as tabelas `chamados` e `chamado_atualizacoes` estao com o toggle **ligado**
3. Se nao estiverem, clique no toggle para ativar

### 3.4 Criar o primeiro usuario Admin no Supabase Auth

O admin loga com email/senha pelo Supabase Auth. Voce precisa criar esse usuario:

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Users"**
3. Clique no botao **"Add user"** > **"Create new user"**
4. Preencha:
   - **Email:** o email do administrador (ex: `admin@bruckerprinters.com.br`)
   - **Password:** uma senha forte (ex: `BruckerAdmin@2026!`)
   - Marque **"Auto Confirm User"**
5. Clique em **"Create user"**
6. **ANOTE** o `User UID` que aparece - voce vai precisar no proximo passo

### 3.5 Inserir o Admin na tabela `admins`

Agora voce precisa vincular o usuario Auth com a tabela admins:

1. Va em **"SQL Editor"**
2. Execute este comando (substitua os valores):

```sql
INSERT INTO admins (id, user_id, nome, email)
VALUES (
  gen_random_uuid(),
  'COLE_AQUI_O_USER_UID_DO_PASSO_ANTERIOR',
  'Nome do Administrador',
  'admin@bruckerprinters.com.br'
);
```

3. Clique em **"Run"**

### 3.6 Anotar as chaves do Supabase

Voce vai precisar dessas chaves em varias etapas. Para encontra-las:

1. No menu lateral, clique em **"Project Settings"** (icone de engrenagem)
2. Clique em **"API"**
3. Anote estas 3 informacoes:

```
SUPABASE_URL = https://bzvzxecflpcvtlkxoulm.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUz... (chave longa)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUz... (outra chave longa - NUNCA compartilhe esta!)
```

> **ATENCAO:** A `SERVICE_ROLE_KEY` e SECRETA. Ela da acesso total ao banco de dados. Nunca coloque ela no codigo do frontend ou do app. Ela so e usada no backend (API).

---

## 4. ETAPA 2 - Servidor da API (Backend)

A API e o "cerebro" do sistema. Ela recebe as requisicoes do painel web e do app, processa as regras de negocio, e salva/busca dados no banco.

### 4.1 Opcao A: Deploy no Render (RECOMENDADO para iniciantes)

O Render e a opcao mais simples para quem nao tem experiencia.

#### Passo 1: Criar conta no Render

1. Va ate https://render.com
2. Clique em **"Get Started for Free"**
3. Faca login com sua conta do GitHub (mais facil) ou crie uma conta com email

#### Passo 2: Subir o codigo para o GitHub

Se o projeto ainda nao esta no GitHub:

1. Crie uma conta em https://github.com se nao tiver
2. Crie um **novo repositorio** (pode ser privado):
   - Nome: `brucker-printers`
   - Deixe as opcoes padrao
3. No seu terminal, dentro da pasta do projeto:

```bash
cd D:/Freelas/brucker-printers
git remote add origin https://github.com/SEU_USUARIO/brucker-printers.git
git push -u origin main
```

> **Se ja tem remote configurado**, verifique com `git remote -v` e so faca o push.

#### Passo 3: Criar o servico Web no Render

1. No painel do Render, clique em **"New +"** > **"Web Service"**
2. Conecte seu repositorio GitHub:
   - Clique em **"Connect a repository"**
   - Autorize o Render a acessar seus repositorios
   - Selecione o repositorio `brucker-printers`
3. Configure o servico:

| Campo | Valor |
|-------|-------|
| **Name** | `brucker-api` |
| **Region** | `Oregon (US West)` ou `Ohio (US East)` (o mais proximo do Brasil) |
| **Branch** | `main` |
| **Root Directory** | `brucker-chamados/api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Starter` ($7/mes) ou `Free` (desliga apos 15 min inativo) |

> **IMPORTANTE:** O plano Free desliga o servidor apos 15 minutos sem uso, fazendo a proxima requisicao demorar ~30 segundos. Para um sistema de chamados em producao, use pelo menos o plano **Starter ($7/mes)**.

4. Clique em **"Advanced"** e adicione as **variaveis de ambiente**:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://bzvzxecflpcvtlkxoulm.supabase.co` |
| `SUPABASE_SERVICE_KEY` | (cole a Service Role Key do Supabase) |
| `SUPABASE_ANON_KEY` | (cole a Anon Key do Supabase) |
| `JWT_SECRET` | (crie uma senha longa e aleatoria, ex: `bkr-prod-2026-X7k9mP2qR5tY8wZ1`) |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://chamados.bruckerprinters.com.br` |
| `TWILIO_ACCOUNT_SID` | (deixe vazio por enquanto se nao configurou Twilio) |
| `TWILIO_AUTH_TOKEN` | (deixe vazio por enquanto) |
| `TWILIO_WHATSAPP_FROM` | (deixe vazio por enquanto) |

5. Clique em **"Create Web Service"**
6. Aguarde o deploy (pode levar 2-5 minutos)
7. Quando terminar, o Render vai gerar uma URL como: `https://brucker-api.onrender.com`

#### Passo 4: Testar a API

Abra o navegador e acesse:
```
https://brucker-api.onrender.com/api/health
```

Deve retornar:
```json
{"status": "ok", "timestamp": "2026-03-22T..."}
```

Se retornou isso, a API esta funcionando!

**ANOTE A URL DA API:** `https://brucker-api.onrender.com` (voce vai usar em varias etapas)

### 4.2 Opcao B: Deploy no Railway (alternativa)

Se preferir o Railway:

1. Acesse https://railway.app e crie uma conta
2. Clique em **"New Project"** > **"Deploy from GitHub repo"**
3. Selecione o repositorio
4. Clique em **"Add variables"** e adicione as mesmas variaveis de ambiente da Opcao A
5. Em **Settings** > **Root Directory**, coloque: `brucker-chamados/api`
6. Em **Settings** > **Start Command**, coloque: `node server.js`
7. O deploy e automatico

### 4.3 Configurar dominio personalizado para a API (OPCIONAL mas recomendado)

Em vez de usar `brucker-api.onrender.com`, voce pode usar `api.bruckerprinters.com.br`:

1. No painel do Render, va em **Settings** do servico
2. Em **"Custom Domains"**, clique em **"Add Custom Domain"**
3. Digite: `api.bruckerprinters.com.br`
4. O Render vai mostrar um registro DNS que voce precisa criar
5. Va no painel de DNS do seu dominio (onde voce registrou bruckerprinters.com.br)
6. Crie um registro:
   - **Tipo:** CNAME
   - **Nome:** `api`
   - **Valor:** (o que o Render mostrou, ex: `brucker-api.onrender.com`)
7. Aguarde a propagacao DNS (pode levar ate 24 horas, mas geralmente e rapido)

---

## 5. ETAPA 3 - Painel Web do Sistema de Chamados

O painel web e a interface onde os clientes abrem chamados e os administradores gerenciam tudo.

### 5.1 Deploy na Vercel (RECOMENDADO)

A Vercel e gratuita para projetos pessoais e perfeita para React/Vite.

#### Passo 1: Criar conta na Vercel

1. Va ate https://vercel.com
2. Clique em **"Sign Up"**
3. Faca login com GitHub (mais facil)

#### Passo 2: Importar o projeto

1. No painel da Vercel, clique em **"Add New..."** > **"Project"**
2. Selecione o repositorio `brucker-printers` do GitHub
3. Configure:

| Campo | Valor |
|-------|-------|
| **Project Name** | `brucker-chamados` |
| **Framework Preset** | `Vite` (a Vercel deve detectar automaticamente) |
| **Root Directory** | Clique em "Edit" e coloque: `brucker-chamados/web` |
| **Build Command** | `npm run build` (padrao) |
| **Output Directory** | `dist` (padrao) |

4. Em **"Environment Variables"**, adicione:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://brucker-api.onrender.com/api` (ou `https://api.bruckerprinters.com.br/api` se configurou dominio) |
| `VITE_SUPABASE_URL` | `https://bzvzxecflpcvtlkxoulm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (cole a Anon Key do Supabase) |

5. Clique em **"Deploy"**
6. Aguarde o build (1-2 minutos)
7. A Vercel vai gerar uma URL como: `https://brucker-chamados.vercel.app`

#### Passo 3: Configurar dominio personalizado

Para usar `chamados.bruckerprinters.com.br`:

1. No painel da Vercel, va no projeto > **"Settings"** > **"Domains"**
2. Digite: `chamados.bruckerprinters.com.br`
3. Clique em **"Add"**
4. A Vercel vai mostrar as configuracoes DNS necessarias
5. Va no painel de DNS do seu dominio e crie:
   - **Tipo:** CNAME
   - **Nome:** `chamados`
   - **Valor:** `cname.vercel-dns.com`
6. Volte na Vercel e clique em **"Verify"**
7. A Vercel vai gerar automaticamente um certificado SSL (HTTPS)

**ANOTE A URL DO PAINEL:** `https://chamados.bruckerprinters.com.br`

#### Passo 4: Atualizar a variavel FRONTEND_URL na API

Agora que voce tem a URL final do painel, atualize no Render:

1. Va ao painel do Render > seu servico `brucker-api`
2. Va em **"Environment"**
3. Edite a variavel `FRONTEND_URL` para: `https://chamados.bruckerprinters.com.br`
4. O Render vai fazer redeploy automatico

---

## 6. ETAPA 4 - Atualizar o Site Institucional

O site principal (bruckerprinters.com.br) tem um botao "Abrir Chamado" que atualmente aponta para `localhost:5173`. Voce precisa atualizar para a URL de producao.

### 6.1 Alterar o link do botao

1. Abra o arquivo `index.html` na raiz do projeto
2. Encontre a linha 144 (aproximadamente):

```html
<a href="http://localhost:5173/cliente" class="btn-header btn-chamado" target="_blank" rel="noopener noreferrer">Abrir Chamado</a>
```

3. Altere para:

```html
<a href="https://chamados.bruckerprinters.com.br/cliente" class="btn-header btn-chamado" target="_blank" rel="noopener noreferrer">Abrir Chamado</a>
```

### 6.2 Subir a alteracao para a hospedagem

O site institucional e HTML puro e esta hospedado no servidor atual (provavelmente via cPanel/FTP).

**Se voce usa cPanel:**

1. Acesse o cPanel da sua hospedagem
2. Va em **"Gerenciador de Arquivos"** (File Manager)
3. Navegue ate a pasta `public_html` (ou onde o site esta)
4. Encontre o arquivo `index.html`
5. Clique com botao direito > **"Edit"**
6. Encontre a linha com `localhost:5173` e substitua por `https://chamados.bruckerprinters.com.br/cliente`
7. Salve o arquivo

**Se voce usa FTP:**

1. Conecte-se ao servidor via FTP (FileZilla ou similar)
2. Navegue ate a pasta do site
3. Baixe o `index.html`, edite localmente, e suba novamente

### 6.3 Configurar subdominios no DNS

Voce precisa criar os subdominios no painel de DNS do seu dominio:

| Subdominio | Tipo | Valor | Para que serve |
|------------|------|-------|----------------|
| `chamados` | CNAME | `cname.vercel-dns.com` | Painel web de chamados |
| `api` | CNAME | `brucker-api.onrender.com` | Servidor da API |

**Como acessar o DNS:**
- Se o dominio esta na **Registro.br:** va em registrobr.br > Meus Dominios > DNS
- Se o dominio esta na **Hostinger:** Painel > DNS/Nameservers
- Se o dominio esta na **Locaweb:** Painel > Dominios > Zona DNS
- Se usa **Cloudflare:** Painel > DNS > Records

---

## 7. ETAPA 5 - Notificacoes WhatsApp (Twilio)

As notificacoes por WhatsApp sao **opcionais** mas muito uteis. Quando um chamado e atribuido a um tecnico, ele recebe uma mensagem no WhatsApp com os detalhes.

### 7.1 Criar conta no Twilio

1. Va ate https://www.twilio.com/try-twilio
2. Crie uma conta gratuita
3. Confirme seu email e telefone

### 7.2 Ativar o WhatsApp Sandbox (para testes)

1. No painel do Twilio, va em **"Messaging"** > **"Try it out"** > **"Send a WhatsApp message"**
2. O Twilio vai mostrar um numero de sandbox (ex: `+1 415 523 8886`)
3. Para testar, cada tecnico precisa enviar uma mensagem para esse numero com o codigo fornecido
4. Isso e so para testes. Para producao, voce precisa aprovar um numero proprio

### 7.3 Obter as credenciais

1. No painel do Twilio, va na **Dashboard** principal
2. Voce vera:
   - **Account SID:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token:** (clique para revelar) `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. O numero WhatsApp de envio e: `whatsapp:+14155238886` (sandbox)

### 7.4 Configurar no Render

1. Va ao painel do Render > seu servico `brucker-api`
2. Va em **"Environment"**
3. Atualize as variaveis:

| Key | Value |
|-----|-------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |

### 7.5 Para producao (numero proprio)

Para usar um numero proprio de WhatsApp (nao o sandbox):

1. No Twilio, va em **"Messaging"** > **"Senders"** > **"WhatsApp senders"**
2. Clique em **"Add WhatsApp Sender"**
3. Voce precisara de um numero de telefone verificado
4. O processo envolve aprovacao pela Meta (dona do WhatsApp) - pode levar dias
5. Voce precisa criar **templates de mensagem** que serao aprovados pela Meta
6. Apos aprovacao, atualize o numero no Render

> **NOTA:** O custo e de aproximadamente $0.05 (R$0.25) por mensagem enviada.

---

## 8. ETAPA 6 - App Mobile (Play Store e Apple Store)

Esta e a etapa mais complexa. O app e usado pelos **tecnicos** e **admins** para gerenciar chamados em campo.

### 8.1 Preparacao: Conta Expo (EAS)

#### Passo 1: Criar conta no Expo

1. Va ate https://expo.dev
2. Clique em **"Sign Up"**
3. Crie uma conta (pode usar GitHub)

#### Passo 2: Instalar as ferramentas

No seu terminal:

```bash
npm install -g eas-cli
eas login
```

Faca login com a conta que voce criou no Expo.

#### Passo 3: Criar o arquivo de configuracao EAS

Na pasta `brucker-chamados/mobile/`, crie o arquivo `eas.json`:

```json
{
  "cli": {
    "version": ">= 15.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "http://192.168.0.6:3001/api",
        "EXPO_PUBLIC_SUPABASE_URL": "https://bzvzxecflpcvtlkxoulm.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "COLE_A_ANON_KEY_AQUI"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://brucker-api.onrender.com/api",
        "EXPO_PUBLIC_SUPABASE_URL": "https://bzvzxecflpcvtlkxoulm.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "COLE_A_ANON_KEY_AQUI"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://brucker-api.onrender.com/api",
        "EXPO_PUBLIC_SUPABASE_URL": "https://bzvzxecflpcvtlkxoulm.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "COLE_A_ANON_KEY_AQUI"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      },
      "ios": {
        "appleId": "SEU_APPLE_ID@email.com",
        "ascAppId": "SEU_APP_ID_DA_APP_STORE_CONNECT",
        "appleTeamId": "SEU_TEAM_ID"
      }
    }
  }
}
```

#### Passo 4: Atualizar o app.json

Edite `brucker-chamados/mobile/app.json` para adicionar o `projectId`:

```bash
cd brucker-chamados/mobile
eas init
```

Isso vai automaticamente adicionar o `extra.eas.projectId` ao seu `app.json`.

### 8.2 Publicar na Google Play Store (Android)

#### Passo 1: Criar conta de desenvolvedor Google Play

1. Va ate https://play.google.com/console
2. Clique em **"Create developer account"**
3. Pague a taxa unica de **$25 (USD)**
4. Preencha todos os dados solicitados (nome, endereco, etc.)
5. Pode levar ate 48h para a conta ser aprovada

#### Passo 2: Criar o app na Play Console

1. No Google Play Console, clique em **"Create app"**
2. Preencha:
   - **App name:** `Brucker Chamados`
   - **Default language:** `Portugues (Brasil)`
   - **App or game:** `App`
   - **Free or paid:** `Free`
3. Aceite as declaracoes e clique em **"Create app"**

#### Passo 3: Preencher a ficha do app

A Google exige MUITAS informacoes antes de publicar. Va preenchendo cada secao:

**a) Store listing (Ficha da loja):**
- **Short description (ate 80 caracteres):**
  `Sistema de chamados tecnicos para clientes Brucker Printers.`
- **Full description (ate 4000 caracteres):**
  ```
  Brucker Chamados e o aplicativo oficial da Brucker Printers para gestao
  de chamados tecnicos.

  Com este aplicativo, tecnicos e administradores podem:
  - Visualizar chamados abertos e em andamento
  - Atualizar o status dos chamados em tempo real
  - Receber notificacoes push sobre novos chamados
  - Gerar relatorios de atendimento
  - Acompanhar metricas de desempenho e SLA

  Aplicativo exclusivo para equipe tecnica da Brucker Printers.
  ```
- **Screenshots:** Voce precisa de:
  - Pelo menos 2 screenshots do app (telefone)
  - Screenshots de tablet (opcionais)
  - Tire prints do app rodando no emulador/dispositivo
  - Tamanho recomendado: 1080x1920 pixels
- **Feature graphic:** Imagem de 1024x500 pixels (banner do app)
- **App icon:** 512x512 pixels (o Expo gera automaticamente se voce configurar no app.json)

**b) Content rating:**
- Responda o questionario de classificacao
- O app nao tem conteudo sensivel, entao a classificacao sera "Livre"

**c) Target audience:**
- Selecione a faixa etaria: `18+` (app empresarial)

**d) Privacy policy:**
- Voce precisa de uma URL com a politica de privacidade
- Pode criar uma pagina simples em: `bruckerprinters.com.br/privacidade`
- Use um gerador online gratuito se necessario

**e) Data safety:**
- Declare quais dados o app coleta:
  - Email (para login)
  - Nome (perfil)
  - Dados de uso (chamados)

#### Passo 4: Criar conta de servico para upload automatico

1. Va ate https://console.cloud.google.com
2. Crie um projeto (ou use um existente)
3. Va em **"IAM & Admin"** > **"Service Accounts"**
4. Clique em **"Create Service Account"**
5. Nome: `eas-submit`
6. Clique em **"Create and Continue"**
7. Papel: Nao precisa de papel especial (pule)
8. Clique em **"Done"**
9. Clique na conta criada > **"Keys"** > **"Add Key"** > **"Create new key"** > **JSON**
10. Um arquivo `.json` sera baixado. Renomeie para `google-service-account.json`
11. Coloque na pasta `brucker-chamados/mobile/`
12. **IMPORTANTE:** Adicione este arquivo ao `.gitignore`!

13. Agora vincule esta conta ao Play Console:
    - No Google Play Console, va em **"Setup"** > **"API access"**
    - Clique em **"Link"** para vincular o projeto Google Cloud
    - Na secao "Service accounts", encontre a conta criada
    - Clique em **"Manage Play Console permissions"**
    - De permissao de **"Release manager"** ou **"Admin"**
    - Salve

#### Passo 5: Compilar o APK/AAB

No terminal, na pasta `brucker-chamados/mobile/`:

```bash
# Primeiro build (Android) - gera o AAB para a Play Store
eas build --platform android --profile production
```

- O EAS vai perguntar se quer gerar um keystore automaticamente. **Diga sim.**
- **GUARDE O KEYSTORE!** Se perder, voce nao consegue atualizar o app na loja.
- O build roda na nuvem e pode levar 10-20 minutos
- Quando terminar, voce recebe um link para baixar o `.aab`

#### Passo 6: Enviar para a Play Store

```bash
eas submit --platform android --profile production
```

Ou, se preferir fazer manualmente:
1. Baixe o arquivo `.aab` do link gerado pelo EAS
2. No Google Play Console, va em **"Production"** > **"Create new release"**
3. Faca upload do `.aab`
4. Preencha as notas da versao (ex: "Lancamento inicial do app Brucker Chamados")
5. Clique em **"Review release"** > **"Start rollout to production"**

> **ATENCAO:** A primeira revisao da Google pode levar de **3 a 7 dias uteis**. Apps subsequentes sao mais rapidos (1-3 dias).

### 8.3 Publicar na Apple App Store (iOS)

#### Passo 1: Criar conta Apple Developer

1. Va ate https://developer.apple.com/programs/enroll/
2. Voce precisa de um **Apple ID**
3. Se for empresa (pessoa juridica), voce precisa de um **D-U-N-S Number**
   - Solicite gratuitamente em: https://developer.apple.com/enroll/duns-lookup/
   - Pode levar ate 2 semanas para obter
4. Se for pessoa fisica, o processo e mais simples
5. Pague a taxa anual de **$99 (USD)** (~R$500)
6. A aprovacao pode levar de 1 a 5 dias uteis

> **IMPORTANTE sobre iOS:** Voce precisa de um **Mac** (macOS) para algumas etapas do processo, OU usar o EAS Build que faz a compilacao na nuvem. Com o EAS, voce NAO precisa de um Mac.

#### Passo 2: Criar o App ID no Apple Developer Portal

1. Acesse https://developer.apple.com/account
2. Va em **"Certificates, Identifiers & Profiles"**
3. Clique em **"Identifiers"** > **"+"**
4. Selecione **"App IDs"** > **"App"**
5. Preencha:
   - **Description:** `Brucker Chamados`
   - **Bundle ID:** `com.bruckerprinters.chamados` (Explicit)
6. Em **"Capabilities"**, marque:
   - **Push Notifications** (para notificacoes)
7. Clique em **"Register"**

#### Passo 3: Criar o app na App Store Connect

1. Va ate https://appstoreconnect.apple.com
2. Clique em **"My Apps"** > **"+"** > **"New App"**
3. Preencha:
   - **Platforms:** iOS
   - **Name:** `Brucker Chamados`
   - **Primary Language:** `Portuguese (Brazil)`
   - **Bundle ID:** `com.bruckerprinters.chamados` (selecione o que criou)
   - **SKU:** `brucker-chamados-001`
4. Clique em **"Create"**

#### Passo 4: Preencher a ficha do app na App Store

Similar ao Android, voce precisa preencher:

**a) App Information:**
- **Subtitle:** `Gestao de chamados tecnicos`
- **Category:** `Business`
- **Content Rights:** Nao contem conteudo de terceiros

**b) Pricing and Availability:**
- **Price:** Free
- **Availability:** Brasil (ou todos os paises)

**c) Screenshots:**
- **iPhone 6.7" Display** (iPhone 15 Pro Max): pelo menos 3 screenshots (1290x2796)
- **iPhone 6.5" Display** (iPhone 14 Plus): pelo menos 3 screenshots (1284x2778)
- Voce pode usar a mesma imagem redimensionada

**d) Description:**
- Mesma descricao usada no Android

**e) Keywords:**
- `chamados,tecnico,impressoras,brucker,manutencao,suporte`

**f) Privacy Policy URL:**
- `https://bruckerprinters.com.br/privacidade`

**g) App Review Information:**
- Forneca credenciais de teste para os revisores da Apple:
  - **Email:** (um email de tecnico de teste)
  - **Password:** (a senha do tecnico de teste)
  - **Notes:** "This app is for internal use by Brucker Printers technicians. Use the provided credentials to log in as a technician."

#### Passo 5: Configurar Push Notifications para iOS

1. No Apple Developer Portal, va em **"Keys"**
2. Clique em **"+"** para criar uma nova chave
3. Nome: `Brucker Push Key`
4. Marque **"Apple Push Notifications service (APNs)"**
5. Clique em **"Register"** > **"Download"**
6. **GUARDE O ARQUIVO .p8** em lugar seguro (so pode baixar uma vez!)
7. Anote o **Key ID** e o **Team ID**

Para configurar com o Expo:

1. Va ate https://expo.dev > seu projeto
2. Va em **"Credentials"** > **"iOS"**
3. Faca upload da chave APNs (.p8)

OU configure via terminal:

```bash
eas credentials
```

E siga as instrucoes para configurar o push notification key.

#### Passo 6: Compilar para iOS

```bash
eas build --platform ios --profile production
```

- Na primeira vez, o EAS vai pedir para configurar certificados
- Selecione **"Let EAS handle it"** (mais facil)
- O build roda na nuvem (nao precisa de Mac!)
- Pode levar 15-30 minutos

#### Passo 7: Enviar para a App Store

```bash
eas submit --platform ios --profile production
```

- Voce precisara do Apple ID e senha (ou App-Specific Password)
- Para gerar uma App-Specific Password:
  1. Va em https://appleid.apple.com
  2. Em **"Sign-In and Security"** > **"App-Specific Passwords"**
  3. Gere uma nova senha
  4. Use essa senha quando o EAS pedir

#### Passo 8: Submeter para revisao

1. Va na App Store Connect > seu app
2. Selecione o build que foi enviado
3. Preencha as informacoes de revisao
4. Clique em **"Submit for Review"**

> **ATENCAO:** A revisao da Apple e rigorosa e pode levar de **1 a 7 dias**. Motivos comuns de rejeicao:
> - Screenshots nao correspondem ao app
> - Falta de politica de privacidade
> - Credenciais de teste invalidas
> - App crasha durante revisao
> - Descricao incompleta

### 8.4 Configurar icones e splash screen do app

Antes de fazer o build final, configure os icones:

1. Crie um icone de 1024x1024 pixels (PNG, sem transparencia para iOS)
2. Coloque na pasta `brucker-chamados/mobile/assets/icon.png`
3. Crie uma splash screen de 1284x2778 pixels
4. Coloque em `brucker-chamados/mobile/assets/splash.png`
5. Atualize o `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0D1117"
    }
  }
}
```

---

## 9. ETAPA 7 - Testes Completos

Antes de anunciar o sistema para os clientes, faca estes testes:

### 9.1 Teste da API

Abra o navegador ou use uma ferramenta como o Postman:

```
GET https://SUA-URL-API/api/health
```
Esperado: `{"status": "ok"}`

### 9.2 Teste do Painel Web (fluxo do Admin)

1. Acesse `https://chamados.bruckerprinters.com.br/admin`
2. Faca login com o email/senha do admin criado no Supabase
3. Verifique se o dashboard carrega
4. Teste criar um **cliente**:
   - Clique em "Clientes" > "Novo Cliente"
   - Preencha nome, email, telefone
   - Anote o **codigo de acesso** gerado (ex: `BRK-A1B2C3D4`)
5. Teste criar uma **impressora** para esse cliente:
   - Clique em "Impressoras" > "Nova Impressora"
   - Selecione o cliente, modelo, numero de serie
6. Teste criar um **tecnico**:
   - Clique em "Tecnicos" > "Novo Tecnico"
   - Preencha nome, email, WhatsApp, senha

### 9.3 Teste do Painel Web (fluxo do Cliente)

1. Acesse `https://chamados.bruckerprinters.com.br/cliente`
2. Digite o codigo de acesso do cliente criado (ex: `BRK-A1B2C3D4`)
3. Verifique se o dashboard carrega
4. Teste abrir um **chamado**:
   - Clique em "Abrir Chamado"
   - Selecione a impressora, tipo, urgencia
   - Escreva uma descricao
   - Envie
5. Verifique se o chamado aparece na lista

### 9.4 Teste do App Mobile

1. Instale o app no celular (via Expo Go para teste, ou pelo build)
2. Faca login como **tecnico** (email/senha do tecnico criado)
3. Verifique se os chamados aparecem
4. Teste atualizar o status de um chamado
5. Teste gerar um relatorio

### 9.5 Teste do Site

1. Acesse `https://bruckerprinters.com.br`
2. Clique no botao **"Abrir Chamado"**
3. Verifique se abre a pagina de login do cliente
4. Verifique se o formulario de contato (WhatsApp) funciona

### 9.6 Teste de Notificacoes Push

1. Com o app aberto em segundo plano no celular do tecnico
2. Atribua um chamado para esse tecnico pelo painel admin
3. Verifique se o tecnico recebe uma notificacao push
4. Toque na notificacao e verifique se abre o chamado correto

### 9.7 Teste de Tempo Real

1. Abra o painel admin em um computador
2. Abra o painel do cliente em outro navegador/aba
3. Mude o status de um chamado no painel admin
4. Verifique se a mudanca aparece automaticamente no painel do cliente (sem dar refresh)

---

## 10. ETAPA 8 - Cadastros Iniciais (Primeiros Dados)

Apos tudo configurado e testado, cadastre os dados reais:

### 10.1 Cadastrar Clientes

No painel admin (`/admin/dashboard`), secao "Clientes":

1. Clique em **"Novo Cliente"**
2. Para cada cliente da Brucker Printers, preencha:
   - **Nome:** Nome da empresa do cliente
   - **Email:** Email de contato
   - **Telefone:** Telefone de contato
3. O sistema gera automaticamente um **codigo de acesso** (ex: `BRK-A1B2C3D4`)
4. **ENVIE esse codigo para o cliente** - e com ele que o cliente faz login

### 10.2 Cadastrar Impressoras

Na secao "Impressoras", para cada impressora de cada cliente:

1. Clique em **"Nova Impressora"**
2. Preencha:
   - **Cliente:** Selecione o cliente dono da impressora
   - **Modelo:** Ex: "Ricoh Pro C5200"
   - **Numero de Serie:** O numero unico da impressora
   - **Tipo de Contrato:** "Locacao" ou "Venda"

### 10.3 Cadastrar Tecnicos

Na secao "Tecnicos":

1. Clique em **"Novo Tecnico"**
2. Preencha:
   - **Nome:** Nome completo
   - **Email:** Email do tecnico (sera usado para login no app)
   - **WhatsApp:** Numero com DDD (para notificacoes)
   - **Senha:** Senha para login no app
3. Envie o email e senha para o tecnico
4. Oriente o tecnico a **baixar o app** e fazer login

---

## 11. Fluxo Completo: Como Tudo Funciona no Dia a Dia

Aqui esta o fluxo completo de como o sistema funciona na pratica:

### Cenario: Cliente tem problema numa impressora

```
PASSO 1: CLIENTE ABRE O CHAMADO
==========================================
1. Cliente acessa bruckerprinters.com.br
2. Clica no botao "Abrir Chamado" no topo do site
3. E redirecionado para chamados.bruckerprinters.com.br/cliente
4. Digita seu codigo de acesso (ex: BRK-A1B2C3D4)
5. No dashboard, clica em "Abrir Chamado"
6. Seleciona a impressora com problema
7. Escolhe o tipo: Corretivo (conserto) ou Preventivo (manutencao)
8. Escolhe a urgencia:
   - Normal: prazo de 24 horas
   - Alta: prazo de 16 horas
   - Critica: prazo de 8 horas
9. Descreve o problema
10. Envia o chamado
    >> Numero do chamado gerado automaticamente (ex: #1001)
    >> SLA calculado automaticamente
    >> Admins recebem notificacao push

PASSO 2: ADMIN ATRIBUI UM TECNICO
==========================================
1. Admin ve a notificacao no app OU acessa o painel web
2. Abre o chamado #1001
3. Verifica os detalhes do problema
4. Atribui o chamado para um tecnico disponivel
   >> Tecnico recebe notificacao PUSH no app
   >> Tecnico recebe mensagem no WHATSAPP (se Twilio configurado)
   >> Status muda para "Em Atendimento"

PASSO 3: TECNICO ATENDE O CHAMADO
==========================================
1. Tecnico abre o app no celular
2. Ve o chamado atribuido com todos os detalhes
3. Vai ate o cliente resolver o problema
4. Se precisar de peca:
   - Muda status para "Aguardando Peca"
   - O SLA e PAUSADO automaticamente
   - Quando a peca chega, muda de volta para "Em Atendimento"
   - O SLA e RETOMADO de onde parou
5. Apos resolver, clica em "Finalizar e Gerar Relatorio"
6. Preenche o relatorio:
   - O que foi feito
   - Pecas utilizadas
   - Tempo gasto (em minutos)
7. Envia o relatorio
   >> Chamado muda para "Concluido" automaticamente
   >> Relatorio fica vinculado ao chamado

PASSO 4: ACOMPANHAMENTO
==========================================
- Cliente pode ver o status do chamado em tempo real no painel web
- Admin pode gerar relatorios:
  - Por periodo (ex: "chamados do mes de marco")
  - Por cliente (ex: "quantos chamados a empresa X abriu")
  - Por tecnico (ex: "quantos chamados o tecnico Y resolveu")
  - PDF de cada atendimento
- Tudo atualiza em tempo real (sem precisar dar F5)
```

---

## 12. Custos Mensais Estimados

### Cenario 1: Custo Minimo (comecando)

| Item | Custo Mensal | Observacao |
|------|-------------|------------|
| Supabase (Free) | R$ 0 | Ate 500MB de banco + 50K requisicoes Auth |
| Render (Starter) | ~R$ 35 | $7/mes - API sempre ligada |
| Vercel (Hobby) | R$ 0 | Gratuito para projetos pessoais |
| Expo (Free) | R$ 0 | 30 builds/mes |
| Dominio | ~R$ 40/ano | Ja existente |
| **TOTAL** | **~R$ 35/mes** | |

### Cenario 2: Custo com WhatsApp e Lojas

| Item | Custo Mensal | Observacao |
|------|-------------|------------|
| Supabase (Free) | R$ 0 | |
| Render (Starter) | ~R$ 35 | |
| Vercel (Hobby) | R$ 0 | |
| Twilio WhatsApp | ~R$ 25 | ~100 mensagens/mes |
| Apple Developer | ~R$ 42 | $99/ano dividido por 12 |
| Google Play | R$ 0 | $25 taxa unica (ja paga) |
| **TOTAL** | **~R$ 102/mes** | |

### Cenario 3: Escala (muitos clientes)

| Item | Custo Mensal | Observacao |
|------|-------------|------------|
| Supabase (Pro) | ~R$ 125 | $25/mes - 8GB banco + mais recursos |
| Render (Standard) | ~R$ 125 | $25/mes - mais performance |
| Vercel (Pro) | ~R$ 100 | $20/mes - se precisar de mais banda |
| Twilio WhatsApp | ~R$ 100+ | Variavel conforme uso |
| Apple Developer | ~R$ 42 | |
| **TOTAL** | **~R$ 492/mes** | |

---

## 13. Manutencao e Monitoramento

### 13.1 Monitorar a API

- **Render Dashboard:** https://dashboard.render.com
  - Verifique os logs para erros
  - Monitore uso de memoria e CPU
- **Health Check:** Acesse `https://SUA-URL-API/api/health` periodicamente
- O Render faz restart automatico se o servico cair

### 13.2 Monitorar o Banco de Dados

- **Supabase Dashboard:** https://supabase.com/dashboard
  - Monitore o tamanho do banco (limite free: 500MB)
  - Verifique os logs de autenticacao
  - Acompanhe o uso de requisicoes

### 13.3 Atualizar o App

Quando precisar fazer alteracoes no app:

1. Faca as alteracoes no codigo
2. Aumente a versao no `app.json`:
   ```json
   "version": "1.1.0"
   ```
3. Faca o build novamente:
   ```bash
   eas build --platform all --profile production
   ```
4. Envie para as lojas:
   ```bash
   eas submit --platform all --profile production
   ```
5. A revisao e mais rapida para atualizacoes (~1-2 dias)

### 13.4 Atualizar a API e o Painel Web

Se o codigo esta no GitHub, basta fazer push:

```bash
git add .
git commit -m "descricao da mudanca"
git push origin main
```

- **Render:** Detecta o push e faz redeploy automatico da API
- **Vercel:** Detecta o push e faz redeploy automatico do painel web

### 13.5 Backups

O Supabase faz backups automaticos do banco de dados:
- **Free plan:** Backups diarios retidos por 7 dias
- **Pro plan:** Backups diarios retidos por 30 dias + Point-in-time recovery

Para fazer backup manual:
1. No Supabase, va em **"Database"** > **"Backups"**
2. Clique em **"Download backup"**

---

## 14. Problemas Comuns e Solucoes

### "O botao Abrir Chamado nao abre nada"
**Causa:** O link ainda aponta para `localhost:5173`
**Solucao:** Edite o `index.html` do site e troque para a URL de producao

### "Erro 401 ao fazer login"
**Causa:** Token JWT invalido ou expirado
**Solucao:** Limpe o cache do navegador (Ctrl+Shift+Del) e tente novamente

### "A API retorna erro 500"
**Causa:** Alguma variavel de ambiente esta faltando ou incorreta
**Solucao:** Verifique no Render se todas as variaveis de ambiente estao configuradas

### "O app demora muito para carregar a primeira vez"
**Causa:** No plano Free do Render, o servidor desliga apos 15 min
**Solucao:** Use o plano Starter ($7/mes) para manter a API sempre ligada

### "Notificacao push nao chega"
**Causa:** Push token nao registrado
**Solucao:** O tecnico precisa abrir o app e aceitar a permissao de notificacoes. Depois, faca logout e login novamente.

### "WhatsApp nao envia mensagem"
**Causa:** Credenciais Twilio incorretas ou sandbox nao ativado
**Solucao:** Verifique as credenciais no Render. No sandbox, o tecnico precisa enviar a mensagem de opt-in primeiro.

### "App rejeitado pela Apple"
**Causas mais comuns:**
1. Falta de politica de privacidade → Crie uma pagina no site
2. Screenshots nao correspondem ao app → Tire novas screenshots
3. Credenciais de teste invalidas → Crie um tecnico de teste
4. App crasha → Verifique a URL da API no eas.json

### "Realtime nao atualiza automaticamente"
**Causa:** Realtime nao ativado no Supabase
**Solucao:** Va em Database > Replication e ative para as tabelas `chamados` e `chamado_atualizacoes`

### "Cliente nao consegue logar com o codigo"
**Causa:** Codigo de acesso incorreto
**Solucao:** No painel admin, va em Clientes, encontre o cliente e verifique/regenere o codigo

---

## 15. Glossario de Termos Tecnicos

| Termo | O que significa |
|-------|----------------|
| **API** | "Interface de Programacao" - e o servidor que processa os dados. Pense como o "cerebro" do sistema que recebe pedidos e devolve respostas |
| **Backend** | A parte do sistema que roda no servidor (nao visivel ao usuario) |
| **Frontend** | A parte do sistema que o usuario ve e interage (telas, botoes) |
| **Deploy** | O processo de colocar o sistema no ar (publicar na internet) |
| **Build** | O processo de compilar/preparar o codigo para producao |
| **DNS** | "Sistema de Nomes de Dominio" - traduz nomes como `bruckerprinters.com.br` em enderecos de servidor |
| **CNAME** | Tipo de registro DNS que aponta um dominio para outro |
| **SSL/HTTPS** | Certificado de seguranca que faz o cadeado verde aparecer no navegador |
| **JWT** | "JSON Web Token" - um "cartao de acesso digital" que identifica quem esta logado |
| **SLA** | "Service Level Agreement" - o prazo maximo para resolver um chamado |
| **Realtime** | Atualizacao automatica da tela sem precisar dar F5 |
| **Push Notification** | Notificacao que aparece no celular mesmo com o app fechado |
| **Supabase** | Servico de banco de dados na nuvem (onde os dados sao guardados) |
| **Render** | Servico de hospedagem de servidores (onde a API roda) |
| **Vercel** | Servico de hospedagem de sites/apps web (onde o painel roda) |
| **Expo/EAS** | Ferramenta que facilita compilar apps React Native para as lojas |
| **APK/AAB** | Arquivo do app Android. AAB e o formato exigido pela Play Store |
| **Bundle ID** | Identificador unico do app nas lojas (ex: com.bruckerprinters.chamados) |
| **Keystore** | Arquivo de seguranca usado para assinar o app Android - NAO PERCA |
| **cPanel** | Painel de controle de hospedagem de sites (onde o site atual esta) |
| **FTP** | Protocolo para transferir arquivos para o servidor |
| **Repositorio (GitHub)** | Onde o codigo-fonte fica armazenado na nuvem |

---

## Checklist Final de Implantacao

Use esta lista para acompanhar seu progresso:

- [ ] **Banco de Dados**
  - [ ] Tabelas criadas no Supabase
  - [ ] Realtime ativado
  - [ ] Admin criado no Supabase Auth
  - [ ] Admin inserido na tabela admins

- [ ] **API Backend**
  - [ ] Codigo no GitHub
  - [ ] Deploy no Render (ou Railway)
  - [ ] Variaveis de ambiente configuradas
  - [ ] Health check respondendo OK
  - [ ] Dominio personalizado (opcional): `api.bruckerprinters.com.br`

- [ ] **Painel Web**
  - [ ] Deploy na Vercel
  - [ ] Variaveis de ambiente configuradas
  - [ ] Dominio personalizado: `chamados.bruckerprinters.com.br`
  - [ ] Login admin funcionando
  - [ ] Login cliente funcionando

- [ ] **Site Institucional**
  - [ ] Botao "Abrir Chamado" atualizado com URL de producao
  - [ ] Registros DNS criados para subdominios
  - [ ] Pagina de politica de privacidade criada

- [ ] **WhatsApp (Twilio)**
  - [ ] Conta Twilio criada
  - [ ] Credenciais configuradas no Render
  - [ ] Teste de envio funcionando

- [ ] **App Android (Play Store)**
  - [ ] Conta Google Play Developer criada ($25)
  - [ ] App criado na Play Console
  - [ ] Ficha da loja preenchida (descricao, screenshots, etc.)
  - [ ] Build feito com EAS
  - [ ] App enviado para revisao
  - [ ] App aprovado e publicado

- [ ] **App iOS (App Store)**
  - [ ] Conta Apple Developer criada ($99/ano)
  - [ ] App criado na App Store Connect
  - [ ] Ficha da loja preenchida
  - [ ] Certificados de push configurados
  - [ ] Build feito com EAS
  - [ ] App enviado para revisao
  - [ ] App aprovado e publicado

- [ ] **Cadastros Iniciais**
  - [ ] Clientes cadastrados
  - [ ] Impressoras cadastradas
  - [ ] Tecnicos cadastrados
  - [ ] Codigos de acesso enviados aos clientes
  - [ ] Credenciais enviadas aos tecnicos

- [ ] **Testes**
  - [ ] Fluxo completo de abertura de chamado testado
  - [ ] Atribuicao de tecnico testada
  - [ ] Notificacoes push testadas
  - [ ] Relatorio de atendimento testado
  - [ ] Atualizacao em tempo real testada

---

## Contato e Suporte

Se tiver duvidas durante a implantacao, entre em contato com o desenvolvedor responsavel pelo sistema.

> **Este documento cobre TODO o processo necessario para colocar o sistema completo no ar.**
> **Siga as etapas na ordem apresentada e marque cada item do checklist conforme for concluindo.**
