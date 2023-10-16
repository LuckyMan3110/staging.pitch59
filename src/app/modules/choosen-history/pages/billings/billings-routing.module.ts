import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillingsComponent } from './billings.component';

const routes: Routes = [
  {
    path: '',
    component: BillingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingsRoutingModule {
}
