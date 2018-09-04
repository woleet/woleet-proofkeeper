import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FoldersComponent } from './folders/folders.component';
import { FoldersConfigService } from './services/foldersconfig.service';

@NgModule({
  declarations: [
    AppComponent,
    FoldersComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    FoldersConfigService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
