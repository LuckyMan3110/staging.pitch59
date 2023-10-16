export class TransactionModel {
  id: number;
  amount: number;
  amountDiscountReferer: number;
  amountDiscountCode: number;
  amountWoDiscount: number;
  discountCode: string;
  referralEmail: string;
  paymentFrequency: number;
  virtualVideo: boolean;
  prevPaymentDate: string;
  nextPaymentDate: string;
  lastError: string;
}
