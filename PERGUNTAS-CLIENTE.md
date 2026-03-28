# Perguntas para o Cliente — Brucker Printers

Estas perguntas precisam ser respondidas para garantir o bom funcionamento do sistema de chamados, tanto na web quanto no mobile.

---

## 1. Acesso e Usuários

1.1. **Quantos administradores terão acesso ao sistema?** Apenas o Luciano, ou mais pessoas?

1.2. **Quantos técnicos utilizarão o app mobile?** Isso impacta notificações e atribuição de chamados.

1.3. **Os clientes precisarão acessar o sistema pelo celular (app mobile)?** Hoje só conseguem pelo navegador (web). Se sim, quais funcionalidades: apenas ver chamados ou também abrir chamados novos?

1.4. **Um mesmo cliente pode ter mais de um usuário acessando com o mesmo código?** Ou cada pessoa da empresa do cliente precisa de um código próprio?

---

## 2. Chamados e SLA

2.1. **Os tempos de SLA atuais estão corretos?**
   - Normal: 24 horas
   - Alta: 16 horas
   - Crítica: 8 horas

2.2. **O SLA conta horas corridas (24h/dia) ou apenas horário comercial?** Exemplo: um chamado aberto sexta às 17h — o SLA pausa no fim de semana?

2.3. **Qual o horário comercial da Brucker?** (Ex: segunda a sexta, 8h às 18h)

2.4. **Existe algum feriado ou calendário especial que deve pausar o SLA?**

2.5. **O técnico precisa confirmar que aceitou o chamado antes de começar o atendimento?** Ou basta o admin atribuir e já muda para "Em Atendimento"?

2.6. **O cliente pode cancelar um chamado depois de aberto?** Ou apenas o admin pode cancelar?

2.7. **Um chamado pode ser reaberto depois de concluído?** Em quais situações?

---

## 3. Notificações

3.1. **Quais e-mails devem receber notificação de novo chamado?** Atualmente configurados: maxcanoas@gmail.com e contato@bruckerprinters.com.br. Está correto?

3.2. **O cliente deve receber notificação por e-mail quando o chamado mudar de status?** (Ex: "Seu chamado #1023 foi concluído")

3.3. **O técnico deve receber notificação por WhatsApp quando for atribuído a um chamado?** A integração com WhatsApp (Twilio) será ativada?

3.4. **Quais situações devem gerar notificação?**
   - [ ] Novo chamado aberto
   - [ ] Técnico atribuído
   - [ ] Status alterado
   - [ ] SLA prestes a vencer (quanto tempo antes?)
   - [ ] SLA vencido
   - [ ] Chamado concluído
   - [ ] Relatório de atendimento criado
   - [ ] Outras: ___________

---

## 4. Impressoras e Clientes

4.1. **Todo chamado precisa ter uma impressora vinculada?** Ou pode ser um chamado genérico sem impressora?

4.2. **Quais são os tipos de contrato utilizados?** Atualmente temos: Locação, Venda e Manutenção. Falta algum?

4.3. **O cliente pode visualizar os dados do contrato (tipo, vigência) no sistema?** Ou isso é informação interna?

4.4. **É necessário cadastrar informações adicionais do cliente?** (Ex: CNPJ, endereço, contato secundário)

4.5. **É necessário cadastrar informações adicionais da impressora?** (Ex: localização física, contador de páginas, data de instalação)

---

## 5. Relatórios

5.1. **Quais relatórios são essenciais para a operação?**
   - [ ] Relatório mensal por período
   - [ ] Relatório por cliente
   - [ ] Relatório por técnico
   - [ ] Relatório de SLA (cumprido vs estourado)
   - [ ] Relatório de peças utilizadas
   - [ ] Outros: ___________

5.2. **Os relatórios precisam ser exportados em algum formato?** (Ex: PDF, Excel/CSV, ambos)

5.3. **O cliente final precisa ter acesso a algum relatório?** Ou relatórios são apenas para uso interno da Brucker?

---

## 6. Segurança e Acesso

6.1. **Após quanto tempo de inatividade o usuário deve ser deslogado automaticamente?** (Atualmente: 24 horas)

6.2. **Existe necessidade de diferentes níveis de admin?** (Ex: admin completo vs admin que só visualiza, sem poder editar)

6.3. **O código de acesso do cliente deve expirar?** Ou é válido indefinidamente até ser regenerado?

---

## 7. Deploy e Infraestrutura

7.1. **Qual será o domínio/URL do sistema web?** (Ex: chamados.bruckerprinters.com.br)

7.2. **O app mobile será publicado nas lojas (App Store / Google Play)?** Ou será distribuído internamente (apenas para técnicos)?

7.3. **Quantos chamados simultâneos vocês estimam por mês?** Isso define o plano de hospedagem necessário.

7.4. **É necessário manter histórico de chamados por quanto tempo?** (Ex: 1 ano, 3 anos, indefinido)

---

## 8. Funcionalidades Futuras

8.1. **O cliente precisa poder avaliar o atendimento após a conclusão?** (Ex: nota de 1 a 5 + comentário)

8.2. **É necessário anexar fotos/documentos aos chamados?** (Ex: foto do erro da impressora)

8.3. **Existe necessidade de chat/comunicação direta entre cliente e técnico dentro do sistema?**

8.4. **O sistema precisa gerar orçamentos ou é apenas para chamados técnicos?**

---

> **Instruções:** Responda cada pergunta da forma mais detalhada possível. As respostas serão usadas para configurar e finalizar o sistema antes da implantação.
