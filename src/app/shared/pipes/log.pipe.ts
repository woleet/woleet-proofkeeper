import { Pipe, PipeTransform } from '@angular/core';
import { FolderParam } from '../../misc/folderParam';
import { SharedService } from '../../services/shared.service';

@Pipe({
  name: 'logPipe',
})
export class LogPipe implements PipeTransform {
  constructor(private sharedService: SharedService) {}

  transform(value: FolderParam) {
    return (
      this.sharedService.translateLegacyAction(value.action) + ' ' + value.path
    );
  }
}
