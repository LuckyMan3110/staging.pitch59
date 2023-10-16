import {
  Component,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MyPocketsService } from '../../../modules/choosen-history/services/my-pockets.service';
import { BusinessDetails } from '../../../modules/business/models/business-detail.model';
import { PitchCardModalsWrapperService } from '../../../modules/pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { UniqueComponentId } from 'primeng/utils';
import { CardPackageService } from '../../../modules/cards-packages/services/card-package.service';
import { UserCommonService } from '../../../modules/shared/services/user-common.service';
import { UiService } from '../../../modules/shared/services/ui.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CommonBindingDataService } from '../../../modules/shared/services/common-binding-data.service';
import { Carousel } from 'primeng/carousel';

@Component({
  selector: 'app-shared-pocket',
  templateUrl: './shared-pocket.component.html',
  styleUrls: [
    './shared-pocket.component.scss',
    '../../pitch-card/pitch-card.component.scss'
  ]
})
export class SharedPocketComponent implements OnInit, OnDestroy {
  token: string;
  pocket: any;
  uniqueId: string;

  pocketBusinessList: any[] = [];
  previewBusinessList: any[] = [];
  scaleFactor: number = 0.7;
  isPlayThumbnailVideo = false;
  pitchCardOnPreview: any = null;

  appLoader: boolean = false;
  isAuthUser: boolean = this.userCommonService.isAuthenticated();
  isMobile: boolean = this.deviceService.isMobile();
  isTablet: boolean = this.deviceService.isTablet();
  isPortraitMode = window.innerWidth < window.innerHeight;
  isAuthModalOpen: boolean = false;
  isZoomPreviewMode: boolean = false;
  isCustomPreviewMode: boolean = true;

  $pocketSubscription = new Subscription();

  @ViewChild('Carousel', {static: false}) carousel: Carousel;

  @HostBinding('style.--scale-factor') get scale() {
    return this.cardPackageService.getScaleFactor();
  }

  @HostBinding('style.--height-padding') get paddings() {
    return this.cardPackageService.getPaddings();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isPortraitMode = window.innerWidth < window.innerHeight;
    if (this.isMobile && !this.isPortraitMode) {
      this.isZoomPreviewMode = false;
      this.isCustomPreviewMode = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pocketsService: MyPocketsService,
    private userCommonService: UserCommonService,
    private deviceService: DeviceDetectorService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private cardPackageService: CardPackageService,
    private uiService: UiService,
    private bindingService: CommonBindingDataService
  ) {
  }

  ngOnInit(): void {
    this.getPocketDataFromUrl();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if (this.$pocketSubscription) {
      this.$pocketSubscription.unsubscribe();
    }
  }

  getPocketDataFromUrl() {
    this.uniqueId = UniqueComponentId();
    this.$pocketSubscription.add(
      this.route.params.subscribe((params) => {
        this.token = params?.token ? params.token : '';
        this.getPocketContentByToken();
      })
    );
  }

  getPocketContentByToken() {
    if (this.token) {
      this.$pocketSubscription.add(
        this.pocketsService
          .getPocketContentByToken(this.token)
          .subscribe(
            (res) => {
              if (res && res.data?.contents?.length) {
                this.pocketBusinessList = res.data.contents;
                this.pocket = res?.data ? res.data : null;
              }
              this.appLoader = true;
            },
            (err) => {
              this.uiService.errorMessage(
                err?.message
                  ? err.message
                  : this.bindingService.getLabel('err_server')
              );
              this.appLoader = true;
            }
          )
      );
    }
  }

  initSubscriptions() {
    if (!this.isAuthUser && this.router.url.includes('/pocket/')) {
      this.$pocketSubscription.add(
        this.userCommonService.hideLinks.subscribe(() => {
          this.isAuthUser = this.userCommonService.isAuthenticated();
          if (this.isAuthUser) {
            this.savePocket();
          }
        })
      );
    }
  }

  savePocket(e?) {
    if (e) {
      e.preventDefault();
    }
    this.$pocketSubscription.add(
      this.pocketsService.copyPocketByToken(this.token).subscribe(
        (res) => {
          if (res?.data?.success) {
            this.cardPackageService.goToPage('account/pockets');
          } else {
            this.uiService.warningMessage(
              'You can\'t save your own pocket'
            );
          }
        },
        (err) => {
          this.uiService.errorMessage(
            err?.message
              ? err.message
              : this.bindingService.getLabel('err_server')
          );
        }
      )
    );
  }

  handleAuthModal(e) {
    e.preventDefault();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {serviceurl: this.router.url}
    });
    this.pitchCardModalsWrapperService.uniqueId = this.uniqueId;
    this.pitchCardModalsWrapperService.showSignUpCommonDialog.next(true);
  }

  handlePitchCardTitleClick(clickEvent: any, business) {
    const {title} = clickEvent;
    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(
      business as BusinessDetails
    );
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  handleViewPitchCard(business) {
    if (!this.isMobile || (this.isMobile && !this.isPortraitMode)) {
      this.pitchCardOnPreview = business;
    } else {
      this.isZoomPreviewMode = true;
      setTimeout(() => {
        this.isCustomPreviewMode = false;
        this.previewBusinessList = [...this.pocketBusinessList].sort(
          (x, y) => (x == business ? -1 : y == business ? 1 : 0)
        );
      }, 500);
    }
  }

  closeZoomPreviewMode() {
    this.pitchCardOnPreview = null;
    this.isZoomPreviewMode = false;
    this.isCustomPreviewMode = true;
    this.previewBusinessList = [];
  }

  clearPitchCardOnPreview() {
    this.pitchCardOnPreview = null;
  }
}
