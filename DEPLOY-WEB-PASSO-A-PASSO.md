# Deploy do Sistema de Chamados — Passo a Passo

Este guia vai te levar do zero até o sistema funcionando na internet.
Você vai precisar de **3 serviços gratuitos** (que você já tem ou vai criar):

| Serviço | O que faz | Custo |
|---------|-----------|-------|
| **Supabase** | Banco de dados (já está funcionando) | Grátis |
| **Render** | Hospeda a API (backend) | Grátis |
| **Vercel** | Hospeda o site do sistema (frontend) | Grátis |

**Tempo estimado:** 30-45 minutos seguindo este guia.

---

## ANTES DE COMEÇAR

Você vai precisar ter em mãos:

1. **Sua conta do GitHub** (onde o código já está: github.com/maxcanoas/brucker-printers)
2. **Suas chaves do Supabase** — para encontrá-las:
   - Acesse https://supabase.com/dashboard
   - Clique no seu projeto
   - No menu lateral, vá em **Project Settings** (ícone de engrenagem)
   - Clique em **API** (dentro de Configuration)
   - Lá você vai encontrar:
     - **Project URL** — algo como `https://bzvzxecflpcvtlkxoulm.supabase.co`
     - **anon public** — uma chave longa que começa com `eyJ...`
     - **service_role secret** — outra chave longa (CLIQUE NO OLHINHO PARA REVELAR)
   - **Copie essas 3 informações** em um bloco de notas, vai precisar delas

---

## ETAPA 1 — Hospedando a API no Render

A API é o "cérebro" do sistema. Ela processa logins, gerencia chamados, etc.

### 1.1 Criar conta no Render

1. Acesse https://render.com
2. Clique em **Get Started for Free**
3. Escolha **Sign up with GitHub** (mais fácil, pois já conecta ao seu repositório)
4. Autorize o Render a acessar sua conta do GitHub

### 1.2 Criar o serviço da API

1. No painel do Render, clique no botão **New +** (canto superior direito)
2. Selecione **Web Service**
3. Na tela de conexão do repositório:
   - Se aparecer seus repos, selecione **brucker-printers**
   - Se não aparecer, clique em **Configure account** e dê acesso ao repositório
4. Após selecionar o repo, preencha o formulário:

| Campo | O que colocar |
|-------|---------------|
| **Name** | `brucker-api` |
| **Region** | Escolha **Oregon (US West)** ou o mais próximo |
| **Branch** | `main` |
| **Root Directory** | `brucker-chamados/api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

5. Em **Instance Type**, selecione **Free** (gratuito)

### 1.3 Configurar as variáveis de ambiente

Ainda na mesma tela de criação, role para baixo até a seção **Environment Variables**.
Clique em **Add Environment Variable** para cada item abaixo:

| Key (nome da variável) | Value (valor) |
|------------------------|---------------|
| `SUPABASE_URL` | A URL do seu projeto Supabase (ex: `https://bzvzxecflpcvtlkxoulm.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | A chave **service_role secret** do Supabase |
| `JWT_SECRET` | Invente uma frase secreta longa, ex: `brucker-chamados-producao-chave-2026-super-segura` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Deixe como `*` por enquanto (vamos atualizar depois) |

**IMPORTANTE:** Confira se digitou os nomes das variáveis exatamente como mostrado (em MAIÚSCULAS, com underline).

### 1.4 Fazer o deploy

1. Clique em **Create Web Service**
2. O Render vai iniciar o deploy. Você vai ver logs na tela mostrando o progresso
3. Aguarde até aparecer a mensagem **"Your service is live"** (pode levar 2-5 minutos)
4. Quando terminar, o Render vai mostrar a URL do seu serviço no topo da página, algo como:
   ```
   https://brucker-api.onrender.com
   ```
5. **COPIE ESSA URL** — você vai precisar dela na próxima etapa

### 1.5 Testar se a API está funcionando

1. Abra uma nova aba do navegador
2. Acesse: `https://brucker-api.onrender.com/api/health` (troque pela sua URL)
3. Se aparecer algo como `{"status":"ok","timestamp":"..."}`, a API está funcionando!

> **Nota sobre o plano gratuito do Render:** O serviço "adormece" após 15 minutos sem uso. O primeiro acesso após isso pode levar ~30 segundos para responder. Isso é normal no plano gratuito.

---

## ETAPA 2 — Hospedando o Frontend na Vercel

O frontend é o site que o admin e os clientes vão acessar pelo navegador.

### 2.1 Criar conta na Vercel

1. Acesse https://vercel.com
2. Clique em **Sign Up**
3. Escolha **Continue with GitHub**
4. Autorize a Vercel a acessar sua conta do GitHub

### 2.2 Importar o projeto

1. No painel da Vercel, clique em **Add New...** > **Project**
2. Na lista de repositórios, encontre **brucker-printers** e clique em **Import**
3. Na tela de configuração do projeto, preencha:

| Campo | O que colocar |
|-------|---------------|
| **Project Name** | `brucker-chamados` (ou o nome que quiser) |
| **Framework Preset** | A Vercel deve detectar **Vite** automaticamente. Se não detectar, selecione **Vite** |
| **Root Directory** | Clique em **Edit** e digite: `brucker-chamados/web` |

4. Clique na seção **Environment Variables** para expandir
5. Adicione as 3 variáveis abaixo (clique em **Add** após cada uma):

| Key (nome) | Value (valor) |
|------------|---------------|
| `VITE_API_URL` | A URL da sua API do Render + `/api` no final. Ex: `https://brucker-api.onrender.com/api` |
| `VITE_SUPABASE_URL` | A URL do seu projeto Supabase (ex: `https://bzvzxecflpcvtlkxoulm.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | A chave **anon public** do Supabase |

**IMPORTANTE:** As variáveis do frontend PRECISAM começar com `VITE_`. Sem esse prefixo, o Vite ignora a variável.

### 2.3 Fazer o deploy

1. Clique em **Deploy**
2. Aguarde o build finalizar (1-3 minutos). Você verá os logs do processo
3. Quando aparecer **"Congratulations!"** com uma prévia do site, está pronto!
4. A Vercel vai mostrar a URL do seu site, algo como:
   ```
   https://brucker-chamados.vercel.app
   ```
5. **COPIE ESSA URL**

### 2.4 Testar o frontend

1. Acesse `https://brucker-chamados.vercel.app/admin`
2. Faça login com as credenciais do admin
3. Se o painel carregar normalmente, está tudo funcionando!

> Se aparecer erro de "Network Error" ou tela em branco, veja a seção de **Problemas Comuns** no final deste guia.

---

## ETAPA 3 — Atualizar a URL do frontend no Render

Agora que você tem a URL do frontend, precisa dizer para a API qual é essa URL (para segurança do CORS).

1. Acesse https://dashboard.render.com
2. Clique no serviço **brucker-api**
3. No menu lateral, clique em **Environment**
4. Encontre a variável `FRONTEND_URL`
5. Clique no ícone de edição (lápis) e troque o valor de `*` para a URL do seu frontend:
   ```
   https://brucker-chamados.vercel.app
   ```
6. Clique em **Save Changes**
7. O Render vai reiniciar o serviço automaticamente (aguarde 1-2 minutos)

---

## ETAPA 4 — Atualizar o botão "Abrir Chamado" no site principal

O site institucional (bruckerprinters.com.br) tem um botão "Abrir Chamado" que atualmente aponta para `localhost`. Precisamos atualizar para a URL de produção.

1. Abra o arquivo `index.html` na raiz do projeto
2. Procure por `localhost:5173` (use Ctrl+F)
3. Troque todas as ocorrências por a URL do seu frontend:
   ```
   https://brucker-chamados.vercel.app
   ```
4. Salve o arquivo
5. Faça upload do `index.html` atualizado para o servidor do site institucional (o mesmo local onde o site já está hospedado)

---

## ETAPA 5 — Restringir o CORS (segurança)

Essa etapa impede que sites desconhecidos acessem sua API. Atualmente a API aceita requisições de qualquer lugar.

1. No seu computador, abra o arquivo: `brucker-chamados/api/server.js`
2. Encontre essa linha:
   ```js
   app.use(cors({
     origin: true,  // aceita qualquer origem em dev
     credentials: true
   }));
   ```
3. Troque por (substituindo pela URL real do seu frontend):
   ```js
   app.use(cors({
     origin: [
       'https://brucker-chamados.vercel.app',
       'http://localhost:5173'  // manter para desenvolvimento local
     ],
     credentials: true
   }));
   ```
4. Salve, faça commit e push:
   ```
   git add brucker-chamados/api/server.js
   git commit -m "Restringe CORS para URLs de produção e desenvolvimento"
   git push
   ```
5. O Render vai detectar o push automaticamente e refazer o deploy

---

## ETAPA 6 — Verificação final

Teste cada funcionalidade para garantir que tudo está funcionando:

- [ ] Acessar `/admin` e fazer login como administrador
- [ ] Acessar `/cliente` e fazer login com código de acesso
- [ ] Criar um novo cliente pelo painel admin
- [ ] Criar uma impressora vinculada ao cliente
- [ ] Criar um técnico
- [ ] Fazer login como cliente e abrir um chamado
- [ ] No painel admin, atribuir um técnico ao chamado
- [ ] Verificar se o dashboard mostra os números corretos

---

## DOMÍNIO PERSONALIZADO (opcional)

Se quiser usar um endereço como `chamados.bruckerprinters.com.br` em vez de `brucker-chamados.vercel.app`:

### Na Vercel:
1. Acesse seu projeto na Vercel
2. Vá em **Settings** > **Domains**
3. Digite `chamados.bruckerprinters.com.br` e clique **Add**
4. A Vercel vai mostrar as configurações DNS necessárias

### No painel DNS do seu domínio (onde o bruckerprinters.com.br está registrado):
1. Acesse o painel de gerenciamento de DNS
2. Crie um novo registro:
   - **Tipo:** CNAME
   - **Nome/Host:** `chamados`
   - **Valor/Destino:** `cname.vercel-dns.com`
   - **TTL:** 3600 (ou Automático)
3. Salve e aguarde a propagação (pode levar até 24h, mas geralmente é rápido)

### Após o domínio propagar:
1. Atualize a variável `FRONTEND_URL` no Render para `https://chamados.bruckerprinters.com.br`
2. Atualize o CORS no `server.js` adicionando a nova URL ao array
3. Atualize o botão "Abrir Chamado" no `index.html` com a nova URL

---

## PROBLEMAS COMUNS

### "Network Error" ou tela em branco no frontend
**Causa:** O frontend não consegue se comunicar com a API.
**Solução:**
1. Verifique se a variável `VITE_API_URL` na Vercel está correta
2. Certifique-se que termina com `/api` (ex: `https://brucker-api.onrender.com/api`)
3. Acesse a URL de health da API no navegador para verificar se está rodando
4. Após corrigir variáveis na Vercel, clique em **Deployments** > menu do último deploy > **Redeploy**

### Login retorna "Credenciais inválidas" para o admin
**Causa:** O usuário admin pode não existir no Supabase de produção.
**Solução:** Recrie o admin seguindo os mesmos passos que usou localmente (criar no Supabase Auth + inserir na tabela admins via SQL Editor).

### API demora para responder na primeira vez
**Causa:** O plano gratuito do Render "adormece" o serviço após 15min sem uso.
**Solução:** Isso é normal no plano gratuito. Para eliminar esse problema, faça upgrade para o plano pago do Render ($7/mês). Na prática, o primeiro acesso do dia pode levar ~30 segundos.

### O site atualiza no GitHub mas não na Vercel/Render
**Causa:** O deploy automático pode estar desabilitado.
**Solução:**
- **Vercel:** Vá em Settings > Git e verifique se "Auto Deploy" está habilitado
- **Render:** Vá em Settings e verifique se "Auto-Deploy" está como "Yes"

### Erro de CORS (mensagem no console do navegador)
**Causa:** A URL do frontend não está na lista de origens permitidas da API.
**Solução:** Verifique se a variável `FRONTEND_URL` no Render e o array `origin` no `server.js` contêm a URL exata do frontend (sem barra no final).

---

## CUSTOS

| Serviço | Plano Gratuito | Plano Pago (se precisar) |
|---------|----------------|--------------------------|
| **Supabase** | 500MB banco, 1GB transferência | $25/mês (8GB banco) |
| **Render** | API com "sleep" após 15min | $7/mês (sempre ligado) |
| **Vercel** | 100GB bandwidth | $20/mês (mais bandwidth) |
| **Total** | **R$ 0** | **~R$ 55-260/mês** se precisar |

Para um uso inicial/moderado (poucos chamados por dia), o plano gratuito de todos os serviços é suficiente.

---

## RESUMO RÁPIDO

```
1. Render.com  → Hospedar a API      → brucker-api.onrender.com
2. Vercel.com  → Hospedar o frontend  → brucker-chamados.vercel.app
3. Atualizar FRONTEND_URL no Render com a URL da Vercel
4. Atualizar botão "Abrir Chamado" no index.html
5. Restringir CORS no server.js
6. Testar tudo
```
