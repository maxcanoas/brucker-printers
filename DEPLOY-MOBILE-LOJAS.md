# Deploy Mobile — Publicar Brucker Chamados no Google Play + App Store

## Contexto

O app `brucker-chamados/mobile` (Expo SDK 54 + React Native 0.81, expo-router v6) já é funcional: autenticação Supabase para Cliente/Técnico/Admin, CRUD de chamados, anexo de fotos (`expo-image-picker`), cálculo de SLA (`lib/sla.js`), push notifications registradas (`lib/notifications.js`) e integração com a API em `https://brucker-api.onrender.com` (já no ar no Render).

Faltam, para entrar nas lojas públicas:

- Assets visuais finais (ícone 1024×1024, adaptive icon Android, splash).
- Conta Expo/EAS + projeto vinculado (`extra.eas.projectId`).
- Contas de publicação PJ: **Apple Developer Program** (US$ 99/ano, requer D-U-N-S da Brucker) e **Google Play Console** (US$ 25, pagamento único).
- Credenciais de assinatura (iOS: certificados + provisioning; Android: keystore) — o EAS gera automaticamente.
- Metadados de loja: nome, descrição, screenshots, **política de privacidade pública** (obrigatória), classificação etária, categoria.
- Env de produção no mobile (`EXPO_PUBLIC_API_URL=https://brucker-api.onrender.com/api`).
- Backend: endpoint de envio de push notifications via Expo Push API (o app já registra o token, mas o backend ainda não consome).

Alvo: **Google Play Store + Apple App Store**, conta **pessoa jurídica (Brucker Printers)**, builds **100% EAS Cloud** (sem Mac local).

---

## Etapa 1 — Pré-requisitos administrativos (começar agora, em paralelo)

Estas etapas dependem de dados da empresa e levam dias/semanas para aprovar. Iniciar imediatamente.

### 1.1 D-U-N-S Number da Brucker Printers (gratuito, obrigatório para Apple PJ)

- Acessar: https://developer.apple.com/enroll/duns-lookup/
- Informar CNPJ, razão social, endereço completo, telefone, e-mail corporativo.
- **Prazo:** 1 a 5 dias úteis.
- **Sem o DUNS, não há como abrir Apple Developer PJ.**

### 1.2 Apple Developer Program (Organization) — US$ 99/ano

-  
- Login com **Apple ID institucional** (criar um `dev@bruckerprinters.com.br` se ainda não existir — **NÃO use Apple ID pessoal**).
- Escolher "Organization", informar DUNS + cargo do responsável legal.
- A Apple liga por telefone para confirmar a pessoa que solicitou.
- **Prazo total:** 1 a 4 semanas (gargalo principal do cronograma).

### 1.3 Google Play Console (Organization) — US$ 25 único

- https://play.google.com/console/signup
- Escolher "An organization". Informar CNPJ, site oficial (`bruckerprinters.com.br`), e-mail de contato, documento do responsável.
- O Google verifica identidade com documento (RG/CNH ou CNPJ) e endereço.
- **Prazo:** 1 a 7 dias.

### 1.4 Conta Expo (EAS) — grátis, 30 builds/mês

**Status:** conta já criada com `dev@bruckerprinters.com.br`.

Na tela inicial do dashboard aparecem duas opções:

- **Get the starter project** — cria um app Expo novo a partir de template. **Não usar**, isso sobrescreveria o projeto existente.
- **Migrate your existing app** — é o caminho correto, mas você não precisa clicar nela: o vínculo é feito pelo CLI a partir da pasta do projeto. Pode fechar essa tela.

Passos para vincular o projeto local à conta:

1. Instalar o CLI globalmente (uma vez por máquina):
   ```bash
   npm install -g eas-cli
   ```
2. Confirmar a versão:
   ```bash
   eas --version
   ```
3. Entrar na pasta do app e logar com a conta recém-criada:
   ```bash
   cd brucker-chamados/mobile
   eas login
   ```
   Vai pedir e-mail (`dev@bruckerprinters.com.br`) e senha. Se a conta tiver 2FA, ele abre um prompt para o código.
4. Verificar que está logado:
   ```bash
   eas whoami
   ```
   Deve imprimir o username/e-mail da conta.
5. Vincular o projeto local ao Expo:
   ```bash
   eas init
   ```
   Quando perguntar:
   - **"Would you like to create a project for @dev/brucker-chamados?"** → **Yes**.
   - **"Link this project?"** (caso o slug já exista) → **Yes**.

   O comando grava automaticamente o campo `extra.eas.projectId` em `brucker-chamados/mobile/app.json` — é um UUID parecido com `a1b2c3d4-e5f6-...`. Esse ID é o que liga os builds do EAS Cloud à conta Brucker.

6. Conferir e commitar:
   ```bash
   git diff brucker-chamados/mobile/app.json   # deve mostrar o projectId novo
   git add brucker-chamados/mobile/app.json
   git commit -m "Vincula app mobile ao projeto EAS"
   ```

7. (Opcional) Confirmar no dashboard: https://expo.dev/accounts/<sua-conta>/projects — o projeto **brucker-chamados** deve aparecer listado. Se não aparecer, dar refresh; ele só fica visível depois do `eas init`.

**Não rodar `eas build` ainda** — isso só vai acontecer na Etapa 5 (Android) e Etapa 6 (iOS), depois dos assets prontos e das contas Apple/Google aprovadas.

### 1.5 Política de Privacidade pública (obrigatória pelas duas lojas)

Redigir texto cobrindo:

- Quais dados o app coleta: e-mail, nome, fotos anexadas, push token.
- Finalidade: prestação de serviço técnico (chamados).
- Base legal LGPD: art. 7º V — execução de contrato.
- Retenção e contato do DPO.

Publicar numa URL fixa, ex.: `https://bruckerprinters.com.br/politica-privacidade-chamados`.

Esse link vai ser colado tanto no Play Console quanto no App Store Connect.

---

## Etapa 2 — Preparar assets visuais

Localização: `brucker-chamados/mobile/assets/`. Hoje só existe `logo-icon.png`.

Arquivos a gerar (Figma, Canva, ou qualquer editor que exporte PNG na resolução exata):

| Arquivo | Resolução | Finalidade |
|---|---|---|
| `assets/icon.png` | 1024×1024 (PNG, **sem canal alpha**) | Ícone iOS + fallback Android |
| `assets/adaptive-icon.png` | 1024×1024 (PNG com transparência, conteúdo dentro do círculo central de 672px) | Foreground do adaptive icon Android |
| `assets/splash.png` | 1284×2778 ou 1242×2688 (PNG) | Splash screen iOS/Android |
| `assets/favicon.png` | 48×48 | Web (PWA) |

**Dicas:**

- Use a logo laranja `#E84C1E` sobre fundo escuro `#0D1117` (cores já presentes em `app.json`).
- Ícone iOS **não pode ter transparência** (a Apple rejeita).
- O centro do adaptive icon Android precisa ter margem de segurança (Android recorta em círculo/squircle).

Depois de gerar, atualizar `app.json`:

```json
"icon": "./assets/icon.png",
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#0D1117"
},
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#0D1117"
  }
}
```

---

## Etapa 3 — Configurar EAS e projeto

Dentro de `brucker-chamados/mobile/`:

### 3.1 Vincular projeto Expo

```bash
eas init
```

Isso cria automaticamente a entrada `extra.eas.projectId` em `app.json`. Commitar.

### 3.2 Revisar `eas.json` — adicionar `submit` e bump automático

```json
{
  "cli": { "version": ">=5.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": false }
    },
    "production": {
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" },
      "ios": {}
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "dev@bruckerprinters.com.br",
        "ascAppId": "<preencher após criar o app no App Store Connect>",
        "appleTeamId": "<Team ID de 10 caracteres da Apple Developer>"
      }
    }
  }
}
```

Service account do Google e `ascAppId` da Apple são criados nas Etapas 5 e 6.

### 3.3 Criar `.env` de produção do mobile

**NÃO commitar** (o `.env` já está no `.gitignore`):

```
EXPO_PUBLIC_API_URL=https://brucker-api.onrender.com/api
EXPO_PUBLIC_SUPABASE_URL=<copiar do .env atual>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<copiar do .env atual>
```

Para builds do EAS, o mais seguro é usar **EAS Secrets**:

```bash
eas env:create --scope project --name EXPO_PUBLIC_API_URL       --value https://brucker-api.onrender.com/api --environment production
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL  --value <valor> --environment production
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <valor> --environment production
```

### 3.4 Adicionar scripts úteis em `package.json`

```json
"scripts": {
  "build:android:preview": "eas build -p android --profile preview",
  "build:android:prod":    "eas build -p android --profile production",
  "build:ios:prod":        "eas build -p ios --profile production",
  "submit:android":        "eas submit -p android --profile production",
  "submit:ios":            "eas submit -p ios --profile production"
}
```

---

## Etapa 4 — Backend: fechar o loop de push notifications

O app já chama `registrarPushNotifications()` em `mobile/lib/notifications.js` e envia o token para `POST /admin/push-token` ou `POST /tecnicos/me/push-token`. Falta o backend **enviar** push quando algo acontece (novo chamado, atribuição, encerramento).

Arquivos a alterar (confirmar na implementação):

- `brucker-chamados/api/routes/chamados.js` — disparar push nos handlers de criação/atribuição/atualização.
- Criar `brucker-chamados/api/lib/expo-push.js` com função que faz `POST https://exp.host/--/api/v2/push/send` usando os tokens salvos.

**Não é bloqueador para publicar**, mas o app fica sem notificações push se não implementar. Pode ir numa fase 2.

---

## Etapa 5 — Publicar no Google Play Store

Pré-requisito: Play Console aprovado + pagamento US$ 25 confirmado.

### 5.1 Criar app no Play Console

https://play.google.com/console

- "Criar app" → nome: "Brucker Chamados" → idioma padrão PT-BR → App gratuito → marcar que segue políticas.
- Category: Business.

### 5.2 Preencher ficha da loja (obrigatório antes do primeiro submit)

- Nome completo, descrição curta (80 chars), descrição longa (4000 chars).
- **Screenshots**: mínimo 2, tamanho 16:9 ou 9:16, entre 320px e 3840px. Capturar: Login, Home do técnico, Detalhe do chamado, Dashboard admin.
- Ícone 512×512 (pode ser o mesmo `icon.png` redimensionado).
- URL da política de privacidade.
- Classificação etária: responder questionário (app sem violência/compras → classificação livre).
- Público-alvo: 18+ (uso corporativo).
- Segurança de dados: declarar coleta de e-mail, fotos, identificadores. Todas as respostas "sim, coletamos e é necessário para o app".

### 5.3 Gerar service account para submit automático (uma vez só)

1. Google Cloud Console → criar projeto "Brucker Play Submit".
2. IAM → Service Accounts → criar conta → baixar chave JSON.
3. No Play Console → Setup → API Access → vincular o projeto Cloud → conceder acesso à service account com permissão "Release manager".
4. Salvar o JSON em `brucker-chamados/mobile/google-service-account.json` e adicionar ao `.gitignore`.

### 5.4 Primeiro build de produção (AAB)

```bash
eas build -p android --profile production
```

EAS vai pedir para gerar keystore — escolher **"Let EAS manage credentials"** (opção segura e rastreável). Build leva 15-30 min na fila gratuita.

### 5.5 Submit do AAB para trilha interna primeiro

```bash
eas submit -p android --profile production
```

No Play Console, após o upload: adicionar testers por e-mail na trilha interna. Validar em device real.

### 5.6 Promover para produção

Play Console → Release → Production → "Create new release" → puxar AAB da trilha interna → escrever release notes → **Submit for review**.

**Revisão do Google:** 1-7 dias.

---

## Etapa 6 — Publicar no Apple App Store

Pré-requisito: Apple Developer aprovado + Team ID obtido.

### 6.1 Criar registro no App Store Connect

https://appstoreconnect.apple.com

- My Apps → + → New App → iOS.
- Nome: "Brucker Chamados" → Primary Language: PT-BR → Bundle ID: `com.bruckerprinters.chamados` (selecionar do dropdown; se não aparecer, criar em https://developer.apple.com/account/resources/identifiers primeiro) → SKU: `brucker-chamados-001`.
- Anotar o **Apple ID (ascAppId)** de 10 dígitos que aparece na tela do app criado — colar em `eas.json`.

### 6.2 Preencher App Information

- Descrição, keywords (100 chars total, separados por vírgula), support URL, marketing URL (opcional).
- Categoria primária: Business.
- **Screenshots obrigatórios**: 6.7" iPhone (1290×2796) e 6.5" iPhone (1284×2778) — mínimo 3 de cada.
  - Como gerar sem Mac: use https://appmockup.com ou https://previewed.app para montar molduras iOS a partir de prints do Android com proporção ajustada.
- Ícone 1024×1024 (upload direto, sem canal alpha).
- Política de privacidade URL.
- **App Privacy** (questionário): declarar coleta de Contact Info (email), User Content (fotos), Identifiers (push token). Todas marcadas como "Linked to user, Used for app functionality".
- Age rating: questionário — resposta padrão dá "4+".

### 6.3 Build de produção iOS

```bash
eas build -p ios --profile production
```

EAS pede credenciais Apple — usar **"Let EAS manage credentials"**. Ele cria certificado de distribuição e provisioning profile no Apple Developer automaticamente via Team ID. Build: 20-40 min.

### 6.4 Submit para TestFlight (obrigatório antes de produção)

```bash
eas submit -p ios --profile production
```

EAS sobe o `.ipa` para o App Store Connect. Em ~15 min, o build aparece em TestFlight. Ativar para grupo de teste interno, convidar testers por e-mail, validar em iPhone real.

### 6.5 Submissão para review

App Store Connect → versão → selecionar o build → preencher "What's new" → **Submit for Review**.

**Prazo Apple:** 24-48h. A Apple testa manualmente — se rejeitar, vem com motivo claro (geralmente metadados ou política de privacidade).

---

## Etapa 7 — Atualizações futuras (rotina)

Para cada nova versão:

1. Bumpar `version` em `app.json` (semver: 1.0.1, 1.1.0, etc.). O `autoIncrement: true` no `eas.json` cuida sozinho de `buildNumber` (iOS) e `versionCode` (Android).
2. `eas build -p android --profile production` + `eas submit -p android`.
3. `eas build -p ios --profile production` + `eas submit -p ios`.
4. No Play Console e App Store Connect, escrever release notes e submeter para review.

---

## Arquivos críticos

- `brucker-chamados/mobile/app.json` — versão, permissões, assets, plugins, `extra.eas.projectId`.
- `brucker-chamados/mobile/eas.json` — perfis de build e submit.
- `brucker-chamados/mobile/.env` (ou EAS Secrets) — `EXPO_PUBLIC_*`.
- `brucker-chamados/mobile/assets/icon.png`, `adaptive-icon.png`, `splash.png` — criar.
- `brucker-chamados/mobile/google-service-account.json` — gerar no GCP, **não commitar**.
- `brucker-chamados/mobile/package.json` — scripts EAS.
- `brucker-chamados/mobile/lib/notifications.js` — já implementado, sem mudança.
- `brucker-chamados/api/routes/chamados.js` + `api/lib/expo-push.js` (novo) — para fechar loop de push (fase 2).

---

## Verificação end-to-end

1. `eas build -p android --profile preview` → instalar APK em device Android real → login cliente/técnico/admin → criar chamado com foto → ver notificação de push chegando (após Etapa 4). Este passo valida tudo antes de gastar tempo de revisão nas lojas.
2. Confirmar que `EXPO_PUBLIC_API_URL` aponta para `https://brucker-api.onrender.com/api` no build (sem isso, o app abre mas nada carrega).
3. Smoke-test do backend: `curl https://brucker-api.onrender.com/api/health` deve retornar `{"status":"ok"}`.
4. Após TestFlight (iOS) e trilha interna (Android) funcionais, promover para produção nas duas lojas.

---

## Estimativa de prazo total

- **Semana 0** (hoje): criar DUNS, iniciar Apple Developer + Play Console, gerar assets.
- **Semanas 1-3**: aguardando aprovação Apple (gargalo principal). Usar o tempo para fechar push no backend e testar builds preview no Android.
- **Semanas 3-4**: builds de produção + submit.
- **Semanas 4-5**: reviews das lojas (Google 1-7 dias, Apple 1-2 dias).

**Total realista: 4 a 6 semanas**, a maior parte esperando Apple.
