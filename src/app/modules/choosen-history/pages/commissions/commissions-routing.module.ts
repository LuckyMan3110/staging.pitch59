import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommissionsComponent } from './commissions.component';

const routes: Routes = [
  {
    path: '',
    component: CommissionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommissionsRoutingModule {
}
