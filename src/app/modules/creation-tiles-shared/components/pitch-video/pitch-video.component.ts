import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { of, ReplaySubject, Subscription, throwError } from 'rxjs';
import { AppSettings } from '../../../shared/app.settings';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { SubSink } from 'subsink';
import { Tooltip } from 'primeng/tooltip';
import { FormGroup } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { UserSession } from '../../../shared/models/user-session.model';
import { AppConstantService } from '../../../shared/services/app-constant.service';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { RestApiService } from '../../../shared/services/rest-api.service';
import { BusinessService } from '../../../business/services/business.service';
import { UiService } from '../../../shared/services/ui.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import {
  CreateEmployerPortalService,
  Step
} from '../../../create-employer-portal/create-employer-portal.service';
import { Router } from '@angular/router';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { FileUpload } from 'primeng/fileupload';
import { OverlayPanel } from 'primeng/overlaypanel';
import {
  delay,
  filter,
  mergeMap,
  retryWhen,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

declare const Hls: any;
declare const Calendly: any;

@Component({
  selector: 'app-pitch-video',
  templateUrl: './pitch-video.component.html',
  styleUrls: ['./pitch-video.component.scss']
})
export class PitchVideoComponent
  implements OnInit, OnDestroy, AfterContentChecked, AfterViewInit {
  $validation: Subscription;
  $businessUpdate: Subscription;
  $pitchVideoSubscription: Subscription = new Subscription();
  fileUploadUrl = AppSettings.UPLOAD_FILE_URL + '?fileType=3';
  fileUploadMethod = 'PUT';
  isUploading = false;
  isWebcamUploading = false;
  isUploaded = false;
  isLoadingFinished = false;
  maxSizeVideo = AppSettings.VIDEO_UPLOAD_MAX_SIZE_IN_BYTE;
  calendlyLink = AppSettings.calendlyVirtualVideoShootLink;
  fullName: string;
  progress = 0;
  videoFormat;
  headers: HttpHeaders;
  displayModal = false;
  videoMetaData;
  videoThumbSrc;
  uploadedFile;
  videoUrl = 'assets/images/video.png';
  showVideoPlayer;
  showGetAProTip = false;
  isVideoPaused = true;
  isVideoCoverThumbnailUrlLoaded = false;
  errorInVideoUpload = '';
  showRequirements = false;
  showUploadRequirements = false;
  showLearnMoreRecordNow = false;
  showLearnMoreScheduleNow = true;
  showLearnMoreHirePro = false;
  formatsWithNoType = ['.vob'];
  formatsWithNoMeta = ['.avi', '.wmv', '.flv', '.vob', '.mpg'];
  durationMeterHls;
  meterVideoConfig: { videoEl: any; videoUrl: any; mute: boolean };
  hls;
  scaleFactor = 1;
  currenUploadedVideo: HTMLVideoElement;
  isRecording = false;
  public isMobileVideoCapture = environment.mobileVideoCapture;
  private subs$: SubSink = new SubSink();
  private videoInputUploaderEl: HTMLInputElement;
  public checboxesGuidelines = {
    checkBox1: false,
    checkBox2: false,
    checkBox3: false,
    checkBox4: false
  };

  service: CreatePitchCardService | CreateEmployerPortalService;

  @ViewChild('videoPlayer', {static: false}) videoPlayer: ElementRef;
  @ViewChild('fileUploader', {static: false}) fileUploader: FileUpload;
  @ViewChild('plansContainer') plansContainer: ElementRef;

  @HostBinding('style.--plan-scale-factor') get scale() {
    return this.scaleFactor;
  }

  @ViewChild(Tooltip) tooltip: Tooltip;
  @ViewChild('currentVideo', {static: false})
  currentVideoElement: ElementRef;
  @ViewChild('videoRecorder', {static: false}) videoRecorder: OverlayPanel;
  @ViewChild('videoInput', {static: false}) videoInputUploader: ElementRef;
  @ViewChild('durationMeter', {static: false}) durationMeter: ElementRef;

  form: FormGroup;

  mobileMode = false;
  webcamModal = false;
  @Output() startWebcam = new EventEmitter<any>();

  notIos: boolean;
  isMobile: boolean;
  isMacOs: boolean;

  videoFileUrl: string;
  forRecord: boolean = true;
  isUpoladRestricted: boolean = false;
  appLoader: boolean = false;

  destroy$ = new ReplaySubject(1);

  constructor(
    private appConstantService: AppConstantService,
    private commonBindingService: CommonBindingDataService,
    private restApiService: RestApiService,
    private businessService: BusinessService,
    private router: Router,
    public createEmployerPortalService: CreateEmployerPortalService,
    public createPitchCardService: CreatePitchCardService,
    private uiService: UiService,
    public deviceService: DeviceDetectorService,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private userCommonService: UserCommonService
  ) {
    this.onResized = this.onResized.bind(this);
    this.mobileMode = this.deviceService.isMobile();
    this.isMacOs = this.deviceService.os === 'Mac';
    this.service =
      this.router.url.includes('create') &&
      !this.router.url.includes('createType')
        ? this.createPitchCardService
        : this.createEmployerPortalService;
  }

  ngOnInit() {
    window.addEventListener('resize', this.onResized);
    this.onResized();
    this.notIos = this.deviceService.os !== 'iOS';
    this.isMobile = this.deviceService.isMobile();
    this.headers = this.restApiService.getHeadersFileUpload();
    this.videoFormat = AppSettings.VIDEO_FORMAT;
    this.service.currentStep = Step.Video;
    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.Video) {
        this.service.changeCurrentSectionCompleted(this.form.valid);
        if (this.form.dirty) {
          this.service
            .updateAndChangeStep(this.getPayload())
            .subscribe(
              (result) => {
                if (this.createPitchCardService.finished) {
                  this.createPitchCardService.$finish.next();
                }
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          if (this.createPitchCardService.finished) {
            this.createPitchCardService.$finish.next();
          }
          this.service.currentStep = this.service.moveToStep;
        }
      }
    });

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });
  }

  ngAfterViewInit(): void {
    this.videoInputUploaderEl = this.videoInputUploader.nativeElement;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResized);
    if (this.$validation) {
      this.$validation.unsubscribe();
    }
    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }
    this.uploadedFile = null;
    try {
      this.detachMedia();
    } catch (error) {
      console.log(error);
    }
    this.subs$.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterContentChecked() {
    this.onResized();
  }

  onResized() {
    if (this.plansContainer) {
      const allMargins = 64;
      let freeSpace = 150 + allMargins;
      if (window.innerWidth < 1100) {
        freeSpace = 0;
      }
      const plansContainerWidth =
        this.plansContainer.nativeElement.clientWidth;
      const plansDefaultWidth = 270;
      const cardsInARow = 2;

      this.scaleFactor =
        (plansContainerWidth - freeSpace) /
        plansDefaultWidth /
        cardsInARow;
    }
  }

  showTooltip() {
    this.tooltip.activate();
  }

  videoPlayCoverThumbnailLoaded() {
    if (this.form.controls.videoThumbnailUrl.value) {
      setTimeout(() => {
        this.isVideoCoverThumbnailUrlLoaded = true;
      }, 1700);
    }
  }

  getPayload() {
    const payload = JSON.parse(JSON.stringify(this.form.value));

    return payload;
  }

  initializeForm() {
    this.form = this.service.getBusinessForm();
    if (this.form.value.videoFileId) {
      this.uploadedFile = {
        fileId: this.form.value.videoFileId
      };

      if (
        this.form.value.videoFileId ===
        AppSettings.jobPlaceholderPlaybackID ||
        this.form.value.videoFileId ===
        AppSettings.commonPlaceholderPlaybackID
      ) {
        this.form.markAsDirty();
        this.service.changeCurrentSectionCompleted(this.form.valid);
      }

      this.isUploaded =
        this.form.get('videoFileId').value !==
        AppSettings.commonPlaceholderPlaybackID &&
        this.form.get('videoFileId').value !==
        AppSettings.jobPlaceholderPlaybackID;
    }
    this.service.tileRequiredState = this.form.valid;
    this.service.tileFormGroup = this.form;
  }

  showModalDialog() {
    this.displayModal = true;
  }

  noWebcamError(event) {
    this.uiService.errorMessage(event);
  }

  acceptGuidlines() {
    this.service.guidelinesAccepted = true;
    this.displayModal = false;
    if (this.forRecord) {
      this.showVideorecorder();
    } else {
      this.uploadVideoFile();
    }
  }

  onSelect(event) {
    this.isLoadingFinished = false;
    this.isUpoladRestricted = false;
    const fileExtension = event.files[0].name.substring(
      event.files[0].name.lastIndexOf('.')
    );
    const isValidExtension = this.appConstantService.video_extensions.find(
      (x) => x.toLowerCase() === fileExtension.toLowerCase()
    );

    const objectUrl = URL.createObjectURL(event.files[0]);
    this.durationMeter.nativeElement.src = objectUrl;

    this.form.controls.videoFileId.reset();
    this.form.controls.videoFileUrl.reset();
    this.form.controls.videoThumbnailUrl.reset();
    this.form.markAsDirty();
    this.isUploading = false;
    this.isUploaded = false;
    this.progress = 0;

    if (!isValidExtension) {
      this.uiService.errorMessage(
        this.commonBindingService.getLabel(
          'lbl_please_select_valid_video_format'
        )
      );
      this.isUploading = false;
      return;
    }

    if (this.formatsWithNoMeta.find((f) => f === isValidExtension)) {
      this.meterVideoConfig = {
        videoEl: this.durationMeter,
        videoUrl: '',
        mute: true
      };
    }

    if (event.files[0]) {
      const type = event.files[0].type;
      if (
        !type.includes('video/') &&
        !this.formatsWithNoType.find(
          (f) => f !== isValidExtension.toLowerCase()
        )
      ) {
        this.uiService.errorMessage(
          this.commonBindingService.getLabel(
            'lbl_please_select_valid_video_format'
          )
        );
        this.isUploading = false;
        return;
      }
    }
    if (this.maxSizeVideo < event.files[0].size) {
      this.uiService.errorMessage(
        this.commonBindingService.getLabel(
          'lbl_video_size_exceeds_300_mb'
        )
      );
      this.isUploading = false;
      return;
    }
    // this.fileUploader.upload();
    this.uploading(event.currentFiles[0], false);
  }

  playDurationMeterVideo(config) {
    this.cdr.detectChanges();
    const videoFileUrl = config.videoUrl;

    if (config.videoEl) {
      config.videoEl.nativeElement.muted = config.mute;

      if (videoFileUrl) {
        if (Hls.isSupported()) {
          if (this.durationMeterHls) {
            this.durationMeterHls.destroy();
          }

          this.durationMeterHls = new Hls();
          this.durationMeterHls.loadSource(videoFileUrl);
          this.durationMeterHls.attachMedia(
            config.videoEl.nativeElement
          );
          config.videoEl.nativeElement.play();
        } else if (
          config.videoEl.nativeElement.canPlayType(
            'application/vnd.apple.mpegurl'
          )
        ) {
          config.videoEl.nativeElement.src = videoFileUrl;
          config.videoEl.nativeElement.play();
        }
      }
    }
  }

  checkDuration(event) {
    if (!Number.isNaN(event.target.duration)) {
      if (Math.floor(event.target.duration) > 59) {
        this.uiService.errorMessage(
          this.commonBindingService.getLabel(
            'lbl_video_duration_exceeds_59_seconds'
          )
        );
        if (this.form.value.videoThumbnailUrl) {
          this.isUploaded = true;
          return;
        } else {
          this.isUploaded = false;
        }
        event.target.value = '';
        this.isUploading = false;
        this.isUpoladRestricted = true;
        this.fileUploader.clear();
        this.videoMetaData = null;
      }

      this.form = this.service.getBusinessForm();

      if (
        this.meterVideoConfig &&
        Math.floor(event.target.duration) < 60
      ) {
        this.meterVideoConfig = null;
        if (this.durationMeterHls) {
          this.durationMeterHls.destroy();
        }
        this.setVideoData();
      }
    }
  }

  fetchMuxVideoData() {
    if (this.uploadedFile) {
      this.businessService
        .getVideoDetail(this.uploadedFile.fileId)
        .subscribe(
          (result) => {
            if (
              result?.data &&
              result?.data?.status !== 'errored'
            ) {
              this.videoMetaData = result.data;
              if (this.videoMetaData.status !== 'ready') {
                this.pollMuxAPI(4000);
                this.videoThumbSrc =
                  'assets/images/video-loader.gif';
              } else {
                if (this.meterVideoConfig) {
                  this.meterVideoConfig.videoUrl =
                    result.data.videoUrl;
                  this.playDurationMeterVideo(
                    this.meterVideoConfig
                  );
                } else {
                  this.setVideoData();
                }
              }
            } else {
              if (this.isUploading) {
                this.uiService.errorMessage(
                  this.commonBindingService.getLabel(
                    'msg_video_details_fetch_error'
                  )
                );
              }
              this.isUploaded = false;
              this.isUploading = false;
              this.appLoader = false;
              this.form = this.service.getBusinessForm();
            }
          },
          (error) => {
            this.uiService.errorMessage(
              this.commonBindingService.getLabel(
                'msg_video_details_fetch_error'
              )
            );
          }
        );
    }
  }

  setVideoData() {
    this.form.controls.videoFileId.setValue(this.videoMetaData.assetId);
    this.form.controls.videoThumbnailUrl.setValue(
      this.videoMetaData.thumnailUrl
    );
    this.form.controls.videoFileUrl.setValue(this.videoMetaData.videoUrl);
    this.service.updateDraftBusiness({
      videoThumbnailUrl: this.videoMetaData.thumnailUrl,
      videoFileUrl: this.videoMetaData.videoUrl,
      isMirrorVideo: this.form.value.isMirrorVideo
    });
    this.form.markAsDirty();
    this.service.$validateSection.next(Step.Video);
    this.isUploading = false;
    this.isUploaded = true;
  }

  showDialogMaximized(dialog) {
    if (this.mobileMode) {
      dialog.maximize();
    }
  }

  pollMuxAPI(milli) {
    setTimeout(() => {
      this.fetchMuxVideoData();
    }, milli);
  }

  onBeforeUpload(event: { xhr: XMLHttpRequest; formData: FormData }) {
    this.isUploading = true;
    this.showUploadRequirements = false;
    this.uploadedFile = null;
  }

  uploading(file: File, mirror: boolean) {
    this.isUploading = true;

    this.businessService.createVideoAsset(window.origin).subscribe(
      (response) => {
        this.fileUploadUrl = response.data.url;
        this.uploadedFile = {
          fileId: response.data.id
        };
        this.restApiService
          .putFile('upload-mux-file', this.fileUploadUrl, file, null)
          .subscribe((x) => {
            this.onProgress(x);
            this.form.controls['isMirrorVideo'].setValue(mirror);
          });
      },
      (err) => {
        this.isUploading = false;
      }
    );
  }

  onUpload(event) {
    if (this.isUpoladRestricted) {
      return;
    }

    this.progress = 100;
    this.fileUploader?.clear();
    this.pollMuxAPI(4000);
  }

  showGetHelp() {
    this.showGetAProTip = true;
  }

  showVideoRequirements() {
    this.showRequirements = true;
  }

  onProgress(event) {
    if (this.isUpoladRestricted) {
      return;
    }
    if (event?.total) {
      this.progress = Math.round((event.loaded / event.total) * 100);
    }

    if (this.progress === 100) {
      setTimeout(() => {
        this.isLoadingFinished = true;
        this.onUpload(null);
      }, 1000);
    }
  }

  onError(event) {
    if (event[0]?.Message) {
      this.uiService.errorMessage(event[0].Message);
    }
    if (event?.error?.status) {
      this.uiService.errorMessage(
        this.commonBindingService.getLabel(
          'lbl_error_in_upload_try_again'
        )
      );
      this.progress = 0;
      this.isUploading = false;
    }
  }

  loadVideo() {
    this.showVideoPlayer = true;
    this.videoFileUrl = this.form.value.videoFileUrl;
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

  showCalendar(calendarLink) {
    if (calendarLink.includes('calendly')) {
      Calendly.showPopupWidget(calendarLink, null, {
        parentElement: document.getElementsByClassName(
          'banner-search-wrap container'
        )[0]
      });
      return false;
    } else {
      window.open(calendarLink, '_blank');
    }
  }

  detachMedia() {
    this.showVideoPlayer = false;
  }

  uploadVideoFile() {
    if (!this.service.guidelinesAccepted && !this.isUploaded) {
      this.displayModal = true;
      this.forRecord = false;
      return;
    }
    this.fileUploader.basicFileInput?.nativeElement.click();
  }

  showVideorecorder(): void {
    if (!this.service.guidelinesAccepted && !this.isUploaded) {
      this.displayModal = true;
      this.forRecord = true;
      return;
    }
    const isInLandscape = window.matchMedia(
      '(orientation: landscape)'
    ).matches;
    this.mobileMode = window.matchMedia('(max-width: 767px)').matches;
    if (
      (this.isMobileVideoCapture && window.screen.width < 760) ||
      (this.isMobileVideoCapture &&
        window.screen.width < 900 &&
        isInLandscape)
    ) {
      this.videoInputUploaderEl.click();
      return;
    }
    this.isRecording = true;
  }

  public hideVideoRecorder(event: boolean): void {
    this.isRecording = false;
  }

  public saveRecorderVideo(event): void {
    this.isRecording = false;
    this.uploading(event, true);
  }

  public uploadInputNativeVideo(event) {
    this.isUploading = true;
    this.uploading(event.target.files[0], true);
  }

  downloadVideo(videoId: string): void {
    this.$pitchVideoSubscription.add(
      this.businessService
        .downloadVideo(videoId)
        .pipe(
          tap((_) => (this.appLoader = true)),
          filter((v) => !!v),
          delay(3000),
          switchMap((_) => this.businessService.getVideoUrl(videoId)),
          mergeMap((value) =>
            value.data === '' ? throwError('') : of(value)
          ),
          retryWhen((errors) =>
            errors.pipe(
              delay(3000),
              tap((_) => console.log('retry')),
              take(5)
            )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe((data) => {
          this.appLoader = false;
          let name = 'video';
          const myProfile: UserSession = this.storageService.getItem(
            AppSettings.USER_DETAILS,
            true
          );
          this.userCommonService
            .getUserProfile(myProfile.userId)
            .subscribe(
              (result) => {
                this.fullName =
                  result.data.firstName +
                  result.data.lastName;
                name =
                  this.fullName +
                  '-' +
                  this.businessService.getBusinessTypeValue(
                    this.service.businessType
                  );
                this.download(data.data, name);
              },
              (error) => {
                this.uiService.errorMessage(error.Message);
              }
            );
        })
    );
  }

  async download(url, name) {
    await this.businessService.downloadImage(url, name);
  }
}
