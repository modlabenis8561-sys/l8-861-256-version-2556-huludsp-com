(function () {
    var nav = document.querySelector('[data-nav]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(index);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var genre = scope.querySelector('[data-filter-genre]');
        var list = scope.parentElement.querySelector('[data-card-list]');
        var cards = list ? Array.prototype.slice.call(list.children) : [];

        function filter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var genreValue = genre ? genre.value : '';

            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var cardGenre = card.getAttribute('data-genre') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                var textMatch = !keyword || title.indexOf(keyword) !== -1 || cardGenre.toLowerCase().indexOf(keyword) !== -1 || cardRegion.indexOf(keyword) !== -1;
                var yearMatch = !yearValue || cardYear === yearValue;
                var genreMatch = !genreValue || cardGenre.indexOf(genreValue) !== -1;

                card.hidden = !(textMatch && yearMatch && genreMatch);
            });
        }

        [input, year, genre].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });
    });

    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchSubtitle = document.querySelector('[data-search-subtitle]');

    function createSearchCard(item) {
        var terms = item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a class="card-image" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="play-badge">播放</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
            '<p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</p>' +
            '<p class="card-desc">' + escapeHtml(item.desc) + '</p>' +
            '<div class="tag-row">' + terms + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function runSearch(query) {
        if (!searchResults || !window.siteSearchItems) {
            return;
        }

        var keyword = query.trim().toLowerCase();
        if (!keyword) {
            return;
        }

        var results = window.siteSearchItems.filter(function (item) {
            return item.title.toLowerCase().indexOf(keyword) !== -1 ||
                item.genre.toLowerCase().indexOf(keyword) !== -1 ||
                item.region.toLowerCase().indexOf(keyword) !== -1 ||
                item.year.toLowerCase().indexOf(keyword) !== -1 ||
                item.tags.join(' ').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 96);

        if (searchTitle) {
            searchTitle.textContent = '搜索结果';
        }

        if (searchSubtitle) {
            searchSubtitle.textContent = keyword ? '与“' + query + '”相关的影片入口' : '热度与口碑兼具的影片入口。';
        }

        searchResults.innerHTML = results.map(createSearchCard).join('');
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial) {
            searchInput.value = initial;
            runSearch(initial);
        }

        searchInput.addEventListener('input', function () {
            runSearch(searchInput.value);
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            if (searchInput && searchInput.value.trim()) {
                event.preventDefault();
                var nextUrl = './search.html?q=' + encodeURIComponent(searchInput.value.trim());
                window.history.pushState({}, '', nextUrl);
                runSearch(searchInput.value);
            }
        });
    }
})();
