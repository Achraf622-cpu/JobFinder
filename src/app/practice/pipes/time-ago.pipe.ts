import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string): string {
    // 1. Calculate difference in milliseconds
    const diff = Date.now() - new Date(value).getTime();
    
    // 2. Convert to days (ms / 1000 / 60 / 60 / 24)
    const days = Math.floor(diff / (1000 * 3600 * 24));

    return `Il y a ${days} jours`;
  }
}
