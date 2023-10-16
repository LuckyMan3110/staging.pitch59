import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  BannerTypes,
  IntroPageConfig,
  VideoInfo,
  WelcomePageService
} from '../welcome-page/welcome-page.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { isPlatformBrowser } from '@angular/common';
import { PitchCardType } from '../../modules/shared/enums/pitch-card-type.enum';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { UiService } from '../../modules/shared/services/ui.service';
import { AppSettings } from '../../modules/shared/app.settings';
import { BillingFrequency } from '../../modules/new-billing/services/new-billing.service';
import { ProductType } from '../../modules/shared/components/pricing-menu-components/pricing-menu.service';
import { StorageService } from '../../modules/shared/services/storage.service';
import { ConfirmationService } from 'primeng/api';

declare const Hls: any;

@Component({
  selector: 'app-intro-page',
  templateUrl: './intro-page.component.html',
  styleUrls: [
    './intro-page.component.scss',
    '../welcome-page/welcome-page.component.scss',
    '../welcome-page/welcome-banner/welcome-banner.component.scss'
  ]
})
export class IntroPageComponent implements OnInit, AfterViewInit {
  pageType: number;
  pageConfig: IntroPageConfig;
  BannersTypesEnum = BannerTypes;
  PitchCardsEnum = PitchCardType;
  isDesktop: boolean = this.deviceService.isDesktop();
  isTablet: boolean = this.deviceService.isTablet();
  isMobile: boolean = this.deviceService.isMobile();
  isPortraitMode: boolean = window.innerHeight > window.innerWidth;
  showInformationModal: boolean = false;
  showRequestDemoModal: boolean = false;
  showDoneDialog: boolean = false;
  isAuthUser: boolean = this.userCommonService.isAuthenticated();
  isResumeCreated: boolean;

  hls;
  isBrowser;
  isPlayVideo: boolean = false;
  showVideoPlayer: boolean = false;
  isVideoMirrored: boolean = false;
  posterImageUrl: string = '';
  selectedVideoUrl: string = '';

  @ViewChild('mainVideo', {static: false}) mainVideo: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isPortraitMode = window.innerWidth < window.innerHeight;
  }

  constructor(
    private router: Router,
    private deviceService: DeviceDetectorService,
    private welcomeService: WelcomePageService,
    private cdr: ChangeDetectorRef,
    private cardPackageService: CardPackageService,
    private userCommonService: UserCommonService,
    private uiService: UiService,
    private storageService: StorageService,
    private confirmService: ConfirmationService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.setPage();
  }

  ngAfterViewInit() {
    this.loadVideo(this.mainVideo, this.pageConfig.videoInfo);
  }

  setPage() {
    this.pageType =
      this.router.url === '/jobs'
        ? BannerTypes.ResumeBanner
        : BannerTypes.BusinessBanner;
    this.pageConfig = this.welcomeService.getIntroPageConfig(this.pageType);
    this.isResumeCreated = this.storageService.getItem(
      AppSettings.IS_RESUME_EXIST
    )
      ? this.storageService.getItem(AppSettings.IS_RESUME_EXIST, true)
      : false;
  }

  loadVideo(videoEl, videoInfo: VideoInfo) {
    const videoConfig = {videoUrl: videoInfo.url, mute: true};
    this.cdr.detectChanges();
    const videoFileUrl = videoConfig.videoUrl;

    if (videoEl) {
      videoEl.nativeElement.muted = videoConfig.mute;

      if (this.isBrowser && videoFileUrl) {
        if (Hls.isSupported()) {
          if (this.hls) {
            this.hls.destroy();
          }

          this.hls = new Hls();
          this.hls.loadSource(videoFileUrl);
          this.hls.attachMedia(videoEl.nativeElement);
          videoEl.nativeElement
            .play()
            .then((this.isPlayVideo = true));
        } else if (
          videoEl.nativeElement.canPlayType(
            'application/vnd.apple.mpegurl'
          )
        ) {
          videoEl.nativeElement.src = videoFileUrl;
          videoEl.nativeElement
            .play()
            .then((this.isPlayVideo = true));
        }
      }
    }
  }

  onTimeUpdateVideo(event, videoInfo) {
    if (event.target.duration) {
      if (
        event.currentTarget &&
        event.currentTarget.currentTime >= event.currentTarget.duration
      ) {
        this.hls.destroy();
        setTimeout(() => {
          this.loadVideo(this.mainVideo, videoInfo);
        }, 3000);
      }
    }
  }

  handleWatchMainVideo(videoConfig) {
    this.selectedVideoUrl = videoConfig.url;
    this.posterImageUrl = videoConfig.posterImgUrl;
    this.showVideoPlayer = true;
    this.setPlayPauseVideo();
  }

  setPlayPauseVideo() {
    if (this.mainVideo.nativeElement && !this.showVideoPlayer) {
      this.mainVideo.nativeElement.play();
    }
    if (this.mainVideo.nativeElement && this.showVideoPlayer) {
      this.mainVideo.nativeElement.pause();
    }
  }

  detachMedia() {
    if (this.isBrowser && this.hls && Hls.isSupported()) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
    }
    this.setPlayPauseVideo();
  }

  computeAction(config: {
    url: string;
    withAuth: boolean;
    type?: PitchCardType;
  }) {
    if (config?.type === PitchCardType.Resume) {
      this.setInformationModal();
    } else {
      this.navigateToPage(config);
    }
  }

  setInformationModal() {
    this.confirmService.confirm({
      key: 'isResumeExist',
      header: this.isResumeCreated ? 'Resume Already Exists' : '',
      message: !this.isResumeCreated
        ? 'Resume Cards are only for helping you find employment or get recruited. Please confirm that you’re seeking new employment or exploring other job opportunities.'
        : '',
      acceptLabel: 'OK',
      acceptIcon: '-',
      rejectVisible: false,
      accept: () => {
        this.setResume();
      }
    });
  }

  navigateToPage(config: { url: string; withAuth: boolean }) {
    if (config.withAuth) {
      if (!this.isAuthUser) {
        this.cardPackageService.goToPage('/sign-up', {
          serviceurl: config.url
        });
      } else {
        this.cardPackageService.goToPage(config.url);
      }
    } else {
      this.cardPackageService.goToPage(config.url);
    }
  }

  setResume() {
    if (!this.isResumeCreated) {
      const selectedProduct = {
        businessType: PitchCardType.Resume,
        paymentFrequency: BillingFrequency.Monthly,
        type: ProductType.Single
      };
      this.cardPackageService.selectPackage(selectedProduct);
      this.storageService.setItem(AppSettings.PAYMENT_PLAN, {
        paymentFrequency: selectedProduct.paymentFrequency,
        type: selectedProduct.type
      });
      this.navigateToPage({url: 'create', withAuth: true});
    } else {
      return;
    }
  }

  openModal(config?) {
    if (config) {
      this.handleWatchMainVideo(config);
    } else {
      this.showRequestDemoModal = true;
    }
  }

  onContactModalSubmit({data}) {
    this.userCommonService.contactSales(data).subscribe(
      (result) => {
        this.showRequestDemoModal = false;
        this.showDoneDialog = true;
      },
      (err) => {
        this.uiService.errorMessage(err.message);
      }
    );
  }
}
