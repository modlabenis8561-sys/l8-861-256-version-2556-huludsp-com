(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            const isOpen = menu.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
            dot.setAttribute('aria-pressed', String(dotIndex === activeSlide));
        });
    }

    function startSlides() {
        if (slideTimer) {
            window.clearInterval(slideTimer);
        }

        if (slides.length > 1) {
            slideTimer = window.setInterval(function () {
                showSlide(activeSlide + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startSlides();
        });
    });

    showSlide(0);
    startSlides();

    document.querySelectorAll('[data-search-area]').forEach(function (area) {
        const input = area.querySelector('[data-search-input]');
        const buttons = Array.from(area.querySelectorAll('[data-filter-button]'));
        const cards = Array.from(area.querySelectorAll('[data-card]'));
        const emptyState = area.querySelector('[data-empty-state]');
        let activeFilter = 'all';

        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = (card.getAttribute('data-search') || '').toLowerCase();
                const kind = card.getAttribute('data-kind') || '';
                const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchFilter = activeFilter === 'all' || kind.indexOf(activeFilter) !== -1;
                const visible = matchKeyword && matchFilter;

                card.classList.toggle('card-hidden', !visible);

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                area.classList.toggle('no-results', visibleCount === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-button') || 'all';

                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });

                applyFilter();
            });
        });

        applyFilter();
    });
})();
