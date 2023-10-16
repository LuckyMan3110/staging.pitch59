import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';

import { SharedModule } from '../../../shared/shared.module';
import { ContactRoutingModule } from './contact-routing.module';
import { ContactComponent } from './contact.component';

@NgModule({
  declarations: [ContactComponent],
  imports: [
    CommonModule,
    ContactRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InputMaskModule,
    SharedModule
  ]
})
export class ContactModule {
  constructor(private router: Router) {
    this.router.errorHandler = (error: any) => {
      console.error(error);
    };
  }
}
