import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from '../../modules/shared/app.settings';
import { UserCommonService } from './../../modules/shared/services/user-common.service';
import { ForgotPasswordModel } from '../../modules/shared/models/forgot-password.model';
import { BusinessService } from '../../modules/business/services/business.service';
import { BusinessPitch } from '../../modules/business/models/business-pitch.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage;
  scaleFactor = 1;
  isBrowser;
  businessDetails: BusinessPitch;
  alias = environment.defaultBusinessShareLinkAlias;

  @ViewChild('pitchCardWrapper', {static: false})
  pitchCardWrapper: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userCommonService: UserCommonService,
    private businessService: BusinessService
  ) {
  }

  ngOnInit() {
    this.cardInitSetup();
    this.forgotPasswordForm = this.formBuilder.group({
      userName: [
        '',
        [
          Validators.required,
          Validators.pattern(AppSettings.EMAIL_PATTERN)
        ]
      ]
    });
    window.addEventListener('resize', this.onResized);
  }

  ngAfterContentChecked() {
    this.onResized();
  }

  cardInitSetup() {
    this.userCommonService
      .getBusinessPitchModelByAlias(this.alias)
      .subscribe((companyCardData) => {
        this.businessDetails = companyCardData.data;
      });
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pitchCardWrapper.nativeElement.style.visibility = 'visible';
    }, 1000);
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  gotoOTP() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    } else {
      const forgotPasswordModel = new ForgotPasswordModel();
      forgotPasswordModel.emailId =
        this.forgotPasswordForm.controls.userName.value.trim();
      if (forgotPasswordModel.emailId) {
        this.businessService.userEmailId = forgotPasswordModel.emailId;
        this.userCommonService
          .forgotPassword(forgotPasswordModel)
          .subscribe(
            (result) => {
              this.userCommonService.userContactNumber =
                result.data;
              this.userCommonService.userEmailId =
                forgotPasswordModel.emailId;
              this.router.navigate(['/reset-password']);
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
      this.gotoOTP();
    }
  }
}
