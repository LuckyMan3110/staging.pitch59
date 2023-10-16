import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { AppSettings } from '../../../shared/app.settings';
import { DeviceDetectorService } from 'ngx-device-detector';
import {
  PitchCardService,
  VideoErrorsConfig
} from '../../services/pitch-card.service';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';

@Component({
  selector: 'app-upload-video-steps',
  templateUrl: './upload-video-steps.component.html'
})
export class UploadVideoComponent implements OnInit, OnDestroy {
  @Output() next: EventEmitter<any> = new EventEmitter();

  @Input() businessType: string = 'basic';

  uploadedFiles = [];
  errorMessage = '';
  formats = AppSettings.AcceptableVideoFormats;
  isShowVideoFormat = false;
  isMobile: boolean = this.deviceService.isMobile();
  errorConfig: VideoErrorsConfig = this.PCService.videoReviewsErrorConfig();
  PitchCardTypes = PitchCardType;

  constructor(
    private deviceService: DeviceDetectorService,
    private PCService: PitchCardService
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.uploadedFiles = [];
    this.errorMessage = '';
  }

  postUpload(event) {
    this.uploadedFiles = event.uploadedFiles;
    this.errorMessage = '';

    if (this.uploadedFiles.length) {
      this.next.emit({
        uploadedFiles: this.uploadedFiles
      });
    }
  }

  errorInVideoUpload(event) {
    this.errorMessage = event;
  }

  showFormat() {
    this.isShowVideoFormat = !this.isShowVideoFormat;
  }
}
