import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AppSettings } from '../../../shared/app.settings';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { ContactDetailModel } from '../../../shared/models/contact-detail.model';
import { Router } from '@angular/router';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;
  clickedReCaptcha = false;
  showSuccessMessage = false;
  errorMessage;
  contactDetailModel = new ContactDetailModel();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userCommonService: UserCommonService,
    private createPitchCardService: CreatePitchCardService
  ) {
  }

  ngOnInit() {
    this.contactForm = this.setFormData();
  }

  get f() {
    return this.contactForm.controls;
  }

  setFormData() {
    return this.formBuilder.group({
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
      message: ['', Validators.required],
      captcha: [null, Validators.required]
    });
  }

  addContactDetailSendEmail() {
    this.submitted = true;
    if (this.contactForm.invalid) {
      return;
    }
    const params = this.getFormData();
    this.userCommonService.contact(params).subscribe(
      (result) => {
        this.contactForm.reset();
        this.submitted = false;
        this.errorMessage = '';
        this.showSuccessMessage = true;

        setTimeout(() => {
          this.router.navigate(['/search']);
        }, 2500);
      },
      (err) => {
        this.errorMessage = err.Message;
      }
    );
  }

  getFormData() {
    const formControl = this.contactForm.controls;

    this.contactDetailModel.firstName = formControl.firstName.value;
    this.contactDetailModel.lastName = formControl.lastName.value;
    this.contactDetailModel.mobileNumber = formControl.contactNumber.value;
    this.contactDetailModel.emailId = formControl.emailId.value;
    this.contactDetailModel.message = formControl.message.value;

    return this.contactDetailModel;
  }

  formatPhoneNumber(str) {
    if (str?.length >= 10) {
      this.contactForm
        .get('contactNumber')
        .patchValue(this.createPitchCardService.formatPhoneNumber(str));
    }
  }

  setActiveSubmit(response: string): void {
    this.contactForm.get('captcha').setValue(true);
  }

  setDisableSubmit(): void {
    this.contactForm.get('captcha').setValue(null);
  }

  isDisableSubmit(): boolean {
    return !this.contactForm.valid;
  }
}
