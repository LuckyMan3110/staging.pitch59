import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PitchCardService } from '../../modules/pitch-card-shared/services/pitch-card.service';
import { UniqueComponentId } from 'primeng/utils';
import { BusinessDetails } from '../../modules/business/models/business-detail.model';
import { PitchCardModalsWrapperService } from '../../modules/pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { SearchResultThumbnailComponent } from '../../modules/pitch-card-shared/components/search-result-thumbnail/search-result-thumbnail.component';
import { CommonBindingDataService } from '../../modules/shared/services/common-binding-data.service';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { UiService } from '../../modules/shared/services/ui.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { CustomerAnalyticsService } from '../../modules/choosen-history/services/customer-analytics.service';

@Component({
  selector: 'app-pitch-card',
  templateUrl: './pitch-card.component.html',
  styleUrls: ['./pitch-card.component.scss']
})
export class PitchCardComponent implements OnInit {
  alias: string;
  businessDetails: any;
  uniqueId: string;

  pitchCardDefaultWidth = 360;
  pitchCardDefaultHeight = 575;
  logoDefaultSize = 100;
  defaultPaddings = 30;
  isPlayThumbnailVideo = true;
  windowHeight = window.innerHeight + 'px';
  isMobile: boolean = this.deviceService.isMobile();
  isSafari: boolean = this.deviceService.browser === 'Safari';
  safariFactor: number;

  @ViewChildren(SearchResultThumbnailComponent)
  card: QueryList<SearchResultThumbnailComponent>;

  @ViewChild('previewCard') previewCard: SearchResultThumbnailComponent;

  @ViewChild('pitchCardWrapper', {static: false})
  pitchCardWrapper: ElementRef;

  @HostBinding('style.--height-padding') get paddings() {
    return this.cardPackageService.getPaddings();
  }

  @HostBinding('style.--scale-factor') get scale() {
    return this.cardPackageService.getScaleFactor(
      this.isSafari && this.isMobile,
      this.safariFactor
    );
  }

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    const classes = event.target?.classList;
    const parentNodes = this.commonBindingService.getParentNodes(
      classes,
      'contact-menu-container'
    );

    if (
      !parentNodes?.length &&
      !event.target.classList.contains('contact-menu-button') &&
      this.previewCard
    ) {
      this.previewCard.toggleContactMenu(null);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowHeight = window.innerHeight + 'px';
    this.isMobile = this.deviceService.isMobile();
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event) {
    this.safariFactor = null;
  }

  constructor(
    private pitchCardService: PitchCardService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceDetectorService,
    private analyticsService: CustomerAnalyticsService,
    private cardPackageService: CardPackageService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private commonBindingService: CommonBindingDataService,
    private uiService: UiService,
    private userService: UserCommonService
  ) {
    this.activateRoute.params.subscribe((params) => {
      this.alias = params.alias || '';
      this.getPitchCard();
    });
  }

  ngOnInit(): void {
    this.uniqueId = UniqueComponentId();

    this.isPlayThumbnailVideo = this.activateRoute?.snapshot?.queryParams
      ?.thumbnail
      ? !JSON.parse(this.activateRoute.snapshot.queryParams.thumbnail)
      : true;

    this.safariFactor = this.scale;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';
    document.body.style.height = '100%';
  }

  goToPage(path) {
    this.router.navigate([path]);
  }

  playInlineVideo() {
    if (this.businessDetails?.videoFileUrl) {
      setTimeout(() => {
        this.previewCard.initVideo = true;
        this.previewCard.loadVideo({muted: true});
      }, 3000);
    }
  }

  handlePitchCardTitleClick(clickEvent: any) {
    const {title} = clickEvent;
    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(
      this.businessDetails as BusinessDetails
    );
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  getScaleFactor() {
    return this.cardPackageService.getScaleFactor();
  }

  stopScroll(e) {
    if (this.isMobile && this.isSafari) {
      e.preventDefault();
    }
  }

  async getPitchCard() {
    await this.userService
      .getBusinessPitchModelByAlias(this.alias)
      .subscribe(
        ({data}) => {
          this.businessDetails = data;
        },
        (err) => {
          this.uiService.errorMessage(
            err?.message
              ? err.message
              : this.commonBindingService.getLabel('err_server')
          );
        }
      );
  }
}
