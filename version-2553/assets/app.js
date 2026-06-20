(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-hidden");
            });
        });

        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    return;
                }
                event.preventDefault();
                var action = form.getAttribute("action") || "search.html";
                window.location.href = action + "?q=" + encodeURIComponent(input.value.trim());
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, currentIndex) {
                    slide.classList.toggle("active", currentIndex === index);
                });
                dots.forEach(function (dot, currentIndex) {
                    dot.classList.toggle("active", currentIndex === index);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            }

            var previous = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (previous) {
                previous.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    restart();
                });
            });
            show(0);
            start();
        }

        var grid = document.querySelector("[data-card-grid]");
        if (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var query = normalize(params.get("q"));
            var searchInput = document.querySelector("[data-search-input]");
            var activeFilter = "all";
            var activeSort = null;

            if (searchInput && query) {
                searchInput.value = params.get("q");
            }

            function cardMatches(card) {
                var text = normalize(card.getAttribute("data-search"));
                var title = normalize(card.getAttribute("data-title"));
                var genre = normalize(card.getAttribute("data-genre"));
                var filter = normalize(activeFilter);
                var matchesQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
                var matchesFilter = filter === "all" || text.indexOf(filter) !== -1 || genre.indexOf(filter) !== -1;
                return matchesQuery && matchesFilter;
            }

            function sortCards(mode) {
                if (!mode) {
                    return;
                }
                cards.sort(function (a, b) {
                    if (mode === "year") {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    if (mode === "views") {
                        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                    }
                    if (mode === "rating") {
                        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                    }
                    return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), "zh-CN");
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            function apply() {
                sortCards(activeSort);
                cards.forEach(function (card) {
                    card.style.display = cardMatches(card) ? "" : "none";
                });
            }

            document.querySelectorAll("[data-filter]").forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "all";
                    document.querySelectorAll("[data-filter]").forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });

            document.querySelectorAll("[data-sort]").forEach(function (button) {
                if (button.classList.contains("active")) {
                    activeSort = button.getAttribute("data-sort");
                }
                button.addEventListener("click", function () {
                    activeSort = button.getAttribute("data-sort");
                    var group = button.closest("[data-filter-scope]") || document;
                    group.querySelectorAll("[data-sort]").forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });

            apply();
        }
    });
})();
