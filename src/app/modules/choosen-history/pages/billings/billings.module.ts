import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingsRoutingModule } from './billings-routing.module';
import { BillingsComponent } from './billings.component';

@NgModule({
  declarations: [BillingsComponent],
  imports: [CommonModule, BillingsRoutingModule]
})
export class BillingsModule {
}
