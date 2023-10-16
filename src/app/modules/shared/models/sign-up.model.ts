export class SignUpModel {
  id: String = '0';
  firstName: String = '';
  lastName: String = '';
  contactNumber: String = '';
  userName: String = '';
  emailId: String = '';
  password: String = '';

  constructor(option?: SignUpModel) {
    if (option) {
      this.id = option.id;
      this.firstName = option.firstName;
      this.lastName = option.lastName;
      this.contactNumber = option.contactNumber;
      this.emailId = option.emailId;
      this.password = option.password;
    }
  }
}
