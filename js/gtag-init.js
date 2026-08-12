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

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

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
    const loader = document.createElement('script');
    loader.async = true;
    loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID_MEDICAO;
    document.head.appendChild(loader);

    gtag('js', new Date());
    gtag('config', ID_MEDICAO);

    // Consumido por analytics.js (banner de consentimento e eventos).
    window.BP_MEDICAO = {
        idMedicao: ID_MEDICAO,
        chaveConsentimento: CHAVE_CONSENTIMENTO,
        escolhaRegistrada: escolhaRegistrada
    };
})();
