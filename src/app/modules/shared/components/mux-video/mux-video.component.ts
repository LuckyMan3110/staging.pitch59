import {
    Component,
    OnInit,
    ViewEncapsulation,
    Input,
    ViewChild,
    ElementRef,
    OnDestroy,
    OnChanges,
    EventEmitter,
    Output,
    HostListener
} from '@angular/core';
import { MuxVideoService } from '../../services/mux-video.service';
import { Subscription } from 'rxjs';
import { UniqueComponentId } from 'primeng/utils';

declare const Hls: any;

@Component({
    selector: 'app-mux-video',
    templateUrl: './mux-video.component.html',
    styleUrls: ['./mux-video.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MuxVideoComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('videoPlayer', {static: true}) videoPlayer: ElementRef;
    @ViewChild('playButton', {static: true}) playButton: ElementRef;
    @ViewChild('seekBar', {static: true}) seekBar: ElementRef;
    @ViewChild('muteButton', {static: true}) muteButton: ElementRef;
    @ViewChild('volumeBar', {static: true}) volumeBar: ElementRef;
    @ViewChild('fullScreenButton', {static: true})
    fullScreenButton: ElementRef;
    @ViewChild('videoControls', {static: true}) videoControls: ElementRef;
    @ViewChild('playback', {static: true}) playback: ElementRef;
    @ViewChild('secondaryControls', {static: true})
    secondaryControls: ElementRef;
    @ViewChild('fullscreenSwitch', {static: true})
    fullscreenSwitch: ElementRef;

    @Output() clickEmit: EventEmitter<any> = new EventEmitter<any>();

    @Input() src: string;

    @Input() cover: string;

    @Input() width = '100%';

    @Input() height = 'auto';

    @Input() playOnClick = false;

    @Input() isVideoMirrored = false;

    @Input()
    set autoPlay(val) {
        this._autoplay = val;
    }

    get autoPlay() {
        return this._autoplay;
    }

    @Input() controls = false;

    @Input() muted = false;

    _autoplay = false;

    autoplayed = false;

    loaded = false;

    volumeIcon = 'volume_up';

    hls;

    isFullscreen = false;

    id: string;

    @Input() srcObject;

    $videoPlaying: Subscription;

    constructor(private service: MuxVideoService) {
        this.id = UniqueComponentId();
    }

    onClickEmit($event) {
        if (this.playOnClick) {
            this.onVideoClick();
        } else {
            this.clickEmit.emit(this.src);
        }
    }

    ngOnInit(): void {
        this.loaded = false;
        if (this.src) {
            this.loadVideo(this.src);
        } else if (this.srcObject) {
            this.loadVideoFromStream(this.srcObject);
        }

        this.$videoPlaying = this.service.$onVideoPlaying.subscribe((id) => {
            if (id != this.id && !this.videoPlayer.nativeElement.paused) {
                this.videoPlayer.nativeElement.pause();
            }
        });
        this.setVolumeIcon();
    }

    ngOnChanges() {
    }

    onLoaded() {
        this.loaded = true;
        this.setVolumeIcon();
    }

    playVideo() {
        this.videoPlayer.nativeElement.play().then(() => {
            this.service.$onVideoPlaying.next(this.id);
            this.makeVideoFullScreenOnRotate(true);
        });
    }

    loadVideo(videoFileUrl) {
        if (videoFileUrl) {
            if (Hls.isSupported()) {
                this.hideMenu();
                if (this.hls) {
                    this.hls.destroy();
                }
                this.hls = new Hls();
                this.hls.loadSource(videoFileUrl);
                this.hls.attachMedia(this.videoPlayer.nativeElement);
                this.videoPlayer.nativeElement.pause();
                if (this.autoPlay) {
                    setTimeout(() => {
                        this.playVideo();
                    }, 300);
                }
            } else if (
              this.videoPlayer.nativeElement.canPlayType(
                'application/vnd.apple.mpegurl'
              )
            ) {
                this.hideMenu();
                this.videoPlayer.nativeElement.src = videoFileUrl;
                this.videoPlayer.nativeElement.pause();
                if (this.autoPlay) {
                    setTimeout(() => {
                        this.playVideo();
                    }, 300);
                }
            }
        }
    }

    loadVideoFromStream(streamSrc) {
        if (streamSrc) {
            if (Hls.isSupported()) {
                this.hideMenu();
                if (this.hls) {
                    this.hls.destroy();
                }
                this.hls = new Hls();
                this.videoPlayer.nativeElement.srcObject = streamSrc;
                this.hls.attachMedia(this.videoPlayer.nativeElement);
                this.videoPlayer.nativeElement.pause();
                if (this.autoPlay) {
                    setTimeout(() => {
                        this.playVideo();
                    }, 300);
                }
            } else if (
              this.videoPlayer.nativeElement.canPlayType(
                'application/vnd.apple.mpegurl'
              )
            ) {
                this.hideMenu();
                this.videoPlayer.nativeElement.srcObject = streamSrc;
                this.videoPlayer.nativeElement.pause();
                if (this.autoPlay) {
                    setTimeout(() => {
                        this.videoPlayer.nativeElement.play().catch();
                        this.makeVideoFullScreenOnRotate(true);
                    }, 300);
                }
            }
        }
    }

    ngOnDestroy() {
        try {
            if (this.hls && Hls.isSupported()) {
                this.hls.stopLoad();
                this.hls.detachMedia();
                this.hls.destroy();
            }
        } catch (error) {
            console.log(error);
        }

        if (this.$videoPlaying) {
            this.$videoPlaying.unsubscribe();
        }
    }

    hideMenu() {
        if (this.videoPlayer.nativeElement.addEventListener) {
            this.videoPlayer.nativeElement.addEventListener(
              'contextmenu',
              function (e) {
                  e.preventDefault();
              },
              false
            );
        } else {
            this.videoPlayer.nativeElement.attachEvent(
              'oncontextmenu',
              function () {
                  window.event.returnValue = false;
              }
            );
        }
    }

    makeVideoFullScreenOnRotate(isVideoPlayingInLandscape = false) {
        // make video playing in full screen for mobile
        // when on landscape mode
        const that = this;
        const videoElement = that.videoPlayer && that.videoPlayer.nativeElement;

        window.onorientationchange = function () {
            if (window.orientation === 90 || window.orientation === -90) {
                if (videoElement) {
                    // if screen rotates it will play video in fullscreen
                    videoElement.webkitEnterFullScreen();
                }
            }
        };

        // if video is already playing in landscape
        if (isVideoPlayingInLandscape) {
            if (window.orientation === 90 || window.orientation === -90) {
                if (videoElement) {
                    // if screen rotates it will play video in fullscreen
                    videoElement.webkitEnterFullScreen();
                }
            }
        }
    }

    onVideoClick() {
        if (this.videoPlayer.nativeElement.paused) {
            this.playVideo();
        } else {
            this.videoPlayer.nativeElement.pause();
        }
    }

    onTimeUpdate(event) {
        if (event.target.duration) {
            if (event.target.currentTime >= event.target.duration) {
                this.videoPlayer.nativeElement.pause();
                this.videoPlayer.nativeElement.currentTime = 0;
            }
        }
        this.onSeekTimeUpdate();
    }

    onPlayPause() {
        if (this.videoPlayer.nativeElement.paused === true) {
            // Play the video
            this.videoPlayer.nativeElement.play();
            this.setPlayIcon(this.videoPlayer.nativeElement.paused);
        } else {
            // Pause the video
            this.videoPlayer.nativeElement.pause();
            this.setPlayIcon(this.videoPlayer.nativeElement.paused);
        }
    }

    setPlayIcon(isPlaying) {
        if (isPlaying) {
            this.playButton.nativeElement.innerHTML = 'pause_circle_outline';
        } else {
            this.playButton.nativeElement.innerHTML = 'play_circle_outline';
        }
    }

    onMute() {
        if (this.videoPlayer.nativeElement.muted === false) {
            // Mute the video
            this.videoPlayer.nativeElement.muted = true;
            this.setVolumeIcon();
        } else {
            // Unmute the video
            this.videoPlayer.nativeElement.muted = false;
            this.setVolumeIcon();
        }
    }

    onFullscreen() {
        if (this.isFullscreen) {
            document.exitFullscreen();
            this.videoPlayer.nativeElement.classList.remove('fullscreen');
        } else {
            if (
              this.videoPlayer.nativeElement.parentElement.requestFullscreen
            ) {
                this.videoPlayer.nativeElement.parentElement.requestFullscreen();
            } else if (
              this.videoPlayer.nativeElement.parentElement
                .mozRequestFullScreen
            ) {
                this.videoPlayer.nativeElement.parentElement.mozRequestFullScreen(); // Firefox
            } else if (
              this.videoPlayer.nativeElement.parentElement
                .webkitRequestFullscreen
            ) {
                this.videoPlayer.nativeElement.parentElement.webkitRequestFullscreen(); // Chrome and Safari
            }
            this.videoPlayer.nativeElement.classList.add('fullscreen');
        }
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
            this.fullScreenButton.nativeElement.innerHTML = 'fullscreen_exit';
        } else {
            this.fullScreenButton.nativeElement.innerHTML = 'fullscreen';
        }
    }

    onSeekChange() {
        const currentTime =
          this.videoPlayer.nativeElement.duration *
          (this.seekBar.nativeElement.value / 100);

        // Update the video time
        this.videoPlayer.nativeElement.currentTime = currentTime;
    }

    onSeekTimeUpdate() {
        this.seekBar.nativeElement.value =
          (100 / this.videoPlayer.nativeElement.duration) *
          this.videoPlayer.nativeElement.currentTime;
    }

    onSeekMouseDown() {
        this.videoPlayer.nativeElement.pause();
    }

    onSeekMouseUp() {
        this.videoPlayer.nativeElement.play();
    }

    onVolumeChange() {
        this.videoPlayer.nativeElement.volume =
          this.volumeBar.nativeElement.value;
        this.setVolumeIcon();
    }

    setVolumeIcon() {
        if (this.videoPlayer.nativeElement.muted) {
            this.muteButton.nativeElement.innerHTML = 'volume_off';
        } else {
            if (this.volumeBar.nativeElement.value < 0.3) {
                this.muteButton.nativeElement.innerHTML = 'volume_mute';
            } else if (this.volumeBar.nativeElement.value < 0.6) {
                this.muteButton.nativeElement.innerHTML = 'volume_down';
            } else {
                this.muteButton.nativeElement.innerHTML = 'volume_up';
            }
        }
    }

    onVideoEnded() {
        this.playButton.nativeElement.innerHTML = 'play_circle_outline';
    }

    onMouseEnter(event) {
        event.preventDefault;
        this.playback.nativeElement.classList.add('slide-in-bottom');
        void this.playback.nativeElement.offsetWidth;
        this.playback.nativeElement.classList.remove('slide-out-bottom');
        void this.playback.nativeElement.offsetWidth;
        this.secondaryControls.nativeElement.classList.add('slide-in-bottom');
        void this.secondaryControls.nativeElement.offsetWidth;
        this.secondaryControls.nativeElement.classList.remove(
          'slide-out-bottom'
        );
        void this.secondaryControls.nativeElement.offsetWidth;
        this.playback.nativeElement.style.animationPlayState = 'running';
        this.secondaryControls.nativeElement.style.animationPlayState =
          'running';

        const playbackElem = this.playback.nativeElement;
        const controlsElem = this.secondaryControls.nativeElement;

        this.playback.nativeElement.before(playbackElem);
        this.secondaryControls.nativeElement.before(controlsElem);

        document
          .querySelector(
            '.' +
            this.playback.nativeElement.attributes.class.value
              .split(' ')
              .join('.') +
            ':last-child'
          )
          .remove();
        document
          .querySelector(
            '.' +
            this.secondaryControls.nativeElement.attributes.class.value
              .split(' ')
              .join('.') +
            ':last-child'
          )
          .remove();
    }

    onMouseLeave(event) {
        event.preventDefault;
        this.playback.nativeElement.classList.add('slide-out-bottom');
        void this.playback.nativeElement.offsetWidth;
        this.playback.nativeElement.classList.remove('slide-in-bottom');
        void this.playback.nativeElement.offsetWidth;
        this.secondaryControls.nativeElement.classList.add('slide-out-bottom');
        void this.secondaryControls.nativeElement.offsetWidth;
        this.secondaryControls.nativeElement.classList.remove(
          'slide-in-bottom'
        );
        void this.secondaryControls.nativeElement.offsetWidth;
        this.playback.nativeElement.style.animationPlayState = 'running';
        this.secondaryControls.nativeElement.style.animationPlayState =
          'running';

        const playbackElem = this.playback.nativeElement;
        const controlsElem = this.secondaryControls.nativeElement;

        this.playback.nativeElement.before(playbackElem);
        this.secondaryControls.nativeElement.before(controlsElem);

        document
          .querySelector(
            '.' +
            this.playback.nativeElement.attributes.class.value
              .split(' ')
              .join('.') +
            ':last-child'
          )
          .remove();
        document
          .querySelector(
            '.' +
            this.secondaryControls.nativeElement.attributes.class.value
              .split(' ')
              .join('.') +
            ':last-child'
          )
          .remove();
    }
}
