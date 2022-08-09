import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as remote from '@electron/remote';
import { TranslateService } from '@ngx-translate/core';
import * as fs from 'fs';
import * as log from 'loglevel';
import * as path from 'path';
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog.component';
import { FolderParam } from '../misc/folderParam';
import { PubKeyAddressGroup } from '../misc/identitiesFromServer';
import {
  checkAndSubmit,
  checkwIDConnectionGetAvailableKeys,
  storeManualActionsFolder
} from '../misc/settingsChecker';
import {
  noDuplicateIdentityNameValidatorFactoryOnAdd,
  noDuplicateIdentityNameValidatorFactoryOnEdit,
  tokenFormatValidator
} from '../misc/validators';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { IdentityService } from '../services/Identity.service';
import { LanguageService } from '../services/language.service';
import { SettingsMessageService } from '../services/settingsMessage.service';
import { adaptPath, SharedService } from '../services/shared.service';
import { StoreService } from '../services/store.service';
import { TranslationService } from '../services/translation.service';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  public addState: boolean;
  public identityOpened: string;
  public settingsFormGroup: FormGroup;
  public addIdentityFormGroup: FormGroup;
  public editIdentityFormGroup: FormGroup;
  public languageFormGroup: FormGroup;
  public addPubKeyAddressGroup: PubKeyAddressGroup[];
  public editPubKeyAddressGroup: PubKeyAddressGroup[];
  private settingsMessageSubscription: any;
  public languages: Array<string>;
  DEFAULT_VALUE_MANUAL_OPERATION_FOLDER: string;

  constructor(
    private cli: WoleetCliParametersService,
    private storeService: StoreService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    public identityService: IdentityService,
    public foldersConfigService: FoldersConfigService,
    private settingsMessageService: SettingsMessageService,
    private dialog: MatDialog,
    private http: HttpClient,
    public translations: TranslationService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private sharedService: SharedService
  ) {
    this.initComponent();
    this.languages = this.languageService.getSupportedLanguages();
  }

  ngOnInit() {
    this.settingsMessageSubscription = this.settingsMessageService
      .getMessage()
      .subscribe((message) => {
        if (message === 'update') {
          this.initComponent();
        }
      });
  }

  ngOnDestroy() {
    this.settingsMessageSubscription.unsubscribe();
  }

  initComponent() {
    this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER =
      this.storeService.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER;
    this.identityOpened = '';
    this.addPubKeyAddressGroup = [];
    this.editPubKeyAddressGroup = [];
    this.settingsFormGroup = this.formBuilder.group({
      token: [this.cli.getToken(), [Validators.required, tokenFormatValidator]],
      url: [this.cli.getUrl()],
      [this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER]: [
        this.storeService.getProofReceiptsOfManualOperationsFolder(),
        [Validators.required],
      ],
    });

    if (this.identityService.arrayIdentityContent.length === 0) {
      this.addState = true;
    } else {
      this.addState = false;
    }

    this.addIdentityFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          noDuplicateIdentityNameValidatorFactoryOnAdd(this),
        ],
      ],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', [Validators.required]],
    });

    this.editIdentityFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          noDuplicateIdentityNameValidatorFactoryOnEdit(this),
        ],
      ],
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
      pubKey: ['', [Validators.required]],
    });

    this.languageFormGroup = this.formBuilder.group({
      language: [this.storeService.getLang(), [Validators.required]],
    });
  }

  onClickCheckAndSubmit() {
    const oldPath =
      this.storeService.getProofReceiptsOfManualOperationsFolder();
    const newPath = this.settingsFormGroup.get(
      this.DEFAULT_VALUE_MANUAL_OPERATION_FOLDER
    ).value;

    if (oldPath !== newPath) {
      this.updateFolderPathInFolderList(oldPath, newPath);
      this.moveProofReceipts(oldPath, newPath);
      storeManualActionsFolder(newPath, this.storeService);
    }

    checkAndSubmit(
      this.http,
      this.settingsFormGroup,
      this.cli,
      this.snackBar,
      null
    );
  }

  updateFolderPathInFolderList(oldPath: string, newPath: string) {
    let anchorFolder: FolderParam;
    let signFolder: FolderParam;
    try {
      anchorFolder = this.foldersConfigService.getFolderParamFromActionPath(
        'anchor',
        oldPath
      );
      anchorFolder.path = newPath;
      this.foldersConfigService.updateFolderOptions(anchorFolder);
    } catch (e) {
      log.error(e);
    }

    try {
      signFolder = this.foldersConfigService.getFolderParamFromActionPath(
        'sign',
        oldPath
      );
      signFolder.path = newPath;
      this.foldersConfigService.updateFolderOptions(signFolder);
    } catch (e) {
      log.error(e);
    }
  }

  moveProofReceipts(oldPath: string, newPath: string) {
    fs.readdir(oldPath, (err, files) => {
      files.forEach((file) => {
        const currentPath = adaptPath(path.join(oldPath, file));
        const destinationPath = adaptPath(path.join(newPath, file));
        if (path.extname(file) === '.json') {
          fs.rename(currentPath, destinationPath, (err) => {
            if (err) throw err;
          });
        }
      });
    });
  }

  openClearSaveSettingsConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.confirmationTitle =
      this.translateService.instant(this.translations.settings.resetConfig);
    dialogRef.componentInstance.confirmationText =
      this.translateService.instant(
        this.translations.settings.resetConfigQuestion
      );
    dialogRef.afterClosed().subscribe((confirmDelete) => {
      if (confirmDelete === true) {
        this.cli.store.clear();
        remote.getCurrentWebContents().reload();
      }
    });
  }

  addNewIdentityFormGroup() {
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
    this.addIdentityFormGroup.patchValue({ url: tempURL });
    this.addIdentityFormGroup.patchValue({ token: tempToken });
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
    const currentIdentity = this.identityService.arrayIdentityContent.filter(
      (elem) => elem.name === editIdentityName
    )[0];
    this.editIdentityFormGroup.reset();
    this.editIdentityFormGroup.patchValue({ name: currentIdentity.name });
    this.editIdentityFormGroup.patchValue({ url: currentIdentity.apiURL });
    this.editIdentityFormGroup.patchValue({ token: currentIdentity.apiToken });
    this.editIdentityFormGroup.patchValue({
      pubKey: currentIdentity.publicKey,
    });
    this.identityOpened = editIdentityName;
  }

  saveEditForm() {
    this.identityService.updateIdentity(
      this.foldersConfigService,
      this.identityOpened,
      this.editIdentityFormGroup.get('name').value,
      this.editIdentityFormGroup.get('url').value,
      this.editIdentityFormGroup.get('token').value,
      this.editIdentityFormGroup.get('pubKey').value
    );
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
    checkwIDConnectionGetAvailableKeys(
      this.http,
      this.addIdentityFormGroup.get('url').value,
      this.addIdentityFormGroup.get('token').value,
      this.addPubKeyAddressGroup,
      this.snackBar
    );
  }

  isIdentityInUse(identityName: string) {
    return this.foldersConfigService.folders.some(
      (elem) => elem.identityName === identityName
    );
  }

  openConfirmDeleteWIDConnectionDialog(identityName: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.confirmationTitle =
      this.translateService.instant(this.translations.settings.deleteIdentity);
    dialogRef.componentInstance.confirmationText =
      this.translateService.instant(
        this.translations.settings.deleteIdentityQuestion
      );
    dialogRef.afterClosed().subscribe((confirmDelete) => {
      if (confirmDelete === true) {
        this.identityService.deleteIdentity(identityName);
        if (this.identityService.arrayIdentityContent.length === 0) {
          this.addState = true;
        }
      }
    });
  }

  async onClickEditwIDConnection() {
    await checkwIDConnectionGetAvailableKeys(
      this.http,
      this.editIdentityFormGroup.get('url').value,
      this.editIdentityFormGroup.get('token').value,
      this.editPubKeyAddressGroup,
      this.snackBar
    );
    if (
      this.editPubKeyAddressGroup.length !== 0 &&
      this.editIdentityFormGroup.get('pubKey')
    ) {
      this.editIdentityFormGroup
        .get('pubKey')
        .setErrors({ unableToFindOldKey: true });
      const match = this.editPubKeyAddressGroup.some((pubKeyAddressGroup) => {
        return pubKeyAddressGroup.pubKeyAddress.some((pubKeyAddress) => {
          if (
            pubKeyAddress.address ===
            this.editIdentityFormGroup.get('pubKey').value
          ) {
            return true;
          }
        });
      });
      if (match) {
        this.editIdentityFormGroup
          .get('pubKey')
          .setErrors({ unableToFindOldKey: false });
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

  onPubKeyChangeAdd() {
    let replaceName = false;
    let newName = '';
    if (!this.addIdentityFormGroup.get('name').value) {
      replaceName = true;
    }
    if (
      this.addPubKeyAddressGroup.length !== 0 &&
      this.addIdentityFormGroup.get('pubKey')
    ) {
      this.addPubKeyAddressGroup.forEach((pubKeyAddressGroup) => {
        if (
          pubKeyAddressGroup.user ===
          this.addIdentityFormGroup.get('name').value
        ) {
          replaceName = true;
        }
        pubKeyAddressGroup.pubKeyAddress.forEach((pubKeyAddress) => {
          if (
            pubKeyAddress.address ===
            this.addIdentityFormGroup.get('pubKey').value
          ) {
            newName = pubKeyAddressGroup.user;
          }
        });
      });
    }
    if (replaceName && newName) {
      this.addIdentityFormGroup.patchValue({ name: newName });
    }
  }

  onPubKeyChangeEdit() {
    let replaceName = false;
    let newName = '';
    if (!this.editIdentityFormGroup.get('name').value) {
      replaceName = true;
    }
    if (
      this.editPubKeyAddressGroup.length !== 0 &&
      this.editIdentityFormGroup.get('pubKey')
    ) {
      this.editPubKeyAddressGroup.forEach((pubKeyAddressGroup) => {
        if (
          pubKeyAddressGroup.user ===
          this.editIdentityFormGroup.get('name').value
        ) {
          replaceName = true;
        }
        pubKeyAddressGroup.pubKeyAddress.forEach((pubKeyAddress) => {
          if (
            pubKeyAddress.address ===
            this.editIdentityFormGroup.get('pubKey').value
          ) {
            newName = pubKeyAddressGroup.user;
          }
        });
      });
    }
    if (replaceName && newName) {
      this.editIdentityFormGroup.patchValue({ name: newName });
    }
  }

  onLanguageChange() {
    this.storeService.setLang(this.languageFormGroup.get('language').value);
    this.translateService.use(this.languageFormGroup.get('language').value);
  }

  onClickPopUpDirectory(type: string) {
    this.sharedService.openPopupDirectory(
      this.settingsFormGroup,
      type,
      this.settingsFormGroup.get(type).value
    );
  }

  resetPath(type: string) {
    this.sharedService.resetPath(this.settingsFormGroup, type);
  }
}
