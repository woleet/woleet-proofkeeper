import { Component } from '@angular/core';
import { remote } from 'electron';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';
import { FoldersConfigService, FolderParam } from './services/foldersconfig.service';
import * as log from 'loglevel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  public active: string;
  public folders: FoldersConfigService;
  private cli: WoleetCliParametersService;

  constructor(woleetCliService: WoleetCliParametersService, foldersConfigService: FoldersConfigService) {
    this.setActiveFolders();
    this.cli = woleetCliService;
    this.folders = foldersConfigService;
    for (const folder of this.folders.folders) {
      log.info(this.cli.getActionParametersAsString(folder));
    }
  }

  setActiveFolders () { this.active = 'folders'; }

  setActiveSettings () { this.active = 'settings'; }

  setActiveTerm () { this.active = 'term'; }
}
