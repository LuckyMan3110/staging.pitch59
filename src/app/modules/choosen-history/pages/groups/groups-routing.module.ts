import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsComponent } from './groups.component';
import { GroupItemComponent } from './group-item/group-item.component';

const routes: Routes = [
  {
    path: '',
    component: GroupsComponent
  },
  {
    path: ':id',
    component: GroupItemComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule {
}
