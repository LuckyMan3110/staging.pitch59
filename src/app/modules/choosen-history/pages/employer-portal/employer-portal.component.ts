import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';

import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import {
  EmployerActionsIds,
  PitchCardTypeParams,
  EmployerPortalService
} from '../../services/employer-portal.service';
import { NewBillingService } from '../../../new-billing/services/new-billing.service';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { BusinessDetails } from '../../../business/models/business-detail.model';
import { CreateEmployerPortalService } from '../../../create-employer-portal/create-employer-portal.service';
import { OrganizationModel } from './models/organization-model';
import { StorageService } from '../../../shared/services/storage.service';
import { AppSettings } from '../../../shared/app.settings';
import { environment } from '../../../../../environments/environment';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { UiService } from '../../../shared/services/ui.service';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-account-employer-portal',
  templateUrl: './employer-portal.component.html',
  styleUrls: ['./employer-portal.component.scss']
})
export class EmployerPortalComponent implements OnInit, OnDestroy {
  employerPortal: OrganizationModel;
  selectedPitchCards: BusinessDetails[] = [];
  actionImages: any[] = [];
  pitchCardTypes: PitchCardTypeParams[] = [];
  actionsEnum = EmployerActionsIds;
  ID: number | string;

  selectedPitchCardType: PitchCardTypeParams = {
    color: '#D52C2C',
    label: 'Job',
    option: 'job',
    value: 0,
    count: null,
    optionDisabled: false
  };

  isDesktop: boolean = this.deviceService.isDesktop();
  isTablet: boolean = this.deviceService.isTablet();
  isMobile: boolean = this.deviceService.isMobile();

  hasUserOrganization: boolean;
  loading = true;
  employerPortalBetaTest: boolean = environment.employerPortalBetaTest;
  showEmployerPortal: boolean;
  paymentError: boolean = false;
  showRequestDemoDialog = false;
  showDoneDialog = false;

  searchSubject: Subject<string> = new Subject();
  $employerPortalSub = new Subscription();
  totalPitchCards = 0;

  @ViewChild('dt') table: Table;
  @ViewChild('tableWrap') tableWrap: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('settings', {static: true}) settings: OverlayPanel;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public employerService: EmployerPortalService,
    private userCommonService: UserCommonService,
    private createEmployerPortalService: CreateEmployerPortalService,
    private cardPackageService: CardPackageService,
    private titleCasePipe: TitleCasePipe,
    private deviceService: DeviceDetectorService,
    private storageService: StorageService,
    private uiService: UiService,
    private billService: NewBillingService,
    private commonBindingService: CommonBindingDataService,
    private confirmationService: ConfirmationService
  ) {
    if (!this.isDesktop) {
      this.router.navigateByUrl('/welcome');
    }
    this.employerService.activeBusinessType = this.selectedPitchCardType;
  }

  ngOnInit() {
    this.setAvailableEmployerPortal();
  }

  ngOnDestroy() {
    if (this.$employerPortalSub) {
      this.$employerPortalSub.unsubscribe();
    }
    this.storageService.removeSession(AppSettings.LAST_PAGE_URL);
  }

  setAvailableEmployerPortal(isUpdate?) {
    const userDetails = JSON.parse(
      this.storageService.getItem(AppSettings.USER_DETAILS)
    );

    if (userDetails) {
      this.$employerPortalSub.add(
        this.userCommonService
          .getUserProfile(userDetails.userId)
          .subscribe(
            (result) => {
              if (result && result.data) {
                const isTesterUser = result.data.isTesterUser;
                if (
                  (this.employerPortalBetaTest &&
                    isTesterUser) ||
                  !this.employerPortalBetaTest
                ) {
                  this.showEmployerPortal = true;
                } else if (
                  this.employerPortalBetaTest &&
                  typeof isTesterUser === 'boolean' &&
                  !isTesterUser
                ) {
                  this.showEmployerPortal = false;
                  this.loading = false;
                }

                this.storageService.setItem(
                  AppSettings.ORGANIZATION_PROGRESS,
                  result.data.organizationProgress
                );

                if (this.showEmployerPortal && !isUpdate) {
                  this.initEPData();
                }
              }
            },
            (e) => {
              this.uiService.errorMessage(e.Message);
            }
          )
      );
        }
    }

    initEPData() {
        this.fetchLS();
        this.getOrganizationId();
        this.getEmployerPortal();
      // this.initPitchCardTypeDropdown();
        this.initSubscriptions();
    }

    fetchLS(withOrganization: boolean = false) {
        this.storageService.removeSession(AppSettings.DRAFT_BUSINESS_ID);
        this.storageService.removeSession(AppSettings.DRAFT_PITCH_CARD_TYPE);
        this.storageService.removeItem(AppSettings.PAYMENT_PLAN);
        if (withOrganization) {
            this.storageService.removeItem(AppSettings.DRAFT_PRODUCT_ID);
        }
    }

    getOrganizationId() {
        if (this.route.snapshot?.queryParams?.organizationId) {
            this.ID = this.route.snapshot.queryParams.organizationId;
            this.hasUserOrganization = true;
        }
    }

    getEmployerPortal() {
      this.$employerPortalSub.add(
        this.employerService
          .getEmployerPortalById(this.ID ? this.ID : null)
          .subscribe((r) => {
            if (r.data) {
              if (this.ID) {
                this.employerPortal = r.data;
                this.employerService.$editEpModalHandler.next(
                  this.employerPortal
                );
                this.hasUserOrganization = !!r.data;
                this.createEmployerPortalService.cardDetail = r.data
                  .cardDetails?.length
                  ? r.data.cardDetails[0]
                  : null;
              } else {
                this.employerPortal = r.data[0];
                this.ID = this.employerPortal?.id
                  ? this.employerPortal.id
                  : null;
                this.hasUserOrganization = !!r.data.length;
                this.createEmployerPortalService.cardDetail = r
                  .data[0]?.cardDetails?.length
                  ? r.data[0]?.cardDetails[0]
                  : null;
              }

              if (this.employerPortal) {
                this.calculateTotalPitchCards();
                this.employerService.organizationProgress =
                  this.employerPortal.progress;
                this.initActionsImgs();
                this.handleChargeResponse();
                // TODO: reorder PitchCards table type by max number of PitchCards
                this.initPitchCardTypeDropdown();
                this.pitchCardTypes =
                  this.employerService.calculateOrderPitchCardTypes(
                    this.employerPortal?.businessCount,
                    this.pitchCardTypes
                  );
                this.pitchCardTypes = this.pitchCardTypes.filter((x) => !(x.option === 'basic' && x.count == 0));
                this.initAddPitchCardsModal();
              }
              this.loading = false;
            }

            this.billService
              .getOrganizationTransactions(this.ID, 20, 0)
              .subscribe(
                (x: any) => {
                  if (x.data) {
                    this.paymentError = x.data.errorsReasons
                      .length
                      ? true
                      : false;
                  }
                },
                (e) => {
                  if (e.Message) {
                    this.uiService.errorMessage(e.Message);
                  }
                }
              );
          })
      );
    }

    handleChargeResponse() {
      const failedData = this.storageService.getItem(
        AppSettings.NOT_PAID_BUSINESSES,
        true
      );
      if (failedData) {
        this.employerService.$paymentFailedModal.next(failedData);
      }
      this.storageService.removeItem(AppSettings.NOT_PAID_BUSINESSES);
    }

    initSubscriptions() {
      this.searchSubject.pipe(debounceTime(500)).subscribe((target) => {
        this.employerService.$businessSearch.next({
          event: target,
          param: 'contains'
        });
      });

      this.$employerPortalSub.add(
        this.employerService.$fetchEmployerPortalInfo.subscribe(() => {
          this.fetchEmployerPortal();
        })
      );

      this.$employerPortalSub.add(
        this.employerService.$updateBusinesses.subscribe((type) => {
          if (type) {
            this.selectedPitchCardType = this.pitchCardTypes.find(
              (t) => t.option === type
            );
            this.employerService.activeBusinessType =
              this.selectedPitchCardType;
          }
          this.handleChargeResponse();
        })
      );

      this.$employerPortalSub.add(
        this.employerService.$portalBillingModalHandler.subscribe(() => {
          this.employerService.$choosePcTypeModalsHandler.next({
            employerPortal: this.employerPortal,
            isOpen: false
          });
          this.handleBillingModal();
        })
      );
    }

    fetchEmployerPortal() {
      this.$employerPortalSub.add(
        this.employerService.getEmployerPortalById(null).subscribe((r) => {
          if (r.data?.length) {
            this.employerPortal = r.data[0];
            this.employerService.organizationProgress =
              this.employerPortal.progress;
          }
        })
      );
    }

    searchInit(value) {
        if (!value?.length || value?.length >= 3) {
            this.searchSubject.next(value);
        }
    }

    initEditModals() {
      if (
        this.employerPortal?.progress !=
        AppSettings.FULL_FILL_EP_PROGRESS_VALUE &&
        this.hasUserOrganization
      ) {
        this.storageService.getItem('Billing')
          ? this.handleBillingModal()
          : this.handleEditEpModal();
      } else {
        this.initBillingModal();
      }
    }

    initBillingModal() {
        if (this.storageService.getItem('Billing')) {
            this.handleBillingModal();
        }
    }

    initAddPitchCardsModal() {
        if (this.route.snapshot?.queryParams?.createType) {
          this.selectedPitchCardType = this.pitchCardTypes.find(
            (t) => t.option === this.route.snapshot.queryParams.createType
          );
        } else {
            this.selectedPitchCardType = this.pitchCardTypes[0];
        }
        this.employerService.activeBusinessType = this.selectedPitchCardType;
        if (this.route.snapshot?.queryParams?.createType) {
          this.employerService.$choosePcTypeModalsHandler.next({
            employerPortal: this.employerPortal,
            isOpen: true
          });
        } else {
            this.initEditModals();
        }
    }

    // Mocks
    initActionsImgs() {
      this.actionImages = this.employerService.getEPActions(
        !this.isTablet,
        !this.employerPortal?.hasActiveJobCards
      );
    }

    initPitchCardTypeDropdown() {
        this.pitchCardTypes = this.employerService.initPitchCardTypeDropdown();
    }

    getBusinessTypeValue(type) {
        return type ? this.cardPackageService.getBusinessTypeValue(type) : '';
    }

    handleEPActions(iconId) {
        switch (iconId) {
            case EmployerActionsIds.EditEP:
                this.handleEditEpModal();
                break;
            case EmployerActionsIds.Billing:
                this.handleBillingModal();
                break;
            case EmployerActionsIds.ReportEP:
                this.handleAnalyticsModal(null);
                break;
            case EmployerActionsIds.Admins:
                this.handleAdminsModal();
                break;
          case EmployerActionsIds.AddNewPCs:
            this.handleChoosePcTypeModal();
            break;
          case EmployerActionsIds.SearchResume:
            this.cardPackageService.goToPage('/search', {
              types: 'resume'
            });
            break;
          default:
            break;
        }
    }

    handleEditEpModal() {
      this.storageService.setItem(
        AppSettings.DRAFT_PRODUCT_ID,
        typeof this.ID === 'string' ? parseInt(this.ID, 10) : this.ID
      );
      this.employerService.$editEpModalHandler.next(this.employerPortal);
    }

    handleBillingModal() {
      this.storageService.setItem(
        AppSettings.DRAFT_PRODUCT_ID,
        typeof this.ID === 'string' ? parseInt(this.ID, 10) : this.ID
      );
      this.storageService.setItem('Billing', 'billing');
      this.employerService.$editEpModalHandler.next(this.employerPortal);
    }

    handleAdminsModal() {
        this.employerService.$adminsModalsHandler.next(this.employerPortal);
    }

    handleChoosePcTypeModal() {
      this.employerService.$choosePcTypeModalsHandler.next({
        employerPortal: this.employerPortal,
        isOpen: true
      });
    }

    handleAnalyticsModal(data) {
        this.employerService.$portalAnalyticsModalHandler.next(data);
    }

    redirectToPricing() {
      if (this.storageService.getSession(AppSettings.DRAFT_PITCH_CARD_TYPE)) {
        this.storageService.removeSession(
          AppSettings.DRAFT_PITCH_CARD_TYPE
        );
      }

      this.cardPackageService.externalProductType =
        AppSettings.EMPLOYER_PORTAL;
      this.router.navigate(['/select-pitchcards']);
    }

    clearSearch() {
        this.employerService.activeBusinessType = this.selectedPitchCardType;
        this.searchInput.nativeElement.value = '';
    }

    onSelectClick(item) {
        if (item?.value?.optionDisabled) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    removePitchCards() {
        if (this.selectedPitchCards?.length) {
          const businessIds = [];
          const changeToCounter = {
            type: '',
            count: 0
          };
          this.selectedPitchCards.map((card) => {
            businessIds.push(card.id);
            changeToCounter.type = card.businessType;
            changeToCounter.count++;
          });
          const messagePart =
            businessIds?.length > 1 ? 'Businesses' : 'Business';
          this.$employerPortalSub.add(
            this.employerService
              .deleteInvitedBusinessesFromPortal(businessIds)
              .subscribe(
                (r) => {
                  this.selectedPitchCards = [];
                  this.uiService.successMessage(
                    r?.message
                      ? r.message
                      : `${businessIds.length} ${messagePart} has been removed from organization.`
                  );
                  setTimeout(() => {
                    this.employerService.$updateBusinesses.next(
                      this.selectedPitchCardType
                        .option as PitchCardType
                    );
                  }, 500);
                },
                (e) => {
                  this.uiService.errorMessage(
                    e?.message
                      ? e.message
                      : this.commonBindingService.getLabel(
                        'err_server'
                      )
                  );
                }
              )
          );
          this.employerPortal.businessCount[changeToCounter.type] =
            this.employerPortal.businessCount[changeToCounter.type] -
            changeToCounter.count;
          this.totalPitchCards = this.totalPitchCards - changeToCounter.count;
          setTimeout(() => {
            this.setAvailableEmployerPortal(true);
          }, 1000);
        }
    }

    showConfirmModal() {
        this.confirmationService.confirm({
          header: 'Are you sure?',
          message:
            'You are about to delete a PitchCard. You cannot undo this change.',
          acceptLabel: 'DELETE',
          rejectLabel: 'GO BACK',
          accept: () => {
            this.removePitchCards();
          },
          reject: () => {
            this.confirmationService.close();
          }
        });
    }

  onContactModalSubmit({data}) {
    this.userCommonService.contactSales(data).subscribe(
      (result) => {
        this.showRequestDemoDialog = false;
        this.showDoneDialog = true;
      },
      (err) => {
        this.uiService.errorMessage(err.message);
      }
    );
  }

  calculateTotalPitchCards() {
    const businessCountWithoutResume = Object.assign(
      this.employerPortal.businessCount,
      {}
    );
    delete businessCountWithoutResume.resume;
    const pcAmountArray: number[] = Object.values(
      businessCountWithoutResume
    );
    this.totalPitchCards = pcAmountArray.reduce(
      (a: number, b: number): number => a + b
    );
    this.employerService.updateOrganizationProgress(this.totalPitchCards);
  }

  handleSettings(e) {
    this.settings.toggle(e);
  }

  setTestimonialApproveMode() {
    this.employerPortal.autoApproveTestimonials =
      !this.employerPortal.autoApproveTestimonials;
    this.$employerPortalSub.add(
      this.employerService
        .setTestimonialApproveMode(this.employerPortal.id)
        .subscribe(
          (res) => {
            this.uiService.successMessage(
              res?.message
                ? res.message
                : 'Approve testimonials mode has been updated'
            );
          },
          (err) => {
            this.uiService.errorMessage(err.message);
          }
        )
    );
  }
}
