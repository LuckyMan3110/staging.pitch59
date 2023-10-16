import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
  HostListener,
  HostBinding,
  AfterViewInit,
  Input
} from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Carousel } from 'primeng/carousel';
import { OverlayPanel } from 'primeng/overlaypanel';

import { BusinessModel } from '../../../business/models/business.model';
import { MyPitchCardFolder } from '../../models/my-pitchcard-folder.model';
import { UserSharedModel } from '../../models/user-shared.model';
import FolderHierarchy from '../../models/folder-hierarchy.model';
import FolderPath from '../../models/folder-path.model';
import RemoveList from '../../models/remove-list.model';

import { StorageService } from '../../../shared/services/storage.service';
import { MyPocketsService } from '../../services/my-pockets.service';
import { MyPitchCardsService } from '../../services/my-pitch-cards.service';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { BusinessService } from '../../../business/services/business.service';
import { GroupsService } from '../../services/groups.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { UiService } from '../../../shared/services/ui.service';
import { PitchCardModalsWrapperService } from '../../../pitch-card-shared/services/pitchcard-modals-wrapper.service';

import { AppSettings } from '../../../shared/app.settings';
import { BusinessStatus } from '../../../business/enums/business.status';
import { FolderContentRole } from '../../enums/folder-content-role.enum';
import { LoaderState } from '../../../shared/components/loader/loader';
import { BusinessDetails } from '../../../business/models/business-detail.model';
import { UniqueComponentId } from 'primeng/utils';
import { DeviceDetectorService } from 'ngx-device-detector';
import {
  AnalyticsChartData,
  AnalyticsTab
} from '../employer-portal/models/analytics-models.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsTypesEnum } from '../employer-portal/enums/analytics-types.enum';
import { Subscription } from 'rxjs';
import { CustomerAnalyticsService } from '../../services/customer-analytics.service';
import {
  AnalyticsOptionsEnum,
  AnalyticsSocialNetworks
} from '../employer-portal/enums/analytics-options.enum';
import { ConfirmationService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { format, add, startOfMonth, getTime } from 'date-fns';
import { UserSession } from '../../../shared/models/user-session.model';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { EmployerPortalService } from '../../services/employer-portal.service';

@Component({
  selector: 'app-account-pitch-cards',
  templateUrl: './pitch-cards.component.html',
  styleUrls: ['./pitch-cards.component.scss'],
  providers: [GroupsService, MyPocketsService, MyPitchCardsService]
})
export class PitchCardsComponent implements OnInit, OnDestroy, AfterViewInit {
  // GlobalPageVariables
  FolderContentRole = FolderContentRole;
  subscription: any;
  appLoader: boolean = false;
  noPitchCardsAvailable = false;
  mobileMode: boolean = false;
  showPitchCardsLoader: boolean = false;
  allFolders: FolderHierarchy[] = [];
  myPitchCardsList: MyPitchCardFolder[] = [];
  selectedPitchCards: MyPitchCardFolder[] = [];
  myFoldersColors: string[];
  userRolesList = FolderContentRole;
  businessStatusList = BusinessStatus;
  pitchCardsNumber: number = 0;
  scaleFactor: number = 0.5;
  folderPath: FolderPath[] = [
    {
      id: 0,
      name: 'My PitchCards'
    }
  ];

  // ContextMenu Variables
  contextMenu: boolean = false;
  mobileContextMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  contextMenuPitchCard: MyPitchCardFolder = null;
  mobileContextMenuPitchCard: MyPitchCardFolder = null;

  // NewFolderModal variables
  detailsFolderModal: boolean = false;
  detailsFolderMode: string | null = null;
  modalErrors = {
    newFolderName: null,
    newFolderColor: null
  };
  newFolderName: string | null = null;
  newFolderColor: string | null = null;
  showCreateLoader: boolean = false;

  // RemoveModal Variables
  removeModal: boolean = false;
  removeWithContent: boolean = false;
  showRemoveLoader: boolean = false;
  removeList: RemoveList = {};

  // AccessModal Variables
  accessModal: boolean = false;
  userTableLoaded: boolean = false;
  newUserEmail: string;
  emailPattern = AppSettings.EMAIL_PATTERN;
  allGroupUsers: UserSharedModel[];
  newUserRole: any;
  allUserRoles: any[];
  folderContentUsers: UserSharedModel[] = [];
  myProfileUserId: string;

  // MoveToModal Variables
  moveToModal: boolean = false;
  noFolders: boolean = false;
  currentFolderButton: any = null;
  moveLoader: number = null;
  folderIdParam: number = 0;
  isOrganizationFolder: boolean = false;
  modalFolderIdParam: number = 0;
  modalFolderPath: FolderPath[] = [];

  // Analytics Modal Variables
  analyticsModal: boolean = false;
  reportsForm: FormGroup;
  chartData: AnalyticsChartData;
  chartTabs: AnalyticsTab[];
  chartDataModel = AnalyticsTypesEnum;
  chartOptions: any;
  maxDateValue = new Date();
  $analyticSub = new Subscription();

  // Pause Modal Variables
  resumeModal: boolean = false;
  maxMonthsOfPause: number = 6;
  currentDate: Date = new Date(Date.now());
  pauseDate: Date = this.currentDate;
  maxPauseDate: Date = add(this.currentDate, {
    months: 6
  });
  formattedPauseDate: string = format(new Date(Date.now()), 'MM/dd/yyyy');
  generatedNextChargeDate: string = '';
  businessIdToPause;
  pauseModal: boolean = false;

  // PitchCard Preview Variables
  pitchCardPreviewMode: boolean = false;
  pitchCardOnPreview: BusinessDetails = null;

  // Carousel Variables
  numVisible: number = 4;
  numScroll: number = 1;
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

  uniqueId: string;

  plusMenuItems = [
    {
      label: 'Add PitchCards',
      icon: 'assets/images/my-account-images/profile-sidebar-images/my-pitchcards.svg',
      method: () => {
        this.router.navigate(['/select-pitchcards']);
      }
    },
    {
      label: 'Add Pockets',
      icon: 'assets/images/my-account-images/profile-sidebar-images/pockets.svg',
      method: () => {
        this.handleDetailsFolderModal('create');
      }
    }
  ];

  isMobile: boolean = window.matchMedia('(max-width: 767px)').matches;
  @Input() elementToAppend: ElementRef;
  @ViewChild('plusItemsMenu') plusItemsMenu: ElementRef;

  @ViewChild('carousel', {static: false}) carousel: Carousel;
  @ViewChild('pitchCardsWrapper', {static: false})
  pitchCardsWrapper: ElementRef;
  @ViewChild('userSettingsMenu') userSettingsMenu: OverlayPanel;
  @ViewChild('plusMenu') plusMenu: OverlayPanel;

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const path = event.path || (event.composedPath && event.composedPath());

    if (
      !path.find((x) => x.className && x.className.includes('btn status'))
    ) {
      this.contextMenu = false;
    }

    // Context listener
    if (
      !path.find(
        (x) =>
          x.className &&
          (x.className.includes('context-wrapper') ||
            x.className.includes('new-folder-modal') ||
            x.className.includes('move-to-modal') ||
            x.className.includes('access-modal') ||
            x.className.includes('remove-modal'))
      )
    ) {
      if (this.contextMenuPitchCard) {
        this.contextMenuPitchCard = null;
      }
    }

    // Mobile Context Listener
    if (
      path.find((x) => x.className && x.className.includes('context-btn'))
    ) {
      if (this.mobileContextMenu) {
        this.mobileContextMenu = false;
      }
    }

    // User's Settings Ovarlay listener
    if (
      !path.find(
        (x) => x.className && x.className.includes('settings-btn')
      )
    ) {
      if (
        !path.find(
          (x) =>
            x.className &&
            x.className.includes('user-settings-menu')
        )
      ) {
        if (this.userSettingsMenu) {
          this.userSettingsMenu.hide();
        }
      }
    }
  }

  @HostListener('window:contextmenu', ['$event'])
  cancel(event: any) {
    const path = event.path || (event.composedPath && event.composedPath());

    if (
      !path.find(
        (x) => x.className && x.className.includes('card-container')
      )
    ) {
      this.contextMenu = false;
    }
  }

  @HostBinding('style.--scale-factor') get scale() {
    return this.scaleFactor;
  }

  constructor(
    private router: Router,
    private storageService: StorageService,
    private myPocketsService: MyPocketsService,
    private myPitchCardsService: MyPitchCardsService,
    private activateRoute: ActivatedRoute,
    private cardPackagesService: CardPackageService,
    private loaderService: LoaderService,
    private businessService: BusinessService,
    private groupService: GroupsService,
    private uiService: UiService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private deviceService: DeviceDetectorService,
    private fb: FormBuilder,
    private teamService: EmployerPortalService,
    private customerAnalyticsService: CustomerAnalyticsService,
    private confirmationService: ConfirmationService,
    private userService: UserCommonService
  ) {
    this.onResized = this.onResized.bind(this);
    this.subscription = this.activateRoute.params.subscribe((params) => {
      this.folderIdParam = params.id ? params.id : 0;
      this.loadMyPitchCardsList();
      this.getFoldersColor();
    });

    this.subscription = this.loaderService.loaderState.subscribe(
      (state: LoaderState) => {
        this.appLoader = state.show;
      }
    );

    if (this.router.url.includes('my-pitchcards') && this.isMobile) {
      this.subscription = router.events.subscribe(
        (event: NavigationStart) => {
          if (
            event.navigationTrigger === 'popstate' &&
            this.pitchCardPreviewMode &&
            this.router.isActive('/account/my-pitchcards', true)
          ) {
            this.storageService.setItem(
              AppSettings.LAST_PAGE_URL,
              event.url
            );
            router.navigateByUrl('cancel-navigation');
            this.pitchCardPreviewMode = false;
          } else if (
            event.navigationTrigger === 'popstate' &&
            !this.pitchCardPreviewMode
          ) {
            const lastUrl: string = this.storageService.getItem(
              AppSettings.LAST_PAGE_URL,
              true
            );
            if (lastUrl) {
              router.navigateByUrl(lastUrl);
            } else {
              router.navigateByUrl('/welcome');
            }
          }
        }
      );
    }
  }

  ngOnInit(): void {
    this.uniqueId = UniqueComponentId();
    window.addEventListener('resize', this.onResized);
    this.onResized();
    this.createReportsForm();
    this.getMyProfileUserId();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    window.removeEventListener('resize', this.onResized);
  }

  ngAfterViewInit() {
    this.onResized();
  }

  onResized() {
    this.clearCarouselPage();
    this.resizeCalculateCarousel();
    this.resizeCalculateScale();
    this.resizeModeCalculating();
  }

  resizeCalculateCarousel() {
    if (window.innerWidth < 1069 && window.innerWidth > 820) {
      this.numVisible = 3;
      this.numScroll = 3;
    }

    if (window.innerWidth < 820 && window.innerWidth > 620) {
      this.numVisible = 2;
      this.numScroll = 2;
    }

    if (window.innerWidth < 620) {
      this.numVisible = 1;
      this.numScroll = 1;
    }
  }

  resizeCalculateScale() {
    if (window.innerWidth < 1200) {
      let cardsOnRow = 4;
      const allCardsMargin = 110;
      const defaultScale = window.innerWidth <= 620 ? 0.57 : 0.5;
      const defaultCardWidth = 180;

      if (
        (window.innerWidth < 1000 && window.innerWidth >= 876) ||
        (window.innerWidth <= 767 && window.innerWidth > 620)
      ) {
        cardsOnRow = 3;
      }

      if (
        (window.innerWidth < 876 && window.innerWidth > 767) ||
        window.innerWidth <= 620
      ) {
        cardsOnRow = 2;
      }

      this.scaleFactor =
        (((this.pitchCardsWrapper?.nativeElement.clientWidth -
              allCardsMargin) /
            cardsOnRow) *
          defaultScale) /
        defaultCardWidth;
    } else {
      this.scaleFactor = 0.5;
    }
  }

  resizeModeCalculating() {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
    }
    if (window.innerWidth > 767) {
      this.mobileMode = false;
    }
  }

  createReportsForm() {
    this.reportsForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      chartType: ['', Validators.required]
    });

    this.initAnalyticsData();
  }

  initAnalyticsData() {
    const today = new Date();
    const monthAgoStamp = today.setMonth(today.getMonth() - 1);
    const monthAgo = new Date(monthAgoStamp);

    this.reportsForm.get('startDate').patchValue(monthAgo);
    this.reportsForm.get('endDate').patchValue(new Date());
    this.reportsForm.get('chartType').patchValue('Shared');

    this.chartTabs = this.teamService.chartsAllTabsData();
    this.$analyticSub.add(
      this.reportsForm.valueChanges.subscribe(() => {
        if (!this.contextMenuPitchCard) {
          this.contextMenuPitchCard = JSON.parse(
            this.storageService.getItem('selectedBusiness')
          );
        }
        this.getPitchCardAnalytics(this.contextMenuPitchCard);
      })
    );
  }

  getMyProfileUserId() {
    const myProfile: UserSession = this.storageService.getItem(
      AppSettings.USER_DETAILS,
      true
    );
    this.myProfileUserId = myProfile.userId;
  }

  getFoldersColor() {
    this.myFoldersColors = this.myPocketsService.getMyPocketsColor();
  }

  loadMyPitchCardsList() {
    this.noPitchCardsAvailable = false;
    this.showPitchCardsLoader = true;
    this.myPitchCardsList = [];
    this.subscription = this.myPitchCardsService
      .getPitchCards(this.folderIdParam)
      .subscribe(
        (result) => {
          if (result.data) {
            this.showPitchCardsLoader = false;
            this.pitchCardsNumber = 0;
            this.myPitchCardsList = result.data.content;
            this.folderPath = result.data.path;
            this.isOrganizationFolder = result.data.path.find(
              (x) => x.organizationId
            );
            this.myPitchCardsList.forEach(
              (business) =>
                (this.pitchCardsNumber += business.count)
            );

            if (!result.data.content.length) {
              this.noPitchCardsAvailable = true;
            }
          }
        },
        (error) => {
          const message = 'Error while loading PitchCards';

          setTimeout(() => {
            this.uiService.errorMessage(
              error.Message ? error.Message : message,
              'main',
              3000
            );
          }, 1000);
        }
      );
  }

  isUserHasResume() {
    if (this.myProfileUserId) {
      this.subscription = this.userService
        .getUserProfile(this.myProfileUserId)
        .subscribe((result) => {
          if (result?.data) {
            this.storageService.setItem(
              AppSettings.IS_RESUME_EXIST,
              result.data.isResumeCreated
            );
          }
        });
    }
  }

  addUserToBusinessByEmail() {
    const email = this.newUserEmail;
    let businessId = this.contextMenuPitchCard
      ? this.contextMenuPitchCard.content.id
      : this.selectedPitchCards[0].content.id;
    if (this.deviceService.isMobile()) {
      businessId = this.mobileContextMenuPitchCard
        ? this.mobileContextMenuPitchCard.content.id
        : this.selectedPitchCards[0].content.id;
    }
    const role = this.userRolesList.Editor.toString();

    if (this.emailPattern.test(email)) {
      this.myPitchCardsService
        .addUserToBusinessByEmail(businessId, email, role)
        .subscribe(
          (x) => {
            this.newUserEmail = '';
            this.getFolderContentsUsers(this.getFolderID());
          },
          (error) => {
            this.uiService.errorMessage(
              error.message
                ? error.message
                : 'Something went wrong'
            );
            this.newUserEmail = '';
          }
        );
    }
  }

  removeUserFromFolderContent(userId, organizationId) {
    if (this.myProfileUserId !== userId) {
      this.myPitchCardsService
        .removeAccessForUser(
          Number(this.getFolderID()),
          userId,
          organizationId
        )
        .subscribe(
          (x) => {
            this.getFolderContentsUsers(this.getFolderID());
          },
          (error) => {
            this.uiService.errorMessage(
              error.message
                ? error.message
                : 'Something went wrong'
            );
          }
        );
    }
  }

  getFolderID() {
    if (this.deviceService.isMobile()) {
      return this.mobileContextMenuPitchCard
        ? this.mobileContextMenuPitchCard.id
        : this.selectedPitchCards[0].id;
    }
    return this.contextMenuPitchCard
      ? this.contextMenuPitchCard.id
      : this.selectedPitchCards[0].id;
  }

  getPitchCardAnalytics(business) {
    if (
      this.reportsForm.valid &&
      (business?.content?.id || business?.content?.businessId)
    ) {
      this.chartData = new AnalyticsChartData();
      const activeTab = this.chartTabs.find((t) => t.active === true);
      let types: string = '';
      activeTab.columns.map((c) => {
        types = types + (types ? ',' : '') + c.types.join(',');
      });
      const params: any = {
        fromDate: new Date(
          this.reportsForm.get('startDate').value
        ).toISOString(),
        toDate: new Date(
          this.reportsForm.get('endDate').value
        ).toISOString(),
        types: types,
        businessId: business.content.businessId
      };

      this.$analyticSub.add(
        this.customerAnalyticsService
          .getReportAnalytics(params)
          .subscribe((r) => {
            this.storageService.setItem(
              'selectedBusiness',
              business
            );
            this.populateChartData(r, activeTab);
          })
      );
    }
  }

  populateChartData(data, activeTab: AnalyticsTab) {
    const chartData: AnalyticsChartData = {
      labels: [],
      datasets: [
        {
          label: activeTab.name,
          backgroundColor: '#25AEB4',
          borderColor: '#25AEB4',
          data: []
        }
      ]
    };
    if (Object.keys(data).length) {
      activeTab.columns.map((column, index) => {
        column.types.map((type) => {
          if (AnalyticsOptionsEnum[type] in data) {
            if (AnalyticsSocialNetworks[type] in data) {
              if (
                !chartData.labels.find(
                  (label) => label === column.name
                )
              ) {
                chartData.labels.push(column.name);
              }
              chartData.datasets[0].data.length !==
              chartData.labels.length
                ? chartData.datasets[0].data.push(
                  data[AnalyticsOptionsEnum[type]]
                )
                : (chartData.datasets[0].data[
                chartData.datasets[0].data.length - 1
                  ] += data[AnalyticsOptionsEnum[type]]);
            } else {
              chartData.labels.push(column.name);
              chartData.datasets[0].data.push(
                data[AnalyticsOptionsEnum[type]]
              );
            }
          }
        });
      });
    } else {
      activeTab.columns.map((c) => {
        chartData.labels.push(c.name);
      });
    }
    this.chartData = chartData;
    this.analyticsModal = true;
  }

  getBusinessTypeValue(type) {
    return this.cardPackagesService.getBusinessTypeValue(type);
  }

  getFolderHierarchy(folderId: number) {
    this.clearCarouselPage();
    this.currentFolderButton = null;
    this.modalFolderIdParam = folderId;
    this.noFolders = false;

    this.subscription = this.myPitchCardsService
      .getFolderHierarchy(folderId)
      .subscribe(
        (result) => {
          this.foldersFilter(result);
          this.modalFolderPath = result?.data?.path
            ? result.data.path
            : [];

          if (!this.moveToModal) {
            this.moveToModal = true;
          }
        },
        (error) => {
          const message = 'Error while getting Pockets';

          setTimeout(() => {
            this.uiService.errorMessage(
              error.Message ? error.Message : message,
              'main',
              3000
            );
          }, 1000);
        }
      );

    // this.subscription = this.myPitchCardsService.getPitchCards(folderId).subscribe((result) => {
    //   if (result.data) {
    //     this.modalFolderPath = result.data.path;
    //   }
    // });
  }

  clearCarouselPage() {
    if (this.carousel) {
      this.carousel.page = 0;
    }
  }

  foldersFilter(result: any) {
    if (result.data) {
      if (!result.data.id && !result.data.children.length) {
        this.noFolders = true;
      }

      this.allFolders = result.data.children;

      if (this.contextMenuPitchCard) {
        this.allFolders = this.allFolders.filter(
          (folder) => this.contextMenuPitchCard.id != folder.id
        );
      } else {
        this.allFolders = this.allFolders.filter(
          (folder) =>
            !this.selectedPitchCards.some(
              (sel) => sel.id == folder.id
            )
        );
      }

      this.addCurrentFolderButton(result.data.id, result.data.name);
    }
  }

  addCurrentFolderButton(id: any, name: any) {
    if (this.folderIdParam != id) {
      this.currentFolderButton = {
        name,
        id
      };
    }
  }

  getFolderContentsUsers(folderContentId: number) {
    this.userTableLoaded = false;

    this.subscription = this.myPitchCardsService
      .getFolderContentUsers(folderContentId)
      .subscribe((result) => {
        if (result.data) {
          this.userTableLoaded = true;
          this.folderContentUsers = result.data;
        }
      });
  }

  onBusinessSelect(pitchCard: BusinessModel, role: FolderContentRole) {
    this.storageService.setSession(
      AppSettings.DRAFT_BUSINESS_ID,
      pitchCard.id
    );
    this.cardPackagesService.selectedType = pitchCard.businessType;
    this.router.navigate(['create']);
  }

  handleDetailsFolderModal(mode: string | null) {
    switch (mode) {
      case 'create':
        this.detailsFolderModal = true;
        this.detailsFolderMode = mode;
        break;
      case 'edit':
        this.detailsFolderModal = true;
        this.detailsFolderMode = mode;
        this.newFolderName = this.contextMenuPitchCard
          ? this.contextMenuPitchCard.name
          : this.selectedPitchCards[0].name;
        this.newFolderColor =
          '#' +
          (this.contextMenuPitchCard
            ? this.contextMenuPitchCard.color
            : this.selectedPitchCards[0].color);
        break;
      default:
        this.detailsFolderModal = null;
        this.detailsFolderMode = mode;
        break;
    }
  }

  handleMoveToModal() {
    if (!this.moveToModal) {
      this.getFolderHierarchy(this.folderIdParam);
    } else {
      this.moveToModal = !this.moveToModal;
    }
  }

  handlePauseSubscription(needToPause, businessId) {
    this.businessService
      .pausedBusiness(businessId, needToPause, getTime(this.pauseDate))
      .subscribe((result) => {
        if (result.data) {
          this.loadMyPitchCardsList();
          this.contextMenuPitchCard = null;
          this.selectedPitchCards = [];

          setTimeout(() => {
            if (needToPause) {
              this.pauseModal = false;
              this.uiService.successMessage(
                'Business was paused successfully',
                true,
                'main',
                3000
              );
              this.confirmationService.confirm({
                message: `Your subscription will be resumed automatically on ${format(
                  this.pauseDate,
                  'MMMM do yyyy'
                )}. 
                                And you will be charged again on ${format(
                  new Date(result.data),
                  'MMMM do yyyy'
                )}.`,
                key: 'paused',
                rejectVisible: false,
                accept: () => {
                  this.pauseDate = this.currentDate;
                  this.confirmationService.close();
                }
              });
            } else {
              this.uiService.successMessage(
                'Business was resumed to previous status successfully',
                true,
                'main',
                3000
              );
              this.confirmationService.confirm({
                message: `You will be charged again on ${format(
                  new Date(result.data),
                  'MMMM do yyyy'
                )}. 
                                After the next charge you will be able to pause your subscription again.`,
                key: 'resumed',
                rejectVisible: false,
                accept: () => {
                  this.confirmationService.close();
                }
              });
            }
          }, 1000);
        }
      });
  }

  handleAnalyticsModal() {
    if (!this.analyticsModal) {
      this.reportsForm.get('chartType').patchValue('Shared');
      this.getPitchCardAnalytics(this.contextMenuPitchCard);
    } else {
      this.analyticsModal = !this.analyticsModal;
    }
  }

  handleRemoveModal() {
    if (!this.removeModal) {
      this.getRemoveList();
      this.removeWithContent = false;
    }

    if (this.removeModal) {
      this.contextMenuPitchCard = null;
    }

    this.removeModal = !this.removeModal;
  }

  handleAccessModal() {
    if (!this.accessModal) {
      this.getFolderContentsUsers(
        this.contextMenuPitchCard
          ? this.contextMenuPitchCard.id
          : this.selectedPitchCards[0].id
      );
    }
    if (this.accessModal) {
      this.contextMenuPitchCard = null;
    }

    this.accessModal = !this.accessModal;
  }

  handlePauseModal(businessId) {
    this.pauseModal = true;
    this.businessIdToPause = businessId;
    // this.confirmationService.confirm({
    //     key: 'pause',
    //     accept: () => {
    //         this.handlePauseSubscription(true);
    //     },
    //     reject: () => {
    //         this.confirmationService.close();
    //     }
    // })
  }

  handleResumeModal(businessId) {
    const currentDate = new Date(Date.now());
    const monthOfCharge =
      currentDate.getMonth() >= 12 ? 1 : currentDate.getMonth() + 1;
    const yearOfCharge =
      currentDate.getMonth() >= 12
        ? currentDate.getFullYear() + 1
        : currentDate.getFullYear();
    this.confirmationService.confirm({
      message: `Your subscription will be resumed immediately.`,
      key: 'resume',
      accept: () => {
        this.handlePauseSubscription(false, businessId);
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
  }

  onSelectPauseDate(event) {
    this.formattedPauseDate = format(this.pauseDate, 'MM/dd/yyyy');
    this.generatedNextChargeDate = format(
      add(startOfMonth(this.pauseDate), {months: 1}),
      'MM/dd/yyyy'
    );
  }

  onModalShow(event, modal: Dialog) {
    const mobileMode = window.matchMedia('(max-width: 767px)').matches;
    if (mobileMode) {
      modal.maximized = true;
    }
  }

  clearModalOptions() {
    this.newFolderName = null;
    this.newFolderColor = null;
    this.contextMenuPitchCard = null;
    this.modalErrors = {
      newFolderName: null,
      newFolderColor: null
    };
  }

  resetAnalyticsData() {
    this.chartTabs.map((t) => {
      t.active = false;
    });
    this.chartTabs[0].active = true;
    this.reportsForm.get('chartType').patchValue('');
    this.chartData = new AnalyticsChartData();
    this.storageService.removeItem('selectedBusiness');
    this.contextMenuPitchCard = null;
  }

  selectChartTab(index, tab) {
    this.chartTabs.map((t) => {
      t.active = false;
    });
    this.chartTabs[index].active = true;
    this.reportsForm.get('chartType').patchValue(tab.name);
  }

  selectNewFolderColor(color: string | null) {
    this.newFolderColor = color;
    this.modalErrors.newFolderColor = null;
  }

  selectPitchCard(pitchCard: MyPitchCardFolder) {
    if (this.selectedPitchCards.some((item) => item.id === pitchCard.id)) {
      this.selectedPitchCards = this.selectedPitchCards.filter(
        (item) => item.id !== pitchCard.id
      );
    } else {
      this.selectedPitchCards.push(pitchCard);
    }
  }

  checkSelectedPitchCards(pitchCard: MyPitchCardFolder) {
    if (this.selectedPitchCards.some((item) => item.id === pitchCard.id)) {
      return true;
    }

    return false;
  }

  getRemoveList() {
    let folders = 0;
    let pitchCards = 0;

    this.selectedPitchCards.forEach((card) => {
      if (card.type === 'content') {
        pitchCards++;
      } else {
        folders++;
      }
    });

    this.removeList = {
      folders,
      pitchCards
    };
  }

  addContentToFolder(id: number): void {
    const contentdIds = [];

    if (this.contextMenuPitchCard) {
      contentdIds.push({
        id: this.contextMenuPitchCard.id,
        type: this.contextMenuPitchCard.type
      });
    } else {
      this.selectedPitchCards.forEach((card) =>
        contentdIds.push({id: card.id, type: card.type})
      );
    }

    const params = {
      folderId: id,
      contentIds: contentdIds
    };

    let movedElementType =
      this.selectedPitchCards.length > 1 ? 'Items' : 'Item';
    if (this.contextMenuPitchCard) {
      movedElementType =
        this.contextMenuPitchCard.type === 'folder'
          ? 'Pocket'
          : 'PitchCard';
    }

    if (id == this.folderIdParam) {
      this.uiService.warningMessage(
        `Current ${movedElementType} is already exist in this pocket`
      );
      return;
    }

    this.moveLoader = id;
    this.subscription = this.myPitchCardsService
      .addContentToFolder(params)
      .subscribe(
        (result) => {
          if (result.data) {
            this.moveLoader = null;
            this.selectedPitchCards = [];
            this.contextMenuPitchCard = null;
            this.loadMyPitchCardsList();
            this.handleMoveToModal();

            setTimeout(() => {
              this.uiService.successMessage(
                `The ${movedElementType} was moved successfully`,
                true,
                'main',
                3000
              );
            }, 1000);
          }
        },
        (error) => {
          const message = `Error while moving ${movedElementType} to Pocket`;

          this.moveLoader = null;
          setTimeout(() => {
            this.uiService.errorMessage(
              error.Message ? error.Message : message,
              'main',
              3000
            );
          }, 1000);
        }
      );
  }

  newFolderSubmit() {
    const validate = this.detailsModalValidate();

    if (validate === 'valid') {
      const params = {
        name: this.newFolderName,
        color: this.newFolderColor
      };

      this.showCreateLoader = true;
      this.detailsFolderMode === 'create'
        ? this.createFolder(params)
        : this.editFolder(params);
    }
  }

  detailsModalValidate() {
    let nameMessage: string = null;
    let colorMessage: string = null;
    let errors = {
      newFolderName: null,
      newFolderColor: null
    };

    if (!this.newFolderName) {
      nameMessage = 'The name field is required';
    }

    if (this.newFolderName && this.newFolderName.length > 35) {
      nameMessage = 'Max number of characters is 35';
    }

    colorMessage = !this.newFolderColor
      ? 'The color field is required'
      : null;
    errors.newFolderName = nameMessage;
    errors.newFolderColor = colorMessage;

    this.modalErrors = {...errors};

    return nameMessage || colorMessage ? 'invalid' : 'valid';
  }

  createFolder(params: { name: string; color: string }) {
    const createParams = {...params, parentId: this.folderIdParam};

    this.subscription = this.myPitchCardsService
      .createNewFolder(createParams)
      .subscribe(
        (result) => {
          const message = 'The Pocket was created successfully';

          this.finishFolderProcess(result, message);
        },
        (error) => {
          const message = 'Error while Pocket creating';

          this.errorFolderProcess(error, message);
        }
      );
  }

  editFolder(params: { name: string; color: string }) {
    const editParams = {
      ...params,
      id: this.contextMenuPitchCard
        ? this.contextMenuPitchCard.id
        : this.selectedPitchCards[0].id
    };

    this.subscription = this.myPitchCardsService
      .editFolder(editParams)
      .subscribe(
        (result) => {
          const message = 'The Pocket was edited successfully';

          this.finishFolderProcess(result, message, true);
        },
        (error) => {
          const message = 'Error while Pocket editing';

          this.errorFolderProcess(error, message);
        }
      );
  }

  finishFolderProcess(result: any, message: string, edit?: boolean) {
    if (result.data) {
      this.loadMyPitchCardsList();
      this.showCreateLoader = false;
      this.handleDetailsFolderModal(null);

      if (edit) {
        this.contextMenuPitchCard = null;
      }

      setTimeout(() => {
        this.uiService.successMessage(message, true, 'main', 3000);
      }, 1000);
    }
  }

  errorFolderProcess(error: any, message: string) {
    this.showCreateLoader = false;

    setTimeout(() => {
      this.uiService.errorMessage(
        error.Message ? error.Message : message,
        'main',
        3000
      );
    }, 1000);
  }

  removeFolderSubmit() {
    const foldersIds = [];
    const removingBusinessIds = [];

    if (this.contextMenuPitchCard) {
      foldersIds.push({
        id: this.contextMenuPitchCard.id,
        type: this.contextMenuPitchCard.type
      });

      if (this.contextMenuPitchCard?.content?.id) {
        removingBusinessIds.push(this.contextMenuPitchCard.content.id);
      }
    } else {
      this.selectedPitchCards.forEach((card) => {
        foldersIds.push({id: card.id, type: card.type});

        if (card.content.id) {
          removingBusinessIds.push(card.content.id);
        }
      });
    }

    const params = {
      contentIds: foldersIds,
      withContent: this.removeWithContent
    };

    this.showRemoveLoader = true;
    this.subscription = this.myPitchCardsService
      .removeContent(params)
      .subscribe(
        (result) => {
          if (result.data) {
            this.showRemoveLoader = false;
            this.selectedPitchCards = [];
            this.contextMenuPitchCard = null;
            this.loadMyPitchCardsList();
            this.isUserHasResume();

            if (this.mobileContextMenuPitchCard) {
              this.clearMobileContextPitchCard();
            }

            this.handleRemoveModal();
            this.clearDraftBusiness(removingBusinessIds);

            setTimeout(() => {
              this.uiService.successMessage(
                'Pocket has been removed',
                true,
                'main',
                3000
              );
            }, 1000);
          }
        },
        (error) => {
          const message = 'Error while removing';

          setTimeout(() => {
            this.uiService.errorMessage(
              error.Message ? error.Message : message,
              'main',
              3000
            );
          }, 1000);
        }
      );
  }

  clearDraftBusiness(removingBusinessIds: string[]) {
    const draftBusinessId = this.storageService.getSession(
      AppSettings.DRAFT_BUSINESS_ID
    );

    if (
      removingBusinessIds.some((id) =>
        draftBusinessId.toString().includes(id)
      )
    ) {
      this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, null);
    }
  }

  handleFolderOpen(folderId: number) {
    this.router.navigate([`/account/my-pitchcards`, folderId]);
  }

  handleOpenModalFolder(folderId: number) {
    this.getFolderHierarchy(folderId);
  }

  onRightClick(event: MouseEvent, pitchCard: MyPitchCardFolder) {
    if (pitchCard.organizationId > 0 && pitchCard.type == 'folder') {
      return;
    }
    this.contextMenuPitchCard = pitchCard;
    this.contextMenuX = event.pageX;
    this.contextMenuY = event.pageY;
    if (!this.isMobile) {
      this.contextMenu = true;
    }
  }

  handleRequestApproval() {
    const businessId = this.contextMenuPitchCard
      ? this.contextMenuPitchCard.content.id
      : this.selectedPitchCards[0].content.id;

    this.subscription = this.businessService
      .requestApprove(businessId)
      .subscribe(
        (result) => {
          if (result.data) {
            this.loadMyPitchCardsList();
            this.contextMenuPitchCard = null;

            setTimeout(() => {
              this.uiService.successMessage(
                'Request approval was sent successfully',
                true,
                'main',
                3000
              );
            }, 1000);
          }
        },
        (error) => {
          const message = 'Error while sending request approval';

          setTimeout(() => {
            this.uiService.errorMessage(
              error.Message ? error.Message : message,
              'main',
              3000
            );
          }, 1000);
        }
      );
  }

  handlePitchCardStatus() {
    if (this.contextMenuPitchCard) {
      this.contextMenuPitchCard.content.accountStatus =
        !this.contextMenuPitchCard.content.accountStatus;
    } else {
      this.selectedPitchCards[0].content.accountStatus =
        !this.selectedPitchCards[0].content.accountStatus;
    }

    const businessId = this.contextMenuPitchCard
      ? this.contextMenuPitchCard.content.id
      : this.selectedPitchCards[0].content.id;
    const updatedStatus = this.contextMenuPitchCard
      ? this.contextMenuPitchCard.content.accountStatus
      : this.selectedPitchCards[0].content.accountStatus;

    this.businessService
      .activateDeactiveAccountStatus(businessId, updatedStatus)
      .subscribe(
        (result) => {
          if (result) {
            this.contextMenu = false;
            this.loadMyPitchCardsList();
            this.contextMenuPitchCard = null;

            setTimeout(() => {
              this.uiService.successMessage(
                'The business status was changed successfully',
                true,
                'main',
                3000
              );
            }, 1000);
          }
        },
        (error) => {
          const message = 'Error while changing business status';

          setTimeout(() => {
            this.uiService.errorMessage(
              error.Message ? error.Message : message,
              'main',
              3000
            );
          }, 1000);
        }
      );
  }

  handleViewPitchCard() {
    this.pitchCardPreviewMode = !this.pitchCardPreviewMode;

    this.addContextBusinessToService();
    this.savePitchCardOnPreview();
  }

  savePitchCardOnPreview() {
    if (this.mobileMode) {
      this.pitchCardOnPreview = this.mobileContextMenuPitchCard.content;
      return;
    }

    this.pitchCardOnPreview = this.contextMenuPitchCard.content;
  }

  clearPitchCardOnPreview() {
    this.pitchCardOnPreview = null;
  }

  addContextBusinessToService() {
    if (this.mobileMode) {
      this.pitchCardModalsWrapperService.setCurrentBusiness(
        this.mobileContextMenuPitchCard.content
      );
      return;
    }

    this.pitchCardModalsWrapperService.setCurrentBusiness(
      this.contextMenuPitchCard.content
    );
  }

  handlePitchCardTitleClick(clickEvent: any) {
    const {title} = clickEvent;
    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  handleMobileContextBusiness(pitchCard: MyPitchCardFolder) {
    // if (pitchCard.organizationId) {
    //     return;
    // }
    this.mobileContextMenu = !this.mobileContextMenu;
    this.mobileContextMenuPitchCard = pitchCard;
    if (!pitchCard.organizationId) {
      this.selectedPitchCards = [pitchCard];
    }
  }

  clearMobileContextPitchCard() {
    this.mobileContextMenuPitchCard = null;
  }

  hasSmartBanner() {
    return document.getElementsByClassName('smartbanner-show').length;
  }
}
