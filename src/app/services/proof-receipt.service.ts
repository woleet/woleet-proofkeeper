import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proof } from '../shared/interfaces/i-proof';
import { WoleetCliParametersService } from './woleetcliParameters.service';

@Injectable({
  providedIn: 'root',
})
export class ProofReceiptService {
  private ANCHOR_PATH = '/anchor';

  constructor(
    private http: HttpClient,
    private cli: WoleetCliParametersService
  ) {}

  createAnchor(proof: Proof, notifyByEmail = true): Observable<Proof> {
    if (!proof.notifyByEmail && notifyByEmail) {
      proof.notifyByEmail = true;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cli.getToken()}`,
      }),
    };

    return this.http.post(
      this.cli.getUrl() + this.ANCHOR_PATH,
      proof,
      httpOptions
    );
  }
}
