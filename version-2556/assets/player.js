(function () {
    function initMoviePlayer(streamUrl) {
        var player = document.querySelector(".movie-player");
        if (!player || !streamUrl) {
            return;
        }

        var video = player.querySelector("video");
        var layer = player.querySelector(".player-layer");
        var status = player.querySelector(".player-status");
        var hlsInstance = null;
        var loaded = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }

        function loadStream() {
            if (loaded || !video) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放暂时不可用");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                setStatus("播放暂时不可用");
            }
        }

        function start() {
            loadStream();
            if (layer) {
                layer.classList.add("hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
