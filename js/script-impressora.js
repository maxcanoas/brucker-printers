const menuToggle = document.getElementById('menuToggle');
        const nav = document.getElementById('nav');

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        const menuToggleActive = menuToggle.classList.contains('active');
        if (menuToggleActive) {
            menuToggle.children[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
            menuToggle.children[1].style.opacity = '0';
            menuToggle.children[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
        }

        document.getElementById('currentYear').textContent = new Date().getFullYear();