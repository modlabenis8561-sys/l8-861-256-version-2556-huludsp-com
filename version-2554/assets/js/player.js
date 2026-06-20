(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupPlayer(card) {
    var video = card.querySelector('video[data-src]');
    var button = card.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var attached = false;

    function attachSource() {
      if (attached || !source) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }
      video.src = source;
      return Promise.resolve();
    }

    function play() {
      attachSource().then(function () {
        card.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            card.classList.remove('is-playing');
          });
        }
      });
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      card.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        card.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      card.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player-card]')).forEach(setupPlayer);
  });
}());
