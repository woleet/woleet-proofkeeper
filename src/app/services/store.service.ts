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
  private defaultIdentity: string;

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

    if (this.store.has('defaultIdentity')) {
      if (!!this.store.get('defaultIdentity')) {
        this.defaultIdentity = this.store.get('defaultIdentity');
      } else {
        if (
          this.store.has('arrayIdentityContent') &&
          this.store.get('arrayIdentityContent')[0] &&
          this.store.get('arrayIdentityContent')[0].name
        ) {
          this.setDefaultIdentity(
            this.store.get('arrayIdentityContent')[0].name
          );
        }
      }
    } else {
      if (
        this.store.has('arrayIdentityContent') &&
        this.store.get('arrayIdentityContent')[0] &&
        this.store.get('arrayIdentityContent')[0].name
      ) {
        this.setDefaultIdentity(this.store.get('arrayIdentityContent')[0].name);
      }
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

  public setLang(lang: string) {
    this.store.set('lang', lang);
    this.lang = lang;
  }

  public getProofReceiptsOfManualOperationsFolder(): string {
    return this.proofReceiptsOfManualOperationsFolder;
  }

  public setProofReceiptsOfManualOperationsFolder(path: string) {
    this.store.set(this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER, path);
    this.proofReceiptsOfManualOperationsFolder = path;
  }

  public getDefaultIdentity() {
    return this.defaultIdentity;
  }

  public setDefaultIdentity(name: string) {
    this.store.set('defaultIdentity', name);
    this.defaultIdentity = name;
  }
}
