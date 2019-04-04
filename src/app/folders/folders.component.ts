import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Validators, AbstractControl, FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { FolderDesc } from '../services/foldersConfig.service';
import { IdentityService } from '../services/Identity.service';
import { remote } from 'electron';
import * as log from 'loglevel';
import * as nodepath from 'path';
import { LogContext } from '../misc/logs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../dialogs/confirmationDialog.component';
import { CliRunnerFolderInterface } from '../services/cliRunnerFolderInterface.service';
import { ExitTickService } from '../services/exitTick.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnDestroy {

  public out: string;
  public folderFormGroup: FormGroup;
  public foldersFormGroup: FormGroup[];
  public foldersStatusCode: LogContext[];
  public addState: boolean;
  private exitTickSubscription: any;


  constructor(
    public cliRunnerFolderInterface: CliRunnerFolderInterface,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private exitTickService: ExitTickService) {

    this.addState = false;

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

    this.exitTickSubscription = this.exitTickService.getTick().subscribe(() => {
      this.ref.detectChanges();
    });
  }

  ngOnDestroy() {
    this.exitTickSubscription.unsubscribe();
  }

  openConfirmDeleteDialog(folderForm: FormGroup) {
    const dialogRef = this.dialog.open(ConfirmationDialog);
    dialogRef.componentInstance.confirmationTitle = 'Remove folder';
    dialogRef.componentInstance.confirmationText = 'Are you sure you want to remove this folder from ProofKeeper? Proofs won\'t be deleted and will have to be deleted manually.';
    dialogRef.afterClosed().subscribe(confirmDelete => {
      if(confirmDelete === true) {
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

function noDUplicatePathValidatorFactory(thisParam) {
  return function noDUplicatePathValidator(control: AbstractControl): ValidationErrors | null {
    if (thisParam.folderFormGroup !== undefined) {
      if (!control.value) {
        return null;
      }
      const foldersToCheck = thisParam.cliRunnerFolderInterface.folders.folders.filter(folder => {
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
