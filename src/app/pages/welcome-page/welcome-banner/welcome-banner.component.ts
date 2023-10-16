import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BannerConfig, BannerTypes, VideoInfo, WelcomePageService, WelcomeVideos } from '../welcome-page.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PitchCardType } from '../../../modules/shared/enums/pitch-card-type.enum';
import { SearchResultThumbnailComponent } from '../../../modules/pitch-card-shared/components/search-result-thumbnail/search-result-thumbnail.component';
import { environment } from '../../../../environments/environment';
import { UserCommonService } from '../../../modules/shared/services/user-common.service';
import { BusinessPitch } from '../../../modules/business/models/business-pitch.model';
import { BusinessDetails } from '../../../modules/business/models/business-detail.model';
import { PitchCardModalsWrapperService } from '../../../modules/pitch-card-shared/services/pitchcard-modals-wrapper.service';



@Component({
  selector: 'app-welcome-banner',
  templateUrl: './welcome-banner.component.html',
  styleUrls: ['./welcome-banner.component.scss', '../welcome-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeBannerComponent implements OnInit {
  bannerConfig: BannerConfig;
  BannersTypesEnum = BannerTypes;
  partnersListUrls: any[];
  isDesktop: boolean = this.deviceService.isDesktop();
  isTablet: boolean = this.deviceService.isTablet();
  isMobile: boolean = this.deviceService.isMobile();
  isPortraitMode: boolean = window.innerHeight > window.innerWidth;
  isBigPC: boolean = window.innerWidth > 1366;
  innerWidth: number = window.innerWidth;
  isPlayVideo: boolean = false;
  mutedVideo: boolean = true;
  isChangedMuteMode: boolean;

  playerVideos: any[] = [];
  selectedVideoUrl: string = '';
  posterImageUrl: string = '';

  
  @Input() bannerType: number;
  @Output() navigateTo: EventEmitter<any> = new EventEmitter();
  @Output() openModal: EventEmitter<boolean | VideoInfo> = new EventEmitter();
  @Output() openCalendar: EventEmitter<any> = new EventEmitter();
  
  uniqueId: string;
  @ViewChild('businessCard', {static: false})
  businessCard: SearchResultThumbnailComponent;
  watchOurPitchBusiness: BusinessPitch & BusinessDetails;
  alias = environment.defaultBusinessShareLinkAlias;
  isVideoLoaded: boolean = false;




  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isPortraitMode = window.innerWidth < window.innerHeight;
    this.isBigPC = window.innerWidth > 1366;
    this.innerWidth = window.innerWidth;
  }

  constructor(
    private router: Router,
    private welcomePageService: WelcomePageService,
    private deviceService: DeviceDetectorService,
    private userCommonService: UserCommonService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
  ) {
  }

  ngOnInit(): void {
    this.setBannerConfig();
    this.partnersListUrls = this.welcomePageService.getPartnersImageList(this.isMobile);
    this.playerVideos = this.welcomePageService.getVideoUrlsConfig();
    this.selectedVideoUrl = this.playerVideos[WelcomeVideos.BusinessIntro].url;
    this.posterImageUrl = this.playerVideos[WelcomeVideos.BusinessIntro].posterImgUrl;
    this.cardInitSetup();
  }
  
  setBannerConfig() {
    this.bannerConfig = this.welcomePageService.getBannerConfig(this.bannerType);
    console.log('a', this.BannersTypesEnum.MainBanner);
  }

  createBusiness(url, withAuth?: boolean) {
    if (this.bannerConfig.type === BannerTypes.ResumeBanner) {
      this.navigateTo.emit({
        url: url,
        withAuth: withAuth,
        type: PitchCardType.Resume
      });
    } else {
      this.navigateTo.emit({url: url, withAuth: withAuth});
    }
  }

  setOutputAction(data, withAuth?: boolean) {
    if (data?.url) {
      this.openModal.emit(data);
    } else if (typeof data === 'string') {
      this.navigateTo.emit({url: data, withAuth: withAuth});
    } else {
      this.openModal.emit();
    }
  }

  onTimeUpdate(event) {
    if (event.target.duration) {
      this.isPlayVideo = true;
    } else{
      this.isPlayVideo = false;
    }
  }

  showCalendar() {
    this.openCalendar.emit();
  }

  setupCard() {
    this.isVideoLoaded = true;
    this.businessCard.initVideo = true;
    this.businessCard.loadVideo();
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

  handleWatchDemo(config) {
    this.selectedVideoUrl = config.url;
    this.posterImageUrl = config.posterImgUrl;
  }
}
