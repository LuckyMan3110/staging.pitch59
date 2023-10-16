import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpLayoutComponent } from './ep-layout/ep-layout.component';
import { SharedModule } from '../shared/shared.module';
import { CreationTilesSharedModule } from '../creation-tiles-shared/creation-tiles-shared.module';
import { PitchCardSharedModule } from '../pitch-card-shared/pitch-card-shared.module';

@NgModule({
  declarations: [EpLayoutComponent],
  exports: [EpLayoutComponent],
  imports: [
    CommonModule,
    SharedModule,
    CreationTilesSharedModule,
    PitchCardSharedModule
  ]
})
export class CreateEmployerPortalModule {
  static forRoot(): ModuleWithProviders<CreateEmployerPortalModule> {
    return {
      ngModule: CreateEmployerPortalModule,
      providers: []
    };
  }
}
