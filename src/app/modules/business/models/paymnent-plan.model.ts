import {
  DiscountType,
  ProductType
} from '../../shared/components/pricing-menu-components/pricing-menu.service';

export class PaymentPlanModel {
    amount: number;
    amountDiscountReferer: number;
    amountDiscountCode: number;
    discountCodeValue: number;
    paymentFrequency: number;
    virtualVideo: boolean;
    referralEmail: string;
    discountCode: string;
    nextPaymentDate: string;
    prevPaymentDate: string;
    lastError: string;
    type: ProductType;
    discountType: DiscountType;
    itemName?: string;
    paymentCyclesCount: number;
    amountTotalDiscountTrue: number;
    priceByAppliedDiscount: number;
}
