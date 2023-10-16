import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApplicantViewerLayoutComponent } from './components/applicant-viewer-layout/applicant-viewer-layout.component';
import { SharedModule } from '../shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';

@NgModule({
  declarations: [ApplicantViewerLayoutComponent],
  exports: [ApplicantViewerLayoutComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
    FormsModule,
    ListboxModule,
    HttpClientModule
  ]
})
export class ApplicantViewerModule {}
