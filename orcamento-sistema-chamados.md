# Sistema de Chamados Tecnicos - Brucker Printers
## Documento de Escopo, Entregas e Estimativa de Horas

**Data:** 20/03/2026
**Projeto:** Sistema de Abertura e Gestao de Chamados Tecnicos
**Cliente:** Brucker Printers

---

## 1. Visao Geral do Projeto

Sistema completo para abertura, acompanhamento e gestao de chamados tecnicos, composto por tres camadas:

- **API Backend** — Servidor Node.js/Express com banco de dados PostgreSQL (Supabase)
- **Painel Web** — Interface React para clientes e administradores
- **Aplicativo Mobile** — App React Native/Expo para administradores e tecnicos (iOS e Android)

**Linhas de codigo desenvolvidas:** ~5.250 linhas
- API Backend: ~1.750 linhas
- Frontend Web: ~2.150 linhas
- App Mobile: ~1.350 linhas

---

## 2. Detalhamento das Entregas

---

### 2.1 BANCO DE DADOS E ARQUITETURA (Migration SQL + Supabase)

| Item | Descricao |
|------|-----------|
| Modelagem do banco | 7 tabelas: clientes, impressoras, tecnicos, chamados, chamado_atualizacoes, relatorios_atendimento, admins |
| Relacionamentos | Foreign keys com cascade delete entre todas as tabelas |
| Indices de performance | 8 indices otimizados para consultas frequentes (status, SLA, cliente, tecnico) |
| Sequencia automatica | Numeracao sequencial de chamados iniciando em 1000 |
| Triggers e Functions | 3 funcoes PostgreSQL: calculo automatico de SLA, atualizacao de timestamps, gestao de pausa/retomada de SLA |
| Seguranca (RLS) | Row-Level Security habilitado em todas as tabelas com politicas de acesso |
| Realtime | Publicacao em tempo real habilitada nas tabelas chamados e chamado_atualizacoes |

**Estimativa: 12 horas**

---

### 2.2 API BACKEND (Node.js + Express)

#### 2.2.1 Configuracao do Servidor e Infraestrutura

| Item | Descricao |
|------|-----------|
| Servidor Express | Configuracao completa com middlewares de seguranca |
| Helmet.js | Headers de seguranca HTTP |
| CORS | Controle de origens permitidas |
| Rate Limiting | Limite de 100 requisicoes por IP a cada 15 minutos |
| Morgan | Logging de requisicoes HTTP |
| Variáveis de ambiente | Configuracao via .env com .env.example documentado |
| Health check | Endpoint de verificacao de saude do servidor |

**Estimativa: 4 horas**

#### 2.2.2 Sistema de Autenticacao (JWT + Supabase Auth)

| Item | Descricao |
|------|-----------|
| Login de Cliente | Autenticacao por codigo de acesso (BRK-XXXX) |
| Login de Admin | Autenticacao por e-mail/senha via Supabase Auth |
| Login de Tecnico | Autenticacao por e-mail/senha via Supabase Auth |
| Geracao de JWT | Tokens com expiracao de 24 horas e payload por perfil |
| Middleware de autorizacao | 5 middlewares: autenticar, autenticarCliente, autenticarAdmin, autenticarTecnico, autenticarStaff |
| Controle de acesso por perfil | RBAC (Role-Based Access Control) em todas as rotas |

**Estimativa: 10 horas**

#### 2.2.3 Modulo de Clientes (CRUD + Gestao)

| Item | Descricao |
|------|-----------|
| Cadastro de cliente | Criacao com geracao automatica de codigo de acesso |
| Perfil do cliente | Consulta de dados pessoais pelo cliente autenticado |
| Listagem de clientes | Listagem completa para administradores |
| Detalhes do cliente | Consulta com impressoras vinculadas |
| Edicao de cliente | Atualizacao de nome, e-mail e telefone |
| Geracao de novo codigo | Invalidacao do codigo anterior e criacao de novo |
| Dashboard do cliente | Contadores de chamados por status |
| Chamados do cliente | Listagem de chamados proprios com filtro por status |
| Impressoras do cliente | Listagem de impressoras ativas vinculadas |

**Estimativa: 10 horas**

#### 2.2.4 Modulo de Chamados (Core do Sistema)

| Item | Descricao |
|------|-----------|
| Abertura de chamado | Criacao com validacao de impressora, tipo, urgencia, descricao |
| Calculo automatico de SLA | Critica: 8h, Alta: 16h, Normal: 24h |
| Listagem geral | Paginacao + filtros por status, cliente, tecnico |
| Detalhes do chamado | Dados completos com historico e relatorios |
| Atribuicao de tecnico | Vinculacao de tecnico ao chamado |
| Atualizacao de status | Fluxo: aberto > em_atendimento > aguardando_peca > concluido/cancelado |
| Gestao de SLA com pausa | Pausa automatica quando status = aguardando_peca, retomada ao sair |
| Historico de atualizacoes | Registro auditavel de todas as mudancas de status |
| Chamados do tecnico | Listagem filtrada dos chamados atribuidos |
| Dashboard admin | Metricas: abertos, em atendimento, SLA vencendo, concluidos hoje |

**Estimativa: 20 horas**

#### 2.2.5 Modulo de Impressoras

| Item | Descricao |
|------|-----------|
| Cadastro de impressora | Modelo, numero de serie, tipo de contrato, cliente vinculado |
| Busca por numero de serie | Com validacao de permissao por cliente |
| Listagem geral | Todas as impressoras com dados do cliente |
| Listagem por cliente | Impressoras filtradas por cliente especifico |
| Edicao de impressora | Atualizacao de dados |
| Desativacao | Inativacao sem exclusao |

**Estimativa: 6 horas**

#### 2.2.6 Modulo de Tecnicos

| Item | Descricao |
|------|-----------|
| Cadastro de tecnico | Criacao com usuario Supabase Auth automatico |
| Listagem de tecnicos | Tecnicos ativos para o admin |
| Edicao de tecnico | Atualizacao de dados |
| Desativacao | Inativacao do tecnico |
| Perfil do tecnico | Dados pessoais do tecnico autenticado |
| Metricas do tecnico | Total, concluidos, em andamento, % de SLA cumprido |
| Registro de push token | Armazenamento do token Expo para notificacoes |

**Estimativa: 8 horas**

#### 2.2.7 Modulo de Relatorios e PDF

| Item | Descricao |
|------|-----------|
| Criacao de relatorio de atendimento | Descricao do servico, pecas, duracao — conclusao automatica do chamado |
| Geracao de PDF | Documento com dados do chamado, cliente, tecnico e servico realizado |
| Relatorio mensal | Estatisticas agregadas por tipo, urgencia e SLA |
| Relatorio por periodo | Resumo com filtro por data inicio/fim |
| Relatorio por cliente | Agrupamento por cliente com taxa de SLA |
| Relatorio por tecnico | Agrupamento por tecnico com tempo medio e % SLA |

**Estimativa: 14 horas**

#### 2.2.8 Sistema de Notificacoes

| Item | Descricao |
|------|-----------|
| Push Notification (Expo) | Integracao com Expo Push API para envio de notificacoes |
| Notificacao de novo chamado | Envio para todos os admins quando chamado e aberto |
| Notificacao de atribuicao | Envio para tecnico quando chamado e atribuido |
| Notificacao de status | Envio para tecnico e admins quando status muda |
| WhatsApp (Twilio) | Integracao com Twilio para notificacoes via WhatsApp |
| Notificacao WhatsApp ao tecnico | Mensagem formatada ao atribuir chamado |
| Notificacao WhatsApp de status | Mensagem ao mudar status do chamado |
| Registro de push token admin | Armazenamento do token Expo do admin |

**Estimativa: 12 horas**

---

### 2.3 FRONTEND WEB (React + Vite)

#### 2.3.1 Infraestrutura e Configuracao

| Item | Descricao |
|------|-----------|
| Setup do projeto | React 19 + Vite 8 + React Router DOM |
| Cliente HTTP (Axios) | Instancia configurada com interceptors de autenticacao |
| Cliente Supabase | Configuracao para realtime no frontend |
| Contexto de autenticacao | AuthContext com persistencia em localStorage |
| Hook de realtime | useRealtimeChamados para atualizacoes em tempo real |
| Rotas protegidas | Componente RotaProtegida com verificacao de perfil |

**Estimativa: 6 horas**

#### 2.3.2 Componentes Reutilizaveis

| Item | Descricao |
|------|-----------|
| Modal | Componente modal generico com overlay, titulo, botao fechar e largura customizavel |
| StatusBadge | Badge colorido para status do chamado (5 estados) |
| UrgenciaBadge | Badge colorido para nivel de urgencia (3 niveis) |
| SlaIndicator | Indicador de SLA com contagem regressiva, alerta de vencimento e pausa |

**Estimativa: 5 horas**

#### 2.3.3 Area do Cliente (Web)

| Item | Descricao |
|------|-----------|
| Tela de login | Formulario com campo de codigo de acesso e branding |
| Dashboard do cliente | 4 contadores de status + navegacao por abas |
| Aba Chamados | Listagem de chamados com badges de status/urgencia e SLA |
| Aba Impressoras | Listagem de impressoras ativas com contrato |
| Modal abrir chamado | Busca de impressora por serie, selecao de tipo/urgencia, descricao |
| Modal detalhe chamado | Dados completos do chamado com historico de atualizacoes |
| Atualizacao em tempo real | Refresh automatico via Supabase Realtime |

**Estimativa: 16 horas**

#### 2.3.4 Painel Administrativo (Web)

| Item | Descricao |
|------|-----------|
| Tela de login admin | Formulario com e-mail/senha e branding administrativo |
| Layout com sidebar | Menu lateral com 6 secoes e indicador de secao ativa |
| Dashboard | 4 cards de KPI + alerta de SLA vencido |
| Gestao de Chamados | Listagem com filtros por status + modal de edicao completo |
| Modal do chamado | Detalhes, alteracao de status, atribuicao de tecnico, observacao, historico |
| Gestao de Clientes | Cards com dados, codigo de acesso, botoes de editar e detalhes |
| Modal novo cliente | Formulario de cadastro com exibicao do codigo gerado e botao copiar |
| Modal detalhes cliente | Codigo em destaque, copiar, gerar novo codigo, impressoras vinculadas, chamados recentes |
| Modal editar cliente | Edicao de nome, e-mail e telefone |
| Gestao de Impressoras | Listagem com modelo, serie, cliente, status ativo/inativo |
| Modal nova impressora | Formulario com selecao de cliente, modelo, serie, tipo de contrato |
| Gestao de Tecnicos | Listagem com nome, e-mail, WhatsApp, status ativo/inativo |
| Modal novo tecnico | Formulario com nome, e-mail, WhatsApp, senha |
| Modulo de Relatorios | Geracao de relatorios por periodo, por cliente e por tecnico com tabelas e resumos |

**Estimativa: 32 horas**

#### 2.3.5 Estilizacao e UI/UX

| Item | Descricao |
|------|-----------|
| Tema dark completo | Paleta coerente: fundo #0D1117, cards #141920, accent #E84C1E |
| Design responsivo | Grid adaptativo com media queries implicitas (auto-fill, minmax) |
| Feedback visual | Toast notifications para sucesso/erro em todas as acoes |
| Estados de loading | Indicadores de carregamento em formularios e listagens |
| Hover effects | Transicoes de cor em cards e botoes |

**Estimativa: 8 horas**

---

### 2.4 APLICATIVO MOBILE (React Native + Expo)

#### 2.4.1 Infraestrutura e Configuracao

| Item | Descricao |
|------|-----------|
| Setup Expo | Projeto Expo 54 com React Native 0.81 |
| Expo Router | Navegacao baseada em arquivos com Stack Navigator |
| Cliente HTTP | Axios com interceptors e AsyncStorage para token |
| Tema centralizado | Paleta de cores, mapeamento de status e urgencia |
| Configuracao app.json | Bundle ID iOS e Package Android: com.bruckerprinters.chamados |

**Estimativa: 6 horas**

#### 2.4.2 Sistema de Push Notifications

| Item | Descricao |
|------|-----------|
| Registro de permissoes | Solicitacao de permissao ao usuario |
| Canal Android | Configuracao de canal com prioridade HIGH |
| Obtencao de token | Expo Push Token com envio ao backend |
| Listener de notificacao | Recebimento com app aberto (alerta + som + badge) |
| Deep linking | Ao tocar na notificacao, abre detalhes do chamado |
| Layout root | Configuracao de listeners no _layout.js raiz |

**Estimativa: 10 horas**

#### 2.4.3 Tela de Login

| Item | Descricao |
|------|-----------|
| Selecao de perfil | Toggle entre Tecnico e Admin |
| Formulario | Campos de e-mail e senha |
| Autenticacao | Login via API com armazenamento em AsyncStorage |
| Auto-login | Verificacao de token salvo ao abrir o app |
| Redirecionamento | Tecnico vai para /home, Admin vai para /admin-home |
| Registro de push token | Registro automatico apos login bem-sucedido |

**Estimativa: 8 horas**

#### 2.4.4 Dashboard do Tecnico

| Item | Descricao |
|------|-----------|
| Lista de chamados | FlatList com chamados atribuidos ao tecnico |
| Filtros | Abas: Em Andamento / Concluidos |
| Card do chamado | Numero, status, urgencia, cliente, SLA restante |
| Pull-to-refresh | Atualizacao puxando a tela para baixo |
| Navegacao | Toque no card abre detalhes do chamado |
| Calculo de SLA | Indicador colorido de tempo restante |

**Estimativa: 10 horas**

#### 2.4.5 Dashboard do Admin (Mobile)

| Item | Descricao |
|------|-----------|
| Cards de metricas | 4 cards: Abertos, Em Atendimento, Aguardando Peca, SLA Vencido |
| Lista de chamados | Todos os chamados com info do tecnico atribuido |
| Filtros por status | 4 filtros: aberto, em_atendimento, aguardando_peca, concluido |
| Pull-to-refresh | Atualizacao por gesto |
| Navegacao para detalhes | Toque no chamado abre tela de detalhes |

**Estimativa: 10 horas**

#### 2.4.6 Tela de Detalhes do Chamado

| Item | Descricao |
|------|-----------|
| Dados completos | Cliente, tipo, urgencia, impressora, serie, descricao |
| Status do SLA | Indicador com tempo restante ou vencido |
| Atualizacao de status | Selecao de novo status com campo de observacao |
| Atribuicao de tecnico (admin) | Dropdown com lista de tecnicos ativos |
| Botao gerar relatorio (tecnico) | Navegacao para tela de relatorio |
| Historico | Timeline com todas as mudancas de status |
| Relatorio de atendimento | Exibicao do relatorio quando concluido |

**Estimativa: 14 horas**

#### 2.4.7 Tela de Perfil do Tecnico

| Item | Descricao |
|------|-----------|
| Dados pessoais | Nome, e-mail, WhatsApp |
| Cards de metricas | Total, Concluidos, Em Andamento, % SLA |
| Codigo de cores | Verde para SLA >= 80%, amarelo para >= 50%, vermelho para < 50% |
| Botao de logout | Limpa AsyncStorage e redireciona ao login |

**Estimativa: 4 horas**

#### 2.4.8 Tela de Relatorio de Atendimento

| Item | Descricao |
|------|-----------|
| Formulario | Descricao do servico (obrigatorio), pecas utilizadas, duracao em minutos |
| Validacao | Verificacao de campo obrigatorio |
| Envio | Criacao do relatorio + conclusao automatica do chamado |
| Redirecionamento | Volta para home apos sucesso |

**Estimativa: 6 horas**

---

## 3. Resumo de Horas por Modulo

| Modulo | Horas Estimadas |
|--------|:---------:|
| **Banco de Dados e Arquitetura** | **12h** |
| **API — Servidor e Infraestrutura** | **4h** |
| **API — Autenticacao** | **10h** |
| **API — Modulo de Clientes** | **10h** |
| **API — Modulo de Chamados** | **20h** |
| **API — Modulo de Impressoras** | **6h** |
| **API — Modulo de Tecnicos** | **8h** |
| **API — Relatorios e PDF** | **14h** |
| **API — Notificacoes (Push + WhatsApp)** | **12h** |
| **Web — Infraestrutura e Config** | **6h** |
| **Web — Componentes Reutilizaveis** | **5h** |
| **Web — Area do Cliente** | **16h** |
| **Web — Painel Administrativo** | **32h** |
| **Web — Estilizacao e UI/UX** | **8h** |
| **Mobile — Infraestrutura e Config** | **6h** |
| **Mobile — Push Notifications** | **10h** |
| **Mobile — Tela de Login** | **8h** |
| **Mobile — Dashboard Tecnico** | **10h** |
| **Mobile — Dashboard Admin** | **10h** |
| **Mobile — Detalhes do Chamado** | **14h** |
| **Mobile — Perfil do Tecnico** | **4h** |
| **Mobile — Relatorio de Atendimento** | **6h** |
| | |
| **TOTAL GERAL** | **231 horas** |

---

## 4. Resumo por Camada

| Camada | Horas | % do Total |
|--------|:-----:|:----------:|
| Banco de Dados | 12h | 5% |
| API Backend | 84h | 36% |
| Frontend Web | 67h | 29% |
| Aplicativo Mobile | 68h | 30% |
| **TOTAL** | **231h** | **100%** |

---

## 5. Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js** — Servidor e rotas REST
- **PostgreSQL** (Supabase) — Banco de dados com RLS e Realtime
- **JWT** (jsonwebtoken) — Autenticacao por token
- **Twilio** — Notificacoes via WhatsApp
- **Expo Push API** — Notificacoes push mobile
- **PDFKit** — Geracao de relatorios em PDF
- **Helmet** / **CORS** / **Rate Limit** — Seguranca

### Frontend Web
- **React 19** — Biblioteca de interface
- **Vite 8** — Build tool
- **React Router DOM 7** — Navegacao SPA
- **Axios** — Cliente HTTP
- **Supabase JS** — Realtime no frontend
- **React Hot Toast** — Notificacoes visuais
- **Lucide React** — Icones

### Mobile
- **React Native 0.81** — Framework mobile cross-platform
- **Expo 54** — Plataforma de build e distribuicao
- **Expo Router** — Navegacao baseada em arquivos
- **Expo Notifications** — Push notifications
- **AsyncStorage** — Persistencia local
- **Axios** — Cliente HTTP

---

## 6. Funcionalidades Entregues (Resumo Executivo)

1. **Abertura de chamados pelo cliente** via codigo de acesso no site
2. **Notificacao push instantanea** no celular do admin ao abrir chamado
3. **Painel web administrativo** completo com dashboard, gestao de chamados, clientes, impressoras, tecnicos e relatorios
4. **Atribuicao de chamado ao tecnico** pelo admin (via web ou app)
5. **Notificacao push + WhatsApp** ao tecnico quando chamado e atribuido
6. **App mobile** para admin e tecnico (iOS e Android)
7. **Gestao de SLA** com calculo automatico, pausa e alerta de vencimento
8. **Relatorios de atendimento** com geracao de PDF
9. **Dashboard com metricas** em tempo real
10. **Historico completo** de todas as atualizacoes dos chamados
11. **Gestao de clientes** com geracao e regeneracao de codigos de acesso
12. **Relatorios gerenciais** por periodo, por cliente e por tecnico
 
---

*Documento gerado para fins de orcamento. As estimativas consideram um programador pleno com experiencia nas tecnologias utilizadas, incluindo desenvolvimento, testes basicos e ajustes.*
