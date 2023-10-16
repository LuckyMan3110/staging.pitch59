import { NgModule } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterModule,
  RouterStateSnapshot,
  Routes
} from '@angular/router';
import { AuthenticationValidationService } from './modules/shared/services/authentication-validation.service';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { TwoStepVerificationComponent } from './pages/two-step-verification/two-step-verification.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { OneTimePasswordComponent } from './pages/one-time-password/one-time-password.component';
import { SearchResultPageComponent } from './modules/pitch-card-shared/components/search-result-page/search-result-page.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { NewSignInComponent } from './pages/new-sign-in/new-sign-in.component';
import { NewSignUpComponent } from './pages/new-sign-up/new-sign-up.component';
import { NotFoundPageComponent } from './pages/404/404.component';
import { Observable } from 'rxjs';
import { AppComponent } from './app.component';
import { IntroPageComponent } from './pages/intro-page/intro-page.component';
import { LetsGetStartedComponent } from './pages/lets-get-started/lets-get-started.component';

export class CancelNavigationGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return false;
  }
}

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/welcome'
      },
      {
        path: 'two-step-verification',
        pathMatch: 'full',
        component: TwoStepVerificationComponent
      },
      {
        path: 'one-time-password',
        pathMatch: 'full',
        component: OneTimePasswordComponent
      },
      {
        path: 'forgot-password',
        pathMatch: 'full',
        component: ForgotPasswordComponent
      },
      {
        path: 'change-password',
        pathMatch: 'full',
        component: ChangePasswordComponent
      },
      {
        path: 'reset-password',
        pathMatch: 'full',
        component: ResetPasswordComponent
      },
      {
        path: 'welcome',
        pathMatch: 'full',
        component: WelcomePageComponent
      },
      // {
      //   path: 'pricing',
      //   pathMatch: 'full',
      //   component: LetsGetStartedComponent
      // },
      {
        path: 'jobs',
        pathMatch: 'full',
        component: IntroPageComponent
      },
      // {
      //   path: 'business',
      //   pathMatch: 'full',
      //   component: IntroPageComponent
      // },
      {
        path: 'sign-in',
        pathMatch: 'full',
        component: NewSignInComponent
      },
      {
        path: 'sign-up',
        pathMatch: 'full',
        component: NewSignUpComponent
      },
      {
        path: 'search-result',
        pathMatch: 'full',
        component: SearchResultPageComponent
      },
      {
        path: 'search',
        pathMatch: 'full',
        component: SearchResultPageComponent
      },
      {
        path: '404',
        pathMatch: 'full',
        component: NotFoundPageComponent
      },
      {
        path: 'terms-and-conditions',
        pathMatch: 'full',
        loadChildren: () =>
          import(
            './pages/terms-and-conditions/terms-and-conditions.module'
            ).then((m) => m.TermsAndConditionsModule)
      },
      {
        path: 'privacy-policy',
        pathMatch: 'full',
        loadChildren: () =>
          import('./pages/privacy-policy/privacy-policy.module').then(
            (m) => m.PrivacyPolicyModule
          )
      },
      {
        path: 'select-pitchcards',
        canActivate: [AuthenticationValidationService],
        loadChildren: () =>
          import(
            './modules/cards-packages/cards-packages.module'
            ).then((m) => m.CardsPackagesModule)
      },
      {
        path: 'create',
        canActivate: [AuthenticationValidationService],
        loadChildren: () =>
          import(
            './modules/create-pitch-card/create-pitch-card.module'
            ).then((m) => m.CreatePitchCardModule)
      },
      {
        path: 'account',
        children: [
          {
            path: 'pockets',
            loadChildren: () =>
              import(
                './modules/choosen-history/pages/my-pockets/my-pockets.module'
                ).then((m) => m.MyPocketsModule)
          },
          {
            path: 'my-pitchcards',
            loadChildren: () =>
              import(
                './modules/choosen-history/pages/pitch-cards/pitch-cards.module'
                ).then((m) => m.PitchCardsModule)
          },
          {
            path: 'employer-portal',
            loadChildren: () =>
              import(
                './modules/choosen-history/pages/employer-portal/employer-portal.module'
                ).then((m) => m.EmployerPortalModule)
          },
          {
            path: 'commissions',
            loadChildren: () =>
              import(
                './modules/choosen-history/pages/commissions/commissions.module'
                ).then((m) => m.CommissionsModule)
          },
          {
            path: 'billing',
            loadChildren: () =>
              import(
                './modules/choosen-history/pages/billings/billings.module'
                ).then((m) => m.BillingsModule)
          },
          // {
          //   path: 'groups',
          //   loadChildren: () =>
          //     import('./modules/choosen-history/pages/groups/groups.module').then(
          //       (m) => m.GroupsModule
          //     ),
          // },
          {
            path: 'settings',
            loadChildren: () =>
              import(
                './modules/choosen-history/pages/settings/settings.module'
                ).then((m) => m.SettingsModule)
          }
        ]
      },
      // {
      //   path: 'contact-us',
      //   loadChildren: () =>
      //     import('./modules/contact/pages/contact/contact.module').then((m) => m.ContactModule),
      // },
      {
        path: 'cancel-navigation',
        component: NotFoundPageComponent,
        pathMatch: 'full',
        canActivate: [CancelNavigationGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CancelNavigationGuard]
})
export class AppRoutingModule {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.errorHandler = (error: any) => {
      console.error(error);
    };
  }
}
