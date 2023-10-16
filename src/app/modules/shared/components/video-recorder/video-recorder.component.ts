import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ViewChild } from '@angular/core';
import { IMediaRecorder, MediaRecorder } from 'extendable-media-recorder';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { interval, Subscription } from 'rxjs';
import { UserCommonService } from '../../services/user-common.service';
import { SubSink } from 'subsink';
import { AppSettings } from '../../app.settings';
import { StorageService } from '../../services/storage.service';
import { RecorderErrors } from './errors';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { PitchCardType } from '../../enums/pitch-card-type.enum';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss']
})
export class VideoRecorderComponent
  implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('videoElement')
  video!: ElementRef;
  @ViewChild('videoRecordedElement')
  videoRecorded!: ElementRef;
  @ViewChild('countdown')
  countdownTop!: CountdownComponent;
  @ViewChild('beforeRecordCountdown')
  beforeRecordCountdown!: CountdownComponent;
  @ViewChild('textarea')
  textarea!: ElementRef;
  @ViewChild('recorderWrapper')
  recorderWrapper!: ElementRef;

  // tslint:disable-next-line: no-output-on-prefix
  @Output()
  closeVideo = new EventEmitter<boolean>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output()
  saveVideo = new EventEmitter<File>();

  private subs$ = new SubSink();
  public countdownTopLeftTime = 59;
  private slowScrollSpeed = 100;
  private autoScrollSpeed = 50;
  public isActiveCoundown = false;
  private videoElemet: HTMLVideoElement;
  private videoRecordedEl: HTMLVideoElement;
  public recorderWrapperEl: any;
  private stm!: MediaStream;
  private mediaRecorder: IMediaRecorder;
  private blob!: Blob;
  public isRecording = false;
  public isRecorded = false;
  public isPlaying = false;
  public isQuestions = true;
  public isTeleprompter = false;
  public isSlowScroll = false;
  private intervalScroll: any;
  public userFullName: string;
  public timerCountdown = 5;
  public isTenSecondsLeft = false;
  public isModalError: boolean;
  public modalErrorText: string;
  public isPermissionDenied = false;
  public isNotSupportedBrowser = false;
  public isMobile = false;
  private chunks = [];
  pitchcardType: PitchCardType;

  constructor(
    private userCommonService: UserCommonService,
    private storageService: StorageService,
    private createPitchCardService: CreatePitchCardService
  ) {
  }

  ngOnInit(): void {
    const isInLandscape = window.matchMedia(
      '(orientation: landscape)'
    ).matches;
    if (
      window.screen.width < 670 ||
      (window.screen.width < 900 && isInLandscape)
    ) {
      this.isMobile = true;
    }
    this.initCamera();
    const userDetails =
      this.storageService.getItem(AppSettings.USER_DETAILS) &&
      JSON.parse(this.storageService.getItem(AppSettings.USER_DETAILS));
    this.subs$.sink = this.userCommonService
      .getUserProfile(userDetails.userId)
      .subscribe(
        (res) =>
          (this.userFullName = `${res.data.firstName} ${res.data.lastName}`)
      );

    this.pitchcardType = this.createPitchCardService.businessType;
  }

  ngAfterViewInit(): void {
    this.videoElemet = this.video.nativeElement;
    this.recorderWrapperEl = this.recorderWrapper.nativeElement;
  }

  ngOnDestroy(): void {
    this.subs$.unsubscribe();
    this.closeRecorder();
  }

  public initCamera(): void {
    this.isModalError = false;
    const constraints = {
      audio: true,
      video: {width: 640, height: 360, facingMode: 'user'},
      framerate: 60
    };
    if (!navigator.mediaDevices.getUserMedia) {
      this.modalErrorText = RecorderErrors.NAVIGATOR_NOT_SUPPORTED;
      this.isNotSupportedBrowser = true;
      this.isModalError = true;
      return;
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream: MediaStream) => {
        this.stm = stream;
        this.videoElemet.srcObject = stream;
      })
      .catch((error) => this.showModalError(`${error}`));
  }

  public startBeforeRecord(): void {
    if (this.stm) {
      this.isRecorded = false;
      this.isActiveCoundown = true;
      this.resetTeleprompterScroll();
      const intervalSec = interval(1000).subscribe(() => {
        this.timerCountdown--;
        if (this.timerCountdown === 0) {
          this.startRecord();
          intervalSec.unsubscribe();
          this.timerCountdown = 5;
          this.isActiveCoundown = false;
        }
      });
    } else {
      this.showModalError('noStream');
    }
  }

  private showModalError(error: string) {
    console.log(error);
    if (
      error.includes('denied permission') ||
      error.includes('Permission denied') ||
      error.includes('NotAllowedError')
    ) {
      this.modalErrorText = RecorderErrors.PERMISSION_DENIED;
      this.isPermissionDenied = true;
    } else if (error === 'noStream') {
      this.modalErrorText = RecorderErrors.NO_STREAM;
    } else if (error.includes('NotReadableError')) {
      this.modalErrorText = RecorderErrors.NOT_READABLE;
    }
    this.isModalError = true;
  }

  private startRecord(): void {
    let options;
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = {mimeType: 'video/webm;codecs=vp9'};
      this.mediaRecorder = new MediaRecorder(this.stm, options);
      this.mediaRecorder.start();
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
      options = {mimeType: 'video/webm;codecs=h264'};
      this.mediaRecorder = new MediaRecorder(this.stm, options);
      this.mediaRecorder.start();
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = {mimeType: 'video/webm'};
      this.mediaRecorder = new MediaRecorder(this.stm, options);
      this.mediaRecorder.start();
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = {mimeType: 'video/mp4'};
      this.mediaRecorder = new MediaRecorder(this.stm, options);
      this.mediaRecorder.start();
    } else {
      this.mediaRecorder = new MediaRecorder(this.stm);
      this.mediaRecorder.start();
    }
    this.isRecorded = false;
    this.isRecording = true;
    this.countdownTop.begin();
    setTimeout(() => {
      this.scrollTeleprompter();
    }, 5000);
  }

  public togglePlayer(): void {
    this.isPlaying
      ? this.videoRecordedEl.pause()
      : this.videoRecordedEl.play();
    this.isPlaying = !this.isPlaying;
  }

  public toggleQuestions(): void {
    this.isTeleprompter = false;
    this.isQuestions = !this.isQuestions;
  }

  public toggleTeleprompter(): void {
    this.isQuestions = false;
    this.isTeleprompter = !this.isTeleprompter;
  }

  public toggleScrollSpeed(): void {
    this.isSlowScroll = !this.isSlowScroll;
    this.scrollTeleprompter();
  }

  private resetTeleprompterScroll(): void {
    if (this.intervalScroll) {
      this.intervalScroll.unsubscribe();
    }
    this.textarea.nativeElement.scrollTop = 0;
  }

  public scrollTeleprompter(): void {
    const scrollSpeed = this.isSlowScroll
      ? this.slowScrollSpeed
      : this.autoScrollSpeed;
    const scrollTo = 1;
    if (this.intervalScroll) {
      this.intervalScroll.unsubscribe();
    }
    this.intervalScroll = interval((scrollSpeed * 60) / 60).subscribe(
      () => {
        this.textarea.nativeElement.scrollTop += scrollTo;
      }
    );
  }

  public countdownTimer(event: CountdownEvent): void {
    if (event.action === 'restart') {
      this.isTenSecondsLeft = false;
    }
    if (event.action === 'notify') {
      this.isTenSecondsLeft = true;
    }
    if (event.action === 'done') {
      this.stopRecording();
      this.isTenSecondsLeft = false;
    }
  }

  private setPreviewVideo(): void {
    const isInLandscape = window.matchMedia(
      '(orientation: landscape)'
    ).matches;
    this.videoRecordedEl = this.videoRecorded.nativeElement;
    this.blob = new Blob(this.chunks, {
      type: this.mediaRecorder.mimeType
    });
    const url = URL.createObjectURL(this.blob);
    this.videoRecordedEl.src = url;
    this.videoRecordedEl.onplaying = () => {
      this.isPlaying = true;
    };
    this.videoRecordedEl.onpause = () => {
      this.isPlaying = false;
    };
    if (window.screen.width < 900 && isInLandscape) {
      this.videoRecordedEl.play();
    }
  }

  private onDataAvailableEvent() {
    try {
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e: { data: any }) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
        this.setPreviewVideo();
      };
    } catch (error) {
      console.log(error);
    }
  }

  public stopRecording(): void {
    this.isRecorded = true;
    this.isRecording = false;
    this.mediaRecorder.stop();
    this.onDataAvailableEvent();
    this.countdownTop.restart();
    this.isTeleprompter = false;
    if (this.intervalScroll) {
      this.intervalScroll.unsubscribe();
    }
  }

  public closeRecorder() {
    this.isModalError = false;
    if (this.stm) {
      this.stm.getTracks().forEach((t) => t.stop());
    }
    if (this.intervalScroll) {
      this.intervalScroll.unsubscribe();
    }
    this.videoElemet.srcObject = null;
    this.closeVideo.emit(true);
  }

  public saveVideoToServer() {
    const formdata = new FormData();
    const file = new File([this.blob], 'record.mp4');
    this.saveVideo.emit(file);
    this.closeRecorder();
  }
}
