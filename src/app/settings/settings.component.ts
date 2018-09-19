import { Component } from '@angular/core';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  private cli: WoleetCliParametersService;
  public token: string;
  public url: string;

  saveSettings() {
    this.cli.setWoleetCliParameters(this.token, this.url);
  }

  constructor(woleetCliService: WoleetCliParametersService) {
    this.cli = woleetCliService;
    this.token = this.cli.getToken();
    this.url = this.cli.getUrl();
  }
}
