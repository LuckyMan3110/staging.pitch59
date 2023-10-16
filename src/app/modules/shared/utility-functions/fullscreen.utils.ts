// tslint:disable-next-line: curly
declare var document: any;

export function isFullScreen() {
  return (
    (document.fullScreenElement && document.fullScreenElement !== null) ||
    document.mozFullScreen ||
    document.webkitIsFullScreen
  );
}

export function requestFullScreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
}

export function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
}

export function toggleFullScreen(element) {
    if (isFullScreen()) {
        exitFullScreen();
    } else {
        requestFullScreen(element || document.documentElement);
    }
}

export function makeVideoFullScreenOnRotate(
  videoElement,
  isVideoPlayingInLandscape = false
) {
  // make video playing in full screen for mobile
  // when on landscape mode
  window.onorientationchange = function () {
    if (window.orientation === 90 || window.orientation === -90) {
      if (videoElement) {
        // if screen rotates it will play video in fullscreen
        requestFullScreen(videoElement);
      }
    }
  };

    // if video is already playing in landscape
    if (isVideoPlayingInLandscape) {
      if (window.orientation === 90 || window.orientation === -90) {
        if (videoElement) {
          // if screen rotates it will play video in fullscreen
          requestFullScreen(videoElement);
        }
      }
    }
}
