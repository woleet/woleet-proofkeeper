import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
    BrowserModule,
    FormsModule
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
