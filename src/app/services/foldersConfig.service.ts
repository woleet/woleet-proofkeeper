import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { IdentityService } from './Identity.service';
import * as log from 'loglevel';
import * as Store from 'electron-store';

export interface FolderDesc {
  action: string;
  path: string;
  privateparam?: boolean;
  strict?: boolean;
  prune?: boolean;
  recursive?: boolean;
  identityName?: string;
  iDServerUnsecureSSL?: boolean;
}

@Injectable({
  providedIn: 'root',
})

export class FoldersConfigService {
  public folders: FolderParam[] = [];
  private store: Store;

  public constructor(storeService: StoreService, private identityService: IdentityService) {
    this.store = storeService.store;
    if (this.store.has('folders')) {
      const folders: FolderDesc[] = this.store.get('folders');
      this.folders = folders.map(e => new FolderParam(e, identityService));
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
    const newFolderParam = new FolderParam(folderDesc, this.identityService);
    this.addFolderFromClass(newFolderParam);
  }

  public addFolderFromClass(folder: FolderParam) {
    if (folder.action === 'anchor') {
      delete folder.identityName;
      delete folder.iDServerUnsecureSSL;
    }
    this.folders.push(folder);
    this.saveFolders();
  }

  public deleteFolder(folder: FolderParam) {
    const index = this.folders.lastIndexOf(folder);
    if (index === -1) {
      throw new Error ('Unable to find the folder to delete');
    } else {
      this.folders.splice(index, 1);
      this.saveFolders();
    }
  }

  public saveFolders() {
    const retFolderParam: any[] = [];
    this.folders.forEach(folder => {
      const tempfolder = ({ ...folder });
      delete tempfolder.logs;
      delete tempfolder.identityService;
      retFolderParam.push(tempfolder);
    });
    this.store.set('folders', retFolderParam);
  }
}

export interface Log {
  level: string;
  msg: string;
}

export class FolderParam {
  path: string;
  action: string;
  private?: boolean;
  strict?: boolean;
  prune?: boolean;
  recursive?: boolean;
  identityName?: string;
  iDServerUnsecureSSL?: boolean;
  logs?: Log[];

  public constructor(folderDesc: FolderDesc, public identityService: IdentityService) {
    if ((folderDesc.action === 'anchor') || (folderDesc.action === 'sign')) {
      this.action = folderDesc.action;
    } else {
      throw new Error(`Invalid action, must be anchor or sign current: ${folderDesc.action}`);
    }
    if (folderDesc.path) {
      this.path = folderDesc.path;
    } else {
      throw new Error(`path can't be null / undefined`);
    }
    if (folderDesc.privateparam) {
      this.private = folderDesc.privateparam;
    }
    if (folderDesc.strict) {
      this.strict = folderDesc.strict;
    }
    if (folderDesc.prune) {
      this.prune = folderDesc.prune;
    }
    if (folderDesc.recursive) {
      this.recursive = folderDesc.recursive;
    }
    if (folderDesc.identityName) {
      this.identityName = folderDesc.identityName;
    }
    if (folderDesc.iDServerUnsecureSSL) {
      this.iDServerUnsecureSSL = folderDesc.iDServerUnsecureSSL;
    }
  }

  public getParametersArray(): [string] {
    const parametersArray: [string] = [] as any;
    if (this.path) {
      parametersArray.push('--directory');
      parametersArray.push(this.path);
    }
    if (this.private) {
      parametersArray.push('--private');
    }
    if (this.strict) {
      parametersArray.push('--strict');
    }
    if (this.prune) {
      parametersArray.push('--prune');
    }
    if (this.recursive) {
      parametersArray.push('--recursive');
    }
    if (this.identityName && this.action === 'sign') {
      if (this.identityService.arrayIdentityContent.filter(item => item.name === this.identityName).length !== 1) {
        throw new Error(`Unable to find the identity named: ${this.identityName}`);
      } else {
        const identity = this.identityService.arrayIdentityContent.filter(item => item.name === this.identityName)[0];
        parametersArray.push('--widsSignURL');
        parametersArray.push(identity.apiURL);
        parametersArray.push('--widsToken');
        parametersArray.push(identity.apiToken);
        if (identity.publicKey) {
          parametersArray.push('--widsPubKey');
          parametersArray.push(identity.publicKey);
        }
        if (this.action === 'sign') {
          parametersArray.push('--widsUnsecureSSL');
        }
      }
    }
    return parametersArray;
  }
}

