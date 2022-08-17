import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as remote from '@electron/remote';
import { TranslateService } from '@ngx-translate/core';
import { PubKeyAddress, PubKeyAddressGroup } from '../misc/identitiesFromServer';
import {
  checkAndSubmit,
  checkwIDConnectionGetAvailableKeys
} from '../misc/settingsChecker';
import {
  noDuplicateIdentityNameValidatorFactoryOnAdd,
  noDuplicateIdentityNameValidatorFactoryOnEdit,
  tokenFormatValidator
} from '../misc/validators';
import { FoldersConfigService } from '../services/foldersConfig.service';
import { IdentityContent, IdentityService } from '../services/Identity.service';
import { LanguageService } from '../services/language.service';
import { SettingsMessageService } from '../services/settingsMessage.service';
import { ToastService } from '../services/toast.service';
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
  confirmDeleteWIDConnectionDialog = false;
  clearSaveSettingsConfirmDialog = false;
  identitySelected: IdentityContent;
  addPubKeyAddressKey: string;
  editPubKeyAddressKey: string;

  constructor(
    private cli: WoleetCliParametersService,
    private formBuilder: FormBuilder,
    public identityService: IdentityService,
    public foldersConfigService: FoldersConfigService,
    private settingsMessageService: SettingsMessageService,
    private http: HttpClient,
    public translations: TranslationService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private toastService: ToastService
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
    this.identityOpened = '';
    this.addPubKeyAddressGroup = [];
    this.editPubKeyAddressGroup = [];
    this.settingsFormGroup = this.formBuilder.group({
      token: [this.cli.getToken(), [Validators.required, tokenFormatValidator]],
      url: [this.cli.getUrl()],
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
      language: [this.cli.getLang(), [Validators.required]],
    });
  }

  onClickcheckAndSubmit() {
    checkAndSubmit(this.http, this.settingsFormGroup, this.cli, this.toastService);
  }

  onExitDialog(confirm: boolean) {
    if (confirm) {
      if (this.confirmDeleteWIDConnectionDialog) {
        this.identityService.deleteIdentity(this.identitySelected.name);
        if (this.identityService.arrayIdentityContent.length === 0) {
          this.addState = true;
        }
      }

      if (this.clearSaveSettingsConfirmDialog) {
        this.cli.store.clear();
        remote.getCurrentWebContents().reload();
      }
    }

    this.confirmDeleteWIDConnectionDialog = false;
    this.clearSaveSettingsConfirmDialog = false;
    this.identitySelected = null;
  }

  getDialogTitle() {
    if (this.confirmDeleteWIDConnectionDialog) {
      return this.translateService.instant(
        this.translations.settings.deleteIdentity
      );
    }

    if (this.clearSaveSettingsConfirmDialog) {
      return this.translateService.instant(
        this.translations.settings.resetConfig
      );
    }
  }

  getDialogText() {
    if (this.confirmDeleteWIDConnectionDialog) {
      return this.translateService.instant(
        this.translations.settings.deleteIdentityQuestion
      );
    }

    if (this.clearSaveSettingsConfirmDialog) {
      return this.translateService.instant(
        this.translations.settings.resetConfigQuestion
      );
    }
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
      this.toastService
    );
  }

  isIdentityInUse(identityName: string) {
    return this.foldersConfigService.folders.some(
      (elem) => elem.identityName === identityName
    );
  }

  async onClickEditwIDConnection() {
    await checkwIDConnectionGetAvailableKeys(
      this.http,
      this.editIdentityFormGroup.get('url').value,
      this.editIdentityFormGroup.get('token').value,
      this.editPubKeyAddressGroup,
      this.toastService
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
            this.editPubKeyAddressKey = pubKeyAddress.key;
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

  getSelectedPubKeyNameForAdd() {
    return this.identityService.getSelectedPubKeyName(
      this.addIdentityFormGroup,
      this.addPubKeyAddressKey
    );
  }

  getSelectedPubKeyNameForEdit() {
    return this.identityService.getSelectedPubKeyName(
      this.editIdentityFormGroup,
      this.editPubKeyAddressKey
    );
  }

  onPubKeyChangeAdd(pubKeyAddress: PubKeyAddress) {
    this.addPubKeyAddressKey = pubKeyAddress.key;
    this.identityService.onPubKeyChange(
      pubKeyAddress,
      this.addIdentityFormGroup,
      this.addPubKeyAddressGroup
    );
  }

  onPubKeyChangeEdit(pubKeyAddress: PubKeyAddress) {
    this.editPubKeyAddressKey = pubKeyAddress.key;
    this.identityService.onPubKeyChange(
      pubKeyAddress,
      this.editIdentityFormGroup,
      this.editPubKeyAddressGroup
    );
  }

  onLanguageChange(lang: string) {
    this.languageFormGroup.get('language').setValue(lang);
    this.cli.setWoleetCliLang(lang);
    this.translateService.use(lang);
  }
}
