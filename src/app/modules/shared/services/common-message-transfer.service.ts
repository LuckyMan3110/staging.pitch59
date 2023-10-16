import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { ErrorDto } from '../models/error-dto';
import { ErrorResponseDto } from '../models/error-response-dto';

@Injectable()
export class CommonMessageTransferService {
  private _restAPIFieldErrorEvent = new EventEmitter<ErrorResponseDto>();
  private _restAPIGeneralErrorEvent = new EventEmitter<ErrorDto>();

  constructor() {
  }

  get restAPIGeneralErrorEvent(): EventEmitter<ErrorDto> {
    return this._restAPIGeneralErrorEvent;
  }

  get restAPIFieldErrorEvent(): EventEmitter<ErrorResponseDto> {
    return this._restAPIFieldErrorEvent;
  }

  throwFieldsError(errors: ErrorResponseDto) {
    this._restAPIFieldErrorEvent.emit(errors);
  }

  throwGeneralError(error: ErrorDto) {
    this._restAPIGeneralErrorEvent.emit(error);
  }
}
