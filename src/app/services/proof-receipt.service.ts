import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proof } from '../shared/interfaces/i-proof';
import { SharedService } from './shared.service';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root',
})
export class ProofReceiptService {
  private ANCHOR_PATH = '/anchor';

  constructor(
    private http: HttpClient,
    private cli: WoleetCliParametersService,
    private sharedService: SharedService
  ) {}

  createAnchor(proof: Proof, notifyByEmail = true): Observable<Proof> {
    if (!proof.notifyByEmail && notifyByEmail) {
      proof.notifyByEmail = true;
    }

    return this.http.post(
      this.cli.getUrl() + this.ANCHOR_PATH,
      proof,
      this.sharedService.getHTTPHeaders()
    );
  }
}
