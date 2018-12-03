import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, timer } from 'rxjs';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';
import { FoldersConfigService, FolderParam, Log } from './services/foldersconfig.service';
import { StoreService } from './services/store.service';
import { WizardComponent } from './wizard/wizard.component';
import { LogMessageService } from './services/logmessage.service';
import * as Store from 'electron-store';
import * as log from 'loglevel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  public active: string;
  private store: Store;
  private timer: Observable<number> = timer(10 * 1000, 15 * 60 * 1000);
  private running = false;

  constructor(storeService: StoreService,
    private cli: WoleetCliParametersService,
    private folders: FoldersConfigService,
    private logMessageService: LogMessageService,
    dialog: MatDialog) {
      this.store = storeService.store;
      if (!this.store.get('wizardBypass', false)) {
        const wizardDialog = dialog.open(WizardComponent, {
          disableClose: true,
          height: '90vh',
          width: '90vw',
          maxHeight: '100vh',
          maxWidth: '100vw'
        });
        wizardDialog.afterClosed().subscribe( () => {
          this.store.set('wizardBypass', true);
        });
      }

      this.setActiveFolders();

      this.timer.subscribe( () => { if (! this.running ) {
        this.running = true;
        const folderToUse = this.folders.folders.slice();
        this.execAllCli(folderToUse);
      }
    });
  }

  setActiveFolders () { this.active = 'folders'; }

  setActiveSettings () { this.active = 'settings'; }

  setActiveTerm () { this.active = 'term'; }

  async execCli (folder: FolderParam) {
    return new Promise((resolve) => {
      log.info(this.cli.getActionParametersArray(folder));
      folder.logs = [];
      const exec = this.cli.woleetCli.createProcess(this.cli.getActionParametersArray(folder));
      exec.stdout.on('data', (data) => {
        log.info(data.toString('utf8'));
        let jsonLogLine: Log;
      try {
        jsonLogLine = JSON.parse(data.toString('utf8'));
      } catch (error) {
        jsonLogLine.level = 'error';
        jsonLogLine.msg = data.toString('utf8');
      }
        folder.logs.push(jsonLogLine);
        this.logMessageService.sendMessage(folder.path);
      });
      exec.on('close', (code) => {
        this.printLogs(folder);
        log.info(`woleet-cli exited with code ${code}`);
        resolve(code);
      });
    });
  }

  async printLogs (folder: FolderParam) {
    folder.logs.forEach(logLine => {
      log.info(logLine);
    });
  }

  async execAllCli (folders: FolderParam[]) {
    for ( let i = 0; i < folders.length; i++ ) {
      const folder = folders[i];
      this.execCli(folder);
    }
  }
}
