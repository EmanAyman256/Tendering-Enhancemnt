import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords'
})
export class TruncateWordsPipe implements PipeTransform {
  transform(value: string, wordCount: number = 2): string {
    if (!value) return '';
    const words = value.split(' ');
    if (words.length <= wordCount) return value;
    return words.slice(0, wordCount).join(' ') + ' ...';
  }
}
