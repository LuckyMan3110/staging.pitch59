import {
    Component,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Carousel } from 'primeng/carousel';
import { ConfirmationService } from 'primeng/api';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';

import { AppSettings } from '../../../shared/app.settings';
import { BusinessDetails } from '../../../business/models/business-detail.model';
import { MyPocket } from '../../../choosen-history/models/my-pocket.model';

import { BusinessService } from '../../../business/services/business.service';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { CustomerAnalyticsService } from '../../../choosen-history/services/customer-analytics.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { MyPocketsService } from '../../../choosen-history/services/my-pockets.service';
import { PitchCardModalsWrapperService } from '../../services/pitchcard-modals-wrapper.service';
import { StorageService } from '../../../shared/services/storage.service';
import { UiService } from '../../../shared/services/ui.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AnalyticsOptionsEnum } from '../../../choosen-history/pages/employer-portal/enums/analytics-options.enum';
import { CategoryTag } from '../../../business/models/category-tag.model';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { environment } from '../../../../../environments/environment';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { Router } from '@angular/router';

declare const Hls: any;
@Component({
    selector: 'app-pitchcard-modals-wrapper',
    templateUrl: './pitchcard-modals-wrapper.component.html',
    styleUrls: ['./pitchcard-modals-wrapper.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [MyPocketsService]
})
export class PitchCardModalsWrapperComponent implements OnInit, OnDestroy {
    @Input() uniqueId: string;
    // Component Main Variables
    currentPitchCard: BusinessDetails = null;
    currentPitchCardType: string = null;
    mobileMode: boolean = false;

    $moreInfoSub: Subscription;
    $jobDetailsSub: Subscription;
    $shareSub: Subscription;
    $savemobileSub: Subscription;
    $contactSub: Subscription;
    $doneSub: Subscription;
    $photosSub: Subscription;
    $resumeSub: Subscription;
    $saveSub: Subscription;
    $getAllPocketsSub: Subscription;
    $addBusinessToPocketSub: Subscription;
    $videoPlayerSub: Subscription;
    $videoReviewSub: Subscription;
    $uploadVideoReviewSub: Subscription;
    $contactInfoSub: Subscription;
    $signUpCommonSub: Subscription;
    $signUpSub: Subscription;
    $contactBusinessSub: Subscription;
  $applyJobNowSub: Subscription;
  $jobRequirementsSub: Subscription;
  $pendingMethod: Subscription;
  $allModals = new Subscription();

    isBrowser: boolean;
    isMobile: boolean = this.deviceService.isMobile();
    isPortraitMode: boolean = window.innerHeight > window.innerWidth;

  // MoreInfo Dialog Variables
  moreInfoWorkingHours: {
    openHours: string;
    closeHours: string;
    days: string[];
  }[] = [];
  showMoreInfoDialog: boolean = false;

  // Job Details Dialog
  showJobDetailsDialog: boolean = false;
  isJobCard: boolean;
  benefits: CategoryTag[];
  workTypes: any[];
  workTypesList: string;
  locationAddress: string = '';
  compensationDescription: string = '';

  // Job Details Dialog
  showJobRequirementsDialog: boolean = false;
  acceptPositionRequirements: boolean = false;

  // ShareBusiness Dialog Variables
  shareBusinessUrl: string = null;
  showShareBusinessDialog: boolean = false;
  showContactMeDialog: boolean = false;
  showDoneDialog: boolean = false;
  shareTitle: string = 'Share';
  introText: string;

  // SaveMobile Dialog Variables
  showSaveMobileBusinessDialog: boolean = false;

  // PhotoGalleria Dialog Variables
  photoGalleriaImages: { file: string; thumbnail: string }[] = [];
  showPhotoGalleriaDialog: boolean = false;

  // SaveBusiness Dialog Variables
  carouselAllPockets: MyPocket[] = [];
  carouselAllPocketsLoader: boolean = false;

  @HostBinding('style.--mobile-pocket-scale') get scale() {
    return this.mobilePocketScale;
  }

  numScroll: number = 1;
  numVisible: number = 4;
  mobilePocketScale: number = 0.4;
  responsiveOptions = [
    {
      breakpoint: '1920px',
      numVisible: 4,
      numScroll: 1
    },
        {
            breakpoint: '1069px',
            numVisible: 3,
            numScroll: 3
        },
        {
            breakpoint: '820px',
          numVisible: 2,
          numScroll: 2
        },
    {
      breakpoint: '620px',
      numVisible: 1,
      numScroll: 1
    }
  ];
  showSaveBusinessDialog: boolean = false;
  @ViewChild('mobilePocketsContainer', {static: false})
  mobilePocketsContainer: ElementRef;
  @ViewChild('pocketsCarousel', {static: false}) pocketsCarousel: Carousel;
  @ViewChild('pitchCardWrapper', {static: false})
  pitchCardWrapper: ElementRef;

  // Create pocket dialog
  detailsPocketModal: boolean = false;
  modalErrors = {
    newPocketName: null,
    newPocketColor: null
  };

  // VideoPlayer Dialog Variables
  hls: any;
    showVideoPlayerDialog: boolean = false;
    videoFileUrl: string = null;
    isVideoMirrored = false;

    // ViedeoReviews Dialog Variables
    showViewReviewsDialog: boolean = false;
    showUploadReviewVideoDialog: boolean = false;
    showUploadReviewRatingScreen: boolean = false;
    uploadedReviewVideoFile: any;
    uploadReviewVideoMetaData: any;
    customerServiceRating: number = 0;
    qualityRating: number = 0;
    isCoverLandscape: boolean = true;
    coverImageHeight: string = '';
    @ViewChild('coverImage') coverImage: ElementRef;

    // SignUp Common Dialog Variables
    showSignUpCommonDialog: boolean = false;
    showSignUpDialog: boolean = false;
    showSignInDialog: boolean = false;
    redirectionPath: string = 'welcome';

    // Contact Dialog Variables
    showContactInfoDialog: boolean = false;
    userName: string;

    // Resume File Dialog Variables
    showResumeFileDialog: boolean = false;
    resumeFileExtension: string;

    // Apply Job Dialog Variables
    showApplyJobDialog: boolean = false;
    alias = environment.defaultBusinessShareLinkAlias;
    previewResumeCard;
    userResumeCard;
    scaleFactor: number = 0.8;
    jobCardScaleFactor = 0.7;
    validToApply: boolean = false;

    // Apply job with external link by not auth user
    showApplyJobDialogByLink: boolean = false;

    constructor(
      private businessService: BusinessService,
      private commonBindingService: CommonBindingDataService,
      private confirmationService: ConfirmationService,
      private customerAnalyticsService: CustomerAnalyticsService,
      @Inject(PLATFORM_ID) private platformId,
      private loaderService: LoaderService,
      private myPocketsService: MyPocketsService,
      private pitchCardsModalsWrapperService: PitchCardModalsWrapperService,
      private storageService: StorageService,
      private uiService: UiService,
      public deviceService: DeviceDetectorService,
      public userCommonService: UserCommonService,
      private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
      private cardPackagesService: CardPackageService,
      private router: Router
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.onResized = this.onResized.bind(this);
    }

    ngOnInit() {
        window.addEventListener('resize', this.onResized);
        this.componentMainVariablesInit();
        this.moreInfoSubscriber();
        this.jobDetailsSubscriber();
        this.shareSubscriber();
        this.savemobileSubscriber();
        this.contactMeSubscriber();
        this.doneDialogSubscriber();
        this.photoGalleriaSubscriber();
        this.resumeFileSubscriber();
        this.saveBusinessDialogSubscriber();
        this.videoPlayerDialogSubscriber();
        this.videoReviewsDialogSubscriber();
        this.uploadVideoReviewSubscriber();
        this.signUpCommonDialogSubscriber();
        this.contactInfoDialogSubscriber();
        this.applyJobNowSubscriber();
        this.jobRequirementSubscriber();
        this.shutDownAllModalsSubs();
        this.onResized();
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.onResized);
        this.pitchCardsModalsWrapperService.clearCurrentBusiness();
        try {
            this.detachVideoFile();
        } catch (error) {
            console.log(error);
        }
        this.unsubscriber();
    }

    ngAfterViewInit() {
        if (this.showSaveBusinessDialog) this.onResized();
    }

    onResized() {
      if (window.innerHeight <= 1024 && window.innerWidth < 992) {
        this.jobCardScaleFactor = 0.6;
        this.scaleFactor = 0.5;
      } else {
        this.jobCardScaleFactor = 0.7;
      }

        this.calculateMobileMode();

        if (this.showSaveBusinessDialog) {
            this.calculateMobilePocketScale();
        }
    }

    calculateMobileMode() {
        if (window.innerWidth < 768) this.mobileMode = true;
        if (window.innerWidth >= 768) this.mobileMode = false;
        this.isMobile = this.deviceService.isMobile();
        this.isPortraitMode = window.innerHeight > window.innerWidth;
    }

    calculateMobilePocketScale() {
        if (window.innerWidth < 768) {
          const defaultScale = 0.4;
          const paddings = window.innerWidth < 500 ? 48 : 69;
          const defaultPocketWidth = 165;
          const pocketsInTheRow = window.innerWidth < 560 ? 2 : 3;
          const containerWidth = window.innerWidth - paddings;
          let pocketMargins = 80;

          if (window.innerWidth < 560) {
            pocketMargins = 55;
          }
          if (window.innerWidth < 420) {
            pocketMargins = 80;
          }

          this.mobilePocketScale =
            (((containerWidth - pocketMargins) / pocketsInTheRow) *
              defaultScale) /
            defaultPocketWidth;
        }
    }

    previewCardSetup() {
        if (!this.userResumeCard) {
            this.previewResumeCard = AppSettings.defaultResumePitchCard;
        }
    }

    goToCreateResume() {
        this.saveJobCardAliasLink(this.currentPitchCard);
        this.cardPackagesService.selectedType = PitchCardType.Resume;
        this.router.navigate(['create']);
        this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, null);
    }

    goToDraftResume(resumeId) {
        this.saveJobCardAliasLink(this.currentPitchCard);
        this.cardPackagesService.selectedType = PitchCardType.Resume;
        this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, resumeId);
        this.router.navigate(['create']);
    }

    componentMainVariablesInit() {
      this.currentPitchCard =
        this.pitchCardsModalsWrapperService.getCurrentBusiness();
      this.currentPitchCardType = this.currentPitchCard.businessType;

      this.isJobCard =
        this.currentPitchCard.businessType === PitchCardType.Job;
      this.benefits = this.currentPitchCard.benefits;
      this.workTypes = this.currentPitchCard.workTypes;
      this.setWorkTypesList();
      this.getLocation();
      this.calculateCompensationDescription();
    }

    validateLink(link) {
        if (link) {
          return (link && link.includes('https')) ||
          (link && link.includes('http'))
            ? link
            : 'https://' + link;
        }
        return '#';
    }

    moreInfoSubscriber() {
      this.$moreInfoSub =
        this.pitchCardsModalsWrapperService.showMoreInfoDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showMoreInfoDialog = value;

              if (value) {
                this.componentMainVariablesInit();
                this.moreInfoDialogVariablesInit();
                setTimeout(() => {
                  this.editorSetup(
                    this.currentPitchCard?.pricingModel
                      ? this.currentPitchCard.pricingModel
                      : '',
                    'e_description_' + this.uniqueId
                  );
                }, 500);
              }
            }
          }
        );
    }

    moreInfoDialogVariablesInit() {
      this.moreInfoWorkingHours =
        this.pitchCardsModalsWrapperService.getFormattedWorkingHours();
    }

    jobDetailsSubscriber() {
      this.$jobDetailsSub =
        this.pitchCardsModalsWrapperService.showJobDetailsDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showJobDetailsDialog = value;

              if (value) {
                this.componentMainVariablesInit();
                this.jobDetailsDialogVariablesInit();
                setTimeout(() => {
                  this.editorSetup(
                    this.currentPitchCard?.positionRequirements
                      ? this.currentPitchCard
                        .positionRequirements
                      : '',
                    'e_requirements_' + this.uniqueId
                  );
                  this.editorSetup(
                    this.currentPitchCard?.pricingModel
                      ? this.currentPitchCard.pricingModel
                      : '',
                    'e_description_' + this.uniqueId
                  );
                }, 500);
              }
            }
          }
        );
    }

    jobDetailsDialogVariablesInit() {
        this.getLocation();
        this.calculateCompensationDescription();
    }

    editorSetup(controlValue, id) {
        if (controlValue) {
          this.pitchCardModalsWrapperService.previewHtmlData(
            controlValue,
            id
          );
        }
    }

    shareSubscriber() {
      this.$shareSub =
        this.pitchCardsModalsWrapperService.showShareDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showShareBusinessDialog = value;
              if (value) {
                this.componentMainVariablesInit();
                this.shareDialogVariablesInit();
                // this.parseExistIntroText();
              }
            }
          }
        );
    }

    openSaveBusinessDialog() {
        this.showSaveMobileBusinessDialog = false;
        this.showSaveBusinessDialog = true;
        this.componentMainVariablesInit();
        this.saveBusinessDialogVariablesInit();
        this.calculateMobilePocketScale();
    }

    downloadContact() {
        document.getElementById('downloadvcf').click();
    }

    savemobileSubscriber() {
      this.$savemobileSub =
        this.pitchCardsModalsWrapperService.showSaveMobileDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showSaveMobileBusinessDialog = value;
            }
          }
        );
    }

  contactMeSubscriber() {
    this.$contactSub =
      this.pitchCardsModalsWrapperService.showContactMeDialog.subscribe(
        (value) => {
          this.showContactMeDialog = value;
        }
      );
  }

  doneDialogSubscriber() {
    this.$doneSub =
      this.pitchCardsModalsWrapperService.showDoneDialog.subscribe(
        (value) => {
          this.showDoneDialog = true;
        }
      );
  }

  shareDialogVariablesInit() {
    this.shareBusinessUrl =
      this.pitchCardsModalsWrapperService.getShareBusinessUrl();
  }

  parseExistIntroText() {
    if (!this.currentPitchCard) {
      return;
    }
    const variables: string[] = [
      '<strong>Name</strong>',
      '<strong>Company Name</strong>',
      '<strong>Organization Name</strong>'
      // '<strong>PitchCard Link</strong>'
    ];
    const {businessName, title} = this.currentPitchCard;

    if (this.currentPitchCard?.introText?.includes(variables[0]) && title) {
      this.currentPitchCard.introText =
        this.currentPitchCard.introText.replaceAll(
          variables[0],
          ` <strong>${title}</strong> `
        );
    }
    if (
      this.currentPitchCard?.introText?.includes(variables[1]) &&
      businessName
    ) {
      this.currentPitchCard.introText =
        this.currentPitchCard.introText.replaceAll(
          variables[1],
          ` <strong>${businessName ? businessName : ''}</strong> `
        );
    }
    if (
      this.currentPitchCard?.introText?.includes(variables[2]) &&
      businessName
    ) {
      this.currentPitchCard.introText =
        this.currentPitchCard.introText.replaceAll(
          variables[1],
          ` <strong>${businessName ? businessName : ''}</strong> `
        );
    }
  }

  setDefaultShareTitle() {
    this.shareTitle = 'Share';
  }

  photoGalleriaSubscriber() {
    this.$photosSub =
      this.pitchCardsModalsWrapperService.showPhotoGalleria.subscribe(
        (value) => {
          if (
            this.pitchCardsModalsWrapperService.uniqueId ===
            this.uniqueId
          ) {
            this.showPhotoGalleriaDialog = value;

            if (value) {
              this.componentMainVariablesInit();
              this.photoGalleriaVariablesInit();
            }
          }
        }
      );
  }

    handlePitchCardTitleClick(event: any) {
        const { title, businessDetails } = event;

        this.pitchCardModalsWrapperService.setCurrentBusiness(businessDetails);
        this.pitchCardModalsWrapperService.onTitleClick(title);
    }

    applyJobNowSubscriber() {
      this.$applyJobNowSub =
        this.pitchCardsModalsWrapperService.showApplyJobNowDialog.subscribe(
          (value) => {
            this.previewCardSetup();
            if (this.userCommonService.isAuthenticated()) {
              this.currentPitchCard =
                this.pitchCardsModalsWrapperService.getCurrentBusiness();
              forkJoin([
                this.userCommonService.checkApplicant(
                  this.pitchCardsModalsWrapperService.getCurrentBusiness()
                    .id
                ),
                this.businessService.getResume()
              ]).subscribe(
                ([applicant, resume]) => {
                  this.onResized();
                  this.validToApply = applicant.data;
                  if (resume?.data) {
                    this.userResumeCard = resume.data;
                  }
                  console.log(this.deviceService.browser);
                  if (
                    this.currentPitchCard
                      ?.otherApplicationLink &&
                    this.currentPitchCard
                      ?.requireOtherApplicationMethod
                  ) {
                    this.pitchCardModalsWrapperService.openLinkInNewTab(
                      this.currentPitchCard
                        .otherApplicationLink
                    );
                  } else {
                    this.showApplyJobDialog = true;
                  }
                },
                (err) => {
                  console.log(err.message);
                }
              );
            } else {
              this.currentPitchCard =
                this.pitchCardsModalsWrapperService.getCurrentBusiness();
              this.currentPitchCard.otherApplicationLink
                ? (this.showApplyJobDialogByLink = true)
                : (this.showApplyJobDialog = true);
            }
          }
        );
    }

    saveJobCardAliasLink(jobCard) {
        if (jobCard) {
            const shareLink = encodeURI(`/card/${jobCard.alias}`);
            this.storageService.setSession(AppSettings.ALIAS_LINK, shareLink);
        }
    }

    removeJobCardAliasLink() {
        this.storageService.removeSession(AppSettings.ALIAS_LINK);
    }

    applyToTheJob() {
      this.userCommonService.addApplicant(this.currentPitchCard.id).subscribe(
        (res) => {
          this.showApplyJobDialog = false;
          let message = `Your Resume PitchCard has been submitted to ${this.currentPitchCard.businessName}!`;

          if (this.userResumeCard.businessStatus != 2) {
            message = `Your Resume PitchCard is currently awaiting approval.  We will send it to ${this.currentPitchCard.businessName} as soon as it is approved.<br />
                (Less than 1 business day)`;
          }
          this.confirmationService.confirm({
            message,
            key: 'applyJobConfirmation',
            accept: () => {
              this.confirmationService.close();
            }
          });
        },
        (err) => {
          console.log(err.message);
        }
      );
    }

    jobRequirementSubscriber() {
      this.$jobRequirementsSub =
        this.pitchCardsModalsWrapperService.showJobRequirementsDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.currentPitchCard =
                this.pitchCardsModalsWrapperService.getCurrentBusiness();
              this.showJobRequirementsDialog = value;
              if (value) {
                setTimeout(() => {
                  this.editorSetup(
                    this.currentPitchCard.positionRequirements,
                    'e_requirements_' + this.uniqueId
                  );
                }, 500);
              }
            }
          }
        );
    }

    shutDownAllModalsSubs() {
      this.$allModals.add(
        this.pitchCardModalsWrapperService.$shutDownAllModal.subscribe(
          (res) => {
            if (!res.withCheck) {
              this.closeAllModals();
              this.router.navigateByUrl(this.router.url);
            } else {
              if (this.hasOpenedModals()) {
                this.closeAllModals();
                this.router.navigateByUrl(this.router.url);
              }
            }
          }
        )
      );
    }

    closeAllModals() {
        this.showMoreInfoDialog = false;
        this.showJobDetailsDialog = false;
        this.showJobRequirementsDialog = false;
        this.showShareBusinessDialog = false;
        this.showSaveMobileBusinessDialog = false;
        this.showContactMeDialog = false;
        this.showDoneDialog = false;
        this.showPhotoGalleriaDialog = false;
        this.showSaveBusinessDialog = false;
        this.detailsPocketModal = false;
        this.showVideoPlayerDialog = false;
        this.showViewReviewsDialog = false;
        this.showUploadReviewVideoDialog = false;
        this.showSignUpCommonDialog = false;
        this.showSignUpDialog = false;
        this.showSignInDialog = false;
        this.showContactInfoDialog = false;
        this.showResumeFileDialog = false;
        this.showApplyJobDialog = false;
        this.showApplyJobDialogByLink = false;
    }

    hasOpenedModals() {
      const allModals = [
        (this.showMoreInfoDialog = false),
        (this.showJobDetailsDialog = false),
        (this.showJobRequirementsDialog = false),
        (this.showShareBusinessDialog = false),
        (this.showContactMeDialog = false),
        (this.showDoneDialog = false),
        (this.showPhotoGalleriaDialog = false),
        (this.showSaveBusinessDialog = false),
        (this.detailsPocketModal = false),
        (this.showVideoPlayerDialog = false),
        (this.showViewReviewsDialog = false),
        (this.showUploadReviewVideoDialog = false),
        (this.showSignUpCommonDialog = false),
        (this.showSignUpDialog = false),
        (this.showSignInDialog = false),
        (this.showContactInfoDialog = false),
        (this.showResumeFileDialog = false),
        (this.showApplyJobDialog = false),
        (this.showApplyJobDialogByLink = false),
        (this.showSaveMobileBusinessDialog = false)
      ];
      return allModals.find((m) => m);
    }

    switchToSignUp(redirectTo: string = null) {
        this.showApplyJobDialog = false;
        this.showSignInDialog = false;
        this.showSignUpDialog = true;
        if (redirectTo) {
            this.redirectionPath = redirectTo;
        }
    }

    switchToSignIn() {
        this.showApplyJobDialog = false;
        this.showSignUpDialog = false;
        this.showSignInDialog = true;
    }

    photoGalleriaVariablesInit() {
      this.photoGalleriaImages =
        this.pitchCardsModalsWrapperService.getBusinessImages();
    }

    onGalleriaHide() {
        this.pitchCardsModalsWrapperService.disablePhotoGalleriaDialog();
    }

    resumeFileSubscriber() {
      this.$resumeSub =
        this.pitchCardsModalsWrapperService.showResumeFileDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showResumeFileDialog = value;

              if (value) {
                this.componentMainVariablesInit();
                this.getResumeFileExtension();
              }
            }
          }
        );
    }

    getResumeFileExtension() {
      this.resumeFileExtension = this.currentPitchCard?.resumeFileUrl
        ? this.currentPitchCard?.resumeFileUrl.split('.').pop()
        : '';
    }

    showViaDocViewer() {
      return this.resumeFileExtension === 'pdf' ||
      this.resumeFileExtension === 'doc' ||
      this.resumeFileExtension === 'docx'
        ? true
        : false;
    }

    saveBusinessDialogSubscriber() {
      this.$saveSub =
        this.pitchCardsModalsWrapperService.showSaveBusinessDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.userCommonService.pendingMethod = 'saveAsFavorite';
              this.showSaveBusinessDialog = value;

              if (value) {
                this.componentMainVariablesInit();
                this.saveBusinessDialogVariablesInit();
                this.calculateMobilePocketScale();
              }
            }
          }
        );
    }

    saveBusinessDialogVariablesInit() {
        this.resetCarouselPage();
        this.getCarouselAllPockets();
    }

    resetCarouselPage() {
        if (this.pocketsCarousel) {
            this.pocketsCarousel.page = 0;
        }
    }

    getCarouselAllPockets() {
      this.loaderToggler('carouselAllPocketsLoader');
      this.$getAllPocketsSub = this.myPocketsService
        .getAllPockets(null, true)
        .subscribe(
          (result) => {
            if (result.data) {
              this.loaderToggler('carouselAllPocketsLoader');
              this.updateCarouselAllPocketVariable(result);
            }
          },
          (error) => {
            this.loaderToggler('carouselAllPocketsLoader');
            this.pitchCardsModalsWrapperService.disableSaveBusinessDialog();
            this.handleRequestError(error);
          }
        );
    }

    updateCarouselAllPocketVariable(requestResult: any) {
      let allPockets = requestResult.data;
      allPockets.forEach((pocket) => {
        pocket.color = this.myPocketsService
          .getMyPocketsColor()
          [pocket.color].substr(1);
      });
      this.carouselAllPockets = allPockets;
    }

    clearCarouselAllPocketsVariable() {
      this.carouselAllPockets = [];
      this.userCommonService.pendingMethod = null;
    }

    saveBusinessToPocket(pocketId: number, newPocketName: string) {
      const businessId = this.currentPitchCard.id;

      this.$addBusinessToPocketSub = this.myPocketsService
        .addBusinessToPocket(businessId, pocketId)
        .subscribe(
          (result) => {
            if (result.data) {
              this.pitchCardsModalsWrapperService.disableSaveBusinessDialog();
              this.clearCarouselAllPocketsVariable();
              this.handleRequestSuccess(
                newPocketName
                  ? 'The business was saved successfully inside ' +
                  newPocketName
                  : 'The business was saved successfully'
              );
            } else {
              this.uiService.successMessage(
                result?.message ? result.message : ''
              );
            }
          },
          (error) => {
            this.pitchCardsModalsWrapperService.disableSaveBusinessDialog();
            this.handleRequestError(error);
          }
        );
    }

    newPocketSubmit(params) {
        this.myPocketsService.createNewPocket(params).subscribe(
          (result) => {
            const message = 'The pocket was created successfully';

            this.finishPocketProcess(result, message);
          },
          (error) => {
            const message = 'Error while Pocket creating';

            this.errorPocketProcess(error, message);
          }
        );
    }

    finishPocketProcess(result: any, message: string) {
        if (result.data) {
          this.detailsPocketModal = false;
          this.uiService.successMessage(message);
          this.getCarouselAllPockets();
          this.saveBusinessToPocket(
            result.data.id,
            result?.data?.name ? result.data.name : 'New Pocket'
          );
        }
    }

    errorPocketProcess(error: any, message: string) {
        this.detailsPocketModal = false;
        setTimeout(() => {
          this.uiService.errorMessage(
            error.message ? error.message : message,
            'main',
            3000
          );
        }, 1000);
    }

    clearDetailsModalOptions() {
        this.modalErrors = {
            newPocketName: null,
          newPocketColor: null
        };
    }

    videoPlayerDialogSubscriber() {
      this.$videoPlayerSub =
        this.pitchCardsModalsWrapperService.showVideoPlayerDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showVideoPlayerDialog = value;

              if (value) {
                this.componentMainVariablesInit();
                this.videoFileUrl =
                  this.currentPitchCard &&
                  this.currentPitchCard.videoFileUrl;
                this.isVideoMirrored =
                  this.currentPitchCard &&
                  this.currentPitchCard.isMirrorVideo;
              }
            }
          }
        );
    }

    detachVideoFile() {
        if (this.isBrowser && this.hls && Hls.isSupported()) {
            this.hls.stopLoad();
            this.hls.detachMedia();
            this.hls.destroy();
        }
    }

    videoReviewsDialogSubscriber() {
      this.$videoReviewSub =
        this.pitchCardsModalsWrapperService.showVideoReviewsDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showViewReviewsDialog = value;

              if (value) {
                this.componentMainVariablesInit();
              }
            }
          }
        );
    }

    uploadVideoReviewSubscriber() {
      this.$uploadVideoReviewSub =
        this.pitchCardsModalsWrapperService.showUploadReviewVideoDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showUploadReviewVideoDialog = value;

              if (value) {
                this.componentMainVariablesInit();
              }
            }
          }
        );
    }

    reviewVideoInit(videoUrl: string) {
        this.showVideoPlayerDialog = true;
        this.videoFileUrl = videoUrl;
    }

    handleLeaveReviewClick() {
        this.pitchCardModalsWrapperService.onTitleClick('leaveareview');
    }

    moveToUploadReviewRatingScreen(event: any) {
        this.loaderService.show('page-center');
        this.uploadedReviewVideoFile = event.uploadedFiles[0];
        const requestCallback = () => {
            this.showUploadReviewRatingScreen = true;
            this.loaderService.hide();
        };

        this.fetchingVideoAPI(requestCallback, 1000);
    }

    updateUploadedReviewVideo() {
        this.confirmationService.confirm({
          message: this.commonBindingService.getLabel(
            'confirm_reupload_video'
          ),
          accept: () => {
            this.undoUploadedVideoReview();
          }
        });
    }

    undoUploadedVideoReview() {
        this.uploadReviewVideoMetaData = {};
        this.uploadedReviewVideoFile = {};
        this.showUploadReviewRatingScreen = false;
    }

    calcCover() {
      this.isCoverLandscape =
        this.coverImage.nativeElement.naturalWidth /
        this.coverImage.nativeElement.naturalHeight >
        1.33;
      this.coverImageHeight =
        (this.coverImage.nativeElement.width / 12) * 9 + 'px';
    }

    submitUploadedVideoReview() {
        const params = this.createSubmitVideoReviewParams();
        this.sendAddVideoReviewRequest(params);
        this.disbaleLeaveReviewPossibility();
    }

    createSubmitVideoReviewParams() {
        return {
            businessId: this.currentPitchCard.id,
            userId: this.userCommonService.userId,
            videoReviewId: this.uploadReviewVideoMetaData.assetId,
            customerService: this.customerServiceRating,
            quality: this.qualityRating
        };
    }

    sendAddVideoReviewRequest(params: any) {
      this.customerAnalyticsService.addReview(params).subscribe(
        (result) => {
          this.showUploadReviewVideoDialog = false;
          this.pitchCardsModalsWrapperService.disableVideoReviewDialog();
          this.checkOutWhetherShowSharePopup(result);
        },
        (error) => {
          this.showUploadReviewVideoDialog = false;
          this.handleRequestError(error);
        }
      );
    }

    checkOutWhetherShowSharePopup(result: any) {
        const resultData = result && result.data;

        if (resultData && resultData.customerService && resultData.quality) {
          if (resultData.customerService + resultData.quality >= 8) {
            this.shareTitle = this.commonBindingService.getLabel(
              'label_share_header_after_review_upload'
            );

            this.pitchCardsModalsWrapperService.enableShareDialog();
          }
        }
    }

    disbaleLeaveReviewPossibility() {
      this.currentPitchCard.videoReviewCount = 1;
      this.pitchCardsModalsWrapperService.setCurrentBusiness({
        ...this.currentPitchCard
      });
      //TODO: CHECK THIS FUNCTION WHEN BACK IND WILL BE READY!
    }

    handleRequestError(error: any) {
        const errMessage = 'Error while sending request';

        setTimeout(() => {
          this.uiService.errorMessage(
            error.Message ? error.Message : errMessage,
            'main',
            3000
          );
        }, 1000);
    }

    handleRequestSuccess(message: string) {
        setTimeout(() => {
            this.uiService.successMessage(message, true, 'main', 3000);
        }, 1000);
    }

    loaderToggler(loaderName: string) {
        if (this[loaderName]) {
            this[loaderName] = false;
            return;
        }
        this[loaderName] = true;
    }

    fetchingVideoAPI(callback: any, milliSeconds: number) {
        setTimeout(() => {
            this.fetchMuxVideoData(callback);
        }, milliSeconds);
    }

    fetchMuxVideoData(callback: any) {
        if (this.uploadedReviewVideoFile) {
          this.businessService
            .getVideoDetail(this.uploadedReviewVideoFile.fileId)
            .subscribe(
              (result) => {
                if (
                  result?.data &&
                  result?.data?.status !== 'errored'
                ) {
                  this.handleFetchMuxSuccessRequest(
                    result.data,
                    callback
                  );
                } else {
                  const err = {
                    Message: this.commonBindingService.getLabel(
                      'msg_video_details_fetch_error'
                    )
                  };
                  this.handleRequestError(err);
                }
              },
              (error) => {
                const err = {
                  Message: this.commonBindingService.getLabel(
                    'msg_video_details_fetch_error'
                  )
                };
                this.handleRequestError(err);
              }
            );
        }
    }

    handleFetchMuxSuccessRequest(metaData: any, callback: any) {
        this.uploadReviewVideoMetaData = metaData;

        if (this.uploadReviewVideoMetaData.status !== 'ready') {
            this.loaderService.show('page-center');
            this.fetchingVideoAPI(callback, 3000);
            return;
        }

        callback();
    }

    contactInfoDialogSubscriber() {
      this.$contactInfoSub =
        this.pitchCardsModalsWrapperService.showContactInfoDialog.subscribe(
          (value) => {
            this.showContactInfoDialog = value;

            if (value) {
              this.componentMainVariablesInit();
            }

            this.userName = this.currentPitchCard?.businessName
              ? this.currentPitchCard.businessName
              : this.currentPitchCard?.title
                ? this.currentPitchCard.title
                : '';
          }
        );
    }

    signUpCommonDialogSubscriber() {
      this.$signUpCommonSub =
        this.pitchCardsModalsWrapperService.showSignUpCommonDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showSignUpCommonDialog = value;
            }
          }
        );
    }

    showSignUpDialogSubscriber() {
      this.$signUpSub =
        this.pitchCardsModalsWrapperService.showSignUpDialog.subscribe(
          (value) => {
            if (
              this.pitchCardsModalsWrapperService.uniqueId ===
              this.uniqueId
            ) {
              this.showSignUpDialog = value;
            }
          }
        );
    }

    onContactInfoClose() {
      this.$contactBusinessSub = this.businessService
        .contactBusiness([this.currentPitchCard.id])
        .subscribe(
          (result) => {
            if (result.data) {
              this.pitchCardsModalsWrapperService.disableContactInfoDialog();
              this.handleRequestSuccess(
                'The request was successfull'
              );
            }
          },
          (error) => {
            this.pitchCardsModalsWrapperService.disableContactInfoDialog();
            this.handleRequestError(error);
          }
        );
    }

    unsubscriber() {
        this.$moreInfoSub?.unsubscribe();
        this.$shareSub?.unsubscribe();
        this.$savemobileSub?.unsubscribe();
        this.$contactSub?.unsubscribe();
        this.$doneSub?.unsubscribe();
        this.$photosSub?.unsubscribe();
        this.$resumeSub?.unsubscribe();
        this.$getAllPocketsSub?.unsubscribe();
        this.$addBusinessToPocketSub?.unsubscribe();
        this.$videoPlayerSub?.unsubscribe();
        this.$videoReviewSub?.unsubscribe();
        this.$uploadVideoReviewSub?.unsubscribe();
        this.$contactInfoSub?.unsubscribe();
        this.$signUpSub?.unsubscribe();
        this.$contactBusinessSub?.unsubscribe();
        this.$applyJobNowSub?.unsubscribe();
        this.$jobRequirementsSub?.unsubscribe();
        this.$allModals?.unsubscribe();
    }

    handleStopVideo(stopTime) {
        if (stopTime <= 15) {
            this.watchedVideoAnalytics(AnalyticsOptionsEnum.Watched0Plus);
        }
        if (stopTime <= 30 && stopTime > 15) {
            this.watchedVideoAnalytics(AnalyticsOptionsEnum.Watched15Plus);
        }
        if (stopTime <= 45 && stopTime > 30) {
            this.watchedVideoAnalytics(AnalyticsOptionsEnum.Watched30Plus);
        }
        if (stopTime > 45) {
            this.watchedVideoAnalytics(AnalyticsOptionsEnum.Watched45Plus);
        }
    }

    watchedVideoAnalytics(analyticsId) {
      this.businessService
        .shareSocialMediaAnalytics(
          this.currentPitchCard.id ? [this.currentPitchCard.id] : [],
          analyticsId
        )
        .subscribe(() => {
        });
    }

    handleAcceptPositionRequirements() {
        this.pitchCardsModalsWrapperService.showApplyJobNowDialog.next(true);
        this.showJobRequirementsDialog = false;
    }

    setWorkTypesList() {
        this.workTypesList = '';
        if (this.workTypes?.length) {
            this.workTypes.map((type, i) => {
              this.workTypesList +=
                i < this.workTypes.length - 1
                  ? type.name + ', '
                  : type.name;
            });
        }
    }

    getLocation() {
        if (this.isJobCard) {
          this.locationAddress = this.businessService.getLocation(
            this.currentPitchCard
          );
        }
    }

    calculateCompensationDescription() {
        if (this.isJobCard) {
          this.compensationDescription = this.currentPitchCard
            ? this.businessService.calculateCompensationDescription(
              this.currentPitchCard
            )
            : '';
          this.compensationDescription =
            this.compensationDescription.trim() !== '' &&
            this.compensationDescription.trim() !== '-'
              ? this.compensationDescription
              : '';
        }
    }

  hideRequirements() {
    this.acceptPositionRequirements = false;
    this.showJobRequirementsDialog = false;
  }

  onContactModalHide(e?) {
    this.showContactMeDialog = false;
    this.pitchCardsModalsWrapperService.showContactMeDialog.next(false);
  }

  onContactModalSubmit({data}) {
    this.userCommonService.contactSales(data).subscribe(
      (result) => {
        this.showContactMeDialog = false;
        this.pitchCardsModalsWrapperService.showContactMeDialog.next(
          false
        );
        this.showDoneDialog = true;
      },
      (err) => {
        this.uiService.errorMessage(err.Field);
      }
    );
  }

  onClickDoneDialog() {
    this.showDoneDialog = false;
    this.pitchCardsModalsWrapperService.showContactMeDialog.next(false);
  }

  getVisibleSlideNumbers() {
    if (window.innerWidth >= 1069) {
      return 4;
        } else if (window.innerWidth >= 820 && window.innerWidth < 1069) {
            return 3;
        } else if (window.innerWidth >= 620 && window.innerWidth < 820) {
            return 2;
        } else {
            return 1;
        }
    }

    openInNewTab(link) {
        this.pitchCardModalsWrapperService.openLinkInNewTab(link);
    }
}
