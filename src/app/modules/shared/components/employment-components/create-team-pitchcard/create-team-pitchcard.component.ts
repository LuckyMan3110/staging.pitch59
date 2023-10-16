import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CardPackageService } from '../../../../cards-packages/services/card-package.service';
import { PricingProduct } from '../../../../new-billing/model/pricing-product';
import { CardDetailModel } from '../../../models/card-detail.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { BusinessService } from '../../../../business/services/business.service';
import { UiService } from '../../../services/ui.service';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { EmployerPortalService } from '../../../../choosen-history/services/employer-portal.service';
import { StorageService } from '../../../services/storage.service';
import { PitchCardType } from '../../../enums/pitch-card-type.enum';
import {
  DiscountType,
  ProductType
} from '../../pricing-menu-components/pricing-menu.service';
import { AppSettings } from '../../../app.settings';
import { BillingFrequency } from '../../../../new-billing/services/new-billing.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-create-team-pitchcard',
  templateUrl: './create-team-pitchcard.component.html',
  styleUrls: ['./create-team-pitchcard.component.scss']
})
export class CreateTeamPitchcardComponent implements OnInit, OnDestroy {
  @Input() selectedPackage: any;
  @Input() product: PricingProduct;
  @Input() organizationCardDetail: CardDetailModel;
  @Output() closeWindow: EventEmitter<boolean> = new EventEmitter();
  @Output() selectedOptions: EventEmitter<any> = new EventEmitter();
  editDiscountMode: boolean = false;
  isAppliedPromoCode: boolean = false;
  isInvalidPromoCodeError: boolean = false;
  isExpiredPromoCodeError: boolean = false;
  wrongPromoCode: boolean = false;
  promoCodeError: any;
  isEPPage: boolean = false;
  invalidDiscountMessage: string = '';
  businessTypeValue: string = '';
  discountTypeValue: string = '';
  paymentFrequencyValue: string = '';
  paymentPlan: any = null;
  DiscountType = DiscountType;
  teamPcForm: FormGroup;
  $teamPitchCardSub = new Subscription();
  counterSubject: Subject<any> = new Subject();

  constructor(
    private router: Router,
    private cardPackagesService: CardPackageService,
    private fb: FormBuilder,
    private businessService: BusinessService,
    private uiService: UiService,
    private titleCase: TitleCasePipe,
    private employerService: EmployerPortalService,
    private storageService: StorageService
  ) {
  }

  ngOnInit(): void {
    this.createForm();
    this.businessTypeValue = this.getBusinessTypeValue(
      this.selectedPackage.businessType
    );
    this.isEPPage = this.router.url.includes('/employer-portal');

    this.counterSubject.pipe(debounceTime(500)).subscribe((target) => {
      this.teamPcForm.get('businessCount').patchValue(target);
      this.calculatePaymentPlan('businessCount');
    });
  }

  ngOnDestroy() {
    this.editDiscountMode = false;
    this.isAppliedPromoCode = false;
    this.paymentPlan = null;
  }

  createForm() {
    this.teamPcForm = this.fb.group({
      businessCount: [2, [Validators.required]],
      discountCode: [
        '',
        [Validators.minLength(4), Validators.maxLength(10)]
      ]
    });
  }

  getBusinessTypeValue(type: string) {
    return this.cardPackagesService.getBusinessTypeValue(type);
  }

  cancelOperation() {
    this.closeWindow.emit(true);
  }

  createBusinessCard() {
    this.selectedOptions.emit({
      numberOfPitchCards: this.teamPcForm.get('businessCount').value,
      businessType: this.product.businessType,
      type:
        this.product.businessType === PitchCardType.Job
          ? ProductType.Portal
          : this.product.type,
      paymentFrequency: this.product.paymentFrequency,
      discountCode: this.teamPcForm.get('discountCode')?.value
        ? this.teamPcForm.get('discountCode')?.value
        : null
    });
  }

  initChangeOnType(e) {
    this.counterSubject.next(e?.value ? e.value : 0);
  }

  calculatePaymentPlan(field) {
    const requestObj = {
      discountCode: this.teamPcForm.get('discountCode').value,
      businessCount: this.teamPcForm.get('businessCount').value,
      businessType: this.product.businessType,
      paymentFrequency: this.product.paymentFrequency,
      type: this.product.type,
      referralEmail: ''
    };
    if (field === 'businessCount') {
      requestObj.discountCode =
        this.isAppliedPromoCode &&
        this.teamPcForm.get('discountCode').value
          ? this.teamPcForm.get('discountCode').value
          : '';
    }
    this.$teamPitchCardSub.add(
      this.businessService
        .calculateBusinessPlan(requestObj, this.product.businessType)
        .subscribe(
          (res) => {
            if (res.data) {
              this.paymentPlan = res.data;
              if (
                (field === 'discountCode' &&
                  this.teamPcForm.get('discountCode')
                    .value) ||
                this.isAppliedPromoCode
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
                this.teamPcForm
                  .get('discountCode')
                  .setErrors(null);
                this.isAppliedPromoCode = true;
                this.wrongPromoCode = false;
              }
            }
          },
          (err) => {
            this.uiService.errorMessage(
              err.message
                ? this.titleCase.transform(err.message)
                : 'Wrong Discount Code'
            );
            this.paymentPlan = null;

            if (field === 'discountCode') {
              this.wrongPromoCode = true;
              this.isAppliedPromoCode = false;
              this.teamPcForm.get('discountCode').setErrors(err);
              this.invalidDiscountMessage = err.message
                ? err.message
                : 'Invalid code.';
              this.handleFailedResponse(requestObj, err);
            }
          }
        )
    );
  }

  handleFailedResponse(requestObj: any, response: any) {
    if (response.code === AppSettings.INVALID_PROMO_CODE) {
      this.isInvalidPromoCodeError =
        response.code === AppSettings.INVALID_PROMO_CODE;
    }
    if (response.code === AppSettings.PROMO_CODE_EXPIRED) {
      this.isExpiredPromoCodeError =
        response.code === AppSettings.PROMO_CODE_EXPIRED;
    }
  }

  clearPromoCode() {
    this.teamPcForm.get('discountCode').patchValue('');
    this.paymentPlan = null;
    this.isAppliedPromoCode = false;
    this.isInvalidPromoCodeError = false;
    this.isExpiredPromoCodeError = false;
    this.invalidDiscountMessage = '';
    this.discountTypeValue = '';
    this.paymentFrequencyValue = '';
  }

  goToEPBilling() {
    if (!this.isEPPage) {
      this.storageService.setItem('Billing', 'billing');
      this.goToPage('/account/employer-portal');
    } else {
      this.employerService.$portalBillingModalHandler.next(true);
      this.cancelOperation();
    }
  }

  goToPage(path, params?) {
    if (!params) {
      this.router.navigateByUrl(path);
    } else {
      this.router.navigate([path], {
        queryParams: params
      });
    }
  }
}
