import { Component } from '@angular/core';
import { remote } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'woleet-gui';
  public active: string;

  setActiveFolders () { this.active = 'folders'; }

  setActiveSettings () { this.active = 'settings'; }

  setActiveTerm () { this.active = 'term'; }

  constructor() {
    this.setActiveFolders();
  }
}
