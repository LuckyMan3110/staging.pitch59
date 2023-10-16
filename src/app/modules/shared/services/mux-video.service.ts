import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class MuxVideoService {
    public $onVideoPlaying: Subject<any> = new Subject();
}
