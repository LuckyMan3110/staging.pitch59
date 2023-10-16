import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupsPitchCardsRoutingModule } from './groups-pitch-cards-routing.module';
import { GroupsPitchCardsComponent } from './groups-pitch-cards.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [GroupsPitchCardsComponent],
  imports: [CommonModule, GroupsPitchCardsRoutingModule, SharedModule]
})
export class GroupsPitchCardsModule {
}
