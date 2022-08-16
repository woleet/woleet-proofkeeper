import { Pipe, PipeTransform } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Pipe({
  name: 'logPipe',
})
export class LogPipe implements PipeTransform {
  constructor(private sharedService: SharedService) {}

  transform(value: any): any {
    return (
      this.sharedService.translateLegacyAction(value.action) + ' ' + value.path
    );
  }
}
