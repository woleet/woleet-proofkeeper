import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FolderParam } from '../misc/folderParam';

@Injectable({ providedIn: 'root' })
export class FolderDoneService {
    private subject = new Subject<any>();

    sendFolderParam(folderParam: FolderParam) {
        this.subject.next(folderParam);
    }

    clearMessage() {
        this.subject.next();
    }

    getFolderParam(): Observable<FolderParam> {
        return this.subject.asObservable();
    }
}
