import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { StorageService } from '../../../shared/services/storage.service';
import {
  UserCommonService,
  VerificationResource
} from '../../../shared/services/user-common.service';
import { UiService } from '../../../shared/services/ui.service';
import { BusinessService } from '../../../business/services/business.service';

import { AppSettings } from '../../../shared/app.settings';

import { UserModel } from '../../../shared/models/user.model';
import { OtpRequestModel } from '../../../shared/models/otp-request.model';
import { CommonBindingDataService } from '../../../shared/services/common-binding-data.service';
import { Subscription } from 'rxjs';
import { CamelcasePipe } from '../../../shared/pipes/camelcase.pipe';

@Component({
    selector: 'app-account-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
    profileForm: FormGroup;
    twoStepVerification: FormGroup;
  userModel = new UserModel();
  $settingsSubscription = new Subscription();
  fullName: string = 'Account Profile';
    emailId: string;
    oldEmailId: String;
    contact: String;
    password: String;
    defaultProfileImage: string = AppSettings.DEFAULT_PROFILE_IMAGE_URL;
    profilePictureThumbnailUrl: string = this.defaultProfileImage;
    profilePictureFileIdTemp: String;
    profilePictureThumbnailIdTemp: String;
    isProfilePicLoaded: boolean = false;
    errorMessage: string;
    errorMessageImage: string;
    disableUpdateImage: boolean = true;
    otpModal: boolean = false;

    isPhoneChanged: boolean = false;
    otpTimer = '00';
    timer;
    isTimerRunning = false;
    isVerifiedPhone = false;
    isVerifiedEmail = false;
    needVerificationPhone = false;
    needVerificationEmail = false;
    defaultResourceType = VerificationResource.Phone;
    otpRequestModel = new OtpRequestModel();
    countSendingOtp = 0;
    maxCountSendingOtp = 2;
    otpCodeErrorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private uiService: UiService,
    private storageService: StorageService,
    private userCommonService: UserCommonService,
    private businessService: BusinessService,
    private router: Router,
    private commonBindingDataService: CommonBindingDataService,
    private toCamelCase: CamelcasePipe
  ) {
  }

    ngOnInit() {
        this.getUserData();
        this.createOtpVerifyForm();
    }

    ngOnDestroy() {
        if (this.$settingsSubscription) {
            this.$settingsSubscription.unsubscribe();
        }
    }

    getUserData() {
      const userDetails = JSON.parse(
        this.storageService.getItem(AppSettings.USER_DETAILS)
      );
      const token = this.storageService.getItemFromCookies(
        AppSettings.TOKEN_KEY
      );

      if (userDetails && token) {
        this.$settingsSubscription.add(
          this.userCommonService
            .getUserProfile(userDetails.userId)
            .subscribe(
              (result) => {
                this.userModel = result.data;
                this.fullName =
                  this.userModel.firstName +
                  ' ' +
                  this.userModel.lastName;
                this.emailId = this.userModel.emailId;
                this.oldEmailId = this.userModel.emailId;
                this.contact = this.userModel.contactNumber;

                if (this.userModel.profilePictureThumbnailUrl) {
                  this.profilePictureThumbnailUrl =
                    this.userModel.profilePictureThumbnailUrl.toString();
                  this.profilePictureFileIdTemp =
                    this.userModel.profilePictureFileId;
                  this.profilePictureThumbnailIdTemp =
                    this.userModel.profilePictureThumbnailId;
                }

                this.profilePicLoad();
                this.profileForm = this.setFormData();
                this.detectPhoneNumberChange();
              },
              (error) => {
                this.uiService.errorMessage(error.Message);
              }
            )
        );
        }
    }

    profilePicLoad() {
        this.isProfilePicLoaded = false;

        if (this.profilePictureThumbnailUrl) {
            setTimeout(() => {
                this.isProfilePicLoaded = true;
            }, 1000);
        }
    }

    setFormData() {
        return this.formBuilder.group({
          firstName: [this.userModel.firstName, [Validators.required]],
          lastName: [this.userModel.lastName, [Validators.required]],
          emailId: [
            this.userModel.emailId,
            [
              Validators.required,
              Validators.pattern(AppSettings.EMAIL_PATTERN)
            ]
          ],
          contactNumber: [this.userModel.contactNumber, Validators.required],
          zipCode: [
            this.userModel.zipCode,
            Validators.pattern(AppSettings.ZIPCODE_PATTERN)
          ],
          profilePictureThumbnailId: [],
          profilePictureFileId: []
        });
    }

    postCoverUpload(response) {
        if (response) {
            this.profilePictureThumbnailUrl = response[0].thumbnailFileUrl;
            this.profilePictureFileIdTemp = response[0].fileId;
            this.profilePictureThumbnailIdTemp = response[0].thumbnailId;
            this.errorMessageImage = '';
            this.profilePicLoad();
            this.disableUpdateImage = false;
            this.updateProfile('image');
        }
    }

    getFormData() {
      const formControl = this.profileForm.controls;
      const userModel: any = {};

        userModel.id = this.userModel.id;
        userModel.firstName = formControl.firstName.value;
        userModel.lastName = formControl.lastName.value;
        userModel.contactNumber = formControl.contactNumber.value;
        userModel.emailId = formControl.emailId.value;
        userModel.zipCode = formControl.zipCode.value;
        userModel.smsOtpCode = this.otpRequestModel.smsOtpCode;

        return userModel;
    }

    getImageFormData() {
      const userImageModel: any = {};

      userImageModel.id = this.userModel.id;
      userImageModel.profilePictureFileId = this.profilePictureFileIdTemp;
      userImageModel.profilePictureThumbnailId =
        this.profilePictureThumbnailIdTemp;

      return userImageModel;
    }

    removeProfileImage() {
        this.profilePictureThumbnailUrl = this.defaultProfileImage;
        this.disableUpdateImage = false;
        this.profilePictureFileIdTemp = '';
        this.profilePictureThumbnailIdTemp = '';
        this.updateProfile('image');
    }

    detectPhoneNumberChange() {
      this.$settingsSubscription.add(
        this.profileForm.get('contactNumber').valueChanges.subscribe(() => {
          this.isPhoneChanged = true;
        })
      );
    }

    updateProfile(toUpdate: string) {
        if (toUpdate === 'image') {
            this.sendRequestToUpdateUserInfo(this.getImageFormData(), toUpdate);
        }
        if (this.profileForm.valid && toUpdate !== 'image') {
            if (this.isPhoneChanged) {
                this.sendOtp({
                    type: 'phone'
                });
            } else {
                this.sendRequestToUpdateUserInfo(this.getFormData(), 'info');
            }
        }
    }

    sendRequestToUpdateUserInfo(userModel, updateType) {
        this.userCommonService.updateUserProfile(userModel).subscribe(
          (result) => {
            const message = `Profile ${
              updateType === 'image' ? 'image' : ''
            } updated successfully`;

            this.fullName =
              result.data.firstName + ' ' + result.data.lastName;
            this.emailId = result.data.emailId;
            this.contact = result.data.contactNumber;

            if (result.data.profilePictureThumbnailUrl) {
              this.profilePictureThumbnailUrl =
                result.data.profilePictureThumbnailUrl;
            }

            setTimeout(() => {
              this.uiService.successMessage(message);
                    this.disableUpdateImage = true;
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
            }, 1000);

            this.userCommonService.updatedUserInfo.next({
              fullName: this.fullName,
              emailId: this.emailId,
              profilePictureThumbnailUrl: this.profilePictureThumbnailUrl
            });

            if (
              userModel.emailId &&
              this.oldEmailId !== userModel.emailId
            ) {
              this.userCommonService.clearSession();
              setTimeout(() => {
                this.router.navigate(['/sign-in']);
              }, 1000);
            }
            this.isPhoneChanged = false;
          },
            (error) => {
                if (error.field) {
                    const control = this.toCamelCase.transform(error.field);
                    this.profileForm.get(control).setErrors(error);
                } else {
                    this.uiService.errorMessage(error.message);
                }
            }
        );
    }

    changePassword() {
        this.businessService.userEmailId = this.emailId;
        this.router.navigate(['/change-password']);
    }

    errorInImageCropperUpload(event) {
        console.log('error');
        this.errorMessageImage = event;
    }

    createOtpVerifyForm() {
      this.twoStepVerification = this.formBuilder.group(
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

    sendOtp(e) {
      if (this.isNotAbleSendCode()) {
        return;
      }
      this.fillOtpRequestModel(e.type);
      this.userCommonService
        .sendOtpForContactNumberChange(this.otpRequestModel)
        .subscribe(
          (result) => {
            this.otpModal = true;
            this.isTimerRunning = true;
            this.countSendingOtp += 1;
            this.defaultResourceType =
              this.setVerificationTypeResource();
            this.uiService.successMessage(result.message);
            e.type == VerificationResource.Email
              ? (this.needVerificationEmail = true)
              : (this.needVerificationPhone = true);
          },
          (err) => {
            switch (err.Code) {
              case 1017:
                this.profileForm
                  .get('contactNumber')
                  .setErrors({notUnique: true});
                break;
              case 1013:
                this.profileForm
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

    isNotAbleSendCode() {
      return !(
        this.profileForm.get('contactNumber').valid &&
        this.profileForm.get('emailId').valid &&
        this.profileForm.get('firstName').valid &&
        this.profileForm.get('lastName').valid
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

    verifyOtp(e) {
      this.otpRequestModel.smsOtpCode = e.otpCode;
      // setTimeout(() => {
      if (e.type === VerificationResource.Email) {
        this.isVerifiedEmail = true;
        this.profileForm.get('emailId').valueChanges.subscribe((x) => {
          this.isVerifiedEmail = false;
        });
        this.sendRequestToUpdateUserInfo(this.getFormData(), 'info');
      } else {
        this.isVerifiedPhone = true;
        this.profileForm
          .get('contactNumber')
          .valueChanges.subscribe((x) => {
          this.isVerifiedPhone = false;
        });
        this.sendRequestToUpdateUserInfo(this.getFormData(), 'info');
      }
      this.otpModal = false;
      this.otpCodeErrorMessage = '';
      // }, 1000);
      // this.twoStepVerification.get('otpCode').patchValue(e && e.otpCode ? e.otpCode : '');
      // if (this.twoStepVerification.get('otpCode').valid) {
      //     this.otpCodeErrorMessage = '';
      //     this.fillOtpRequestModel(e.type);
      //     this.otpRequestModel.smsOtpCode = this.twoStepVerification.value.otpCode;

      //     this.userCommonService.verifyEmailSmsOTP(this.otpRequestModel).subscribe(
      //         (result) => {
      //             this.uiService.successMessage(result.message);
        //             setTimeout(() => {
        //                 if (e.type === VerificationResource.Email) {
        //                     this.isVerifiedEmail = true;
        //                     this.profileForm.get('emailId').valueChanges.subscribe((x) => { this.isVerifiedEmail = false; });
        //                     this.sendRequestToUpdateUserInfo(this.getFormData(), 'info');
        //                 } else {
        //                     this.isVerifiedPhone = true;
        //                     this.profileForm.get('contactNumber').valueChanges.subscribe((x) => { this.isVerifiedPhone = false; });
        //                     this.sendRequestToUpdateUserInfo(this.getFormData(), 'info');
        //                 }
        //                 this.otpModal = false;
        //                 this.otpCodeErrorMessage = '';
        //             }, 1000);
        //         },
        //         (error) => {
        //             this.twoStepVerification.get('otpCode').setErrors({ pattern: true });
        //             this.otpCodeErrorMessage = this.commonBindingDataService.getLabel('label_incorrect_otp');
        //         }
        //     );
        // }
    }

    fillOtpRequestModel(type) {
      this.otpRequestModel.emailId = this.profileForm.value.emailId;
      this.otpRequestModel.contactNumber =
        this.profileForm.value.contactNumber;
      this.otpRequestModel.newUser = '';
      this.otpRequestModel.firstName = this.profileForm.value.firstName;
      this.otpRequestModel.lastName = this.profileForm.value.lastName;
      this.otpRequestModel.type = type;
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
