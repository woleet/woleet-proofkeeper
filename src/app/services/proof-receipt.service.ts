import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proof } from '../shared/interfaces/i-proof';
import { getDefaultApiUrl, SharedService } from './shared.service';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root',
})
export class ProofReceiptService {

  private apiURL: string;

  constructor(
    private http: HttpClient,
    private cli: WoleetCliParametersService,
    private sharedService: SharedService
  ) {
    this.apiURL = this.cli.getUrl() || getDefaultApiUrl();
  }

  createAnchor(proof: Proof, notifyByEmail = true): Observable<Proof> {
    if (!proof.notifyByEmail && notifyByEmail) {
      proof.notifyByEmail = true;
    }

    return this.http.post(
    `${this.apiURL}/anchor`,
      proof,
      this.sharedService.getHTTPHeaders()
    );
  }

  /**
   * Get the receipt with the id.
   */
  getReceiptById(anchorId: string, allowPartial?: boolean): Observable<Proof> {
    let url = `${this.apiURL}/receipt/${anchorId}`;
    if (allowPartial) {
      url += '?allowPartial=true';
    }
    return this.http.get<Proof>(url, this.sharedService.getHTTPHeaders());
  }
}
