import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import {
  RequestPaymentPlan,
  ResponsePaymentPlan,
  SelectPitchCardsService
} from './select-pitch-cards.service';
import { PitchCardType } from '../../enums/pitch-card-type.enum';
import { Observable, Subject, Subscription } from 'rxjs';
import {
  BillingFrequency,
  BillingMethodType
} from '../../../new-billing/services/new-billing.service';
import {
  OrganizationProgress,
  UserCommonService
} from '../../services/user-common.service';
import { CardDetailModel } from '../../models/card-detail.model';
import { StorageService } from '../../services/storage.service';
import { debounceTime } from 'rxjs/operators';
import { UiService } from '../../services/ui.service';
import { CommonBindingDataService } from '../../services/common-binding-data.service';
import { AppSettings } from '../../app.settings';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfirmationService } from 'primeng/api';
import { EmployerPortalService } from '../../../choosen-history/services/employer-portal.service';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { ActivatedRoute } from '@angular/router';

import { ProductType } from '../../../../modules/shared/components/pricing-menu-components/pricing-menu.service';

@Component({
  selector: 'app-select-pitchcards',
  templateUrl: './select-pitchcards.component.html',
  styleUrls: [
    './select-pitchcards.component.scss',
    '../pricing-menu-components/pricing-menu-layout/pricing-menu-layout.component.scss'
  ]
})
export class SelectPitchcardsComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  packages: FormArray;
  PitchCardEnum = PitchCardType;
  organizationID = null;

  $packageSubscription = new Subscription();
  $counterSubjects: Subject<{ value; groupIndex }> = new Subject();

  // Billing info
  userCardDetail: CardDetailModel[] = [];
  organizationCard: CardDetailModel[] = [];
  mainCardDetail: CardDetailModel[] = [];
  hasCardChanges: boolean = false;
  cardErrorMessage: any;
  handlePaymentMethods: boolean = false;
  showRequestDemoModal: boolean = false;
  showDoneDialog: boolean = false;
  billingFrequencyEnum = BillingFrequency;
  requestPaymentPlan: RequestPaymentPlan = null;
  responsePaymentPlan: ResponsePaymentPlan = null;
  isOrganizationMode: boolean = false;
  isDisableAutoDiscount: boolean;
  isPaymentApproved: boolean = false;
  editDiscountMode: boolean = false;
  addedDiscountMode: boolean = false;
  invalidDiscountMessage: string = '';
  totalPCsInEP: number = 0;
  additionalPCsInEP: number = 0;

  isSafari: boolean = this.deviceService.browser === 'Safari';

  userDetailsFromStorage: any = this.storageService.getItem(
    AppSettings.USER_DETAILS,
    true
  );

  isMobile: boolean = this.deviceService.isMobile();
  isTablet: boolean = this.deviceService.isTablet();
  stepOneActive: boolean = true;
  stepTwoActive: boolean = false;
  onlyOrganization: boolean = !!this.route.snapshot?.queryParams?.orgId;
  helpCenterLink = AppSettings.helpCenterLink;

  isAuthUser: boolean = this.userCommonService.isAuthenticated();
  isResumeCreated: boolean;

  @ViewChild('scrollableBlock') scrollableBlock: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private selectPCService: SelectPitchCardsService,
    private userService: UserCommonService,
    private storageService: StorageService,
    private uiService: UiService,
    private bindingDataService: CommonBindingDataService,
    private deviceService: DeviceDetectorService,
    private confirmationService: ConfirmationService,
    private employerService: EmployerPortalService,
    private cdr: ChangeDetectorRef,
    private cardPackageService: CardPackageService,
    private userCommonService: UserCommonService,
    private confirmService: ConfirmationService,
  ) {
  }

  ngOnInit(): void {
    this.createForms();
    this.getOrganizationInfo();
    this.initSubscriptions();
    this.isResumeCreated = this.storageService.getItem(AppSettings.IS_RESUME_EXIST)
      ? this.storageService.getItem(AppSettings.IS_RESUME_EXIST, true)
      : false;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.$counterSubjects.next({value: 1, groupIndex: '0'});
    }, 1000);
  }

  ngOnDestroy() {
    if (this.$packageSubscription) {
      this.$packageSubscription.unsubscribe();
    }
  }

  createForms() {
    this.form = this.selectPCService.getForm();
    this.packages = this.form.get('packages') as FormArray;
  }

  initSubscriptions() {
    this.$counterSubjects
      .pipe(debounceTime(500))
      .subscribe((target) => {
          this.packages.get(target.groupIndex).get('businessCount').patchValue(target.value);
          this.getPaymentPlan();
      });
  }

  getBillingData() {
    this.$packageSubscription.add(
      this.userService
        .getUserBillingInfo('page-center', this.organizationID)
        .subscribe((r) => {
          if (r?.data) {
            this.userCardDetail = r.data.creditCard
              ? [r.data.creditCard]
              : [];
            this.organizationCard = r.data.organizationCard
              ? [r.data.organizationCard]
              : [];
            if (
              this.storageService.getSession('organizationCard')
            ) {
              this.mainCardDetail = [
                this.storageService.getSession(
                  'organizationCard'
                )
              ];
            } else {
              this.mainCardDetail = this.userCardDetail;
            }
            this.requestPaymentPlan = {
              typeCounts: []
            };
          }
        })
    );
  }

  getOrganizationInfo() {
    if (!this.userService.userOrganizationProgress?.length) {
      const orgProcess: OrganizationProgress =
        this.storageService.getItem(
          AppSettings.ORGANIZATION_PROGRESS,
          true
        );
      this.organizationID = orgProcess?.id ? orgProcess.id : null;
      this.totalPCsInEP = orgProcess?.businessCount
        ? orgProcess.businessCount
        : 0;
      this.getBillingData();
    } else {
      this.organizationID = this.userService.userOrganizationProgress
        ?.length
        ? this.userService.userOrganizationProgress[0].id
        : null;
      this.totalPCsInEP = this.userService.userOrganizationProgress
        ?.length
        ? this.userService.userOrganizationProgress[0].businessCount
        : 0;
      this.getBillingData();
    }
  }

  getPaymentPlan() {
    this.calculatePaymentPlan();
    this.$packageSubscription.add(
      this.selectPCService
        .calculateNewPaymentPlan(
          this.requestPaymentPlan,
          this.isOrganizationMode,
          this.organizationID && this.isOrganizationMode
            ? this.organizationID
            : null,
          this.isDisableAutoDiscount,
        )
        .subscribe(
          (res) => {
            if (res?.data) {
              this.responsePaymentPlan = res.data;
              if (this.responsePaymentPlan?.discountCode) {
                this.setDiscountBlock();
              }
            }
          },
          (error) => {
            this.handleError(error?.message);
            if (error?.field === 'DiscountCode') {
              this.invalidDiscountMessage = error.message
                ? error.message
                : 'Invalid code.';
            }
          }
        )
    );
  }

  saveChanges() {
    this.calculatePaymentPlan();
    this.mainCardDetail = this.useCard();
    this.requestPaymentPlan.billingMethodDto = {
      id: Number(this.mainCardDetail[0].id),
      type: Number(this.mainCardDetail[0].type)
    };

    this.$packageSubscription.add(
      this.selectPCService
        .addBusinesses(
          this.requestPaymentPlan,
          this.isOrganizationMode,
          this.organizationID && this.isOrganizationMode
            ? this.organizationID
            : null
        )
        .subscribe(
          (res) => {
            if (res?.data) {
              this.isPaymentApproved = true;
              if (!this.isOrganizationMode) {
                this.storageService.setSession(
                  AppSettings.DRAFT_BUSINESS_ID,
                  res.data[0].id
                );
                this.cardPackageService.selectedType =
                  res.data[0].businessType;
              } else {
                this.employerService.updateOrganizationProgress(
                  this.totalPCsInEP + this.additionalPCsInEP
                );
              }
            }
          },
          (error) => {
            this.handleError(error?.message);
          }
        )
    );
  }

  calculatePaymentPlan() {
    this.requestPaymentPlan.typeCounts = [];
    this.packages.value.map((p) => {
      if (p.businessCount > 0) {
        this.requestPaymentPlan.typeCounts.push(p);
      }
    });
    if (this.form.get('discountCode')?.value) {
      this.requestPaymentPlan.discountCode = this.form.get('discountCode').value;
    } else if (this.responsePaymentPlan?.discountCode && this.addedDiscountMode == true && this.editDiscountMode == false){
      this.requestPaymentPlan.discountCode = this.responsePaymentPlan.discountCode;
    }

    this.additionalPCsInEP = this.requestPaymentPlan.typeCounts.reduce((acc, currentValue) => acc + currentValue.businessCount, 0);
    this.isOrganizationMode = this.additionalPCsInEP > 1 || !!this.requestPaymentPlan.typeCounts.find(c => c.businessType === PitchCardType.Job) || this.onlyOrganization;
    this.mainCardDetail = this.useCard();
  }

  setDiscountBlock() {
    this.addedDiscountMode = true;
    this.editDiscountMode = false;
  }

  useCard() {
    return this.isOrganizationMode && this.organizationID
      ? this.organizationCard
      : this.userCardDetail;
  }

  handleError(message) {
    this.uiService.errorMessage(
      message ? message : this.bindingDataService.getLabel('err_server')
    );
  }

  getPackageValues(type: PitchCardType, field: string): string {
    return this.selectPCService
      .getPricingPackages()
      .find((pp) => pp.type === type)[field];
  }

  initCounter(e, i) {
    this.$counterSubjects.next(
      e?.value
        ? {value: e.value, groupIndex: i.toString()}
        : {value: 0, groupIndex: i.toString()}
    );
  }

  acceptModal() {
    if (this.hasCardChanges) {
      this.confirmationService.confirm({
        rejectButtonStyleClass: 'bg-darkgray',
        message: this.bindingDataService.getLabel(
          'message_lost_changes'
        ),
        header: this.bindingDataService.getLabel('label_lost_changes'),
        accept: () => {
          this.handlePaymentMethods = false;
          this.cardErrorMessage = null;
          this.hasCardChanges = false;
        },
        reject: () => {
          this.handlePaymentMethods = true;
        }
      });
    } else {
      this.handlePaymentMethods = false;
      this.hasCardChanges = false;
    }
  }

  saveCard(cardDetails) {
    if (cardDetails?.billingMethod === BillingMethodType.CreditCard) {
      this.cardErrorMessage = null;
      if (cardDetails) {
        delete cardDetails.billingMethod;
        this.getCreditCardRoute(cardDetails).subscribe(
          (result) => {
            if (result?.data) {
              const card = {
                id: result.data.id,
                type: result.data.type,
                stripeToken: cardDetails.number,
                expYear: 20 + cardDetails.expiry.slice(2),
                expMonth: cardDetails.expiry.substring(0, 2),
                last4: cardDetails.number.substr(
                  cardDetails.number.length - 4,
                  4
                )
              } as CardDetailModel;
              this.userCardDetail[0] =
                this.isOrganizationMode && this.organizationID
                  ? this.userCardDetail[0]
                  : card;
              this.organizationCard[0] =
                this.isOrganizationMode && this.organizationID
                  ? card
                  : this.isOrganizationMode[0];
            }
            this.useCard();

            if (result.message) {
              this.uiService.successMessage(result.message);
            }

            this.handlePaymentMethods = false;

            setTimeout(() => {
              this.hasCardChanges = false;
              this.cdr.detectChanges();
            }, 3000);
          },
          (err) => {
            if (err.Message) {
              if (err.code === 500) {
                this.uiService.errorMessage(err.Message);
              }
            }

            if (err.code !== 500) {
              this.cardErrorMessage = err;
            }

            setTimeout(() => {
              this.cdr.detectChanges();
            }, 5000);
          }
        );
      }
    }
  }

  getCreditCardRoute(card): Observable<any> {
    if (this.isOrganizationMode && this.organizationID) {
      return this.employerService.addCardDetail(
        this.organizationID,
        card
      );
    } else {
      return this.userService.addFullCardToUser(card);
    }
  }

  clearPromoCode() {
    this.form.get('discountCode').patchValue('');
    this.isDisableAutoDiscount = this.responsePaymentPlan?.discountCode == 'FREEMONTH'? true : null;
    this.requestPaymentPlan.discountCode = '';
    this.addedDiscountMode = false;
    this.invalidDiscountMessage = '';
    // this.discountTypeValue = '';
    this.addedDiscountMode = false;
    this.getPaymentPlan();
  }

  calculateNextRoute() {
    if (!this.isOrganizationMode) {
      let params = null;
      if (this.storageService.getSession(AppSettings.DRAFT_BUSINESS_ID)) {
        params = {
          businessId: this.storageService.getSession(
            AppSettings.DRAFT_BUSINESS_ID
          )
        };
      }
      this.cardPackageService.goToPage('/create', params ? params : null);
    } else {
      this.cardPackageService.goToPage('/account/employer-portal');
    }
  }

  executeProportionalScroll(event, index) {
    const numberOfElements =
      this.scrollableBlock.nativeElement.childElementCount;
    if (index > numberOfElements / 2) {
      this.scrollableBlock.nativeElement.scroll({
        top: this.scrollableBlock.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      this.scrollableBlock.nativeElement.scroll({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  nextStep() {
    this.stepOneActive = false;
    this.stepTwoActive = true;
    window.scroll(0, 0);
  }

  openModal() {
    this.showRequestDemoModal = true;
  }

  onContactModalSubmit({data}) {
    this.userService.contactSales(data).subscribe(result => {
      this.showRequestDemoModal = false;
      this.showDoneDialog = true;
    }, err => {
      this.uiService.errorMessage(err.message);
    });
  }

  setInformationModal() {
    this.confirmService.confirm({
      key: 'isResumeExist',
      header: this.isResumeCreated ? 'Resume Already Exists' : '',
      message: !this.isResumeCreated
        ? 'Resume Cards are only for helping you find employment or get recruited. Please confirm that you’re seeking new employment or exploring other job opportunities.'
        : '',
      acceptLabel: 'OK',
      acceptIcon: '-',
      rejectVisible: false,
      accept: () => {
        this.setResume();
      }
    });
  }
  
  setResume() {
    const selectedProduct = {businessType: PitchCardType.Resume, paymentFrequency: BillingFrequency.Monthly, type: ProductType.Single};
    this.cardPackageService.selectPackage(selectedProduct);
    this.storageService.setItem(AppSettings.PAYMENT_PLAN, {
      paymentFrequency: selectedProduct.paymentFrequency,
      type: selectedProduct.type
    });
    this.navigateToPage({url: 'create', withAuth: true});
  }

  navigateToPage(config: { url: string, withAuth: boolean }) {
    if (config.withAuth) {
      if (!this.isAuthUser) {
        this.cardPackageService.goToPage('/sign-up', {serviceurl: config.url});
      } else {
        this.cardPackageService.goToPage(config.url);
      }
    } else {
      this.cardPackageService.goToPage(config.url);
    }
  }
}
