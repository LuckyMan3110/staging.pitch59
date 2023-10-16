import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsPitchCardsComponent } from './groups-pitch-cards.component';

const routes: Routes = [
  {
    path: '',
    component: GroupsPitchCardsComponent
  },
  {
    path: ':id',
    component: GroupsPitchCardsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsPitchCardsRoutingModule {
}
