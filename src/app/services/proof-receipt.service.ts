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
    `${this.cli.getUrl()}/anchor`,
      proof,
      this.sharedService.getHTTPHeaders()
    );
  }

  /**
   * Get the receipt with the id.
   */
  getReceiptById(anchorId: string, allowPartial?: boolean): Observable<Proof> {
    let url = `${this.cli.getUrl()}/receipt/${anchorId}`;
    if (allowPartial) {
      url += '?allowPartial=true';
    }
    return this.http.get<Proof>(url, this.sharedService.getHTTPHeaders());
  }
}
