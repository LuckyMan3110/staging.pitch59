import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPocketsRoutingModule } from './my-pockets-routing.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SharedModule } from '../../../shared/shared.module';
import { MyPocketsComponent } from './my-pockets.component';
import { PitchCardSharedModule } from '../../../pitch-card-shared/pitch-card-shared.module';

@NgModule({
  declarations: [MyPocketsComponent],
  imports: [
    CommonModule,
    SharedModule,
    MyPocketsRoutingModule,
    AutoCompleteModule,
    PitchCardSharedModule
  ]
})
export class MyPocketsModule {
}
