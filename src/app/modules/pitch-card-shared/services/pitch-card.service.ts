import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CommonBindingDataService } from '../../shared/services/common-binding-data.service';

export interface ResponsiveOption {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
}

export interface VideoErrorsConfig {
  invalidFileSizeMessageSummary: string;
  invalidFileSizeMessageDetail: string;
  invalidFileTypeMessageSummary: string;
  invalidFileTypeMessageDetail: string;
  invalidFileLimitMessageDetail: string;
  invalidFileLimitMessageSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class PitchCardService {
  constructor(
    private restApiService: RestApiService,
    private deviceService: DeviceDetectorService,
    private commonBindingService: CommonBindingDataService
  ) {
  }

  getReviewsCarouselResponsiveOptions(): ResponsiveOption[] {
    return [
      {
        breakpoint: '1920px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '1069px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '820px',
        numVisible: this.deviceService.isMobile() ? 1 : 2,
        numScroll: 2
      },
      {
        breakpoint: '620px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }

  videoReviewsErrorConfig(): VideoErrorsConfig {
    return {
      invalidFileSizeMessageSummary: this.commonBindingService.getLabel(
        'lbl_video_size_exceeds_300_mb'
      ),
      invalidFileSizeMessageDetail: '',
      invalidFileTypeMessageSummary: this.commonBindingService.getLabel(
        'lbl_please_select_valid_video_format'
      ),
      invalidFileTypeMessageDetail: '',
      invalidFileLimitMessageDetail:
        this.commonBindingService.getLabel('lbl_file_limit_err'),
      invalidFileLimitMessageSummary: ''
    };
  }

  getCarouselVisibleNumbers() {
    if (window.innerWidth >= 1069) {
      return 3;
    } else if (window.innerWidth >= 820 && window.innerWidth < 1069) {
      return this.deviceService.isMobile() ? 1 : 2;
    } else if (window.innerWidth < 820) {
      return 1;
    }
  }
}
