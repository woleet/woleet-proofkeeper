import { Component } from '@angular/core';
import { Validators, AbstractControl, FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { FoldersConfigService, FolderDesc } from '../services/foldersConfig.service';
import { FolderParam } from '../misc/folderParam';
import { remote } from 'electron';
import * as log from 'loglevel';
import * as nodepath from 'path';
import { IdentityService } from '../services/Identity.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent {

  public folders: FoldersConfigService;
  public out: string;
  public folderFormGroup: FormGroup;

  constructor(foldersConfigService: FoldersConfigService, formBuilder: FormBuilder, public identityService: IdentityService) {
    this.folders = foldersConfigService;

    this.folderFormGroup = formBuilder.group({
      action: ['anchor', Validators.pattern('anchor|sign')],
      path: ['', [Validators.required, Validators.maxLength(160), noDUplicatePathValidatorFactory(this)]],
      private: [true],
      strict: [false],
      prune: [false],
      recursive: [false],
      identity: ['', identityCheckerFactory(this)],
      iDServerUnsecureSSL: [false],
    });
  }

  onClickPopUpDirectory() {
    let path: string;
    try {
      path = remote.dialog.showOpenDialog({properties: ['openDirectory']})[0];
      const pathlenght: number = path.split(nodepath.sep).join('').length;
      log.info(`Path lenght: ${pathlenght}`);
    } catch (error) {
      path = '';
    } finally {
      this.folderFormGroup.patchValue({path: path});
      log.info(`Setting folder: ${this.folderFormGroup.get('path').value}`);
    }
  }

  onClickAdd() {
    const folderToAdd: FolderDesc = {
      path: this.folderFormGroup.get('path').value as string,
      action: this.folderFormGroup.get('action').value as string,
      privateparam: this.folderFormGroup.get('private').value as boolean,
      strict: this.folderFormGroup.get('strict').value as boolean,
      prune: this.folderFormGroup.get('prune').value as boolean,
      recursive: this.folderFormGroup.get('recursive').value as boolean,
      identityName: this.folderFormGroup.get('identity').value as string,
      iDServerUnsecureSSL: this.folderFormGroup.get('iDServerUnsecureSSL').value as boolean,
    };
    this.folders.addFolderFromInterface(folderToAdd);
    this.folderFormGroup.reset({
      action: 'anchor',
      path: '',
      private: true,
    });
  }

  onClickDelete(folder: FolderParam) {
    try {
      this.folders.deleteFolder(folder);
    } catch (error) {
      log.error(error);
    }
  }

  resetPath() {
    this.folderFormGroup.patchValue({path: ''});
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
        return {collidingPaths: true};
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
      return {voidIdentity: true};
    }
    if (!thisParam.identityService.arrayIdentityContent.some(elem => elem.name === control.value)) {
      return {identityNotFound: true};
    }
    return null;
  };
}
