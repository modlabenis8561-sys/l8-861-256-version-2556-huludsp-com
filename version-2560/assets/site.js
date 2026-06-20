(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textOf(value) {
    return (value || "").toString().toLowerCase();
  }

  function escapeHTML(value) {
    return (value || "").toString().replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function movieResultCard(movie) {
    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"movie-card-link\" href=\"" + escapeHTML(movie.url) + "\">" +
      "<div class=\"movie-poster\"><img src=\"" + escapeHTML(movie.image) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\"></div>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\"><span>" + escapeHTML(movie.region) + "</span><span>" + escapeHTML(movie.year) + "</span></div>" +
      "<h2>" + escapeHTML(movie.title) + "</h2>" +
      "<p>" + escapeHTML(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\"><span>" + escapeHTML(movie.genre) + "</span></div>" +
      "</div></a></article>";
  }

  function filterMovies(list, query) {
    var q = textOf(query).trim();
    if (!q) {
      return [];
    }
    return list.filter(function (movie) {
      return textOf([
        movie.title,
        movie.region,
        movie.genre,
        movie.tags,
        movie.year,
        movie.oneLine
      ].join(" ")).indexOf(q) !== -1;
    });
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.getElementById("mobile-menu");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var active = 0;
      var showSlide = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle("is-active", pos === active);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle("is-active", pos === active);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
        });
      });
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var filterPanel = document.querySelector(".filter-panel");
    if (filterPanel) {
      var input = filterPanel.querySelector(".category-search-input");
      var buttons = Array.prototype.slice.call(filterPanel.querySelectorAll(".filter-choice"));
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var empty = document.querySelector(".empty-state");
      var activeFilter = "all";
      var applyFilter = function () {
        var query = textOf(input ? input.value : "").trim();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = textOf([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          var filterMatch = activeFilter === "all" || haystack.indexOf(textOf(activeFilter)) !== -1;
          var shouldShow = queryMatch && filterMatch;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      };
      if (input) {
        input.addEventListener("input", applyFilter);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeFilter = button.getAttribute("data-filter") || "all";
          applyFilter();
        });
      });
    }

    if (window.MOVIE_INDEX) {
      var homeInput = document.getElementById("home-search-input");
      var homeResults = document.getElementById("home-search-results");
      if (homeInput && homeResults) {
        var renderHome = function () {
          var results = filterMovies(window.MOVIE_INDEX, homeInput.value).slice(0, 4);
          homeResults.innerHTML = results.map(function (movie) {
            return "<a class=\"quick-result-link\" href=\"" + escapeHTML(movie.url) + "\">" +
              "<img src=\"" + escapeHTML(movie.image) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">" +
              "<strong>" + escapeHTML(movie.title) + "<span>" + escapeHTML(movie.year + " · " + movie.region) + "</span></strong>" +
              "</a>";
          }).join("");
        };
        homeInput.addEventListener("input", renderHome);
      }

      var searchInput = document.getElementById("search-page-input");
      var searchResults = document.getElementById("search-results");
      var searchStatus = document.getElementById("search-status");
      if (searchInput && searchResults && searchStatus) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        searchInput.value = q;
        var renderSearch = function () {
          var query = searchInput.value.trim();
          var results = filterMovies(window.MOVIE_INDEX, query).slice(0, 96);
          if (!query) {
            searchStatus.textContent = "输入关键词即可查看相关影片";
            searchResults.innerHTML = "";
            return;
          }
          searchStatus.textContent = results.length ? "已找到相关影片" : "没有找到匹配影片";
          searchResults.innerHTML = results.map(movieResultCard).join("");
        };
        renderSearch();
        searchInput.addEventListener("input", renderSearch);
      }
    }
  });
}());
