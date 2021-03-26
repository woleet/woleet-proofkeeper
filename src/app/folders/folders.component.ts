import { Component } from '@angular/core';
import { Validators, AbstractControl, FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { FolderDesc } from '../services/foldersConfig.service';
import { IdentityService } from '../services/Identity.service';
import { remote } from 'electron';
import * as log from 'loglevel';
import * as nodepath from 'path';
import { LogContext } from '../misc/logs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog.component';
import { CliRunnerFolderInterface } from '../services/cliRunnerFolderInterface.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent {

  public out: string;
  public folderFormGroup: FormGroup;
  public foldersFormGroup: FormGroup[];
  public foldersStatusCode: LogContext[];
  public addState: boolean;


  constructor(
    public cliRunnerFolderInterface: CliRunnerFolderInterface,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    private dialog: MatDialog) {

    this.addState = false;

    this.folderFormGroup = formBuilder.group({
      action: ['anchor', [Validators.required, Validators.pattern('anchor|sign')]],
      path: ['', [Validators.required, noDuplicatePathValidatorFactory(this)]],
      public: [false],
      strict: [false],
      prune: [false],
      recursive: [false],
      filter: [''],
      identity: ['', identityCheckerFactory(this)],
      iDServerUnsecureSSL: [false],
    });
    this.fillFoldersFormGroup();
  }

  openConfirmDeleteDialog(folderForm: FormGroup) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.confirmationTitle = 'Remove folder';
    dialogRef.componentInstance.confirmationText =
      'Are you sure you want to remove this folder from ProofKeeper? Proofs won\'t be deleted and will have to be deleted manually.';
    dialogRef.afterClosed().subscribe(confirmDelete => {
      if (confirmDelete === true) {
        try {
          this.cliRunnerFolderInterface.deleteFolder(this.getFolderDescFromFormGroup(folderForm));
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
    this.cliRunnerFolderInterface.folders.folders.forEach(folderParam => {
      const tempfoldersFromGroup = this.formBuilder.group({
        action: [folderParam.action],
        path: [folderParam.path],
        public: [!folderParam.private],
        strict: [folderParam.strict],
        prune: [folderParam.prune],
        recursive: [folderParam.recursive],
        filter: [folderParam.filter],
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
      private: Boolean(!form.get('public').value).valueOf(),
      strict: Boolean(form.get('strict').value).valueOf(),
      prune: Boolean(form.get('prune').value).valueOf(),
      recursive: Boolean(form.get('recursive').value).valueOf(),
      filter: form.get('filter').value as string,
      identityName: form.get('identity').value as string,
      iDServerUnsecureSSL: Boolean(form.get('iDServerUnsecureSSL').value).valueOf(),
    };
    return folderDesc;
  }

  onClickPopUpDirectory() {
    let path: string;
    try {
      path = remote.dialog.showOpenDialogSync({ properties: ['openDirectory'] })[0];
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
    this.cliRunnerFolderInterface.addFolder(folderToAdd);
    this.addState = false;
    this.resetAddFolderFormGroup();
    this.fillFoldersFormGroup();
  }

  onClickUpdateFolderOptions(formGroup: FormGroup) {
    try {
      const folderToUpdate = this.getFolderDescFromFormGroup(formGroup);
      this.cliRunnerFolderInterface.updateFolder(folderToUpdate);
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

  onClickRefresh(folderForm: FormGroup) {
    this.cliRunnerFolderInterface.restartRunner(this.getFolderDescFromFormGroup(folderForm));
  }
}

function noDuplicatePathValidatorFactory(thisParam) {
  return function noDUplicatePathValidator(control: AbstractControl): ValidationErrors | null {
    if (thisParam.folderFormGroup !== undefined) {
      if (!control.value) {
        return null;
      }
      const foldersToCheck = thisParam.cliRunnerFolderInterface.folders.folders.filter(folder => {
        return folder.action === thisParam.folderFormGroup.controls['action'].value;
      });
      const separator = require('path').sep;
      const duplicateFolder = foldersToCheck.some(folder => {
        let pathToCheck = folder.path;
        if (pathToCheck.charAt(pathToCheck.length - 1) !== separator) {
          pathToCheck = pathToCheck + separator;
        }
        let valueToCheck = control.value;
        if (valueToCheck.charAt(valueToCheck.length - 1) !== separator) {
          valueToCheck = valueToCheck + separator;
        }
        return (pathToCheck.includes(valueToCheck) || valueToCheck.includes(pathToCheck));
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
