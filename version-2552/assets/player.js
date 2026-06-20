(function () {
    function setupPlayer(root) {
        const video = root.querySelector('video');
        const cover = root.querySelector('[data-cover]');
        const button = root.querySelector('[data-play]');
        const streamUrl = root.getAttribute('data-url');
        let ready = false;
        let hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function startPlay() {
            attachStream();
            root.classList.add('is-playing');
            video.controls = true;

            const playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlay);
        }

        if (button) {
            button.addEventListener('click', startPlay);
        }

        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                startPlay();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
