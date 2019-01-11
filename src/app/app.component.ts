import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, timer } from 'rxjs';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';
import { FoldersConfigService, FolderParam } from './services/foldersConfig.service';
import { StoreService } from './services/store.service';
import { WizardComponent } from './wizard/wizard.component';
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
        this.execAllCli(folderToUse).then( _ => {
          this.running = false;
        });
      }
    });
  }

  setActiveFolders () { this.active = 'folders'; }

  setActiveSettings () { this.active = 'settings'; }

  setActiveLogs () { this.active = 'logs'; }

  execCli (folder: FolderParam) {
    return new Promise((resolve) => {
      log.info(this.cli.getActionParametersArray(folder));
      folder.logs = [];
      const exec = this.cli.woleetCli.createProcess(this.cli.getActionParametersArray(folder));
      exec.stdout.on('data', (data) => {
        log.info(data.toString('utf8'));
      });
      exec.on('close', (code) => {
        log.info(`woleet-cli exited with code ${code}`);
        resolve(code);
      });
    });
  }

  execAllCli (folders: FolderParam[]) {
    const promisesExec: Promise<any>[] = [];
    for ( let i = 0; i < folders.length; i++ ) {
      const folder = folders[i];
      promisesExec.push(this.execCli(folder));
    }
    return Promise.all(promisesExec);
  }
}
