import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { tokenFormatValidator, noDuplicateIdentityNameValidatorFactory } from '../misc/validators';
import { checkAndSubmit, checkwIDConnection } from '../misc/settingsChecker';
import { IdentityService } from '../services/Identity.service';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { PubKeyAddressGroup } from '../misc/identitiesFromServer';
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
  public pubKeyAddressGroup: PubKeyAddressGroup[];

  constructor(private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    public identityService: IdentityService,
    public foldersConfigService: FoldersConfigService) {
    this.identityOpened = '';
    this.pubKeyAddressGroup = [];
    this.settingsFromGroup = formBuilder.group({
      token: [this.cli.getToken(), [Validators.required, tokenFormatValidator]],
      url: [this.cli.getUrl()]
    });

    if (identityService.arrayIdentityContent.length === 0) {
      this.addState = true;
    } else {
      this.addState = false;
    }

    this.addIdentityFormGroup = formBuilder.group({
      name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactory(this)]],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', [Validators.required]]
    });

    this.editIdentityFormGroup = formBuilder.group({
      name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactory(this)]],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', [Validators.required]]
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
    const tempURL = this.addIdentityFormGroup.get('url').value;
    const tempToken = this.addIdentityFormGroup.get('token').value;
    this.identityService.addIdentity(
      this.addIdentityFormGroup.get('name').value,
      tempURL,
      tempToken,
      this.addIdentityFormGroup.get('pubKey').value
    );
    this.addState = false;
    this.addIdentityFormGroup.reset();
    while (this.pubKeyAddressGroup.length) {
      this.pubKeyAddressGroup.pop();
    }
    this.addIdentityFormGroup.patchValue({url: tempURL});
    this.addIdentityFormGroup.patchValue({token: tempToken});
  }

  onAddIdentityClick() {
    if (this.addState) {
      if (this.identityService.arrayIdentityContent.length !== 0) {
        this.addState = false;
      }
      this.addIdentityFormGroup.reset();
      while (this.pubKeyAddressGroup.length) {
        this.pubKeyAddressGroup.pop();
      }
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
    this.editIdentityFormGroup.patchValue({pubKey: currentIdentity.publicKey});
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
      while (this.pubKeyAddressGroup.length) {
        this.pubKeyAddressGroup.pop();
      }
  }

  closeEditForm() {
    this.identityOpened = '';
    this.editIdentityFormGroup.reset();
    while (this.pubKeyAddressGroup.length) {
      this.pubKeyAddressGroup.pop();
    }
  }

  onClickCheckwIDConnection() {
    let url: string;
    let token: string;
    if (this.addState) {
      url = this.addIdentityFormGroup.get('url').value;
      token = this.addIdentityFormGroup.get('token').value;
    } else {
      url = this.editIdentityFormGroup.get('url').value;
      token = this.editIdentityFormGroup.get('token').value;
    }
    checkwIDConnection(url, token, this.pubKeyAddressGroup, this.snackBar);
  }

  onURLTokenChanges() {
    this.pubKeyAddressGroup = [];
  }
}
