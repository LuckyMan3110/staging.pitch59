import { UserReferralModel } from './user-referral.model';

export class UserModel {
  id: String = '0';
  firstName: String = '';
  lastName: String = '';
  contactNumber: String = '';
  emailId = '';
  profilePictureThumbnailId: String = '';
  profilePictureThumbnailUrl: String = '';
  profilePictureFileId: String = '';
  password: String = '';
  otpCode: number;
  userReferralModel: UserReferralModel;
  zipCode = '';
  role: number;
  smsOtpCode: number;
  isTesterUser: boolean;

  constructor(option?: UserModel) {
    if (option) {
      this.id = option.id;
      this.firstName = option.firstName;
      this.lastName = option.lastName;
      this.contactNumber = option.contactNumber;
      this.emailId = option.emailId;
      this.profilePictureThumbnailId = option.profilePictureThumbnailId;
      this.profilePictureFileId = option.profilePictureFileId;
      this.password = option.password;
      this.profilePictureThumbnailUrl = option.profilePictureThumbnailUrl;
      this.otpCode = option.otpCode;
      this.userReferralModel = option.userReferralModel;
      this.zipCode = option.zipCode;
    }
  }
}
