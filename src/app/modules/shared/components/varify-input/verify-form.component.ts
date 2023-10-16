import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  HostListener
} from '@angular/core';
import { VerificationResource } from '../../services/user-common.service';
import { Subscription } from 'rxjs';
import { InputConfig } from '../../../otp-input/models/input-config';
import { OtpInputComponent } from '../../../otp-input/components/otp-input/otp-input.component';

@Component({
  selector: 'app-verify-form',
  templateUrl: './verify-form.component.html'
})
export class VerifyFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() messageResource: string;
  @Input() errorMessage: string;

  @Output() otpCode = new EventEmitter<any>();
  @Output() resentOtp = new EventEmitter<any>();

  $formSubscriber = new Subscription();
  timer;
  resendOtpTimer;
  isTimerRunning: boolean;
  isResetTimerRunning = true;
  otp: string;
  verificationResources = VerificationResource;
  otpInputConfig: InputConfig = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    placeholder: '',
    disableAutoFocus: false
  };

  @ViewChild(OtpInputComponent, {static: false})
  otpInput: OtpInputComponent;

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if (this.otp?.length === 4) {
      this.submitOtpCode(this.messageResource);
      const elmId: string = 'otp_0_' + this.otpInput.componentKey;
      if (elmId) {
        setTimeout(() => {
          this.otpInput.focusTo(elmId);
        }, 500);
      }
    }
  }

  constructor() {
  }

  ngOnInit() {
    this.setTimer();
    this.setResentOtpTimer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.errorMessage?.currentValue) {
      this.otpInput.setValue('');
      this.otpInput.config.inputClass = 'bd-pink pink';
      this.errorMessage = changes.errorMessage.currentValue;
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      this.timer = clearTimeout();
    }
    if (this.resendOtpTimer) {
      this.resendOtpTimer = clearTimeout();
    }
    if (this.$formSubscriber) {
      this.$formSubscriber.unsubscribe();
    }
  }

  onOtpChange(otp) {
    this.otp = otp;
    this.otpInput.config.inputClass = '';
    this.errorMessage = !otp && this.errorMessage ? this.errorMessage : '';
  }

  submitOtpCode(type) {
    if (this.otp) {
      this.otpCode.emit({
        otpCode: parseInt(this.otp, 10),
        type: type
      });
      this.isResetTimerRunning = true;
      this.setResentOtpTimer();
    }
  }

  resendOtpCode() {
    this.resentOtp.emit({type: this.messageResource});
    this.setResentOtpTimer();
  }

  setResentOtpTimer() {
    this.resendOtpTimer = setTimeout(() => {
      this.isResetTimerRunning = false;
    }, 2500);
  }

  setTimer() {
    this.isTimerRunning = true;
    this.timer = setTimeout(() => {
      this.isTimerRunning = false;
    }, 600 * 1000);
  }
}
