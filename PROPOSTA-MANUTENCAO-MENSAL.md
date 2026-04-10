# Proposta de Manutencao Mensal - Brucker Printers

**Cliente:** Brucker Printers
**Prestador:** Maxwell Rigo Moraes (devmrmoraes)
**Data:** Abril/2026
**Versao:** 1.0

---

## Resumo dos Servicos Mantidos

A Brucker Printers possui **3 servicos digitais** que necessitam de manutencao continua:

| # | Servico | Tecnologia | Hospedagem |
|---|---------|-----------|------------|
| 1 | **Site Institucional** | HTML/CSS/JS puro | Servidor web (hosting) |
| 2 | **Sistema de Chamados** | Node.js + React + React Native (Expo) | Supabase (cloud) + servidor API |
| 3 | **Sistema de Relatorios** | C# / WPF / .NET 9.0 | Desktop Windows (local) |

---

## 1. Site Institucional

### O que e
Site de divulgacao do negocio com 2 paginas (home + catalogo de impressoras), formulario de contato via WhatsApp, SEO configurado e Google Analytics.

### Itens de manutencao mensal

| Item | Descricao | Frequencia |
|------|-----------|------------|
| SSL/HTTPS | Verificar validade do certificado, renovar se necessario | Mensal |
| Dominio | Monitorar vencimento e renovacao | Mensal |
| Disponibilidade | Verificar se o site esta no ar e carregando corretamente | Semanal |
| SEO | Monitorar indexacao no Google, verificar sitemap e robots.txt | Mensal |
| Analytics | Acompanhar metricas basicas (visitas, origem do trafego) | Mensal |
| Conteudo | Atualizacoes de texto, imagens de impressoras, precos | Sob demanda |
| Compatibilidade | Testar em navegadores atualizados (Chrome, Safari, Edge) | Trimestral |
| Performance | Verificar tempo de carregamento, otimizar imagens se necessario | Trimestral |

### Complexidade: BAIXA
- Site estatico, sem backend
- Nenhuma dependencia externa alem do hosting
- Risco de falha: apenas hosting fora do ar ou SSL vencido
- **Estimativa: ~1h/mes**

---

## 2. Sistema de Chamados (Web + Mobile + API)

### O que e
Sistema completo de abertura e gestao de chamados tecnicos, com 3 perfis de usuario (cliente, tecnico, admin), notificacoes em 3 canais, SLA com horario comercial, relatorios PDF/Excel e app mobile.

### Numeros do sistema

| Metrica | Valor |
|---------|-------|
| Endpoints da API | 48 |
| Tabelas no banco | 9 |
| Linhas de codigo (API) | ~4.200 |
| Linhas de codigo (Web) | ~4.300 |
| Arquivos fonte (Mobile) | 19 |
| Integracoes externas | 4 (Supabase, Twilio, SMTP, Expo Push) |
| Perfis de usuario | 3 (Cliente, Tecnico, Admin) |

### Itens de manutencao mensal

#### Infraestrutura e Banco de Dados (Supabase)

| Item | Descricao | Frequencia |
|------|-----------|------------|
| Banco de dados | Monitorar uso de storage, conexoes e limites do plano Supabase | Semanal |
| Backups | Verificar se backups automaticos do Supabase estao funcionando | Mensal |
| Storage | Monitorar uso do bucket de fotos (chamado-fotos), limpar orfaos se necessario | Mensal |
| Auth | Verificar saude do servico de autenticacao, tokens JWT | Mensal |
| Realtime | Confirmar que subscriptions WebSocket estao ativas | Quinzenal |
| Performance | Analisar queries lentas, verificar indices | Mensal |

#### API (Node.js / Express)

| Item | Descricao | Frequencia |
|------|-----------|------------|
| Servidor | Monitorar uptime, uso de memoria e CPU | Semanal |
| Logs | Revisar logs de erro, identificar patterns de falha | Semanal |
| Rate limiting | Verificar se limites estao adequados ao uso real | Mensal |
| Dependencias | Atualizar pacotes npm com vulnerabilidades criticas (npm audit) | Mensal |
| SLA | Validar que calculo de horario comercial esta correto (feriados, DST) | Mensal |
| Seguranca | Verificar headers (Helmet), CORS, autenticacao | Mensal |

#### Integracoes Externas

| Item | Descricao | Frequencia |
|------|-----------|------------|
| Twilio/WhatsApp | Verificar saldo, entregas de mensagem, credenciais ativas | Semanal |
| Email/SMTP | Verificar envio, checar se dominio nao caiu em blacklist | Quinzenal |
| Expo Push | Verificar entregas de push notification, tokens validos | Quinzenal |
| Custos | Monitorar gastos de Supabase, Twilio e SMTP para evitar surpresas | Mensal |

#### Dashboard Web (React)

| Item | Descricao | Frequencia |
|------|-----------|------------|
| Build | Verificar que build de producao compila sem erros | A cada deploy |
| Navegadores | Testar compatibilidade apos updates | Trimestral |
| Dependencias | Atualizar React, Vite e libs com vulnerabilidades | Mensal |
| Funcionalidade | Testar fluxo completo: login > abrir chamado > acompanhar > avaliar | Mensal |

#### App Mobile (Expo / React Native)

| Item | Descricao | Frequencia |
|------|-----------|------------|
| Expo SDK | Acompanhar atualizacoes do Expo SDK e compatibilidade | Mensal |
| Build | Gerar builds de teste apos mudancas | A cada deploy |
| Push tokens | Verificar renovacao de tokens de notificacao | Mensal |
| Stores | Monitorar reviews e crashes (se publicado em stores) | Semanal |
| iOS/Android | Testar em ambas plataformas apos updates | A cada deploy |

### Complexidade: ALTA
- 4 aplicacoes interdependentes (API + Web + Mobile + Supabase)
- 4 servicos externos pagos que podem falhar independentemente
- Logica de negocio complexa (SLA com horario comercial, pausas)
- Notificacoes em 3 canais que precisam funcionar 24/7
- Qualquer falha impacta diretamente a operacao do cliente
- **Estimativa: ~8-10h/mes**

---

## 3. Sistema de Relatorios (Desktop Windows)

### O que e
Aplicacao desktop WPF para gestao de parque de impressoras, registro de leituras mensais (contadores PB e cor), alertas de contrato e ociosidade, e geracao de relatorios financeiros (PDF e Excel).

### Numeros do sistema

| Metrica | Valor |
|---------|-------|
| Linguagem | C# / .NET 9.0 |
| Linhas de codigo | ~3.300 |
| Arquivos fonte | 25 (20 .cs + 5 .xaml) |
| Tabelas SQLite | 5 |
| Telas | 4 (Dashboard, Empresas, Cadastro, Relatorios) |
| Dependencias NuGet | 5 |
| Hospedagem | Local (desktop do cliente) |

### Itens de manutencao mensal

| Item | Descricao | Frequencia |
|------|-----------|------------|
| Banco SQLite | Verificar integridade, tamanho do arquivo, backups automaticos | Mensal |
| Backup | Confirmar que rotina de backup diario esta funcionando (retencao 30 dias) | Mensal |
| Logs | Revisar logs de erro no diretorio da aplicacao | Mensal |
| .NET Runtime | Monitorar atualizacoes de seguranca do .NET 9.0 | Trimestral |
| Relatorios | Validar que PDF e Excel estao gerando corretamente | Mensal |
| Dependencias | Acompanhar updates criticos de QuestPDF, ClosedXML, ScottPlot | Trimestral |
| Windows Update | Verificar compatibilidade apos updates do Windows | Trimestral |
| Instalador | Manter installer (Inno Setup) atualizado para novas versoes | A cada release |
| Suporte | Atender duvidas do usuario sobre uso do sistema | Sob demanda |

### Complexidade: BAIXA-MEDIA
- Aplicacao offline, sem dependencias de cloud
- Nenhum risco de "cair" — roda localmente
- Manutencao reativa (so precisa agir se algo quebrar ou se pedirem melhoria)
- Principal risco: corrupcao do banco SQLite ou incompatibilidade com Windows Update
- **Estimativa: ~2h/mes**

---

## Resumo Consolidado de Esforco

| Servico | Complexidade | Horas/mes | Risco |
|---------|-------------|-----------|-------|
| Site Institucional | Baixa | ~1h | Baixo |
| Sistema de Chamados | Alta | ~8-10h | Alto |
| Sistema de Relatorios | Baixa-Media | ~2h | Baixo |
| **TOTAL** | | **~11-13h/mes** | |

---

## Valor Proposto

### R$ 1.300,00 / mes

#### Composicao do valor

| Componente | Base de calculo | Valor |
|------------|----------------|-------|
| Site Institucional | ~1h x R$120/h | R$ 120 |
| Sistema de Chamados | ~9h x R$120/h | R$ 1.080 |
| Sistema de Relatorios | ~2h x R$120/h | R$ 240 |
| **Subtotal (horas tecnicas)** | | **R$ 1.440** |
| **Desconto pacote (3 servicos)** | -10% | **-R$ 140** |
| **TOTAL MENSAL** | | **R$ 1.300** |

#### O que esta incluso

- Monitoramento proativo de todos os 3 servicos
- Correcoes de bugs e falhas criticas
- Atualizacoes de seguranca (dependencias, patches)
- Pequenos ajustes e melhorias (ate 4h/mes inclusos)
- Suporte via WhatsApp em horario comercial (seg-sex, 8h-18h)
- Relatorio mensal de status dos servicos (opcional)

#### O que NAO esta incluso (cobrado a parte)

- Desenvolvimento de novas funcionalidades (orcamento separado por demanda)
- Redesign do site ou das interfaces
- Migracoes de infraestrutura (trocar hosting, mudar de Supabase, etc.)
- Publicacao do app em lojas (Apple Store, Google Play) — processo e custos a parte
- Atendimento fora do horario comercial ou em feriados
- Treinamento de novos usuarios

#### Justificativa do valor

1. **Sao 6 aplicacoes distintas** que precisam funcionar em harmonia: site HTML, API Node.js, dashboard React, app mobile Expo, banco Supabase e desktop WPF

2. **4 integracoes externas pagas** (Supabase, Twilio, SMTP, Expo Push) que podem falhar a qualquer momento e precisam de atencao constante

3. **Impacto operacional direto**: se o sistema de chamados cair, o cliente perde chamados reais de clientes reais. Se o WhatsApp parar de notificar, tecnicos nao sabem que tem trabalho

4. **Custo de disponibilidade**: mesmo nos meses "tranquilos", o profissional precisa estar disponivel e atento. Esse custo existe independente de haver incidentes

5. **Valor de mercado**: um desenvolvedor senior cobra entre R$100-150/h. Com ~12h/mes estimadas, o valor de R$1.300 (~R$108/h) esta abaixo da media de mercado, considerando o desconto por pacote

---

## Condicoes

- **Vigencia**: contrato mensal com renovacao automatica
- **Reajuste**: anual, pelo IGPM ou indice equivalente
- **Cancelamento**: aviso previo de 30 dias por qualquer das partes
- **Pagamento**: ate o dia 10 de cada mes
- **Horas extras**: demandas alem do escopo sao orcadas separadamente, com aprovacao previa do cliente

---

*Documento gerado em Abril/2026 por Maxwell Rigo Moraes (devmrmoraes)*
