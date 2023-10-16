import { Pipe, PipeTransform } from '@angular/core';
import { AppSettings } from '../app.settings';

@Pipe({
  name: 'camelcase'
})
export class CamelcasePipe implements PipeTransform {
  transform(value: string): string {
    return value
      .replace(AppSettings.CAMEL_CASE, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }
}
