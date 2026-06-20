(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function bindMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function bindHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
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
        restart();
    }

    function cardText(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.textContent
        ].join(" ").toLowerCase();
    }

    function bindFilters() {
        var input = document.querySelector("[data-filter-input]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!cards.length) {
            return;
        }
        var activeFilter = "all";

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var text = cardText(card);
                var matchesQuery = !q || text.indexOf(q) !== -1;
                var matchesFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                apply();
            });
        });
    }

    function escapeText(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function renderSearchPage() {
        var input = document.getElementById("globalSearchInput");
        var results = document.getElementById("searchResults");
        if (!input || !results || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var q = input.value.trim().toLowerCase();
            var data = window.SEARCH_DATA.filter(function (item) {
                var text = [item.t, item.y, item.r, item.g, item.c, item.k].join(" ").toLowerCase();
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 120);
            if (!data.length) {
                results.innerHTML = "<p class=\"empty-state\">没有找到匹配影片</p>";
                return;
            }
            results.innerHTML = data.map(function (item) {
                return "<article class=\"movie-card\">" +
                    "<a class=\"poster-link\" href=\"" + escapeText(item.u) + "\">" +
                    "<img src=\"" + escapeText(item.i) + "\" alt=\"" + escapeText(item.t) + "\">" +
                    "<span class=\"poster-year\">" + escapeText(item.y) + "</span>" +
                    "<span class=\"poster-type\">" + escapeText(item.c) + "</span>" +
                    "</a>" +
                    "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-meta-line\"><span>" + escapeText(item.r) + "</span><span>" + escapeText(item.g) + "</span></div>" +
                    "<h3><a href=\"" + escapeText(item.u) + "\">" + escapeText(item.t) + "</a></h3>" +
                    "<p>" + escapeText(item.s) + "</p>" +
                    "<div class=\"tag-row\"><span>" + escapeText(item.k) + "</span></div>" +
                    "</div>" +
                    "</article>";
            }).join("");
        }

        input.addEventListener("input", render);
        render();
    }

    window.initMoviePlayer = function (source) {
        var player = document.querySelector("[data-movie-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var button = player.querySelector(".play-overlay");
        if (!video || !button) {
            return;
        }
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = source;
            }
            attached = true;
        }

        function start() {
            attach();
            player.classList.add("is-playing");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!attached) {
                start();
            }
        });
    };

    ready(function () {
        bindMobileMenu();
        bindHeroSlider();
        bindFilters();
        renderSearchPage();
    });
})();
