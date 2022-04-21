import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { LogMessageService } from '../services/logMessage.service';
import { FolderParam } from '../misc/folderParam';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {
  public folder: FolderParam;
  public folders: FolderParam[];
  public displayedColumns: string[];
  private logMessageSubscription: any;
  @ViewChild(MatTable) mattable: MatTable<any>;

  constructor(foldersConfigService: FoldersConfigService,
    private logMessageService: LogMessageService) {
    this.folders = foldersConfigService.folders;
    this.folder = this.folders[0];
    this.displayedColumns = ['level', 'msg'];
  }

  ngOnInit() {
    this.logMessageSubscription = this.logMessageService.getMessage().subscribe((message) => {
      if (this.folder.path === message) {
        this.mattable.renderRows();
      }
    });
  }

  ngOnDestroy() {
    this.logMessageSubscription.unsubscribe();
  }

  translateLegacyAction(action: string): string {
    if (action === 'anchor') { return 'timestamp'; }
    if (action === 'sign') { return 'seal'; }
    return action;
  }
}
