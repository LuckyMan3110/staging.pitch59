import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CardPackage } from '../../../../cards-packages/models/card-package.model';
import { CardPackageService } from '../../../../cards-packages/services/card-package.service';
import { Subscription } from 'rxjs';
import { PitchCardType } from '../../../enums/pitch-card-type.enum';
import { UserCommonService } from '../../../services/user-common.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BillingFrequency } from '../../../../new-billing/services/new-billing.service';
import { AppSettings } from '../../../app.settings';
import { PricingProduct } from '../../../../new-billing/model/pricing-product';
import { Router } from '@angular/router';
import { CardDetailModel } from '../../../models/card-detail.model';
import { BusinessService } from '../../../../business/services/business.service';
import { StorageService } from '../../../services/storage.service';
import { UiService } from '../../../services/ui.service';
import { EmployerPortalService } from '../../../../choosen-history/services/employer-portal.service';
import { CommonBindingDataService } from '../../../services/common-binding-data.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-choose-pitchcard',
  templateUrl: './choose-pitchcard.component.html',
  styleUrls: ['./choose-pitchcard.component.scss']
})
export class ChoosePitchcardComponent implements OnInit, OnDestroy {
  // EP - Employer portal

  isAnnuallyBilling: boolean = true;
  createEmployerPortalModal: boolean = false;
  createPCFromEPModal: boolean = false;
  hasUserEmployerPortal: boolean;
  isResumeCreated: boolean = true;
  allowCreateResume: boolean;

  isAuthUser: boolean = this.userCommonService.isAuthenticated();
  isDesktop: boolean = this.deviceService.isDesktop();
  isMobile: boolean = this.deviceService.isMobile();

  cardsPackages: any[] = [];
  descriptionsList = [];
  activePrices = [];
  selectedBillingType = '';
  organizationId: string;
  $choosePcSub = new Subscription();
  billingFrequencyEnum = BillingFrequency;
  pitchcardTypes = PitchCardType;
  pricePer: string = '';
  scaleFactor = this.isDesktop ? 0.55 : 0.65;
  selectedPCType: any;
  employerPortalProductName = AppSettings.EMPLOYER_PORTAL as PitchCardType;
  realPriceEP: string | number;

  productEP: PricingProduct;
  businessProduct: PricingProduct;
  cardDetail: CardDetailModel[] = [];
  organizationCardDetail: CardDetailModel;

  employerPortalBetaTest: boolean = environment.employerPortalBetaTest;
  showEmployerPortal: boolean;
  @Input() isOrganizationPage: boolean = false;

  @Output() selectedPackage: EventEmitter<{
    pack: CardPackage;
    paymentFrequency: BillingFrequency;
  }> = new EventEmitter();
  @Output() creatEmployerPortal: EventEmitter<{
    pack: { businessType: PitchCardType };
    paymentFrequency: BillingFrequency;
  }> = new EventEmitter();

  constructor(
    private cardPackagesService: CardPackageService,
    private userCommonService: UserCommonService,
    private deviceService: DeviceDetectorService,
    private businessService: BusinessService,
    private router: Router,
    private storageService: StorageService,
    private uiService: UiService,
    private commonBindingService: CommonBindingDataService,
    private employerService: EmployerPortalService
  ) {
  }

  ngOnInit(): void {
    this.getActivePrice(BillingFrequency.Annual);
    this.initCardsPackages();
    this.getBillingData();
    this.getUserInfo();
  }

  ngOnDestroy() {
    if (this.$choosePcSub) {
      this.$choosePcSub.unsubscribe();
    }
  }

  getActivePrice(paymentFrequency) {
    this.$choosePcSub.add(
      this.cardPackagesService
        .getActivePricingByBusinessType()
        .subscribe((r) => {
          if (r.data) {
            this.activePrices =
              paymentFrequency === BillingFrequency.Annual
                ? r.data.filter(
                  (p) =>
                    p.paymentFrequency ===
                    BillingFrequency.Annual
                )
                : r.data.filter(
                  (p) =>
                    p.paymentFrequency ===
                    BillingFrequency.Monthly
                );
            if (paymentFrequency === BillingFrequency.Annual) {
              this.activePrices.push(
                r.data.find(
                  (i) =>
                    i.businessType ===
                    this.pitchcardTypes.Job
                )
              );
            }

            this.pricePer =
              paymentFrequency === BillingFrequency.Annual
                ? 'Year'
                : 'Month';

            this.productEP = r.data.find(
              (p: PricingProduct) =>
                p.businessType === AppSettings.EMPLOYER_PORTAL
            );

            this.isResumeCreated = r.data.find(
              (prod: PricingProduct) =>
                prod.businessType === this.pitchcardTypes.Resume
            )
              ? r.data.find(
                (prod: PricingProduct) =>
                  prod.businessType ===
                  this.pitchcardTypes.Resume
              ).isCreateCard
              : true;

            if (this.productEP?.isDiscountAvailable) {
              this.calculatePriceOfEmployerPortal();
            }
            this.allowCreateResume =
              !this.isResumeCreated && !this.isOrganizationPage;
          }
        })
    );
  }

  initCardsPackages() {
    this.cardsPackages = this.cardPackagesService.getMockOfPCs();
    this.descriptionsList =
      this.cardPackagesService.getPackageDescription();
  }

  getBillingData() {
    if (this.isAuthUser) {
      this.$choosePcSub.add(
        this.userCommonService
          .getUserBillingInfo(null)
          .subscribe((r) => {
            if (r.data) {
              this.cardDetail = r.data.creditCard
                ? [r.data.creditCard]
                : [];
            }
          })
      );
      if (this.isOrganizationPage) {
        this.$choosePcSub.add(
          this.employerService
            .getEmployerPortalById()
            .subscribe((res) => {
              if (res.data.length) {
                this.organizationCardDetail = res.data[0]
                  ?.cardDetails.length
                  ? res.data[0].cardDetails[0]
                  : {};
              }
            })
        );
      }
    }
  }

  getUserInfo() {
    const userDetails = JSON.parse(
      this.storageService.getItem(AppSettings.USER_DETAILS)
    );

    if (userDetails) {
      this.$choosePcSub.add(
        this.userCommonService
          .getUserProfile(userDetails.userId)
          .subscribe(
            (result) => {
              if (result && result.data) {
                this.hasUserEmployerPortal =
                  result.data.isEmploymentPortal;
                this.organizationId = result.data
                  .organizationProgress?.length
                  ? result.data.organizationProgress[0].id
                  : null;
                this.setAvailableEmployerPortal(
                  !!result.data.isTesterUser
                );
              }
            },
            (e) => {
              this.uiService.errorMessage(e.Message);
            }
          )
      );
    }
  }

  setAvailableEmployerPortal(isTesterUser: boolean) {
    if (
      (this.employerPortalBetaTest && isTesterUser) ||
      (!this.employerPortalBetaTest && !isTesterUser)
    ) {
      this.showEmployerPortal = true;
    } else if (
      this.employerPortalBetaTest &&
      typeof isTesterUser === 'boolean' &&
      !isTesterUser
    ) {
      this.showEmployerPortal = false;
    }
  }

  getBusinessTypeValue(type: string) {
    return this.cardPackagesService.getBusinessTypeValue(type);
  }

  getRightActivePrice(type: string) {
    if (type) {
      let price: any;
      this.activePrices.map((p) => {
        if (p.businessType === type) {
          price = p;
        }
      });
      return price;
    }
  }

  calculatePriceOfEmployerPortal() {
    if (this.productEP?.price && this.productEP?.referralDiscount) {
      if (this.productEP.price - this.productEP?.referralDiscount <= 0) {
        this.realPriceEP = 'FREE';
      } else {
        this.realPriceEP =
          this.productEP.price - this.productEP?.referralDiscount;
      }
    } else if (this.productEP?.price && !this.productEP?.referralDiscount) {
      this.realPriceEP = this.productEP?.price;
    }
  }

  calculateNextRoute(businessType) {
    if (businessType) {
      this.cardPackagesService
        .getCardPackages()
        .map((pack: CardPackage) => {
          if (pack.type === businessType) {
            this.cardPackagesService.selectPackage(pack);
          }
        });

      this.selectedPCType = businessType;

      if (this.isAnnuallyBilling) {
        this.storageService.setItem(AppSettings.PAYMENT_PLAN, {
          paymentFrequency: BillingFrequency.Annual
        });
      } else {
        this.storageService.setItem(AppSettings.PAYMENT_PLAN, {
          paymentFrequency: BillingFrequency.Monthly
        });
      }

      businessType !== this.pitchcardTypes.Job && !this.isOrganizationPage
        ? this.selectedPackage.emit({
          pack: this.computeSelectedPackage(businessType),
          paymentFrequency: this.computeBillingFrequency()
        })
        : this.handleEmploymentPortalModals();
    }
  }

  computeSelectedPackage(selectedType: string) {
    let selectedPackage;

    this.cardPackagesService.getMockOfPCs().map((pack) => {
      if (pack.businessType === selectedType) {
        selectedPackage = pack;
        this.storageService.removeItem(AppSettings.EMPLOYER_PORTAL);
        this.storageService.removeItem(
          AppSettings.STORE_EXTERNAL_PRODUCT
        );
      }
    });
    return selectedPackage;
  }

  computeBillingFrequency() {
    return this.isAnnuallyBilling
      ? BillingFrequency.Annual
      : BillingFrequency.Monthly;
  }

  navigateToCreationEP(selectedType: PitchCardType) {
    this.creatEmployerPortal.emit({
      pack: {businessType: selectedType},
      paymentFrequency: BillingFrequency.LifeTime
    });
  }

  handleEmploymentPortalModals() {
    if (!this.hasUserEmployerPortal && !this.isOrganizationPage) {
      this.createEmployerPortalModal = true;
    } else {
      if (!this.isDesktop) {
        this.desktopOnlyItem();
        return;
      }
      this.initCreatePCFromEPModal();
    }
  }

  initCreatePCFromEPModal() {
    this.businessProduct = this.activePrices.find(
      (p) => p.businessType === this.selectedPCType
    );
    this.createPCFromEPModal = true;
  }

  createBusinessFromEmployerPortal(options) {
    if (options) {
      const requestObj = {
        businessType: this.selectedPCType,
        paymentPlanDto: this.populatePaymentPlanDto(options),
        organizationId: this.organizationId
      };

      this.$choosePcSub.add(
        this.businessService
          .addMultipleBusiness(requestObj, options.numberOfPitchCards)
          .subscribe(
            (r) => {
              if (r.data?.length) {
                this.handleResponse(requestObj, r.data);
              }
            },
            (e) =>
              this.handleResponse(requestObj, e.data ? e.data : e)
          )
      );
    }
  }

  handleResponse(requestObj, response: any[]) {
    const notPaidItems = [];

    if (response?.length) {
      response.map((item) => {
        if (!item.status && item.code === AppSettings.PAYMENT_FAILED) {
          notPaidItems.push(item);
        }
      });
    } else {
      setTimeout(() => {
        this.uiService.errorMessage(
          this.commonBindingService.getLabel('err_server')
        );
      }, 500);
    }

    if (notPaidItems.length) {
      this.storageService.setItem(
        AppSettings.NOT_PAID_BUSINESSES,
        notPaidItems
      );
    }
    this.employerService.$updateBusinesses.next(this.selectedPCType);

    this.createPCFromEPModal = false;
    this.selectedPackage.emit({
      pack: this.computeSelectedPackage(requestObj.businessType),
      paymentFrequency: requestObj?.paymentPlanDto?.paymentFrequency
    });
  }

  populatePaymentPlanDto(options) {
    let paymentFrequency: BillingFrequency;
    if (
      this.selectedPCType !== PitchCardType.Resume ||
      this.selectedPCType !== PitchCardType.Job
    ) {
      paymentFrequency = this.computeBillingFrequency();
    }
    if (this.selectedPCType === PitchCardType.Resume) {
      paymentFrequency = BillingFrequency.LifeTime;
    }
    if (this.selectedPCType === PitchCardType.Job) {
      paymentFrequency = BillingFrequency.Monthly;
    }
    return {
      paymentFrequency: paymentFrequency,
      discountCode: options?.discountCode ? options.discountCode : null,
      businessCount: options?.numberOfPitchCards
        ? options.numberOfPitchCards
        : null
    };
  }

  goToPage(link, params?) {
    !params
      ? this.router.navigate([link])
      : this.router.navigate([link], {queryParams: params});
  }

  desktopOnlyItem() {
    this.uiService.warningMessage(
      this.commonBindingService.getLabel('label_employer_portal') +
      ' ' +
      this.commonBindingService.getLabel('msg_only_for_desktop')
    );
  }
}
