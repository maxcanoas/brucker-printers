// ===================================
// CARROSSEL DE IMPRESSORAS (HERO)
// ===================================
const carouselContainer = document.getElementById('carouselContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');

if (carouselContainer && prevBtn && nextBtn && indicatorsContainer) {
    let currentSlide = 0;
    const totalSlides = carouselContainer.children.length;
    let autoPlayInterval;

    // Cria indicadores
    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('button');
        indicator.classList.add('carousel-indicator');
        indicator.setAttribute('aria-label', `Slide ${i + 1}`);
        if (i === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(indicator);
    }

    const indicators = document.querySelectorAll('.carousel-indicator');

    function updateCarousel() {
        carouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
        resetAutoPlay();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carousel.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
}

// ===================================
// CARROSSEL INFINITO DE CLIENTES
// ===================================
const clientsCarousel = document.getElementById('clientsCarousel');

if (clientsCarousel) {
    const track = clientsCarousel.querySelector('.clients-track');
    
    if (track) {
        // Clona o conteúdo original para criar efeito infinito
        const clonedTrack = track.cloneNode(true);
        clientsCarousel.appendChild(clonedTrack);
        
        // Ajusta a velocidade baseado no número de itens
        const itemCount = track.children.length;
        const baseSpeed = 40; // segundos
        const speed = Math.max(30, baseSpeed * (itemCount / 8));
        clientsCarousel.style.animation = `scroll ${speed}s linear infinite`;
    }
}

// ===================================
// MENU MOBILE
// ===================================
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================
const header = document.getElementById('header');

if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ===================================
// SMOOTH SCROLL PARA LINKS INTERNOS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = 80;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// FORMULÁRIO DE CONTATO
// ===================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const statusForm = document.getElementById('formStatus');
    const botaoEnviar = contactForm.querySelector('.btn-submit');
    const textoBotao = botaoEnviar ? botaoEnviar.textContent : '';

    const mostrarStatus = (texto, tipo) => {
        if (!statusForm) return;
        statusForm.textContent = texto;
        statusForm.className = `form-status form-status--${tipo}`;
    };

    // Regras de validação por campo. Cada uma devolve a mensagem de erro ou
    // string vazia quando o valor está bom.
    //
    // A validação nativa do navegador continua ativa como rede de segurança,
    // mas o form usa novalidate: as bolhas nativas aparecem uma de cada vez,
    // em inglês em alguns navegadores, e somem ao clicar fora. Mensagem por
    // campo, visível e persistente, resolve melhor.
    const REGRAS = {
        name: (v) => {
            if (!v) return 'Informe seu nome.';
            if (v.length < 3) return 'Nome muito curto.';
            return '';
        },
        company: (v) => (v ? '' : 'Informe o nome da empresa.'),
        email: (v) => {
            if (!v) return 'Informe seu e-mail.';
            // Checagem simples de formato: um @ com texto dos dois lados e um
            // ponto no domínio. Validar e-mail por regex completa é inviável;
            // o objetivo é só pegar erro de digitação óbvio.
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'E-mail parece incompleto.';
            return '';
        },
        phone: (v) => {
            if (!v) return 'Informe um telefone para contato.';
            const digitos = v.replace(/\D/g, '');
            if (digitos.length < 10) return 'Telefone incompleto. Inclua o DDD.';
            if (digitos.length > 13) return 'Telefone com dígitos demais.';
            return '';
        }
    };

    const campoDe = (id) => document.getElementById(id);
    const erroDe = (id) => document.getElementById(`erro-${id}`);

    const validarCampo = (id) => {
        const campo = campoDe(id);
        if (!campo || !REGRAS[id]) return true;

        const mensagem = REGRAS[id](campo.value.trim());
        const alvoErro = erroDe(id);

        if (alvoErro) alvoErro.textContent = mensagem;
        campo.classList.toggle('campo-invalido', mensagem !== '');
        campo.setAttribute('aria-invalid', mensagem !== '' ? 'true' : 'false');

        return mensagem === '';
    };

    // Valida ao sair do campo, e enquanto digita apenas depois que o campo
    // já errou uma vez: corrigir um erro dá retorno imediato, sem acusar
    // "e-mail incompleto" na primeira letra digitada.
    Object.keys(REGRAS).forEach((id) => {
        const campo = campoDe(id);
        if (!campo) return;
        campo.addEventListener('blur', () => validarCampo(id));
        campo.addEventListener('input', () => {
            if (campo.classList.contains('campo-invalido')) validarCampo(id);
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const company = document.getElementById('company').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();
        const modeloEl = document.getElementById('modelo');
        const modelo = modeloEl ? modeloEl.value : '';

        // Valida todos os campos, sem interromper no primeiro erro: o usuário
        // vê de uma vez tudo que precisa corrigir.
        const invalidos = Object.keys(REGRAS).filter((id) => !validarCampo(id));

        if (invalidos.length > 0) {
            mostrarStatus(
                invalidos.length === 1
                    ? 'Confira o campo destacado para continuar.'
                    : `Confira os ${invalidos.length} campos destacados para continuar.`,
                'erro'
            );
            const primeiro = campoDe(invalidos[0]);
            if (primeiro) primeiro.focus();
            return;
        }

        let whatsappMessage = `*Solicitação de Orçamento*\n\n`;
        whatsappMessage += `*Nome:* ${name}\n`;
        whatsappMessage += `*Empresa:* ${company}\n`;
        whatsappMessage += `*E-mail:* ${email}\n`;
        whatsappMessage += `*Telefone:* ${phone}\n`;

        if (modelo) {
            whatsappMessage += `*Modelo de interesse:* ${modelo}\n`;
        }

        if (message) {
            whatsappMessage += `\n*Mensagem:*\n${message}`;
        }

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappNumber = '5551997371666';
        const urlWhatsApp = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // A aba é aberta agora, ainda dentro do clique do usuário. Abrir depois
        // do callback de medição seria tratado como popup e bloqueado.
        const aba = window.open('', '_blank');

        const irParaWhatsApp = () => {
            if (aba && !aba.closed) {
                aba.location.href = urlWhatsApp;
            } else {
                window.location.href = urlWhatsApp;
            }
            contactForm.reset();
            Object.keys(REGRAS).forEach((id) => {
                const alvoErro = erroDe(id);
                if (alvoErro) alvoErro.textContent = '';
                const campo = campoDe(id);
                if (campo) {
                    campo.classList.remove('campo-invalido');
                    campo.removeAttribute('aria-invalid');
                }
            });
            if (botaoEnviar) {
                botaoEnviar.disabled = false;
                botaoEnviar.textContent = textoBotao;
            }
            mostrarStatus('Tudo certo! Estamos abrindo o WhatsApp com seus dados.', 'sucesso');
        };

        // Estado de envio: além do retorno visual, o botão desabilitado evita
        // que um duplo clique dispare dois generate_lead e abra duas abas.
        if (botaoEnviar) {
            botaoEnviar.disabled = true;
            botaoEnviar.textContent = 'Enviando...';
        }
        mostrarStatus('Enviando...', 'enviando');

        // generate_lead precisa sair antes do redirecionamento.
        // enviarLead aguarda a confirmação do GA4 por no máximo 300ms.
        if (window.BP_ANALYTICS && window.BP_ANALYTICS.enviarLead) {
            window.BP_ANALYTICS.enviarLead({
                origem: 'secao_contato',
                modelo_interesse: modelo
            }, irParaWhatsApp);
        } else {
            irParaWhatsApp();
        }
    });
}

// ===================================
// ANIMAÇÃO DE SCROLL (INTERSECTION OBSERVER)
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplica animação aos elementos
document.querySelectorAll('.solution-card, .advantage-item, .differential-card, .client-logo').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

const currentYearEl = document.getElementById('currentYear');
if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();