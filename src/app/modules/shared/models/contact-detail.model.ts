export class ContactDetailModel {
  id: String = '0';
  firstName: String = '';
  lastName: String = '';
  mobileNumber: String = '';
  emailId: String = '';
  message: String = '';

  constructor(option?: ContactDetailModel) {
    if (option) {
      this.id = option.id;
      this.firstName = option.firstName;
      this.lastName = option.lastName;
      this.mobileNumber = option.mobileNumber;
      this.emailId = option.emailId;
      this.message = option.message;
    }
  }
}
