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
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const company = document.getElementById('company').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        if (name && company && email && phone) {
            let whatsappMessage = `*Solicitação de Orçamento*\n\n`;
            whatsappMessage += `*Nome:* ${name}\n`;
            whatsappMessage += `*Empresa:* ${company}\n`;
            whatsappMessage += `*E-mail:* ${email}\n`;
            whatsappMessage += `*Telefone:* ${phone}\n`;
            
            if (message) {
                whatsappMessage += `\n*Mensagem:*\n${message}`;
            }
            
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappNumber = '5551997371666';
            window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
            
            contactForm.reset();
            alert('Redirecionando para o WhatsApp...');
        } else {
            alert('Por favor, preencha todos os campos obrigatórios.');
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