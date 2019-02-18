import { Component } from '@angular/core';
import { Validators, AbstractControl, FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { FoldersConfigService, FolderDesc } from '../services/foldersConfig.service';
import { IdentityService } from '../services/Identity.service';
import { remote } from 'electron';
import * as log from 'loglevel';
import * as nodepath from 'path';
import { LogContext } from '../misc/logs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmationDialog } from '../dialogs/confirmationDialog.component';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent {

  public folders: FoldersConfigService;
  public out: string;
  public folderFormGroup: FormGroup;
  public foldersFormGroup: FormGroup[];
  public foldersStatusCode: LogContext[];
  public addState: boolean;

  constructor(
    foldersConfigService: FoldersConfigService,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    private dialog: MatDialog) {

    this.addState = false;
    this.folders = foldersConfigService;

    this.folderFormGroup = formBuilder.group({
      action: ['anchor', [Validators.required, Validators.pattern('anchor|sign')]],
      path: ['', [Validators.required, Validators.maxLength(160), noDUplicatePathValidatorFactory(this)]],
      private: [true],
      strict: [false],
      prune: [false],
      recursive: [false],
      identity: ['', identityCheckerFactory(this)],
      iDServerUnsecureSSL: [false],
    });
    this.fillFoldersFormGroup();
  }

  openConfirmDeleteDialog(folderForm: FormGroup) {
    let dialogRef = this.dialog.open(ConfirmationDialog);
    dialogRef.componentInstance.confirmationTitle = 'Remove folder';
    dialogRef.componentInstance.confirmationText = 'Are you sure you want to remove this folder from ProofKeeper? Proofs won\'t be deleted and will have to be deleted manually.';
    dialogRef.afterClosed().subscribe(confirmDelete => {
      if(confirmDelete === true) {
        try {
          this.folders.deleteFolder(this.getFolderDescFromFormGroup(folderForm));
          this.fillFoldersFormGroup();
        } catch (error) {
          log.error(error);
        }
      }
    });
  }

  fillFoldersFormGroup() {
    this.foldersFormGroup = [];
    this.foldersStatusCode = [];
    this.folders.folders.forEach(folderParam => {
      const tempfoldersFromGroup = this.formBuilder.group({
        action: [folderParam.action],
        path: [folderParam.path],
        private: [folderParam.private],
        strict: [folderParam.strict],
        prune: [folderParam.prune],
        recursive: [folderParam.recursive],
        identity: [folderParam.identityName, identityCheckerFactory(this)],
        iDServerUnsecureSSL: [folderParam.iDServerUnsecureSSL],
      });
      this.foldersFormGroup.push(tempfoldersFromGroup);
      this.foldersStatusCode.push(folderParam.logContext);
    });
  }

  private getFolderDescFromFormGroup(form: FormGroup) {
    const folderDesc: FolderDesc = {
      path: form.get('path').value as string,
      action: form.get('action').value as string,
      privateparam: form.get('private').value as boolean,
      strict: form.get('strict').value as boolean,
      prune: form.get('prune').value as boolean,
      recursive: form.get('recursive').value as boolean,
      identityName: form.get('identity').value as string,
      iDServerUnsecureSSL: form.get('iDServerUnsecureSSL').value as boolean,
    };
    return folderDesc;
  }

  onClickPopUpDirectory() {
    let path: string;
    try {
      path = remote.dialog.showOpenDialog({ properties: ['openDirectory'] })[0];
      const pathlenght: number = path.split(nodepath.sep).join('').length;
      log.info(`Path lenght: ${pathlenght}`);
    } catch (error) {
      path = '';
    } finally {
      this.folderFormGroup.patchValue({
        path: path
      });
      log.info(`Setting folder: ${this.folderFormGroup.get('path').value}`);
    }
  }

  onClickAdd() {
    const folderToAdd = this.getFolderDescFromFormGroup(this.folderFormGroup);
    this.folders.addFolderFromInterface(folderToAdd);
    this.addState = false;
    this.resetAddFolderFormGroup();
    this.fillFoldersFormGroup();
  }

  onClickUpdateFolderOptions(formGroup: FormGroup) {
    try {
      const folderToUpdate = this.getFolderDescFromFormGroup(formGroup);
      this.folders.updateFolderOptions(folderToUpdate);
      this.fillFoldersFormGroup();
    } catch (error) {
      log.error(error);
    }
  }

  resetPath() {
    this.folderFormGroup.patchValue({
      path: ''
    });
  }

  onTabChange(index: number) {
    if (index === 0 && this.folderFormGroup.get('action').value === 'sign') {
      this.folderFormGroup.patchValue({
        action: 'anchor'
      });
    } else if (index === 1 && this.folderFormGroup.get('action').value === 'anchor') {
      this.folderFormGroup.patchValue({
        action: 'sign'
      });
    }
    this.folderFormGroup.get('path').updateValueAndValidity();
    this.folderFormGroup.get('identity').updateValueAndValidity();
  }

  onAddFolderClick() {
    if (this.addState) {
      this.addState = false;
      this.resetAddFolderFormGroup();
      this.fillFoldersFormGroup();
    } else {
      this.addState = true;
    }
  }

  onCancelAddClick() {
    this.addState = false;
    this.resetAddFolderFormGroup();
  }

  resetAddFolderFormGroup() {
    this.folderFormGroup.reset({
      action: this.folderFormGroup.get('action').value,
      path: '',
      private: true,
    });
  }
}

function noDUplicatePathValidatorFactory(thisParam) {
  return function noDUplicatePathValidator(control: AbstractControl): ValidationErrors | null {
    if (thisParam.folderFormGroup !== undefined) {
      if (!control.value) {
        return null;
      }
      const foldersToCheck = thisParam.folders.folders.filter(folder => {
        return folder.action === thisParam.folderFormGroup.controls['action'].value;
      });
      const duplicateFolder = foldersToCheck.some(folder => {
        return (folder.path.includes(control.value) || control.value.includes(folder.path));
      });
      if (duplicateFolder) {
        return {
          collidingPaths: true
        };
      }
    }
    return null;
  };
}

function identityCheckerFactory(thisParam) {
  return function identityChecker(control: AbstractControl): ValidationErrors | null {
    if (thisParam.folderFormGroup === undefined) {
      return null;
    }
    if (thisParam.folderFormGroup.get('action').value === 'anchor') {
      return null;
    }
    if (!control.value) {
      return {
        voidIdentity: true
      };
    }
    if (!thisParam.identityService.arrayIdentityContent.some(elem => elem.name === control.value)) {
      return {
        identityNotFound: true
      };
    }
    return null;
  };
}
