import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExitTickService {
    private subject = new Subject<any>();

    sendTick() {
        this.subject.next();
    }

    getTick(): Observable<any> {
        return this.subject.asObservable();
    }
}
