(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        var carousel = document.querySelector(".hero-carousel");
        if (carousel) {
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
        }
        start();
    }

    function setupSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll(".search-form, .search-page-form, .filter-box")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q'], input[type='search']");
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query && form.classList.contains("filter-box")) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-type") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function setupCardFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!cards.length) {
            return;
        }
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".card-search"));
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
        var empty = document.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        inputs.forEach(function (input) {
            if (initialQuery && !input.value) {
                input.value = initialQuery;
            }
            input.addEventListener("input", apply);
        });
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });

        function apply() {
            var query = inputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).filter(Boolean).join(" ");
            var visible = 0;
            cards.forEach(function (card) {
                var keep = true;
                if (query) {
                    keep = textOf(card).indexOf(query) !== -1;
                }
                selects.forEach(function (select) {
                    var value = select.value.trim().toLowerCase();
                    var key = select.getAttribute("data-filter");
                    if (value && key) {
                        var target = (card.getAttribute("data-" + key) || "").toLowerCase();
                        if (target.indexOf(value) === -1) {
                            keep = false;
                        }
                    }
                });
                card.style.display = keep ? "" : "none";
                if (keep) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        apply();
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(function (video) {
            var stream = video.getAttribute("data-stream");
            var shell = video.closest(".player-shell");
            var button = shell ? shell.querySelector(".player-start") : null;
            var hls = null;
            var loaded = false;

            function bindStream() {
                if (!stream || loaded) {
                    return;
                }
                loaded = true;
                video.controls = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function playVideo() {
                bindStream();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupSearchForms();
        setupCardFilters();
        setupPlayers();
    });
})();
