import { Injectable } from '@angular/core';
import { app } from '@electron/remote';
import * as Store from 'electron-store';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  public store: Store<any>;
  private lang: string;
  private manualTimestampingsPath: string;
  private manualSealsPath: string;

  public constructor(languageService: LanguageService) {
    this.store = new Store();
    if (this.store.has('lang')) {
      if (!!this.store.get('lang')) {
        this.lang = this.store.get('lang');
      } else {
        this.setLang(languageService.getBrowserLanguage());
      }
    } else {
      this.setLang(languageService.getBrowserLanguage());
    }

    if (this.store.has('manualTimestampingsPath')) {
      if (!!this.store.get('manualTimestampingsPath')) {
        this.manualTimestampingsPath = this.store.get(
          'manualTimestampingsPath'
        );
      } else {
        this.setManualTimestampingsPath(app.getPath('documents'));
      }
    } else {
      this.setManualTimestampingsPath(app.getPath('documents'));
    }

    if (this.store.has('manualSealsPath')) {
      if (!!this.store.get('manualSealsPath')) {
        this.manualSealsPath = this.store.get('manualSealsPath');
      } else {
        this.setManualSealsPath(app.getPath('documents'));
      }
    } else {
      this.setManualSealsPath(app.getPath('documents'));
    }
  }

  public getLang(): string {
    return this.lang;
  }

  public getManualTimestampingsPath(): string {
    return this.manualTimestampingsPath;
  }

  public getManualSealsPath(): string {
    return this.manualSealsPath;
  }

  public setManualTimestampingsPath(path: string) {
    this.store.set('manualTimestampingsPath', path);
    this.manualTimestampingsPath = path;
  }

  public setManualSealsPath(path: string) {
    this.store.set('manualSealsPath', path);
    this.manualSealsPath = path;
  }

  public setLang(lang: string) {
    this.store.set('lang', lang);
    this.lang = lang;
  }
}
