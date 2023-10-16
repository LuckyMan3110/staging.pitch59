import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { RestApiService } from './rest-api.service';
import { UserRoleEnum } from '../enums/user-role.enum';
import { Router } from '@angular/router';
import { UserModel } from '../models/user.model';
import { AppSettings } from '../app.settings';
import { StorageService } from './storage.service';
import { BankDetailModel } from '../../bank-details/models/bank-detail.model';
import { CardDetailModel } from '../models/card-detail.model';
import { map } from 'rxjs/operators';

export enum VerificationResource {
  None = '',
  Phone = 'phone',
  Email = 'email'
}

export interface OrganizationProgress {
  id: string;
  progress: number;
  isJobExists: boolean;
  businessCount?: number;
}

@Injectable()
export class UserCommonService {
  userId: String = '';
  userEmailId: String = '';
  userContactNumber: String = '';
  userFirstName: String = '';
  userFullName: String = '';
  userLastName: String = '';
  userOrganizationProgress = [];
  updatedUserInfo = new Subject<{
    fullName: string;
    emailId: string;
    profilePictureThumbnailUrl: string;
  }>();
  organizationSubject = new Subject<any>();
  hideLinks = new Subject<boolean>();
  showHeader = new Subject<boolean>();
  hideSignUpPopupIfLoginPopupOpens = new Subject<boolean>();
  showSignInPopup = new Subject<boolean>();
  signupUserData = new UserModel();
  onSearch = new Subject<boolean>();
  businessId: number;
  createOrEditSubject = new Subject<string>();
  isSignIn = new Subject<boolean>();
  isEmploymentPortal: boolean;
  isTesterUser: boolean;
  isResumeCreated: boolean;

  pendingMethod: string = null;
  pendingMethodCaller = new Subject();
  profileHasBeenReceived = new Subject();

  constructor(
    private restApiService: RestApiService,
    private router: Router,
    private storageService: StorageService
  ) {
  }

  signIn(params): Observable<any> {
    return this.restApiService.post(
      'sign-in',
      'account/login',
      params,
      'page-center'
    );
  }

  logout(): Observable<any> {
    return this.restApiService.post(
      'logout',
      'account/logout',
      null,
      'page-center'
    );
  }

  setPassword(data): Observable<any> {
    return this.restApiService.post(
      'password',
      '/users/set-password',
      data,
      'page-center'
    );
  }

  getUserProfile(userId): Observable<any> {
    return this.restApiService
      .get('profile', `users/${userId}/profile`, 'page-center')
      .pipe(
        map((result: any) => {
          this.userId = result.data.id;
          this.userFirstName = result.data.firstName;
          this.userFullName =
            result.data.firstName + ' ' + result.data.lastName;
          this.userLastName = result.data.lastName;
          this.userEmailId = result.data.emailId;
          this.userOrganizationProgress =
            result.data.organizationProgress;
          this.userContactNumber = result.data.contactNumber;
          this.isEmploymentPortal = result.data.isEmploymentPortal;
          this.isTesterUser = result.data.isTesterUser;
          this.isResumeCreated = result.data.isResumeCreated;
          return result;
        })
      );
  }

  updateUserProfile(data): Observable<any> {
    return this.restApiService.put(
      'update-profile',
      `users/update-user-tile`,
      data,
      'page-center'
    );
  }

  forgotPassword(data): Observable<any> {
    return this.restApiService.post(
      'forgotpassword',
      'account/send-otpcode-for-anonymous',
      data,
      'page-center'
    );
  }

  sendOtpForSignup(data): Observable<any> {
    return this.restApiService.post(
      'send-otp-for-signup',
      'account/send-otpcode-for-anonymous',
      data,
      'page-center'
    );
  }

  sendOtpForContactNumberChange(data): Observable<any> {
    return this.restApiService.post(
      'change-contact-number-otp',
      'account/change-contact-number-otp',
      data,
      'page-center'
    );
  }

  signUp(data): Observable<any> {
    return this.restApiService.post(
      'sign-up',
      'account/sign-up?otp_check=true',
      data,
      'page-center'
    );
  }

  verifyEmailSmsOTP(otpRequestData): Observable<any> {
    return this.restApiService.post(
      'verifedemailsmsotp',
      `account/verify-otp`,
      otpRequestData,
      'page-center'
    );
  }

  changePassword(data): Observable<any> {
    return this.restApiService.post(
      'changepassword',
      'account/change-password',
      data,
      'page-center'
    );
  }

  resetPassword(data): Observable<any> {
    return this.restApiService.post(
      'resetpassword',
      'account/reset-password',
      data,
      'page-center'
    );
  }

  resetPasswordEmail(data): Observable<any> {
    return this.restApiService.post(
      'resetpassword-email',
      'account/reset-password-email',
      data,
      'page-center'
    );
  }

  isOtpEnabled(): Observable<any> {
    return this.restApiService.get(
      'otp-enabled',
      'account/otp-enabled',
      null
    );
  }

  sendApplicationDownloadInvite(contactNumber: string): Observable<any> {
    return this.restApiService.post(
      'send-download-invite',
      `account/download-application-invite?mobileNumber=${contactNumber}`,
      null
    );
  }

  getStates(): Observable<any> {
    return this.restApiService.get(
      'get-states',
      'users/get-state-list',
      'page-center'
    );
  }

  getCities(stateId): Observable<any> {
    return this.restApiService.get(
      'get-cities',
      `users/${stateId}/get-city-list`,
      'page-center'
    );
  }

  getCityById(cityId, withState = true): Observable<any> {
    return this.restApiService.get(
      'get-city-by-id',
      `users/${cityId}/get-city?withState=${withState}`,
      'page-center'
    );
  }

  getCityByText(searchText): Observable<any> {
    return this.restApiService.get(
      'get-city-by-id',
      `search/get-city-id-by-name?cityName=${searchText}`
    );
  }

  getBusinessPitchModelByAlias(alias): Observable<any> {
    return this.restApiService.get('alias', `search/alias/${alias}`);
  }

  redirectTo(roleName) {
    let redirectUrl = '';
    switch (roleName) {
      case UserRoleEnum.User:
        redirectUrl = '/user';
        break;
      case UserRoleEnum.Business_Owner:
        redirectUrl = '/business-owner';
        break;
      case UserRoleEnum.Super_Admin:
        redirectUrl = '/admin';
        break;
      default:
        break;
    }
    this.router.navigate([redirectUrl]);
  }

  uploadImageFile(data, height = 500): Observable<any> {
    return this.restApiService.postFiles(
      'upload-image-file',
      `business/upload-files?fileType=0&height=${height}`,
      data,
      'page-center'
    );
  }

  uploadVideoFile(data: FormData, mirror: boolean = false): Observable<any> {
    return this.restApiService.postFiles(
      'upload-image-file',
      `business/upload-files?fileType=1&mirror=${mirror}`,
      data,
      'page-center'
    );
  }

  uploadPdfFile(data: FormData): Observable<any> {
    return this.restApiService.postFiles(
      'upload-image-file',
      `business/upload-files?fileType=2`,
      data,
      'page-center'
    );
  }

  uploadDocFile(data: FormData): Observable<any> {
    return this.restApiService.postFiles(
      'upload-image-file',
      `business/upload-files?fileType=3`,
      data,
      'page-center'
    );
  }

  uploadDocxFile(data: FormData): Observable<any> {
    return this.restApiService.postFiles(
      'upload-image-file',
      `business/upload-files?fileType=4`,
      data,
      'page-center'
    );
  }

  uploadCompanyPhotos(data, height): Observable<any> {
    return this.restApiService.postFiles(
      'upload-image-file',
      `business/upload-files?fileType=0&height=${height}`,
      data,
      'page-center'
    );
  }

  contact(data): Observable<any> {
    return this.restApiService.post(
      'contact-detail',
      'contact-detail/add-contact-details',
      data,
      'page-center'
    );
  }

  contactSales(data): Observable<any> {
    return this.restApiService.post(
      'contact-detail',
      'contact-detail/add-contact-sales',
      data,
      'page-center'
    );
  }

  getProHelp(data): Observable<any> {
    return this.restApiService.post(
      'get-pro-help',
      'contact-detail/get-pro-help',
      data,
      'page-center'
    );
  }

  checkApplicant(jobId: string): Observable<any> {
    return this.restApiService.get(
      'check-applicant',
      `contact-detail/${jobId}/check-applicant`
    );
  }

  addApplicant(jobId: string): Observable<any> {
    return this.restApiService.post(
      'add-applicant',
      `contact-detail/${jobId}/add-applicant`,
      null,
      'page-center'
    );
  }

  isAuthenticated() {
    const userDetails = this.storageService.getItem(
      AppSettings.USER_DETAILS
    );
    const token = this.storageService.getItemFromCookies(
      AppSettings.TOKEN_KEY
    );
    if (userDetails && token) {
      return true;
    } else {
      return false;
    }
  }

  impersonate(token): Observable<any> {
    return this.restApiService.post(
      'impersonate',
      `account/impersonate?token=${token}`,
      null,
      'page-center'
    );
  }

  createOrEdit() {
    let businessId = this.storageService.getSession(
      AppSettings.DRAFT_BUSINESS_ID
    ) as any;
    const draftUserId = JSON.parse(
      this.storageService.getItem(AppSettings.DRAFT_USER_ID)
    ) as any;
    const currentUserId = this.storageService.getUserId();
    if (draftUserId && draftUserId !== currentUserId) {
      businessId = null;
    }

    if (businessId && businessId !== 'null') {
      this.createOrEditSubject.next('Finish');
      return;
    }

    this.createOrEditSubject.next('Create A');
    return;
  }

  getUserBillingInfo(loader, organizationId?): Observable<any> {
    const orgId = organizationId ? `?organizationId=${organizationId}` : '';
    return this.restApiService.get(
      'get-user-billing-info',
      `users/billing${orgId}`,
      loader
    );
  }

  addBankDetailToUser(data: BankDetailModel): Observable<any> {
    return this.restApiService.post(
      'add-ach_to_user',
      'users/bank-account',
      data,
      'page-center'
    );
  }

  updateBankDetailOfUser(
    bankDetailId,
    data: BankDetailModel
  ): Observable<any> {
    return this.restApiService.put(
      'update-ach_to_user',
      `users/${bankDetailId}/bank-account`,
      data,
      'page-center'
    );
  }

  deleteUserACH(id): Observable<any> {
    return this.restApiService.delete(
      'update-ach_to_user',
      `users/${id}/bank-account`,
      'page-center'
    );
  }

  addFullCardToUser(data: CardDetailModel): Observable<any> {
    return this.restApiService.post(
      'add_card_to_user',
      'users/add-card-full',
      data,
      'page-center'
    );
  }

  deleteUserCreditCard(
    businessCreditCardId,
    deleteFullCard?
  ): Observable<any> {
    deleteFullCard =
      typeof deleteFullCard === 'boolean'
        ? `?deleteFullCard=${deleteFullCard}`
        : '';
    return this.restApiService.delete(
      'delete-user-card',
      `users/${businessCreditCardId}/delete-card${deleteFullCard}`,
      'page-center'
    );
  }

  clearSession() {
    this.hideLinks.next(false);
    this.userId = null;
    this.userEmailId = null;
    this.userContactNumber = null;
    this.userFirstName = null;
    this.userFullName = null;
    this.userLastName = null;
    this.updatedUserInfo.next({
      fullName: null,
      emailId: null,
      profilePictureThumbnailUrl: null
    });
    this.userOrganizationProgress = [];
    this.isEmploymentPortal = null;
    this.isTesterUser = null;
    this.isResumeCreated = null;

    this.storageService.removeAll();
    this.storageService.removeAllCookies();
    this.storageService.removeAllSessions();
  }
}
