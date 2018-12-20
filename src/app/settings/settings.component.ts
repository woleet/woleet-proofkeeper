import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { tokenFormatValidator, noDuplicateIdentityNameValidatorFactory } from '../misc/validators';
import { checkAndSubmit } from '../misc/settingsChecker';
import { IdentityService } from '../services/Identity.service';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { remote } from 'electron';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public addState: boolean;
  public identityOpened: string;
  public settingsFromGroup: FormGroup;
  public addIdentityFormGroup: FormGroup;
  public editIdentityFormGroup: FormGroup;

  constructor(private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    public identityService: IdentityService,
    public foldersConfigService: FoldersConfigService) {
    this.addState = false;
    this.identityOpened = '';
    this.settingsFromGroup = formBuilder.group({
      token: [this.cli.getToken(), [Validators.required, tokenFormatValidator]],
      url: [this.cli.getUrl()]
    });

    this.addIdentityFormGroup = formBuilder.group({
      name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactory(this)]],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['']
    });

    this.editIdentityFormGroup = formBuilder.group({
      name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactory(this)]],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['']
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

  openEditForm(editIdentityName: string) {
    const currentIdentity = this.identityService.arrayIdentityContent.filter(elem => elem.name === editIdentityName)[0];
    this.editIdentityFormGroup.reset();
    this.editIdentityFormGroup.patchValue({name: currentIdentity.name});
    this.editIdentityFormGroup.patchValue({url: currentIdentity.apiURL});
    this.editIdentityFormGroup.patchValue({token: currentIdentity.apiToken});
    if (currentIdentity.publicKey) {
      this.editIdentityFormGroup.patchValue({pubKey: currentIdentity.publicKey});
    }
    this.identityOpened = editIdentityName;
  }

  saveEditForm() {
    this.identityService.updateIdentity(this.foldersConfigService,
      this.identityOpened,
      this.editIdentityFormGroup.get('name').value,
      this.editIdentityFormGroup.get('url').value,
      this.editIdentityFormGroup.get('token').value,
      this.editIdentityFormGroup.get('pubKey').value);
      this.closeEditForm();
  }

  closeEditForm() {
    this.identityOpened = '';
    this.editIdentityFormGroup.reset();
  }
}
