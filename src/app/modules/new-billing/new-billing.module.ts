import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { BillingCycleComponent } from './pages/billing-cycle/billing-cycle.component';
import { VirtualVideoComponent } from './pages/virtual-video/virtual-video.component';
import { BillingPageComponent } from './billing-page.component';
import { BillingSummaryComponent } from './pages/billing-info/billing-summary.component';

@NgModule({
  declarations: [
    BillingPageComponent,
    BillingCycleComponent,
    VirtualVideoComponent,
    BillingSummaryComponent
  ],
  imports: [CommonModule, SharedModule]
})
export class NewBillingModule {
}
