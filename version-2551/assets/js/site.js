(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.detail) + "\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-tags=\"" + escapeHtml((movie.tags || []).join(",")) + "\">" +
        "<span class=\"poster-frame\">" +
          "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"poster-badge\">" + escapeHtml(movie.rating) + "</span>" +
        "</span>" +
        "<span class=\"card-content\">" +
          "<span class=\"card-title\">" + escapeHtml(movie.title) + "</span>" +
          "<span class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>" +
          "<span class=\"card-desc\">" + escapeHtml(movie.oneLine || movie.summary || "") + "</span>" +
          "<span class=\"tag-list\">" + tags + "</span>" +
        "</span>" +
      "</a>";
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", nav.classList.contains("open"));
      button.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var scope = input.closest("section");
        var grid = scope ? scope.parentElement.querySelector(".filter-scope") : document.querySelector(".filter-scope");
        if (!grid) {
          grid = document.querySelector(".movie-grid");
        }
        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.style.display = haystack.indexOf(query) >= 0 ? "" : "none";
        });
      });
    });
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    if (!results || typeof MOVIES_INDEX === "undefined") {
      return;
    }

    var query = normalize(getQuery("q"));
    var input = document.querySelector(".search-page-form input[name='q']");
    if (input && query) {
      input.value = getQuery("q");
    }

    if (!query) {
      return;
    }

    var matched = MOVIES_INDEX.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.oneLine,
        movie.summary
      ].join(" "));
      return haystack.indexOf(query) >= 0;
    }).slice(0, 120);

    if (!matched.length) {
      results.innerHTML = "<div class=\"no-results\">没有找到匹配内容，可尝试更换片名、年份、地区或类型。</div>";
      return;
    }

    results.innerHTML = matched.map(movieCard).join("");
  }

  function setupPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector(".player-start");
      if (!video || !button) {
        return;
      }

      var source = video.getAttribute("data-m3u8");
      var hlsInstance = null;

      function prepare() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "1");
      }

      function play() {
        prepare();
        frame.classList.add("is-playing");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            frame.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        frame.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        frame.classList.remove("is-playing");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
