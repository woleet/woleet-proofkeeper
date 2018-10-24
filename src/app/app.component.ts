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
  private running = false;


  constructor(woleetCliService: WoleetCliParametersService, foldersConfigService: FoldersConfigService) {
    this.setActiveFolders();
    this.cli = woleetCliService;
    this.folders = foldersConfigService;

    this.timer.subscribe( () => { if (! this.running ) {
      this.running = true;
      const folderToUse = this.folders.folders.slice();
      this.execCli(folderToUse);
    }
  });
}

setActiveFolders () { this.active = 'folders'; }

setActiveSettings () { this.active = 'settings'; }

setActiveTerm () { this.active = 'term'; }

execCli (folders: FolderParam[]) {
  const folder = folders.shift();
  log.info(this.cli.getActionParametersArray(folder));
  const exec = this.cli.woleetCli.createProcess(this.cli.getActionParametersArray(folder));
  exec.stdout.on('data', (data) => {
    log.info(data.toString('utf8'));
  });
  exec.stderr.on('data', (data) => {
    log.error(data.toString('utf8'));
  });
  exec.on('close', (code) => {
    log.info(`woleet-cli exited with code ${code}`);
    if ( folders.length !== 0 ) {
      this.execCli(folders);
    } else {
      this.running = false;
    }
  });
}
}
