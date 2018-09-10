import { Component, OnInit } from '@angular/core';
import { WoleetCli } from '../services/woleetcli.service'
@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit {

  cli: WoleetCli;
  out: string;

  constructor() {
   }

  ngOnInit() {
    // Fill folders from service
    this.cli = new WoleetCli();
    this.out = this.cli.createProcess('--test')
  }

}
