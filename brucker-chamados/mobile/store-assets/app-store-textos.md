# Textos para submissão na App Store — Brucker Chamados

> Cole cada bloco no campo correspondente do App Store Connect → App Information / Version Information.
> Limites da Apple estão indicados em cada bloco.

---

## Nome do app (limite: 30 chars)

```
Brucker Chamados
```
*(16 chars)*

---

## Subtítulo (limite: 30 chars)

```
Suporte técnico de impressoras
```
*(30 chars — bate exato no limite)*

**Alternativas se quiser variar:**
- `Chamados técnicos Brucker` (24)
- `Atendimento técnico ágil` (24)
- `Assistência para impressoras` (28)

---

## Texto promocional (limite: 170 chars — pode editar sem nova revisão)

```
Abra chamados técnicos para suas impressoras, acompanhe o atendimento em tempo real e receba notificações a cada etapa do serviço.
```
*(132 chars)*

---

## Descrição (limite: 4000 chars)

```
Brucker Chamados é o aplicativo oficial da Brucker Printers para suporte técnico de impressoras corporativas.

Pensado para empresas que dependem de impressoras industriais e gráficas, o app conecta clientes, técnicos e administradores em um único fluxo de atendimento, do registro à conclusão do chamado.

PARA O CLIENTE
• Abra chamados em segundos, com fotos do equipamento e descrição do problema.
• Acompanhe o status em tempo real: aberto, atribuído, em atendimento, aguardando peça ou concluído.
• Receba notificações automáticas a cada mudança de etapa.
• Consulte o histórico completo de atendimentos da sua empresa.
• Avalie o serviço ao final, com nota e comentário.

PARA O TÉCNICO DE CAMPO
• Visualize a fila de chamados atribuídos a você, ordenados por urgência e SLA.
• Atualize o status do atendimento direto do celular, em qualquer lugar.
• Registre relatórios de serviço com peças utilizadas e duração do atendimento.
• Anexe fotos do antes e depois para comprovar a entrega.

PARA O ADMINISTRADOR
• Cadastre clientes, impressoras e técnicos em poucos toques.
• Atribua chamados ao técnico mais adequado e monitore o SLA de 24 horas.
• Pause o SLA quando o atendimento depender de peça externa.
• Consolide relatórios e tenha visibilidade completa da operação.

PRINCIPAIS DIFERENCIAIS
• Login simplificado por código de acesso para clientes — sem senha pra esquecer.
• Notificações push e por e-mail em todas as etapas relevantes.
• SLA inteligente que respeita feriados nacionais e finais de semana.
• Aceite técnico antes do início do atendimento, garantindo alinhamento entre cliente e prestador.
• Avaliação obrigatória ao final, com média visível ao gestor.
• Interface escura e responsiva, otimizada para uso em campo.

COMO COMEÇAR
Se você é cliente Brucker, peça à equipe Brucker o seu código de acesso e entre direto. Técnicos e administradores recebem login específico do gestor da operação.

Atendimento direcionado a clientes corporativos da Brucker Printers. Para conhecer a Brucker, acesse bruckerprinters.com.br.
```
*(≈1.910 chars — bem dentro do limite)*

---

## Palavras-chave (limite: 100 chars TOTAL, separadas por vírgula, SEM espaço após a vírgula)

```
chamado,impressora,assistencia,suporte,tecnico,manutencao,brucker,os,atendimento,sla,grafica
```
*(99 chars — bate no limite; sem acentos pra economizar caracteres, a Apple considera com/sem acento separadamente, mas sem acento o algoritmo casa as duas formas)*

**Notas:**
- Não repita palavras que já estão no nome ou subtítulo (a Apple já indexa elas) — por isso evitei "chamados", "tecnico" puro etc. Se sobrar espaço, troca.
- Se quiser focar em concorrência menor: `chamado,impressora,assistencia,suporte,manutencao,brucker,plotter,offset,sla,grafica,tecnico` *(98 chars, inclui plotter/offset que casam com nicho gráfico)*.

---

## URLs

| Campo | URL |
|---|---|
| **Support URL** (obrigatório) | `https://bruckerprinters.com.br/contato` |
| **Marketing URL** (opcional) | `https://bruckerprinters.com.br` |
| **Privacy Policy URL** (obrigatório) | `https://bruckerprinters.com.br/politica-privacidade-chamados.html` |

> ⚠️ Confirma se `bruckerprinters.com.br/contato` existe e é uma página de contato real. Se não, troca por `https://bruckerprinters.com.br` mesmo.

---

## Categoria

- **Primária**: Empresarial (Business)
- **Secundária** (opcional): Produtividade (Productivity)

---

## Classificação etária — questionário (mesma resposta do Android)

Marcar **"Não"** em todas as perguntas, EXCETO:
- **Conteúdo gerado por usuários (UGC) com moderação**: **Sim** (clientes podem adicionar fotos e descrições nos chamados)

Resultado esperado: **4+** (provavelmente 12+ se o UGC for marcado sem moderação automática — então marca "com moderação", já que a Brucker revisa antes de publicar).

---

## App Privacy (questionário de privacidade — Apple)

Mesmas 8 declarações do Android, no formato Apple:

| Categoria Apple | Tipo de dado | Linked to user? | Used for tracking? | Finalidade |
|---|---|---|---|---|
| Contact Info | Email Address | Yes | No | App Functionality |
| Contact Info | Phone Number | Yes | No | App Functionality |
| Contact Info | Name | Yes | No | App Functionality |
| User Content | Photos or Videos | Yes | No | App Functionality |
| User Content | Customer Support | Yes | No | Customer Support |
| Identifiers | User ID | Yes | No | App Functionality |
| Identifiers | Device ID | Yes | No | App Functionality |
| Diagnostics | Crash Data | No | No | App Functionality |

> Importante: marcar **"Data is NOT used to track you"** em todos. Supabase, Brevo e Expo são service providers — não contam como compartilhamento com terceiros pra fins de tracking.

---

## Informações de revisão (App Review Information)

**Contact Information** (quem a Apple liga se travar):
- First Name: `Maxwell`
- Last Name: `Moraes`
- Phone: *(seu telefone com DDD)*
- Email: `mrmoraes@ctd.com.br`

**Sign-in required**: ✅ Sim

**Demo account / Notes for Review** (cole no campo "Notes"):

> Versão usada no reenvio após rejeição 3.2.0 Business (2026-05-15). Inclui credenciais dos 3 perfis e passo a passo, espelhando o reenvio que destravou o Android.

**Campos "Informações para iniciar sessão" (topo)**: preencher usuário e senha com `BRKF7DA6EE9` (cosmético — login real é por código).

```
Brucker Chamados é um app B2B de uso restrito a clientes corporativos da Brucker Printers para abertura e acompanhamento de chamados técnicos de impressoras industriais/gráficas. Ele atende três perfis: CLIENTE, TÉCNICO DE CAMPO e ADMINISTRADOR. Abaixo, credenciais e passo a passo para avaliar cada um.

============================================================
IMPORTANTE — TIPOS DE LOGIN
- CLIENTE: login por CÓDIGO DE ACESSO (não há e-mail/senha). Os campos "Nome de usuário" e "Senha" no formulário da Apple foram preenchidos com o mesmo código apenas porque o formulário exige preenchimento.
- TÉCNICO e ADMINISTRADOR: login por E-MAIL e SENHA.
============================================================

PERFIL 1 — CLIENTE
Credencial: BRKF7DA6EE9
Passos:
1. Abra o app.
2. Na tela inicial (login de cliente), cole o código BRKF7DA6EE9 no campo "Código de acesso".
3. Toque em "Entrar".
4. Você verá a home do cliente com histórico de chamados e botão "Abrir novo chamado".
5. Toque em "Abrir novo chamado" para ver o fluxo: seleção de impressora pelo número de série, descrição do problema, anexo de foto (opcional) e envio.
6. Volte à home e toque em um chamado existente para ver detalhes, status e avaliação.

PERFIL 2 — TÉCNICO DE CAMPO
Credenciais: mrmoraes@ctd.com.br / 12345678
Passos:
1. Abra o app.
2. Na tela inicial do cliente, toque no link "Sou técnico" (rodapé) para abrir a tela de login de técnico.
3. Informe e-mail mrmoraes@ctd.com.br e senha 12345678.
4. Toque em "Entrar".
5. Você verá a fila de chamados atribuídos, ordenados por SLA/urgência.
6. Abra qualquer chamado para visualizar a tela de atendimento: aceite técnico, atualização de status, registro de peças usadas, fotos de antes/depois e finalização com relatório.

PERFIL 3 — ADMINISTRADOR
Credenciais: revisor@bruckerprinters.com.br / 12345678
Passos:
1. Abra o app.
2. Na tela inicial do cliente, toque em "Sou técnico" e, em seguida, no link "Sou administrador".
3. Informe e-mail revisor@bruckerprinters.com.br e senha 12345678.
4. Toque em "Entrar".
5. Você verá o painel administrativo com abas: Chamados, Clientes, Impressoras, Técnicos e Relatórios.
6. Em "Chamados" é possível atribuir técnico, pausar SLA e acompanhar a operação. Os cadastros (clientes, impressoras, técnicos) estão acessíveis via modais a partir das respectivas abas.

============================================================
MODELO DE NEGÓCIO (3.2.0)
O app é distribuído de forma RESTRITA a clientes corporativos da Brucker Printers, que adquiriram impressoras industriais/gráficas e contratam suporte técnico. Não é destinado ao público geral — o login de cliente exige um CÓDIGO DE ACESSO entregue pela Brucker, e a abertura de chamado exige o NÚMERO DE SÉRIE de uma impressora previamente cadastrada no sistema. O app é gratuito; a contrapartida comercial ocorre fora dele (contratos de manutenção/serviço).

Foi enviado em 12/05/2026 um pedido de Unlisted App Distribution (em análise) justamente por se tratar de um app B2B sem valor para o público geral.

============================================================
DADOS DE DEMONSTRAÇÃO POPULADOS PARA REVISÃO
Para que o revisor encontre dados em todas as telas, o cliente BRKF7DA6EE9 possui: 1 impressora cadastrada, 1 técnico vinculado e 2 chamados (um com foto, um sem foto), em status diferentes.

============================================================
TECNOLOGIAS
React Native (Expo) no app, Node.js no backend, Supabase (Postgres) e notificações push via Apple Push Notification Service (APNs) — chave APNs já configurada no Apple Developer.

Contato técnico: Maxwell Moraes — +55 51 99960-8608 — maxcanoas@gmail.com
```

---

## Build

- Selecionar build **1.0.0 (1)** (já validado no TestFlight em 2026-05-07).
- Export Compliance: já está OK (`ITSAppUsesNonExemptEncryption: false` no Info.plist).

---

## Preço e disponibilidade

- **Preço**: Free
- **Disponibilidade**: Brasil (recomendado restringir só ao Brasil — o app é em PT-BR e o suporte é regional). Se quiser global, marca "All countries", mas espera mais perguntas da Apple sobre traduções.

---

## Versão para o App Store

- **What's New in This Version** (campo "Promotional Text" da release; obrigatório a partir da v1.0.1, mas Apple aceita texto na v1.0):

```
Versão inicial do Brucker Chamados.
```

---

## Checklist final antes de "Submit for Review"

- [ ] Build 1.0.0 (1) selecionado e processado (ícone aparece sem warning)
- [ ] 5+ screenshots iPhone 6.7" (1290×2796) enviados — **aguardando Luciano**
- [ ] Ícone 1024×1024 sem canal alpha enviado
- [ ] Descrição, subtítulo, keywords, URLs preenchidos
- [ ] Categoria: Empresarial
- [ ] Classificação etária respondida
- [ ] App Privacy preenchido (8 itens acima)
- [ ] App Review Information com código `BRKF7DA6EE9` + credenciais técnico/admin + passo a passo no campo Notes
- [ ] Preço: Free / Disponibilidade: Brasil
- [ ] Export Compliance: confirmado (no encryption usage)
- [ ] Submit for Review
