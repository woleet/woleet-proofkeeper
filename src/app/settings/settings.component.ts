import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { tokenFormatValidator } from '../misc/validators';
import { checkAndSubmit } from '../misc/setingsChecker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IdentityService } from '../services/Identity.service';
import { remote } from 'electron';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public token: string;
  public url: string;
  public settingsFromGroup: FormGroup;
  public addState: boolean;
  public addIdentityFormGroup: FormGroup;

  constructor(private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public identityService: IdentityService) {
    this.addState = false;
    this.token = this.cli.getToken();
    this.url = this.cli.getUrl();

    this.settingsFromGroup = formBuilder.group({
      token: ['', [Validators.required, tokenFormatValidator]],
      url: ['']
    });

    this.addIdentityFormGroup = formBuilder.group({
      name: ['', [Validators.required]],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', ]
    });
  }

  onClickcheckAndSubmit() {
    checkAndSubmit(this.settingsFromGroup, this.cli, this.snackBar);
  }

  clearSavedSettings() {
    this.cli.store.clear();
    remote.getCurrentWebContents().reload();
  }

  addNewIdentityFromGroup() {
    this.identityService.addIdentity(
      this.addIdentityFormGroup.get('name').value,
      this.addIdentityFormGroup.get('url').value,
      this.addIdentityFormGroup.get('token').value,
      this.addIdentityFormGroup.get('pubKey').value
    );
    this.addState = false;
    this.addIdentityFormGroup.reset();
  }

  onAddIdentityClick() {
    if (this.addState) {
      this.addState = false;
      this.addIdentityFormGroup.reset();
    } else {
      this.addState = true;
    }
  }
}
