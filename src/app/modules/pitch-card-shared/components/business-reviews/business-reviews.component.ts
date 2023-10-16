import {
  Component,
  OnInit,
  Input,
  OnChanges,
  EventEmitter,
  Output,
  OnDestroy,
  ViewChild,
  HostListener,
  ElementRef
} from '@angular/core';
import { BusinessPitch } from '../../../business/models/business-pitch.model';
import { CustomerAnalyticsService } from '../../../choosen-history/services/customer-analytics.service';
import { UiService } from '../../../shared/services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { Carousel } from 'primeng/carousel';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PitchCardService } from '../../services/pitch-card.service';
import { Subscription } from 'rxjs';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { BusinessDetails } from '../../../business/models/business-detail.model';

@Component({
  selector: 'app-business-reviews',
  templateUrl: './business-reviews.component.html',
  styleUrls: ['./business-reviews.component.scss']
})
export class BusinessReviewsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() business: BusinessPitch | BusinessDetails;
  @Input() isOrganization: boolean = false;

  @Output() leaveAreviewClick: EventEmitter<any> = new EventEmitter();

  @Output() showVideo: EventEmitter<any> = new EventEmitter();

  loaded = false;
  averageCustomerRating = 0;
  averageQualityRating = 0;
  averageRating = -1;
  reviewsList = [];
  inlineName = false;
  reportTypes: MenuItem[];
  selectedReview: string;
  numVisible: number = this.PCService.getCarouselVisibleNumbers();
  limit = this.numVisible;
  offset = 0;
  cacheId: string = '';
  totalRecords: number;
  scaleFactor = 0.85;
  defaultReviewWidth = 340;
  currentUrl: string;
  displayName = '';
  PitchCardTypes = PitchCardType;
  responsiveOptions = this.PCService.getReviewsCarouselResponsiveOptions();
  isMobile: boolean = this.deviceService.isMobile();
  xDown;
  yDown;

  $businessReviewSub: Subscription = new Subscription();

  @ViewChild('carousel', {static: false}) carousel: Carousel;
  @ViewChild('menu', {static: true}) menu: ContextMenu;
  @ViewChild('summaryContainer', {static: true})
  summaryContainer: ElementRef;

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    if (
      this.deviceService.isMobile() &&
      this.deviceService.os === 'IOS' &&
      this.menu
    ) {
      this.menu.hide();
    }
  }

  @HostListener('window:click', ['$event'])
  handleClick(event: any) {
    if (
      event.target.classList.contains('p-carousel-next') ||
      event.target.classList.contains('pi-chevron-right')
    ) {
      this.handleSlideFront();
    }
    if (
      event.target.classList.contains('p-carousel-prev') ||
      event.target.classList.contains('pi-chevron-left')
    ) {
      this.handleSlideBack();
    }
  }

  constructor(
    private customerAnalyticsService: CustomerAnalyticsService,
    private uiService: UiService,
    private commonBindingDataService: CommonBindingDataService,
    private confirmationService: ConfirmationService,
    private deviceService: DeviceDetectorService,
    private PCService: PitchCardService,
    private loaderService: LoaderService,
    public activatedRoute: ActivatedRoute
  ) {
    this.onResized = this.onResized.bind(this);
    this.reportTypes = [
      {
        label: this.commonBindingDataService.getLabel('label_delete'),
        styleClass: 'delete',
        visible: false,
        id: '1',
        command: () => {
          this.handleDeleteModal();
        }
      },
      {
        label: 'Report',
        id: '2',
        items: [
          {
            label: this.commonBindingDataService.getLabel(
              'lbl_sexual_content'
            ),
            id: '1',
            command: (data) => {
              this.reportIssuesApiCall(data);
            }
          },
          {
            label: this.commonBindingDataService.getLabel(
              'lbl_violent_or_repulsive_content'
            ),
            id: '2',
            command: (data) => {
              this.reportIssuesApiCall(data);
            }
          },
          {
            label: this.commonBindingDataService.getLabel(
              'lbl_hateful_or_abusive_content'
            ),
            id: '3',
            command: (data) => {
              this.reportIssuesApiCall(data);
            }
          },
          {
            label: this.commonBindingDataService.getLabel(
              'lbl_harmfulor_dangerous_acts'
            ),
            id: '4',
            command: (data) => {
              this.reportIssuesApiCall(data);
            }
          },
          {
            label: this.commonBindingDataService.getLabel(
              'lbl_spam_or_misleading'
            ),
            id: '5',
            command: (data) => {
              this.reportIssuesApiCall(data);
            }
          }
        ]
      }
    ];
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.carousel) {
      if (event.keyCode === 39) {
        this.carousel.navForward(event);
      }
      if (event.keyCode === 37) {
        this.carousel.navBackward(event);
      }
    }
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.onResized);
    this.onResized();
    this.currentUrl = this.activatedRoute.snapshot['_routerState'].url;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResized);
    if (this.$businessReviewSub) {
      this.$businessReviewSub.unsubscribe();
    }
  }

  onResized() {
    if (this.business) {
      if (this.displayName) {
        this.inlineName =
          document.body.clientWidth / 2 <
          this.displayName.length * 8.5;
      }
    }
  }

  ngOnChanges() {
    if (this.business) {
      this.loaderService.show('page-center');
      this.getBusinessDetails(this.business.id);
      if (this.displayName) {
        this.inlineName =
          document.body.clientWidth / 2 <
          this.displayName.length * 8.5;
      }
    }
  }

  showReportMenu(event) {
    this.selectedReview = event.reviewId;
    this.menu.toggle(event.event);
    this.menu.target = event.event.target;
  }

  focusIn(e) {
    console.log('open menu');
  }

  showVideoPlayer(event) {
    this.showVideo.next(event);
  }

  setRatings(data) {
    if (data.customerService) {
      this.averageCustomerRating = +data.customerService.toFixed(1);
    }

    if (data.quality) {
      this.averageQualityRating = +data.quality.toFixed(1);
    }

    if (data.customerService || data.quality) {
      this.averageRating = (+data.customerService + +data.quality) / 2;
    }
  }

  enableButtons() {
    setTimeout(() => {
      if (
        this.carousel?.isForwardNavDisabled() ||
        this.carousel?.isBackwardNavDisabled()
      ) {
        const prevBtn = document.getElementsByClassName(
          'p-carousel-prev p-link p-disabled'
        )[0];
        const nextBtn = document.getElementsByClassName(
          'p-carousel-next p-link p-disabled'
        )[0];

        if (prevBtn) {
          prevBtn.removeAttribute('disabled');
          prevBtn.classList.remove('p-disabled');
        }
        if (nextBtn) {
          nextBtn.removeAttribute('disabled');
          nextBtn.classList.remove('p-disabled');
        }
      }
    }, 1000);
  }

  handleSlideFront() {
    if (
      this.offset + this.numVisible >
      this.totalRecords - this.numVisible &&
      !(this.offset >= this.totalRecords - 1)
    ) {
      this.offset = this.totalRecords - 1;
    } else if (this.offset >= this.totalRecords - 1) {
      this.offset = 0;
    } else {
      this.offset += this.numVisible;
    }
    this.getBusinessDetails(this.business.id);
  }

  handleSlideBack() {
    this.offset = !this.offset
      ? this.totalRecords - 1
      : this.offset - this.numVisible;
    this.getBusinessDetails(this.business.id);
  }

  handleSlideCenter() {
    if (this.reviewsList?.length < this.numVisible) {
      const container = document.getElementsByClassName(
        'p-carousel-items-container'
      ) as HTMLCollection;
      if (container.length) {
        for (let i = 0; i < container.length; i++) {
          if (
            container[i].className === 'p-carousel-items-container'
          ) {
            const node = container[i] as HTMLElement;
            node.style.transform = '';
          }
        }
      }
    }
  }

  addReview() {
    this.leaveAreviewClick.emit({
      title: 'leaveareview',
      businessId: this.business.id,
      businessName: this.business.businessName
    });
  }

  getBusinessDetails(businessId) {
    this.$businessReviewSub.add(
      this.getBusinessReviewsRoute(businessId).subscribe(
        (result) => {
          if (result.data) {
            this.setRatings(result.data);
            this.displayName = result.data?.displayName
              ? result.data.displayName
              : this.business?.displayName
                ? this.business.displayName
                : '';

            this.reportTypes[0].visible = result.data.canDelete;
            this.cacheId = result.data?.cacheId
              ? result.data.cacheId
              : '';
            this.reviewsList = [...result.data.reviews];
            this.totalRecords = result.data.count;
          }

          this.loaderService.hide();
          this.loaded = true;

          this.enableButtons();
          this.handleSlideCenter();
          if (
            this.reviewsList.find((r) => r.isNew) &&
            this.isOrganization
          ) {
            this.updateIncomeReviews();
          }
        },
        (err) => {
          this.handleErrorMessage(err);
        }
      )
    );
  }

  getBusinessReviewsRoute(businessId) {
    const config = this.cacheId
      ? {limit: this.limit, offset: this.offset, cacheId: this.cacheId}
      : {limit: this.limit, offset: this.offset};
    if (this.isOrganization) {
      return this.customerAnalyticsService.getAllBusinessVideoReviewList(
        businessId,
        config
      );
    } else {
      return this.customerAnalyticsService.getBusinessVideoReviewList(
        businessId,
        config
      );
    }
  }

  reportIssuesApiCall(selectedIssue) {
    const reviewData = this.reviewsList.find(
      (x) => x.id === this.selectedReview
    );
    const reportTypes = this.reportTypes.find((t) => t.id === '2');
    const issueName = reportTypes.items.find(
      (x) => x.id === selectedIssue.item.id
    ).label;
    this.confirmationService.confirm({
      header: 'Report testimonial',
      icon: 'pi pi-exclamation-triangle',
      message: `Are you sure you want to report ${reviewData.user.firstName} testimonial for ${issueName}?`,
      acceptVisible: true,
      rejectVisible: true,
      acceptLabel: 'Yes',
      accept: () => {
        this.loaded = false;
        this.$businessReviewSub.add(
          this.customerAnalyticsService
            .reportIssues(this.business.id, {
              businessCustomerReviewId: this.selectedReview,
              reportedReview: selectedIssue.item.id,
              cacheId: this.cacheId
            })
            .subscribe(
              (result) => {
                this.getBusinessDetails(this.business.id);
              },
              (error) => {
                this.handleErrorMessage(error);
              }
            )
        );
      }
    });
  }

  handleDeleteModal() {
    this.confirmationService.confirm({
      header: 'Are you sure?',
      message:
        'You will not be able to recover this Testimonial once it is deleted.',
      acceptLabel: this.commonBindingDataService.getLabel('label_delete'),
      rejectLabel: 'cancel',
      acceptIcon: '-',
      rejectIcon: '-',
      accept: () => {
        this.loaded = false;
        this.loaderService.show('page-center');
        this.customerAnalyticsService
          .deleteTestimonial(this.selectedReview, this.cacheId)
          .subscribe(
            (result) => {
              this.getBusinessDetails(this.business.id);
            },
            (error) => {
              this.handleErrorMessage(error);
            }
          );
      }
    });
  }

  setTestimonialApprove(review) {
    this.loaderService.show('page-center');
    this.$businessReviewSub.add(
      this.customerAnalyticsService
        .setApproveTestimonial(review.id, this.cacheId)
        .subscribe(
          (result) => {
            this.getBusinessDetails(this.business.id);
          },
          (error) => {
            this.handleErrorMessage(error);
          }
        )
    );
  }

  updateIncomeReviews() {
    const newReviews: any[] = [...this.reviewsList]
      .filter((r) => r.isNew)
      .map((x) => x.id);
    this.$businessReviewSub.add(
      this.customerAnalyticsService
        .updateNewTestimonials(newReviews, this.cacheId)
        .subscribe(
          () => {
          },
          (error) => {
            this.handleErrorMessage(error);
          }
        )
    );
  }

  handleErrorMessage(error) {
    this.uiService.errorMessage(
      error?.message
        ? error.message
        : this.commonBindingDataService.getLabel('err_server')
    );
  }

  handleTouchStart(e) {
    if (this.isMobile || this.deviceService.isTablet()) {
      const firstTouch = this.getTouches(e)[0];
      this.xDown = firstTouch.clientX;
      this.yDown = firstTouch.clientY;
    }
  }

  getTouches(e) {
    return e.touches || e.originalEvent.touches;
  }

  handleTouchMove(evt) {
    if (this.isMobile || this.deviceService.isTablet()) {
      if (!this.xDown || !this.yDown) {
        return;
      }

      const xUp = evt.touches[0].clientX;
      const yUp = evt.touches[0].clientY;

      const xDiff = this.xDown - xUp;
      const yDiff = this.yDown - yUp;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        /*most significant*/
        if (xDiff > 0) {
          this.handleSlideFront();
        } else {
          this.handleSlideBack();
        }
      }
      /* reset values */
      this.xDown = null;
      this.yDown = null;
    }
  }
}
