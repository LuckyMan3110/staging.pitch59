export class ChangePasswordModel {
  id: String = '0';
  oldPassword: String = '';
  password: String = '';
  confirmPassword: String = '';
  emailId: String = '';

  constructor(option?: ChangePasswordModel) {
    if (option) {
      this.id = option.id;
      this.oldPassword = option.oldPassword;
      this.password = option.password;
      this.confirmPassword = option.confirmPassword;
      this.emailId = option.emailId;
    }
  }
}
