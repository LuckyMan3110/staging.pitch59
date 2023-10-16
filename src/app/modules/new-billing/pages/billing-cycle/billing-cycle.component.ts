import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { BusinessService } from '../../../business/services/business.service';
import { Subject, Subscription } from 'rxjs';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../shared/services/storage.service';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { PricingProduct } from '../../model/pricing-product';
import {
  BillingFrequency,
  NewBillingService
} from '../../services/new-billing.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentPlanModel } from '../../../business/models/paymnent-plan.model';
import { UiService } from '../../../shared/services/ui.service';
import { AppSettings } from '../../../shared/app.settings';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-billing-cycle',
  templateUrl: './billing-cycle.component.html',
  styleUrls: ['./billing-cycle.component.scss']
})
export class BillingCycleComponent implements OnInit, OnDestroy {
  billingFrequencyModel = BillingFrequency;
  paymentFrequencyOptions = [
    {
      label: this.billingFrequencyModel[1],
      value: this.billingFrequencyModel.Monthly
    },
    {
      label: this.billingFrequencyModel[2],
      value: this.billingFrequencyModel.Annual
    }
  ];

  pricingProducts: PricingProduct[];
  monthlyPlan: PricingProduct;
  annuallyPlan: PricingProduct;
  paymentPlan: PaymentPlanModel;

  $billingCycleSubscription = new Subscription();
  emailSubject: Subject<any> = new Subject();
  userHasReferred: boolean = false;
  wrongRefEmail: boolean = false;
  yourOwnEmail: boolean = false;
  isEditableEmail: boolean = true;
  businessType: string;
  approveEmail: string = '';

  isDesktop: boolean = this.deviceService.isDesktop();
  isTablet: boolean = this.deviceService.isTablet();
  isMobile: boolean = this.deviceService.isMobile();

  handleReferralEmail: boolean = false;

  form: FormGroup;

  @ViewChild('referralInput') referralInput: ElementRef;

  constructor(
    private businessService: BusinessService,
    private cardPackageService: CardPackageService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private deviceService: DeviceDetectorService,
    private storageService: StorageService,
    private userCommonService: UserCommonService,
    private newBillingService: NewBillingService,
    private uiService: UiService,
    private commonBindingService: CommonBindingDataService,
    private confirmationService: ConfirmationService
  ) {
  }

  ngOnInit(): void {
    this.getPricingData();
    this.createForm();
    this.referralInfo();
    this.businessType = this.newBillingService.getBusinessType();
  }

  ngOnDestroy() {
    this.$billingCycleSubscription.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      paymentFrequency: [null, Validators.required],
      referralEmail: ['', [Validators.pattern(AppSettings.EMAIL_PATTERN)]]
    });
    this.$billingCycleSubscription.add(
      this.newBillingService.$paymentPlan.subscribe((r) => {
        this.paymentPlan = r;
        if (this.paymentPlan) {
          this.referralEmail.patchValue(
            this.paymentPlan.referralEmail
          );
        }
      })
    );
  }

  referralInfo() {
    this.$billingCycleSubscription.add(
      this.newBillingService.getReferrerByEmailId().subscribe((r) => {
        if (r.data) {
          this.referralEmail.patchValue(
            r.data.emailId ? r.data.emailId : ''
          );
          this.approveEmail = r.data.emailId ? r.data.emailId : '';
          this.isEditableEmail = r.data.isEditableRefferer;
        }
      })
    );
  }

  getPricingData() {
    this.pricingProducts = this.newBillingService.activePricingProducts;
    this.monthlyPlan = this.pricingProducts.find(
      (p) => p.paymentFrequency === BillingFrequency.Monthly
    );
    this.annuallyPlan = this.pricingProducts.find(
      (p) => p.paymentFrequency === BillingFrequency.Annual
    );
  }

  handleReferralModal() {
    this.handleReferralEmail = true;
    if (this.referralInput.nativeElement) {
      this.referralInput.nativeElement.focus();
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

  updateReferralEmail() {
    this.wrongRefEmail = false;
    this.yourOwnEmail = false;
    const userDetail = JSON.parse(
      this.storageService.getItem(AppSettings.USER_DETAILS)
    );
    if (userDetail.email === this.referralEmail.value) {
      this.yourOwnEmail = true;
      return;
    }
    if (this.referralEmail.valid) {
      this.$billingCycleSubscription.add(
        this.newBillingService
          .updateReferralEmail(this.referralEmail.value)
          .subscribe(
            (r) => {
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
            (e) => {
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

  goToPage(path, billingFrequency?: any) {
    if (billingFrequency) {
      this.form
        .get('paymentFrequency')
        .patchValue(billingFrequency.value);
    }

    if (billingFrequency && !this.newBillingService.draftBusinessId) {
      this.storageService.setItem(
        AppSettings.PAYMENT_PLAN,
        this.populatePaymentPlanData()
      );
    }

    if (this.newBillingService.draftBusinessId) {
      this.$billingCycleSubscription.add(
        this.businessService
          .addUpdateBusinessPaymentPlan(
            this.newBillingService.draftBusinessId,
            this.populatePaymentPlanData()
          )
          .subscribe(
            (r) => {
              this.uiService.successMessage(r.message);
              this.navigateTo(path);
            },
            (e) => this.uiService.errorMessage(e.message)
          )
      );
    } else {
      this.navigateTo(path);
    }
  }

  populatePaymentPlanData() {
    return {
      paymentFrequency: this.form.get('paymentFrequency').value,
      referralEmail: this.referralEmail.value
    };
  }

  navigateTo(path) {
    this.router.navigate([path]);
  }

  get referralEmail() {
    return this.form.get('referralEmail');
  }
}
