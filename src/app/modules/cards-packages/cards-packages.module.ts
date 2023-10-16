import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardsPackagesComponent } from './pages/cards-packages-main/cards-packages.component';
import { CardPackageItemComponent } from './pages/card-package-item/card-package-item.component';
import { CardsPackagesRoutingModule } from './cards-packages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { NewCardsPackagesComponent } from './pages/cards-packages-main/new-cards-packages/new-cards-packages.component';
import { ChoosePitchcardPageComponent } from './pages/choose-pitchcard-page/choose-pitchcard-page.component';

@NgModule({
  declarations: [
    CardsPackagesComponent,
    CardPackageItemComponent,
    NewCardsPackagesComponent,
    ChoosePitchcardPageComponent
  ],
  imports: [CardsPackagesRoutingModule, CommonModule, SharedModule]
})
export class CardsPackagesModule {
}
