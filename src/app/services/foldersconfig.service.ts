import { Injectable } from '@angular/core';
import * as log from 'loglevel';
import * as store from 'electron-store';

Injectable({
  providedIn: 'root',
});
export class FoldersConfigService {

  private folders: FolderParam[] = [];
  private persistentStorage: store;

  public getFolders(): FolderParam[] {
    const foldersRet: FolderParam[] = [];
    this.folders.forEach(folderParam => {
      if ( ( folderParam.path != null ) && ( folderParam.action === ( 'anchor' || 'sign' ) ) ) {
        foldersRet.push(folderParam);
      } else {
        log.warn('Configuration of folder ' + folderParam.path + ' is invalid');
      }
    });
    return foldersRet;
  }

  public addFolder(action: string,
            path: string,
            privateparam?: boolean,
            strict?: boolean,
            strictPrune?: boolean,
            backendkitSignURL?: string,
            backendkitToken?: string,
            backendkitUnsecureSSL?: boolean,
            backendkitPubKey?: string) {
    const newFolderParam = new FolderParam(action,
                                           path,
                                           privateparam,
                                           strict,
                                           strictPrune,
                                           backendkitSignURL,
                                           backendkitToken,
                                           backendkitUnsecureSSL,
                                           backendkitPubKey);
    this.folders.push(newFolderParam);
    this.persistentStorage.set('folders', this.folders);
  }

  public deleteFolder(folder: FolderParam) {
    const index = this.folders.lastIndexOf(folder);
    if (index === -1) {
      throw new Error ('Unable to find the folder to delete');
    } else {
      this.folders.splice(index, 1);
      this.persistentStorage.set('folders', this.folders);
    }
  }

  public constructor() {
    // Fill folders from saved file
    this.persistentStorage = new store();
    if (this.persistentStorage.has('folders')) {
      this.folders = this.persistentStorage.get('folders');
    }
  }
}

class FolderParam {
  path: string = null;
  action: string = null;
  private = false;
  strict = false;
  strictPrune = false;
  backendkitSignURL: string = null;
  backendkitToken: string = null;
  backendkitUnsecureSSL = false;
  backendkitPubKey: string = null;

  public getParametersAsString() {
    let folderParameters = '';
    if (this.action != null) {
      folderParameters = folderParameters.concat(`${this.action} `);
    }
    if (this.path != null) {
      folderParameters = folderParameters.concat(`--directory ${this.path} `);
    }
    if (this.private !== false) {
      folderParameters = folderParameters.concat(`--private `);
    }
    if (this.strict !== false) {
      folderParameters = folderParameters.concat(`--strict `);
    }
    if (this.strictPrune !== false) {
      folderParameters = folderParameters.concat(`--strictPrune `);
    }
    if ((this.backendkitSignURL != null) && this.action === 'sign') {
      folderParameters = folderParameters.concat(`--backendkitSignURL ${this.backendkitSignURL} `);
    }
    if ((this.backendkitToken != null) && this.action === 'sign') {
      folderParameters = folderParameters.concat(`--backendkitToken ${this.backendkitToken} `);
    }
    if ((this.backendkitUnsecureSSL !== false) && this.action === 'sign') {
      folderParameters = folderParameters.concat(`--unsecureSSL `);
    }
    if ((this.backendkitPubKey != null) && this.action === 'sign') {
      folderParameters = folderParameters.concat(`--backendkitPubKey ${this.backendkitPubKey} `);
    }
    return folderParameters;
  }

  public constructor(action: string,
                     path: string,
                     privateparam?: boolean,
                     strict?: boolean,
                     strictPrune?: boolean,
                     backendkitSignURL?: string,
                     backendkitToken?: string,
                     backendkitUnsecureSSL?: boolean,
                     backendkitPubKey?: string) {
    if (action === ('anchor' || 'sign')) {
      this.action = action;
    } else {
      throw new Error(`Invalid action, must be anchor or sign current: ${action}`);
    }
    this.path = path;
    if (privateparam !== undefined) {
      this.private = privateparam;
    }
    if (strict !== undefined) {
      this.strict = strict;
    }
    if (strictPrune !== undefined) {
      this.strictPrune = strictPrune;
    }
    if (backendkitSignURL !== undefined) {
      this.backendkitSignURL = backendkitSignURL;
    }
    if (backendkitToken !== undefined) {
      this.backendkitToken = backendkitToken;
    }
    if (backendkitUnsecureSSL !== undefined) {
      this.backendkitUnsecureSSL = backendkitUnsecureSSL;
    }
    if (backendkitPubKey !== undefined) {
      this.backendkitPubKey = backendkitPubKey;
    }
  }

}
