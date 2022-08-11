import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLog } from '../shared/interfaces/i-user';
import { getDefaultApiUrl, SharedService } from './shared.service';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private apiURL: string;

  constructor(
    private _http: HttpClient,
    private cli: WoleetCliParametersService,
    private sharedService: SharedService
  ) {
    this.apiURL = this.cli.getUrl() || getDefaultApiUrl();
  }

  tryAnchorCallback(anchorId: string, callbackURL: string): Observable<UserLog> {
    return this._http.post<UserLog>(`${this.apiURL}/callback/try/anchor/${anchorId}`, 
    {
      callbackURL: encodeURI(callbackURL)
    },
    this.sharedService.getHTTPHeaders());
  }
}
