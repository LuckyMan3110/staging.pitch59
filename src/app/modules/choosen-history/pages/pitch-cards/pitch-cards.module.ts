import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PitchCardsRoutingModule } from './pitch-cards-routing.module';
import { PitchCardsComponent } from './pitch-cards.component';
import { SharedModule } from '../../../shared/shared.module';
import { GroupsService } from '../../services/groups.service';
import { PitchCardSharedModule } from '../../../pitch-card-shared/pitch-card-shared.module';

@NgModule({
  declarations: [PitchCardsComponent],
  imports: [
    CommonModule,
    PitchCardsRoutingModule,
    SharedModule,
    PitchCardSharedModule
  ],
  providers: [GroupsService]
})
export class PitchCardsModule {
}
