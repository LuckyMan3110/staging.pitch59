export class OtpRequestModel {
  firstName: String = '';
  lastName: String = '';
  emailId: String = '';
  contactNumber: String = '';
  smsOtpCode: number;
  newUser: String = '';
  type: 'email' | 'phone';

  constructor(option?: OtpRequestModel) {
    if (option) {
      this.firstName = option.firstName;
      this.lastName = option.lastName;
      this.type = option.type;
      this.emailId = option.emailId;
      this.contactNumber = option.contactNumber;
      this.smsOtpCode = option.smsOtpCode;
      this.newUser = option.newUser;
    }
  }
}
