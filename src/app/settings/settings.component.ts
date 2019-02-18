import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog'
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { tokenFormatValidator,
         noDuplicateIdentityNameValidatorFactoryOnAdd,
         noDuplicateIdentityNameValidatorFactoryOnEdit } from '../misc/validators';
import { checkAndSubmit, checkwIDConnection } from '../misc/settingsChecker';
import { IdentityService } from '../services/Identity.service';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { PubKeyAddressGroup } from '../misc/identitiesFromServer';
import { ConfirmationDialog } from '../dialogs/confirmationDialog.component';
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
  public addPubKeyAddressGroup: PubKeyAddressGroup[];
  public editPubKeyAddressGroup: PubKeyAddressGroup[];

  constructor(private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    public identityService: IdentityService,
    public foldersConfigService: FoldersConfigService,
    private dialog: MatDialog) {
    this.identityOpened = '';
    this.addPubKeyAddressGroup = [];
    this.editPubKeyAddressGroup = [];
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
      name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactoryOnAdd(this)]],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', [Validators.required]]
    });

    this.editIdentityFormGroup = formBuilder.group({
      name: ['', [Validators.required, noDuplicateIdentityNameValidatorFactoryOnEdit(this)]],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', [Validators.required]]
    });
  }

  onClickcheckAndSubmit() {
    checkAndSubmit(this.settingsFromGroup, this.cli, this.snackBar);
  }

  openClearSaveSettingsConfirmDialog() {
    let dialogRef = this.dialog.open(ConfirmationDialog);
    dialogRef.componentInstance.confirmationTitle = 'Reset config';
    dialogRef.componentInstance.confirmationText = 'Are you sure you want to reset your config? All current settings and configured folders will be removed from ProofKeeper.';
    dialogRef.afterClosed().subscribe(confirmDelete => {
      if(confirmDelete === true) {
        this.cli.store.clear();
        remote.getCurrentWebContents().reload();
      }
    });
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
    while (this.addPubKeyAddressGroup.length) {
      this.addPubKeyAddressGroup.pop();
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
      while (this.addPubKeyAddressGroup.length) {
        this.addPubKeyAddressGroup.pop();
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
      while (this.editPubKeyAddressGroup.length) {
        this.editPubKeyAddressGroup.pop();
      }
  }

  closeEditForm() {
    this.identityOpened = '';
    this.editIdentityFormGroup.reset();
    while (this.editPubKeyAddressGroup.length) {
      this.editPubKeyAddressGroup.pop();
    }
  }

  onClickAddwIDConnection() {
      checkwIDConnection(this.addIdentityFormGroup.get('url').value,
      this.addIdentityFormGroup.get('token').value,
      this.addPubKeyAddressGroup,
      this.snackBar);
  }

  openConfirmDeleteWIDConnectionDialog(identityName: string) {
    let dialogRef = this.dialog.open(ConfirmationDialog);
    dialogRef.componentInstance.confirmationTitle = 'Delete identity';
    dialogRef.componentInstance.confirmationText = 'Are you sure you want to delete this identity?';
    dialogRef.afterClosed().subscribe(confirmDelete => {
      if(confirmDelete === true) {
        this.identityService.deleteIdentitySnackbar(identityName, this.foldersConfigService, this.snackBar);
        if (this.identityService.arrayIdentityContent.length === 0) {
          this.addState = true;
        }
      }
    });
  }

  async onClickEditwIDConnection() {
    await checkwIDConnection(this.editIdentityFormGroup.get('url').value,
    this.editIdentityFormGroup.get('token').value,
    this.editPubKeyAddressGroup,
    this.snackBar);
    if (this.editPubKeyAddressGroup.length !== 0 && this.editIdentityFormGroup.get('pubKey')) {
      this.editIdentityFormGroup.get('pubKey').setErrors({unableToFindOldKey: true});
      const match = this.editPubKeyAddressGroup.some(pubKeyAddressGroup => {
        return pubKeyAddressGroup.pubKeyAddress.some(pubKeyAddress => {
          if (pubKeyAddress.address === this.editIdentityFormGroup.get('pubKey').value) {
            return true;
          }
        });
      });
      if (match) {
        this.editIdentityFormGroup.get('pubKey').setErrors({unableToFindOldKey: false});
        this.editIdentityFormGroup.get('pubKey').updateValueAndValidity();
      }
    }
  }

  onAddURLTokenChanges() {
    this.addPubKeyAddressGroup = [];
  }

  onEditURLTokenChanges() {
    this.editPubKeyAddressGroup = [];
  }
}
