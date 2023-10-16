import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterInformationComponent } from './components/enter-information/enter-information.component';
import { MoreInfoComponent } from './components/more-info/more-info.component';
import { ImagesComponent } from './components/images/images.component';
import { PitchVideoComponent } from './components/pitch-video/pitch-video.component';
import { ChoosePlanComponent } from './components/choose-plan/choose-plan.component';
import { SharedModule } from '../shared/shared.module';
import { ProHelpRequestComponent } from './components/pro-help-request/pro-help-request.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { HttpClientModule } from '@angular/common/http';
import { EditorModule } from 'primeng/editor';
import { TextIntroductionComponent } from './components/enter-information/text-introduction/text-introduction.component';

@NgModule({
  declarations: [
    StepperComponent,
    EnterInformationComponent,
    MoreInfoComponent,
    ImagesComponent,
    PitchVideoComponent,
    ChoosePlanComponent,
    ProHelpRequestComponent,
    TextIntroductionComponent
  ],
  imports: [CommonModule, SharedModule, HttpClientModule, EditorModule],
  exports: [
    StepperComponent,
    EnterInformationComponent,
    MoreInfoComponent,
    ImagesComponent,
    PitchVideoComponent,
    ChoosePlanComponent,
    ProHelpRequestComponent
  ]
})
export class CreationTilesSharedModule {
}
