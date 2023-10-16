import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { InputConfig } from '../../models/input-config';
import { FormControl, FormGroup } from '@angular/forms';
import { KeysPipe } from '../../pipes/keys-pipe.pipe';
import { KeyboardUtil } from '../../utils/keyboard-util';

@Component({
  selector: 'app-otp-input',
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss']
})
export class OtpInputComponent implements OnInit, AfterViewInit {
  @Input() config: InputConfig = {length: 4};
  @Output() inputChange = new EventEmitter<string>();
  @Input() formCtrl: FormControl;
  otpForm: FormGroup;
  currentVal: string;
  inputControls: FormControl[] = new Array(this.config.length);
  componentKey =
    Math.random().toString(36).substring(2) +
    new Date().getTime().toString(36);

  get inputType() {
    return this.config?.isPasswordInput
      ? 'password'
      : this.config?.allowNumbersOnly
        ? 'tel'
        : 'text';
  }

  constructor(private keysPipe: KeysPipe) {
  }

  ngOnInit() {
    this.otpForm = new FormGroup({});
    for (let index = 0; index < this.config.length; index++) {
      this.otpForm.addControl(
        this.getControlName(index),
        new FormControl()
      );
    }
    this.otpForm.valueChanges.subscribe((v: object) => {
      this.keysPipe.transform(this.otpForm.controls).forEach((k) => {
        const val = this.otpForm.controls[k].value;
        if (val && val.length > 1) {
          if (val.length >= this.config.length) {
            this.setValue(val);
          } else {
            this.rebuildValue();
          }
        }
      });
    });
  }

  ngAfterViewInit(): void {
    if (!this.config.disableAutoFocus) {
      const containerItem = document.getElementById(
        `c_${this.componentKey}`
      );
      if (containerItem) {
        const ele: any =
          containerItem.getElementsByClassName('otp-input')[0];
        if (ele && ele.focus) {
          ele.focus();
        }
      }
    }
  }

  private getControlName(idx) {
    return `ctrl_${idx}`;
  }

  onKeyDown($event, inputIdx) {
    if (KeyboardUtil.ifSpacebar($event)) {
      $event.preventDefault();
      return false;
    }
  }

  onInput($event) {
    const newVal = this.currentVal
      ? `${this.currentVal}${$event.target.value}`
      : $event.target.value;
    if (this.config.allowNumbersOnly && !this.validateNumber(newVal)) {
      $event.target.value = '';
      $event.stopPropagation();
      $event.preventDefault();
      return;
    }
  }

  onKeyUp($event, inputIdx) {
    const nextInputId = this.appendKey(`otp_${inputIdx + 1}`);
    const prevInputId = this.appendKey(`otp_${inputIdx - 1}`);
    if (KeyboardUtil.ifRightArrow($event)) {
      $event.preventDefault();
      this.setSelected(nextInputId);
      return;
    }
    if (KeyboardUtil.ifLeftArrow($event)) {
      $event.preventDefault();
      this.setSelected(prevInputId);
      return;
    }
    if (KeyboardUtil.ifBackspaceOrDelete($event) && !$event.target.value) {
      this.setSelected(prevInputId);
      this.rebuildValue();
      return;
    }

    if (!$event.target.value) {
      return;
    }

    if (this.ifValidKeyCode($event)) {
      this.setSelected(nextInputId);
    }
    this.rebuildValue();
  }

  validateNumber(val) {
    return val && /^\d*\.?\d*$/.test(val);
  }

  appendKey(id) {
    return `${id}_${this.componentKey}`;
  }

  setSelected(eleId) {
    this.focusTo(eleId);
    const ele: any = document.getElementById(eleId);
    if (ele && ele.setSelectionRange) {
      setTimeout(() => {
        ele.setSelectionRange(0, 1);
      }, 0);
    }
  }

  ifValidKeyCode(event) {
    const inp = event.key;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return (
      isMobile ||
      /[a-zA-Z0-9-_]/.test(inp) ||
      (this.config.allowKeyCodes &&
        this.config.allowKeyCodes.includes(event.keyCode))
    );
  }

  focusTo(eleId) {
    const ele: any = document.getElementById(eleId);
    if (ele) {
      ele.focus();
    }
  }

  // method to set component value
  setValue(value: any) {
    if (this.config.allowNumbersOnly && isNaN(value)) {
      return;
    }
    this.otpForm.reset();
    if (!value) {
      this.rebuildValue();
      return;
    }
    value = value.toString().replace(/\s/g, ''); // remove whitespace
    Array.from(value).forEach((c, idx) => {
      if (this.otpForm.get(this.getControlName(idx))) {
        this.otpForm.get(this.getControlName(idx)).setValue(c);
      }
    });
    if (!this.config.disableAutoFocus) {
      const containerItem = document.getElementById(
        `c_${this.componentKey}`
      );
      const indexOfElementToFocus =
        value.length < this.config.length
          ? value.length
          : this.config.length - 1;
      const ele: any =
        containerItem.getElementsByClassName('otp-input')[
          indexOfElementToFocus
          ];
      if (ele && ele.focus) {
        ele.focus();
      }
    }
    this.rebuildValue();
  }

  rebuildValue() {
    let val = '';
    this.keysPipe.transform(this.otpForm.controls).forEach((k) => {
      if (this.otpForm.controls[k].value) {
        let ctrlVal = this.otpForm.controls[k].value;
        const isLengthExceed = ctrlVal.length > 1;
        let isCaseTransformEnabled =
          !this.config.allowNumbersOnly &&
          this.config.letterCase &&
          (this.config.letterCase.toLocaleLowerCase() == 'upper' ||
            this.config.letterCase.toLocaleLowerCase() == 'lower');
        ctrlVal = ctrlVal[0];
        const transformedVal = isCaseTransformEnabled
          ? this.config.letterCase.toLocaleLowerCase() == 'upper'
            ? ctrlVal.toUpperCase()
            : ctrlVal.toLowerCase()
          : ctrlVal;
        if (isCaseTransformEnabled && transformedVal == ctrlVal) {
          isCaseTransformEnabled = false;
        } else {
          ctrlVal = transformedVal;
        }
        val += ctrlVal;
        if (isLengthExceed || isCaseTransformEnabled) {
          this.otpForm.controls[k].setValue(ctrlVal);
        }
      }
    });
    if (this.formCtrl?.setValue) {
      this.formCtrl.setValue(val);
    }
    this.inputChange.emit(val);
    this.currentVal = val;
  }

  handlePaste(e) {
    // Get pasted data via clipboard API
    let pastedData = '';
    const clipboardData = e.clipboardData || window['clipboardData'];
    if (clipboardData) {
      pastedData = clipboardData.getData('Text');
    }
    // Stop data actually being pasted into div
    e.stopPropagation();
    e.preventDefault();
    if (
      !pastedData ||
      (this.config.allowNumbersOnly && !this.validateNumber(pastedData))
    ) {
      return;
    }
    this.setValue(pastedData);
  }
}
