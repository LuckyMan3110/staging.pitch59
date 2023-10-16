import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
  HostListener,
  HostBinding
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Carousel } from 'primeng/carousel';
import { OverlayPanel } from 'primeng/overlaypanel';

import { BusinessModel } from '../../../business/models/business.model';
import { MyPitchCardFolder } from '../../models/my-pitchcard-folder.model';
import { UserSharedModel } from '../../models/user-shared.model';

import { StorageService } from '../../../shared/services/storage.service';
import { MyPocketsService } from '../../services/my-pockets.service';
import { MyPitchCardsService } from '../../services/my-pitch-cards.service';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { BusinessService } from '../../../business/services/business.service';

import { AppSettings } from '../../../shared/app.settings';
import { BusinessStatus } from '../../../business/enums/business.status';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { LoaderState } from '../../../shared/components/loader/loader';
import { GroupsService } from '../../services/groups.service';
import { FolderContentRole } from '../../enums/folder-content-role.enum';
import FolderPath from '../../models/folder-path.model';
import FolderHierarchy from '../../models/folder-hierarchy.model';
import RemoveList from '../../models/remove-list.model';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'app-account-groups-pitch-cards',
    templateUrl: './groups-pitch-cards.component.html',
    styleUrls: ['./groups-pitch-cards.component.scss'],
    providers: [GroupsService, MyPocketsService, MyPitchCardsService]
})
export class GroupsPitchCardsComponent implements OnInit, OnDestroy {
    contextMenu: boolean = false;
    contextMenuX: number = 0;
    contextMenuY: number = 0;
    contextMenuBusiness: MyPitchCardFolder = null;
  appLoader: boolean = false;
  subscription: any;
  folderIdParam: number = 0;
  groupIdParam: number = null;
  modalFolderIdParam: number = 0;
  folderPath: FolderPath[] = [
    {
      id: 0,
      name: 'Group PitchCards'
    }
  ];
  modalFolderPath: FolderPath[] = [];
  myPitchCardsList: MyPitchCardFolder[] = [];
  allFolders: FolderHierarchy[] = [];
  noFolders: boolean = false;
  selectedPitchCards: MyPitchCardFolder[] = [];
  folderContentUsers: UserSharedModel[] = [];
  businessStatusList = BusinessStatus;
  userRolesList = FolderContentRole;
  pitchCardsNumber: number = 0;
  detailsFolderModal: boolean = false;
  detailsFolderMode: string | null = null;
    moveToModal: boolean = false;
    removeModal: boolean = false;
    accessModal: boolean = false;
  removeWithContent: boolean = false;
  removeList: RemoveList = {};
  modalErrors = {
    newFolderName: null,
    newFolderColor: null
  };
    newFolderName: string | null = null;
    newFolderColor: string | null = null;
    myFoldersColors: string[];
    noPitchCardsAvailable = false;
    scaleFactor: number = 0.5;
    numVisible: number = 4;
    numScroll: number = 1;
    showPitchCardsLoader: boolean = false;
    showCreateLoader: boolean = false;
    showRemoveLoader: boolean = false;
    showMoveLoader: boolean = false;
    userTableLoaded: boolean = false;
    currentFolderButton: any = null;
    newUserInput: UserSharedModel;
    allGroupUsers: UserSharedModel[];
    newUserRole: any;
    allUserRoles: any[];
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

  @ViewChild('carousel', {static: false}) carousel: Carousel;
  @ViewChild('pitchCardsWrapper', {static: false})
  pitchCardsWrapper: ElementRef;
  @ViewChild('userSettingsMenu') userSettingsMenu: OverlayPanel;

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const path = event.path || (event.composedPath && event.composedPath());

    if (
      !path.find((x) => x.className && x.className.includes('btn status'))
    ) {
      this.contextMenu = false;
    }

    if (
      !path.find(
        (x) =>
          x.className &&
          (x.className.includes('btn remove') ||
            x.className.includes('btn edit') ||
            x.className.includes('btn moveTo') ||
            x.className.includes('new-folder-modal') ||
            x.className.includes('move-to-modal') ||
            x.className.includes('remove-modal') ||
            x.className.includes('btn access') ||
            x.className.includes('btn request') ||
            x.className.includes('btn status'))
      )
    ) {
      //if (this.contextMenuBusiness) this.contextMenuBusiness = null;
    }

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
    private storageService: StorageService,
    private myPocketsService: MyPocketsService,
    private myPitchCardsService: MyPitchCardsService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private cardPackagesService: CardPackageService,
    private loaderService: LoaderService,
    private businessService: BusinessService,
        private groupService: GroupsService
    ) {
    this.onResized = this.onResized.bind(this);
    this.subscription = combineLatest([
      this.activateRoute.params,
      this.activateRoute.queryParams
    ]).subscribe(([params, query]) => {
      this.folderIdParam = params.id ? params.id : 0;
      this.groupIdParam = query.groupId ? query.groupId : null;
      this.myPitchCardsList = [];
      this.loadMyPitchCardsList();
      this.getFoldersColor();
    });

    this.subscription = this.loaderService.loaderState.subscribe(
      (state: LoaderState) => {
        this.appLoader = state.show;
      }
    );
  }

    ngOnInit(): void {
        window.addEventListener('resize', this.onResized);
        this.onResized();
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
        if (this.carousel) {
            this.carousel.page = 0;
        }

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
            (((this.pitchCardsWrapper.nativeElement.clientWidth -
                  allCardsMargin) /
                cardsOnRow) *
              defaultScale) /
            defaultCardWidth;
        } else {
          this.scaleFactor = 0.5;
        }
    }

    getFoldersColor() {
        this.myFoldersColors = this.myPocketsService.getMyPocketsColor();
    }

    loadMyPitchCardsList() {
      this.noPitchCardsAvailable = false;
      this.showPitchCardsLoader = true;

      this.subscription = this.myPitchCardsService
        .getSharedPitchCards(this.folderIdParam, this.groupIdParam)
        .subscribe((result) => {
          if (result.data) {
            this.showPitchCardsLoader = false;
            this.pitchCardsNumber = 0;
            this.myPitchCardsList = result.data.content;
            this.folderPath = result.data.path;
            this.myPitchCardsList.forEach(
              (business) => (this.pitchCardsNumber += business.count)
            );

            if (!result.data.content.length) {
              this.noPitchCardsAvailable = true;
            }
          }
        });
    }

  getFolderHierarchy(folderId: number) {
    if (this.carousel) {
      this.carousel.page = 0;
    }

    this.currentFolderButton = null;
    this.modalFolderIdParam = folderId;
    this.noFolders = false;
    this.subscription = this.myPitchCardsService
      .getSharedFolderHierarchy(folderId)
      .subscribe((result) => {
        if (result.data) {
          if (!result.data.id && !result.data.children.length) {
            this.noFolders = true;
          }

          this.allFolders = result.data.children;

          if (this.contextMenuBusiness) {
            this.allFolders = this.allFolders.filter(
              (folder) => this.contextMenuBusiness.id != folder.id
            );
          } else {
            this.allFolders = this.allFolders.filter(
              (folder) =>
                !this.selectedPitchCards.some(
                  (sel) => sel.id == folder.id
                )
            );
          }

          if (this.folderIdParam != result.data.id) {
            this.currentFolderButton = {
              name: result.data.name,
              id: result.data.id
            };
          }

          if (!this.moveToModal) {
            this.moveToModal = true;
          }
        }
      });

    this.subscription = this.myPitchCardsService
      .getSharedPitchCards(folderId)
      .subscribe((result) => {
        if (result.data) {
          this.modalFolderPath = result.data.path;
        }
      });
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

    onBusinessSelect(pitchCard: BusinessModel) {
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
            this.newFolderName = this.contextMenuBusiness
              ? this.contextMenuBusiness.name
              : this.selectedPitchCards[0].name;
            this.newFolderColor =
              '#' +
              (this.contextMenuBusiness
                ? this.contextMenuBusiness.color
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

    handleRemoveModal() {
        if (!this.removeModal) {
            this.getRemoveList();
            this.removeWithContent = false;
        }

        if (this.removeModal) this.contextMenuBusiness = null;

        this.removeModal = !this.removeModal;
    }

    handleAccessModal() {
        if (!this.accessModal) {
            this.getFolderContentsUsers(this.contextMenuBusiness.id);
        }

        this.accessModal = !this.accessModal;
    }

    clearModalOptions() {
        this.newFolderName = null;
        this.newFolderColor = null;
      this.contextMenuBusiness = null;
      this.modalErrors = {
        newFolderName: null,
        newFolderColor: null
      };
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

        if (this.contextMenuBusiness) {
          contentdIds.push({
            id: this.contextMenuBusiness.id,
            type: this.contextMenuBusiness.type
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

      this.showMoveLoader = true;
      this.subscription = this.myPitchCardsService
        .addContentToFolder(params)
        .subscribe((result) => {
          if (result.data) {
            this.showMoveLoader = false;
            this.selectedPitchCards = [];
            this.contextMenuBusiness = null;
            this.loadMyPitchCardsList();
            this.handleMoveToModal();
          }
        });
    }

    newFolderSubmit() {
        if (!this.newFolderName || !this.newFolderColor) {
            if (!this.newFolderName || this.newFolderName.length > 35) {
              const message = !this.newFolderName
                ? 'The name field is required'
                : 'Max number of characters is 35';
              this.modalErrors = {
                ...this.modalErrors,
                newFolderName: message
              };
            }
            if (!this.newFolderColor) {
              this.modalErrors = {
                ...this.modalErrors,
                newFolderColor: 'The color field is required'
              };
            }
        } else {
            this.showCreateLoader = true;

            if (this.detailsFolderMode === 'create') {
              const params = {
                name: this.newFolderName,
                color: this.newFolderColor,
                parentId: this.folderIdParam
              };

              this.subscription = this.myPitchCardsService
                .createNewSharedFolder(params)
                .subscribe((result) => {
                  if (result.data) {
                    this.loadMyPitchCardsList();
                    this.showCreateLoader = false;
                    this.handleDetailsFolderModal(null);
                  }
                });
            } else {
              const params = {
                id: this.contextMenuBusiness
                  ? this.contextMenuBusiness.id
                  : this.selectedPitchCards[0].id,
                color: this.newFolderColor,
                name: this.newFolderName
              };

              this.subscription = this.myPitchCardsService
                .editSharedFolder(params)
                .subscribe((result) => {
                  if (result.data) {
                    this.loadMyPitchCardsList();
                    this.showCreateLoader = false;
                    this.contextMenuBusiness = null;
                    this.handleDetailsFolderModal(null);
                  }
                });
            }
        }
    }

    removeFolderSubmit() {
        const foldersIds = [];

        if (this.contextMenuBusiness) {
          foldersIds.push(this.contextMenuBusiness.id);
        } else {
          this.selectedPitchCards.forEach((card) => foldersIds.push(card.id));
        }

      const params = {
        contentIds: foldersIds,
        withContent: this.removeWithContent
      };

      this.showRemoveLoader = true;
      this.subscription = this.myPitchCardsService
        .removeContent(params)
        .subscribe((result) => {
          if (result.data) {
            this.showRemoveLoader = false;
            this.selectedPitchCards = [];
            this.contextMenuBusiness = null;
            this.loadMyPitchCardsList();
            this.handleRemoveModal();
          }
        });
    }

    handleFolderOpen(folderId: number) {
      var pitchCard = this.myPitchCardsList.find((x) => x.id == folderId);
      if (pitchCard.organizationId) {
        this.router.navigate([`/account/groups-pitchcards`, folderId], {
          queryParams: {groupId: pitchCard.organizationId}
        });
      } else {
        this.router.navigate([`/account/groups-pitchcards`, folderId]);
      }
    }

    handleOpenModalFolder(folderId: number) {
        this.getFolderHierarchy(folderId);
    }

    onRightClick(event: MouseEvent, pitchCard: MyPitchCardFolder) {
      if (pitchCard && pitchCard.organizationId) {
        return;
      }
      this.contextMenuBusiness = pitchCard;
      this.contextMenuX = event.pageX;
      this.contextMenuY = event.pageY;
      this.contextMenu = true;
    }

    handleUsersInput(event: any) {
      var query = event.query;
      this.groupService.getUsersInUsersGroup(query).subscribe((result) => {
        result.data.forEach((el) => {
          el.fullNameEmail = `${el.firstName} ${el.lastName} (${el.emailId})`;
        });

        var userIds = this.folderContentUsers.map((x) => x.id);
        this.allGroupUsers = result.data.filter(
          (x) => !userIds.includes(x.id)
        );
      });
    }

    handleRolesDropdowd() {
      this.allUserRoles = [
        {id: 1, name: 'Admin'},
        {id: 2, name: 'Manager'},
        {id: 3, name: 'Editor'}
      ];
    }

    handleRequestApproval() {
      const businessId = this.contextMenuBusiness.content.id;

      this.subscription = this.businessService
        .requestApprove(businessId)
        .subscribe((result) => {
          if (result.data) {
            this.loadMyPitchCardsList();
            this.contextMenuBusiness = null;
          }
        });
    }

    handlePitchCardStatus() {
      this.contextMenuBusiness.content.accountStatus =
        !this.contextMenuBusiness.content.accountStatus;
      const businessId = this.contextMenuBusiness.content.id;
      const updatedStatus = this.contextMenuBusiness.content.accountStatus;

      this.businessService
        .activateDeactiveAccountStatus(businessId, updatedStatus)
        .subscribe((result) => {
          if (result) {
            this.contextMenu = false;
            this.loadMyPitchCardsList();
            this.contextMenuBusiness = null;
          }
        });
    }
}
