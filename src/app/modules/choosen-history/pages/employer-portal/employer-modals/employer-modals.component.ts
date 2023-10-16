import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import {
  Admin,
  EmployerPortalService
} from '../../../services/employer-portal.service';
import { Subscription } from 'rxjs';
import { BusinessDetails } from '../../../../business/models/business-detail.model';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PitchCardModalsWrapperService } from '../../../../pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { UniqueComponentId } from 'primeng/utils';
import { CardPackageService } from '../../../../cards-packages/services/card-package.service';
import { AppSettings } from '../../../../shared/app.settings';
import { StorageService } from '../../../../shared/services/storage.service';
import { BusinessService } from '../../../../business/services/business.service';
import { NavigationStart, Router } from '@angular/router';
import { BillingFrequency } from '../../../../new-billing/services/new-billing.service';
import { UiService } from '../../../../shared/services/ui.service';
import { StepperItem } from '../../../../creation-tiles-shared/components/stepper/stepper.component';
import { BusinessPitch } from '../../../../business/models/business-pitch.model';
import {
  CreatePitchCardService,
  Step
} from '../../../../create-pitch-card/create-pitch-card.service';
import { OrganizationBusinessStatus } from '../enums/organization-business-status.enum';
import { ProductType } from '../../../../shared/components/pricing-menu-components/pricing-menu.service';
import { PitchCardType } from '../../../../shared/enums/pitch-card-type.enum';
import { Dialog } from 'primeng/dialog';
import { filter } from 'rxjs/operators';

declare const Hls: any;

@Component({
  selector: 'app-employer-modals',
  templateUrl: './employer-modals.component.html',
  styleUrls: ['./employer-modals.component.scss']
})
export class EmployerModalsComponent implements OnInit, OnDestroy {
  $employerPortalSubs = new Subscription();

  isMobile: boolean = this.deviceDetector.isMobile();

  // Choose PcC modal
  showChoosePCTypeModal: boolean = false;
  activePitchCardType: PitchCardType | string =
    this.employerService?.activeBusinessType?.option;

  // Preview business
  showPreviewModal: boolean = false;
  selectedPitchCard: BusinessDetails | BusinessPitch;
  businessStatuses = OrganizationBusinessStatus;

  // Edit modal
  showEditEpModal: boolean = false;
  employerPortal: any;

  // Add admins modal
  showAdminsModal: boolean = false;
  invitedUserList: Admin[] = [];
  adminsErrors: any[] = [];

  // Autofill variables
  organizationId: string | number;
  showAutofillModal: boolean = false;
  stepItems: StepperItem[] = [];
  defaultCompletedStepsNumber: number = 0;
  isOrganizationHasProgress: boolean;

  // Not Paid modal variables
  showPaymentFailedModal: boolean = false;
  requestStatus: any;

  // Analytics modal Variables
  showAnalyticsModal: boolean = false;
  maxDateValue = new Date();

  // Applicants modal
  showApplicantsModal: boolean = false;
  applicantsData: any;

  // Testimonials modal
  showTestimonialsModal: boolean = false;

  // VideoPlayer Dialog Variables
  hls: any;
  showVideoPlayerDialog: boolean = false;
  videoFileUrl: string = null;
  isVideoMirrored = false;
  isBrowser: boolean;

  uniqueId: string;

  @ViewChild('applicantsModal', {static: true}) applicantsModal: Dialog;

  constructor(
    private router: Router,
    private location: Location,
    private employerService: EmployerPortalService,
    private createPCService: CreatePitchCardService,
    private deviceDetector: DeviceDetectorService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private cardPackagesService: CardPackageService,
    private storageService: StorageService,
    private businessService: BusinessService,
    private uiService: UiService
  ) {
  }

  ngOnInit(): void {
    this.uniqueId = UniqueComponentId();
    this.onRouteChange();
    this.initHandleAdminsModal();
    this.initHandleChoosePcTypeModal();
    this.initHandlePreviewModal();
    this.initHandleAnalyticModals();
    this.initHandleEditEpModal();
    this.initHandleAutofillJobCardModal();
    this.initHandlePaymentFailedModal();
    this.initHandleApplicantsModal();
    this.initHandleTestimonialsModal();
    this.shutDownAllModalsSubs();
  }

  onRouteChange() {
    this.router.events
      .pipe(
        filter(
          (event: NavigationStart) =>
            event.navigationTrigger === 'popstate'
        )
      )
      .subscribe(() => {
        if (this.hasOpenModal()) {
          this.employerService.$shutDownAllModal.next();
          this.router.navigateByUrl(this.router.url);
          this.location.go(this.router.url);
        }
        this.pitchCardModalsWrapperService.$shutDownAllModal.next({
          withCheck: true
        });
      });
  }

  initHandleAdminsModal() {
    this.$employerPortalSubs.add(
      this.employerService.$adminsModalsHandler.subscribe((res) => {
        this.employerPortal = res;
        this.invitedUserList = res.allAdmins;
        this.showAdminsModal = true;
      })
    );
  }

  initHandleChoosePcTypeModal() {
    this.$employerPortalSubs.add(
      this.employerService.$choosePcTypeModalsHandler.subscribe((res) => {
        this.employerPortal = res?.employerPortal;
        this.activePitchCardType = this.employerService
          ?.activeBusinessType?.option
          ? this.employerService.activeBusinessType.option
          : null;
        this.showChoosePCTypeModal = res.isOpen;
      })
    );
  }

  initHandlePreviewModal() {
    this.$employerPortalSubs.add(
      this.employerService.$previewModalsHandler.subscribe((r) => {
        this.selectedPitchCard = r;
        this.showPreviewModal = true;
      })
    );
  }

  initHandleAnalyticModals() {
    this.$employerPortalSubs.add(
      this.employerService.$businessAnalyticsModalHandler.subscribe(
        (r) => {
          this.selectedPitchCard = r;
          // Set business Chart data
          this.showAnalyticsModal = true;
        }
      )
    );

    this.$employerPortalSubs.add(
      this.employerService.$portalAnalyticsModalHandler.subscribe((r) => {
        // Set Employer Portal Chart data
        this.showAnalyticsModal = true;
      })
    );
  }

  initHandleEditEpModal() {
    this.$employerPortalSubs.add(
      this.employerService.$editEpModalHandler.subscribe((r) => {
        this.employerPortal = r;
        this.showEditEpModal = true;
      })
    );
  }

  initHandleAutofillJobCardModal() {
    this.$employerPortalSubs.add(
      this.employerService.$autofillJobCard.subscribe((r) => {
        this.selectedPitchCard = r.business;
        this.organizationId = r.orgId;
        this.isOrganizationHasProgress =
          this.employerService?.organizationProgress > 0;
        this.setupStepper(this.selectedPitchCard.businessType);
        this.calculateBusinessProgress();
      })
    );
  }

  calculateBusinessProgress() {
    this.$employerPortalSubs.add(
      this.businessService
        .calculateBusinessProgress(
          this.selectedPitchCard.id,
          this.organizationId
        )
        .subscribe(
          (r) => {
            if (r?.data) {
              const {filledSteps, calculatedSteps} =
                this.businessService.calculateProgressBySteps(
                  r.data,
                  this.stepItems
                );
              if (filledSteps && calculatedSteps?.length) {
                this.defaultCompletedStepsNumber = filledSteps;
                this.stepItems = calculatedSteps;
              } else {
                if (!this.defaultCompletedStepsNumber) {
                  this.defaultCompletedStepsNumber =
                    this.stepItems.filter(
                      (item) => item.completed
                    ).length;
                }
              }
              this.showAutofillModal = true;
            } else {
              this.navigateToEditBusiness(
                this.selectedPitchCard,
                true
              );
            }
          },
          (e) => {
            this.navigateToEditBusiness(
              this.selectedPitchCard,
              true
            );
            console.log(
              e?.message
                ? e.message
                : 'get business progress has been failed'
            );
          }
        )
    );
  }

  setupStepper(type) {
    this.stepItems = this.createPCService.setupStepper(true, type);
  }

  initHandlePaymentFailedModal() {
    this.$employerPortalSubs.add(
      this.employerService.$paymentFailedModal.subscribe((res) => {
        this.requestStatus = res?.length ? res[0] : res;
        this.showPaymentFailedModal = true;
      })
    );
  }

  initHandleApplicantsModal() {
    this.$employerPortalSubs.add(
      this.employerService.$applicantsModalHandler.subscribe(
        (res: any) => {
          if (res) {
            this.applicantsData = res;
            this.showApplicantsModal = true;
          }
        }
      )
    );
  }

  initHandleTestimonialsModal() {
    this.$employerPortalSubs.add(
      this.employerService.$businessTestimonialsModalHandler.subscribe(
        (res) => {
          this.selectedPitchCard =
            this.employerService.getCurrentBusiness();
          if (this.selectedPitchCard) {
            this.showTestimonialsModal = res;
          }
        }
      )
    );
  }

  shutDownAllModalsSubs() {
    this.$employerPortalSubs.add(
      this.employerService.$shutDownAllModal.subscribe(() => {
        this.closeAllModals();
      })
    );
  }

  closeAllModals() {
    this.showAdminsModal = false;
    this.showChoosePCTypeModal = false;
    this.showPreviewModal = false;
    this.showAnalyticsModal = false;
    this.showEditEpModal = false;
    this.showAutofillModal = false;
    this.showPaymentFailedModal = false;
    this.showApplicantsModal = false;
    this.showTestimonialsModal = false;
    this.showVideoPlayerDialog = false;
  }

  hasOpenModal(): boolean {
    const allModals = [
      this.showAdminsModal,
      this.showChoosePCTypeModal,
      this.showPreviewModal,
      this.showAnalyticsModal,
      (this.showEditEpModal = false),
      (this.showAutofillModal = false),
      (this.showPaymentFailedModal = false),
      (this.showApplicantsModal = false),
      (this.showTestimonialsModal = false),
      (this.showVideoPlayerDialog = false)
    ];
    return allModals.find((m) => m);
  }

  reviewVideoInit(videoUrl: string) {
    this.showVideoPlayerDialog = true;
    this.videoFileUrl = videoUrl;
  }

  detachVideoFile() {
    if (this.isBrowser && this.hls && Hls.isSupported()) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
    }
  }

  saveAdminsList(users) {
    const emailList = [];
    if (users?.length) {
      users.map((u) => {
        if (!u.id && u.emailId) {
          emailList.push(u.emailId);
        }
      });
    }

    if (emailList?.length) {
      this.addAdminsToOrganization(emailList);
    } else {
      this.showAdminsModal = false;
    }
  }

  removeAdminsFromOrganization(emailList) {
    this.$employerPortalSubs.add(
      this.employerService
        .removeAdminsFromOrganization(this.employerPortal.id, [
          emailList.userId
        ])
        .subscribe((r) => {
          this.uiService.successMessage(
            r?.message
              ? r.message
              : 'User has been removed from Employer Portal'
          );

          this.employerService.$fetchEmployerPortalInfo.next(true);
        })
    );
  }

  addAdminsToOrganization(emailList) {
    this.$employerPortalSubs.add(
      this.employerService
        .addAdminsToOrganization(this.employerPortal.id, emailList)
        .subscribe(
          (res) => {
            this.handleNotPaidAdmins(res, emailList);
          },
          (err) => {
            this.handleNotPaidAdmins(err, emailList);
          }
        )
    );
  }

  handleNotPaidAdmins(response, emailList) {
    if (response.data?.length) {
      this.adminsErrors = [];
      this.invitedUserList = this.invitedUserList.filter((u) => u.user);

      response.data.map((user) => {
        if (!user.status) {
          this.adminsErrors.push(user);
        }
        this.invitedUserList.push({
          role: 1,
          user: {emailId: user.body, id: user.status},
          userId: user.code
        });
      });

      if (this.adminsErrors.length) {
        this.employerService.$fetchEmployerPortalInfo.next(true);
      } else {
        this.uiService.successMessage(
          emailList.length > 1
            ? 'Users has been added to Employer Portal'
            : 'User has been added to Employer Portal'
        );
        this.employerService.$fetchEmployerPortalInfo.next(true);
        this.showAdminsModal = false;
      }
    }
  }

  setRemoveAdminsList(admin) {
    if (admin.id) {
      // this.removedUsers.push(admin);
      this.removeAdminsFromOrganization(admin);
    }
  }

  handlePitchCardTitleClick(clickEvent: any) {
    const {title} = clickEvent;
    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(
      this.selectedPitchCard as BusinessDetails
    );
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  setSelectedBusinessType(options: {
    pack: any;
    paymentFrequency: BillingFrequency;
    type: ProductType;
    hasUserEmployerPortal: boolean;
  }) {
    this.showChoosePCTypeModal = false;
  }

  clearLS() {
    this.storageService.removeItem(AppSettings.DRAFT_PRODUCT_ID);
  }

  fetchAdminsModalData() {
    this.invitedUserList = [];
    this.employerPortal = null;
  }

  fetchEmployerPortal() {
    this.employerService.$fetchEmployerPortalInfo.next(true);
  }

  fetchBusinesses() {
    this.employerService.$updateBusinesses.next(
      this.selectedPitchCard.businessType
    );
  }

  doAutofillBusiness() {
    if (this.selectedPitchCard && this.organizationId) {
      this.$employerPortalSubs.add(
        this.businessService
          .autofillBusiness(
            this.selectedPitchCard.id,
            this.organizationId
          )
          .subscribe(
            () => {
              this.uiService.successMessage(
                'PitchCard successfully filled'
              );
              this.navigateToEditBusiness(
                this.selectedPitchCard,
                true
              );
            },
            (e) => this.uiService.errorMessage(e.message)
          )
      );
    }
  }

  navigateToEditBusiness(business, disableAutofill?: boolean) {
    if (
      this.storageService.getItem(AppSettings.OPEN_ACTIVE_TILE) &&
      !business.autofill
    ) {
      this.storageService.removeItem(AppSettings.OPEN_ACTIVE_TILE);
    }
    if (disableAutofill) {
      this.storageService.setSession(
        AppSettings.OPEN_AUTOFILL_MODAL,
        true
      );
    }
    this.storageService.setSession(
      AppSettings.DRAFT_BUSINESS_ID,
      business.id
    );
    this.cardPackagesService.selectedType = business.businessType;
    this.router.navigate(['create'], {
      queryParams: {businessId: business.id}
    });
  }

  resetAnalyticsData() {
    this.selectedPitchCard = null;
    this.storageService.removeItem('selectedBusiness');
  }

  initCloseEditEP() {
    this.showEditEpModal = false;
    this.employerService.$fetchEmployerPortalInfo.next(true);
  }

  handleUpdateBillingInfo() {
    this.showPaymentFailedModal = false;
    if (this.employerPortal) {
      this.storageService.setItem(
        AppSettings.DRAFT_PRODUCT_ID,
        typeof this.employerPortal?.id === 'string'
          ? parseInt(this.employerPortal.id, 10)
          : this.employerPortal?.id
      );
      this.storageService.setItem('Billing', 'billing');
      this.showEditEpModal = true;
    }
  }

  ngOnDestroy(): void {
    if (this.$employerPortalSubs) {
      this.$employerPortalSubs.unsubscribe();
    }
  }
}
