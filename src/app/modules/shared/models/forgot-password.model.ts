export class ForgotPasswordModel {
  id: String = '0';
  emailId: String = '';
  ContactNumber: String = '';

  constructor(option?: ForgotPasswordModel) {
    if (option) {
      this.id = option.id;
      this.emailId = option.emailId;
      this.ContactNumber = option.ContactNumber;
    }
  }
}
