import { ReferralStatus } from '../enums/referral-status.enum';

export class UserReferralModel {
  id: String = '0';
  userName: String = '';
  referralEmail: String = '';
  referralPhone: String = '';
  senderEmail: String = '';
  referralId?: number;
  userId?: number;
  spendings?: number;
  commission?: number;
  businessId?: number;
  invitationStatus: ReferralStatus;

  constructor(option?: UserReferralModel) {
    if (option) {
      this.id = option.id;
      this.userName = option.userName;
      this.referralEmail = option.referralEmail;
      this.senderEmail = option.senderEmail;
      this.referralId = option.referralId;
      this.userId = option.userId;
      this.spendings = option.spendings;
      this.commission = option.commission;
      this.invitationStatus = option.invitationStatus;
    }
  }
}
