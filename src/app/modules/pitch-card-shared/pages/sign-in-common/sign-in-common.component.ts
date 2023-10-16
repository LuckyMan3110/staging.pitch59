import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { AppSettings } from '../../../shared/app.settings';
import { UserSession } from '../../../shared/models/user-session.model';

@Component({
  selector: 'app-sign-in-common',
  styleUrls: ['./sign-in-common.component.scss'],
  templateUrl: './sign-in-common.component.html'
})
export class SignInCommonComponent implements OnInit, OnChanges {
  @Output() loggingIn: EventEmitter<boolean> = new EventEmitter();
  @Output() switchToSignUp: EventEmitter<any> = new EventEmitter();
  showpassword = true;
  submitted = false;
  loading = false;
  errorMessage;
  signInForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private userCommonService: UserCommonService
  ) {
  }

  ngOnInit() {
    this.signInForm = this.formBuilder.group({
      emailId: [
        '',
        [
          Validators.required,
          Validators.pattern(AppSettings.EMAIL_PATTERN)
        ]
      ],
      password: ['', Validators.required]
    });
  }

  ngOnChanges() {
  }

  get f() {
    return this.signInForm.controls;
  }

  doSignIn() {
    this.submitted = true;
    if (this.signInForm.invalid) {
      return;
    } else {
      this.userCommonService.signIn(this.signInForm.value).subscribe(
        (res) => {
          const userSession = new UserSession(res.data);
          userSession.email = this.signInForm.value.emailId;
          this.storageService.setItem(
            AppSettings.USER_DETAILS,
            userSession
          );
          this.storageService.setItemInCookies(
            AppSettings.TOKEN_KEY,
            userSession.token
          );
          this.userCommonService.hideLinks.next(true);
          if (this.userCommonService.pendingMethod) {
            this.userCommonService.pendingMethodCaller.next();
            this.userCommonService.pendingMethod = null;
          } else if (!this.redirectToPrevPage()) {
            if (this.route.snapshot.queryParams.serviceurl) {
              this.router.navigateByUrl(
                this.route.snapshot.queryParams.serviceurl
              );
            } else {
              this.userCommonService.showSignInPopup.next(false);
              this.userCommonService.hideSignUpPopupIfLoginPopupOpens.next(
                false
              );
              this.router.navigate(['/search'], {
                queryParams: {
                  types: this.route.snapshot.queryParams.types
                }
              });
              window.scrollTo(0, 0);
            }
          }
          this.loggingIn.emit();
        },
        (err) => {
          this.errorMessage = err.Message;
        }
      );
    }
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
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

  eventHandler(event) {
    if (event.keyCode === 13) {
      this.doSignIn();
    }
  }

  redirectOrOpenSignUpPopup() {
    this.switchToSignUp.emit();
  }

  redirectToPrevPage() {
    // for contact history page
    /// if user hit link from email
    // then persist url in login url
    // then after log in redirect to persisted url
    let returnUrl: string = this.route.snapshot.queryParams.returnUrl;
    if (returnUrl && returnUrl.includes(AppSettings.ContactHistoryUrl)) {
      // remove query param
      returnUrl = returnUrl.split('?')[0];
      this.router.navigate([decodeURIComponent(returnUrl)]);
      return true;
    }

    return false;
  }
}
