import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtpInputComponent } from './components/otp-input/otp-input.component';
import { KeysPipe } from './pipes/keys-pipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OtpInputComponent, KeysPipe],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [OtpInputComponent],
  providers: [KeysPipe]
})
export class OtpInputModule {
}
