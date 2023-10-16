import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PitchCardsComponent } from './pitch-cards.component';

const routes: Routes = [
  {
    path: '',
    component: PitchCardsComponent
  },
  {
    path: ':id',
    component: PitchCardsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PitchCardsRoutingModule {
}
