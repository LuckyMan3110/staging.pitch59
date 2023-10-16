import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phone'
})
export class PhonePipe implements PipeTransform {
    transform(value: any, args?: any): string {
        let result = '';

        if (value) {
          const allNumbers = value.match(/\d/g).join('');

          const code = `(${allNumbers.slice(0, 3)})`;
          const phoneNumber = ` ${allNumbers.slice(3, 6)}-${allNumbers.slice(
            6,
            8
          )}${allNumbers.slice(8, 10)}`;
          result = code + phoneNumber;
        }

        return result;
    }
}
