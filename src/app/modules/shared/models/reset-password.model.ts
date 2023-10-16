export class ResetPasswordModel {
  id: String = '0';
  password: String = '';
  confirmPassword: String = '';
  emailId: String = '';
  smsOtpCode: String = '';

  constructor(option?: ResetPasswordModel) {
    if (option) {
      this.id = option.id;
      this.password = option.password;
      this.confirmPassword = option.confirmPassword;
      this.emailId = option.emailId;
      this.smsOtpCode = option.smsOtpCode;
    }
  }
}
