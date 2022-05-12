import { NgModule, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { FoldersComponent } from './folders/folders.component';
import { SettingsComponent } from './settings/settings.component';
import { ConfirmationDialogComponent } from './dialogs/confirmationDialog.component';
import { StoreService } from './services/store.service';
import { FoldersConfigService } from './services/foldersConfig.service';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';
import { IdentityService } from './services/Identity.service';
import { WizardComponent } from './wizard/wizard.component';
import { LogsComponent } from './logs/logs.component';
import { InfosComponent } from './infos/infos.component';
import { CliRunnerFolderInterface } from './services/cliRunnerFolderInterface.service';
import { DeeplinkComponent } from './deeplink/deeplink.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { from } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { TranslationService } from './services/translation.service';

// To call manually a service
export let AppInjector: Injector;

export class WebpackTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return from(import(`../assets/i18n/${lang}.ts`)).pipe(pluck('default'));
  }
}

@NgModule({
  declarations: [
    AppComponent,
    FoldersComponent,
    SettingsComponent,
    WizardComponent,
    DeeplinkComponent,
    LogsComponent,
    InfosComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatGridListModule,
    MatCardModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatExpansionModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        deps: [HttpClient],
        useClass: WebpackTranslateLoader
      }
    })
  ],
  providers: [
    StoreService,
    FoldersConfigService,
    WoleetCliParametersService,
    IdentityService,
    CliRunnerFolderInterface,
    TranslationService,
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'standard'}}
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
