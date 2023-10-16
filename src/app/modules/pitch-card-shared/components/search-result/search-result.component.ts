import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { SwiperComponent, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import {
  isPlatformBrowser,
  isPlatformServer,
  ViewportScroller
} from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';

import { SearchResultThumbnailComponent } from '../search-result-thumbnail/search-result-thumbnail.component';

import { UserCommonService } from '../../../shared/services/user-common.service';
import { UiService } from '../../../shared/services/ui.service';
import { SeoService } from '../../../shared/services/seo-service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { StorageService } from '../../../shared/services/storage.service';
import { BusinessService } from '../../../business/services/business.service';

import { AppSettings } from '../../../shared/app.settings';
import { SeoTagsModel } from '../../../shared/models/seo-tags.model';
import { environment } from '../../../../../environments/environment';
import {
  BusinessPitch,
  BusinessPitchWrapped
} from '../../../business/models/business-pitch.model';
import { OverlayPanel } from 'primeng/overlaypanel';
import {
  FilterState,
  SearchParams,
  SearchService,
  SearchTypes
} from './search.service';
import { PitchCardModalsWrapperService } from '../../services/pitchcard-modals-wrapper.service';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { PixelService } from 'ngx-pixel';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { UniqueComponentId } from 'primeng/utils';

declare const Hls: any;
const FullHD = 1920;

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit, OnDestroy {
  @Input() playFirstVideo = true;

  @Input() multipleUsage = false;
  @Input() uniqueId: string = UniqueComponentId();
  @Input() scaleFactor = 1.0;

  showWatchVideoDialog = false;

  businessDetailsList: BusinessPitchWrapped[];
  limit = 10;
  offset = 0;
  searchText: string = '';
  totalRecords;
  @ViewChild('businessSwiper', {static: false}) swiper: SwiperComponent;
  @ViewChildren(SearchResultThumbnailComponent)
  slides: QueryList<SearchResultThumbnailComponent>;
  centreSlide: SearchResultThumbnailComponent;
  centreSlideIdx = 0;
  currentIdx = 1;
  videoUrl;
  showVideoUploader = false;
  videoThumbSrc = 'assets/images/video.png';
  coverThumbDefaultSrc = 'assets/images/image.png';
  hls;
  isBrowser;
  isVideoPaused = true;
  @ViewChild('videoPlayer', {static: false}) videoPlayer: ElementRef;
  @ViewChild('reviewVideoPlayer', {static: false})
  reviewVideoPlayer: ElementRef;
  @ViewChild('searchCounter', {static: false}) searchCounter: ElementRef;
  @ViewChild('filterElement', {static: false}) filterElement: ElementRef;
  @ViewChild('searchInput', {static: false}) searchInput: ElementRef;
  @ViewChild('searchBlock', {static: false}) searchBlock: ElementRef;
  @ViewChild('businessCard') businessCard: SearchResultThumbnailComponent;
  @ViewChild('filterPanel', {static: true}) filterPanel: OverlayPanel;
  @ViewChild('filterBlock') filterBlock: ElementRef;

  contactBusinessId;
  businessName;
  businessId;

  videoLoaded = false;
  businessListLoaded = false;
  businessLazyLoaded = true;
  suggestedBusinesses = [];
  selectedBusiness;
  suggestedCities = [];
  selectedCity;
  alias = '';
  businessDetails: BusinessPitch;
  currentBusiness: BusinessPitch;

  params;
  watchVideoReviewBusinessId;
  shareUrl = '';
  isPlatformServer;
  service;
  mobileMode: boolean = this.deviceService.isMobile();
  isDesktop: boolean = this.deviceService.isDesktop();
  isSearchPage = window.location.pathname.includes('search');

  searchId: string;
  slideChangeEnabled = true;
  aliasLoaded = false;
  defaultWidth = 360;
  businessDetailsLoaded = false;
  dontShowLoaderFirstTime = false;
  isShowBlur = null;
  isPanelShow = false;

  isContactMeButtonClicked = false;

  $hideSignUpPopupIfLoginPopupOpens: Subscription;
  $showSignInPopup: Subscription;
  $hideCommonSigninDialog: Subscription;
  $onSearch: Subscription;
  $onRouteChanges = new Subscription();
  $contactSub = new Subscription();

  searchTypes = SearchTypes;
  mainSearchType: number = SearchTypes.Jobs;
  FilterStates = FilterState;
  responsiveOptions = [
    {
      breakpoint: '992px',
      numVisible: this.mobileMode ? 1.5 : this.isDesktop ? 3 : 3.5,
      numScroll: this.mobileMode ? 1.5 : 3
    },
    {
      breakpoint: '670px',
      numVisible: 1.5,
      numScroll: 2
    }
  ];

  constructor(
    private pixel: PixelService,
    private businessService: BusinessService,
    private userCommonService: UserCommonService,
    private commonBindingService: CommonBindingDataService,
    private router: Router,
    private uiService: UiService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private viewportScroller: ViewportScroller,
    private deviceService: DeviceDetectorService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private cdr: ChangeDetectorRef,
    public searchService: SearchService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.pixel.track('PageView', {
      content_name: 'Welcome/Landing'
    });
    this.isBrowser = isPlatformBrowser(platformId);
    this.isPlatformServer = isPlatformServer(platformId);

    this.mobileMode = this.deviceService.isMobile();
    this.isDesktop = this.deviceService.isDesktop();
    // this.onResize = this.onResize.bind(this);
    if (this.searchCounter && this.mobileMode && this.isSearchPage) {
      document.getElementsByTagName('html')[0].style.scrollBehavior =
        'smooth';
      setTimeout(() => {
        this.viewportScroller.scrollToPosition([
          0,
          this.searchCounter.nativeElement?.getBoundingClientRect()
            .top -
          document.getElementById('header-container').offsetHeight
        ]);
      }, 1000);
    }

    this.$onSearch = this.userCommonService.onSearch.subscribe(() => {
      this.selectedCity = {};
      this.selectedBusiness = {};
      this.pitch(true);
    });

    this.populateFromStorage();
  }

  config3: SwiperConfigInterface;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.slideChangeEnabled && !this.showWatchVideoDialog) {
      if (event.keyCode === 39) {
        this.swiper.directiveRef.nextSlide(this.config3.speed);
        this.centreSlide.toggleContactMenu(null);
        this.isContactMeButtonClicked = false;
      }
      if (event.keyCode === 37) {
        this.swiper.directiveRef.prevSlide(this.config3.speed);
        this.centreSlide.toggleContactMenu(null);
        this.isContactMeButtonClicked = false;
      }
      if (
        event.keyCode === 13 &&
        !this.userCommonService.pendingMethod &&
        !this.isShowRestrictForResume
      ) {
        this.pitch(true);
      }
    }
  }

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const classes = event.target?.classList;
    const parentNodes = this.commonBindingService.getParentNodes(
      classes,
      'contact-menu-container'
    );

    if (
      !parentNodes.length &&
      !event.target.classList.contains('contact-menu-button') &&
      this.centreSlide
    ) {
      this.centreSlide.toggleContactMenu(null);
    }

    try {
      if (
        this.filterPanel?.el?.nativeElement !== event.target &&
        !this.filterPanel?.target?.nativeElement?.contains(
          event.target
        ) &&
        !this.filterBlock?.nativeElement?.contains(event.target)
      ) {
        this.filterPanel.hide();
      }
    } catch (ex) {
      console.log('Error while window click listener');
    }
  }

  onResize() {
    const carouselStyle = document.createElement('style');
    carouselStyle.type = 'text/css';
    document.body.appendChild(carouselStyle);

    const swiperEl = this.swiper?.swiperSlides.nativeElement
      ? this.swiper.swiperSlides.nativeElement
      : document.getElementById('search-swiper');
    if (swiperEl) {
      const width = Number(
        (<any>(
          swiperEl.getElementsByClassName('p-carousel-item')[0]
        )).style.width.split('px')[0]
      );

      const zoom = this.multipleUsage
        ? (width / this.defaultWidth) * this.scaleFactor
        : width / this.defaultWidth;
      const innerHTML = this.multipleUsage
        ? `#search-swiper-${this.uniqueId} .swiper-container .p-carousel-item app-search-result-thumbnail {
        --scale-factor: ${zoom} !important}`
        : `#search-swiper .swiper-container .p-carousel-item app-search-result-thumbnail {
        --scale-factor: ${zoom} !important}`;

      carouselStyle.innerHTML = innerHTML;

      swiperEl.style.minHeight = swiperEl.clientHeight + 'px';
    }
  }

  resizeCard(id) {
    const carouselStyle = document.createElement('style');
    carouselStyle.type = 'text/css';
    document.body.appendChild(carouselStyle);
    const width = document.getElementById(id).clientWidth;

    if (width < this.defaultWidth) {
      let zoom;
      if (this.mobileMode && this.isSearchPage) {
        zoom = (width / this.defaultWidth) * 0.7;
      } else {
        zoom = width / this.defaultWidth;
      }
      if (this.multipleUsage) {
        zoom = (width / this.defaultWidth) * this.scaleFactor;
      }
      const innerHTML = `
        #${id} app-search-result-thumbnail {
          --scale-factor: ${zoom} !important
        }`;

      carouselStyle.innerHTML = innerHTML;
    }
  }

  onInit() {
    const searchBox: HTMLInputElement = document.querySelector(
      'input[role=searchbox]'
    );
    if (!this.mobileMode && this.deviceService.browser !== 'Safari') {
      window.addEventListener('click', () =>
        searchBox.setSelectionRange(0, searchBox.value.length)
      );
    }
    window.addEventListener('resize', this.onResize);
    this.onResize();

    this.swiper?.directiveRef.setIndex(0);
    this.currentIdx = 1;
    this.getUser();
  }

  ngOnInit() {
    this.mainSearchType = this.searchService.getSearchType();
    this.route.params.subscribe((params) => {
      this.dontShowLoaderFirstTime = this.router.url === '/welcome';
      this.alias = params.alias;
      if (this.alias) {
        this.cardInitSetup();
      } else {
        this.initSetup();
      }
      if (this.isBrowser) {
        this.makeVideoFullScreenOnRotate();
      }
    });

    this.onRouteChange();
  }

  populateFromStorage() {
    const isPageWithSearch = this.router.url.includes('/search');
    if (
      this.storageService.getSession(AppSettings.FILTER_FORM) &&
      isPageWithSearch
    ) {
      this.searchService.filterForm = this.storageService.getSession(
        AppSettings.FILTER_FORM
      );
    }
    if (
      this.storageService.getSession(AppSettings.COMMON_FILTERS) &&
      isPageWithSearch
    ) {
      this.searchService.commonFormControls =
        this.storageService.getSession(AppSettings.COMMON_FILTERS);
    }
    if (isPageWithSearch) {
      this.searchService.hasFilters = !this.searchService.isEmptyForm(
        this.searchService.getFilterForm(this.mainSearchType)?.value
      );
      const filterState = this.storageService.getSession(
        AppSettings.FILTER_STATE
      );
      this.searchService.currentFilterState = filterState
        ? filterState
        : FilterState.None;
    }
  }

  onRouteChange() {
    this.$onRouteChanges.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.mainSearchType = this.searchService.getSearchType();
          if (event.url.includes('types=')) {
            if (this.searchService.filterForm?.numberOfReviews) {
              this.searchService.filterForm.numberOfReviews = '';
              this.storageService.setSession(
                AppSettings.FILTER_FORM,
                this.searchService.filterForm
              );
            }
            this.searchService.hasFilters =
              !this.searchService.isEmptyForm(
                this.searchService.getFilterForm(
                  this.mainSearchType
                )?.value
              );
          }
          if (this.mainSearchType !== null) {
            this.selectedBusiness = {
              displayName: ''
            };
            this.filterPanel.hide();
            this.selectedCity = {};
            if (
              (this.searchService.filterForm ||
                this.searchService.commonFormControls) &&
              this.searchService.currentFilterState ===
              FilterState.Applied &&
              !this.isShowRestrictForResume
            ) {
              this.getAppliedFilters(
                this.searchService.filterForm &&
                Object.keys(this.searchService.filterForm)
                  .length
                  ? this.searchService.filterForm
                  : this.searchService.commonFormControls
              );
            } else {
              this.pitch();
            }
            setTimeout(() => {
              this.searchService.filterForm = {};
            }, 500);
          }
        }
      })
    );
  }

  cardInitSetup() {
    this.userCommonService
      .getBusinessPitchModelByAlias(this.alias)
      .subscribe(
        (companyCardData) => {
          this.businessDetails = companyCardData.data;
          this.businessDetailsLoaded = true;
          if (this.isBrowser) {
            this.resizeCard('card-alias');
          }
          this.aliasLoaded = true;
          if (this.isPlatformServer) {
            this.businessService
              .getBusinessSeoTags(this.businessDetails.id)
              .subscribe((result) => {
                if (result && result.data) {
                  const seotagmodel = new SeoTagsModel();
                  seotagmodel.image = result.data.image;
                  seotagmodel.imageTW = result.data.imageTW;
                  seotagmodel.pageTitle = result.data.title;
                  seotagmodel.description =
                    result.data.description;
                  seotagmodel.width = result.data.imageWidth;
                  seotagmodel.heigth =
                    result.data.imageHeigth;
                  seotagmodel.url = encodeURI(
                    `${environment.appBaseUrl}/card/${this.alias}`
                  );
                  this.seoService.generateTags(seotagmodel);
                }
              });
          } else {
            this.seoService.setTitle(
              this.businessDetails.businessName
            );
          }
          if (this.isBrowser) {
            setTimeout(() => {
              this.businessCard.loadVideo();
            }, 50);
          }
        },
        (err) => {
          this.aliasLoaded = true;
        }
      );
  }

  initSetup() {
    // added this for facebook load page after share
    this.contactBusinessId = this.route.snapshot.queryParamMap.get('bizId');
    let serviceQuery = this.route.snapshot.queryParamMap.get('service');

    this.setConfig();
    if (this.route.snapshot.queryParams.service) {
      this.selectedBusiness = {
        displayName: this.route.snapshot.queryParams.service
      };
    }
    if (this.route.snapshot.queryParams.zip) {
      this.selectedCity = {
        cityName: this.route.snapshot.queryParams.zip
      };
    }
    if (this.route.snapshot.queryParams.city) {
      this.selectedCity = {
        id: this.route.snapshot.queryParams.city,
        cityName: ''
      };
      this.getCityById(
        this.route.snapshot.queryParams.city,
        (selectedCity) => {
          this.selectedCity = selectedCity;
        }
      );
    }

    if (serviceQuery) {
      serviceQuery = serviceQuery.replace(/%25/g, '%');
      serviceQuery = decodeURIComponent(serviceQuery);
      this.selectedBusiness = {
        name: serviceQuery
      };
      this.service = serviceQuery;
    }

    if (this.contactBusinessId && this.isPlatformServer) {
      // if contact id found then calls on when we share link
      this.bindFacebookTags();
    }

    if (this.isBrowser) {
      if (
        this.searchService.filterForm &&
        this.searchService.currentFilterState === FilterState.Applied &&
        !this.isShowRestrictForResume
      ) {
        this.getAppliedFilters(this.searchService.filterForm);
      } else {
        this.pitch();
        document.body.click();
      }
    }
  }

  contactMeSubscriber() {
    this.$contactSub =
      this.pitchCardModalsWrapperService.showContactMeDialog.subscribe(
        (value) => {
          this.slideChangeEnabled = !value;
        }
      );
  }

  getCityById(id, callback) {
    this.userCommonService.getCityById(id).subscribe((result) => {
      callback(result.data);
    });
  }

  getUser() {
    if (this.isShowRestrictForResume) {
      this.contactMeSubscriber();
      return (this.isShowBlur = true);
    }
    this.isShowBlur = false;
  }

  setConfig() {
    const allowTouchMove =
      this.deviceService.isMobile() || this.deviceService.isTablet();
    this.config3 = {
      direction: 'horizontal',
      slidesPerView: 3,
      effect: 'coverflow',
      grabCursor: false,
      centeredSlides: true,
      keyboard: false,
      mousewheel: false,
      scrollbar: false,
      coverflowEffect: {
        rotate: 0,
        depth: 400,
        modifier: 1,
        slideShadows: false
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      preventClicks: false,
      preventClicksPropagation: false,
      breakpoints: {
        992: {
          slidesPerView: 2,
          spaceBetween: 0,
          coverflowEffect: {
            depth: 400
          }
        },
        670: {
          longSwipes: false,
          shortSwipes: true,
          slidesPerView: this.multipleUsage
            ? this.calcMobileSlidesPerView()
            : 1.4,
          spaceBetween: 16,
          coverflowEffect: {
            depth: 300
          }
        }
      },
      autoplay: false,
      speed: 500,
      loop: true,
      initialSlide: 0,
      observer: true,
      longSwipes: false,
      shortSwipes: true,
      followFinger: false,
      preventInteractionOnTransition: true,
      allowTouchMove: allowTouchMove
    };
  }

  onContainerSizeChanged(event) {
    const {containerSize} = event;
    setTimeout(() => {
      this.scaleFactor = containerSize / 360;
    }, 0);
    console.log('Scale Factor', this.scaleFactor);
  }

  calcMobileSlidesPerView() {
    const percent = (
      (window.innerWidth / window.innerHeight) *
      100
    ).toFixed(3);
    const optimalSlides = 1.6;
    const optimalRatio = 56;
    if (Number(percent) <= 56) {
      return (
        optimalSlides -
        ((optimalSlides * (window.innerHeight / window.innerWidth)) /
          100) *
        (optimalRatio - Number(percent))
      );
    } else {
      return (
        optimalSlides +
        (optimalSlides / 100) * (optimalRatio - Number(percent))
      );
    }
  }

  getAppliedFilters(event) {
    this.businessListLoaded = false;
    this.selectedCity = event.location ? event.location : '';
    if (this.mainSearchType === SearchTypes.Businesses) {
      const filters = {
        businessService: this.checkObjectOnWrongValues(
          this.populateBusinessFilterObject(event)
        )
      };
      this.searchWIthFilters(true, filters);
    }
    if (this.mainSearchType === SearchTypes.Resumes) {
      const filters = {
        resume: this.checkObjectOnWrongValues(
          this.populateResumeFilterObject(event)
        )
      };
      this.searchWIthFilters(true, filters);
    }
    if (this.mainSearchType === SearchTypes.Jobs) {
      const filters = {
        job: this.checkObjectOnWrongValues(
          this.populateJobFilterObject(event)
        )
      };
      this.searchWIthFilters(true, filters);
    }
    if (this.mainSearchType === SearchTypes.Nonprofit) {
      const filters = {
        nonprofit: this.checkObjectOnWrongValues(
          this.populateNonprofitFilterObject(event)
        )
      };
      this.searchWIthFilters(true, filters);
    }
    this.getUser();
    this.filterPanel.hide();
    this.currentIdx = 1;
    setTimeout(() => {
      this.businessListLoaded = true;
    }, 1000);
  }

  populateBusinessFilterObject(data) {
    return {
      minNumberReviews:
        data.numberOfReviews || data.numberOfReviews === 0
          ? data.numberOfReviews
          : null
    };
  }

  populateResumeFilterObject(data) {
    const requestObg = {
      educationLevel: data?.educationLevel?.value?.id
        ? data.educationLevel.value.id
        : data?.educationLevel?.value?.id === 0
          ? 0
          : null,
      workTypesIds: data.workType?.length
        ? data.workType.map((elem) => elem.id)
        : null,
      collegeUniversityId: [],
      servedInTheMilitary: data.hasMilitaryService
    };
    if (data.educationalInstitutions?.length) {
      data.educationalInstitutions.map((item) => {
        requestObg.collegeUniversityId.push(item.id);
      });
    }

    return requestObg;
  }

  populateJobFilterObject(data) {
    const requestObg = {
      radius: data.radius || data.radius === 0 ? data.radius : null,
      workTypesIds: data.employmentType?.map((elem) => elem.id) || [],
      compensationType: data.compensationTypes?.value?.id || null,
      industries: data.industries?.map((elem) => elem.id) || [],
      minCompensationAmount:
        data.minCompensationAmount || data.minCompensationAmount === 0
          ? data.minCompensationAmount
          : null,
      maxCompensationAmount:
        data.maxCompensationAmount || data.maxCompensationAmount === 0
          ? data.maxCompensationAmount
          : null,
      benefits: data.benefits?.map((elem) => elem.id) || [],
      isRemote: data.isRemote
    };
    if (data.compensationTypes?.length) {
      data.compensationTypes.map((item) => {
        requestObg.compensationType.push(item.id);
      });
    }
    if (data.industries?.length) {
      data.industries.map((item) => {
        requestObg.industries.push(item.id);
      });
    }
    if (data.benefits?.length) {
      data.benefits.map((item) => {
        requestObg.benefits.push(item.id);
      });
    }

    return requestObg;
  }

  populateNonprofitFilterObject(data) {
    return {
      minNumberReviews:
        data.numberOfReviews || data.numberOfReviews === 0
          ? data.numberOfReviews
          : null
    };
  }

  checkObjectOnWrongValues(obj) {
    Object.keys(obj).map((k) => {
      if (obj[k] === null || obj[k]?.length === 0) {
        delete obj[k];
      }
    });
    return obj;
  }

  searchWIthFilters(playFirstVideo = this.playFirstVideo, searchFilters?) {
    this.params = this.getSearchParams(
      AppSettings.LAZY_LOAD_COUNT + 1,
      AppSettings.LAZY_LOAD_COUNT,
      0,
      0,
      ''
    );
    this.params.city = this.selectedCity?.id ? this.selectedCity.id : '';
    this.loadFilterBusinesses(this.params, searchFilters, (data) => {
      this.handleSearchResult(data, playFirstVideo);
    });
  }

  pitch(playFirstVideo = this.playFirstVideo) {
    this.businessListLoaded = false;
    this.currentIdx = 1;
    this.getUser();
    if (this.alias) {
      this.alias = null;
      const isCitySelected = typeof this.selectedCity === 'object',
        isServiceSelected = typeof this.selectedBusiness === 'object';
      const params = {
        service: '',
        city: isCitySelected ? this.selectedCity.id : undefined,
        zip: isCitySelected ? undefined : this.selectedCity
      };
      if (isServiceSelected) {
        params.service = this.selectedBusiness.displayName;
      } else if (
        this.selectedBusiness &&
        this.selectedBusiness.length > 2 &&
        this.suggestedBusinesses.length
      ) {
        this.selectedBusiness = this.suggestedBusinesses[0];
        params.service = this.selectedBusiness.displayName;
      } else {
        params.service = this.selectedBusiness || '';
      }

      if (!params.city && !params.zip && !params.service) {
        params.service = '';
      }
      this.router.navigate(['/search'], {
        queryParams: params
      });
      setTimeout(() => {
        this.businessListLoaded = true;
      }, 1000);
    } else {
      this.currentIdx = 1;
      this.businessListLoaded = false;
      this.businessDetailsList = [];
      const businessId = this.route.snapshot.queryParamMap.get('id');
      if (businessId && !this.selectedBusiness) {
        this.searchByBusinessIdWithFilters(businessId);
      } else {
        this.searchSelectedDemoDataWithFilters(playFirstVideo);
      }
    }
  }

  searchByBusinessId(businessId) {
    const params = {
      searchText: businessId,
      city: '',
      zip: '',
      offsetForward: 0,
      offsetBackward: 0,
      forward: AppSettings.LAZY_LOAD_COUNT + 1,
      backward: AppSettings.LAZY_LOAD_COUNT,
      searchId: ''
    };
    this.loadFilterBusinesses(
      params,
      this.getFiltersObject(this.searchService.hasFilters),
      (data) => {
        if (data) {
          this.selectedBusiness = {
            displayName: data.forwardRecords[0].businessName
          };
        }
        this.handleSearchResult(data);
      }
    );
  }

  searchByBusinessIdWithFilters(businessId) {
    const params = {
      searchText: businessId,
      city: '',
      zip: '',
      offsetForward: 0,
      offsetBackward: 0,
      forward: AppSettings.LAZY_LOAD_COUNT + 1,
      backward: AppSettings.LAZY_LOAD_COUNT,
      searchId: '',
      searchType: this.mainSearchType
    };
    const filters = this.getFiltersObject(this.searchService.hasFilters);
    this.loadFilterBusinesses(params, filters, (data) => {
      if (data) {
        this.selectedBusiness = {
          displayName: data.forwardRecords[0].businessName
        };
        console.log(this.selectedBusiness);
      }
      this.handleSearchResult(data);
    });
  }

  searchSelectedDemoData(playFirstVideo = this.playFirstVideo) {
    this.params = this.getSearchParams(
      AppSettings.LAZY_LOAD_COUNT + 1,
      AppSettings.LAZY_LOAD_COUNT,
      0,
      0
    );
    this.loadFilterBusinesses(
      this.params,
      this.getFiltersObject(),
      (data) => {
        this.handleSearchResult(data, playFirstVideo);
      }
    );
  }

  searchSelectedDemoDataWithFilters(playFirstVideo = this.playFirstVideo) {
    const filters = this.getFiltersObject(this.searchService.hasFilters);
    this.params = this.getSearchParams(
      AppSettings.LAZY_LOAD_COUNT + 1,
      AppSettings.LAZY_LOAD_COUNT,
      0,
      0
    );
    this.loadFilterBusinesses(this.params, filters, (data) => {
      this.handleSearchResult(data, playFirstVideo);
    });
  }

  handleSearchResult(data, playFirstVideo = this.playFirstVideo) {
    if (data && data.forwardRecords) {
      this.totalRecords = data.totalRecords;
      this.searchId = data?.searchId ? data.searchId.toString() : '';
      this.config3.loop = data.totalRecords > 2;

      if (this.route.snapshot.queryParamMap.get('bizId')) {
        const bizIdinUrl =
          this.route.snapshot.queryParamMap.get('bizId');
        if (bizIdinUrl) {
          data.forwardRecords = data.forwardRecords.filter(
            (x) => x.id === this.contactBusinessId
          );
          this.totalRecords = data.forwardRecords.length;
        }
      }

      this.businessListLoaded = true;
      if (data.forwardRecords.length) {
        // tslint:disable-next-line: max-line-length
        this.businessDetailsList = Array.from({
          length: this.totalRecords
        }).map(
          (x, i) =>
            <BusinessPitchWrapped>{index: i, business: undefined}
        );
        this.setSlides(data.forwardRecords, data.backwardRecords);
        if (playFirstVideo) {
          if (this.isBrowser) {
            this.pitchMore(0, true, true);
            setTimeout(() => {
              this.playInlineVideo(0);
            }, 50);
          }
        }
      } else {
        this.businessDetailsList = [];
      }
    }
  }

  getUnloadedSlidesData(index, forward, backward) {
    let forwardCount = 0;
    let backwardCount = 0;
    let forwardIndex = null;
    let backwardIndex = null;

    if (forward) {
      for (let i = index; i < this.businessDetailsList.length; i++) {
        if (
          this.businessDetailsList[i] !== undefined &&
          this.businessDetailsList[i].business === undefined
        ) {
          forwardCount++;
          if (forwardIndex == null) {
            forwardIndex = i;
          }
        }
      }
    }

    if (backward) {
      for (let i = this.businessDetailsList.length - 1; i >= 0; i--) {
        if (
          this.businessDetailsList[i] !== undefined &&
          this.businessDetailsList[i].business === undefined
        ) {
          backwardCount++;
          if (backwardIndex == null) {
            backwardIndex = i;
          }
        }
      }
    }

    return {
      forwardCount,
      backwardCount,
      forwardIndex,
      backwardIndex
    };
  }

  disableSlideChangeIfNeeded(index, forward, backward) {
    const data = this.getUnloadedSlidesData(index, true, true);
    if (forward && data.forwardIndex && index + 3 >= data.forwardIndex) {
      this.loaderService.show('page-center');
      this.slideChangeEnabled = false;
    } else if (backward && data.backwardIndex) {
      const indexLimit =
        index - 3 >= 0
          ? index - 3
          : this.businessDetailsList.length - 1 + (index - 3);

      if (
        data.backwardIndex >= indexLimit &&
        (!data.forwardIndex || data.forwardIndex < indexLimit)
      ) {
        this.loaderService.show('page-center');
        this.slideChangeEnabled = false;
      } else {
        this.slideChangeEnabled = true;
        this.loaderService.hide();
      }
    } else {
      this.slideChangeEnabled = true;
      this.loaderService.hide();
    }
  }

  needLoadMoreCountAndOffset(index, forward, backward) {
    const data = this.getUnloadedSlidesData(index, forward, backward);

    const offsetBackward =
      this.businessDetailsList.length - 1 - data.backwardIndex;

    return {
      forwardCount:
        data.forwardCount > AppSettings.LAZY_LOAD_COUNT
          ? AppSettings.LAZY_LOAD_COUNT
          : data.forwardCount,
      backWardCount:
        data.backwardCount > AppSettings.LAZY_LOAD_COUNT
          ? AppSettings.LAZY_LOAD_COUNT
          : data.backwardCount,
      offsetForward: data.forwardIndex || 0,
      offsetBackward: data.backwardCount > 0 ? offsetBackward : 0
    };
  }

  pitchMore(index, forward, backward) {
    const needLoadMore = this.needLoadMoreCountAndOffset(
      index,
      forward,
      backward
    );
    if (
      this.businessLazyLoaded &&
      (needLoadMore.backWardCount || needLoadMore.forwardCount)
    ) {
      this.businessLazyLoaded = false;
      this.params = this.getSearchParams(
        needLoadMore.forwardCount,
        needLoadMore.backWardCount,
        needLoadMore.offsetForward,
        needLoadMore.offsetBackward,
        this.searchId.toString()
      );
      this.businessService
        .pitchFilterSearch(
          this.params,
          this.getFiltersObject(this.searchService.hasFilters),
          null
        )
        .subscribe(
          (result) => {
            if (result.data) {
              this.setSlides(
                result.data.forwardRecords,
                result.data.backwardRecords
              );
              this.businessLazyLoaded = true;
              this.slideChangeEnabled = true;
              this.loaderService.hide();
            }
          },
          (err) => {
            this.businessLazyLoaded = true;
            this.uiService.errorMessage(err.message);
          }
        );
    }
  }

  playInlineVideo(idx = 0) {
    this.centreSlide = this.slides.find((slide, index) => {
      return idx === index;
    });

    if (this.centreSlide) {
      this.centreSlide.initVideo = true;
      if (this.centreSlide?.businessDetails?.videoFileUrl) {
        this.centreSlide?.loadVideo({muted: true});
      } else {
        this.centreSlide.initVideo = false;
      }
      this.centreSlide?.showCardRestrict();
    }
  }

  loadFilterBusinesses(params, body, callback) {
    this.businessService
      .pitchFilterSearch(
        params,
        body,
        this.dontShowLoaderFirstTime ? null : 'page-center'
      )
      .subscribe((result) => {
        this.dontShowLoaderFirstTime = false;
        callback(result.data);
      });
  }

  setSlides(forwardRecords, backwardRecords?) {
    forwardRecords.forEach((el) => {
      if (el && !el.videoCoverImageThumbnailUrl) {
        el.videoCoverImageThumbnailUrl = 'assets/images/comingsoon.png';
      }

      if (el && !el.businessLogoThumbnailUrl) {
        el.businessLogoThumbnailUrl =
          'assets/images/card-business-logo.svg';
      }
      this.businessDetailsList[el.index].business = el;
    });

    backwardRecords.forEach((el) => {
      if (el && !el.videoCoverImageThumbnailUrl) {
        el.videoCoverImageThumbnailUrl = 'assets/images/comingsoon.png';
      }

      if (el && !el.businessLogoThumbnailUrl) {
        el.businessLogoThumbnailUrl =
          'assets/images/card-business-logo.svg';
      }

      this.businessDetailsList[el.index].business = el;
    });
  }

  indexChange(event) {
    const {currentIndex, prevIndex, currentOffset} = event;

    const forward = prevIndex > currentIndex;
    const backward = prevIndex < currentIndex;

    this.currentIdx = currentIndex + 1;

    if (this.centreSlide) {
      this.centreSlide.toggleContactMenu(null);
      this.getUser();
    }

    this.disableSlideChangeIfNeeded(currentIndex, forward, backward);
    this.pitchMore(currentIndex, forward, backward);
    this.centreSlide.isChangedMuteMode = false;
    this.stopVideoPlaying();

    setTimeout(() => {
      this.playInlineVideo(currentOffset);
    }, 50);
  }

  setSwiperLoop(event) {
    if (this.config3.loop) {
      if (
        (this.currentIdx === 1 &&
          event === this.businessDetailsList.length - 1) ||
        (this.currentIdx === this.businessDetailsList.length &&
          event === 0)
      ) {
        // Below code is to bind click event in case of first-last/last-first slide transition in loop
        setTimeout(() => {
          this.swiper.directiveRef.setIndex(event, 0, true);
        }, this.config3.speed);
      }
      this.currentIdx = event + 1;
    } else {
      if (this.centreSlideIdx === 0) {
        this.currentIdx = event === 0 ? 1 : event + 1;
      } else {
        this.currentIdx =
          event === 0 ? this.businessDetailsList.length : event;
      }
    }
  }

  getCurrentSlideByIndex(index) {
    return this.slides.find((slide, i) => {
      return i === index;
    });
  }

  stopVideoPlaying() {
    this.slides.forEach((x) => {
      x.stopVideo();
      x.hideCardRestrict();
    });
  }

  getSearchParams(
    forward: number,
    backward: number,
    offsetForward: number = 0,
    offsetBackward: number = 0,
    searchId = ''
  ) {
    const isCitySelected = !!(
        typeof this.selectedCity === 'object' &&
        Object.keys(this.selectedCity).length
      ),
      isServiceSelected = !!(
        typeof this.selectedBusiness === 'object' &&
        Object.keys(this.selectedBusiness).length
      );
    if (!this.selectedCity) {
      this.selectedCity = '';
    }
    const params: SearchParams = {
      searchText: '',
      city:
        isCitySelected && this.selectedCity?.id
          ? this.selectedCity.id
          : (!!(
          isNaN(this.selectedCity) &&
          Object.keys(this.selectedCity).length
        )
          ? this.selectedCity
          : '') || '',
      zip: isCitySelected
        ? this.selectedCity?.id && this.selectedCity?.zipCode
          ? this.selectedCity.zipCode
          : ''
        : (isNaN(this.selectedCity) ? '' : this.selectedCity) || '',
      offsetForward: offsetForward,
      offsetBackward: offsetBackward,
      forward: forward,
      backward: backward,
      searchId: searchId.toString(),
      searchType:
        this.mainSearchType !== null ? this.mainSearchType : null
    };

    if (isServiceSelected) {
      params.searchText = this.selectedBusiness.displayName;
    } else if (this.selectedBusiness && this.selectedBusiness.length > 0) {
      params.searchText = this.selectedBusiness || '';
    } else if (
      this.suggestedBusinesses.length &&
      params.searchText.length
    ) {
      this.selectedBusiness = this.suggestedBusinesses[0];
      params.searchText = this.selectedBusiness.displayName;
    }
    if (!params.city && !params.zip && !params.searchText) {
      this.selectedBusiness = {displayName: ''};
      params.searchText = this.selectedBusiness.displayName;
    }

    return params;
  }

  companyImages(event: any) {
    const {title, businessDetails} = event;
    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(businessDetails);
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  searchBusinesses(event) {
    this.businessService
      .searchBusinesses(event.query, this.mainSearchType)
      .subscribe((result: any[]) => {
        this.suggestedBusinesses =
          this.businessService.seperateBizSearch(result);
      });
  }

  searchCities(event) {
    this.businessService.searchCities(event.query).subscribe((result) => {
      this.suggestedCities = result;
    });
  }

  bindFacebookTags() {
    if (!this.contactBusinessId) {
      return;
    }

    this.businessService
      .getBusinessSeoTags(this.contactBusinessId)
      .subscribe((result) => {
        if (result && result.data) {
          const seotagmodel = new SeoTagsModel();
          seotagmodel.image = result.data.image;
          seotagmodel.imageTW = result.data.imageTW;
          seotagmodel.pageTitle = result.data.title;
          seotagmodel.description = result.data.description;
          seotagmodel.width = result.data.imageWidth;
          seotagmodel.heigth = result.data.imageHeigth;
          // tslint:disable-next-line: max-line-length
          console.log(
            'environment.appBaseUrl: ',
            environment.appBaseUrl
          );
          seotagmodel.url = encodeURI(
            `${
              environment.appBaseUrl
            }/search?service=${encodeURIComponent(
              this.service
            )}&bizId=${this.contactBusinessId}`
          );
          console.log('encodedURI: ', seotagmodel.url);
          this.seoService.generateTags(seotagmodel);
        }
      });
  }

  ngOnDestroy() {
    // window.removeEventListener('resize', this.onResize);
    if (this.$hideCommonSigninDialog) {
      this.$hideCommonSigninDialog.unsubscribe();
    }
    if (this.$onRouteChanges) {
      this.$onRouteChanges.unsubscribe();
    }
    if (!this.isShowBlur) {
      this.$contactSub?.unsubscribe();
    }
    this.$onSearch.unsubscribe();
  }

  makeVideoFullScreenOnRotate(isVideoPlayingInLandscape = false) {
    // make video playing in full screen for mobile
    // when on landscape mode
    const that = this;
    const videoElement = that.videoPlayer && that.videoPlayer.nativeElement;

    window.onorientationchange = function () {
      if (window.orientation === 90 || window.orientation === -90) {
        if (videoElement) {
          // if screen rotates it will play video in fullscreen
          videoElement.webkitEnterFullScreen();
        }
      }
    };

    // if video is already playing in landscape
    if (isVideoPlayingInLandscape) {
      if (window.orientation === 90 || window.orientation === -90) {
        if (videoElement) {
          // if screen rotates it will play video in fullscreen
          videoElement.webkitEnterFullScreen();
        }
      }
    }
  }

  widthOnHighResolution() {
    return window.innerWidth >= FullHD;
  }

  handleFilters(event) {
    if (!this.isShowBlur) {
      this.filterPanel.toggle(event, this.searchBlock);
    }
  }

  calculateFiltersPosition() {
    let marginLeft = '';
    let marginTop = '';
    let extraIndent = 0;
    if (window.innerWidth <= 1025 && window.innerWidth > 800) {
      extraIndent = 8;
    } else if (window.innerWidth <= 800 && window.innerWidth > 700) {
      extraIndent = 6;
    } else {
      extraIndent = 0;
    }
    if (this.filterElement && this.filterElement.nativeElement) {
      marginLeft = this.isDesktop
        ? this.filterElement.nativeElement.clientWidth - 30 + 'px'
        : extraIndent + 'px';
      marginTop = this.isDesktop
        ? 0 - this.searchInput.nativeElement.clientHeight + 9 + 'px'
        : '15px';
      return {
        width: this.isDesktop
          ? '250px'
          : this.filterElement.nativeElement.clientWidth +
          this.searchInput.nativeElement.clientWidth +
          'px',
        borderRadius: '6px',
        marginLeft: marginLeft,
        marginTop: marginTop
      };
    }
  }

  getSearchPlaceholderText() {
    switch (this.mainSearchType) {
      case SearchTypes.Resumes:
        return 'Search by name';
      case SearchTypes.Businesses:
        return 'Search any service, business, or name';
      case SearchTypes.Jobs:
        return 'Search by job type or company name';
      case SearchTypes.Nonprofit:
        return 'Search any nonprofit organization';
      default:
        return 'Search any service, business, or name';
    }
  }

  getCardTypeBasedOnSearchType() {
    switch (this.mainSearchType) {
      case SearchTypes.Resumes:
        return PitchCardType.Resume;
      case SearchTypes.Businesses:
        return PitchCardType.Basic;
      case SearchTypes.Nonprofit:
        return PitchCardType.Service;
      case SearchTypes.Jobs:
        return PitchCardType.Job;
      default:
        return PitchCardType.Basic;
    }
  }

  getFiltersObject(isEmpty?) {
    const filters = {
      data: this.storageService.getSession(AppSettings.FILTER_FORM)
    };
    switch (this.mainSearchType) {
      case SearchTypes.Resumes:
        return !isEmpty
          ? {resume: {}}
          : {
            resume: this.checkObjectOnWrongValues(
              this.populateResumeFilterObject(filters)
            )
          };
      case SearchTypes.Nonprofit:
        return !isEmpty
          ? {nonprofit: {}}
          : {
            nonprofit: this.checkObjectOnWrongValues(
              this.populateNonprofitFilterObject(filters)
            )
          };
      case SearchTypes.Jobs:
        return !isEmpty
          ? {job: {}}
          : {
            job: this.checkObjectOnWrongValues(
              this.populateJobFilterObject(filters)
            )
          };
      default:
        return !isEmpty
          ? {businessService: {}}
          : {
            businessService: this.checkObjectOnWrongValues(
              this.populateBusinessFilterObject(filters)
            )
          };
    }
  }

  hideKeyboard() {
    if (this.mobileMode && this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.firstChild.childNodes[0].childNodes[0].blur();
    }
  }

  setMobileMargin() {
    if (
      this.mobileMode &&
      this.filterPanel?.el?.nativeElement?.firstChild
    ) {
      const wrap = document.getElementById(
        'search-swiper-' + this.uniqueId
      );
      const wrapHeight = wrap.clientHeight;
      const panelHeight =
        this.filterPanel.el.nativeElement.firstChild.clientHeight;
      let marginBottom =
        this.mobileMode &&
        this.isPanelShow &&
        this.mainSearchType === SearchTypes.Jobs
          ? '300px'
          : '50px';
      if (panelHeight > wrapHeight) {
        marginBottom = panelHeight - wrapHeight + 'px';
      }
      return marginBottom;
    } else {
      return 'unset';
    }
  }

  get isShowRestrictForResume(): boolean {
    const profile = this.userCommonService;
    const pageType = this.getCardTypeBasedOnSearchType();
    return (
      pageType === PitchCardType.Resume &&
      !!this.userCommonService.userOrganizationProgress.find(
        (x) => x.isJobExists === true
      ) === false &&
      !profile.isTesterUser
    );
  }
}
