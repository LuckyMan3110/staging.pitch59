// dragula.service.ts
import { Injectable, EventEmitter } from '@angular/core';

/**
 * this class stubs out ng2-dragula's DragulaService for loading server-side
 * you don't need any of this functionality on the server
 */
@Injectable()
export class DragulaService {
  cancel: EventEmitter<any> = new EventEmitter();
  cloned: EventEmitter<any> = new EventEmitter();
  drag: EventEmitter<any> = new EventEmitter();
  dragend: EventEmitter<any> = new EventEmitter();
  onDrop: EventEmitter<any> = new EventEmitter();
  out: EventEmitter<any> = new EventEmitter();
  over: EventEmitter<any> = new EventEmitter();
  remove: EventEmitter<any> = new EventEmitter();
  shadow: EventEmitter<any> = new EventEmitter();
  dropModel: EventEmitter<any> = new EventEmitter();
  removeModel: EventEmitter<any> = new EventEmitter();

  add(name: string, drake: any): any {
  }

  find(name: string): any {
  }

  destroy(name: string): void {
  }

  setOptions(name: string, options: any): void {
  }

  createGroup(name: string, options: any): void {
  }

  drop(name: string): any {
  }
}
