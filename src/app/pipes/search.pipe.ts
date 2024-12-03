import { Pipe, PipeTransform } from '@angular/core';
import { MainItem } from '../models/Mainitem.model';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(list:MainItem[],text:string): MainItem[] {
    return list.filter(item => item.description?.toLowerCase().includes(text.toLowerCase()) || item.unitOfMeasurementCode?.toLowerCase().includes(text.toLowerCase()) || item.currencyCode?.toLowerCase().includes(text.toLowerCase()));
  }

}
