import { Component } from '@angular/core';
import { remote } from 'electron';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tokenFormatValidator } from '../misc/validators';
import { checkAndSubmit } from '../misc/settingsChecker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public settingsFromGroup: FormGroup;

  constructor(private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) {
    this.settingsFromGroup = formBuilder.group({
      token: [this.cli.getToken(), [Validators.required, tokenFormatValidator]],
      url: [this.cli.getUrl()]
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
