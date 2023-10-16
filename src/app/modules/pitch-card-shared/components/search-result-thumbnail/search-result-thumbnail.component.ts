import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AppSettings } from '../../../shared/app.settings';
import { Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CompensationTypes } from '../../../shared/enums/compensation-types.enum';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { Benefits } from '../../../shared/enums/benefits.enum';
import { WorkType } from '../../../business/enums/work-type.enum';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { BusinessPitch } from '../../../business/models/business-pitch.model';
import { BusinessService } from '../../../business/services/business.service';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { VCard, VCardEncoding, VCardFormatter } from 'ngx-vcard';
import { DomSanitizer } from '@angular/platform-browser';
import { VideoJsPlayerComponent } from '../video-js-player/video-js-player.component';
import { BasicPropertyParameters } from 'ngx-vcard/lib/types/parameter/BasicPropertyParameters.type';

declare const Hls: any;
declare const Calendly: any;

@Component({
  selector: 'app-search-result-thumbnail',
  templateUrl: './search-result-thumbnail.component.html',
  styleUrls: ['./search-result-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultThumbnailComponent
  implements OnInit, OnChanges, OnDestroy, AfterContentChecked {
  PitchCardType = PitchCardType;
  isBrowser;
  icons = [];
  ratings = [];
  isShowRestrict = false;
  @Input() index;
  @Input() uniqueId: string;

  @Input() businessDetails: BusinessPitch;
  @Input() contacted;
  @Input() demo = false;
  @Input() isContactMeButtonClicked = false;
  @Input() withShare = false;
  @Input() comingSoon = false;
  @Input() disabled = false;

  @HostBinding('style.--scale-factor')
  get scaleFactor() {
    return this.scale;
  }

  @HostBinding('style.--name-size')
  nameSize = 1;

  @HostBinding('style.--title-size')
  titleSize = 1;

  @HostBinding('style.--position-title-size')
  positionTitleSize = 1;

  @Input() scale = 1.0;
  @Input() autoScale = false;

  @Input() blur = false;

  @Output() companyImages: EventEmitter<{
    title: string;
    businessDetails: BusinessPitch;
  }> = new EventEmitter();

  @Output() isVideoLoaded: EventEmitter<ElementRef> = new EventEmitter();

  businessLogoDefaultSrc = 'assets/images/card-business-logo.svg';
  uploadedFiles = [];
  videoThumbSrc = 'assets/images/whatsunique.png';

  googleMapLink;
  formattedAddress;

  isCoverLandscape = true;
  playVideo = false;
  initVideo = false;
  mutedVideo: boolean = true;
  isChangedMuteMode: boolean;
  isVideoPlayed: boolean = false;
  isplayingVideo: boolean = false;

  averageCustomerRating = 0;
  averageQualityRating = 0;
  hls;
  AppSettings = AppSettings;

  workTypes = WorkType;
  compensationTypes = CompensationTypes;
  benefits = Benefits;
  jobCompensations: any[];
  jobBenefits: any[];
  jobConditionsPopup;
  isJobConditionsPopupOpen = false;
  locationAddress = '';
  compensationDescription = '';

  showPdf = false;
  nameOne: string;
  nameTwo: string;
  isContactMenuOpen = false;
  isMobileContactMenuOpen = false;
  currentContactMenu;
  isMobile = this.deviceService.isMobile();
  isDesktop = this.deviceService.isDesktop();
  isFireFox = this.deviceService.browser === 'Firefox';
  isJobCard: boolean;
  workTypeList = '';

  scheduled;
  $analyticsSub = new Subscription();
  countdownTimer: number = null;
  videoDuration: number = null;
  timer;

  vCard: VCard;
  vCardEncoding: typeof VCardEncoding = VCardEncoding;
  vCardUrl: any = this.domSanitizer.bypassSecurityTrustUrl(
    'data:text/vcard;base64,QkVHSU46VkNBUkQNClZFUlNJT046My4wDQpOOkNoYW5nO01hcmsNCkZOOk1hcmsgQ2hhbmcNClRFTDt0eXBlPUNFTEw6KzEgKDIwNikgNzc4ODA3OA0KT1JHOkdvb2dsZQ0KRU5EOlZDQVJEDQo='
  );

  @ViewChild('videoPlayer') videoPlayer: VideoJsPlayerComponent;
  @ViewChild('coverImage') coverImage: ElementRef;
  @ViewChild('cardBusinessName') cardBusinessName: ElementRef;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private businessService: BusinessService,
    private service: CreatePitchCardService,
    private deviceService: DeviceDetectorService,
    private elRef: ElementRef,
    private commonBindingService: CommonBindingDataService,
    private domSanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.businessDetails) {
      this.checkIsBusinessDetailsAvailable();
      this.setRatings();
      this.nameSize =
        this.businessDetails?.businessType === 'service' ||
        this.businessDetails?.businessType === 'employee'
          ? this.calcTitleSize()
          : this.calcNameSize();
      this.titleSize =
        this.businessDetails?.businessType === 'service' ||
        this.businessDetails?.businessType === 'employee'
          ? this.calcNameSize()
          : this.calcTitleSize();
      this.positionTitleSize =
        this.businessDetails?.businessType === 'job'
          ? this.calcPositionTitleSize()
          : 1;
      if (!this.businessDetails?.businessType) {
        this.businessDetails.businessType = PitchCardType.Basic;
      }
      if (this.businessDetails?.businessName?.includes(' | ')) {
        const namesArray =
          this.businessDetails.businessName.split(' | ');
        this.nameOne = namesArray[0];
        this.nameTwo = namesArray[1];
      } else {
        this.nameOne = this.businessDetails.businessName;
        this.nameTwo = null;
      }

      this.isJobCard =
        this.businessDetails?.businessType === PitchCardType.Job;
      if (this.isJobCard) {
        this.setWorkTypesList();
        this.getLocation();
        this.calculateCompensationDescription();
      }

      this.populateVCard();

      this.cdr.detectChanges();
    }
  }

  calcNameSize() {
    if (!this.businessDetails || !this.businessDetails.businessName) {
      return 1;
    }

    const koef = this.businessDetails.businessName.length - 20;

    if (koef < 0) {
      return 1;
    } else {
      return 1 - koef / 100;
    }
  }

  calcTitleSize() {
    if (!this.businessDetails || !this.businessDetails.title) {
      return 1;
    }

    const koef = this.businessDetails.title.length - 25;

    if (koef < 0) {
      return 1;
    } else {
      return 1 - koef / 100;
    }
  }

  calcPositionTitleSize() {
    if (this.businessDetails?.positions?.length) {
      let position: any = '';
      if (this.businessDetails?.positions[0].hasOwnProperty('name')) {
        position = this.businessDetails?.positions[0]?.name
          ? this.businessDetails.positions[0].name
          : '';
      } else {
        position = this.businessDetails?.positions[0]
          ? this.businessDetails.positions[0]
          : '';
      }

      if (position.length - 15 < 0) {
        return 1;
      } else {
        return 1 - (position.length + 9) / 100;
      }
    } else {
      return 1;
    }
  }

  ngAfterContentChecked() {
    if (this.autoScale) {
      setTimeout(() => this.calcScale(), 100);
    }
    if (this.demo) {
      this.nameSize =
        this.businessDetails?.businessType === 'service' ||
        this.businessDetails?.businessType === 'employee'
          ? this.calcTitleSize()
          : this.calcNameSize();
      this.titleSize =
        this.businessDetails?.businessType === 'service' ||
        this.businessDetails?.businessType === 'employee'
          ? this.calcNameSize()
          : this.calcTitleSize();
      this.positionTitleSize =
        this.businessDetails?.businessType === 'job'
          ? this.calcPositionTitleSize()
          : 1;
    }
  }

  calcScale() {
    const pitchCardWrapper = this.elRef.nativeElement.parentElement;
    if (pitchCardWrapper.clientWidth * 0.8 < 360) {
      this.scale = (pitchCardWrapper.clientWidth * 0.8) / 360;
    } else if (pitchCardWrapper.clientHeight * 0.8 < 575) {
      const scaleFactorHeight =
        (pitchCardWrapper.clientHeight * 0.8) / 575;
      if (scaleFactorHeight < this.scaleFactor) {
        this.scale = scaleFactorHeight;
      }
    } else {
      this.scale = 1;
    }
  }

  calcCover() {
    this.isCoverLandscape =
      this.coverImage.nativeElement.naturalWidth /
      this.coverImage.nativeElement.naturalHeight >
      1.33;
    if (this.videoPlayer?.target) {
      this.isVideoLoaded.emit(this.videoPlayer.target);
    } else {
      this.isVideoLoaded.emit();
    }
  }

  ngOnDestroy() {
    try {
      this.detachMedia();
    } catch (error) {
      console.log(error);
    }
    if (this.$analyticsSub) {
      this.$analyticsSub.unsubscribe();
    }
    if (this.jobConditionsPopup && this.isJobConditionsPopupOpen) {
      this.jobConditionsPopup.hide();
    }
    document.removeEventListener('message', this.scheduled, false);
  }

  ngOnChanges() {
    this.videoThumbSrc = 'assets/images/comingsoon.png';

    if (this.businessDetails) {
      if (!this.demo) {
        this.setRatings();
      }

      if (this.isMobile && !this.businessDetails?.id) {
        this.scale = 0.7;
      }

      this.nameSize =
        this.businessDetails?.businessType === 'service' ||
        this.businessDetails?.businessType === 'employee'
          ? this.calcTitleSize()
          : this.calcNameSize();
      this.checkIsBusinessDetailsAvailable();
      this.titleSize =
        this.businessDetails?.businessType === 'service' ||
        this.businessDetails?.businessType === 'employee'
          ? this.calcNameSize()
          : this.calcTitleSize();
      this.positionTitleSize =
        this.businessDetails?.businessType === 'job'
          ? this.calcPositionTitleSize()
          : 1;
      if (this.businessDetails?.businessName?.includes(' | ')) {
        const namesArray =
          this.businessDetails.businessName.split(' | ');
        this.nameOne = namesArray[0];
        this.nameTwo = namesArray[1];
      } else if (this.businessDetails?.businessType === 'service') {
        this.nameOne = this.businessDetails.businessName;
        this.nameTwo = null;
      } else {
        this.nameOne = null;
        this.nameTwo = null;
      }

      this.isJobCard =
        this.businessDetails?.businessType === PitchCardType.Job;
      if (this.isJobCard) {
        this.setWorkTypesList();
        this.getLocation();
        this.calculateCompensationDescription();
      }

      this.populateVCard();

      this.cdr.detectChanges();
    }
  }

  detectChanges() {
    this.cdr.detectChanges();
  }

  setRatings() {
    if (
      this.businessDetails &&
      this.businessDetails.averageCustomerRating &&
      this.businessDetails.averageQualityRating
    ) {
      this.averageCustomerRating =
        +this.businessDetails.averageCustomerRating.toFixed(1);
      this.averageQualityRating =
        +this.businessDetails.averageQualityRating.toFixed(1);
    }
  }

  checkIsBusinessDetailsAvailable() {
    if (
      this.businessDetails.employeePictureThumnailUrl &&
      this.businessDetails.employeePictureFileIds
    ) {
      this.uploadedFiles = [];
      const employeeImgFileIds =
        this.businessDetails.employeePictureFileIds.split(',');
      employeeImgFileIds.forEach((elm, idx) => {
        this.uploadedFiles[idx] = {
          fileId: elm,
          thumbnailFileUrl:
            this.businessDetails.employeePictureThumnailUrl[idx]
        };
      });
    }

    if (this.businessDetails.address) {
      let query = this.businessDetails?.address.trim();

      if (
        !query.includes(this.businessDetails?.cityName) &&
        !(
          query.includes(this.businessDetails?.stateName) ||
          query.includes(this.businessDetails?.stateCode)
        )
      ) {
        if (this.businessDetails?.cityName) {
          query += `, ${this.businessDetails?.cityName}`;
        }

        if (this.businessDetails?.stateName) {
          query += `, ${this.businessDetails?.stateName}`;
        }
      }

      if (!query.includes(this.businessDetails?.zip)) {
        if (this.businessDetails?.zip) {
          query += `, ${this.businessDetails?.zip}`;
        }
      }

      this.formattedAddress = query;

      this.googleMapLink = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
  }

  onTitleClick(title) {
    if (this.isMobile && title === 'saveAsFavorite') {
      const vcards = document.getElementsByClassName('contracts-vcf');
      if (vcards.length) {
        for (let index = 0; index < vcards.length; index++) {
          const element = vcards[index];
          if (
            element['href'] ===
            this.vCardUrl.changingThisBreaksApplicationSecurity
          ) {
            vcards[index].setAttribute('id', 'downloadvcf');
            break;
          }
        }
      }
    }

    if (
      (this.disabled && !this.withShare) ||
      (title === 'applyJobNowDialog' &&
        this.router.url.includes('create')) ||
      (title === 'showJobRequirementsDialog' &&
        this.router.url.includes('create')) ||
      (title !== 'playVideo' &&
        title !== 'done' &&
        title !== 'contactMe' &&
        this.blur)
    ) {
      return;
    }

    if (this.businessDetails) {
      this.stopVideo();
      this.companyImages.emit({
        title,
        businessDetails: this.businessDetails
      });
    }
  }

  toggleContactMenu(event, parent = null) {
    if (this.blur) {
      return;
    }
    if (event) {
      this.currentContactMenu = parent?.lastChild
        ? parent.lastChild
        : event.target.parentElement.firstChild;
      this.currentContactMenu.classList.toggle('block');
      this.isContactMenuOpen = !this.isContactMenuOpen;
    } else if (this.isContactMenuOpen) {
      this.currentContactMenu.classList.remove('block');
      this.isContactMenuOpen = !this.isContactMenuOpen;
    }
  }

  openBottomContactMenu() {
    if (this.blur) {
      return;
    }
    this.isMobileContactMenuOpen = true;
  }

  toggleAsFavorite() {
    if (this.businessDetails && this.businessDetails.id && !this.blur) {
      if (this.businessDetails.isFavoriteBusiness) {
        this.onTitleClick('removeAsFavorite');
      } else {
        this.onTitleClick('saveAsFavorite');
      }
    }
  }

  goToWatchedVideoReviewList(id) {
    if (id) {
      this.router.navigate([`company-review/${id}`]);
    }
  }

  stopVideo() {
    if (this.businessDetails && this.businessDetails.isVideoPlaying) {
      this.businessDetails.isVideoPlaying = false;
      this.initVideo = false;
      if (!this.videoPlayer?.player?.paused()) {
        this.videoPlayer.player.paused();
      }
      this.cdr.detectChanges();
    }
  }

  runVideo(e) {
    e.preventDefault();
    if (!this.businessDetails?.isVideoPlaying && this.isVideoPlayed) {
      this.initVideo = true;
      this.loadVideo();
    }
    if (
      this.businessDetails?.videoFileUrl &&
      this.businessDetails?.isVideoPlaying
    ) {
      if (!this.isChangedMuteMode && this.mutedVideo) {
        this.videoPlayer.videoJsOptions.muted = false;
        this.videoPlayer.target.nativeElement.muted = false;
        this.videoPlayer.player.muted(false);
        this.isChangedMuteMode = true;
        this.videoPlayer.target.nativeElement.currentTime = 0;
        this.videoPlayer.target.nativeElement.play();
      }
    }
  }

  runVideoMobile(e) {
    e.preventDefault();
    if (!this.businessDetails?.isVideoPlaying && this.isVideoPlayed) {
      this.initVideo = true;
      this.loadVideo();
    }
    if (this.businessDetails?.videoFileUrl) {
      if (!this.isChangedMuteMode && this.mutedVideo) {
        this.videoPlayer.initPlayer();
        this.videoPlayer.player.muted(false);
        this.isChangedMuteMode = true;
        this.isplayingVideo = true;
      }
      // else if (this.isplayingVideo) {
      //   this.videoPlayer.player.pause();
      //   this.isplayingVideo = false;
      // } else{
      //   this.videoPlayer.player.play();
      //   this.isplayingVideo = true;
      // }
    }
  }

  loadVideo(config?) {
    let videoFileUrl = '';
    this.isVideoPlayed = true;
    if (this.businessDetails) {
      this.businessDetails.isVideoPlaying = true;
      this.cdr.detectChanges();
      videoFileUrl = this.businessDetails.videoFileUrl;
    }

    if (
      this.isBrowser &&
      videoFileUrl &&
      this.videoPlayer?.target?.nativeElement
    ) {
      if (Hls.isSupported()) {
        this.hideMenu();

        if (this.hls) {
          this.hls.destroy();
        }

        this.hls = new Hls();
        this.hls.loadSource(videoFileUrl);
        this.hls.attachMedia(this.videoPlayer.target.nativeElement);
        if (!this.isDesktop) {
          this.videoPlayer.target.nativeElement.play();
        } else {
          this.videoPlayer.player.play();
        }
      } else if (
        this.videoPlayer.target.nativeElement.canPlayType(
          'application/vnd.apple.mpegurl'
        )
      ) {
        this.hideMenu();
        this.videoPlayer.target.nativeElement.src = videoFileUrl;
        this.videoPlayer.target.nativeElement.play();
      }
    }
  }

  showCardRestrict() {
    this.isShowRestrict = true;
  }

  hideCardRestrict() {
    this.isShowRestrict = false;
    this.cdr.detectChanges();
  }

  hideMenu() {
    if (this.videoPlayer?.target?.nativeElement?.addEventListener) {
      this.videoPlayer.target.nativeElement.addEventListener(
        'contextmenu',
        function (e) {
          e.preventDefault();
        },
        false
      );
    } else if (this.videoPlayer?.target?.nativeElement) {
      this.videoPlayer.target.nativeElement.attachEvent(
        'oncontextmenu',
        function () {
          window.event.returnValue = false;
        }
      );
    }
  }

  showPlayer() {
    console.log('1');
    this.playVideo = this.businessDetails.isVideoPlaying;
  }

  onTimeUpdate(event) {
    if (event.target.duration) {
      if (!this.videoDuration) {
        this.playVideo = true;
        this.setCountDownTimer(event.target.duration);
      }
      if (
        event.currentTarget &&
        event.currentTarget.currentTime >= event.currentTarget.duration
      ) {
        this.businessDetails.isVideoPlaying = false;
      }
      if (!this.businessDetails.isVideoPlaying) {
        this.playVideo = false;
        this.initVideo = false;
        this.videoDuration = null;
        this.countdownTimer = null;
        clearInterval(this.timer);
        this.detachMedia();
        this.cdr.detectChanges();
      }
    }
  }

  handleUploadVideoError() {
    this.initVideo = false;
    setTimeout(() => {
      this.initVideo = true;
      this.loadVideo();
    }, 3000);
  }

  setCountDownTimer(duration) {
    this.videoDuration = Math.floor(duration);
    const VISIBLE_TIME = 4;
    const FADE_OUT_TIME = 1;

    if (
      this.videoDuration > VISIBLE_TIME &&
      this.businessDetails.isVideoPlaying
    ) {
      this.countdownTimer = !this.countdownTimer
        ? this.videoDuration
        : this.countdownTimer;
      this.timer = setInterval(() => {
        this.countdownTimer = --this.countdownTimer;
        if (this.countdownTimer === this.videoDuration - VISIBLE_TIME) {
          const el = document.getElementById('countdown-timer');
          el?.classList.add('fade-out');
        }
        if (
          this.countdownTimer <=
          this.videoDuration - VISIBLE_TIME - FADE_OUT_TIME
        ) {
          clearInterval(this.timer);
          this.countdownTimer = null;
        }
      }, 1000);
    }
  }

  showCalendar(calendarLink) {
    if (calendarLink.includes('calendly')) {
      calendarLink =
        calendarLink.includes('https') || calendarLink.includes('http')
          ? calendarLink
          : 'https://' + calendarLink;

      this.showCalendly(calendarLink).then(() => {
        this.handleSubmitEventFromCalendly();
      });
    } else {
      window.open(calendarLink, '_blank');
    }
  }

  showCalendly(calendarLink) {
    return new Promise((resolve) => {
      Calendly.showPopupWidget(calendarLink, null, {
        parentElement: document.getElementsByClassName(
          'banner-search-wrap container'
        )[0]
      });
      resolve(null);
    });
  }

  handleSubmitEventFromCalendly() {
    this.scheduled = window.addEventListener('message', (e) => {
      if (e.data.event === 'calendly.event_scheduled') {
        Calendly.closePopupWidget();
        this.addScheduledBusinessAnalytics();
      }
    });
  }

  addScheduledBusinessAnalytics() {
    this.$analyticsSub.add(
      this.businessService
        .scheduledBusiness([this.businessDetails.id])
        .subscribe(() => {
        })
    );
  }

  addCallsAnalytics() {
    this.$analyticsSub.add(
      this.businessService
        .contactCall([this.businessDetails.id])
        .subscribe(() => {
        })
    );
  }

  addEmailAnalytics() {
    this.$analyticsSub.add(
      this.businessService
        .contactEmail([this.businessDetails.id])
        .subscribe(() => {
        })
    );
  }

  addLocationAnalytics() {
    this.$analyticsSub.add(
      this.businessService
        .contactDirections([this.businessDetails.id])
        .subscribe(() => {
        })
    );
  }

  detachMedia() {
    this.playVideo = false;
    if (this.isBrowser && this.hls && Hls.isSupported()) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
    }
  }

  setWorkTypesList() {
    if (this.businessDetails?.workTypes?.length) {
      this.workTypeList = this.businessDetails?.workTypes
        .map((x) => x.name)
        .join(', ');
    }

    if (this.workTypeList.length > 22) {
      this.workTypeList =
        this.businessDetails.workTypes[0].name +
        ' +' +
        (this.businessDetails.workTypes.length - 1);
    }
  }

  getLocation() {
    this.locationAddress = this.businessService.getLocation(
      this.businessDetails
    );
  }

  calculateCompensationDescription() {
    this.compensationDescription = this.businessDetails
      ? this.businessService.calculateCompensationDescription(
        this.businessDetails
      )
      : '';
    this.compensationDescription =
      this.compensationDescription.trim() !== '' &&
      this.compensationDescription.trim() !== '-'
        ? this.compensationDescription
        : '';
  }

  viewResumeFailure() {
    console.log('Demo boolean: ', this.demo);
    console.log(
      'Does it have a resume file url? : ',
      this.businessDetails?.resumeFileUrl
    );
  }

  populateVCard() {
    if (
      this.businessDetails?.title &&
      this.businessDetails?.businessName &&
      this.businessDetails?.alias
    ) {
      this.vCard = {
        version: this.deviceService.os === 'iOS' ? '4.0' : '3.0',
        name: this.populateVCardName(),
        telephone: [],
        email:
          this.deviceService.os === 'iOS'
            ? [this.businessDetails.email]
            : [],
        url: encodeURI(
          `${window.location.origin}/card/${this.businessDetails.alias}`
        ),
        organization: this.populateOrgName(),
        photo:
          'data:image/jpeg;base64,' +
          window.btoa(this.businessDetails.businessLogoThumbnailUrl)
      };
      if (this.deviceService.os !== 'iOS') {
        const emailParam: BasicPropertyParameters = {type: 'work'};
        const email = {
          value: this.businessDetails.email,
          param: emailParam
        };
        this.vCard.email.push(email);
      }
      const phoneParam: BasicPropertyParameters = {type: 'cell'};
      const phone = {
        value: this.businessDetails.contactNumber,
        param: phoneParam
      };
      this.vCard.telephone.push(phone);

      const vCardString = VCardFormatter.getVCardAsString(this.vCard);

      this.populateLink(
        this.deviceService.os === 'iOS'
          ? this.populateCustomVCardUrl(vCardString)
          : vCardString
      );
    }
  }

  populateVCardName(): { firstNames: string; lastNames: string } {
    const fullNameObject: { firstNames: string; lastNames: string } = {
      firstNames: '',
      lastNames: ''
    };
    const fullName = this.populateFullName();
    const splitName = fullName.split(' ');
    if (splitName?.length > 1) {
      splitName.map((item, index) => {
        if (index === 0) {
          fullNameObject.firstNames = item;
        } else {
          fullNameObject.lastNames =
            fullNameObject.lastNames + item + ' ';
        }
      });
      return fullNameObject;
    } else {
      return {firstNames: this.populateFullName(), lastNames: ''};
    }
  }

  populateFullName() {
    if (
      this.businessDetails?.businessType === PitchCardType.Service ||
      this.businessDetails?.businessType === PitchCardType.Basic ||
      this.businessDetails?.businessType === PitchCardType.Employee
    ) {
      return this.businessDetails?.title
        ? this.checkStringName(this.businessDetails.title)
        : this.checkStringName(
          this.businessDetails?.businessName
            ? this.businessDetails.businessName
            : ''
        );
    } else if (
      this.businessDetails?.businessType === PitchCardType.Resume
    ) {
      return this.businessDetails?.businessName
        ? this.checkStringName(this.businessDetails.businessName)
        : this.checkStringName(
          this.businessDetails?.title
            ? this.businessDetails.title
            : ''
        );
    } else {
      return '';
    }
  }

  checkStringName(str) {
    return str.includes('|') ? str.replace(' | ', ' ') : str;
  }

  populateOrgName(): string {
    if (
      this.businessDetails?.businessType === PitchCardType.Service ||
      this.businessDetails?.businessType === PitchCardType.Basic ||
      this.businessDetails?.businessType === PitchCardType.Employee
    ) {
      return this.businessDetails?.businessName
        ? this.checkStringName(this.businessDetails.businessName)
        : '';
    } else if (
      this.businessDetails?.businessType === PitchCardType.Resume
    ) {
      return this.businessDetails?.title
        ? this.checkStringName(this.businessDetails.title)
        : '';
    } else {
      return '';
    }
  }

  populateCustomVCardUrl(str: string) {
    return str.replace('URL', 'URL;PitchCard');
  }

  populateLink(vCardString) {
    this.vCardUrl = this.domSanitizer.bypassSecurityTrustUrl(
      'data:text/vcard;base64,' + window.btoa(vCardString)
    );
  }
}
