import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './modules/shared/shared.module';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpErrorHandler } from './modules/shared/services/http-error-handler.service';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { OneTimePasswordComponent } from './pages/one-time-password/one-time-password.component';
import { BusinessService } from './modules/business/services/business.service';
import { CustomerAnalyticsService } from './modules/choosen-history/services/customer-analytics.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { MessageService } from 'primeng/api';
import { NewSignInComponent } from './pages/new-sign-in/new-sign-in.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { NewSignUpComponent } from './pages/new-sign-up/new-sign-up.component';
import { ToastModule } from 'primeng/toast';
import { FileSaverModule } from 'ngx-filesaver';
import { PitchCardSharedModule } from './modules/pitch-card-shared/pitch-card-shared.module';
import { CommonModule } from '@angular/common';
import { PixelModule } from 'ngx-pixel';
import { ApplicantViewerService } from './modules/applicant-viewer/applicant-viewer.service';
import { RestApiService } from './modules/shared/services/rest-api.service';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { WelcomeBannerComponent } from './pages/welcome-page/welcome-banner/welcome-banner.component';
import { IntroPageComponent } from './pages/intro-page/intro-page.component';
import { LetsGetStartedComponent } from './pages/lets-get-started/lets-get-started.component';

@NgModule({
  declarations: [
    AppComponent,
    ForgotPasswordComponent,
    WelcomePageComponent,
    NewSignInComponent,
    NewSignUpComponent,
    ResetPasswordComponent,
    OneTimePasswordComponent,
    WelcomeBannerComponent,
    IntroPageComponent,
    LetsGetStartedComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FileSaverModule,
    SharedModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    PitchCardSharedModule,
    PixelModule.forRoot({enabled: true, pixelId: '928809097716918'}),
    ScullyLibModule
  ],
  providers: [
    HttpErrorHandler,
    MessageService,
    ToastModule,
    BusinessService,
    CustomerAnalyticsService,
    ApplicantViewerService,
    RestApiService
  ]
})
export class AppModule {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.errorHandler = (error: any) => {
      if (error?.message.indexOf('Cannot match any routes.') !== -1) {
        this.router.navigate(['404']);
      }

      console.error(error);
    };
  }
}
