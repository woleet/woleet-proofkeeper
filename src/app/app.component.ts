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
  private timer: Observable<number> = timer(10 * 1000, 15 * 60 * 1000);
  private running = false;

  constructor(woleetCliService: WoleetCliParametersService, foldersConfigService: FoldersConfigService) {
    this.setActiveFolders();
    this.cli = woleetCliService;
    this.folders = foldersConfigService;

    this.timer.subscribe( () => { if (! this.running ) {
      this.running = true;
      const folderToUse = this.folders.folders.slice();
      this.execAllCli(folderToUse);
    }
  });
}

setActiveFolders () { this.active = 'folders'; }

setActiveSettings () { this.active = 'settings'; }

setActiveTerm () { this.active = 'term'; }

async execCli (folder: FolderParam) {
  return new Promise((resolve) => {
  log.info(this.cli.getActionParametersArray(folder));
  folder.logs = [];
  const exec = this.cli.woleetCli.createProcess(this.cli.getActionParametersArray(folder));
  exec.stdout.on('data', (data) => {
    folder.logs.push(data.toString('utf8'));
  });
  exec.on('close', (code) => {
    this.printLogs(folder);
    log.info(`woleet-cli exited with code ${code}`);
    resolve(code);
  });
});
}

async printLogs (folder: FolderParam) {
  folder.logs.forEach(logArray => {
    const jsonLogArray = JSON.parse(logArray);
    log.info(jsonLogArray);
  });
}

async execAllCli (folders: FolderParam[]) {
  for ( let i = 0; i < folders.length; i++ ) {
    const folder = folders[i];
    this.execCli(folder);
  }
}

}
