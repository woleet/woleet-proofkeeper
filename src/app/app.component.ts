import { Component } from '@angular/core';
import { remote } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'woleet-gui';

  folders: any[];

  constructor() {

  }
}
