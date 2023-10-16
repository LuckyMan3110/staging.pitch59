import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from '../../modules/shared/app.settings';
import { StorageService } from '../../modules/shared/services/storage.service';

@Component({
  selector: 'app-one-time-password',
  templateUrl: './one-time-password.component.html'
})
export class OneTimePasswordComponent implements OnInit {
  oneTimePasswordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private storageService: StorageService
  ) {
  }

  ngOnInit() {
    this.oneTimePasswordForm = this.formBuilder.group({
      digitCode: [
        '',
        [
          Validators.required,
          Validators.pattern(AppSettings.DIGITCODE_PATTERN)
        ]
      ]
    });
  }

  verifyPassword() {
    if (this.oneTimePasswordForm.valid) {
      this.router.navigate(['/change-password']);
    }
  }
}
