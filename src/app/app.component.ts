import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, timer } from 'rxjs';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';
import { FoldersConfigService } from './services/foldersConfig.service';
import { StoreService } from './services/store.service';
import { WizardComponent } from './wizard/wizard.component';
import { LogMessageService } from './services/logMessage.service';
import { FolderParam } from './misc/folderParam';
import { Log } from './misc/logs';
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

  setActiveLogs () { this.active = 'logs'; }

  execCli (folder: FolderParam) {
    return new Promise((resolve) => {
      log.info(this.cli.getActionParametersArray(folder));
      if (folder.logContext.logsAccumulator === undefined) {
        folder.logContext.logsAccumulator = '';
      }
      folder.logContext.logs = [];
      folder.logContext.exitCode = null;
      folder.logContext.launched = true;
      const newExecutionCalled = [false]; // Used to pass boolean as reference
      const exec = this.cli.woleetCli.createProcess(this.cli.getActionParametersArray(folder));
      exec.stdout.on('data', (data) => {
        log.warn(data.toString('utf8'));
        folder.logContext.logsAccumulator += data.toString('utf8');
        if (!newExecutionCalled[0]) {
          this.parseLogs(folder, newExecutionCalled);
        } else {
          newExecutionCalled[0] = true;
        }
      });
      exec.on('close', (code) => {
        folder.logContext.exitCode = code;
        folder.logContext.launched = false;
        this.printLogs(folder);
        log.info(`woleet-cli exited with code ${code}`);
        resolve(code);
      });
    });
  }

  printLogs (folder: FolderParam) {
    folder.logContext.logs.forEach(logLine => {
      log.info(logLine);
    });
  }

  execAllCli (folders: FolderParam[]) {
    for ( let i = 0; i < folders.length; i++ ) {
      const folder = folders[i];
      this.execCli(folder);
    }
  }

  parseLogs (folder: FolderParam, newExecutionCalled: boolean[]) {
    const tempLogAccumulator = folder.logContext.logsAccumulator;
    const logAccumulatorSplitted = tempLogAccumulator.split('\n');
    log.info(logAccumulatorSplitted);
    if (logAccumulatorSplitted.length >= 2) {
      for (let index = 0; index < logAccumulatorSplitted.length; index++) {
        if (index === logAccumulatorSplitted.length - 1) {
          const lenghtToDelete = tempLogAccumulator.length - logAccumulatorSplitted[index].length;
          folder.logContext.logsAccumulator = folder.logContext.logsAccumulator.slice(lenghtToDelete);
        } else if (logAccumulatorSplitted[index]) {
          const jsonLogLine: Log = {level: '', msg: ''};
          try {
            const parsedLogLine = JSON.parse(logAccumulatorSplitted[index]);
            jsonLogLine.level = parsedLogLine.level;
            jsonLogLine.msg = parsedLogLine.msg;
            if (parsedLogLine.file !== undefined) {
              jsonLogLine.msg += `: ${parsedLogLine.file}`;
            }
            if (parsedLogLine.originalFile !== undefined) {
              jsonLogLine.msg += `: ${parsedLogLine.originalFile}`;
            }
          } catch (error) {
            jsonLogLine.level = 'error';
            jsonLogLine.msg = logAccumulatorSplitted[index];
          }
          folder.logContext.logs.unshift(jsonLogLine);
        }
      }
      this.logMessageService.sendMessage(folder.path);
    }
    if (newExecutionCalled[0]) {
      newExecutionCalled[0] = false;
      this.parseLogs(folder, newExecutionCalled);
    }
  }
}
