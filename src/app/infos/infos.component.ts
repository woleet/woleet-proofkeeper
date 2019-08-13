import { Component } from '@angular/core';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
const { shell } = require('electron');

@Component({
  selector: 'app-infos',
  templateUrl: './infos.component.html',
  styleUrls: ['./infos.component.scss']
})
export class InfosComponent {
  public cliVersion: string;
  public proofKeeperVersion: string;

  constructor(private cli: WoleetCliParametersService) {
    // tslint:disable-next-line: max-line-length
    const cliResult = require('child_process').spawnSync(this.cli.woleetCli.getCliPath(), ['--version'], {stdio: 'pipe', windowsHide: true});
    this.cliVersion = cliResult.stdout.toString().replace('version ', '');
    const {app} = require('electron').remote;
    this.proofKeeperVersion = `${app.getName()} ${app.getVersion()}`;
  }

  clickOnGithub() {
    shell.openExternal('https://github.com/woleet/woleet-proofkeeper');
  }

  clickOnWoleet() {
    shell.openExternal('https://www.woleet.io');
  }

  clickOnLicense() {
    shell.openExternal('https://raw.githubusercontent.com/woleet/woleet-proofkeeper/master/LICENSE');
  }
}
