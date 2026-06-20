(function () {
    var scriptUrl = document.currentScript ? document.currentScript.src : '';
    var moduleUrl = scriptUrl ? new URL('hls-dru42stk.js', scriptUrl).href : './assets/hls-dru42stk.js';
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-overlay');
        var streamUrl = player.getAttribute('data-stream');
        var attached = false;
        var attaching = null;

        function attachStream() {
            if (attached) {
                return Promise.resolve();
            }

            if (attaching) {
                return attaching;
            }

            attaching = new Promise(function (resolve) {
                if (!video || !streamUrl) {
                    resolve();
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    attached = true;
                    resolve();
                    return;
                }

                import(moduleUrl).then(function (module) {
                    var Hls = module.H;
                    if (Hls && Hls.isSupported()) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                        attached = true;
                    } else {
                        video.src = streamUrl;
                        attached = true;
                    }
                    resolve();
                }).catch(function () {
                    video.src = streamUrl;
                    attached = true;
                    resolve();
                });
            });

            return attaching;
        }

        function start() {
            attachStream().then(function () {
                player.classList.add('is-started');
                var playRequest = video.play();
                if (playRequest && playRequest.catch) {
                    playRequest.catch(function () {
                        player.classList.remove('is-started');
                    });
                }
            });
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!attached || video.paused) {
                    start();
                }
            });
        }
    });
})();
