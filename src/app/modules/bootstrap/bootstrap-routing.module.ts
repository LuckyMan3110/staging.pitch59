import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'card',
    loadChildren: () =>
      import('../../pages/pitch-card/pitch-card.module').then(
        (m) => m.PitchCardModule
      )
  },
  {
    path: 'pocket',
    loadChildren: () =>
      import('../../pages/shared-pocket/shared-pocket.module').then(
        (m) => m.SharedPocketModule
      )
  },
  {
    path: '',
    loadChildren: () => import('../../app.module').then((m) => m.AppModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class BootstrapRoutingModule {
}
