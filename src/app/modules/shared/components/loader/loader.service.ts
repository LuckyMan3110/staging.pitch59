import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderState } from './loader';

@Injectable()
export class LoaderService {
  private loaderSubject = new Subject<LoaderState>();

  loaderState = this.loaderSubject.asObservable();

  constructor() {
  }

  show(type: string) {
    document.body.style.overflow = 'auto';
    this.loaderSubject.next(<LoaderState>{show: true});
  }

  hide() {
    document.body.style.overflow = 'initial';
    this.loaderSubject.next(<LoaderState>{show: false});
  }
}
