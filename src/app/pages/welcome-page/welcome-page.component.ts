import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
// tslint:disable-next-line: max-line-length
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { CustomerAnalyticsService } from '../../modules/choosen-history/services/customer-analytics.service';
import { WelcomePageReview } from '../../modules/shared/models/welcome-page-review.model';
import { Router } from '@angular/router';
import { StorageService } from '../../modules/shared/services/storage.service';
import { Subscription } from 'rxjs';
import { UniqueComponentId } from 'primeng/utils';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BannerConfig, BannerTypes, WelcomePageService, WelcomeVideos, WhyCardConfig, WhatCardConfig, HowCardConfig } from './welcome-page.service';
import { UiService } from '../../modules/shared/services/ui.service';
import { PixelService } from 'ngx-pixel';
import { BusinessPitch } from '../../modules/business/models/business-pitch.model';
import { environment } from '../../../environments/environment';
import { SearchResultThumbnailComponent } from '../../modules/pitch-card-shared/components/search-result-thumbnail/search-result-thumbnail.component';
import { AppSettings } from '../../modules/shared/app.settings';
import { BusinessDetails } from '../../modules/business/models/business-detail.model';
import { PitchCardModalsWrapperService } from '../../modules/pitch-card-shared/services/pitchcard-modals-wrapper.service';

declare const Hls: any;
declare const Calendly: any;

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomePageComponent implements OnInit, OnDestroy {
  tablet: boolean;
  laptop: boolean;
  desktop: boolean;
  showVideoPlayer = false;
  showOurPitchModal = false;
  isAuthUser: boolean = this.userCommonService.isAuthenticated();

  whyCard: WhyCardConfig;
  whatCard: WhatCardConfig;
  howCard: HowCardConfig;
  playerVideos: any[] = [];
  bannerConfig: BannerConfig;
  BannerTypesEnum = BannerTypes;
  posterImageUrl: string = '';
  hls;
  mainVideoHls;

  isBrowser;
  isPlatformServer;
  isPlayMainVideo: boolean = false;
  reviews: WelcomePageReview[];

  selectedVideoUrl: string = '';

  uniqueId: string;
  $createOrEditSubject: Subscription;
  phoneHeight: number = (window.innerHeight / 100) * 45;

  @ViewChild('mainVideo', {static: true}) mainVideo: ElementRef;
  @ViewChild('mainVideoMob', {static: true}) mainVideoMob: ElementRef;
  @ViewChild('businessCard', {static: false})
  businessCard: SearchResultThumbnailComponent;

  createOrEdit: string;

  index = 0;

  isVideoMirrored: boolean = false;
  isVideoLoaded: boolean = false;
  isDesktop = this.deviceService.isDesktop();
  isTablet = this.deviceService.isTablet();
  isMobile = this.deviceService.isMobile();
  isPortraitMode: boolean = window.innerHeight > window.innerWidth;


  watchOurPitchBusiness: BusinessPitch & BusinessDetails;
  alias = environment.defaultBusinessShareLinkAlias;

  @HostListener('window:resize', ['$event'])
  onResize(e) {
    this.phoneHeight = (e.target.innerHeight / 100) * 45;
    this.setWidth();
  }

  constructor(
    private userCommonService: UserCommonService,
    private router: Router,
    private storageService: StorageService,
    private customerAnalyticsService: CustomerAnalyticsService,
    private deviceService: DeviceDetectorService,
    private cdr: ChangeDetectorRef,
    private welcomePageService: WelcomePageService,
    private pixel: PixelService,
    private uiService: UiService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.pixel.track('PageView', {
      content_name: 'Welcome/Landing'
    });
    this.isBrowser = isPlatformBrowser(platformId);
    this.isPlatformServer = isPlatformServer(platformId);
    this.setWidth();
  }

  ngOnInit() {
    this.setConfig();
    this.uniqueId = UniqueComponentId();
    if (this.isBrowser) {
      this.$createOrEditSubject =
        this.userCommonService.createOrEditSubject.subscribe(
          (value) => {
            this.createOrEdit = value;
          }
        );
      this.userCommonService.createOrEdit();
    }

    this.loadMainVideo(this.isMobile ? this.mainVideoMob : this.mainVideo);
    this.cardInitSetup();
  }

  setConfig() {
    this.whyCard = this.welcomePageService.getWhyCardConfig();
    this.whatCard = this.welcomePageService.getWhatCardConfig();
    this.howCard = this.welcomePageService.getHowCardConfig();
    this.playerVideos = this.welcomePageService.getVideoUrlsConfig();
    this.bannerConfig = this.welcomePageService.getBannerConfig(this.BannerTypesEnum.MainBanner);
  }

  ngOnDestroy() {
    if (this.$createOrEditSubject) {
      this.$createOrEditSubject.unsubscribe();
    }
  }

  loadMainVideo(videoEl) {
    const videoConfig = { videoUrl: this.playerVideos[WelcomeVideos.DemoVideo].url, mute: true, posterUrl: this.playerVideos[WelcomeVideos.DemoVideo].posterImgUrl };
    this.cdr.detectChanges();
    const videoFileUrl = videoConfig.videoUrl;

    if (videoEl) {
      videoEl.nativeElement.muted = videoConfig.mute;
      videoEl.nativeElement.poster = videoConfig.posterUrl;

      if (this.isBrowser && videoFileUrl) {
        if (Hls.isSupported()) {
          if (this.mainVideoHls) {
            this.mainVideoHls.destroy();
          }

          this.mainVideoHls = new Hls();
          this.mainVideoHls.loadSource(videoFileUrl);
          this.mainVideoHls.attachMedia(videoEl.nativeElement);
          videoEl.nativeElement
            .play()
            .then((this.isPlayMainVideo = true));
        } else if (
          videoEl.nativeElement.canPlayType(
            'application/vnd.apple.mpegurl'
          )
        ) {
          videoEl.nativeElement.src = videoFileUrl;
          videoEl.nativeElement
            .play()
            .then((this.isPlayMainVideo = true));
        }
      }
    }
  }

  setupCard() {
    this.businessCard.mutedVideo = false;
    this.businessCard.initVideo = true;
    setTimeout(() => {
      this.isVideoLoaded = true;
      this.businessCard.loadVideo({muted: false});
      if (this.isMobile) {
        this.businessCard.videoPlayer.target.nativeElement.parentElement.click();
      }
    }, 500);
  }

  cardInitSetup() {
    this.userCommonService
      .getBusinessPitchModelByAlias(this.alias)
      .subscribe((companyCardData) => {
        this.watchOurPitchBusiness = companyCardData.data;
      });
  }

  handlePitchCardTitleClick(clickEvent: any) {
    const {title} = clickEvent;
    const config = {
      id: WelcomeVideos.WatchOurPitch,
      url: this.watchOurPitchBusiness.videoFileUrl,
      posterImgUrl: this.watchOurPitchBusiness.videoCoverImageThumbnailUrl
    };
    if (title === 'playVideo') {
      this.handleWatchDemo(config);
    } else {
      if (
        this.isVideoLoaded &&
        this.deviceService.isMobile() &&
        this.deviceService.browser === 'Safari'
      ) {
        this.businessCard.videoPlayer.target.nativeElement.muted = true;
      }
      this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
      this.pitchCardModalsWrapperService.setCurrentBusiness(
        this.watchOurPitchBusiness as BusinessDetails
      );
      this.pitchCardModalsWrapperService.onTitleClick(title);
    }
  }

  // loadSmartVideo() {
  //   this.videoItems.map((i) => {
  //     if (i.active) {
  //       this.selectedVideoUrl = i.videoUrl
  //         ? i.videoUrl
  //         : this.playerVideos[WelcomeVideos.MainVideo].url;
  //
  //       const videoConfig = { videoUrl: this.selectedVideoUrl, mute: true };
  //       this.loadVideos(this.smartVideo, videoConfig);
  //     }
  //   });
  // }

  // loadNextVideo() {
  //   let activeVideoIndex;
  //   this.videoItems.map((i, index) => {
  //     if (i.active) {
  //       i.active = false;
  //       activeVideoIndex = index;
  //     }
  //   });
  //
  //   if (this.isMobile) {
  //     this.slideToNextSlide(activeVideoIndex);
  //   }
  //
  //   if (activeVideoIndex === this.videoItems.length - 1) {
  //     this.videoItems[0].active = true;
  //
  //     const videoConfig = { videoUrl: this.videoItems[0].videoUrl, mute: true };
  //     this.loadVideos(this.smartVideo, videoConfig);
  //   }
  //
  //   if (activeVideoIndex < this.videoItems.length - 1) {
  //     this.videoItems[activeVideoIndex + 1].active = true;
  //
  //     const videoConfig = { videoUrl: this.videoItems[activeVideoIndex + 1].videoUrl, mute: true };
  //     this.loadVideos(this.smartVideo, videoConfig);
  //   }
  // }

  // loadVideos(player, videoConfig) {
  //   this.cdr.detectChanges();
  //   const videoFileUrl = videoConfig.videoUrl;
  //   if (player) {
  //     player.nativeElement.muted = videoConfig.mute;
  //
  //     if (this.isBrowser && videoFileUrl) {
  //       if (Hls.isSupported()) {
  //         if (this.hls) {
  //           this.hls.destroy();
  //         }
  //
  //         this.hls = new Hls();
  //         this.hls.loadSource(videoFileUrl);
  //         this.hls.attachMedia(player.nativeElement);
  //         player.nativeElement.play();
  //         this.isPlayVideo = true;
  //       } else if (player.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
  //         player.nativeElement.src = videoFileUrl;
  //         player.nativeElement.play();
  //         this.isPlayVideo = true;
  //       }
  //     }
  //   }
  // }
  //
  // slideToNextSlide(activeIndex) {
  //   const swiperBullets: HTMLCollection = document.getElementsByClassName(
  //     'swiper-pagination-handle'
  //   );
  //   for (let i = 0; i < swiperBullets.length; i++) {
  //     if (swiperBullets[i].hasAttribute('index')) {
  //       const index = swiperBullets[i].getAttribute('index');
  //       const nextBullet = swiperBullets[i + 1] as HTMLElement;
  //       if (index == activeIndex && nextBullet) {
  //         nextBullet.click();
  //       }
  //     }
  //   }
  // }

  // initScrollingEvents() {
  //   if (this.topBlock?.nativeElement) {
  //     this.topBlock.nativeElement.addEventListener(
  //       'wheel',
  //       (e) => {
  //         e.preventDefault();
  //
  //         if (this.isScrollPending) {
  //           return;
  //         }
  //
  //         if (window.scrollY <= this.topBlock.nativeElement.clientHeight / 2) {
  //           this.scrollWrapper.nativeElement.scrollLeft = 0;
  //         }
  //
  //         if (e.deltaY > 0) {
  //           this.doVerticalScrolling(this.topBlock.nativeElement.clientHeight, 1000);
  //         }
  //       },
  //       { passive: false }
  //     );
  //   }
  //
  //   if (this.scrollWrapper?.nativeElement) {
  //     this.scrollWrapper.nativeElement.addEventListener(
  //       'wheel',
  //       (e) => {
  //         e.preventDefault();
  //         this.setHorizontalScroll(e);
  //       },
  //       { passive: false }
  //     );
  //     this.scrollWrapper.nativeElement.addEventListener(
  //       'DOMMouseScroll',
  //       (e) => {
  //         e.preventDefault();
  //         this.setHorizontalScroll(e);
  //       },
  //       { passive: false }
  //     );
  //     this.scrollWrapper.nativeElement.addEventListener(
  //       'onmousewheel',
  //       (e) => {
  //         e.preventDefault();
  //         this.setHorizontalScroll(e);
  //       },
  //       { passive: false }
  //     );
  //   }
  //
  //   if (this.smartbanner?.nativeElement) {
  //     this.smartbanner.nativeElement.addEventListener(
  //       'wheel',
  //       (e) => {
  //         e.preventDefault();
  //         if (this.isScrollPending) {
  //           return;
  //         }
  //
  //         if (e.deltaY < 0) {
  //           const maxScrollWidth = window.innerWidth * (this.screenList.length - 1);
  //           this.doVerticalScrolling(this.topBlock.nativeElement.clientHeight, 500, maxScrollWidth);
  //         } else {
  //           this.doVerticalScrolling(e.pageY, 600);
  //         }
  //       },
  //       { passive: false }
  //     );
  //   }
  // }
  //
  // setHorizontalScroll(e) {
  //   if (this.isScrollPending) {
  //     return;
  //   }
  //
  //   if (this.storageService.getItem(AppSettings.ACTIVE_SLIDE) !== null) {
  //     this.activeSlide = this.storageService.getItem(AppSettings.ACTIVE_SLIDE, true);
  //   }
  //
  //   if (e.deltaY > 0) {
  //     const nextSlide = this.activeSlide + 1;
  //     if (nextSlide < this.screenList.length && nextSlide >= 0) {
  //       this.doHorizontalScrolling(
  //         window.innerWidth * nextSlide,
  //         this.topBlock.nativeElement.clientHeight,
  //         1000
  //       );
  //       this.storageService.setItem(AppSettings.ACTIVE_SLIDE, nextSlide);
  //     }
  //     if (nextSlide >= this.screenList.length) {
  //       this.doVerticalScrolling(
  //         this.scrollWrapper.nativeElement.clientHeight + this.topBlock.nativeElement.clientHeight,
  //         1000
  //       );
  //       this.storageService.setItem(AppSettings.ACTIVE_SLIDE, this.screenList.length);
  //     }
  //   }
  //
  //   if (e.deltaY < 0) {
  //     const prevSlide = this.activeSlide - 1;
  //     if (prevSlide < this.screenList.length && prevSlide >= 0) {
  //       this.doHorizontalScrolling(
  //         window.innerWidth * prevSlide,
  //         this.topBlock.nativeElement.clientHeight,
  //         1000
  //       );
  //       this.storageService.setItem(AppSettings.ACTIVE_SLIDE, prevSlide);
  //     }
  //     if (prevSlide < 0) {
  //       this.doVerticalScrolling(0, 1000);
  //       this.storageService.removeItem(AppSettings.ACTIVE_SLIDE);
  //     }
  //   }
  // }
  //
  // doVerticalScrolling(positionY, duration, x?) {
  //   this.isScrollPending = true;
  //   this.welcomePageService.smoothVerticalScrolling(positionY, duration, x);
  //   setTimeout(() => {
  //     this.isScrollPending = false;
  //   }, duration);
  // }
  //
  // doHorizontalScrolling(positionX, positionY, duration) {
  //   this.isScrollPending = true;
  //   this.welcomePageService.smoothHorizontalScrolling(positionX, positionY, duration);
  //   setTimeout(() => {
  //     this.isScrollPending = false;
  //   }, duration);
  // }
  //
  // scrollToSection(scrollConfig) {
  //   if (
  //     scrollConfig.scrollIndex >= 0 &&
  //     scrollConfig.scrollIndex <= this.paginationBullets.length
  //   ) {
  //     this.doHorizontalScrolling(
  //       window.innerWidth * scrollConfig.scrollIndex,
  //       this.topBlock.nativeElement.clientHeight,
  //       1000
  //     );
  //   }
  // }

  setWidth() {
    const width = window.screen.width;
    const height = window.screen.height;
    this.desktop = width >= 992;
    this.tablet = width >= 768 && width < 992 && height > 700;
    this.laptop = width >= 1100 && width <= 1440;
    this.isPortraitMode = window.innerWidth < window.innerHeight;
  }

  // createBusiness() {
  //   this.storageService.setItemInCookies(AppSettings.DRAFT_BUSINESS_ID, null);
  //   this.router.navigate(['cards-packages']);
  // }
  //
  handleWatchMainVideo() {
    this.selectedVideoUrl = this.playerVideos[WelcomeVideos.DemoVideo].url;
    this.posterImageUrl = this.playerVideos[WelcomeVideos.DemoVideo].posterImgUrl;
    this.showVideoPlayer = true;
    this.setPlayPauseMainVideo();
  }

  setPlayPauseMainVideo() {
    if (this.mainVideo.nativeElement && !this.showVideoPlayer) {
      this.mainVideo.nativeElement.play();
    }
    if (this.mainVideo.nativeElement && this.showVideoPlayer) {
      this.mainVideo.nativeElement.pause();
    }
  }

  handleWatchDemo(config) {
    this.selectedVideoUrl = config.url;
    this.posterImageUrl = config.posterImgUrl;
    this.showVideoPlayer = true;
  }

  // calculateWatchDemoConfig(bsType) {
  //   if (bsType === PitchCardType.Resume) {
  //     return this.playerVideos[WelcomeVideos.HowItWorksResume];
  //   }
  //   if (bsType === PitchCardType.Job) {
  //     return this.playerVideos[WelcomeVideos.HowItWorksJobs];
  //   }
  // }

  detachMedia() {
    if (this.isBrowser && this.hls && Hls.isSupported()) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
    }
    // this.loadNextVideo();
    this.setPlayPauseMainVideo();
  }

  // changeVideo(index, mute) {
  //   if (index !== null && this.videoItems?.length) {
  //     this.videoItems.map((i) => {
  //       i.active = false;
  //     });
  //     index = index < 0 ? 4 : index;
  //     index = index >= this.videoItems.length ? 0 : index;
  //     this.videoItems[index].active = true;
  //
  //     const videoConfig = { videoUrl: this.videoItems[index].videoUrl, mute: mute };
  //     this.loadVideos(this.smartVideo, videoConfig);
  //   }
  // }

  // handlePauseVideo(player, onPause) {
  //   this.isPlayVideo = onPause;
  //   if (player) {
  //     !this.isPlayVideo ? player.pause() : player.play();
  //   }
  // }

  navigateToPage(config) {
    if (config.withAuth) {
      if (!this.isAuthUser) {
        this.goToPage('/sign-up', {serviceurl: config.url});
      } else {
        this.goToPage(config.url);
      }
    } else {
      this.goToPage(config.url);
    }
  }

  goToPage(path, params?) {
    if (!params) {
      this.router.navigateByUrl(path);
    } else {
      this.router.navigate([path], {
        queryParams: params
      });
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


  // openLinkInNewTab(e, link) {
  //   e.preventDefault();
  //   window.open(link, '_blank');
  // }
  //
  // openPlayer(videoUrl) {
  //   this.selectedVideoUrl = videoUrl;
  //   this.showVideoPlayer = true;
  // }

  // onTimeUpdate(event) {
  //   if (event.target.duration) {
  //     if (event.currentTarget && event.currentTarget.currentTime >= event.currentTarget.duration) {
  //       this.loadNextVideo();
  //     }
  //   }
  // }

  // onTimeUpdateMainVideo(event) {
  //   if (event.target.duration) {
  //     if (event.currentTarget && event.currentTarget.currentTime >= event.currentTarget.duration) {
  //       this.mainVideoHls.destroy();
  //       setTimeout(() => {
  //         this.loadMainVideo(this.isMobile ? this.mainVideoMob : this.mainVideo);
  //       }, 3000);
  //     }
  //   }
  // }
}
