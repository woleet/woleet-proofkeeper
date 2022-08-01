import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {


  constructor(
    private cli: WoleetCliParametersService
  ) {}

  getHTTPHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cli.getToken()}`,
      }),
    };
  }
}
