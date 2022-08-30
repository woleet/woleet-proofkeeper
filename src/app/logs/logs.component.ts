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
  isSorting = false;

  constructor(
    foldersConfigService: FoldersConfigService,
    public translations: TranslationService,
    private sharedService: SharedService
  ) {
    this.folders = foldersConfigService.folders;
    this.folder = this.folders[0];
  }

  translateLegacyAction(action: string): string {
    return this.sharedService.translateLegacyAction(action);
  }

  sortByLevel() {
    this.isSorting = !this.isSorting;
    if (this.isSorting) {
      this.folder.logContext.logs.sort((a, b) =>
        a.level.localeCompare(b.level)
      );
    } else {
      this.folder.logContext.logs.sort((a, b) =>
        b.level.localeCompare(a.level)
      );
    }
  }
}
