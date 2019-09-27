import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { FolderParam } from '../misc/folderParam';
import { IdentityService } from './Identity.service';
import * as log from 'loglevel';
import * as Store from 'electron-store';

export interface FolderDesc {
  action: string;
  path: string;
  private: boolean;
  strict: boolean;
  prune: boolean;
  recursive: boolean;
  filter: string;
  identityName: string;
  iDServerUnsecureSSL: boolean;
}

function populateDefaultsFolderDesc(folderDesc: FolderDesc) {
  if (!folderDesc.private) { folderDesc.private = false; }
  if (!folderDesc.strict) { folderDesc.strict = false; }
  if (!folderDesc.prune) { folderDesc.prune = false; }
  if (!folderDesc.recursive) { folderDesc.recursive = false; }

  if (folderDesc.action === 'sign') {
    if (!folderDesc.iDServerUnsecureSSL) {
      folderDesc.iDServerUnsecureSSL = false;
    }
  }
}

@Injectable({
  providedIn: 'root',
})

export class FoldersConfigService {
  public folders: FolderParam[] = [];
  public store: Store<any>;

  public constructor(storeService: StoreService, private identityService: IdentityService) {
    this.store = storeService.store;
    if (this.store.has('folders')) {
      const folders: FolderDesc[] = this.store.get('folders');
      this.folders = folders.map(e => new FolderParam(e, identityService));
      this.folders.forEach(folder => { populateDefaultsFolderDesc(folder); });
    }
  }

  private addFolderFromClass(folder: FolderParam) {
    if (folder.action === 'anchor') {
      delete folder.identityName;
      delete folder.iDServerUnsecureSSL;
    }
    this.folders.push(folder);
    this.saveFolders();
  }

  public addFolderFromInterface(folderDesc: FolderDesc) {
    const newFolderParam = new FolderParam(folderDesc, this.identityService);
    this.addFolderFromClass(newFolderParam);
  }

  public deleteFolder(folder: FolderDesc) {
    const index = this.folders.findIndex(f => ((folder.path === f.path) && (folder.action === f.action)));

    if (index === -1) {
      throw new Error('Unable to find the folder to delete');
    }

    this.folders.splice(index, 1);
    this.saveFolders();
  }

  public updateFolderOptions(folder: FolderDesc) {
    const found = this.folders.find(elem => ((folder.path === elem.path) && (folder.action === elem.action)));

    if (!found) {
      throw new Error('Unable to find the folder to update');
    }

    found.private = folder.private;
    found.strict = folder.strict;
    found.prune = folder.prune;
    found.recursive = folder.recursive;
    found.filter = folder.filter;
    if (found.action === 'sign') {
      found.identityName = folder.identityName;
      found.iDServerUnsecureSSL = folder.iDServerUnsecureSSL;
    }
    this.saveFolders();
  }

  public saveFolders() {
    const retFolderParam: any[] = [];
    this.folders.forEach(folder => {
      const tempfolder = ({ ...folder }); // Used to copy the object
      delete tempfolder.logContext;
      delete tempfolder.identityService;
      if (!tempfolder.filter) {
        delete tempfolder.filter;
      }
      retFolderParam.push(tempfolder);
    });
    this.store.set('folders', retFolderParam);
  }

  public getFolderParamFromActionPath(action: string, path: string): FolderParam {
    const foundFolder = this.folders.find(elem => ((action === elem.action) && (path === elem.path)));
    if (!foundFolder) {
      throw new Error('Unable to find the folder to get params from');
    }
    return foundFolder;
  }
}
