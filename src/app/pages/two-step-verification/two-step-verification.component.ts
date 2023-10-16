import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from '../../modules/shared/app.settings';
import { StorageService } from '../../modules/shared/services/storage.service';
import { UserCommonService } from './../../modules/shared/services/user-common.service';
import { UiService } from '../../modules/shared/services/ui.service';
import { CommonBindingDataService } from '../../modules/shared/services/common-binding-data.service';
import { UserSession } from '../../modules/shared/models/user-session.model';
import { UserModel } from '../../modules/shared/models/user.model';
import { OtpRequestModel } from '../../modules/shared/models/otp-request.model';
import { BusinessService } from '../../modules/business/services/business.service';

@Component({
  selector: 'app-two-step-verification',
  templateUrl: './two-step-verification.component.html'
})
export class TwoStepVerificationComponent implements OnInit {
  @Input() profileVerification = false;
  twoStepVerification: FormGroup;
  smsOtpCode: String = '';
  signup: String = '';
  contactNumber: String = '';
  email: String = '';
  errorMessage;
  submitted = false;
  loading = false;
  userModel = new UserModel();
  otpRequestModel = new OtpRequestModel();
  otpTimer = '00';
  isTimerRunning = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private userCommonService: UserCommonService,
    private businessService: BusinessService,
    private uiService: UiService,
    private commonBindingService: CommonBindingDataService
  ) {
    this.startTimer();
  }

  ngOnInit() {
    this.twoStepVerification = this.setFormData();
    this.contactNumber = this.userCommonService.userContactNumber;
    this.signup = this.activatedRoute.snapshot.queryParams.signup;
  }

  setFormData() {
    return this.formBuilder.group({
      smsOtpCode: [
        '',
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGITCODE_PATTERN)
        ]
      ]
    });
  }

  get f() {
    return this.twoStepVerification.controls;
  }

  verifyOtp() {
    this.submitted = true;
    if (this.twoStepVerification.invalid) {
      return;
    } else {
      const formControls = this.twoStepVerification.controls;

      if (this.signup) {
        // this.userModel = this.userCommonService.signupUserData;
        this.userModel = JSON.parse(
          this.storageService.getItem(AppSettings.SingUpUserData)
        );
        this.userModel.otpCode = formControls.smsOtpCode.value;
        this.userCommonService.signUp(this.userModel).subscribe(
          (result) => {
            this.uiService.successMessage(
              this.commonBindingService.getLabel(
                'lbl_registration_done_successful'
              )
            );

            const userSession = new UserSession(result.data);
            userSession.email = this.userModel.emailId;
            this.storageService.setItem(
              AppSettings.USER_DETAILS,
              userSession
            );
            this.storageService.setItemInCookies(
              AppSettings.TOKEN_KEY,
              userSession.token
            );
            this.userCommonService.hideLinks.next(true);
            this.storageService.setItem(
              AppSettings.SingUpUserData,
              ''
            );
            this.router.navigate(['/search']);
          },
          (error) => {
            this.errorMessage = error.Message;
          }
        );
      } else {
        this.otpRequestModel.contactNumber = this.contactNumber;
        this.otpRequestModel.smsOtpCode = formControls.smsOtpCode.value;
        this.userCommonService
          .verifyEmailSmsOTP(this.otpRequestModel)
          .subscribe(
            (result) => {
              this.uiService.successMessage(result.message);
              setTimeout(() => {
                this.router.navigate(['/change-password']);
              }, 1000);
            },
            (error) => {
              this.errorMessage = error.Message;
            }
          );
      }
    }
  }

  eventHandler(event) {
    if (event.keyCode === 13) {
      this.verifyOtp();
    }
  }

  resendOTP() {
    if (!this.isTimerRunning) {
      this.isTimerRunning = true;
      const params = new OtpRequestModel();
      if (this.signup) {
        params.emailId = this.userCommonService.signupUserData.emailId;
        params.contactNumber =
          this.userCommonService.signupUserData.contactNumber;
        params.newUser = 'new user';
        params.type = 'phone';
      } else {
        params.emailId = this.businessService.userEmailId;
      }
      this.userCommonService.sendOtpForSignup(params).subscribe(
        (result) => {
          this.startTimer();
        },
        (error) => {
          this.isTimerRunning = false;
        }
      );
    }
  }

  startTimer() {
    let timerValue = 30;
    const otpTimer = setInterval(() => {
      if (timerValue) {
        this.otpTimer =
          timerValue < 10 ? '0' + timerValue : '' + timerValue;
        --timerValue;
      } else {
        this.otpTimer = '00';
        this.isTimerRunning = false;
        clearInterval(otpTimer);
      }
    }, 1000);
  }
}
