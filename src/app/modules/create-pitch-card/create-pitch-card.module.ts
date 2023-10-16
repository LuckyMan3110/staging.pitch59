import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvertisingRadiusComponent } from './advertising-radius/advertising-radius.component';
import { LayoutComponent } from './layout/layout.component';
import { CreatePitchCardRoutingModule } from './create-pitch-card-routing.module';
import { CreatePitchCardService } from './create-pitch-card.service';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GMapModule } from 'primeng/gmap';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DiscountService } from './discount.service';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { OtherComponent } from './other/other.component';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';
import { EmploymentComponent } from './employment/employment.component';
import { SplitCamelCasePipe } from '../pitch-card-shared/pipes/split-camel-case.pipe';
import { PositionDetailComponent } from './position-detail/position-detail.component';
import { CreationTilesSharedModule } from '../creation-tiles-shared/creation-tiles-shared.module';
import { PitchCardSharedModule } from '../pitch-card-shared/pitch-card-shared.module';

@NgModule({
  declarations: [
    AdvertisingRadiusComponent,
    LayoutComponent,
    OtherComponent,
    EmploymentComponent,
    PositionDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CreationTilesSharedModule,
    GMapModule,
    CreatePitchCardRoutingModule,
    ScrollingModule,
    NgxDocViewerModule,
    EditorModule,
    ButtonModule,
    PitchCardSharedModule
  ],
  providers: [CreatePitchCardService, DiscountService, SplitCamelCasePipe]
})
export class CreatePitchCardModule {}
