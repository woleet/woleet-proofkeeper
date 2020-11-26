import { Injectable, OnDestroy } from '@angular/core';
import { StoreService } from './store.service';
import { FolderParam } from '../misc/folderParam';
import { IdentityService } from './Identity.service';
import { FolderDoneService } from './folderDone.service';
import { Subscription } from 'rxjs';
import { remote } from 'electron';
import * as semver from 'semver';
import * as Store from 'electron-store';
import * as log from 'loglevel';

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

export class FoldersConfigService implements OnDestroy {
  public folders: FolderParam[] = [];
  public store: Store<any>;
  public fixReceipts: boolean;
  private folderDoneSubscription: Subscription;
  private foldersToCheck: FolderParam[] = [];

  public constructor(storeService: StoreService, private identityService: IdentityService, private folderDoneService: FolderDoneService) {
    this.store = storeService.store;
    this.checkUpgradePath();
    this.fixReceipts = this.store.get('fixReceipts');
    if (this.store.has('folders')) {
      const folders: FolderDesc[] = this.store.get('folders');
      this.folders = folders.map(e => new FolderParam(e, this.fixReceipts, identityService));
      this.folders.forEach(folder => {
        populateDefaultsFolderDesc(folder);
      });
      if (this.fixReceipts) {
        this.folderDoneSubscription = this.folderDoneService.getFolderParam().subscribe((folderParam) => {
          this.receiveFolderDone(folderParam);
        });
        this.foldersToCheck = Array.from(this.folders);
      }
    }
  }

  ngOnDestroy() {
    if (this.folderDoneSubscription) {
      this.folderDoneSubscription.unsubscribe();
    }
  }

  private receiveFolderDone(folderParam: FolderParam) {
    const index = this.folders.findIndex(f => ((folderParam.path === f.path) && (folderParam.action === f.action)));
    if (index !== -1) {
      if (folderParam.logContext.exitCode === 0) {
        const indexToCheck = this.foldersToCheck.findIndex(f => ((folderParam.path === f.path) && (folderParam.action === f.action)));
        if (index !== -1) {
          this.foldersToCheck.splice(indexToCheck, 1);
          this.folders[index].fixReceipts = false;
          if (this.foldersToCheck.length === 0) {
            this.store.set('fixReceipts', false);
            this.folderDoneSubscription.unsubscribe();
          }
        }
      }
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
    const newFolderParam = new FolderParam(folderDesc, false, this.identityService);
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
      delete tempfolder.fixReceipts;
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

  private checkUpgradePath() {
    const currentVersion = remote.app.getVersion();
    let storedVersion = '';
    if (this.store.has('previousVersion')) {
      storedVersion = this.store.get('previousVersion');
    } else if (this.store.has('folders')) {
      // Before version 0.5.1, previousVersion was not stored into the config
      //  but fixReceipts must be applied if and older configuration were to be found
      storedVersion = '0.5.0';
    } else {
      storedVersion = currentVersion;
    }

    if (!semver.valid(currentVersion)) {
      // If currentVersion is not readable, do nothing
      return;
    }
    if (!semver.valid(storedVersion)) {
      // This case can be triggered when storedVersion is taken from the store but is somehow not readable
      //  For now a sensible default would be to set it to the currentVersion
      storedVersion = currentVersion;
      this.store.set('previousVersion', currentVersion);
    }

    if (semver.lt(storedVersion, '0.5.1')) {
      this.upgrade051();
    }

    if (semver.neq(storedVersion, currentVersion)) {
      this.store.set('previousVersion', currentVersion);
    }
  }

  private upgrade051() {
    this.store.set('fixReceipts', true);
    this.store.set('previousVersion', '0.5.1');
  }
}
