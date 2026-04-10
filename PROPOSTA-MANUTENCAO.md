# Proposta de Manutenção Mensal — Sistemas Brucker Printers

---

## Visão Geral

Esta proposta abrange a manutenção de **2 sistemas completos** desenvolvidos sob medida para a Brucker Printers:

1. **Sistema de Chamados Técnicos** — plataforma online (web + app mobile + API + site)
2. **Sistema Desktop de Relatórios** — aplicativo Windows para gestão de parque de impressoras

Juntos, esses sistemas formam a espinha dorsal digital da operação da Brucker Printers. A seguir, cada um é detalhado para que fique claro o que foi construído, por que precisa de manutenção, e o que está incluído nesta proposta.

---

# SISTEMA 1: Gestão de Chamados Técnicos

## O que é este sistema?

É uma **plataforma completa de gestão de chamados técnicos** para assistência de impressoras. Ele permite que:

- **Clientes** abram chamados quando uma impressora apresenta problemas
- **Técnicos** recebam os chamados no celular, aceitem o serviço e registrem o que foi feito
- **Administradores** gerenciem tudo: clientes, técnicos, impressoras, prazos e relatórios

Não se trata de um site simples. É um **sistema profissional completo**, equivalente ao que empresas pagam dezenas de milhares de reais para desenvolver.

## O que foi construído (e precisa ser mantido)

O sistema é composto por **4 aplicações diferentes** que funcionam juntas:

### 1. Aplicativo Mobile (celular)
- Aplicativo para **Android e iOS**
- Usado por técnicos, administradores e clientes
- 7 telas diferentes com funcionalidades específicas para cada tipo de usuário
- Recebe **notificações push** em tempo real (como WhatsApp)
- Tecnologia: React Native com Expo

### 2. Painel Web (navegador)
- Acessado pelo computador para gestão administrativa
- Painel do cliente para acompanhar seus chamados
- Painel do administrador com controle total do sistema
- 5 páginas com dezenas de funcionalidades
- Tecnologia: React

### 3. Servidor / API (o "cérebro" do sistema)
- É o que conecta tudo: app, site, banco de dados, e-mails, WhatsApp
- Mais de **40 funcionalidades** diferentes (criar chamado, atribuir técnico, gerar relatório, etc.)
- Controla quem pode fazer o quê (segurança e permissões)
- Tecnologia: Node.js com Express

### 4. Site Institucional
- Página da empresa visível no Google
- Otimizado para aparecer nas buscas (SEO)
- Com rastreamento de visitas (Google Analytics)

### Banco de Dados na Nuvem
- **9 tabelas** com relacionamentos entre si
- Armazena todos os dados: clientes, impressoras, técnicos, chamados, avaliações, relatórios
- Regras automáticas de segurança e integridade dos dados
- Hospedado na nuvem (Supabase/PostgreSQL)

## Funcionalidades que precisam de manutenção contínua

### Sistema de Chamados (funcionalidade principal)
- Abertura de chamados com tipo de problema e nível de urgência
- **6 estados diferentes** que um chamado pode ter (aberto, atribuído, em atendimento, aguardando peça, concluído, cancelado)
- Regras de negócio que controlam quando e como cada mudança de estado pode acontecer
- Histórico completo de tudo que acontece com cada chamado

### Controle de Prazo (SLA)
- O sistema calcula automaticamente o prazo de **24 horas úteis** para atendimento
- Considera apenas **horário comercial** (segunda a sexta, 8h às 18h)
- Quando um chamado fica "aguardando peça", o relógio **pausa automaticamente**
- Quando retoma, o prazo é **recalculado** corretamente
- Esta é uma das lógicas mais complexas do sistema (~310 linhas de código só para isso)

### Sistema de Notificações (3 canais)
O sistema envia alertas automáticos por **3 canais diferentes**:

| Canal | Para quem | Quando |
|-------|-----------|--------|
| **E-mail** | Admins e clientes | Novo chamado, mudança de status, conclusão |
| **WhatsApp** | Técnicos e admins | Atribuição de chamado, alertas urgentes |
| **Push (celular)** | Todos os usuários | Atualizações em tempo real no app |

Cada canal usa um **serviço externo diferente** que precisa ser monitorado:
- E-mail: servidor SMTP (Gmail)
- WhatsApp: API do Twilio (serviço pago internacional)
- Push: API do Expo (serviço de notificações mobile)

### Relatórios e Exportação
O sistema gera **6 tipos de relatórios** diferentes:
1. Por período (semanal, mensal, etc.)
2. Por cliente
3. Por técnico
4. De cumprimento de prazo (SLA)
5. De peças utilizadas
6. Mensal consolidado

Cada relatório pode ser exportado em **2 formatos**: PDF e Excel (.xlsx)

### Sistema de Avaliação
- Clientes avaliam o serviço com nota de 1 a 5 estrelas
- Podem deixar comentários
- Admin visualiza estatísticas de satisfação

### Segurança
- Autenticação com tokens JWT (como um crachá digital que expira em 24h)
- 3 níveis de permissão (cliente, técnico, admin)
- Proteção contra ataques de força bruta (limite de tentativas de login)
- Proteção de cabeçalhos HTTP (Helmet)
- Controle de quais sites podem acessar a API (CORS)
- Segurança no banco de dados (Row Level Security)

---

# SISTEMA 2: Desktop de Relatórios (Monitor de Parque de Impressoras)

## O que é este sistema?

É um **aplicativo para Windows** que funciona instalado diretamente no computador da empresa. Ele serve para:

- **Cadastrar empresas e impressoras** que são atendidas pela Brucker Printers
- **Registrar leituras mensais** de cada impressora (contadores de páginas impressas em preto e branco e colorido)
- **Calcular automaticamente** o faturamento com base no volume de impressões e nos valores por clique
- **Gerar relatórios profissionais** de faturamento em PDF e Excel
- **Monitorar o parque de impressoras** com gráficos, alertas de contrato e alertas de ociosidade

É o sistema que a empresa usa para **cobrar seus clientes** com base no uso real das impressoras.

## O que foi construído (e precisa ser mantido)

### Aplicativo Windows
- Programa instalável com assistente de instalação (instala e desinstala como qualquer software)
- Interface gráfica profissional com menus, abas, formulários e gráficos
- Funciona sem internet (banco de dados local)
- Tecnologia: C# com WPF (.NET 9)

### Banco de Dados Local
- **4 tabelas**: Empresas, Impressoras, Leituras de Uso e Configurações
- Banco de dados SQLite (arquivo local, sem necessidade de servidor)
- **Backup automático diário** (mantém os últimos 30 backups)
- Backup manual também disponível

### Telas e Funcionalidades

| Tela | O que faz |
|------|-----------|
| **Painel Inicial (Dashboard)** | Mostra visão geral: total de impressoras, ativas, contratos vencendo. Exibe gráficos de receita e volume de impressões dos últimos 3, 6 ou 12 meses |
| **Gestão de Empresas** | Cadastro completo de empresas clientes (nome, endereço, CNPJ com validação). Cada empresa tem sua aba com lista de impressoras |
| **Gestão de Impressoras** | Cadastro de impressoras por empresa (modelo, série, localização, datas de contrato, status ativa/inativa). Controle de número de série único por empresa |
| **Relatórios Mensais** | Tela principal de trabalho: carrega leituras de contadores por mês, calcula valores automaticamente, permite edição e salva no banco |
| **Cadastro de Impressora** | Formulário para adicionar/editar impressoras com validação de dados e datas |

### Geração de Relatórios Profissionais
O sistema gera **demonstrativos de faturamento** com layout profissional:

- **Relatório PDF**: Documento formatado em paisagem com logo, cabeçalhos, tabela de dados com cores, totais por tipo (PB, Colorido, Locação) e resumo financeiro
- **Relatório Excel**: Planilha formatada com as mesmas informações, pronta para impressão em uma página A4, com cabeçalhos congelados e formatação profissional
- **Impressão direta**: Gera o PDF e abre automaticamente para impressão

### Gráficos e Monitoramento
- **Gráfico de Receita**: Barras empilhadas mostrando receita por tipo (Locação, Produção PB, Produção Colorida) ao longo dos meses
- **Gráfico de Volume**: Barras agrupadas mostrando volume de impressões PB vs Colorido
- **Alertas de Contrato**: Avisa quando contratos estão próximos do vencimento (30, 60, 90 dias), com cores de urgência (verde, amarelo, vermelho)
- **Alertas de Ociosidade**: Identifica impressoras que não tiveram nenhuma impressão no período

### Funcionalidades Técnicas
- Cálculo automático de valores: volume de impressões x valor por clique (PB e Colorido)
- Valores por clique configuráveis e salvos automaticamente
- Validação de CNPJ com algoritmo oficial da Receita Federal
- Validação de contadores (alerta se contador final for menor que o inicial)
- Sistema de log para rastreamento de erros
- Tratamento de erros amigável (mensagens em português, sem códigos técnicos)

---

# Por que esses sistemas precisam de manutenção?

## 1. Software não é como um móvel — ele "envelhece" sozinho

Um armário, depois de pronto, fica parado e funciona. Software não. O **ambiente ao redor muda constantemente**:

- O Windows atualiza e algo no programa desktop pode parar de funcionar
- O Android lança uma atualização e algo no app pode quebrar
- O iOS muda uma regra de segurança e o app precisa se adaptar
- Uma biblioteca que o sistema usa lança uma correção de segurança que precisa ser aplicada
- O Twilio (WhatsApp) muda a versão da API e as mensagens param de ser enviadas
- O Expo lança uma nova versão do SDK e o app precisa ser atualizado para continuar nas lojas
- O .NET lança uma nova versão e o programa desktop precisa ser adaptado

**Se ninguém cuida, os sistemas vão quebrando aos poucos.**

## 2. São 5 serviços externos que podem mudar a qualquer momento

| Serviço | O que faz | Risco se mudar |
|---------|-----------|----------------|
| **Supabase** | Banco de dados e autenticação | Sistema de chamados inteiro para de funcionar |
| **Twilio** | Envio de WhatsApp | Técnicos param de receber notificações |
| **Gmail SMTP** | Envio de e-mails | Clientes e admins ficam sem alertas |
| **Expo Push** | Notificações no celular | App fica "mudo" |
| **Google Analytics** | Métricas do site | Perde visibilidade de acessos |

## 3. São 5 aplicações para manter, não apenas 1

Manter esses sistemas é como cuidar de **5 projetos ao mesmo tempo**:

| Aplicação | Tecnologia | Plataforma |
|-----------|------------|------------|
| App Mobile | React Native / Expo | Android + iOS |
| Painel Web | React | Navegadores |
| API / Servidor | Node.js / Express | Nuvem (Render) |
| Site Institucional | HTML / CSS / JS | Nuvem (Vercel) |
| Programa Desktop | C# / WPF / .NET 9 | Windows |

- Uma alteração na API pode afetar o app mobile E o painel web
- Uma atualização no banco de dados precisa ser compatível com todos os sistemas que o acessam
- Cada plataforma tem suas próprias atualizações de segurança

## 4. App mobile exige atenção especial

Aplicativos publicados nas lojas (Google Play / App Store) precisam de:
- Atualizações periódicas para manter compatibilidade
- Novas builds quando o Expo ou React Native atualizam
- Adequação a novas políticas das lojas (privacidade, permissões, etc.)
- Se o app ficar desatualizado, **as lojas podem removê-lo**

## 5. Programa desktop também precisa de cuidado

- Atualizações do Windows podem causar incompatibilidades
- O .NET (plataforma que o programa usa) lança novas versões periodicamente
- As bibliotecas de geração de PDF e Excel recebem atualizações de segurança
- O banco de dados local (SQLite) precisa funcionar corretamente com novas versões do Windows
- Se o computador for trocado, o programa precisa ser reinstalado e configurado

---

# O que está incluído na manutenção mensal

## Para o Sistema de Chamados (online)

| Item | Descrição |
|------|-----------|
| **Correção de bugs** | Se algo parar de funcionar, será corrigido em até 48h (críticos em 24h) |
| **Monitoramento** | Acompanhamento do funcionamento do sistema, API, banco de dados e integrações |
| **Atualizações de segurança** | Aplicação de correções de vulnerabilidades nas bibliotecas utilizadas |
| **Compatibilidade mobile** | Manter o app funcionando com novas versões de Android/iOS |
| **Suporte às integrações** | Se o Twilio, Supabase, Expo ou SMTP mudarem algo, o sistema será adaptado |
| **Pequenos ajustes** | Até 2 ajustes ou melhorias pequenas por mês (dentro do escopo existente) |

## Para o Sistema Desktop (programa Windows)

| Item | Descrição |
|------|-----------|
| **Correção de bugs** | Correção de problemas reportados no programa |
| **Compatibilidade Windows** | Manter o programa funcionando com atualizações do Windows |
| **Atualizações de dependências** | Atualizar bibliotecas de PDF, Excel e banco de dados quando necessário |
| **Suporte à instalação** | Reinstalação e configuração em caso de troca de computador |
| **Pequenos ajustes** | Até 1 ajuste ou melhoria pequena por mês (dentro do escopo existente) |

## Para ambos os sistemas

| Item | Descrição |
|------|-----------|
| **Suporte técnico** | Canal de comunicação para dúvidas e solicitações via WhatsApp/e-mail |
| **Prioridade de atendimento** | Solicitações atendidas com prioridade sobre novos projetos |

---

# O que NÃO está incluído (cobrado à parte)

- Desenvolvimento de **novas funcionalidades** grandes (novo módulo, nova integração, etc.)
- **Redesign** visual dos sistemas
- Migração para outro servidor ou plataforma
- Criação de **testes automatizados**
- Implementação de **CI/CD** (deploy automático)
- Desenvolvimento de **novos sistemas** ou módulos não existentes

---

# Resumo do que será mantido

| | Sistema de Chamados | Sistema Desktop |
|---|---|---|
| **Tipo** | Plataforma online (web + mobile) | Programa Windows |
| **Aplicações** | 4 (API, Web, Mobile, Site) | 1 (Desktop WPF) |
| **Banco de dados** | PostgreSQL na nuvem (9 tabelas) | SQLite local (4 tabelas) |
| **Integrações externas** | 5 (Supabase, Twilio, Gmail, Expo, GA) | Nenhuma |
| **Relatórios** | 6 tipos (PDF + Excel) | 2 tipos (PDF + Excel) |
| **Telas/Páginas** | 12 (web + mobile) | 5 janelas |
| **Tecnologias** | JavaScript, React, Node.js, React Native | C#, .NET 9, WPF |
| **Usuários** | Clientes, Técnicos, Admins | Uso interno da empresa |

---

# Comparativo de mercado

Para ter uma referência, veja quanto custa no mercado desenvolver e manter sistemas como estes:

| Referência | Valor |
|------------|-------|
| Desenvolver o sistema de chamados do zero (agência) | R$ 40.000 - R$ 80.000 |
| Desenvolver o sistema desktop do zero (agência) | R$ 15.000 - R$ 30.000 |
| **Total para desenvolver ambos do zero (agência)** | **R$ 55.000 - R$ 110.000** |
| Desenvolver ambos do zero (freelancer sênior) | R$ 25.000 - R$ 50.000 |
| Manutenção mensal dos dois por agência | R$ 4.000 - R$ 9.000/mês |
| Manutenção mensal dos dois por freelancer sênior | R$ 3.000 - R$ 5.500/mês |
| **Esta proposta (ambos os sistemas)** | **R$ 1.400/mês** |

---

# Resumo da proposta

| | |
|---|---|
| **Sistemas mantidos** | Sistema de Chamados Técnicos + Sistema Desktop de Relatórios |
| **Total de aplicações** | 5 (API + Web + Mobile + Site + Desktop) |
| **Tecnologias envolvidas** | JavaScript, React, React Native, Node.js, C#, .NET, WPF |
| **Bancos de dados** | PostgreSQL (nuvem) + SQLite (local) |
| **Integrações monitoradas** | Supabase, Twilio, Gmail, Expo Push, Google Analytics |
| **Valor mensal** | **R$ 1.400,00** |
| **Forma de pagamento** | Mensal, com vencimento todo dia 10 |
| **Vigência** | Contrato contínuo com aviso prévio de 30 dias para cancelamento |

---

*Documento gerado em marco de 2026.*
