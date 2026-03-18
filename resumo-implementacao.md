# Brucker Printers - Resumo da Implementação (18/03/2026)

## Visão Geral

Sistema de chamados técnicos completo para a Brucker Printers, composto por:
- **Site institucional** (HTML/CSS/JS) — com botão "Abrir Chamado"
- **Frontend web de chamados** (React + Vite) — painel do cliente e painel do admin
- **API backend** (Node.js + Express) — REST API com autenticação JWT
- **App mobile** (React Native + Expo SDK 54) — para técnicos e administradores
- **Banco de dados** — PostgreSQL via Supabase

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Site institucional | HTML, CSS, JavaScript |
| Frontend web | React 19, Vite 8, React Router, Axios, Supabase JS |
| API | Node.js, Express, JWT, Supabase, Twilio (WhatsApp), PDFKit |
| Mobile | React Native 0.81.5, Expo SDK 54, Expo Router 6, AsyncStorage |
| Banco de dados | PostgreSQL (Supabase) |
| Notificações | Expo Push Notifications, Twilio WhatsApp |

---

## Estrutura de Diretórios

```
brucker-printers/
├── index.html                    # Site principal
├── impressoras.html              # Página de impressoras
├── css/style.css                 # Estilos do site
├── js/script.js                  # Scripts do site
├── brucker-chamados/
│   ├── api/                      # Backend API
│   │   ├── server.js             # Servidor Express
│   │   ├── .env                  # Variáveis de ambiente
│   │   ├── routes/
│   │   │   ├── auth.js           # Rotas de autenticação
│   │   │   ├── chamados.js       # Rotas de chamados
│   │   │   ├── clientes.js       # Rotas de clientes
│   │   │   ├── tecnicos.js       # Rotas de técnicos
│   │   │   ├── impressoras.js    # Rotas de impressoras
│   │   │   ├── relatorios.js     # Rotas de relatórios
│   │   │   └── admin.js          # Rotas do admin
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── chamadoController.js
│   │   │   ├── clienteController.js
│   │   │   ├── tecnicoController.js
│   │   │   ├── impressoraController.js
│   │   │   ├── relatorioController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   └── auth.js           # Middleware JWT (admin, tecnico, cliente)
│   │   ├── services/
│   │   │   ├── supabase.js       # Cliente Supabase
│   │   │   ├── whatsapp.js       # Notificações WhatsApp (Twilio)
│   │   │   ├── notifications.js  # Push notifications (Expo)
│   │   │   └── pdf.js            # Geração de PDF (PDFKit)
│   │   └── database/
│   │       └── migration.sql     # Schema do banco
│   ├── web/                      # Frontend web (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── cliente/
│   │   │   │   │   ├── LoginCliente.jsx
│   │   │   │   │   └── DashboardCliente.jsx
│   │   │   │   └── admin/
│   │   │   │       ├── LoginAdmin.jsx
│   │   │   │       └── DashboardAdmin.jsx
│   │   │   ├── contexts/AuthContext.jsx
│   │   │   ├── hooks/useRealtime.js
│   │   │   ├── components/
│   │   │   └── lib/api.js
│   │   └── .env
│   └── mobile/                   # App mobile (Expo)
│       ├── app/
│       │   ├── _layout.js        # Layout raiz + listeners de notificação
│       │   ├── index.js          # Tela de login (técnico/admin)
│       │   ├── home.js           # Home do técnico
│       │   ├── admin-home.js     # Home do admin
│       │   ├── chamado/[id].js   # Detalhes do chamado (técnico + admin)
│       │   ├── relatorio.js      # Formulário de relatório
│       │   ├── perfil.js         # Perfil do técnico
│       │   └── historico.js      # Histórico
│       ├── lib/
│       │   ├── api.js            # Axios instance com interceptors
│       │   ├── theme.js          # Cores e constantes visuais
│       │   └── notifications.js  # Registro de push notifications
│       └── .env
```

---

## Configurações de Rede (Desenvolvimento Local)

### Alterações feitas para rodar no celular:

1. **mobile/.env** — Adicionado `http://` na URL da API:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.6:3001/api
   ```

2. **api/server.js** — CORS liberado para dev:
   ```js
   app.use(cors({ origin: true, credentials: true }));
   ```

3. **api/server.js** — API escutando em 0.0.0.0:
   ```js
   app.listen(PORT, '0.0.0.0', () => { ... });
   ```

4. **Firewall Windows** — Portas 3001 (API) e 8081/8082 (Expo) liberadas

### Para rodar localmente:

**Terminal 1 — API:**
```bash
cd brucker-chamados/api
npm run dev
```

**Terminal 2 — Expo (mobile):**
```bash
cd brucker-chamados/mobile
npx expo start -c
```

**Terminal 3 — Frontend web (opcional):**
```bash
cd brucker-chamados/web
npm run dev
```

**URLs locais:**
- API: http://localhost:3001
- Frontend web: http://localhost:5173
- Login cliente: http://localhost:5173/cliente
- Login admin: http://localhost:5173/admin

---

## Dependências do Mobile (Expo SDK 54)

As dependências foram atualizadas para compatibilidade com SDK 54:

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-router": "~6.0.23",
  "expo-notifications": "~0.32.16",
  "expo-linking": "instalado como dependência do expo-router v6",
  "expo-status-bar": "~3.0.9",
  "expo-asset": "~12.0.12",
  "expo-print": "~15.0.8",
  "expo-sharing": "~14.0.8",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

**Nota:** Pacotes `npx` e `start` espúrios foram removidos do package.json.

---

## Banco de Dados (Supabase)

### Tabelas principais:
- **clientes** — id, nome, email, telefone, codigo_acesso
- **admins** — id, user_id, nome, email, push_token
- **tecnicos** — id, user_id, nome, email, whatsapp, ativo, push_token
- **impressoras** — id, cliente_id, modelo, numero_serie, tipo_contrato, ativa
- **chamados** — id, numero, cliente_id, impressora_id, tecnico_id, tipo, urgencia, status, descricao, sla_horas, sla_vence_em
- **chamado_atualizacoes** — id, chamado_id, status_anterior, status_novo, observacao, usuario_tipo
- **relatorios_atendimento** — id, chamado_id, tecnico_id, descricao_servico, pecas_utilizadas, duracao_minutos

### SQLs executados manualmente no Supabase:
```sql
ALTER TABLE tecnicos ADD COLUMN push_token VARCHAR(500);
ALTER TABLE admins ADD COLUMN push_token VARCHAR(500);
```

### Supabase Auth:
- Admins e técnicos usam Supabase Auth (email/senha)
- Clientes usam código de acesso (BRK-XXXXXXXX), sem Supabase Auth

---

## Autenticação

| Tipo | Método | Endpoint | Retorno |
|---|---|---|---|
| Cliente | Código de acesso | POST /api/auth/cliente/login | JWT token + cliente |
| Admin | Email + senha (Supabase Auth) | POST /api/auth/admin/login | JWT token + admin |
| Técnico | Email + senha (Supabase Auth) | POST /api/auth/tecnico/login | JWT token + tecnico |

**JWT:** Expira em 24h. Payload inclui: id, nome, tipo (admin/tecnico/cliente).

---

## Push Notifications

### Fluxo implementado:

1. **Ao fazer login no app mobile**, o push token do Expo é obtido e enviado para a API
2. **API armazena** o push_token na tabela do usuário (admins ou tecnicos)
3. **Quando um chamado é criado** pelo cliente → todos os admins recebem push notification
4. **Quando um chamado é atribuído** a um técnico → o técnico recebe push notification
5. **Quando o status de um chamado muda** → técnico e admins recebem push notification
6. **Ao tocar na notificação** → o app navega direto para os detalhes do chamado

### Arquivos envolvidos:

**Mobile:**
- `mobile/lib/notifications.js` — Registro de permissões e push token
- `mobile/app/_layout.js` — Listeners de notificação + navegação ao tocar
- `mobile/app/index.js` — Registro do push token após login

**API:**
- `api/services/notifications.js` — Funções de envio via Expo Push API
- `api/controllers/chamadoController.js` — Chamadas de notificação em criarChamado, atribuirTecnico, atualizarStatus
- `api/controllers/tecnicoController.js` — Endpoint POST /tecnicos/me/push-token
- `api/controllers/adminController.js` — Endpoint POST /admin/push-token

---

## App Mobile — Funcionalidades

### Tela de Login (index.js)
- Seletor de perfil: **Técnico** ou **Admin**
- Autenticação via email + senha
- Registro automático de push token após login
- Redirect automático se já logado

### Home do Técnico (home.js)
- Lista de chamados atribuídos ao técnico
- Filtros: Em andamento / Concluídos
- Pull-to-refresh
- SLA com contagem regressiva
- Acesso ao perfil e logout

### Home do Admin (admin-home.js)
- Dashboard com contadores: Abertos, Em Atendimento, Aguardando Peça, SLA Vencido
- Lista de TODOS os chamados (não só os atribuídos)
- Filtros por status: Aberto, Em Atendimento, Aguardando Peça, Concluído
- Mostra técnico atribuído ou "Sem técnico atribuído"
- Pull-to-refresh

### Detalhes do Chamado (chamado/[id].js)
- Informações completas do chamado
- SLA com indicador visual
- **Se admin:** Seção para atribuir/reatribuir técnico (lista de técnicos ativos)
- **Se técnico:** Botões para atualizar status + campo de observação + encerrar com relatório
- Histórico de atualizações
- Relatório de atendimento (se concluído)

### Relatório (relatorio.js) — Somente técnico
- Descrição do serviço realizado
- Peças utilizadas
- Duração em minutos
- Encerra o chamado automaticamente

### Perfil (perfil.js) — Somente técnico
- Dados do técnico
- Métricas: total, concluídos, em andamento, % SLA

---

## Frontend Web — Funcionalidades

### Painel do Cliente (http://localhost:5173/cliente)
- Login por código de acesso
- Dashboard com contadores
- Abrir novo chamado (tipo, urgência, impressora, descrição)
- Listar e ver detalhes dos chamados
- Listar impressoras vinculadas
- Atualizações em tempo real (Supabase Realtime)

### Painel do Admin (http://localhost:5173/admin)
- Login por email/senha
- Dashboard com métricas e alertas de SLA
- Gestão de chamados: listar, filtrar, atualizar status, atribuir técnico
- Gestão de clientes: criar, listar, gerar código de acesso
- Gestão de impressoras: criar, listar, ativar/desativar
- Gestão de técnicos: criar, listar, ativar/desativar
- Relatórios: por período, por cliente, por técnico

---

## Site Institucional

### Botão "Abrir Chamado" adicionado:
- **Arquivo:** `index.html` (header, ao lado do botão WhatsApp)
- **Estilo:** Outline vermelho (classe `.btn-chamado` em `css/style.css`)
- **URL atual:** `http://localhost:5173/cliente` (trocar para URL de produção no deploy)

---

## Usuários de Teste

| Perfil | Login | Senha/Código |
|---|---|---|
| Admin | admin@brucker.com | admin123 |
| Técnico | tecnico@brucker.com | tec123 |
| Técnico (Max) | maxcanoas@gmail.com | 123456 |
| Cliente (Gráfica Express) | Código: BRK-GRAFICA1 | — |
| Cliente (Teste) | Código: BRK-TESTE01 | — |

---

## API — Endpoints Completos

### Autenticação
- `POST /api/auth/cliente/login` — Login cliente (codigo_acesso)
- `POST /api/auth/admin/login` — Login admin (email, senha)
- `POST /api/auth/tecnico/login` — Login técnico (email, senha)

### Chamados
- `POST /api/chamados` — Criar chamado (cliente)
- `GET /api/chamados` — Listar todos (admin)
- `GET /api/chamados/dashboard` — Dashboard admin
- `GET /api/chamados/meus` — Chamados do técnico logado
- `GET /api/chamados/:id` — Detalhes (autenticado)
- `PUT /api/chamados/:id` — Atualizar chamado (admin)
- `PUT /api/chamados/:id/atribuir` — Atribuir técnico (admin)
- `PUT /api/chamados/:id/status` — Atualizar status (técnico/admin)

### Clientes
- `GET /api/clientes/me` — Perfil do cliente
- `GET /api/clientes/me/chamados` — Chamados do cliente
- `GET /api/clientes/me/impressoras` — Impressoras do cliente
- `GET /api/clientes/me/dashboard` — Dashboard do cliente
- `POST /api/clientes` — Criar cliente (admin)
- `GET /api/clientes` — Listar clientes (admin)
- `GET /api/clientes/:id` — Detalhes (admin)
- `PUT /api/clientes/:id` — Atualizar (admin)
- `POST /api/clientes/:id/novo-codigo` — Gerar novo código (admin)

### Técnicos
- `GET /api/tecnicos` — Listar (admin)
- `POST /api/tecnicos` — Criar (admin)
- `PUT /api/tecnicos/:id` — Atualizar (admin)
- `DELETE /api/tecnicos/:id` — Desativar (admin)
- `GET /api/tecnicos/me` — Perfil (técnico)
- `GET /api/tecnicos/me/metricas` — Métricas (técnico)
- `POST /api/tecnicos/me/push-token` — Registrar push token (técnico)

### Impressoras
- `GET /api/impressoras/buscar/:numero_serie` — Buscar por série
- `GET /api/impressoras` — Listar (admin)
- `GET /api/impressoras/por-cliente/:cliente_id` — Por cliente
- `POST /api/impressoras` — Criar (admin)
- `PUT /api/impressoras/:id` — Atualizar
- `DELETE /api/impressoras/:id` — Desativar

### Relatórios
- `POST /api/relatorios` — Criar relatório (técnico)
- `GET /api/relatorios/:id/pdf` — Gerar PDF
- `GET /api/relatorios/mensal` — Relatório mensal

### Admin
- `GET /api/admin/dashboard` — Dashboard
- `POST /api/admin/push-token` — Registrar push token (admin)
- `GET /api/admin/relatorios/periodo` — Relatório por período
- `GET /api/admin/relatorios/clientes` — Relatório por cliente
- `GET /api/admin/relatorios/tecnicos` — Relatório por técnico

### Health Check
- `GET /api/health` — Status da API

---

## Fluxo Completo de um Chamado

1. **Cliente** acessa o site → clica em "Abrir Chamado" → faz login com código de acesso
2. **Cliente** preenche o formulário (tipo, urgência, impressora, descrição) → envia
3. **Admin** recebe **push notification** no celular → abre o app → vê o chamado
4. **Admin** atribui um técnico ao chamado (pelo app ou pelo painel web)
5. **Técnico** recebe **push notification** → abre o app → vê o chamado atribuído
6. **Técnico** atualiza o status (Em Atendimento → Aguardando Peça → etc.)
7. **Admin** recebe notificação de cada mudança de status
8. **Técnico** finaliza → preenche relatório de atendimento → chamado concluído
9. **Admin** pode gerar PDF do relatório pelo painel web

---

## Próximos Passos para Produção

### Antes do deploy:
- [ ] Trocar URL do botão "Abrir Chamado" no `index.html` de `localhost:5173` para URL de produção
- [ ] Reverter CORS em `api/server.js` para aceitar apenas origens específicas
- [ ] Atualizar `mobile/.env` com IP/domínio do servidor de produção
- [ ] Atualizar `web/.env` com URL da API de produção
- [ ] Configurar Twilio para notificações WhatsApp (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

### Para publicar o app nas lojas:
- [ ] Criar conta em expo.dev
- [ ] `npm install -g eas-cli && eas login`
- [ ] `eas build:configure`
- [ ] Google Play: conta de desenvolvedor ($25 única) → `eas build --platform android` → `eas submit --platform android`
- [ ] Apple App Store: conta Apple Developer ($99/ano) → `eas build --platform ios` → `eas submit --platform ios`

### Para testar no iOS:
- Precisa de iPhone/iPad com Expo Go
- Ou gerar build via EAS e instalar via link

---

## Variáveis de Ambiente

### api/.env
```
SUPABASE_URL=https://bzvzxecflpcvtlkxoulm.supabase.co
SUPABASE_SERVICE_KEY=<service_key>
SUPABASE_ANON_KEY=<anon_key>
JWT_SECRET=brucker-chamados-2026-chave-super-secreta-nao-compartilhar
TWILIO_ACCOUNT_SID=<configurar>
TWILIO_AUTH_TOKEN=<configurar>
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### web/.env
```
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://bzvzxecflpcvtlkxoulm.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

### mobile/.env
```
EXPO_PUBLIC_API_URL=http://192.168.0.6:3001/api
EXPO_PUBLIC_SUPABASE_URL=https://bzvzxecflpcvtlkxoulm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

---

## Problemas Resolvidos

1. **URL sem http://** no mobile/.env — Axios não conseguia fazer requisições
2. **CORS bloqueando** requisições do celular — alterado para `origin: true` em dev
3. **API ouvindo só em localhost** — alterado para `0.0.0.0`
4. **Dependências desatualizadas** do Expo — atualizadas de SDK 52/53 para SDK 54
5. **Pacote expo-linking faltando** — dependência do expo-router v6
6. **Pacote is-arrayish faltando** — dependência transitiva
7. **Ícone faltando** — removida referência a `./assets/icon.png` inexistente do app.json
8. **Erro TurboModuleRegistry PlatformConstants** — resolvido atualizando dependências
9. **Técnico não aparecia no app** — chamado precisava ser atribuído primeiro
10. **Admin sem acesso mobile** — implementado login admin + tela admin no app
