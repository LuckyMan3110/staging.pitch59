import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { BusinessService } from '../../../business/services/business.service';
import { Applicant } from '../../models/applicant';
import { ApplicantViewerService } from '../../applicant-viewer.service';
import { ApplicantStatus } from '../../models/applicant-status';
import { ApplicantStatuses } from '../../enums/applicant-statuses.enum';
import {
  SwiperComponent,
  SwiperConfigInterface,
  SwiperDirective
} from 'ngx-swiper-wrapper';
import { PitchCardModalsWrapperService } from '../../../pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { UniqueComponentId } from 'primeng/utils';
import { PixelService } from 'ngx-pixel';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-applicant-viewer-layout',
  templateUrl: './applicant-viewer-layout.component.html',
  styleUrls: ['./applicant-viewer-layout.component.scss']
})
export class ApplicantViewerLayoutComponent implements OnInit, OnChanges {
  $applicantSubscription = new Subscription();
  applicants: Applicant[] = [];
  applicantIds: number[] = [];
  displayedApplicants: Applicant[] = [];
  selectedApplicant: Applicant = this.applicants[0];
  rejectedApplicants: Applicant[] = [];
  areRejectedVisible = false;
  dbApplicantStatuses: ApplicantStatus[] = [];
  localApplicantStatuses: ApplicantStatus[] = [];
  applicantStatusFilters: ApplicantStatus[] = [];
  selectedStatusFilter: String;
  pageIndex: Number;
  uniqueId: string;

  swiperConfig: SwiperConfigInterface = {
    direction: 'horizontal',
    effect: 'coverflow',
    grabCursor: false,
    scrollbar: false,
    loop: true,
    observer: true,
    keyboard: {
      enabled: true,
      onlyInViewport: false
    }
  };
  ApplicantStatuses = ApplicantStatuses;

  @Input() options: any;
  @ViewChild(SwiperDirective) directiveRef?: SwiperDirective;
  @ViewChild('applicantSwiper', {static: false}) swiper?: SwiperComponent;
  @ViewChild('applicantStatusSelect', {static: false})
  applicantStatusSelect: Dropdown;

  constructor(
    private businessService: BusinessService,
    private applicantService: ApplicantViewerService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private pixel: PixelService
  ) {
    this.pixel.track('PageView', {
      content_name: 'Applicant Viewer'
    });
  }

  ngOnInit() {
    this.uniqueId = UniqueComponentId();
    this.getApplicants();
    this.populateAvailableApplicantStatuses();
  }

  ngOnChanges() {
    console.log('ngOnChanges was called');
    this.ngOnInit();
    this.areRejectedVisible = false;
    this.reApplyFilters();
  }

  setSwiperConfig() {
    this.swiperConfig = {
      direction: 'horizontal',
      effect: 'slide',
      grabCursor: true,
      scrollbar: false,
      loop: true,
      speed: 500,
      navigation: {
        nextEl: '.applicant-swiper-button-next',
        prevEl: '.applicant-swiper-button-prev'
      },
      observer: true
    };
  }

  getApplicants() {
    if (this.options?.business?.id) {
      this.$applicantSubscription.add(
        this.businessService
          .getBusinessApplicants(this.options.business.id)
          .subscribe((res) => {
            if (res.data) {
              this.applicants = res.data.map((applicant) => {
                if (applicant.applicantTag === null) {
                  applicant.applicantTag = {
                    id: ApplicantStatuses.NotTagged,
                    name: 'Not Tagged',
                    color: ''
                  };
                }
                this.applicantIds.push(applicant.id);
                return applicant;
              });

              this.rejectedApplicants = this.applicants.filter(
                (applicant) =>
                  applicant.applicantTag.name === 'Rejected'
              );
              this.displayedApplicants = this.applicants.filter(
                (applicant) =>
                  applicant.applicantTag.name !== 'Rejected'
              );
              // set the initial default selected applicant
              this.selectedApplicant =
                this.displayedApplicants[0];

              this.applicantViewAll(); // Sends a post request to view all applicants.
              // console.log('getApplicants, this.applicants[0] : ', this.applicants[0]);
              // console.log('getApplicants, this.selectedApplicant: ', this.selectedApplicant);
              // console.log('getApplicants, this.selectedApplicant.applicantTag: ', this.selectedApplicant.applicantTag);
              // console.log('applicant data: ', res.data);
              // console.log('getApplicants, selectedApplicant: ', this.selectedApplicant);
              // console.log('all the applicants: ', this.applicants);
            }
          })
      );
    }
  }

  applicantViewAll() {
    this.applicantService
      .applicantViewAll(this.applicantIds)
      .subscribe((res) => {
      });
  }

  populateAvailableApplicantStatuses() {
    this.getApplicantStatuses().then((response: any) => {
      if (response) {
        if (response.data !== null) {
          response.data.map((item) => {
            this.dbApplicantStatuses.push(item);

            const duplicates = this.applicantService
              .getDefaultApplicantStatuses()
              .filter((defaultStatus) => {
                return defaultStatus.name === item.name;
              });

            if (duplicates.length === 0) {
              this.localApplicantStatuses.push(item);
            }
          });
        }

        this.localApplicantStatuses = this.applicantService
          .getDefaultApplicantStatuses()
          .map((x) => x);

        this.applicantStatusFilters = [...this.localApplicantStatuses];
        this.applicantStatusFilters.unshift({
          id: ApplicantStatuses.AllApplicants,
          name: 'All Applicants',
          color: ''
        });
        this.selectedStatusFilter = 'All Applicants';
      }
    });
  }

  onStatusFilterChange(e) {
    this.selectedStatusFilter = e.value.name;
    if (e.value.name === 'All Applicants') {
      if (this.areRejectedVisible) {
        this.displayedApplicants = this.applicants;
      } else {
        this.displayedApplicants = this.applicants.filter(
          (applicant) => applicant.applicantTag.name !== 'Rejected'
        );
      }

      this.selectedApplicant =
        this.displayedApplicants.length > 0
          ? this.displayedApplicants[0]
          : null;
    } else {
      this.displayedApplicants = this.applicants.filter(
        (applicant) => applicant.applicantTag.name === e.value.name
      );

      // if there's matches, make sure the first match is automatically selected
      this.selectedApplicant =
        this.displayedApplicants.length > 0
          ? this.displayedApplicants[0]
          : null;
    }
  }

  reApplyFilters() {
    if (this.selectedStatusFilter === 'All Applicants') {
      if (this.areRejectedVisible) {
        this.displayedApplicants = this.applicants;
      } else {
        this.displayedApplicants = this.applicants.filter(
          (applicant) => applicant.applicantTag.name !== 'Rejected'
        );
      }
    } else {
      this.displayedApplicants = this.applicants.filter(
        (applicant) =>
          applicant.applicantTag.name === this.selectedStatusFilter
      );
    }
    const selectedApplicantIndex = this.displayedApplicants.indexOf(
      this.selectedApplicant
    );
    if (selectedApplicantIndex >= 0) {
      this.selectedApplicant =
        this.displayedApplicants[selectedApplicantIndex];
    } else {
      this.selectedApplicant =
        this.displayedApplicants.length > 0
          ? this.displayedApplicants[0]
          : null;
    }
  }

  async onStatusChange($event: any) {
    let statusId: Number = null;
    let event: any = {};

    if ($event === 'Rejected') {
      event = {
        id: ApplicantStatuses.Rejected,
        name: 'Rejected',
        color: '#000000FF'
      };
      // todo: at the time this runs (below), even when there's 2 other rejected applicants,
      //  this.rejectedApplicants has a size of zero. It needs to be initialized somewhere with previously rejected applicants in the database.
      this.rejectedApplicants.push(this.selectedApplicant);

      const selectedApplicantIndex = this.applicants.indexOf(
        this.selectedApplicant
      );
      this.applicants[selectedApplicantIndex].applicantTag = event;

      if (!this.areRejectedVisible) {
        this.displayedApplicants = this.applicants.filter(
          (applicant) => applicant.applicantTag.name !== 'Rejected'
        );
        this.selectedApplicant =
          this.displayedApplicants.length > 0
            ? this.displayedApplicants[0]
            : null;
      }
    } else {
      event = $event;
      this.selectedApplicant.applicantTag = event;

      const selectedApplicantIndex = this.applicants.indexOf(
        this.selectedApplicant
      );
      this.applicants[selectedApplicantIndex].applicantTag = event;
    }
    this.reApplyFilters();

    const statusAlreadyExistsInDb = this.doesStatusExistInDb(event);

    if (statusAlreadyExistsInDb.exists) {
      statusId = statusAlreadyExistsInDb.existingId;
    } else {
      await this.applicantService
        .createNewStatus(
          this.options?.organizationId,
          event.name,
          encodeURIComponent(event.color)
        )
        .toPromise()
        .then((response: any) => {
          if (response.data) {
            statusId = response.data.id;
          } else {
            console.log(
              'There was an error. The new applicant status couldn\'t be created.'
            );
          }
        });
    }

    this.applicantService
      .setApplicantStatus(this.selectedApplicant.id, statusId)
      .subscribe((res) => {
        if (res.data) {
          console.log(
            'set applicant status response data: ',
            res.data
          );
        }
      });
  }

  doesStatusExistInDb(localStatus): { exists: Boolean; existingId: Number } {
    // check if the label already exists in db
    let exists: Boolean = false;
    let existingId: Number = null;
    this.dbApplicantStatuses.forEach((status) => {
      if (status.name === localStatus.name) {
        exists = true;
        existingId = status.id;
      }
    });
    return {exists: exists, existingId: existingId};
  }

  async getApplicantStatuses() {
    if (this.options?.organizationId) {
      return await this.applicantService
        .getApplicantStatuses(this.options?.organizationId)
        .toPromise();
    }
  }

  onApplicantListClick($event) {
    console.log('displayed applicants: ', this.displayedApplicants);
    this.selectedApplicant = $event.value;
    console.log('this applicant: ', this.selectedApplicant);
    this.swiper.directiveRef.setIndex(
      this.displayedApplicants?.indexOf(this.selectedApplicant),
      500,
      false
    );
  }

  onSwiperSlideChange($swiper) {
    this.selectedApplicant =
      this.displayedApplicants[$swiper.directiveRef.instance.activeIndex];
  }

  nextSwiperSlide() {
    this.swiper.directiveRef.nextSlide();
  }

  previousSwiperSlide() {
    this.swiper.directiveRef.prevSlide();
  }

  requestSetApplicantStatus() {
  }

  handlePitchCardTitleClick(event: any) {
    const {title, businessDetails} = event;

    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(businessDetails);
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  populateAssignedApplicantStatuses() {
  }

  logApplicant($event) {
    console.log('this applicant, from let-applicant: ', $event);
  }

  search($event) {
    console.log('search event: ', $event);
  }

  onChangeRejectedVisibility($event: any) {
    if ($event.checked || this.areRejectedVisible === true) {
      this.displayedApplicants = this.applicants;
    } else {
      this.displayedApplicants = this.applicants.filter(
        (applicant) => applicant.applicantTag.name !== 'Rejected'
      );
    }
    this.selectedApplicant = this.displayedApplicants[0];
    this.swiper.directiveRef.setIndex(
      this.displayedApplicants?.indexOf(this.selectedApplicant),
      500,
      false
    );
  }
}
