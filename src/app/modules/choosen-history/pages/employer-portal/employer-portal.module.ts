import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { EmployerPortalRoutingModule } from './employer-portal-routing.module';
import { EmployerPortalComponent } from './employer-portal.component';
import { SharedModule } from '../../../shared/shared.module';
import { EmployerModalsComponent } from './employer-modals/employer-modals.component';
import { EmployerPortalTableComponent } from './employer-portal-table/employer-portal-table.component';
import { CreateEmployerPortalModule } from '../../../create-employer-portal/create-employer-portal.module';
import { CamelcasePipe } from '../../../shared/pipes/camelcase.pipe';
import { CreationTilesSharedModule } from '../../../creation-tiles-shared/creation-tiles-shared.module';
import { ApplicantViewerModule } from '../../../applicant-viewer/applicant-viewer.module';
import { PitchCardSharedModule } from '../../../pitch-card-shared/pitch-card-shared.module';

@NgModule({
  declarations: [
    EmployerPortalComponent,
    EmployerModalsComponent,
    EmployerPortalTableComponent
  ],
  imports: [
    CommonModule,
    EmployerPortalRoutingModule,
    SharedModule,
    CreateEmployerPortalModule,
    CreationTilesSharedModule,
    PitchCardSharedModule,
    ApplicantViewerModule
  ],
  providers: [TitleCasePipe, CamelcasePipe]
})
export class EmployerPortalModule {}
