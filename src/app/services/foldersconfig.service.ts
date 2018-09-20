import { Injectable } from '@angular/core';
import { WoleetCliParametersService } from './woleetcliParameters.service';
import { StoreService } from './store.service';
import * as log from 'loglevel';
import * as Store from 'electron-store';

declare interface FolderDesc {
  action: string;
  path: string;
  privateparam?: boolean;
  strict?: boolean;
  strictPrune?: boolean;
  backendkitSignURL?: string;
  backendkitToken?: string;
  backendkitUnsecureSSL?: boolean;
  backendkitPubKey?: string;
}

@Injectable({
  providedIn: 'root',
})

export class FoldersConfigService {
  public folders: FolderParam[] = [];
  private store: Store;

  public constructor(storeService: StoreService) {
    this.store = storeService.store;
    if (this.store.has('folders')) {
      const folders: FolderDesc[] = this.store.get('folders');
      this.folders = folders.map(e => new FolderParam(e));
    }
  }

  public getFoldersPruned(): FolderParam[] {
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

  public addFolderFromInterface(folderDesc: FolderDesc) {
    const newFolderParam = new FolderParam(folderDesc);
    this.addFolderFromClass(newFolderParam);
  }

  public addFolderFromClass(folder: FolderParam) {
    if (folder.action === 'anchor') {
      folder.backendkitSignURL = null;
      folder.backendkitToken = null;
      folder.backendkitUnsecureSSL = false;
      folder.backendkitPubKey = null;
    }
    this.folders.push(folder);
    this.store.set('folders', this.folders);
  }

  public deleteFolder(folder: FolderParam) {
    const index = this.folders.lastIndexOf(folder);
    if (index === -1) {
      throw new Error ('Unable to find the folder to delete');
    } else {
      this.folders.splice(index, 1);
      this.store.set('folders', this.folders);
    }
  }
}

export class FolderParam {
  path: string = null;
  action: string = null;
  private = true;
  strict = false;
  strictPrune = false;
  backendkitSignURL: string = null;
  backendkitToken: string = null;
  backendkitUnsecureSSL = false;
  backendkitPubKey: string = null;

  public constructor(folderDesc: FolderDesc) {
    if (folderDesc.action === ('anchor' || 'sign')) {
      this.action = folderDesc.action;
    } else {
      throw new Error(`Invalid action, must be anchor or sign current: ${folderDesc.action}`);
    }
    if ( folderDesc.path !== undefined ) {
      this.path = folderDesc.path;
    } else {
      throw new Error(`path can't be undefined`);
    }
    if (folderDesc.privateparam !== undefined) {
      this.private = folderDesc.privateparam;
    }
    if (folderDesc.strict !== undefined) {
      this.strict = folderDesc.strict;
    }
    if (folderDesc.strictPrune !== undefined) {
      this.strictPrune = folderDesc.strictPrune;
    }
    if (folderDesc.backendkitSignURL !== undefined) {
      this.backendkitSignURL = folderDesc.backendkitSignURL;
    }
    if (folderDesc.backendkitToken !== undefined) {
      this.backendkitToken = folderDesc.backendkitToken;
    }
    if (folderDesc.backendkitUnsecureSSL !== undefined) {
      this.backendkitUnsecureSSL = folderDesc.backendkitUnsecureSSL;
    }
    if (folderDesc.backendkitPubKey !== undefined) {
      this.backendkitPubKey = folderDesc.backendkitPubKey;
    }
  }

  public getParametersArray(): [string] {
    const parametersArray: [string] = [null];
    if (this.path != null) {
      parametersArray.push('--directory');
      parametersArray.push(this.path);
    }
    if (this.private !== false) {
      parametersArray.push('--private');
    }
    if (this.strict !== false) {
      parametersArray.push('--strict');
    }
    if (this.strictPrune !== false) {
      parametersArray.push('--strictPrune');
    }
    if ((this.backendkitSignURL != null) && this.action === 'sign') {
      parametersArray.push('--backendkitSignURL');
      parametersArray.push(this.backendkitSignURL);
    }
    if ((this.backendkitToken != null) && this.action === 'sign') {
      parametersArray.push('--backendkitToken ');
      parametersArray.push(this.backendkitToken);
    }
    if ((this.backendkitUnsecureSSL !== false) && this.action === 'sign') {
      parametersArray.push('--unsecureSSL');
    }
    if ((this.backendkitPubKey != null) && this.action === 'sign') {
      parametersArray.push('--backendkitPubKey');
      parametersArray.push(this.backendkitPubKey);
    }
    return parametersArray;
  }
}

