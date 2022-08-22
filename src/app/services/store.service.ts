import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import { LanguageService } from './language.service';
import {
  createNewFolder,
  getDefaultFolderPathForManualActions
} from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  public store: Store<any>;
  private lang: string;
  private proofReceiptsOfManualOperationsFolder: string;
  DEFAULT_VALUE_MANUAL_OPERATION_FOLDER =
    'proofReceiptsOfManualOperationsFolder';
  DEFAULT_MANUAL_OPERATION_SUB_FOLDER_NAME = 'proofReceiptsOfManualOperations';

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

    createNewFolder(
      getDefaultFolderPathForManualActions(
        this.DEFAULT_MANUAL_OPERATION_SUB_FOLDER_NAME
      )
    );

    if (this.store.has(this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER)) {
      if (!!this.store.get(this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER)) {
        this.proofReceiptsOfManualOperationsFolder = this.store.get(
          this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER
        );
      } else {
        this.setProofReceiptsOfManualOperationsFolder(
          getDefaultFolderPathForManualActions(
            this.DEFAULT_MANUAL_OPERATION_SUB_FOLDER_NAME
          )
        );
      }
    } else {
      this.setProofReceiptsOfManualOperationsFolder(
        getDefaultFolderPathForManualActions(
          this.DEFAULT_MANUAL_OPERATION_SUB_FOLDER_NAME
        )
      );
    }
  }

  public getLang(): string {
    return this.lang;
  }

  public getProofReceiptsOfManualOperationsFolder(): string {
    return this.proofReceiptsOfManualOperationsFolder;
  }

  public setProofReceiptsOfManualOperationsFolder(path: string) {
    this.store.set(this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER, path);
    this.proofReceiptsOfManualOperationsFolder = path;
  }

  public setLang(lang: string) {
    this.store.set('lang', lang);
    this.lang = lang;
  }
}
