(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-thumb]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFiltering() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter-form]'));
    forms.forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      var list = document.querySelector('[data-card-list]');
      var empty = document.querySelector('[data-empty-result]');
      if (!input || !list) {
        return;
      }

      if (form.hasAttribute('data-sync-query')) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;
      }

      function filter() {
        var term = normalize(input.value);
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matched = !term || haystack.indexOf(term) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filter();
      });
      input.addEventListener('input', filter);
      filter();
    });
  }

  function setupImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-unavailable');
      }, { once: true });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFiltering();
    setupImageFallback();
  });
}());
