import { Component } from '@angular/core';
import { Validators, AbstractControl, FormGroup, FormBuilder, ValidationErrors, FormControl } from '@angular/forms';
import { FoldersConfigService, FolderParam } from '../services/foldersconfig.service';
import { remote } from 'electron';
import * as log from 'loglevel';
import * as nodepath from 'path';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent {

  public folders: FoldersConfigService;
  public out: string;
  public folderFormGroup: FormGroup;

  constructor(foldersConfigService: FoldersConfigService, formBuilder: FormBuilder) {
    this.folders = foldersConfigService;

    this.folderFormGroup = formBuilder.group({
      action: ['anchor', Validators.pattern('anchor|sign')],
      path: ['', [Validators.required, Validators.maxLength(160), noDUplicatePathValidatorFactory(this)]],
      private: [true],
      strict: [false],
      prune: [false],
      iDServerSignURL: [''],
      iDServerToken: [''],
      iDServerPubKey: [''],
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
    // this.folders.addFolderFromClass(this.formFolderParam);
    // this.formFolderParam = new FolderParam(this.defaultFolderParam);
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

  getErrorMessageCollidingPath() {
    if (this.folderFormGroup.get('path').getError('collidingPaths') === true) {
      return 'Folder or subfolder already present';
    }
    return null;
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
