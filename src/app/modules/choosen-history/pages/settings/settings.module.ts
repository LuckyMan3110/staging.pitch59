import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../../../shared/shared.module';
import { CamelcasePipe } from '../../../shared/pipes/camelcase.pipe';

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, SettingsRoutingModule, SharedModule],
  providers: [CamelcasePipe]
})
export class SettingsModule {
}
