import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  HostListener,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Carousel } from 'primeng/carousel';

import { DragulaService } from 'ng2-dragula';
import { MyPocketsService } from '../../services/my-pockets.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { PitchCardModalsWrapperService } from '../../../pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { UiService } from '../../../shared/services/ui.service';

import { MyPocket } from '../../models/my-pocket.model';
import { LoaderState } from '../../../shared/components/loader/loader';
import { BusinessDetails } from '../../../business/models/business-detail.model';
import { UniqueComponentId } from 'primeng/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../shared/services/storage.service';
import { ConfirmationService } from 'primeng/api';
import { EmployerPortalService } from '../../services/employer-portal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AppSettings } from '../../../shared/app.settings';
import { AutoComplete } from 'primeng/autocomplete';
import { BusinessPitch } from '../../../business/models/business-pitch.model';

@Component({
  selector: 'app-account-my-pockets',
  templateUrl: './my-pockets.component.html',
  styleUrls: ['./my-pockets.component.scss'],
  providers: [MyPocketsService]
})
export class MyPocketsComponent implements OnInit, AfterViewInit, OnDestroy {
  isBrowser;
  appLoader = false;
  mobileMode = false;
  isTablet: boolean = this.deviceService.isTablet();
  isDesktop: boolean = this.deviceService.isDesktop();
  isAndroid: boolean = this.deviceService.os === 'Android';
  showPocketsLoader = false;

  pocketsSubscription = new Subscription();

  myPockets: MyPocket[] = null;
  myPocketsForModal: MyPocket[] = null;
  searchText: string | any;
  results: string[];
  detailsPocketModal = false;
  detailPocketMode: string | null = null;
  removeConfirmationModal = false;
  hasContent = false;
  myPocketsColors: string[];
  scaleFactor = 0.5;
  moveToPocketScaleFactor = 0.4;
  newPocketName: string | null = null;
  newPocketColor: string | null = null;
  modalErrors = {
    newPocketName: null,
    newPocketColor: null
  };
  selectedPockets: MyPocket[] = [];

  // openedPocket
  openedPocket: {
    name: string;
    id: number;
  } = null;
  openedPocketContent: any[] = null;
  shareDialogHeader = 'label_share_header';
  shareUrl = '';
  showSharingOptions = false;

  // MoveTo Modal variables
  allPockets: MyPocket[] = [];
  moveToModal = false;
  copyMode = false;
  numVisible = 4;
  numScroll = 1;
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

  // ContextMenu Variables
  contextMenu = false;
  mobileContextMenu = false;
  plusOptionsContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextBusiness: BusinessDetails & BusinessPitch = null;
  contextPocket: MyPocket = null;
  contextContentId: number = null;
  isOrganizationBusinesses = false;
  noItemsAvailable = false;
  disableRearrange = !this.isDesktop;
  isRearranging = false;
  dragging = false;

  // PitchCard Preview Variables
  pitchCardPreviewMode = false;
  pitchCardOnPreview: BusinessDetails = null;

  contextMenuPitchCard: BusinessDetails = null;
  mobileContextMenuPitchCard: BusinessDetails = null;
  uniqueId: string;

  inviteId: string;
  organizationName: string;

  @ViewChild('pocketContainer', {static: false})
  pocketContainer: ElementRef;
  @ViewChild('moveToPocketContainer', {static: false})
  moveToPocketContainer: ElementRef;
  @ViewChild('carousel', {static: false}) carousel: Carousel;
  @ViewChild('searchPocket', {static: false}) searchPocket: AutoComplete;

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const path = event.path || (event.composedPath && event.composedPath());

    if (
      !path.find(
        (x) =>
          x.className && x.className.includes('context-menu-wrapper')
      )
    ) {
      this.contextMenu = false;

      if (
        !this.mobileMode &&
        !path.find(
          (x) =>
            x.className &&
            x.className.includes('new-pocket-wrapper')
        )
      ) {
        this.contextPocket = null;
      }
    }
  }

  constructor(
    private myPocketsService: MyPocketsService,
    private dragulaService: DragulaService,
    private loaderService: LoaderService,
    private uiService: UiService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private confirmationService: ConfirmationService,
    private employerPortalService: EmployerPortalService,
    private deviceService: DeviceDetectorService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.onResized = this.onResized.bind(this);
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.initDragulaSubscriptions();
    }

    this.dragulaService.createGroup('VAMPIRES', {
      moves: (
        el: any,
        container: any,
        handle: any,
        sibling: any
      ): any => {
        if (!this.isDesktop) {
          this.setupDragging(
            !this.openedPocket
              ? 'pocket-container'
              : 'pitchCard-container',
            this.disableRearrange
          );
        }
        return !el.classList.contains('notDraggable');
      }
    });

    this.dragulaService.createGroup('WITCHES', {
      moves: (
        el: any,
        container: any,
        handle: any,
        sibling: any
      ): any => {
        if (!this.isDesktop) {
          this.setupDragging(
            !this.openedPocket
              ? 'pocket-container'
              : 'pitchCard-container',
            this.disableRearrange
          );
        }
        return !el.classList.contains('notDraggable');
      }
    });

    this.pocketsSubscription.add(
      this.loaderService.loaderState.subscribe((state: LoaderState) => {
        this.appLoader = state.show;
      })
    );
  }

  ngOnInit() {
    this.uniqueId = UniqueComponentId();
    window.addEventListener('resize', this.onResized);
    if (!this.route.snapshot.params?.id) {
      this.getAllPockets();
    } else if (this.route.snapshot.params?.id == 'invite') {
      this.inviteId = this.route.snapshot.queryParams.teamToken;
      this.getPocketContentByInviteId(this.inviteId);
    } else {
      this.getPocketContentById(this.route.snapshot.params.id);
    }
    this.getPocketsColor();
    this.onResized();
    if (this.isAndroid) {
      this.setupScrollEvent();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResized);

    if (this.pocketsSubscription) {
      this.pocketsSubscription.unsubscribe();
    }

    this.dragulaService.destroy('VAMPIRES');
    this.dragulaService.destroy('WITCHES');
  }

  initDragulaSubscriptions() {
    this.pocketsSubscription.add(
      this.dragulaService.drop('VAMPIRES').subscribe(() => {
        let pocketsIds = [];
        const otherPocketsIds = [];
        const defaultPocketIds = [];
        this.myPockets.forEach((pocket: any) => {
          !pocket.default
            ? otherPocketsIds.push(pocket.id)
            : defaultPocketIds.push(pocket.id);
        });

        pocketsIds = [...defaultPocketIds, ...otherPocketsIds];
        const params = {pocketIds: pocketsIds};

        this.myPocketsService
          .reorderPockets(params)
          .subscribe((result) => {
            if (result && result.data.length) {
              this.myPockets = result.data.map((i) =>
                this.myPockets.find((j) => j.id === i)
              );
            }
          });
        this.setAdditionalContainerClass(
          'pocket-thumbnail',
          'grabbing',
          false
        );
        if (!this.isDesktop) {
          this.setAdditionalContainerClass(
            !this.openedPocket
              ? 'pocket-container'
              : 'pitchCard-container',
            'shake',
            true,
            false
          );
        }
        if (!this.isAndroid) {
          this.pocketContainer.nativeElement.classList.remove(
            'no-touch-actions'
          );
        }
        this.dragging = false;
      })
    );

    this.pocketsSubscription.add(
      this.dragulaService.drag('VAMPIRES').subscribe((res) => {
        this.setAdditionalContainerClass(
          'pocket-thumbnail',
          'grabbing',
          true
        );
        if (!this.isDesktop) {
          this.setAdditionalContainerClass(
            !this.openedPocket
              ? 'pocket-container'
              : 'pitchCard-container',
            'shake',
            false,
            false
          );
        }
        if (!this.isAndroid) {
          this.pocketContainer.nativeElement.classList.add(
            'no-touch-actions'
          );
        }
        this.dragging = true;
      })
    );

    this.pocketsSubscription.add(
      this.dragulaService.cancel('VAMPIRES').subscribe((res) => {
        this.setAdditionalContainerClass(
          'pocket-thumbnail',
          'grabbing',
          false
        );
        if (!this.isDesktop) {
          this.setAdditionalContainerClass(
            !this.openedPocket
              ? 'pocket-container'
              : 'pitchCard-container',
            'shake',
            true,
            false
          );
        }
        if (!this.isAndroid) {
          this.pocketContainer.nativeElement.classList.remove(
            'no-touch-actions'
          );
        }
        this.dragging = false;
      })
    );

    this.pocketsSubscription.add(
      this.dragulaService.drag('WITCHES').subscribe((res) => {
        this.setAdditionalContainerClass(
          'pitchCard-container',
          'grabbing',
          true
        );
        this.pocketContainer.nativeElement.classList.add(
          'no-touch-actions'
        );
      })
    );

    this.pocketsSubscription.add(
      this.dragulaService.drop('WITCHES').subscribe(() => {
        const contentIds = [];
        this.openedPocketContent.forEach((content) =>
          contentIds.push(content.id)
        );
        const params = {
          contentIds
        };

        this.myPocketsService
          .reorderPitchCards(params, this.openedPocket.id)
          .subscribe((result) => {
            if (result && result.data.length) {
              this.openedPocketContent = result.data;
            }
          });

        this.setAdditionalContainerClass(
          'pitchCard-container',
          'grabbing',
          false
        );
        this.pocketContainer.nativeElement.classList.remove(
          'no-touch-actions'
        );
      })
    );

    this.pocketsSubscription.add(
      this.dragulaService.cancel('WITCHES').subscribe((res) => {
        this.setAdditionalContainerClass(
          'pitchCard-container',
          'grabbing',
          false
        );
        this.pocketContainer.nativeElement.classList.remove(
          'no-touch-actions'
        );
      })
    );
  }

  setupDragging(name, isDisable) {
    const elements = document.getElementsByClassName(name);
    if (elements?.length) {
      for (let i = 0; i <= elements.length - 1; i++) {
        isDisable
          ? elements[i].classList.add('notDraggable')
          : !elements[i].classList.contains('isDefault')
            ? elements[i].classList.remove('notDraggable')
            : elements[i].classList.add('notDraggable');
      }
    }
  }

  stopRearranging() {
    if (!this.isDesktop) {
      this.setAdditionalContainerClass(
        !this.openedPocket ? 'pocket-container' : 'pitchCard-container',
        'shake',
        false,
        false
      );
      this.disableRearrange = true;
    }
    this.pocketContainer.nativeElement.classList.remove('no-touch-actions');
    this.isRearranging = false;
  }

  onResized() {
    this.mobileMode = false;

    if (this.pocketContainer) {
      const defaultScale = 0.45;
      const leftPadding = 24;
      const containerWidth =
        this.pocketContainer?.nativeElement.clientWidth -
        (window.innerWidth > 767 && leftPadding);
      const defaultPocketWidth = 198;
      let defaultPocketsNumbersInTheRow = this.openedPocket ? 4 : 6;

      if (window.innerWidth < 1200 && window.innerWidth > 1085) {
        defaultPocketsNumbersInTheRow = this.openedPocket ? 4 : 5;
      }
      if (
        (window.innerWidth <= 1085 && window.innerWidth > 960) ||
        (window.innerWidth <= 767 && window.innerWidth > 688)
      ) {
        defaultPocketsNumbersInTheRow = this.openedPocket ? 3 : 4;
      }
      if (
        (window.innerWidth <= 960 && window.innerWidth > 830) ||
        window.innerWidth <= 688
      ) {
        defaultPocketsNumbersInTheRow = this.openedPocket ? 2 : 3;
      }
      if (
        (window.innerWidth <= 830 && window.innerWidth > 767) ||
        window.innerWidth <= 466
      ) {
        defaultPocketsNumbersInTheRow = 2;
      }

      const allMargins = 25 * defaultPocketsNumbersInTheRow;

      this.scaleFactor =
        ((containerWidth - allMargins) /
          defaultPocketWidth /
          defaultPocketsNumbersInTheRow) *
        defaultScale;
    }

    if (window.innerWidth < 768) {
      this.moveToPocketScale();
      this.mobileMode = true;
    }
  }

  moveToPocketScale() {
    if (this.moveToPocketContainer) {
      const defaultScale = 0.4;
      const paddings = window.innerWidth < 500 ? 32 : 69;
      const defaultPocketWidth = 165;
      const pocketsInTheRow = window.innerWidth < 560 ? 2 : 3;

      let pocketMargins = 80;

      if (window.innerWidth < 560) {
        pocketMargins = 55;
      }
      if (window.innerWidth < 420) {
        pocketMargins = 80;
      }

      const containerWidth = window.innerWidth - paddings;

      const scale =
        (((containerWidth - pocketMargins) / pocketsInTheRow) *
          defaultScale) /
        defaultPocketWidth;
      this.moveToPocketScaleFactor = scale;
    }
  }

  ngAfterViewInit() {
    this.onResized();
  }

  setAdditionalContainerClass(
    blockName: string,
    className: string,
    isAdd: boolean,
    isParentAvailable = true
  ) {
    const elements = document.getElementsByClassName(blockName);

    if (elements?.length) {
      if (elements?.length) {
        for (let i = 0; i <= elements?.length - 1; i++) {
          isAdd
            ? !elements[i].classList.contains('isDefault')
              ? elements[i].classList.add(className)
              : elements[i].classList.remove(className)
            : elements[i].classList.remove(className);
        }
      }
      if (this.pocketContainer?.nativeElement && isParentAvailable) {
        isAdd
          ? this.pocketContainer.nativeElement.classList.add(
            className
          )
          : this.pocketContainer.nativeElement.classList.remove(
            className
          );
      }
    }
  }

  getAllPockets() {
    this.showPocketsLoader = true;
    this.openedPocketContent = null;
    this.myPockets = null;

    this.pocketsSubscription.add(
      this.myPocketsService.getAllPockets().subscribe((result) => {
        if (result && result.data.length) {
          this.myPockets = result.data;
          this.openedPocket = null;
          this.inviteId = null;
          this.showPocketsLoader = false;
          this.onResized();
        }
      })
    );
  }

  getPocketsColor() {
    this.myPocketsColors = this.myPocketsService.getMyPocketsColor();
  }

  getPocketContent(event, pocketId: number, pocketName: string) {
    const path =
      event?.path || (event?.composedPath && event?.composedPath());

    if (this.mobileContextMenu) {
      this.mobileContextMenu = false;
    }
    if (
      event &&
      path.find(
        (x) => x.className && x.className.includes('mark-container')
      )
    ) {
      return;
    }

    this.showPocketsLoader = true;
    this.storageService.setItem(
      AppSettings.POCKET_NAME,
      pocketName ? pocketName : ''
    );

    this.router.navigate(
      pocketId ? ['/account/pockets/' + pocketId] : ['/account/pockets']
    );
  }

  getPocketContentById(pocketId) {
    this.showPocketsLoader = true;
    const paramsFromStorage: { name: string; isSubmit: boolean } =
      this.storageService.getItem(AppSettings.SEARCH_POCKET_PARAMS, true);

    this.pocketsSubscription.add(
      this.myPocketsService
        .getPocketContent(
          pocketId,
          true,
          paramsFromStorage?.name && paramsFromStorage?.isSubmit
            ? paramsFromStorage.name
            : ''
        )
        .subscribe((result) => {
          if (result && result.data?.content?.length) {
            this.openedPocket = {
              name: JSON.parse(
                this.storageService.getItem(
                  AppSettings.POCKET_NAME
                )
              ),
              id: pocketId
            };
            this.openedPocketContent = result.data.content;

            this.isOrganizationBusinesses =
              result.data.organizationId;
            this.showPocketsLoader = false;
            this.selectedPockets = [];
            this.onResized();

            setTimeout(() => {
              this.handleSwitchToPocketContent();
            }, 500);
          } else {
          }
          if (
            this.storageService.getItem(
              AppSettings.SEARCH_POCKET_PARAMS
            )
          ) {
            this.searchText =
              paramsFromStorage?.name &&
              paramsFromStorage?.isSubmit
                ? {name: paramsFromStorage.name}
                : '';
          }

          if (result && !result.data?.content?.length) {
            this.openedPocket = null;
            this.openedPocketContent = null;
            this.selectedPockets = [];
            this.showPocketsLoader = false;
            this.noItemsAvailable = true;
            this.onResized();
            this.goBackToAllPockets();
          }
        })
    );
  }

  getPocketContentByInviteId(inviteId) {
    this.showPocketsLoader = true;
    this.employerPortalService
      .getEmployerPortalInviteInfo(inviteId)
      .subscribe(
        (result) => {
          this.organizationName = result.data.organizationName;
          this.myPocketsService
            .getInvitePocketContent(inviteId)
            .subscribe((res) => {
              if (res && res.data?.length) {
                this.openedPocket = {
                  name: this.organizationName,
                  id: 0
                };
                this.openedPocketContent = res.data;
                this.showPocketsLoader = false;
                this.selectedPockets = [];
                this.onResized();
              }

              if (result && !res.data?.length) {
                this.openedPocket = null;
                this.openedPocketContent = null;
                this.selectedPockets = [];
                this.showPocketsLoader = false;
                this.noItemsAvailable = true;
                this.onResized();
                this.goBackToAllPockets();
              }
            });
        },
        (error) => {
          this.uiService.errorMessage(
            error.Message
              ? error.Message
              : 'Error while attaching PitchCard'
          );
          setTimeout(
            () => this.router.navigate(['/account/my-pitchcards']),
            3000
          );
        }
      );
  }

  handleSwitchToPocketContent() {
    this.disableRearrange = !this.isDesktop;
    if (this.disableRearrange) {
      this.setAdditionalContainerClass(
        'pitchCard-container',
        'notDraggable',
        true,
        false
      );
    }
  }

  handleDetailsPocketModal(mode: string | null, pocket?: MyPocket) {
    if (this.contextMenu) {
      this.contextMenu = false;
    }

    switch (mode) {
      case 'create':
        this.detailsPocketModal = true;
        this.detailPocketMode = mode;
        break;
      case 'edit':
        this.detailsPocketModal = true;
        this.detailPocketMode = mode;
        this.newPocketName = pocket
          ? pocket.name
          : this.selectedPockets[0].name;
        this.newPocketColor = pocket
          ? this.myPocketsColors[pocket.color]
          : this.myPocketsColors[this.selectedPockets[0].color];
        break;
      default:
        this.detailsPocketModal = null;
        this.detailPocketMode = mode;
        break;
    }
  }

  handleRemoveConfirmationModal() {
    if (this.contextMenu) {
      this.contextMenu = false;
    }
    if (this.mobileContextMenu) {
      this.mobileContextMenu = false;
    }

    this.removeConfirmationModal = !this.removeConfirmationModal;
  }

  searchInit(event, isSubmit) {
    event.query
      ? this.searchPockets({
        searchValue: event.query,
        searchSuggestions: true
      })
      : this.searchPockets({
        searchValue: this.searchText,
        searchSuggestions: false
      });
    this.storageService.setItem(AppSettings.SEARCH_POCKET_PARAMS, {
      name: this.searchText,
      isSubmit: isSubmit
    });
  }

  searchPockets(searchObject) {
    this.myPocketsService
      .getAllPockets(searchObject.searchValue)
      .subscribe((result) => {
        if (result.data) {
          if (searchObject.searchSuggestions) {
            this.results = result.data;
            this.hasContent = !!this.results.find(
              (pocket: any) => pocket?.content?.length
            );
          } else {
            this.myPockets = result.data.filter(
              (pocket: any) => pocket?.content?.length
            );
          }
        }
      });
  }

  selectPocketFromSuggests(event) {
    if (!this.hasContent) {
      this.searchText = '';
      return;
    }

    if (event) {
      const searchParams: { name; isSubmit } =
        this.storageService.getItem(
          AppSettings.SEARCH_POCKET_PARAMS,
          true
        );
      this.searchText = searchParams?.name
        ? {name: searchParams?.name}
        : event?.name;
      this.myPockets = [event];
      this.storageService.setItem(AppSettings.SEARCH_POCKET_PARAMS, {
        ...searchParams,
        isSubmit: true
      });
    }
    if (this.route.snapshot.params?.id && this.openedPocketContent) {
      this.openedPocketContent = event.content;
      this.openedPocket = {name: event.name, id: event.id};
      this.storageService.setItem(
        AppSettings.POCKET_NAME,
        event?.name ? event.name : ''
      );
    }
  }

  selectNewPocketColor(color: string | null) {
    this.newPocketColor = color;
    this.modalErrors.newPocketColor = null;
  }

  newPocketSubmit(params) {
    this.detailPocketMode === 'create'
      ? this.createPocket(params)
      : this.editPocket(params);
  }

  detailsModalValidate() {
    let nameMessage: string = null;
    let colorMessage: string = null;
    const errors = {
      newPocketName: null,
      newPocketColor: null
    };

    if (!this.newPocketName) {
      nameMessage = 'The name field is required';
    }

    if (this.newPocketName && this.newPocketName.length > 35) {
      nameMessage = 'Max number of characters is 35';
    }

    colorMessage = !this.newPocketColor
      ? 'The color field is required'
      : null;
    errors.newPocketName = nameMessage;
    errors.newPocketColor = colorMessage;
    this.modalErrors = {...errors};

    return nameMessage || colorMessage ? 'invalid' : 'valid';
  }

  createPocket(params: { name: string; color: number }) {
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

  editPocket(params: { name: string; color: number }) {
    const editParams = {
      ...params,
      id: this.contextPocket
        ? this.contextPocket.id
        : this.selectedPockets[0].id
    };

    this.myPocketsService.updatePocket(editParams).subscribe(
      (result) => {
        const message = 'The pocket was edited successfully';

        this.finishPocketProcess(result, message);
      },
      (error) => {
        const message = 'Error while Pocket editing';

        this.errorPocketProcess(error, message);
      }
    );
  }

  finishPocketProcess(result: any, message: string) {
    if (result.data) {
      this.getAllPockets();
      this.handleDetailsPocketModal(null);
      this.selectedPockets = [];

      setTimeout(() => {
        this.uiService.successMessage(message, true, 'main', 3000);
      }, 1000);
    }
  }

  errorPocketProcess(error: any, message: string) {
    setTimeout(() => {
      this.uiService.errorMessage(
        error.message ? error.message : message,
        'main',
        3000
      );
    }, 1000);
  }

  clearDetailsModalOptions() {
    this.newPocketName = null;
    this.newPocketColor = null;
    this.modalErrors = {
      newPocketName: null,
      newPocketColor: null
    };
  }

  selectPocket(pocket: MyPocket) {
    if (this.selectedPockets.some((item) => item.id === pocket.id)) {
      this.selectedPockets = this.selectedPockets.filter(
        (item) => item.id !== pocket.id
      );
    } else {
      this.selectedPockets.push(pocket);
    }
  }

  onRightClick(event: MouseEvent, pocketContent?: any, pocket?: MyPocket) {
    this.contextMenuX = event.pageX;
    this.contextMenuY = event.pageY;
    if (!this.deviceService.isMobile()) {
      this.contextMenu = true;
    }

    if (pocketContent) {
      this.contextBusiness = pocketContent.business;
      this.mobileContextMenuPitchCard = pocketContent.business;
      this.contextMenuPitchCard = pocketContent.business;
      this.contextContentId = pocketContent.id;
    }

    if (pocket) {
      this.contextPocket = pocket;
    }
  }

  handleMobileContextMenu(event, pocketContent?: any, pocket?: MyPocket) {
    if (this.isRearranging) {
      return;
    }
    const path = event.path || (event.composedPath && event.composedPath());

    if (
      event &&
      path.find(
        (x) => x.className && x.className.includes('share-button')
      )
    ) {
      return;
    }
    if (
      event &&
      path.find(
        (x) => x.className && x.className.includes('mark-container')
      )
    ) {
      return;
    }

    if (pocketContent) {
      this.contextContentId = pocketContent.id;
      this.contextBusiness = pocketContent.business;
    }

    if (pocket) {
      this.contextPocket = pocket;
    }

    if (this.inviteId) {
      this.handleViewPitchCard();
    } else {
      this.mobileContextMenu = true;
    }
  }

  attachPitchCard(pocketContent: any) {
    this.employerPortalService
      .attachPitchCard(this.inviteId, pocketContent.business.id)
      .subscribe(
        (result) => {
          this.confirmationService.confirm({
            message: `Your PitchCard has been added to ${this.organizationName}!`,
            key: 'attachPitchCardConfirmation',
            accept: () => {
              this.confirmationService.close();
              this.inviteId = null;
              this.router.navigate(['/account/my-pitchcards']);
            }
          });
        },
        (error) => {
          this.uiService.errorMessage(
            error.Message
              ? error.Message
              : 'Error while attaching PitchCard'
          );
        }
      );
  }

  checkSelectedPocket(pocket: MyPocket) {
    return this.selectedPockets.some((item) => item.id === pocket.id);
  }

  hasDefaultPockets() {
    return this.selectedPockets.find((p: any) => p?.default);
  }

  submitRemoving() {
    const selectedIds = {
      pocketIds: []
    };
    const removingPockets = this.contextPocket
      ? [this.contextPocket]
      : this.selectedPockets;

    removingPockets.forEach((pocket) =>
      selectedIds.pocketIds.push(pocket.id)
    );
    this.myPocketsService.removePockets(selectedIds).subscribe(
      (result) => {
        if (result.data) {
          this.selectedPockets = [];
          this.handleRemoveConfirmationModal();
          this.getAllPockets();

          setTimeout(() => {
            this.uiService.successMessage(
              'The Pocket was removed successfully',
              true,
              'main',
              3000
            );
          }, 1000);
        }
      },
      (error) => {
        const message = error.Message
          ? error.Message
          : 'Error While removing Pocket';

        setTimeout(() => {
          this.uiService.successMessage(message, true, 'main', 3000);
        }, 1000);
      }
    );
  }

  handleSharePocket(pocket?: MyPocket) {
    if (this.contextMenu) {
      this.contextMenu = false;
    }
    if (this.mobileContextMenu) {
      this.mobileContextMenu = false;
    }

    this.shareDialogHeader = 'label_share_pocket_header';

    this.pocketsSubscription.add(
      this.myPocketsService
        .getEncryptedPocketId(
          pocket ? pocket.id : this.selectedPockets[0].id
        )
        .subscribe((result) => {
          if (result.data) {
            if (this.isBrowser) {
              // tslint:disable-next-line: max-line-length
              this.shareUrl = encodeURI(
                `${window.location.origin}/pocket/${result.data}`
              );
            }
          }
        })
    );

    this.showSharingOptions = true;
  }

  handleSharePitchCard(event) {
    if (this.contextMenu) {
      this.contextMenu = false;
    }
    if (this.mobileContextMenu) {
      this.mobileContextMenu = false;
    }

    this.shareDialogHeader = 'label_share_header';
    if (this.isBrowser) {
      // tslint:disable-next-line: max-line-length
      this.shareUrl = encodeURI(
        `${window.location.origin}/card/${event.alias}`
      );
    }

    this.showSharingOptions = true;
  }

  handleTitleClick(event: any) {
    const {title, businessDetails} = event;

    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(businessDetails);
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  handleMoveToModal(copy?) {
    if (copy) {
      this.copyMode = true;
    }

    this.pocketsSubscription.add(
      this.myPocketsService.getAllPockets().subscribe((result) => {
        if (result && result.data.length) {
          result.data.map((p) => {
            p.color = this.myPocketsColors[p.color].substring(1);
          });
          this.myPocketsForModal = result.data;
        }
      })
    );

    this.contextMenu = false;
    this.mobileContextMenu = false;
    this.moveToModal = true;
  }

  getModalPockets() {
    if (this.moveToModal) {
      if (!this.myPockets) {
        return this.myPocketsForModal
          ? this.withoutOrganizationPockets(this.myPocketsForModal)
          : [];
      } else {
        const modalPockets = [...this.myPockets].filter(
          (pocket) => pocket.id !== this.openedPocket.id
        );

        modalPockets.forEach((pocket) => {
          if (typeof pocket.color !== 'string') {
            pocket.color =
              this.myPocketsColors[pocket.color].substr(1);
          }
        });

        return modalPockets;
      }
    }
  }

  withoutOrganizationPockets(pockets) {
    const noTeamPockets = [];
    pockets.map((p) => {
      if (!p.organizationId) {
        noTeamPockets.push(p);
      }
    });
    return noTeamPockets;
  }

  moveBusinessToPocket(moveToId: number) {
    this.myPocketsService
      .moveBusinessToPocket(
        this.openedPocket.id,
        this.contextBusiness.id,
        moveToId
      )
      .subscribe(
        (result) => {
          if (result.data) {
            this.moveToModal = false;
            this.getPocketContentById(this.openedPocket.id);

            setTimeout(() => {
              this.uiService.successMessage(
                'The PitchCard was moved successfully',
                true,
                'main',
                3000
              );
            }, 1000);
          }
        },
        (error) => {
          const message = error.Message
            ? error.Message
            : 'Error while moving PitchCard';

          setTimeout(() => {
            this.uiService.errorMessage(message, 'main', 3000);
          }, 1000);
        }
      );
  }

  copyBusinessToPocket(moveToId: number) {
    this.myPocketsService
      .addBusinessToPocket(this.contextBusiness.id, moveToId)
      .subscribe(
        (result) => {
          if (result.data) {
            this.moveToModal = false;
            this.getPocketContentById(this.openedPocket.id);

            setTimeout(() => {
              this.uiService.successMessage(
                'The PitchCard was copied successfully',
                true,
                'main',
                3000
              );
            }, 1000);
          }
        },
        (error) => {
          const message = error.Message
            ? error.Message
            : 'Error while copying PitchCard';

          setTimeout(() => {
            this.uiService.errorMessage(message, 'main', 3000);
          }, 1000);
        }
      );
  }

  handleRemoveBusiness() {
    this.contextMenu = false;
    this.mobileContextMenu = false;
    this.showPocketsLoader = true;
    this.myPocketsService
      .removeBusinessFromPocket(
        this.openedPocket.id,
        this.contextContentId
      )
      .subscribe(
        (result) => {
          if (result.data) {
            this.getPocketContent(
              null,
              this.openedPocket.id,
              this.openedPocket.name
            );
            this.getPocketContentById(this.openedPocket.id);

            setTimeout(() => {
              this.uiService.successMessage(
                'The PitchCard was removed successfully',
                true,
                'main',
                3000
              );
            }, 1000);
          }
        },
        (error) => {
          const message = error.Message
            ? error.Message
            : 'Error while removing PitchCard';

          setTimeout(() => {
            this.uiService.errorMessage(message, 'main', 3000);
          }, 1000);
        }
      );
  }

  handleViewPitchCard() {
    this.pitchCardPreviewMode = !this.pitchCardPreviewMode;
    this.contextMenu = false;
    this.mobileContextMenu = false;
    this.addContextBusinessToService();
  }

  addContextBusinessToService() {
    if (this.mobileMode) {
      this.pitchCardModalsWrapperService.setCurrentBusiness(
        this.mobileContextMenuPitchCard
      );
      return;
    }
    this.pitchCardModalsWrapperService.setCurrentBusiness(
      this.contextMenuPitchCard
    );
  }

  savePitchCardOnPreview() {
    if (this.mobileMode) {
      this.pitchCardOnPreview = this.mobileContextMenuPitchCard;
      return;
    }
    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardOnPreview = this.contextMenuPitchCard;
  }

  handlePitchCardTitleClick(clickEvent: any) {
    const {title} = clickEvent;
    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(
      this.contextBusiness as BusinessDetails
    );
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  clearPitchCardOnPreview() {
    this.pitchCardOnPreview = null;
  }

  calculateMarginLeft(parentWrap, items) {
    if (
      parentWrap &&
      window.innerWidth > 800 &&
      window.innerWidth < 1100 &&
      items?.length
    ) {
      const parentWrapWidth = parentWrap.clientWidth;
      const childWidth = parentWrap.firstChild.clientWidth;
      const countChildrenInRow = Math.round(parentWrapWidth / childWidth);
      const spaces = countChildrenInRow - 1;
      return (
        (parentWrapWidth - childWidth * countChildrenInRow) / spaces +
        'px'
      );
    } else {
      return '0';
    }
  }

  setupScrollEvent() {
    const _this = this;
    window.addEventListener(
      'touchmove',
      (e) => {
        e.returnValue = true;
        if (_this.dragging) {
          e.preventDefault();
        }
      },
      {
        passive: _this.dragging
      }
    );
  }

  preventBehavior(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  goBackToAllPockets() {
    this.storageService.removeItem(AppSettings.SEARCH_POCKET_PARAMS);
    this.router.navigate(['/account/pockets']);
  }
}
