import { isPlatformBrowser } from '@angular/common';
import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input, OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UniqueComponentId } from 'primeng/utils';
import { environment } from '../../../../../environments/environment';
import { SearchResultThumbnailComponent } from '../../components/search-result-thumbnail/search-result-thumbnail.component';
import { BusinessPitch } from '../../../business/models/business-pitch.model';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import { AppSettings } from '../../../shared/app.settings';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { OtpRequestModel } from '../../../shared/models/otp-request.model';
import { UserReferralModel } from '../../../shared/models/user-referral.model';
import { UserSession } from '../../../shared/models/user-session.model';
import { UserModel } from '../../../shared/models/user.model';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { PitchCardModalsWrapperService } from '../../services/pitchcard-modals-wrapper.service';
import { StorageService } from '../../../shared/services/storage.service';
import { UiService } from '../../../shared/services/ui.service';
import {
  UserCommonService,
  VerificationResource
} from '../../../shared/services/user-common.service';
import { CustomValidators } from '../../../shared/utility-functions/custom-validators';
import { equalValueValidator } from '../../../shared/utility-functions/form.utils';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sign-up-common',
  templateUrl: './sign-up-common.component.html',
  styleUrls: ['./sign-up-common.component.scss']
})
export class SignUpCommonComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  @Output() switchToLogIn: EventEmitter<any> = new EventEmitter();
  @Output() loggingIn: EventEmitter<boolean> = new EventEmitter();
  @Input() redirectTo: string = 'welcome';

  signUpForm: FormGroup;
  twoStepVerification: FormGroup;
  smsOtpCode: String = '';
  signUpModel = new UserModel();
  senderEmail;
  submitted = false;
  hideLinksOnSignin = false;
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

  uniqueId: string;

  queryEmail;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('pitchCardWrapper', {static: false}) pitchCardWrapper: ElementRef;
  @ViewChild('businessCard') businessCard: SearchResultThumbnailComponent;
  @ViewChild('videoPlayer', {static: false}) videoPlayer: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private userCommonService: UserCommonService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private uiService: UiService,
    private commonBindingDataService: CommonBindingDataService,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private cardPackagesService: CardPackageService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.queryEmail = params['email'];
    });
    this.uniqueId = UniqueComponentId();
    this.signUpForm = this.formBuilder.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.pattern(AppSettings.NAME_PATTERN)
          ]
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.pattern(AppSettings.NAME_PATTERN)
          ]
        ],
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
    this.twoStepVerification = this.setFormData();
    window.addEventListener('resize', this.onResized);
  }

  ngAfterViewInit(): void {
    if (this.pitchCardWrapper?.nativeElement) {
      setTimeout(() => {
        this.pitchCardWrapper.nativeElement.style.visibility = 'visible';
      }, 1000);
    }
  }

  ngAfterContentChecked(): void {
    this.onResized();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
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
        return this.redirectTo;
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



  isSignupValid() {
    return this.signUpForm.valid;
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
      .pipe(takeUntil(this.destroy$)).subscribe(
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
            this.signUpForm
              .get('contactNumber')
              .setErrors({notUnique: true});
            break;
          case 1013:
            this.signUpForm
              .get('emailId')
              .setErrors({notUnique: true});
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
      this.fillOtpRequestModel(e.type);
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
          })
        ).subscribe(
        (signUpRes) => {
          this.uiService.successMessage(
            this.commonBindingDataService.getLabel('lbl_registration_done_successful')
          );
          const userSession = new UserSession(signUpRes.data);
          userSession.email = this.signUpForm.value.emailId;
          this.storageService.setItem(AppSettings.USER_DETAILS, userSession);
          this.storageService.setItemInCookies(AppSettings.TOKEN_KEY, userSession.token);
          this.userCommonService.hideLinks.next(true);
          this.storageService.setItem(AppSettings.SingUpUserData, '');
          if (this.userCommonService.pendingMethod && this.redirectTo === 'welcome') {
            this.userCommonService.pendingMethodCaller.next();
            this.userCommonService.pendingMethod = null;
          } else if (this.redirectTo === 'create') {
            this.cardPackagesService.selectedType = PitchCardType.Resume;
            this.router.navigate(['create']);
            this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, null);
          } else {
            this.redirectTo = this.getRightLinkAfterSignUp(signUpRes.data.businessId);
            const link = `/${this.redirectTo}`;
            this.router.navigate([link]);
          }
          this.loggingIn.emit();
          this.otpModal = false;
        },
        (error) => {
          const {signUpError} = error;
          if (error && !signUpError) {
            this.twoStepVerification.get('otpCode').setErrors({pattern: true});
            this.otpCodeErrorMessage = this.commonBindingDataService.getLabel('label_incorrect_otp');
          }

          if (error?.signUpError?.Code) {
            switch (signUpError.Code) {
              case 1017:
                this.signUpForm.get('contactNumber').setErrors({notUnique: true});
                break;
              case 1013:
                this.signUpForm.get('emailId').setErrors({notUnique: true});
                break;
              default:
                this.errorMessage = signUpError.Message;
                this.uiService.warningMessage(signUpError?.Message ? signUpError.Message : this.commonBindingDataService.getLabel('err_server'));
                break;
            }
          }
        }
      );
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
    this.switchToLogIn.emit();
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
}
