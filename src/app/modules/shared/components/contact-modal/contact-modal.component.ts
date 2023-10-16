import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserCommonService } from '../../services/user-common.service';
import { AppSettings } from '../../app.settings';

@Component({
  selector: 'app-contact-modal',
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.scss']
})
export class ContactModalComponent implements OnInit {
  @Output() hideModal = new EventEmitter<string>();
  @Output() submitForm = new EventEmitter<{ data }>();

  contactForm: FormGroup;
  onlyNumbersKeyboard = '[0-9]*';

  constructor(
    private formBuilder: FormBuilder,
    private userCommonService: UserCommonService
  ) {
  }

  ngOnInit(): void {
    this.formInit();
  }

  formInit() {
    const profile = this.userCommonService;
    const isAuthUser = this.userCommonService.isAuthenticated();
    this.contactForm = this.formBuilder.group({
      firstName: [
        isAuthUser ? profile?.userFirstName : null,
        [Validators.required, Validators.min(4)]
      ],
      lastName: [
        isAuthUser ? profile.userLastName : null,
        [Validators.required, Validators.min(4)]
      ],
      mobileNumber: [
        isAuthUser ? profile?.userContactNumber : null,
        [Validators.required]
      ],
      emailId: [
        isAuthUser ? profile?.userEmailId : null,
        [
          Validators.required,
          Validators.pattern(AppSettings.EMAIL_PATTERN)
        ]
      ],
      companyName: [null, [Validators.required, Validators.min(4)]]
    });

    this.contactForm.valueChanges.subscribe((res) => {
      const x = res;
    });
  }

  onCancelButtonClick() {
    this.hideModal.emit();
  }

  onContactButtonClick() {
    const {lastName, firstName, companyName, emailId, mobileNumber} =
      this.contactForm.controls;
    this.submitForm.emit({
      data: {
        lastName: lastName.value,
        firstName: firstName.value,
        companyName: companyName.value,
        emailId: emailId.value,
        mobileNumber: mobileNumber.value
      }
    });
  }
}
