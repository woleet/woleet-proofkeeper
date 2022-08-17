import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { from } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { AppComponent } from './app.component';
import { DeeplinkComponent } from './deeplink/deeplink.component';
import { FoldersComponent } from './folders/folders.component';
import { InfosComponent } from './infos/infos.component';
import { LogsComponent } from './logs/logs.component';
import { CliRunnerFolderInterface } from './services/cliRunnerFolderInterface.service';
import { FoldersConfigService } from './services/foldersConfig.service';
import { IdentityService } from './services/Identity.service';
import { StoreService } from './services/store.service';
import { TranslationService } from './services/translation.service';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';
import { SettingsComponent } from './settings/settings.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { CustomSelectComponent } from './shared/components/custom-select/custom-select.component';
import { ClickOutsideDirective } from './shared/directives/click-outside.directive';
import { TooltipDirective } from './shared/directives/tooltip.directive';
import { LangPipe } from './shared/pipes/lang.pipe';
import { LogPipe } from './shared/pipes/log.pipe';
import { WizardComponent } from './wizard/wizard.component';

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
    ConfirmationDialogComponent,
    TooltipDirective,
    ClickOutsideDirective,
    CustomSelectComponent,
    LangPipe,
    LogPipe
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
    MatChipsModule,
    MatTooltipModule,
    MatIconModule,
    MatSnackBarModule,
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
