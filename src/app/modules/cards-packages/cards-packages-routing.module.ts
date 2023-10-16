import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { NewCardsPackagesComponent } from './pages/cards-packages-main/new-cards-packages/new-cards-packages.component';
import { ChoosePitchcardPageComponent } from './pages/choose-pitchcard-page/choose-pitchcard-page.component';

const routes: Routes = [
    {
        path: '',
        component: ChoosePitchcardPageComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsPackagesRoutingModule {
}
