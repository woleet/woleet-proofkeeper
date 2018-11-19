import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import * as log from 'loglevel';
import * as Store from 'electron-store';

declare interface FolderDesc {
  action: string;
  path: string;
  privateparam?: boolean;
  strict?: boolean;
  prune?: boolean;
  iDServerSignURL?: string;
  iDServerToken?: string;
  iDServerUnsecureSSL?: boolean;
  iDServerPubKey?: string;
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
      folder.iDServerSignURL = null;
      folder.iDServerToken = null;
      folder.iDServerUnsecureSSL = false;
      folder.iDServerPubKey = null;
    }
    this.folders.push(folder);
    this.saveFolder();
  }

  public deleteFolder(folder: FolderParam) {
    const index = this.folders.lastIndexOf(folder);
    if (index === -1) {
      throw new Error ('Unable to find the folder to delete');
    } else {
      this.folders.splice(index, 1);
      this.saveFolder();
    }
  }

  private saveFolder() {
    const retFolderParam: any[] = [];
    this.folders.forEach(folder => {
      const tempfolder = ({ ...folder });
      delete tempfolder.logs;
      retFolderParam.push(tempfolder);
    });
    this.store.set('folders', retFolderParam);
  }
}

export class FolderParam {
  path: string = null;
  action: string = null;
  private = true;
  strict = false;
  prune = false;
  iDServerSignURL: string = null;
  iDServerToken: string = null;
  iDServerUnsecureSSL = false;
  iDServerPubKey: string = null;
  logs?: string[];

  public constructor(folderDesc: FolderDesc) {
    if ((folderDesc.action === 'anchor') || (folderDesc.action === 'sign')) {
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
    if (folderDesc.prune !== undefined) {
      this.prune = folderDesc.prune;
    }
    if (folderDesc.iDServerSignURL !== undefined) {
      this.iDServerSignURL = folderDesc.iDServerSignURL;
    }
    if (folderDesc.iDServerToken !== undefined) {
      this.iDServerToken = folderDesc.iDServerToken;
    }
    if (folderDesc.iDServerUnsecureSSL !== undefined) {
      this.iDServerUnsecureSSL = folderDesc.iDServerUnsecureSSL;
    }
    if (folderDesc.iDServerPubKey !== undefined) {
      this.iDServerPubKey = folderDesc.iDServerPubKey;
    }
  }

  public getParametersArray(): [string] {
    const parametersArray: [string] = [] as any;
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
    if (this.prune !== false) {
      parametersArray.push('--prune');
    }
    if ((this.iDServerSignURL != null) && this.action === 'sign') {
      parametersArray.push('--iDServerSignURL');
      parametersArray.push(this.iDServerSignURL);
    }
    if ((this.iDServerToken != null) && this.action === 'sign') {
      parametersArray.push('--iDServerToken');
      parametersArray.push(this.iDServerToken);
    }
    if ((this.iDServerUnsecureSSL !== false) && this.action === 'sign') {
      parametersArray.push('--iDServerUnsecureSSL');
    }
    if ((this.iDServerPubKey != null) && this.action === 'sign') {
      parametersArray.push('--iDServerPubKey');
      parametersArray.push(this.iDServerPubKey);
    }
    return parametersArray;
  }
}

