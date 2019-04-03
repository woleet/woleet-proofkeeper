import { Injectable, ApplicationRef } from '@angular/core';
import { FoldersConfigService, FolderDesc } from './foldersConfig.service';
import { WoleetCliParametersService } from './woleetcliParameters.service';
import { LogMessageService } from './logMessage.service';
import { IndependantCliRunnerService } from '../misc/independantCliRunner';
import * as log from 'loglevel';

@Injectable()
export class CliRunnerService {

  private runners: IndependantCliRunnerService[] = [];

  constructor (private appRef: ApplicationRef,
    public folders: FoldersConfigService,
    private cli: WoleetCliParametersService,
    private logMessageService: LogMessageService) {
    this.folders.folders.forEach( folder => {
      this.runners.push(new IndependantCliRunnerService(this.appRef, folder, this.cli, this.logMessageService));
    });
    log.info(this.runners);
  }

  public addFolder(folderDesc: FolderDesc) {
    this.folders.addFolderFromInterface(folderDesc);
    try {
      const foundFolder = this.folders.getFolderParamFromActionPath(folderDesc.action, folderDesc.path);
      this.runners.push( new IndependantCliRunnerService(this.appRef, foundFolder, this.cli, this.logMessageService));
    } catch (e) {
      log.error(e);
    }
  }

  public updateFolder(folderDesc: FolderDesc) {
    this.folders.updateFolderOptions(folderDesc);
    const runnerIndex = this.runners.findIndex(elem => ((folderDesc.action === elem.folderParam.action) && (folderDesc.path === elem.folderParam.path)));
    if (runnerIndex === -1) {
      log.error('Unable to find the runner to update');
      return;
    }

    try {
      const foundFolder = this.folders.getFolderParamFromActionPath(folderDesc.action, folderDesc.path);
      this.runners[runnerIndex] = new IndependantCliRunnerService(this.appRef, foundFolder, this.cli, this.logMessageService);
    } catch (e) {
      log.error(e);
    }
  }

  public deleteFolder(folderDesc: FolderDesc) {
    this.folders.deleteFolder(folderDesc);
    const runnerIndex = this.runners.findIndex(elem => ((folderDesc.action === elem.folderParam.action) && (folderDesc.path === elem.folderParam.path)));
    if (runnerIndex === -1) {
      log.error('Unable to find the runner to update');
      return;
    }
    this.runners.splice(runnerIndex, 1);
  }

  public restartRunner (folderDesc: FolderDesc) {
    const runnerIndex = this.runners.findIndex(elem => ((folderDesc.action === elem.folderParam.action) && (folderDesc.path === elem.folderParam.path)));
    if (runnerIndex === -1) {
      log.error('Unable to find the runner to restart');
      return;
    }
    this.runners[runnerIndex].forceRefresh();
  }
}
