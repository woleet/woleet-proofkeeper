import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
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

import { AppComponent } from './app.component';
import { FoldersComponent } from './folders/folders.component';
import { SettingsComponent } from './settings/settings.component';
import { StoreService } from './services/store.service';
import { FoldersConfigService } from './services/foldersConfig.service';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';
import { IdentityService } from './services/Identity.service';
import { WizardComponent } from './wizard/wizard.component';
import { LogsComponent } from './logs/logs.component';

@NgModule({
  declarations: [
    AppComponent,
    FoldersComponent,
    SettingsComponent,
    WizardComponent,
    LogsComponent
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
  ],
  providers: [
    StoreService,
    FoldersConfigService,
    WoleetCliParametersService,
    IdentityService
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    WizardComponent
  ]
})
export class AppModule { }
