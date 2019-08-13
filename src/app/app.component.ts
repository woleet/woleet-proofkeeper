import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StoreService } from './services/store.service';
import { WizardComponent } from './wizard/wizard.component';
import { CliRunnerFolderInterface } from './services/cliRunnerFolderInterface.service';
import * as Store from 'electron-store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  public active: string;
  private store: Store<any>;

  constructor(storeService: StoreService, dialog: MatDialog, private cliRunnerFolderInterface: CliRunnerFolderInterface) {
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
  }

  setActiveFolders () { this.active = 'folders'; }

  setActiveSettings () { this.active = 'settings'; }

  setActiveLogs () { this.active = 'logs'; }

  setActiveInfos () { this.active = 'infos'; }
}
