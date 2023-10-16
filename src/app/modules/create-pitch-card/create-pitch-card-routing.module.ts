import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, ActivatedRoute } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { AdvertisingRadiusComponent } from './advertising-radius/advertising-radius.component';
import { OtherComponent } from './other/other.component';
import { EmploymentComponent } from './employment/employment.component';
import { CongratulationsComponent } from './congratulations/congratulations.component';
import { PositionDetailComponent } from './position-detail/position-detail.component';
import { EnterInformationComponent } from '../creation-tiles-shared/components/enter-information/enter-information.component';
import { ChoosePlanComponent } from '../creation-tiles-shared/components/choose-plan/choose-plan.component';
import { ImagesComponent } from '../creation-tiles-shared/components/images/images.component';
import { MoreInfoComponent } from '../creation-tiles-shared/components/more-info/more-info.component';
import { PitchVideoComponent } from '../creation-tiles-shared/components/pitch-video/pitch-video.component';

const routes: Routes = [
  {
    component: LayoutComponent,
    path: '',
    children: [
      {
        path: 'information',
        component: EnterInformationComponent
      },
      {
        path: 'images',
        component: ImagesComponent
      },
      {
        path: 'video',
        component: PitchVideoComponent
      },
      {
        path: 'more-info',
        component: MoreInfoComponent
      },
      {
        path: 'radius',
        component: AdvertisingRadiusComponent
      },
      {
        path: 'billing',
        component: ChoosePlanComponent
      },
      {
        path: 'other',
        component: OtherComponent
      },
      {
        path: 'admin',
        component: OtherComponent
      },
      {
        path: 'analytics',
        component: OtherComponent
      },
      {
        path: 'employment',
        component: EmploymentComponent
      },
      {
        path: 'congratulations',
        component: CongratulationsComponent
      },
      {
        path: 'position',
        component: PositionDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreatePitchCardRoutingModule {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.errorHandler = (error: any) => {
      console.error(error);
    };
  }
}
