(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function attach(video) {
        if (!video || video.dataset.ready === "true") {
            return;
        }
        var source = video.getAttribute("data-playback");
        if (!source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.dataset.ready = "true";
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            video.dataset.ready = "true";
        }
    }

    function begin(video, trigger) {
        attach(video);
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    ready(function () {
        document.querySelectorAll(".movie-video").forEach(function (video) {
            var frame = video.closest(".video-frame");
            var trigger = frame ? frame.querySelector("[data-play-trigger]") : null;

            if (trigger) {
                trigger.addEventListener("click", function () {
                    begin(video, trigger);
                });
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    begin(video, trigger);
                } else {
                    video.pause();
                }
            });

            video.addEventListener("play", function () {
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
            });
        });
    });
})();
