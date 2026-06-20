(function () {
  window.setupMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("play-button");
    var mask = document.querySelector(".player-mask");
    var attached = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    }

    function play() {
      attach();
      if (mask) {
        mask.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (mask) {
      mask.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
}());
