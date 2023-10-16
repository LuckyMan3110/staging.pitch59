import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AppSettings } from '../../../shared/app.settings';
import { StorageService } from '../../../shared/services/storage.service';
import { UiService } from '../../../shared/services/ui.service';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { AppConstantService } from '../../../shared/services/app-constant.service';
import { HttpHeaders } from '@angular/common/http';
import { RestApiService } from '../../../shared/services/rest-api.service';
import { VideoErrorsConfig } from '../../services/pitch-card.service';
import { BusinessService } from '../../../business/services/business.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';

declare const Hls: any;

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html'
})
export class VideoUploadComponent implements OnInit {
  uploadedFiles: any[] = [];
  progressValue = 0;
  @Input() videoUploadText = true;
  @Input() afterVideoUploadText;
  @Input() chooseIcon: string = 'pi-plus';
  @Input() maxDuration: number;
  @Input() fileLimit: number = 1;
  @Input() errorConfig: VideoErrorsConfig;
  videoFormat;
  fileUploadUrl = AppSettings.UPLOAD_FILE_URL + '?fileType=1';
  isUploading = false;
  isContinueUploading = false;
  isUploaded = false;
  isDurationChecked = false;
  hls;
  maxSizeVideo = AppSettings.VIDEO_UPLOAD_MAX_SIZE_IN_BYTE;
  headers: HttpHeaders;
  meterVideoConfig: { videoEl: any; videoUrl: any; mute: boolean } = {
    videoEl: null,
    videoUrl: '',
    mute: true
  };
  durationMeterHls;
  durationError: string;
  videoName: string = '';
  formatsWithNoMeta = ['.avi', '.wmv', '.flv', '.vob', '.mpg'];

  @Output() preUpload: EventEmitter<any> = new EventEmitter();
  @Output() postUpload: EventEmitter<any> = new EventEmitter();
  @Output() errorInVideoUpload: EventEmitter<any> = new EventEmitter();

  @ViewChild('durationMeter', {static: false}) durationMeter: ElementRef;

  constructor(
    private storageService: StorageService,
    private uiService: UiService,
    private appConstantService: AppConstantService,
    private restApiService: RestApiService,
    private commonBindingService: CommonBindingDataService,
    private cdr: ChangeDetectorRef,
    private businessService: BusinessService,
    private loaderService: LoaderService
  ) {
  }

  ngOnInit() {
    this.videoFormat = AppSettings.VIDEO_FORMAT;
    this.headers = this.restApiService.getHeadersFileUpload();
  }

  onSelect(event) {
    const fileExtension = event.files[0].name.substring(
      event.files[0].name.lastIndexOf('.')
    );
    const isValidExtension = this.appConstantService.video_extensions.find(
      (x) => x.toLowerCase() === fileExtension.toLowerCase()
    );
    this.isDurationChecked = false;
    this.durationError = '';
    this.errorInVideoUpload.emit(null);

    this.videoName = event.files[0].name;
    if (!isValidExtension) {
      this.isUploading = false;
      this.uiService.errorMessage(
        this.commonBindingService.getLabel(
          'lbl_please_select_valid_video_format'
        )
      );
      return;
    }

    if (event.files[0]) {
      const type = event.files[0].type;
      if (!type.includes('video/')) {
        this.isUploading = false;
        this.uiService.errorMessage(
          this.commonBindingService.getLabel(
            'lbl_please_select_valid_video_format'
          )
        );
        return;
      }
    }
    if (this.maxSizeVideo < event.files[0].size) {
      this.isUploading = false;
      return;
    }

    if (!this.maxDuration) {
      if (event.files[0].name) {
        this.preUpload.emit(event.files[0].name);
      }
    } else {
      this.durationMeter.nativeElement.src = URL.createObjectURL(
        event.files[0]
      );
      if (this.formatsWithNoMeta.find((f) => f === isValidExtension)) {
        this.meterVideoConfig = {
          videoEl: this.durationMeter,
          videoUrl: '',
          mute: true
        };
      }
    }
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

  onUpload(event) {
    const isDurationChecked = this.maxDuration
      ? this.isDurationChecked
      : true;
    this.uploadedFiles = event.originalEvent.body;
    if (isDurationChecked && !this.durationError) {
      this.postUploading();
    } else if (!this.durationError) {
      this.isContinueUploading = true;
      this.isUploading = true;
      this.loaderService.show('page-center');
      if (this.uploadedFiles[0]?.fileId) {
        this.pollMuxAPI(4000);
      } else {
        this.loaderService.hide();
        this.uiService.errorMessage(
          this.commonBindingService.getLabel(
            'msg_video_details_fetch_error'
          )
        );
      }
    } else {
      this.uploadedFiles = [];
      this.isUploaded = false;
      this.isUploading = false;
      this.isContinueUploading = false;
    }
  }

  pollMuxAPI(time) {
    setTimeout(() => {
      this.fetchMuxVideoData();
    }, time);
  }

  fetchMuxVideoData() {
    this.businessService
      .getVideoDetail(this.uploadedFiles[0].fileId)
      .subscribe(
        (result) => {
          if (result?.data && result?.data?.status !== 'errored') {
            if (result?.data?.status !== 'ready') {
              this.pollMuxAPI(4000);
            } else if (this.meterVideoConfig) {
              this.meterVideoConfig.videoUrl =
                result.data.videoUrl;
              this.playDurationMeterVideo(this.meterVideoConfig);
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
            this.isContinueUploading = false;
          }
          this.loaderService.hide();
        },
        (error) => {
          this.loaderService.hide();
          this.uiService.errorMessage(
            this.commonBindingService.getLabel(
              'msg_video_details_fetch_error'
            )
          );
        }
      );
  }

  onBeforeUpload(event: { xhr: XMLHttpRequest; formData: FormData }) {
    this.isUploading = true;
  }

  onProgress(event) {
    this.progressValue = event.progress;
  }

  onError(event) {
    this.errorInVideoUpload.emit(
      this.commonBindingService.getLabel('lbl_error_in_upload_try_again')
    );
    this.progressValue = 0;
    this.isUploading = false;
    this.isContinueUploading = false;
  }

  checkDuration(event) {
    if (!Number.isNaN(event.target.duration)) {
      this.isDurationChecked = true;
      if (Math.floor(event.target.duration) > this.maxDuration) {
        if (this.isContinueUploading) {
          this.isUploading = false;
          this.isUploaded = false;
        }
        this.isContinueUploading = false;
        this.durationError = this.commonBindingService.getLabel(
          'lbl_video_duration_exceeds_29_seconds'
        );
        this.errorInVideoUpload.emit(this.durationError);
        this.progressValue = 0;
        return;
      } else if (
        this.meterVideoConfig &&
        Math.floor(event.target.duration) < this.maxDuration
      ) {
        if (this.durationMeterHls) {
          this.durationMeterHls.destroy();
        }
        this.postUploading();
      }
    }
  }

  postUploading() {
    setTimeout(() => {
      if (!this.durationError) {
        this.isUploading = false;
        this.isUploaded = true;
        this.postUpload.emit({uploadedFiles: this.uploadedFiles});
      }
      this.durationMeter.nativeElement.src = '';
      this.meterVideoConfig.videoUrl = '';
      this.videoName = '';
    }, 500);
  }
}
