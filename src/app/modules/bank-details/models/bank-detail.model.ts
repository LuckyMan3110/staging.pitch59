import { BankAccountStatus } from './bank-account-status.enum';

export class BankDetailModel {
  id: String = '0';
  businessId: String;
  accountHolderName: String = '';
  routingNumber: String = '';
  accountHolderType: String = '';
  accountNumber: String = '';
  bankToken: String = '';
  customerId: String = '';
  bankAccountId: String = '';
  bankAccountStatus: BankAccountStatus;
  bankName: String = '';
  country: String = '';
  currency: String = '';
  last4: String = '';
  organizationId: number;
  billingType: number;

  constructor(option?: BankDetailModel) {
    if (option) {
      this.id = option.id;
      this.businessId = option.businessId;
      this.accountHolderName = option.accountHolderName;
      this.routingNumber = option.routingNumber;
      this.accountHolderType = option.accountHolderType;
      this.accountNumber = option.accountNumber;
      this.bankToken = option.bankToken;
      this.customerId = option.customerId;
      this.bankAccountId = option.bankAccountId;
      this.bankAccountStatus = option.bankAccountStatus;
      this.bankName = option.bankName;
      this.country = option.country;
      this.currency = option.currency;
      this.last4 = option.last4;
    }
  }
}
