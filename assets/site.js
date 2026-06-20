(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slider = document.querySelector(".hero-slider");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var current = 0;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle("active", position === current);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle("active", position === current);
                    dot.setAttribute("aria-current", position === current ? "true" : "false");
                });
            }

            dots.forEach(function (dot, position) {
                dot.addEventListener("click", function () {
                    show(position);
                });
            });

            show(0);
            if (slides.length > 1) {
                setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        }

        Array.prototype.slice.call(document.querySelectorAll(".js-search-form")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[type='search']");
                var target = form.getAttribute("data-search-url") || form.getAttribute("action") || "search.html";
                var query = input ? input.value.trim() : "";
                window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
            });
        });

        var catalogInput = document.querySelector(".page-filter-input");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-result");

        function filterCards() {
            if (!catalogInput || !cards.length) {
                return;
            }
            var query = normalize(catalogInput.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (catalogInput) {
            var params = new URLSearchParams(window.location.search);
            var queryParam = params.get("q");
            if (queryParam) {
                catalogInput.value = queryParam;
            }
            catalogInput.addEventListener("input", filterCards);
            filterCards();
        }
    });
})();
