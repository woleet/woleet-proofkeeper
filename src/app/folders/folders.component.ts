import { Component } from '@angular/core';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { FoldersConfigService, FolderParam } from '../services/foldersconfig.service';
import { remote } from 'electron';
import * as log from 'loglevel';
import * as nodepath from 'path';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})

export class FoldersComponent {

  public folders: FoldersConfigService;
  public out: string;
  public formFolderParam: FolderParam;
  private cli: WoleetCliParametersService;
  private defaultFolderParam: FolderParam = new FolderParam({action: 'anchor', path: ''});

  constructor(woleetCliService: WoleetCliParametersService, foldersConfigService: FoldersConfigService) {
    this.cli = woleetCliService;
    this.folders = foldersConfigService;
    this.formFolderParam = new FolderParam(this.defaultFolderParam);
  }

  onClickPopUpDirectory() {
    let path: string;
    try {
      path = remote.dialog.showOpenDialog({properties: ['openDirectory']})[0];
      const pathlenght: number = path.split(nodepath.sep).join('').length;
      log.info(`Path lenght: ${pathlenght}`);
      if ( pathlenght > 160 ) {
        path = '';
        log.error(`The provided path exceed 160 characters`);
      }
    } catch (error) {
      path = '';
    } finally {
      this.formFolderParam.path = path;
      log.info(`Setting folder: ${this.formFolderParam.path}`);
    }
  }

  onClickAdd() {
    this.folders.addFolderFromClass(this.formFolderParam);
    this.formFolderParam = new FolderParam(this.defaultFolderParam);
  }

  onClickDelete(folder: FolderParam) {
    try {
      this.folders.deleteFolder(folder);
    } catch (error) {
      log.error(error);
    }
  }
}
