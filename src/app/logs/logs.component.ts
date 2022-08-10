import { Component } from '@angular/core';
import { FolderParam } from '../misc/folderParam';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent {
  public folder: FolderParam;
  public folders: FolderParam[];

  constructor(
    foldersConfigService: FoldersConfigService,
    public translations: TranslationService
  ) {
    this.folders = foldersConfigService.folders;
    this.folder = this.folders[0];
  }

  translateLegacyAction(action: string): string {
    if (action === 'anchor') {
      return 'timestamp';
    }
    if (action === 'sign') {
      return 'seal';
    }
    return action;
  }
}
