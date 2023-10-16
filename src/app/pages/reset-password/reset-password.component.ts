import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StorageService } from '../../modules/shared/services/storage.service';
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { ResetPasswordModel } from '../../modules/shared/models/reset-password.model';
import { UiService } from '../../modules/shared/services/ui.service';
import { BusinessService } from '../../modules/business/services/business.service';
import { OtpRequestModel } from '../../modules/shared/models/otp-request.model';
import { CustomValidators } from '../../modules/shared/utility-functions/custom-validators';
import { equalValueValidator } from '../../modules/shared/utility-functions/form.utils';

@Component({
  selector: 'app-reset-password',
  styleUrls: ['./reset-password.component.scss'],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  @Input() profileVerification = false;
  resetPasswordForm: FormGroup;
  contactNumber: String = '';
  emailId: String = '';
  matchError = true;
  submitted = false;
  loading = false;
  otpTimer = '00';
  isTimerRunning = true;
  isOtpEnabled = false;
  showPasswordRequirements = false;
  errorMessage;
  maxLength = 4;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private uiService: UiService,
    private storageService: StorageService,
    private businessService: BusinessService,
    private userCommonService: UserCommonService
  ) {
    this.startTimer();
    this.userCommonService.isOtpEnabled().subscribe((enabled) => {
      this.isOtpEnabled = enabled;
    });
  }

  ngOnInit() {
    this.contactNumber = this.isOtpEnabled
      ? this.userCommonService.userContactNumber
      : this.userCommonService.userEmailId;
    this.resetPasswordForm = this.setFormData();
    this.getEmailIdFromUrl();
  }

  setFormData() {
    const token = this.router.parseUrl(this.router.url)?.queryParams?.token;
    return this.formBuilder.group(
      {
        smsOtpCode: [token || '', [Validators.required]],
        newpassword: [
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
        confirmpassword: [
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
        ]
      },
      {validator: equalValueValidator('newpassword', 'confirmpassword')}
    );
  }

  getEmailIdFromUrl() {
    this.emailId = decodeURIComponent(
      this.router.parseUrl(this.router.url)?.queryParams?.emailId
    );
  }

  getFormData() {
    const password =
      this.resetPasswordForm.controls.newpassword.value.trim();
    const confirmPassword =
      this.resetPasswordForm.controls.confirmpassword.value.trim();
    const smsOtpCode =
      this.resetPasswordForm.controls.smsOtpCode.value.trim();

    const resetPasswordModel = new ResetPasswordModel();
    resetPasswordModel.password = password;
    resetPasswordModel.confirmPassword = confirmPassword;
    resetPasswordModel.emailId =
      (this.businessService.userEmailId as string) ||
      (this.emailId as string);
    resetPasswordModel.smsOtpCode = smsOtpCode;
    return resetPasswordModel;
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  resetPassword() {
    if (!this.resetPasswordForm.invalid) {
      const resetPasswordModel = this.getFormData();
      if (this.matchError) {
        const subscription = this.isOtpEnabled
          ? this.userCommonService.resetPassword(resetPasswordModel)
          : this.userCommonService.resetPasswordEmail(
            resetPasswordModel
          );
        subscription.subscribe(
          (result) => {
            this.uiService.successMessage(result.message);
            this.doSignOut();
            setTimeout(() => {
              this.router.navigate(['/sign-in']);
            }, 1000);
          },
          (error) => {
            this.errorMessage = error.Message;
          }
        );
      }
    }
  }

  resendOTP() {
    if (!this.isTimerRunning) {
      this.errorMessage = null;
      this.isTimerRunning = true;
      const params = new OtpRequestModel();
      params.emailId = this.businessService.userEmailId || this.emailId;
      this.userCommonService.forgotPassword(params).subscribe(
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

  eventHandler(event) {
    if (event.keyCode === 13) {
      this.resetPassword();
    }
  }

  doSignOut() {
    if (this.userCommonService.isAuthenticated()) {
      this.userCommonService.logout().subscribe(
        (results) => {
          this.userCommonService.clearSession();
          this.router.navigate(['/sign-in']);
        },
        (error) => {
          this.userCommonService.clearSession();
        }
      );
    } else {
      this.router.navigate(['/sign-in']);
    }
  }
}
