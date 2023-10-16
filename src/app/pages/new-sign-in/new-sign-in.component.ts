import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Inject,
  PLATFORM_ID,
  AfterContentChecked,
  AfterViewInit,
  ElementRef, OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SearchResultThumbnailComponent } from '../../modules/pitch-card-shared/components/search-result-thumbnail/search-result-thumbnail.component';

import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { StorageService } from '../../modules/shared/services/storage.service';
import { CommonBindingDataService } from '../../modules/shared/services/common-binding-data.service';

import { UserSession } from '../../modules/shared/models/user-session.model';
import { BusinessPitch } from '../../modules/business/models/business-pitch.model';

import { AppSettings } from '../../modules/shared/app.settings';
import { environment } from '../../../environments/environment';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { PitchCardModalsWrapperService } from '../../modules/pitch-card-shared/services/pitchcard-modals-wrapper.service';
import { PixelService } from 'ngx-pixel';
import { EmployerPortalService } from '../../modules/choosen-history/services/employer-portal.service';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-new-sign-in',
  templateUrl: './new-sign-in.component.html',
  styleUrls: ['./new-sign-in.component.scss']
})
export class NewSignInComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  @Input() activeLink;

  @ViewChild('businessCard') businessCard: SearchResultThumbnailComponent;

  signInForm: FormGroup;
  submitted = false;
  isRedirectedFromCardsPackages: boolean = false;
  errorMessage;
  loading = false;
  businessDetails: BusinessPitch;
  alias = environment.defaultBusinessShareLinkAlias;
  isBrowser;
  showpassword = true;
  scaleFactor = 1;
  teamToken: number | string;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('pitchCardWrapper', {static: false}) pitchCardWrapper: ElementRef;

  constructor(
    private pixel: PixelService,
    private formBuilder: FormBuilder,
    private userCommonService: UserCommonService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private commonBindingDataService: CommonBindingDataService,
    private activateRoute: ActivatedRoute,
    private pitchCardModalsWrapperService: PitchCardModalsWrapperService,
    private cardPackagesService: CardPackageService,
    private teamService: EmployerPortalService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.pixel.track('PageView', {
      content_name: 'Sign In'
    });
    this.isBrowser = isPlatformBrowser(platformId);
    this.activateRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params.token) {
        this.doImpersonate(params.token);
      }
    });
  }

  ngOnInit(): void {
    this.cardInitSetup();
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
    window.addEventListener('resize', this.onResized);
    this.isRedirectedFromCardsPackages =
      !!this.route.snapshot.queryParams.serviceurl;
  }

  ngAfterContentChecked(): void {
    this.onResized();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  cardInitSetup() {
    this.userCommonService.getBusinessPitchModelByAlias(this.alias).pipe(takeUntil(this.destroy$))
      .subscribe((companyCardData) => {
        this.businessDetails = companyCardData.data;
      });
  }

  doImpersonate(token) {
    this.userCommonService.impersonate(token).pipe(takeUntil(this.destroy$)).subscribe(
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
        if (!this.redirectToPrevPage()) {
          if (this.route.snapshot.queryParams.serviceurl) {
            this.router.navigateByUrl(
              this.route.snapshot.queryParams.serviceurl
            );
          } else {
            this.userCommonService.showSignInPopup.next(false);
            this.userCommonService.hideSignUpPopupIfLoginPopupOpens.next(
              false
            );
            this.router.navigate(['/welcome']);

            window.scrollTo(0, 0);
          }
        }
      },
      (err) => {
        this.errorMessage = err.Message;
      }
    );
  }

  doSignin() {
    this.submitted = true;
    if (this.signInForm.invalid) {
      return;
    } else {
      this.userCommonService.signIn(this.signInForm.value)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((signInResult) => {
            const userSession = new UserSession(signInResult.data);
            userSession.email = this.signInForm.value.emailId;
            this.storageService.setItem(AppSettings.USER_DETAILS, userSession);
            this.storageService.setItemInCookies(AppSettings.TOKEN_KEY, userSession.token);
            this.userCommonService.hideLinks.next(true);
            return this.userCommonService.profileHasBeenReceived;
          })
        ).subscribe(
        (result) => {
          if (!this.redirectToPrevPage()) {
            if (this.route.snapshot.queryParams.serviceurl) {
              if (this.route.snapshot.queryParams.serviceurl === 'create') {
                this.router.navigateByUrl(!this.userCommonService.isResumeCreated
                  ? this.route.snapshot.queryParams.serviceurl
                  : this.router.navigate(['welcome']));
              } else {
                this.router.navigateByUrl(this.route.snapshot.queryParams.serviceurl);
              }
            } else {
              this.userCommonService.showSignInPopup.next(false);
              this.userCommonService.hideSignUpPopupIfLoginPopupOpens.next(false);
              this.checkTeamToken();
              window.scrollTo(0, 0);
            }
          }
        },
        (err) => {
          this.errorMessage = err.Message;
        }
      );
    }
  }

  checkTeamToken() {
    if (this.teamToken) {
      this.teamService.joinTeamByInvite(+this.teamToken).pipe(takeUntil(this.destroy$)).subscribe((r) => {
        if (r.data.businessId) {
          this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, r.data.businessId);
          this.cardPackagesService.selectedType = r.data.businessType;
          this.router.navigate(['/create/business?businessId=' + r.data.businessId]);
        }
      });
    } else {
      this.router.navigate(['/welcome']);
    }
  }

  redirectToPrevPage() {
    let returnUrl: string = this.route.snapshot.queryParams.returnUrl;
    if (returnUrl && returnUrl.includes(AppSettings.ContactHistoryUrl)) {
      returnUrl = returnUrl.split('?')[0];
      this.router.navigate([decodeURIComponent(returnUrl)]);
      return true;
    }
    return false;
  }

  openSignUp() {
    this.router.navigate(['/sign-up'], {
      queryParams: {
        serviceurl: this.route.snapshot.queryParams.serviceurl
      }
    });
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

  handlePitchCardTitleClick(event: any) {
    const {title, businessDetails} = event;

    this.pitchCardModalsWrapperService.setCurrentBusiness(businessDetails);
    this.pitchCardModalsWrapperService.onTitleClick(title);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pitchCardWrapper.nativeElement.style.visibility = 'visible';
    }, 1000);
  }
}
