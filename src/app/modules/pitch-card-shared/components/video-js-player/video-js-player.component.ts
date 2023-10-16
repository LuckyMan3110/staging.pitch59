import {
  Component,
  AfterViewInit,
  Input,
  ElementRef,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
  OnDestroy
} from '@angular/core';

import videojs from 'video.js';
import 'videojs-landscape-fullscreen';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UiService } from '../../../shared/services/ui.service';

@Component({
  selector: 'app-video-js-player',
  templateUrl: './video-js-player.component.html',
  styleUrls: ['./video-js-player.component.scss']
})
export class VideoJsPlayerComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('target', {static: true}) target: ElementRef;

  _muxVideoId: string;
  @Input() autoplay = false;
  @Input() muted = true;
  @Input() isVideoMirrored = false;
  @Input() posterUrl = '';
  @Input() allowFullScreenOnRotate = true;

  @Input() set muxVideoId(value: string) {
    this._muxVideoId = value;
  }

  get muxVideoId(): string {
    return this._muxVideoId;
  }

  @Output() watchedSeconds: EventEmitter<any> = new EventEmitter();
  @Output() timeUpdate: EventEmitter<any> = new EventEmitter();
  @Output() uploadError: EventEmitter<any> = new EventEmitter();

  videoJsOptions: any = {
    preload: 'metadata',
    aspectRatio: '16:9',
    controls: true,
    autoplay: false,
    muted: true,
    bigPlayButton: false,
    controlBar: {
      remainingTimeDisplay: false,
      pictureInPictureToggle: false,
      progressControl: {
        seekBar: {
          mouseTimeDisplay: false,
          playProgressBar: {
            timeTooltip: false
          }
        }
      }
    }
  };

  player: videojs.Player;
  id: string;

  @HostListener('window:resize', ['$event'])
  onOrientationChange(event) {
    if (!this.dds.isDesktop() && this.allowFullScreenOnRotate) {
      const mql = window.matchMedia('(orientation: portrait)');
      if (mql.matches) {
        this.closeFullScreen(this.player);
      } else {
        this.openFullscreen(this.player);
      }
    }
  }

  constructor(
    private dds: DeviceDetectorService,
    private uiService: UiService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.initPlayer();
    this.player.on('play', (e) => {
      // this.player.controls(false);
      // if (this.videoJsOptions.muted !== this.target.nativeElement.muted && this.dds.isMobile()) {
      //   this.target.nativeElement.muted = this.muted;
      // }
    });
    // this.player.on('volumechange', () => {
    //   console.log('Mute mode has been changed');
    // });

    this.player.on('error', () => {
      if (this.player?.error()?.message) {
        this.uiService.warningMessage(this.player?.error()?.message);
        this.uploadError.emit(true);
      }
    });
  }

  initPlayer() {
    this.videoJsOptions.autoplay = this.autoplay;
    if (this.dds.isDesktop()) {
      this.videoJsOptions.muted = this.muted;
      if (this.videoJsOptions.muted !== this.target.nativeElement.muted) {
        this.target.nativeElement.muted = this.muted;
      }
    }
    this.player = videojs(this.target.nativeElement, this.videoJsOptions);
    if (
      this.videoJsOptions.muted !== this.target.nativeElement.muted &&
      !this.dds.isDesktop()
    ) {
      this.player.muted(this.muted);
    }

    if (this._muxVideoId) {
      this.player.src({
        type: 'application/x-mpegURL',
        src: this._muxVideoId
      });
    }
  }

  calculateWatchedRange() {
    if (this.player?.played() && this.player?.played().length) {
      let watchedTime = 0;
      for (let i = 0; i < this.player.played().length; i++) {
        watchedTime +=
          this.player.played().end(i) - this.player.played().start(i);
      }
      this.watchedSeconds.emit(
        watchedTime || watchedTime === 0 ? watchedTime : 0
      );
    }
  }

  openFullscreen(elem): void {
    if (this.dds.os === 'Android') {
      this.target.nativeElement.requestFullscreen();
    } else if (this.allowFullScreenOnRotate) {
      if (!elem.isFullscreen()) {
        elem.requestFullscreen();
        elem.enterFullWindow();
      } else {
        elem.exitFullscreen();
      }
    }
  }

  closeFullScreen(elem): void {
    if (this.dds.os !== 'Android') {
      if (elem.isFullscreen()) {
        elem.exitFullscreen();
        elem.play();
      }
    }
  }

  onTimeUpdate(e) {
    this.timeUpdate.emit(e);
  }

  setMutedMode(muted) {
    this.target.nativeElement.muted = muted;
  }

  ngOnDestroy() {
    if (this.player) {
      this.calculateWatchedRange();
      this.player.dispose();
    }
  }
}
