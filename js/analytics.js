// ===================================
// MEDIÇÃO DE CONVERSÃO (GA4)
// ===================================
// Depende de gtag-init.js, carregado antes no <head>.
// Carregue este arquivo com defer e ANTES de script.min.js, para que o
// listener de lead seja registrado antes do handler do formulário.
//
// Nenhum evento aqui bloqueia navegação: são todos fire-and-forget,
// exceto generate_lead, que aguarda no máximo 300ms por confirmação.

(function () {
    'use strict';

    const TEMPO_LIMITE_CALLBACK = 300;
    const SEGUNDOS_ENGAJAMENTO = 30;
    const PROPORCAO_SCROLL = 0.75;
    const ORIGEM_PADRAO = 'nao_identificado';

    const paginaAtual = window.location.pathname;

    // ===================================
    // ENVIO
    // ===================================

    function enviarEvento(nome, parametros) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', nome, parametros || {});
    }

    // Envia o evento e só então executa `aoConcluir`. O event_callback do GA4
    // confirma o envio; o timeout garante que a ação do usuário aconteça mesmo
    // se o gtag estiver bloqueado (adblock, rede lenta, consentimento negado).
    function enviarEventoEntao(nome, parametros, aoConcluir) {
        let jaExecutou = false;

        function concluir() {
            if (jaExecutou) return;
            jaExecutou = true;
            aoConcluir();
        }

        if (typeof window.gtag !== 'function') {
            concluir();
            return;
        }

        const carga = Object.assign({}, parametros, { event_callback: concluir });
        window.gtag('event', nome, carga);
        setTimeout(concluir, TEMPO_LIMITE_CALLBACK);
    }

    function origemDe(elemento) {
        return elemento.getAttribute('data-origem') || ORIGEM_PADRAO;
    }

    // ===================================
    // CLIQUES EM CTA (DELEGAÇÃO ÚNICA)
    // ===================================
    // Identifica pelo href, nunca por classe: elementos criados depois e
    // mudanças de estilo continuam funcionando sem tocar neste arquivo.

    document.addEventListener('click', function (evento) {
        const link = evento.target.closest('a[href]');
        if (!link) return;

        // .href é a forma absoluta e normalizada do atributo.
        const destino = link.href || '';
        const origem = origemDe(link);

        if (link.getAttribute('data-evento') === 'area-cliente') {
            enviarEvento('acesso_area_cliente', {});
            return;
        }

        if (destino.indexOf('https://wa.me') === 0 || destino.indexOf('https://api.whatsapp.com') === 0) {
            const parametros = { origem: origem };
            const modelo = link.getAttribute('data-modelo');
            if (modelo) parametros.modelo = modelo;
            enviarEvento('contato_whatsapp', parametros);
            return;
        }

        if (destino.indexOf('tel:') === 0) {
            enviarEvento('contato_telefone', { origem: origem });
            return;
        }

        if (destino.indexOf('mailto:') === 0) {
            enviarEvento('contato_email', { origem: origem });
        }
    });

    // ===================================
    // SCROLL DE 75%
    // ===================================
    // Só avalia dentro do handler de scroll: numa página que não rola, não
    // faz sentido registrar profundidade de leitura.

    let scrollRegistrado = false;

    function verificarScroll() {
        if (scrollRegistrado) return;

        const alturaTotal = document.documentElement.scrollHeight;
        const alturaVisivel = window.innerHeight;
        const rolavel = alturaTotal - alturaVisivel;
        if (rolavel <= 0) return;

        const proporcaoLida = (window.scrollY + alturaVisivel) / alturaTotal;
        if (proporcaoLida < PROPORCAO_SCROLL) return;

        scrollRegistrado = true;
        window.removeEventListener('scroll', verificarScroll);
        enviarEvento('scroll_75', { pagina: paginaAtual });
    }

    window.addEventListener('scroll', verificarScroll, { passive: true });

    // ===================================
    // ENGAJAMENTO DE 30 SEGUNDOS
    // ===================================
    // Conta tempo com a aba visível. Uma aba aberta em segundo plano por
    // 10 minutos não conta como engajamento.

    let segundosEngajado = 0;
    let contador = null;

    function pararContagem() {
        if (contador === null) return;
        clearInterval(contador);
        contador = null;
    }

    function tique() {
        segundosEngajado += 1;
        if (segundosEngajado < SEGUNDOS_ENGAJAMENTO) return;
        pararContagem();
        enviarEvento('engajamento_30s', { pagina: paginaAtual });
    }

    function iniciarContagem() {
        if (contador !== null || segundosEngajado >= SEGUNDOS_ENGAJAMENTO) return;
        contador = setInterval(tique, 1000);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            pararContagem();
        } else {
            iniciarContagem();
        }
    });

    if (!document.hidden) iniciarContagem();

    // ===================================
    // BANNER DE CONSENTIMENTO (LGPD)
    // ===================================

    const configuracao = window.BP_MEDICAO || {};
    const chaveConsentimento = configuracao.chaveConsentimento || 'bp_consent';

    function gravarConsentimento(valor) {
        try {
            localStorage.setItem(chaveConsentimento, valor);
        } catch (erro) {
            // Sem persistência disponível: o banner reaparece na próxima visita.
        }
    }

    function aplicarConsentimento(valor) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('consent', 'update', {
            analytics_storage: valor === 'aceito' ? 'granted' : 'denied'
        });
    }

    function montarBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Aviso de privacidade');

        const texto = document.createElement('p');
        texto.className = 'cookie-banner-texto';
        texto.innerHTML = 'Usamos cookies para entender como o site é usado e melhorar sua experiência. ' +
            'Você pode recusar sem perder nenhuma funcionalidade. ' +
            '<a href="/politica-privacidade-chamados.html">Política de Privacidade</a>.';

        const acoes = document.createElement('div');
        acoes.className = 'cookie-banner-acoes';

        const recusar = document.createElement('button');
        recusar.type = 'button';
        recusar.className = 'cookie-banner-recusar';
        recusar.textContent = 'Recusar';

        const aceitar = document.createElement('button');
        aceitar.type = 'button';
        aceitar.className = 'cookie-banner-aceitar';
        aceitar.textContent = 'Aceitar';

        function responder(valor) {
            gravarConsentimento(valor);
            aplicarConsentimento(valor);
            banner.remove();
            // Devolve o botão flutuante de WhatsApp à posição normal.
            document.body.classList.remove('tem-cookie-banner');
        }

        recusar.addEventListener('click', function () { responder('recusado'); });
        aceitar.addEventListener('click', function () { responder('aceito'); });

        acoes.appendChild(recusar);
        acoes.appendChild(aceitar);
        banner.appendChild(texto);
        banner.appendChild(acoes);
        document.body.appendChild(banner);
        // Sinaliza ao CSS que o botão flutuante precisa subir.
        document.body.classList.add('tem-cookie-banner');
    }

    if (!configuracao.escolhaRegistrada) montarBanner();

    // ===================================
    // API PÚBLICA
    // ===================================
    // script.js usa enviarLead para medir o formulário sem duplicar a lógica
    // de callback/timeout aqui descrita.

    window.BP_ANALYTICS = {
        enviarEvento: enviarEvento,
        enviarLead: function (parametros, aoConcluir) {
            enviarEventoEntao('generate_lead', parametros, aoConcluir);
        }
    };
})();
