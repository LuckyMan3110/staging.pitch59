import { Injectable } from '@angular/core';
import { PricingProduct } from '../model/pricing-product';
import { PaymentPlanModel } from '../../business/models/paymnent-plan.model';
import { forkJoin, Observable, Subject } from 'rxjs';
import { CardPackageService } from '../../cards-packages/services/card-package.service';
import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { RestApiService } from '../../shared/services/rest-api.service';
import { DiscountType } from '../../shared/components/pricing-menu-components/pricing-menu.service';
import { AppSettings } from '../../shared/app.settings';

export enum BillingMethodType {
  BankAccount = 1,
  CreditCard = 2
}

export enum BillingFrequency {
  None = 0,
  Monthly = 1,
  Annual = 2,
  LifeTime = 3
}

@Injectable()
export class NewBillingService {
  private pricingProducts: PricingProduct[];
  public $paymentPlan: Subject<PaymentPlanModel> =
    new Subject<PaymentPlanModel>();

  draftBusinessId;

  constructor(
    private restApiService: RestApiService,
    private cardPackageService: CardPackageService
  ) {
  }

  getPaidTransactions(businessId, limit?, offset?): Observable<any> {
    return this.restApiService.get(
      'get-paid',
      `transaction/${businessId}/get-paid?limit=${limit}&offset=${offset}`,
      'page-center'
    );
  }

  getOrganizationTransactions(
    organizationId: number | string,
    limit?,
    offset?
  ): Observable<any> {
    return this.restApiService.get(
      'get-organization-payment-plan',
      `transaction/${organizationId}/get-paid-organization?limit=${limit}&offset=${offset}`,
      null
    );
  }

  getOrganizationPaymentPlan(
    organizationId: number | string
  ): Observable<any> {
    return this.restApiService.get(
      'get-organization-payment-plan',
      `organization/${organizationId}/get-payment-plan`,
      null
    );
  }

  downloadPdf(paymentPlanId: number): Observable<any> {
    return this.restApiService.downloadPdfFile(
      'get-referrer-by-email',
      `transaction/${paymentPlanId}/get-receipt`,
      'receipt.pdf',
      null
    );
  }

  saveReceiptForOrganization(
    groupAttempt: string,
    type: string
  ): Observable<any> {
    return this.restApiService.downloadPdfFile(
      'get-referrer-by-email',
      `transaction/get-receipt?groupAttempt=${groupAttempt}&type=${type}`,
      'receipt.pdf',
      null
    );
  }

  getReferrerByEmailId(): Observable<any> {
    return this.restApiService.get(
      'get-referrer-by-email',
      'user-referrals/referred-by',
      null
    );
  }

  updateReferralEmail(email): Observable<any> {
    return this.restApiService.post(
      'update-referrer-email',
      `user-referrals/update?email=${email}`,
      null,
      'page-center'
    );
  }

  retryPayment(businessId): Observable<any> {
    return this.restApiService.post(
      'refresh-pay',
      `transaction/${businessId}/refresh-pay`,
      'page-center'
    );
  }

  populateAchObject(bankDetail): any {
    return {
      accountHolderName: bankDetail.accountHolderName,
      accountHolderType: bankDetail.accountHolderType,
      accountNumber: bankDetail.accountNumber,
      routingNumber: bankDetail.routingNumber
    };
  }

  getBusinessType(): PitchCardType {
    return this.cardPackageService.selectedType;
  }

  getBusinessTypeValue(type) {
    return this.cardPackageService.getBusinessTypeValue(type);
  }

  getCalculateDiscountBadge(plan) {
    const amount = plan.discountType === DiscountType.Dollar ? '$' : '%';
  }

  calculateCreateProductTypeText(type) {
    if (
      type !== PitchCardType.EmployerPortal &&
      type !== AppSettings.UserAdminBusinessType
    ) {
      return 'PitchCard';
    }
    if (type === PitchCardType.EmployerPortal) {
      return 'Employer Portal';
    }
    if (type === AppSettings.UserAdminBusinessType) {
      return 'Administrator';
    }
  }

  set activePricingProducts(arrayProducts) {
    this.pricingProducts = arrayProducts;
  }

  get activePricingProducts() {
    return this.pricingProducts;
  }
}
