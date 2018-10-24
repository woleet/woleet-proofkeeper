import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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

import { AppComponent } from './app.component';
import { FoldersComponent } from './folders/folders.component';
import { SettingsComponent } from './settings/settings.component';
import { StoreService } from './services/store.service';
import { FoldersConfigService } from './services/foldersconfig.service';
import { WoleetCliParametersService } from './services/woleetcliParameters.service';

@NgModule({
  declarations: [
    AppComponent,
    FoldersComponent,
    SettingsComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
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
    MatChipsModule
  ],
  providers: [
    StoreService,
    FoldersConfigService,
    WoleetCliParametersService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
