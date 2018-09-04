import { Component, OnInit } from '@angular/core';
import { remote } from 'electron'; 
import { FoldersConfigService } from './services/foldersconfig.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'woleet-gui';
  test = remote.getGlobal('liveenv');

  folders: any[];

  constructor(private foldersconfig: FoldersConfigService) {

  }

  ngOnInit() {
    // Import saved folders
  }
}
