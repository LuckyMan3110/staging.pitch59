import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyPocketsComponent } from './my-pockets.component';

const routes: Routes = [
  {
    path: '',
    component: MyPocketsComponent
  },
  {
    path: ':id',
    component: MyPocketsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyPocketsRoutingModule {
}
