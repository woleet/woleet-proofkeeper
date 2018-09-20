import { Component } from '@angular/core';
import { Observable, timer } from 'rxjs';
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
  private timer: Observable<number> = timer(30 * 1000, 15 * 60 * 1000);


  constructor(woleetCliService: WoleetCliParametersService, foldersConfigService: FoldersConfigService) {
    this.setActiveFolders();
    this.cli = woleetCliService;
    this.folders = foldersConfigService;

    this.timer.subscribe( () => {
      for (const folder of this.folders.folders) {
        log.info(this.cli.getActionParametersArray(folder));
        this.cli.woleetCli.createProcess(this.cli.getActionParametersArray(folder));
      }
    } );
  }

  setActiveFolders () { this.active = 'folders'; }

  setActiveSettings () { this.active = 'settings'; }

  setActiveTerm () { this.active = 'term'; }
}
