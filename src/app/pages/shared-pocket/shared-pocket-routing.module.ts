import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedPocketComponent } from './shared-pocket/shared-pocket.component';

const routes: Routes = [
    {
        path: '',
        component: SharedPocketComponent
    },
    {
        path: ':token',
      component: SharedPocketComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedPocketRoutingModule {
}
