import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AppSettings } from '../../modules/shared/app.settings';
import { environment } from '../../../environments/environment';

import { StorageService } from '../../modules/shared/services/storage.service';
import { UserCommonService } from './../../modules/shared/services/user-common.service';
import { BusinessService } from '../../modules/business/services/business.service';
import { CommonBindingDataService } from '../../modules/shared/services/common-binding-data.service';

import { ChangePasswordModel } from '../../modules/shared/models/change-password.model';
import { UiService } from '../../modules/shared/services/ui.service';
import { BusinessPitch } from '../../modules/business/models/business-pitch.model';
import { CustomValidators } from '../../modules/shared/utility-functions/custom-validators';
import { equalValueValidator } from '../../modules/shared/utility-functions/form.utils';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @Input() profileVerification = false;
  changePasswordForm: FormGroup;
  matchError = true;
  submitted = false;
  loading = false;
  errorMessage;
  businessDetails: BusinessPitch;
  alias = environment.defaultBusinessShareLinkAlias;
  scaleFactor = 1;

  @ViewChild('pitchCardWrapper', {static: false})
  pitchCardWrapper: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private uiService: UiService,
    private storageService: StorageService,
    private businessService: BusinessService,
    private userCommonService: UserCommonService,
    private commonBindingService: CommonBindingDataService
  ) {
  }

  ngOnInit() {
    this.cardInitSetup();
    this.changePasswordForm = this.setFormData();

    window.addEventListener('resize', this.onResized);
  }

  ngAfterContentChecked() {
    this.onResized();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pitchCardWrapper.nativeElement.style.visibility = 'visible';
    }, 1000);
  }

  onResized() {
    const initialCardWidth = 360;

    if (this.pitchCardWrapper) {
      if (
        this.pitchCardWrapper.nativeElement.parentElement.clientWidth -
        75 <
        initialCardWidth
      ) {
        this.scaleFactor =
          (this.pitchCardWrapper.nativeElement.parentElement
              .clientWidth -
            75) /
          initialCardWidth;
      } else {
        this.scaleFactor = 1;
      }
    }
  }

  cardInitSetup() {
    this.userCommonService
      .getBusinessPitchModelByAlias(this.alias)
      .subscribe((companyCardData) => {
        this.businessDetails = companyCardData.data;
      });
  }

  setFormData() {
    return this.formBuilder.group(
      {
        oldpassword: [
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
      {validator: equalValueValidator('password', 'confirmpassword')}
    );
  }

  getFormData() {
    const oldPassword =
      this.changePasswordForm.controls.oldpassword.value.trim();
    const password = this.changePasswordForm.controls.password.value.trim();
    const confirmPassword =
      this.changePasswordForm.controls.confirmpassword.value.trim();

    const changePasswordModel = new ChangePasswordModel();
    changePasswordModel.oldPassword = oldPassword;
    changePasswordModel.password = password;
    changePasswordModel.confirmPassword = confirmPassword;
    changePasswordModel.emailId = this.businessService.userEmailId;

    return changePasswordModel;
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  changePassword() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    } else {
      const changePasswordModel = this.getFormData();

      if (this.matchError) {
        this.userCommonService
          .changePassword(changePasswordModel)
          .subscribe(
            (result) => {
              this.uiService.successMessage(result.message);
              this.doSignOut();
              setTimeout(() => {
                this.router.navigate(['/sign-in']);
              }, 1000);
            },
            (error) => {
              if (error.Field === 'Current Password') {
                this.errorMessage = 'Invalid Current Password';
              } else {
                this.errorMessage = error.Message;
              }
            }
          );
      }
    }
  }

  eventHandler(event) {
    if (event.keyCode === 13) {
      this.changePassword();
    }
  }

  doSignOut() {
    this.userCommonService.logout().subscribe(
      (results) => {
        this.userCommonService.isSignIn.next(false);
        this.userCommonService.clearSession();
        this.router.navigate(['/sign-in']);
      },
      (error) => {
        this.userCommonService.clearSession();
      }
    );
  }
}
