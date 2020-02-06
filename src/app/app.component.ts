import { Component, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from './services/store.service';
import { WizardComponent } from './wizard/wizard.component';
import { DeeplinkComponent } from './deeplink/deeplink.component';
import { CliRunnerFolderInterface } from './services/cliRunnerFolderInterface.service';
import { ipcRenderer } from 'electron';
import * as Store from 'electron-store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  public active: string;
  private wizardDialog: MatDialogRef<WizardComponent>;
  private deeplinkDialog: MatDialogRef<DeeplinkComponent>;
  private store: Store<any>;

  constructor(storeService: StoreService,
    public dialog: MatDialog,
    private cliRunnerFolderInterface: CliRunnerFolderInterface,
    private zone: NgZone) {
    this.store = storeService.store;
    if (!this.store.get('wizardBypass', false)) {
      this.wizardDialog = dialog.open(WizardComponent, {
        disableClose: true,
        height: '90vh',
        width: '90vw',
        maxHeight: '100vh',
        maxWidth: '100vw'
      });
      this.wizardDialog.afterClosed().subscribe( () => {
        this.store.set('wizardBypass', true);
        this.wizardDialog = undefined;
      });
    }
    this.setActiveFolders();

    ipcRenderer.on('deeplink', (event, deeplinkingUrl) => {
      this.zone.run(() => {
        if (!this.deeplinkDialog) {
          this.deeplinkDialog = this.dialog.open(DeeplinkComponent, {
            disableClose: true,
            data: {
              url: deeplinkingUrl
            }
          });
          this.deeplinkDialog.afterClosed().subscribe( () => {
            this.deeplinkDialog = undefined;
            if (this.active === 'settings') {
              
            }
          });
        }
      });
    });
  }

  setActiveFolders () { this.active = 'folders'; }

  setActiveSettings () { this.active = 'settings'; }

  setActiveLogs () { this.active = 'logs'; }

  setActiveInfos () { this.active = 'infos'; }
}
