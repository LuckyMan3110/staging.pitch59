import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  BillingFrequency,
  BillingMethodType,
  NewBillingService
} from '../../services/new-billing.service';
import { PaymentPlanModel } from '../../../business/models/paymnent-plan.model';
import { StorageService } from '../../../shared/services/storage.service';
import { BusinessService } from '../../../business/services/business.service';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppSettings } from '../../../shared/app.settings';
import { UiService } from '../../../shared/services/ui.service';
import { BankDetailModel } from '../../../bank-details/models/bank-detail.model';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BusinessBankService } from '../../../shared/services/business-bank.service';
import { CardDetailModel } from '../../../shared/models/card-detail.model';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { PricingProduct } from '../../model/pricing-product';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { BillingMethodDto } from '../../model/billing-method-dto';
import { EmployerPortalService } from '../../../choosen-history/services/employer-portal.service';
import { ConfirmationService } from 'primeng/api';
import {
  DiscountType,
  PricingMenuService,
  ProductType
} from '../../../shared/components/pricing-menu-components/pricing-menu.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { PixelService } from 'ngx-pixel';

@Component({
  selector: 'app-billing-summary',
  templateUrl: './billing-summary.component.html',
  styleUrls: ['./billing-summary.component.scss']
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  ID: string;
  businessType: string;
  paymentPlan: PaymentPlanModel;
  userBankDetail: BankDetailModel;
  userCardDetail: CardDetailModel;
  userDetailsFromStorage: any = this.storageService.getItem(
    AppSettings.USER_DETAILS,
    true
  );
  billingFrequencyModel = BillingFrequency;
  productTypeModel = ProductType;
  DiscountType = DiscountType;
  PitchCards = PitchCardType;
  bankDetail: BankDetailModel;
  cardDetail: CardDetailModel[] = [];
  $billingSubscription = new Subscription();
  emailSubject: Subject<any> = new Subject();

  form: FormGroup;
  packagePrice: number;
  virtualVideoData: PricingProduct;
  pricingProduct: PricingProduct;
  resultPriceOfProduct: number | string;

  handlePaymentMethods: boolean = false;
  paymentApprovedModal: boolean = false;
  handleReferralEmail: boolean = false;
  wrongRefEmail: boolean = false;
  yourOwnEmail: boolean = false;
  wrongPromoCode: boolean = false;
  disablePromoCodeEdit: boolean = false;
  editDiscountMode: boolean = false;
  addedDiscountMode: boolean = false;
  confirmModal: boolean = true;
  isEditableEmail: boolean = true;
  isHaveChanges: boolean;
  isPaymentApproved: boolean = false;
  isPackageCreation: boolean;
  isSafari: boolean;

  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  removeBankAccountObject: any;

  cardErrorMessage: any;
  achErrorMessage: string;
  invalidDiscountMessage: string = '';
  discountTypeValue: string = '';
  paymentFrequencyValue: string = '';

  approveEmail: string = '';
  requestStatus: any;
  virtualVideoLink: string = '/billing-page/virtual-video';
  cardPackagesLink: string = '/cards-packages';
  LimitBusinessesInPackage = AppSettings.LimitBusinessesInPackage;

  @ViewChild('referralInput') referralInput: ElementRef;

  constructor(
    private pixel: PixelService,
    private fb: FormBuilder,
    private router: Router,
    private billingService: NewBillingService,
    private businessService: BusinessService,
    private businessBankService: BusinessBankService,
    private userService: UserCommonService,
    private storageService: StorageService,
    private deviceDetectorService: DeviceDetectorService,
    private changeDetectorRef: ChangeDetectorRef,
    private cardPackageService: CardPackageService,
    private confirmationService: ConfirmationService,
    private commonBindingService: CommonBindingDataService,
    private uiService: UiService,
    private EPService: EmployerPortalService,
    private pricingMenuService: PricingMenuService,
    private loaderService: LoaderService
  ) {
    this.isSafari = this.deviceDetectorService.browser === 'Safari';
  }

  ngOnInit(): void {
    this.ID = this.billingService.draftBusinessId;
    this.isMobile = this.deviceDetectorService.isMobile();
    this.isTablet = this.deviceDetectorService.isTablet();
    this.isDesktop = this.deviceDetectorService.isDesktop();
    this.initializeForm();

    this.initPaymentPlanObject();
    this.getBusinessType();

    if (this.billingService.draftBusinessId) {
      this.getBillingData();
    } else {
      this.getUserBillingData();
    }
    this.getCalculatePaymentPlan();
    this.referralInfo();
  }

  ngOnDestroy() {
    if (this.$billingSubscription) {
      this.$billingSubscription.unsubscribe();
    }
    if (this.requestStatus) {
      this.requestStatus = null;
    }
    this.cardPackageService.externalProductType = null;
  }

  initPaymentPlanObject() {
    if (!this.billingService.draftBusinessId) {
      this.paymentPlan = JSON.parse(
        this.storageService.getItem(AppSettings.PAYMENT_PLAN)
      );
      if (this.paymentPlan) {
        this.referralEmail.patchValue(this.paymentPlan.referralEmail);
        this.approveEmail = this.paymentPlan.referralEmail;
        if (this.paymentPlan.virtualVideo) {
          this.getPackageData('virtualVideo');
        }
      }
    }
  }

  getPackageData(businessType, paymentFrequency?, productType?) {
    this.$billingSubscription.add(
      this.cardPackageService
        .getActivePricingByBusinessType(
          businessType,
          paymentFrequency,
          productType
        )
        .subscribe((r) => {
          if (r.data?.length) {
            const data = r.data[0];
            if (paymentFrequency) {
              this.pricingProduct = data;
              this.pricingProduct.price =
                this.pricingProduct?.type ===
                ProductType.Portal &&
                this.pricingProduct?.freeCountBusiness
                  ? this.pricingProduct.price *
                  this.pricingProduct.freeCountBusiness
                  : this.pricingProduct.price;
            } else {
              this.virtualVideoData = data;
              this.resultPriceOfProduct = (
                this.virtualVideoData.price -
                this.virtualVideoData.referralDiscount
              ).toFixed(2);
            }
          }
        })
    );
  }

  getBusinessType() {
    this.businessType = this.billingService.getBusinessType();

    if (!this.businessType) {
      this.businessType = this.cardPackageService.externalProductType;
    }
  }

  getBillingData() {
    this.$billingSubscription.add(
      forkJoin([
        this.businessService.getBusinessDetail(this.ID),
        this.businessBankService.getBankAccountDetails(this.ID)
      ]).subscribe(([business, bankDetail]) => {
        this.cardDetail = business ? business.data?.cardDetails : [];
        this.bankDetail = bankDetail ? bankDetail.data : null;
      })
    );
  }

  getCalculatePaymentPlan() {
    this.isPackageCreation =
      (!this.pricingMenuService.hasUserEmployerPortal &&
        this.paymentPlan?.type === ProductType.Portal) ||
      (!this.userService.isEmploymentPortal &&
        this.paymentPlan?.type === ProductType.Portal);
    this.$billingSubscription.add(
      this.businessService
        .calculateBusinessPlan(
          this.calculatePaymentPlanRequestObject(),
          this.businessType
        )
        .subscribe(
          (r) => {
            if (r.data) {
              this.paymentPlan = r.data;

              this.discountTypeValue =
                this.paymentPlan.discountType ===
                DiscountType.Dollar
                  ? '$'
                  : '%';

              if (
                this.paymentPlan.paymentFrequency ===
                BillingFrequency.Monthly
              ) {
                this.paymentFrequencyValue =
                  this.paymentPlan.paymentCyclesCount > 1
                    ? 'months'
                    : 'month';
              } else if (
                this.paymentPlan.paymentFrequency ===
                BillingFrequency.Annual
              ) {
                this.paymentFrequencyValue =
                  this.paymentPlan.paymentCyclesCount > 1
                    ? 'years'
                    : 'year';
              }
              this.storageService.setItem(
                AppSettings.PAYMENT_PLAN,
                this.paymentPlan
              );

              this.referralEmail.patchValue(
                r.data.referralEmail ? r.data.referralEmail : ''
              );
              this.approveEmail = r.data.referralEmail
                ? r.data.referralEmail
                : '';
              this.getPackageData(
                this.businessType,
                this.paymentPlan.paymentFrequency,
                this.paymentPlan.type
              );
              if (this.paymentPlan.virtualVideo) {
                this.getPackageData('virtualVideo');
              }
            }
          },
          (e) => {
            this.uiService.errorMessage(e.message);
          }
        )
    );
  }

  calculatePaymentPlanRequestObject() {
    return {
      paymentFrequency: this.paymentPlan?.paymentFrequency
        ? this.paymentPlan?.paymentFrequency
        : 1,
      virtualVideo: this.paymentPlan?.hasOwnProperty('virtualVideo')
        ? this.paymentPlan.virtualVideo
        : false,
      discountCode: this.form.get('discountCode').value,
      referralEmail: this.paymentPlan?.referralEmail
        ? this.paymentPlan.referralEmail
        : '',
      type: this.paymentPlan?.type,
      businessCount:
        this.paymentPlan?.type === ProductType.Portal
          ? this.LimitBusinessesInPackage
          : 1
    };
  }

  getUserBillingData() {
    this.$billingSubscription.add(
      this.userService
        .getUserBillingInfo('page-center')
        .subscribe((r) => {
          if (r.data) {
            this.bankDetail = r.data.bankDetail
              ? r.data.bankDetail
              : null;
            this.cardDetail = r.data.creditCard
              ? [r.data.creditCard]
              : [];
            this.userCardDetail = r.data?.creditCard
              ? r.data.creditCard
              : null;
          }
        })
    );
  }

  referralInfo() {
    this.$billingSubscription.add(
      this.billingService.getReferrerByEmailId().subscribe((r) => {
        if (r.data) {
          this.referralEmail.patchValue(
            r.data.emailId ? r.data.emailId : ''
          );
          this.approveEmail = r.data.emailId ? r.data.emailId : '';
          this.isEditableEmail = r.data.isEditableRefferer;
          this.wrongRefEmail = false;
        }
      })
    );
  }

  initializeForm() {
    this.form = this.fb.group({
      referralEmail: [
        '',
        [Validators.pattern(AppSettings.EMAIL_PATTERN)]
      ],
      discountCode: [
        '',
        [Validators.minLength(4), Validators.maxLength(24)]
      ]
    });
  }

  updateReferralEmail() {
    this.wrongRefEmail = false;
    this.yourOwnEmail = false;
    if (this.userDetailsFromStorage.email === this.referralEmail.value) {
      this.yourOwnEmail = true;
      return;
    }
    if (this.referralEmail.valid) {
      this.$billingSubscription.add(
        this.billingService
          .updateReferralEmail(this.referralEmail.value)
          .subscribe(
            (r) => {
              this.wrongRefEmail = false;
              this.approveEmail = this.referralEmail.value;
              this.handleReferralEmail = false;
              r.message
                ? this.uiService.successMessage(r.message)
                : this.uiService.successMessage(
                  this.commonBindingService.getLabel(
                    'lbl_ref_email_updated'
                  )
                );
            },
            (error) => {
              setTimeout(() => {
                this.wrongRefEmail = true;
              }, 1000);
            }
          )
      );
    } else {
      this.wrongRefEmail = true;
    }
  }

  updatePaymentPlan(field, disable) {
    const params = {
      paymentFrequency: this.paymentPlan.paymentFrequency,
      virtualVideo: this.paymentPlan.virtualVideo
    };
    params[field] = this.form.get(field).value;

    this.$billingSubscription.add(
      this.getPaymentPlanRoute(params).subscribe(
        (r) => {
          if (disable && r.data) {
            this.wrongPromoCode = false;
            this.disablePromoCodeEdit = true;
            this.paymentPlan = r.data;
            this.storageService.setItem(
              AppSettings.PAYMENT_PLAN,
              this.paymentPlan
            );
            this.form.get(field).setErrors(null);
            if (
              field === 'discountCode' &&
              this.form.get('discountCode').value
            ) {
              this.discountTypeValue =
                this.paymentPlan.discountType ===
                DiscountType.Dollar
                  ? '$'
                  : '%';

              if (
                this.paymentPlan.paymentFrequency ===
                BillingFrequency.Monthly
              ) {
                this.paymentFrequencyValue =
                  this.paymentPlan.paymentCyclesCount > 1
                    ? 'months'
                    : 'month';
              } else if (
                this.paymentPlan.paymentFrequency ===
                BillingFrequency.Annual
              ) {
                this.paymentFrequencyValue =
                  this.paymentPlan.paymentCyclesCount > 1
                    ? 'years'
                    : 'year';
              }
              this.addedDiscountMode = true;
              this.editDiscountMode = false;
            }
          } else {
            this.wrongRefEmail = false;
            this.uiService.successMessage(
              'Referral Email Successfully Updated'
            );
          }
        },
        (e) => {
          if (field === 'discountCode') {
            this.uiService.errorMessage(
              e.message ? e.message : 'Invalid Promo Code'
            );
            this.invalidDiscountMessage = e.message
              ? e.message
              : 'Invalid code.';
            this.wrongPromoCode = true;
          }
        }
      )
    );
  }

  getPaymentPlanRoute(params) {
    if (
      this.paymentPlan.itemName?.includes('Employer') &&
      !this.userService?.isEmploymentPortal
    ) {
      this.paymentPlan.type = ProductType.Portal;
    }
    this.isPackageCreation =
      (!this.pricingMenuService.hasUserEmployerPortal &&
        this.paymentPlan?.type === ProductType.Portal) ||
      (!this.userService.isEmploymentPortal &&
        this.paymentPlan?.type === ProductType.Portal);
    if (this.billingService.draftBusinessId) {
      return this.businessService.addUpdateBusinessPaymentPlan(
        this.billingService.draftBusinessId,
        params
      );
    } else {
      const requestObj = {
        paymentFrequency: this.paymentPlan.paymentFrequency,
        virtualVideo: this.paymentPlan.virtualVideo,
        type: this.paymentPlan?.type ? this.paymentPlan.type : null,
        discountCode: this.form.get('discountCode').value
          ? this.form.get('discountCode').value
          : '',
        referralEmail: this.form.get('referralEmail').value
          ? this.form.get('referralEmail').value
          : '',
        businessCount:
          this.paymentPlan?.type === ProductType.Portal
            ? this.LimitBusinessesInPackage
            : 1
      };
      return this.businessService.calculateBusinessPlan(
        requestObj,
        this.businessType
      );
    }
  }

  changeEmail(event) {
    this.emailSubject.next(event.target.value);
  }

  removeVirtualVideo(value) {
    this.paymentPlan.virtualVideo = value;
    this.getCalculatePaymentPlan();
  }

  saveChanges(data) {
    if (this.removeBankAccountObject && this.removeBankAccountObject.id) {
      this.achErrorMessage = '';
      this.$billingSubscription.add(
        this.userService
          .deleteUserACH(this.removeBankAccountObject.id)
          .subscribe(
            (r) => {
              this.uiService.successMessage(
                r.message
                  ? r.message
                  : 'Bank Account has been removed'
              );
              this.removeBankAccountObject = {};
              this.bankDetail = null;
              this.isHaveChanges = false;
              this.storageService.removeItem(
                AppSettings.USER_BANK_DETAILS
              );
              if (!data) {
                this.handlePaymentMethods = false;
              }
            },
            (e) => {
              if (e.Message) {
                this.uiService.errorMessage(e.Message);
                this.achErrorMessage = e.Message
                  ? e.Message
                  : 'Oops';
              }
            }
          )
      );
    }

    if (data) {
      if (data.billingMethod === BillingMethodType.BankAccount) {
        this.saveBankDetailChanges(data);
      }
      if (data.billingMethod === BillingMethodType.CreditCard) {
        this.saveCreditCardChanges(data);
      }
    }
  }

  saveCreditCardChanges(cardDetails) {
    this.cardErrorMessage = null;
    if (cardDetails) {
      this.getCreditCardRoute(cardDetails).subscribe(
        (result) => {
          if (cardDetails) {
            const card = {
              stripeToken: cardDetails.number,
              expYear: 20 + cardDetails.expiry.slice(2),
              expMonth: cardDetails.expiry.substring(0, 2),
              last4: cardDetails.number.substr(
                cardDetails.number.length - 4,
                4
              )
            } as CardDetailModel;

            this.cardDetail[0] = card;
          }
          if (result.data) {
            this.userCardDetail = result.data;
            this.storageService.setItem(
              AppSettings.USER_CARD_DETAILS,
              result.data
            );
          }

          if (result.message) {
            this.uiService.successMessage(result.message);
          }

          this.handlePaymentMethods = false;

          setTimeout(() => {
            this.isHaveChanges = false;
            this.changeDetectorRef.detectChanges();
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
            this.changeDetectorRef.detectChanges();
          }, 5000);
        }
      );
    }
  }

  getCreditCardRoute(card): Observable<any> {
    if (this.ID) {
      return this.businessService.addNewFullCardDetails(this.ID, card);
    } else {
      delete card.billingMethod;
      return this.userService.addFullCardToUser(card);
    }
  }

  saveBankDetailChanges(bankDetails) {
    this.achErrorMessage = '';
    if (bankDetails) {
      this.getBankAccountRoute(bankDetails).subscribe(
        (result) => {
          if (result.data) {
            this.userBankDetail = result.data;
            this.storageService.setItem(
              AppSettings.USER_BANK_DETAILS,
              result.data
            );
          }
          if (bankDetails) {
            this.bankDetail = bankDetails;
            this.bankDetail.id = result.data.id;
          }
          this.isHaveChanges = false;

          if (result.message) {
            this.uiService.successMessage(result.message);
          }
          this.handlePaymentMethods = false;
        },
        (e) => {
          if (e.Message) {
            this.uiService.errorMessage(e.Message);
          }
          this.achErrorMessage = e.Message ? e.Message : 'Oops';

          setTimeout(() => {
            this.changeDetectorRef.detectChanges();
          }, 5000);
        }
      );
    }
  }

  getBankAccountRoute(bankDetailModel: BankDetailModel): Observable<any> {
    if (this.ID) {
      if (!bankDetailModel.id) {
        this.businessBankService.addNewBankAccountDetails(
          this.ID.toString(),
          this.billingService.populateAchObject(bankDetailModel)
        );
      } else {
        this.businessBankService.updateBankAccountDetails(
          this.ID,
          this.billingService.populateAchObject(bankDetailModel)
        );
      }
    } else {
      if (!bankDetailModel.id) {
        return this.userService.addBankDetailToUser(
          this.billingService.populateAchObject(bankDetailModel)
        );
      } else {
        return this.userService.updateBankDetailOfUser(
          bankDetailModel.id,
          this.billingService.populateAchObject(bankDetailModel)
        );
      }
    }
  }

  populateBankDetailRemoveObj(ach) {
    if (!ach.id) {
      const savedObj = JSON.parse(
        this.storageService.getItem(AppSettings.USER_BANK_DETAILS)
      );
      ach.id = savedObj && savedObj.id ? savedObj.id : null;
    }
    this.removeBankAccountObject = {id: ach.id};
    this.confirmModal = false;
  }

  addSecurityToPayment(code) {
    if (code) {
      return (
        'X'.repeat(code.length - 4) + code.substr(code.length - 4, 4)
      );
    }
  }

  clearPromoCode() {
    this.form.get('discountCode').patchValue('');
    this.paymentPlan.discountCode = '';
    this.paymentPlan.amountDiscountCode = null;
    this.addedDiscountMode = false;
    this.invalidDiscountMessage = '';
    this.discountTypeValue = '';
    this.paymentFrequencyValue = '';
    this.updatePaymentPlan('discountCode', true);
  }

  acceptModal() {
    if (this.isHaveChanges) {
      this.confirmationService.confirm({
        rejectButtonStyleClass: 'bg-darkgray',
        message: this.commonBindingService.getLabel(
          'message_lost_changes'
        ),
        header: this.commonBindingService.getLabel(
          'label_lost_changes'
        ),
        accept: () => {
          this.handlePaymentMethods = false;
          this.cardErrorMessage = null;
          this.isHaveChanges = false;
        },
        reject: () => {
          this.handlePaymentMethods = true;
        }
      });
    } else {
      this.handlePaymentMethods = false;
      this.isHaveChanges = false;
    }
  }

  acceptReferralModal() {
    if (this.approveEmail !== this.referralEmail.value) {
      this.confirmationService.confirm({
        rejectButtonStyleClass: 'bg-darkgray',
        message: this.commonBindingService.getLabel(
          'message_lost_changes'
        ),
        header: this.commonBindingService.getLabel(
          'label_lost_changes'
        ),
        accept: () => {
          this.confirmationService.close();
          this.closeReferralModal();
        },
        reject: () => {
          this.confirmationService.close();
        }
      });
    } else {
      this.closeReferralModal();
    }
  }

  closeReferralModal() {
    this.handleReferralEmail = false;
    this.wrongRefEmail = false;
    this.yourOwnEmail = false;
    if (this.referralEmail.invalid) {
      this.referralEmail.patchValue('');
    }
  }

  createBusinessByBilling() {
    this.loaderService.show('page-center');

    const requestObj = {
      businessType: this.businessType,
      inviteId: null,
      billingMethodDto: null,
      paymentPlanDto: {
        paymentFrequency: this.paymentPlan.paymentFrequency,
        virtualVideo: this.paymentPlan.virtualVideo,
        type: this.paymentPlan.type,
        discountCode: this.paymentPlan.discountCode
          ? this.paymentPlan.discountCode
          : '',
        referralEmail: this.paymentPlan.referralEmail
          ? this.paymentPlan.referralEmail
          : ''
      }
    };

    if (this.cardDetail && this.cardDetail.length) {
      requestObj.billingMethodDto = Object.assign(
        new BillingMethodDto({
          id: this.cardDetail[0].id,
          type: BillingMethodType.CreditCard
        })
      );

      if (!requestObj.billingMethodDto.id) {
        requestObj.billingMethodDto = Object.assign(
          new BillingMethodDto({
            id: JSON.parse(
              this.storageService.getItem(
                AppSettings.USER_CARD_DETAILS
              )
            ).id,
            type: BillingMethodType.CreditCard
          })
        );
      }

      this.$billingSubscription.add(
        this.businessService
          .addBusinessByBillingAndPaymentPlan(requestObj)
          .subscribe(
            (r) => {
              if (r.data) {
                this.storageService.setItem(
                  AppSettings.PAYMENT_REQUEST,
                  {code: 200}
                );
                this.storageService.setSession(
                  AppSettings.DRAFT_BUSINESS_ID,
                  r.data?.businessId
                );

                this.isPaymentApproved = true;

                this.pixel.track('Purchase', {
                  content_name: 'Payment approved',
                  value: parseInt(
                    this.paymentPlan.amount.toFixed(2),
                    10
                  ),
                  currency: 'USD'
                });

                this.storageService.removeItem(
                  'selectedPackage'
                );
                this.storageService.removeItem(
                  AppSettings.PAYMENT_PLAN
                );

                this.loaderService.hide();
              }
            },
            (e) => {
              this.handlePaymentApproveModal(e);
              this.isPaymentApproved = false;
              this.loaderService.hide();
            }
          )
      );
    }

    if (this.bankDetail) {
      requestObj.billingMethodDto = Object.assign(
        new BillingMethodDto({
          id: this.bankDetail[0].id,
          type: BillingMethodType.BankAccount
        })
      );

      this.$billingSubscription.add(
        this.businessService
          .addBusinessByBillingAndPaymentPlan(requestObj)
          .subscribe(
            (r) => {
              if (r.data) {
                this.storageService.setItem(
                  AppSettings.PAYMENT_REQUEST,
                  {code: 200}
                );
              }
            },
            (e) => {
              if (e.code == AppSettings.PAYMENT_FAILED) {
                this.storageService.setItem(
                  AppSettings.PAYMENT_REQUEST,
                  e
                );
                this.uiService.errorMessage(
                  e.message
                    ? e.message
                    : this.commonBindingService.getLabel(
                      'err_payment_failed'
                    )
                );
              } else if (e.code != AppSettings.PAYMENT_FAILED) {
                this.uiService.errorMessage(
                  e.message
                    ? e.message
                    : this.commonBindingService.getLabel(
                      'err_payment_failed'
                    )
                );
              }
            }
          )
      );
    }
  }

  handlePaymentApproveModal(error) {
    this.requestStatus = error;
    if (this.requestStatus) {
      this.paymentApprovedModal = true;
    }
  }

  initBillingOfEmployerPortal() {
    this.loaderService.show('page-center');
    const requestObj = {
      billingType: this.pricingProduct.paymentFrequency,
      businessType: this.cardPackageService.selectedType,
      type: this.pricingProduct.type,
      billingMethodDto: BillingMethodDto,
      paymentPlanDto: {
        paymentFrequency: this.pricingProduct.paymentFrequency,
        virtualVideo: false,
        type: this.pricingProduct.type,
        discountCode: this.paymentPlan.discountCode
          ? this.paymentPlan.discountCode
          : '',
        referralEmail: ''
      }
    };
    requestObj.billingMethodDto = Object.assign(
      new BillingMethodDto({
        id: this.userCardDetail?.id ? this.userCardDetail.id : null,
        type: BillingMethodType.CreditCard
      })
    );

    this.$billingSubscription.add(
      this.EPService.createEmployerPortal(requestObj).subscribe(
        (res) => {
          if (res.data) {
            this.storageService.setItem(
              AppSettings.DRAFT_PRODUCT_ID,
              res.data.id
            );
            this.loaderService.hide();
            this.isPaymentApproved = true;
          }
        },
        (error) => {
          this.loaderService.hide();
          this.isPaymentApproved = false;
          if (error?.code === AppSettings.PAYMENT_FAILED) {
            this.handlePaymentApproveModal(error);
          } else {
            this.uiService.errorMessage(
              error.message
                ? error.message
                : this.commonBindingService.getLabel(
                  'err_server'
                )
            );
          }
        }
      )
    );
  }

  handleReferralModal() {
    this.handleReferralEmail = true;
    if (this.referralInput.nativeElement) {
      this.referralInput.nativeElement.focus();
    }
    this.referralEmail.patchValue(
      this.approveEmail ? this.approveEmail : ''
    );
  }

  getBusinessTypeValue() {
    return this.billingService.getBusinessTypeValue(this.businessType);
  }

  calculateNextRoute() {
    if (!this.isPackageCreation) {
      this.cardPackageService.goToPage('/create');
    } else {
      this.cardPackageService.goToPage('/account/employer-portal');
    }
  }

  get isExternalProduct(): boolean {
    if (this.pricingProduct) {
      return (
        this.pricingProduct.businessType !== PitchCardType.Service &&
        this.pricingProduct.businessType !== PitchCardType.Basic &&
        this.pricingProduct.businessType !== PitchCardType.Employee
      );
    }
  }

  get referralEmail() {
    return this.form.get('referralEmail');
  }
}
