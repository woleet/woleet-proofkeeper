import { Component } from '@angular/core';
import { remote } from 'electron';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tokenFormatValidator } from '../misc/validators';
import { checkAndSubmit } from '../misc/setingsChecker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  private cli: WoleetCliParametersService;
  public token: string;
  public url: string;
  public settingsFromGroup: FormGroup;

  constructor(woleetCliService: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) {
    this.cli = woleetCliService;
    this.token = this.cli.getToken();
    this.url = this.cli.getUrl();
    this.settingsFromGroup = formBuilder.group({
      token: ['', [Validators.required, tokenFormatValidator]],
      url: ['']
    });
  }

  onClickcheckAndSubmit() {
    checkAndSubmit(this.settingsFromGroup, this.cli, this.snackBar);
  }

  clearSavedSettings() {
    this.cli.store.clear();
    remote.getCurrentWebContents().reload();
  }
}
