import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLog } from '../shared/interfaces/i-user';
import { SharedService } from './shared.service';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private ANCHOR_CALLBACK_URL = '/callback/try/anchor/';

  constructor(
    private _http: HttpClient,
    private cli: WoleetCliParametersService,
    private sharedService: SharedService
  ) {}

  tryAnchorCallback(anchorId: string, callbackURL: string): Observable<UserLog> {
    return this._http.post<UserLog>(`${this.cli.getUrl()}${this.ANCHOR_CALLBACK_URL}${anchorId}`, 
    {
      callbackURL: encodeURI(callbackURL)
    },
    this.sharedService.getHTTPHeaders());
  }
}
