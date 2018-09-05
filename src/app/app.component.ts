import { Component } from '@angular/core';
import { remote } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'woleet-gui';
  test = remote.getGlobal('liveenv');

  folders: any[];

  constructor() {

  }
}
