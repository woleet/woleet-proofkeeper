import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { FolderParam } from '../misc/folderParam';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { LogMessageService } from '../services/logMessage.service';
import { SharedService } from '../services/shared.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit, OnDestroy {
  public folder: FolderParam;
  public folders: FolderParam[];
  public displayedColumns: string[];
  private logMessageSubscription: any;
  @ViewChild(MatTable) mattable: MatTable<any>;

  constructor(
    foldersConfigService: FoldersConfigService,
    private logMessageService: LogMessageService,
    public translations: TranslationService,
    private sharedService: SharedService
  ) {
    this.folders = foldersConfigService.folders;
    this.folder = this.folders[0];
    this.displayedColumns = ['level', 'msg'];
  }

  ngOnInit() {
    this.logMessageSubscription = this.logMessageService
      .getMessage()
      .subscribe((message) => {
        if (this.folder.path === message) {
          this.mattable.renderRows();
        }
      });
  }

  ngOnDestroy() {
    this.logMessageSubscription.unsubscribe();
  }

  translateLegacyAction(action: string): string {
    return this.sharedService.translateLegacyAction(action);
  }
}
