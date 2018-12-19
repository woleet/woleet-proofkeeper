import { Component, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatTable,  } from '@angular/material/table';
import { FoldersConfigService, FolderParam } from '../services/foldersConfig.service';
import { LogMessageService } from '../services/logMessage.service';


@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnDestroy {
  public folder: FolderParam;
  public folders: FolderParam[];
  public displayedColumns: string[];
  private logMessageSubscription: any;
  @ViewChild(MatTable) mattable: MatTable<any>;

  constructor(private foldersConfigService: FoldersConfigService,
    private messageService: LogMessageService,
    private ref: ChangeDetectorRef) {
    this.folders = foldersConfigService.folders;
    this.folder = this.folders[0];
    this.displayedColumns = ['level', 'msg'];
    this.logMessageSubscription = this.messageService.getMessage().subscribe((message) => {
      if (this.folder.path === message) {
        this.mattable.renderRows();
        this.ref.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.logMessageSubscription.unsubscribe();
  }
}
