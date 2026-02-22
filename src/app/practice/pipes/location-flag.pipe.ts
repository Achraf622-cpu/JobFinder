import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'locationFlag',
  standalone: true
})
export class LocationFlagPipe implements PipeTransform {
  transform(value: string): string {
    if (value === 'France') return '�� France';
    if (value === 'Maroc') return '🇲🇦 Maroc';
    
    return '📍 ' + value;
  }
}
