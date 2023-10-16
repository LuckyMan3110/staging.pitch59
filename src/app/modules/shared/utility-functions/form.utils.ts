import { FormGroup, ValidatorFn } from '@angular/forms';
import { AppSettings } from '../app.settings';

export function equalValueValidator(
  targetKey: string,
  toMatchKey: string
): ValidatorFn {
  return (group: FormGroup): { [key: string]: any } => {
    const target = group.controls[targetKey];
    const toMatch = group.controls[toMatchKey];
    const isMatch = target.value === toMatch.value;
    // set equal value error on dirty controls
    if (!isMatch && target.valid && toMatch.valid) {
      toMatch.setErrors({equalValue: targetKey});
      const message = targetKey + ' != ' + toMatchKey;
      return {equalValue: message};
    }
    if (isMatch && toMatch.hasError('equalValue')) {
      toMatch.setErrors(null);
    }

    return null;
  };
}

export function disableControlValidator(targetKey: string): ValidatorFn {
  return (group: FormGroup): { [key: string]: any } => {
    const control = group.controls[targetKey];
    const regex = AppSettings.EMAIL_PATTERN;
    if (control.touched) {
      const isValid = regex.test(control.value);
      if (!isValid && control.valid) {
        control.setErrors({equalValue: targetKey});
        const message = targetKey + ' != ' + control;
        return {invalid: message};
      }
    }
    return null;
  };
}
