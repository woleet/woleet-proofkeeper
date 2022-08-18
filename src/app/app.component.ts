import { Component, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ipcRenderer } from 'electron';
import * as Store from 'electron-store';
import { LanguageService } from './services/language.service';
import { SettingsMessageService } from './services/settingsMessage.service';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public active: Menus;
  private store: Store<any>;
  openDeeplinkDialog = false;
  openWizardDialog = false;
  deeplinkingUrl: string;

  constructor(
    storeService: StoreService,
    private settingsMessageService: SettingsMessageService,
    private zone: NgZone,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) {
    this.store = storeService.store;
    this.setLanguage();
    if (!this.store.get('wizardBypass', false)) {
      this.openWizardDialog = true;
    }
    this.setActiveFiles();

    ipcRenderer.on('deeplink', (event, deeplinkingUrl) => {
      this.zone.run(() => {
        if (this.openWizardDialog) {
          this.openWizardDialog = false;
        }
        this.openDeeplinkDialog = true;
        this.deeplinkingUrl = deeplinkingUrl;
      });
    });
  }

  onExitDialog() {
    if (this.openDeeplinkDialog) {
      if (this.active === 'settings') {
        this.settingsMessageService.sendMessage('update');
      }
    }

    if (this.openWizardDialog) {
      this.store.set('wizardBypass', true);
    }

    this.openDeeplinkDialog = false;
    this.openWizardDialog = false;
    this.deeplinkingUrl = null;
  }

  setActiveFiles() {
    this.active = 'files';
  }

  setActiveFolders() {
    this.active = 'folders';
  }

  setActiveSettings() {
    this.active = 'settings';
  }

  setActiveLogs() {
    this.active = 'logs';
  }

  setActiveInfos() {
    this.active = 'infos';
  }

  /**
   * Set the browser default language on init webapp.
   */
  setLanguage(): void {
    this.translateService.addLangs(
      this.languageService.getSupportedLanguages()
    );
    this.translateService.use(this.store.get('lang'));
  }
}

type Menus = 'files' | 'folders' | 'settings' | 'logs' | 'infos';
