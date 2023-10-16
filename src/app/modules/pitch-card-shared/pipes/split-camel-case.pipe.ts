import { Pipe, PipeTransform } from '@angular/core';
import { AppSettings } from '../../shared/app.settings';

@Pipe({
  name: 'splitCamelCase'
})
export class SplitCamelCasePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return value.replace(AppSettings.SPLIT_CAMEL_CASE, '$1 $2').trim();
  }
}
