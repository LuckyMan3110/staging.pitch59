import { PitchCardComponent } from './pitch-card.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: PitchCardComponent
  },
  {
    path: ':alias',
    component: PitchCardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PitchCardRoutingModule {}
