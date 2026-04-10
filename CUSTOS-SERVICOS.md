# Custos de Serviços - Brucker Chamados

Análise de custos para operação inicial com **até 4 empresas clientes**.

> Estimativa de uso: ~12-20 usuários, ~40-60 chamados/mês, ~60MB de fotos/mês.

---

## Serviços Gratuitos

### Supabase (Banco de Dados + Auth + Storage)

| Recurso | Limite Free | Uso Estimado | Margem |
|---------|------------|--------------|--------|
| Banco de dados | 500 MB | ~50 MB | Folga enorme |
| Storage (fotos) | 1 GB | ~60 MB/mês (acumulativo) | ~12-16 meses |
| Autenticação | 50.000 MAU | ~20 usuários | Folga enorme |
| Realtime | 200 conexões simultâneas | ~5-10 | Folga enorme |
| Bandwidth | 5 GB | ~500 MB/mês | OK |

- **Custo: R$ 0/mês**
- **Atenção:** O storage acumula fotos ao longo do tempo. Em ~12-16 meses pode atingir o limite de 1 GB. Quando necessário, migrar para o plano Pro ($25/mês) ou limpar fotos antigas.

### Vercel (Painel Web)

- Aplicação SPA (React + Vite), sem servidor
- Bundle de ~130 KB
- Uso estimado: ~0,4 GB/mês de bandwidth (limite: 100 GB)
- **Custo: R$ 0/mês** — sem risco de estourar

### Expo (App Mobile)

- Push notifications ilimitadas no plano gratuito
- Até 30 builds/mês
- **Custo: R$ 0/mês** — sem risco de estourar

### Gmail SMTP (E-mails)

- Limite: ~500 e-mails/dia
- Uso estimado: ~150-300 e-mails/mês (3-5 por chamado)
- **Custo: R$ 0/mês** — folga enorme

---

## Serviço Recomendado Pagar

### Render (Hospedagem da API)

| | Free (R$ 0) | Starter (~R$ 40/mês) |
|---|-------------|----------------------|
| Comportamento | Dorme após 15 min sem uso | Sempre ligado |
| Cold start | 30-50 segundos para acordar | Sem delay |
| Push notifications | Podem falhar com API dormindo | Sempre funcionam |
| Experiência do usuário | Primeira request do dia lenta | Sempre rápido |

- **Recomendação:** Pagar o plano Starter (~R$ 40/mês) para garantir boa experiência ao usuário. Com 4 empresas haverá períodos de inatividade (madrugada, fins de semana), e o delay de 30-50 segundos ao acordar prejudica a percepção de qualidade do sistema.

---

## Custos Anuais

| Serviço | Função | Custo |
|---------|--------|-------|
| Domínio (bruckerprinters.com.br) | DNS do site | ~R$ 40/ano |
| Apple Developer (se publicar iOS) | App na App Store | ~R$ 500/ano |

---

## Custo Único (já pago ou a pagar)

| Serviço | Função | Custo |
|---------|--------|-------|
| Google Play Developer | App na Play Store | ~R$ 130 (único) |

---

## Resumo de Custos

### Mensal

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Free | R$ 0 |
| Vercel | Free | R$ 0 |
| Expo | Free | R$ 0 |
| Gmail SMTP | Free | R$ 0 |
| **Render** | **Starter** | **~R$ 40/mês** |
| **Total mensal** | | **~R$ 40/mês** |

### Anual

| Serviço | Custo |
|---------|-------|
| Domínio | ~R$ 40/ano |
| Apple Developer (opcional) | ~R$ 500/ano |

---

## Observações

- **Twilio (WhatsApp)** foi desconsiderado — pode ser adicionado futuramente se necessário (~R$ 0,25/mensagem).
- **SSL/HTTPS** é gratuito (incluso no Render e Vercel via Let's Encrypt).
- Quando o volume de uso crescer significativamente (mais empresas ou mais chamados), reavaliar o plano do Supabase.
