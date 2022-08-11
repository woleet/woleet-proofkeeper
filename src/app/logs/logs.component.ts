import { Component } from '@angular/core';
import { FolderParam } from '../misc/folderParam';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { SharedService } from '../services/shared.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent {
  public folder: FolderParam;
  public folders: FolderParam[];
  showSelectOptions = false;

  constructor(
    foldersConfigService: FoldersConfigService,
    public translations: TranslationService,
    private sharedService: SharedService
  ) {
    this.folders = foldersConfigService.folders;
    this.folder = this.folders[0];
  }

  changeFolder(folder) {
    this.folder = folder;
    this.showSelectOptions = false;
  }

  translateLegacyAction(action: string): string {
    return this.sharedService.translateLegacyAction(action);
  }
}
