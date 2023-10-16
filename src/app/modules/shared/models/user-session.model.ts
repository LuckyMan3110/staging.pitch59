export class UserSession {
  userId = '';
  roleId = '';
  role = '';
  userName = '';
  token = '';
  email = '';

  constructor(option?: UserSession) {
    if (option) {
      this.userId = option.userId;
      this.roleId = option.roleId;
      this.role = option.role;
      this.userName = option.userName;
      this.token = option.token;
    }
  }
}
