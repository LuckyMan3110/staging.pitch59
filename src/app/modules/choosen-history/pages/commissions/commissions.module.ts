import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommissionsRoutingModule } from './commissions-routing.module';
import { CommissionsComponent } from './commissions.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [CommissionsComponent],
  imports: [CommonModule, CommissionsRoutingModule, SharedModule]
})
export class CommissionsModule {
}
