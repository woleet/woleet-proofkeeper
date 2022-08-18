import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proof } from '../shared/interfaces/i-proof';
import { ParametersForWIDSSignature } from '../shared/interfaces/i-signature-request';
import { IdentityContent } from './Identity.service';
import { SharedService } from './shared.service';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root',
})
export class SignatureRequestService {
  constructor(
    private http: HttpClient,
    private cli: WoleetCliParametersService,
    private sharedService: SharedService
  ) {}

  signHashWithWIDS(params: ParametersForWIDSSignature, identity: IdentityContent): Observable<Proof> {
    return this.http.get<Proof>(
      `${identity.apiURL}/sign` + this.sharedService.dataToURI(params),
      this.sharedService.getHTTPHeaders(identity.apiToken)
    );
  }
}
