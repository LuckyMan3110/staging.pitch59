import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SharedModule } from '../../modules/shared/shared.module';
import { PrivacyPolicyRoutingModule } from './privacy-policy-routing.module';
import { PrivacyPolicyComponent } from './privacy-policy.component';

@NgModule({
  declarations: [PrivacyPolicyComponent],
  imports: [CommonModule, PrivacyPolicyRoutingModule, SharedModule]
})
export class PrivacyPolicyModule {
  constructor(private router: Router) {
    this.router.errorHandler = (error: any) => {
      console.error(error);
    };
  }
}
