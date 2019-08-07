import { Injectable } from '@angular/core';
import * as Store from 'electron-store';

@Injectable({
  providedIn: 'root',
})

export class StoreService {

  public store: Store<any>;

  public constructor() {
    this.store = new Store();
  }
}
