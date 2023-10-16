import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { StorageService } from './storage.service';
import { AppSettings } from './../app.settings';

@Injectable()
export class AuthenticationValidationService implements CanActivate {
  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.storageService.getItemFromCookies(AppSettings.TOKEN_KEY)) {
      return true;
    }
    if (route.url[0].path === 'select-pitchcrds') {
      this.router.navigate(['/sign-up'], {
        queryParams: {
          serviceurl: `${state.url}`
        }
      });
    }
    if (!!route.queryParams.businessId) {
      this.router.navigate(['/sign-in'], {
        queryParams: {
          serviceurl: `${state.url}`
        }
      });
    } else if (route.queryParams.fromApp === 'true') {
      this.router.navigate(['/sign-in'], {
        queryParams: {
          serviceurl: `${state.url}`
        }
      });
    } else {
      this.router.navigate(['/sign-up'], {
        queryParams: {
          serviceurl: `${state.url}`
        }
      });
    }
    return false;
  }
}
