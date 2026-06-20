(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-card-search]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-hint]");

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.tags, card.dataset.year, card.dataset.type].join(" ").toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || card.dataset.year === selectedYear;
          var matchType = !selectedType || card.dataset.type === selectedType;
          var shouldShow = matchKeyword && matchYear && matchType;
          card.classList.toggle("is-hidden", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && search) {
        search.value = q;
      }
      apply();
    });
  }

  function setupPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player-box]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("[data-video-player]");
      var button = box.querySelector("[data-play-button]");
      var controller = null;

      if (!video || !button) {
        return;
      }

      function attach() {
        if (video.dataset.ready === "true") {
          return;
        }
        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          controller = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          controller.loadSource(stream);
          controller.attachMedia(video);
          video.dataset.ready = "true";
        } else {
          video.src = stream;
          video.dataset.ready = "true";
        }
      }

      function play() {
        attach();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        box.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        box.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (controller && typeof controller.destroy === "function") {
          controller.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
