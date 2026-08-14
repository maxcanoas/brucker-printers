// ===================================
// GOOGLE ANALYTICS 4 + CONSENT MODE V2
// ===================================
// Este é o ÚNICO lugar do site onde o GA4 é inicializado.
// Todas as páginas referenciam este arquivo com uma linha no <head>:
//     <script src="/js/gtag-init.min.js"></script>
//
// IMPORTANTE: não use defer/async nesta tag. O estado de consentimento
// precisa ser declarado antes do gtag('config'), senão o Consent Mode
// não tem efeito sobre a primeira medição da página.

(function () {
    'use strict';

    const ID_MEDICAO = 'G-ZBKE5NWBW8';
    const CHAVE_CONSENTIMENTO = 'bp_consent';

    // Só o site oficial mede. O mesmo HTML é servido em três lugares — o
    // domínio de produção, o preview do GitHub Pages e a máquina de quem
    // desenvolve — e todos carregam esta mesma tag.
    //
    // Sem esta guarda, metade das páginas do relatório do GA4 vinha de fora
    // do site: o preview registrava visitas como se fossem de clientes, e
    // qualquer decisão tomada sobre esses números estaria errada.
    const HOSTS_DE_PRODUCAO = ['bruckerprinters.com.br', 'www.bruckerprinters.com.br'];
    const emProducao = HOSTS_DE_PRODUCAO.indexOf(location.hostname) !== -1;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    // A flag oficial do GA4 para desligar a medição. Precisa existir antes do
    // gtag('config'): depois dele o pageview já foi enviado.
    if (!emProducao) window['ga-disable-' + ID_MEDICAO] = true;

    // localStorage lança exceção em navegação restrita/iframe bloqueado.
    // Na dúvida, negamos o consentimento.
    function lerConsentimento() {
        try {
            return localStorage.getItem(CHAVE_CONSENTIMENTO);
        } catch (erro) {
            return null;
        }
    }

    const escolhaRegistrada = lerConsentimento();
    const analiseAutorizada = escolhaRegistrada === 'aceito';

    // Estado padrão de consentimento.
    // ad_* permanece negado mesmo após o aceite: o site faz medição, não
    // remarketing. Se um dia rodar Google Ads, o banner passa a promovê-los.
    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: analiseAutorizada ? 'granted' : 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted'
    });

    // Loader oficial do GA4. Injetado por JS para que o snippet inteiro
    // fique num arquivo só e não possa divergir entre páginas.
    //
    // Fora de produção nem chega a ser baixado: são 166 KB, o maior recurso
    // da página, que o preview não tem por que carregar. A flag ga-disable
    // acima já bastaria para não enviar nada, mas não impediria o download.
    if (emProducao) {
        const loader = document.createElement('script');
        loader.async = true;
        loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID_MEDICAO;
        document.head.appendChild(loader);
    }

    // window.gtag continua definido nos dois casos: é a função que empilha no
    // dataLayer, e analytics.js depende dela. Sem o loader, as chamadas se
    // acumulam ali e ninguém as consome — que é exatamente o efeito desejado.
    gtag('js', new Date());
    gtag('config', ID_MEDICAO);

    // Fora de produção, a página também não pode disputar posição na busca
    // com o site oficial.
    //
    // Isto não podia ser resolvido por robots.txt: o preview é servido em
    // maxcanoas.github.io/brucker-printers/, e arquivo em subpasta é ignorado
    // pelo rastreador — só vale na raiz do host. E o robots.txt do repositório
    // vai junto no pacote de deploy, então um "Disallow: /" ali bloquearia o
    // site real.
    //
    // Havendo duas diretivas robots na página, o Google aplica a mais
    // restritiva. O canonical absoluto, presente em todas as páginas e
    // apontando para o domínio de produção, segue como defesa principal —
    // esta é a segunda camada, para quando o rastreador renderiza o JS.
    if (!emProducao) {
        const semIndexacao = document.createElement('meta');
        semIndexacao.name = 'robots';
        semIndexacao.content = 'noindex, nofollow';
        document.head.appendChild(semIndexacao);
    }

    // Consumido por analytics.js (banner de consentimento e eventos).
    window.BP_MEDICAO = {
        idMedicao: ID_MEDICAO,
        chaveConsentimento: CHAVE_CONSENTIMENTO,
        escolhaRegistrada: escolhaRegistrada
    };
})();
