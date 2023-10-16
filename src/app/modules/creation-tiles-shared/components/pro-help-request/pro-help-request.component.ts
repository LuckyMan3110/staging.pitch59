import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { AppSettings } from '../../../shared/app.settings';

@Component({
  selector: 'app-pro-help-request',
  templateUrl: './pro-help-request.component.html',
  styleUrls: ['../choose-plan/choose-plan.component.scss']
})
export class ProHelpRequestComponent implements OnInit {
  form: FormGroup;
  sent: boolean;

  constructor(
    private userCommonService: UserCommonService,
    private formBuilder: FormBuilder,
    private service: CreatePitchCardService
  ) {
  }

  ngOnInit(): void {
    this.sent = false;
    this.form = this.formBuilder.group({
      contactNumber: [null, Validators.required],
      emailId: [null, [Validators.pattern(AppSettings.EMAIL_PATTERN)]]
    });
  }

  submit() {
    if (!this.form.valid) {
      return;
    }
    const payload = JSON.parse(JSON.stringify(this.form.value));

    if (this.service.businessId && this.service.businessId !== 'null') {
      payload.businessId = this.service.businessId;
    }

    this.userCommonService.getProHelp(payload).subscribe(
      (response) => {
        this.sent = true;
      },
      (err) => {
      }
    );
  }
}
