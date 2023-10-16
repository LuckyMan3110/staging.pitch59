import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input, OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchResultThumbnailComponent } from '../../modules/pitch-card-shared/components/search-result-thumbnail/search-result-thumbnail.component';

import {
  UserCommonService,
  VerificationResource
} from '../../modules/shared/services/user-common.service';
import { StorageService } from '../../modules/shared/services/storage.service';
import { CommonBindingDataService } from '../../modules/shared/services/common-binding-data.service';
import { UiService } from '../../modules/shared/services/ui.service';

import { UserSession } from '../../modules/shared/models/user-session.model';
import { BusinessPitch } from '../../modules/business/models/business-pitch.model';
import { OtpRequestModel } from '../../modules/shared/models/otp-request.model';
import { UserModel } from '../../modules/shared/models/user.model';

import { AppSettings } from '../../modules/shared/app.settings';
import { equalValueValidator } from '../../modules/shared/utility-functions/form.utils';
import { CustomValidators } from '../../modules/shared/utility-functions/custom-validators';
import { environment } from '../../../environments/environment';
import { UserReferralModel } from '../../modules/shared/models/user-referral.model';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { WelcomePageService } from '../welcome-page/welcome-page.service';
import { UniqueComponentId } from 'primeng/utils';
import { PitchCardModalsWrapperService } from '../../modules/pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { PixelService } from 'ngx-pixel';
import { EmployerPortalService } from '../../modules/choosen-history/services/employer-portal.service';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-new-sign-up',
  templateUrl: './new-sign-up.component.html',
  styleUrls: ['./new-sign-up.component.scss']
})
export class NewSignUpComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  @Input() activeLink;

  signUpForm: FormGroup;
  twoStepVerification: FormGroup;
  smsOtpCode: String = '';
  senderEmail;
  submitted = false;
  errorMessage;
  businessDetails: BusinessPitch;
  alias = environment.defaultBusinessShareLinkAlias;
  isBrowser;
  showpassword = true;
  // OTP VERIFICATION
  otpTimer = '00';
  timer;
  isTimerRunning = false;
  otpRequestModel = new OtpRequestModel();
  resendMessage = false;
  isVerifiedPhone = false;
  isVerifiedEmail = false;
  showEmailVerification = false;
  needVerificationPhone = false;
  needVerificationEmail = false;
  scaleFactor = 1;
  showPasswordRequirements = false;
  baseUrl = environment.appBaseUrl;
  otpModal: boolean = false;
  defaultResourceType = VerificationResource.Phone;

  countSendingOtp = 0;
  maxCountSendingOtp = 2;
  otpCodeErrorMessage: string;

  payload;

  teamToken: string;
  uniqueId: string;

  queryEmail;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('pitchCardWrapper', {static: false})
  pitchCardWrapper: ElementRef;
  @ViewChild('businessCard') businessCard: SearchResultThumbnailComponent;
  @ViewChild('videoPlayer', {static: false}) videoPlayer: ElementRef;

  constructor(
    private pixel: PixelService,
    private formBuilder: FormBuilder,
    private userCommonService: UserCommonService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private uiService: UiService,
    private commonBindingDataService: CommonBindingDataService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private teamService: EmployerPortalService,
    private cardPackagesService: CardPackageService,
    private welcomePageService: WelcomePageService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.pixel.track('PageView', {
      content_name: 'Sign Up'
    });
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params: any) => {
          this.queryEmail = params['email'];
          this.teamToken = params['teamToken'];
          if (this.teamToken && this.userCommonService.isAuthenticated()) {
            return this.goToEditTeamBusiness();
          }
        }))
      .subscribe(
        (r) => {
          if (r.data.businessId) {
            this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, r.data.businessId);
            this.cardPackagesService.selectedType = r.data.businessType;
            this.router.navigate(['create'], {queryParams: {businessId: r.data.businessId}});
          }
        },
        (err) => {
          this.uiService.warningMessage(err.message);
        });
    this.uniqueId = UniqueComponentId();
    this.cardInitSetup();
    this.createForm();
    this.twoStepVerification = this.setFormData();
    window.addEventListener('resize', this.onResized);
  }

  createForm() {
    this.signUpForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        contactNumber: [
          null,
          [
            Validators.required,
            Validators.pattern(AppSettings.US_PHONE_PATTERN)
          ]
        ],
        emailId: [
          '',
          [
            Validators.required,
            Validators.pattern(AppSettings.EMAIL_PATTERN)
          ]
        ],
        zipCode: ['', Validators.pattern(AppSettings.ZIPCODE_PATTERN)],
        password: [
          '',
          [
            Validators.required,
            CustomValidators.patternValidator(/\d/, {
              hasNumber: true
            }),
            CustomValidators.patternValidator(/[A-Z]/, {
              hasCapitalCase: true
            }),
            CustomValidators.patternValidator(/[a-z]/, {
              hasSmallCase: true
            }),
            Validators.minLength(8)
          ]
        ],
        repassword: ['', Validators.required],
        refemailId: this.queryEmail
          ? [
            this.queryEmail,
            Validators.pattern(AppSettings.EMAIL_PATTERN)
          ]
          : ['', Validators.pattern(AppSettings.EMAIL_PATTERN)]
      },
      {validator: equalValueValidator('password', 'repassword')}
    );
  }

  getPayload() {
    this.payload = new UserModel();
    this.payload.firstName = this.signUpForm.value.firstName;
    this.payload.lastName = this.signUpForm.value.lastName;
    this.payload.contactNumber = this.signUpForm.value.contactNumber;
    this.payload.emailId = this.signUpForm.value.emailId;
    this.payload.password = this.signUpForm.value.password;
    this.payload.zipCode = this.signUpForm.value.zipCode;
    this.payload.userReferralModel = new UserReferralModel();
    this.payload.userReferralModel.referralEmail =
      this.signUpForm.value.emailId;
    if (this.signUpForm.value.refemailId) {
      this.payload.userReferralModel.senderEmail =
        this.signUpForm.value.refemailId;
      this.senderEmail = this.signUpForm.value.refemailId;
    } else {
      this.senderEmail = '';
    }
    return this.payload;
  }

  goToEditTeamBusiness(): Observable<any> {
    return this.teamService.joinTeamByInvite(this.teamToken);
  }

  setFormData() {
    return this.formBuilder.group(
      {
        otpCode: [
          '',
          [
            Validators.pattern(AppSettings.DIGITCODE_PATTERN),
            Validators.minLength(4)
          ]
        ]
      },
      {validators: this.otpValidator}
    );
  }

  otpValidator(formGroup): any {
    return formGroup.controls['otpCode'].valid;
  }

  cardInitSetup() {
    this.userCommonService.getBusinessPitchModelByAlias(this.alias)
      .pipe(takeUntil(this.destroy$))
      .subscribe((companyCardData) => {
        this.businessDetails = companyCardData.data;
      });
  }

  doSignup(): Observable<any> {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    } else if (
      this.signUpForm.get('repassword').value !==
      this.signUpForm.get('password').value
    ) {
      this.signUpForm.get('repassword').setErrors({
        notEqual: true
      });
      return;
    } else {
      const payload = this.getPayload();
      payload.otpCode = this.twoStepVerification.get('otpCode').value;
      return this.userCommonService.signUp(payload);
    }
  }

  getRightLinkAfterSignUp(businessId) {
    if (businessId) {
      this.storageService.setSession(
        AppSettings.DRAFT_BUSINESS_ID,
        businessId
      );
      return '/billing-page';
    } else {
      if (this.route.snapshot.queryParams.serviceurl) {
        return this.route.snapshot.queryParams.serviceurl;
      } else {
        return 'welcome';
      }
    }
  }

  togglePassword() {
    const password = document.getElementById('password');
    if (password['type'] === 'password') {
      password['type'] = 'text';
      this.showpassword = false;
    } else {
      password['type'] = 'password';
      this.showpassword = true;
    }
  }

  onResized() {
    const initialCardWidth = 360;
    if (this.pitchCardWrapper) {
      if (
        this.pitchCardWrapper.nativeElement.parentElement.clientWidth -
        60 <
        initialCardWidth
      ) {
        this.scaleFactor =
          (this.pitchCardWrapper.nativeElement.parentElement
              .clientWidth -
            60) /
          initialCardWidth;
      } else {
        this.scaleFactor = 1;
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pitchCardWrapper.nativeElement.style.visibility = 'visible';
    }, 1000);
  }

  ngAfterContentChecked() {
    this.onResized();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get f() {
    return this.twoStepVerification.controls;
  }

  fillOtpRequestModel(type) {
    this.otpRequestModel.emailId = this.signUpForm.value.emailId;
    this.otpRequestModel.contactNumber =
      this.signUpForm.value.contactNumber;
    this.otpRequestModel.newUser = AppSettings.NEW_USER;
    this.otpRequestModel.firstName = this.signUpForm.value.firstName;
    this.otpRequestModel.lastName = this.signUpForm.value.lastName;
    this.otpRequestModel.type = type;
  }

  sendOtp(e) {
    if (this.isNotAbleSendCode()) {
      return;
    }
    this.fillOtpRequestModel(e.type);
    this.userCommonService.sendOtpForSignup(this.otpRequestModel)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result) => {
          this.otpTimer = '59';
          this.otpModal = true;
          this.isTimerRunning = true;
          this.countSendingOtp += 1;
          this.defaultResourceType = this.setVerificationTypeResource();
          this.startTimer(e.type);
          this.uiService.successMessage(result.message);
          e.type == VerificationResource.Email
            ? (this.needVerificationEmail = true)
            : (this.needVerificationPhone = true);
        },
        (err) => {
          switch (err.Code) {
            case 1017:
              this.signUpForm.get('contactNumber').setErrors({notUnique: true});
              break;
            case 1013:
              this.signUpForm.get('emailId').setErrors({notUnique: true});
              break;
            default:
              console.log(err);
              break;
          }
        }
      );
  }

  setVerificationTypeResource(): VerificationResource {
    if (this.countSendingOtp < this.maxCountSendingOtp) {
      return this.defaultResourceType;
    }
    if (this.countSendingOtp === this.maxCountSendingOtp) {
      this.countSendingOtp = 0;
      return this.defaultResourceType === VerificationResource.Phone
        ? VerificationResource.Email
        : VerificationResource.Phone;
    }
  }

  isNotAbleSendCode() {
    return !(
      this.signUpForm.get('contactNumber').valid &&
      this.signUpForm.get('emailId').valid &&
      this.signUpForm.get('firstName').valid &&
      this.signUpForm.get('lastName').valid
    );
  }

  verifyOtp(e) {
    this.addFormSubscriptions();

    this.twoStepVerification.get('otpCode').patchValue(e && e.otpCode ? e.otpCode : '');
    if (this.twoStepVerification.get('otpCode').valid) {
      this.otpCodeErrorMessage = '';
      this.otpRequestModel.smsOtpCode =
        this.twoStepVerification.value.otpCode;

      this.userCommonService.verifyEmailSmsOTP(this.otpRequestModel)
        .pipe(takeUntil(this.destroy$),
          switchMap((verifyResult) => {
            this.otpCodeErrorMessage = '';
            this.uiService.successMessage(verifyResult.message);
            this.isVerifiedEmail = true;
            if (e.type === VerificationResource.Email) {
              return this.doSignup().pipe(catchError(error => throwError({signUpError: error})));
            } else {
              return this.doSignup().pipe(catchError(error => throwError({signUpError: error})));
            }
          }),
          switchMap((signUpRes) => {
            if (signUpRes) {
              this.uiService.successMessage(
                this.commonBindingDataService.getLabel('lbl_registration_done_successful')
              );
              const userSession = new UserSession(signUpRes.data);
              userSession.email = this.signUpForm.value.emailId;
              this.storageService.setItem(AppSettings.USER_DETAILS, userSession);
              this.storageService.setItemInCookies(AppSettings.TOKEN_KEY, userSession.token);
              this.userCommonService.hideLinks.next(true);
              this.storageService.setItem(AppSettings.SingUpUserData, '');

              // track sign up completion
              this.pixel.track('CompleteRegistration', {
                content_name: 'Sign up completed'
              });

              if (this.teamToken) {
                return this.goToEditTeamBusiness().pipe(
                  catchError(error => throwError({joinByInviteError: error}))
                );
              } else {
                const routeLink = this.getRightLinkAfterSignUp(signUpRes.data.businessId);
                const link = `/${routeLink}`;
                this.router.navigate([link]);
              }
            }
          }),
          catchError((err) => throwError({mainError: err}))
        )
        .subscribe((teamTokenResult) => {
            if (teamTokenResult) {
              this.welcomePageService.smoothVerticalScrolling(0, 300);
              if (teamTokenResult?.data?.businessId) {
                this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, teamTokenResult.data.businessId);
                this.cardPackagesService.selectedType = teamTokenResult.data.businessType;
                this.router.navigate(['create'], {queryParams: {businessId: teamTokenResult.data.businessId}});
              }
              if (!teamTokenResult?.signUpError) {
                switch (teamTokenResult.signUpError.Code) {
                  case 1017:
                    this.signUpForm.get('contactNumber').setErrors({notUnique: true});
                    break;
                  case 1013:
                    this.signUpForm.get('emailId').setErrors({notUnique: true});
                    break;
                  default:
                    this.errorMessage = teamTokenResult.signUpError.Message;
                    this.uiService.supportMessage();
                    break;
                }
              }
            }
          },
          (error) => {
            const {signUpError, joinByInviteError} = error.mainError;
            if (error?.mainError && !signUpError && !joinByInviteError) {
              this.twoStepVerification.get('otpCode').setErrors({pattern: true});
              this.otpCodeErrorMessage = error.verifyOtpError?.message
                ? error.verifyOtpError.message : this.commonBindingDataService.getLabel('label_incorrect_otp');
            }
            if (signUpError?.Code) {
              switch (signUpError.Code) {
                case 1017:
                  this.signUpForm.get('contactNumber').setErrors({notUnique: true});
                  break;
                case 1013:
                  this.signUpForm.get('emailId').setErrors({notUnique: true});
                  break;
                default:
                  this.uiService.warningMessage(signUpError?.Message ? signUpError.Message : this.commonBindingDataService.getLabel('err_server'));
                  break;
              }
            }
            if (joinByInviteError) {
              this.uiService.warningMessage(error.joinByInviteError.message);
            }
          });
    }
  }

  addFormSubscriptions() {
    this.handleContactFieldChanges('contactNumber').pipe(
      takeUntil(this.destroy$)).subscribe(() => {
      this.isVerifiedPhone = false;
    }, error => this.uiService.warningMessage(error.message));
    this.handleContactFieldChanges('emailId').pipe(
      takeUntil(this.destroy$)).subscribe(() => {
      this.isVerifiedEmail = false;
    }, error => this.uiService.warningMessage(error.message));
  }

  handleContactFieldChanges(field): Observable<any> {
    return this.signUpForm.get(field).valueChanges;
  }

  goToSignIn() {
    this.router.navigate(['/sign-in'], {
      queryParams: {
        serviceurl: this.route.snapshot.queryParams.serviceurl
      }
    });
  }

  startTimer(type) {
    let timerValue = (type = 59);
    this.timer = setInterval(() => {
      if (timerValue) {
        this.otpTimer =
          timerValue < 10 ? '0' + timerValue : '' + timerValue;
        --timerValue;
      } else {
        this.otpTimer = '00';
        this.isTimerRunning = false;
        this.resendMessage = true;
        if (
          type === 'phone' &&
          !(this.isVerifiedEmail || this.isVerifiedPhone)
        ) {
          this.showEmailVerification = true;
          this.uiService.warningMessage(
            'If you didn’t receive the code via text, please click Email Code button to receive it by email.'
          );
        }
        clearInterval(this.timer);
      }
    }, 1000);
  }

  focusPhone() {
    (<HTMLElement>(
      document.getElementById('contactNumber').children[0]
    )).focus();
  }

  handlePitchCardTitleClick(event: any) {
    const {title, businessDetails} = event;

    this.pitchCardModalsWrapperService.setUniqueId(this.uniqueId);
    this.pitchCardModalsWrapperService.setCurrentBusiness(businessDetails);
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  resetModal() {
    this.otpTimer = '00';
    clearInterval(this.timer);
    this.countSendingOtp = 0;
    this.defaultResourceType = VerificationResource.Phone;
    this.otpCodeErrorMessage = '';
    this.twoStepVerification.get('otpCode').patchValue('');
  }

  blockChars(e) {
    e.target.value = e.target.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
  }

  async onPaste(e: KeyboardEvent, control) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode == 86) {
      await navigator.clipboard
        .readText()
        .then((pastedData) => {
          this.signUpForm
            .get(control)
            .patchValue(
              pastedData
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*)\./g, '$1')
            );
        })
        .catch((err) => {
          this.uiService.errorMessage('Something going wrong');
        });
    }
  }
}
