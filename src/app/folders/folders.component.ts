import { Component, OnInit } from '@angular/core';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { FoldersConfigService } from '../services/foldersconfig.service';
import * as log from 'loglevel';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})

export class FoldersComponent implements OnInit {

  cli: WoleetCliParametersService;
  out: string;
  folders: FoldersConfigService;

  ngOnInit() {
    // this.folders.addFolder('anchor', '/Users/pierrelecorre/Desktop');
    log.info(this.folders.getFolders());
    this.out = this.cli.woleetCli.createProcess('--test');
  }

  constructor(woleetCliService: WoleetCliParametersService, foldersConfigService: FoldersConfigService) {
    this.cli = woleetCliService;
    this.folders = foldersConfigService;
  }
}
