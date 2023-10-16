import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployerPortalComponent } from './employer-portal.component';

const routes: Routes = [
  {
    path: '',
    component: EmployerPortalComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployerPortalRoutingModule {
}
