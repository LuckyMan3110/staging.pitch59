import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TermsAndConditionsRoutingModule } from './terms-and-conditions-routing.module';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';
import { SharedModule } from '../../modules/shared/shared.module';

@NgModule({
  declarations: [TermsAndConditionsComponent],
  imports: [CommonModule, TermsAndConditionsRoutingModule, SharedModule]
})
export class TermsAndConditionsModule {
  constructor(private router: Router) {
    this.router.errorHandler = (error: any) => {
      console.error(error);
    };
  }
}
