import { Component, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ipcRenderer } from 'electron';
import * as Store from 'electron-store';
import { DeeplinkComponent } from './deeplink/deeplink.component';
import { LanguageService } from './services/language.service';
import { SettingsMessageService } from './services/settingsMessage.service';
import { StoreService } from './services/store.service';
import { WizardComponent } from './wizard/wizard.component';

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
    private settingsMessageService: SettingsMessageService,
    private zone: NgZone,
    private translateService: TranslateService,
    private languageService: LanguageService) {
    this.store = storeService.store;
    this.setLanguage();
    if (!this.store.get('wizardBypass', false)) {
      this.wizardDialog = dialog.open(WizardComponent, {
        disableClose: true,
        height: '90vh',
        width: '90vw',
        maxHeight: '100vh',
        maxWidth: '100vw'
      });
      this.wizardDialog.afterClosed().subscribe(() => {
        this.store.set('wizardBypass', true);
        this.wizardDialog = undefined;
      });
    }
    this.setActiveFiles();

    ipcRenderer.on('deeplink', (event, deeplinkingUrl) => {
      this.zone.run(() => {
        if (this.wizardDialog !== undefined) {
          this.wizardDialog.close();
        }
        if (!this.deeplinkDialog) {
          this.deeplinkDialog = this.dialog.open(DeeplinkComponent, {
            disableClose: true,
            data: {
              url: deeplinkingUrl
            }
          });
          this.deeplinkDialog.afterClosed().subscribe(() => {
            this.deeplinkDialog = undefined;
            if (this.active === 'settings') {
              this.settingsMessageService.sendMessage('update');
            }
          });
        }
      });
    });
  }

  setActiveFiles() { this.active = 'insert_drive_file'; }

  setActiveFolders() { this.active = 'folders'; }

  setActiveSettings() { this.active = 'settings'; }

  setActiveLogs() { this.active = 'logs'; }

  setActiveInfos() { this.active = 'infos'; }

  /**
  * Set the browser default language on init webapp.
  */
  setLanguage(): void {
    this.translateService.addLangs(this.languageService.getSupportedLanguages());
    this.translateService.use(this.store.get('lang'));
  }
}
