import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { ErrorDto } from '../models/error-dto';
import { FieldErrorDto } from '../models/field-error-dto';
import { ErrorResponseDto } from '../models/error-response-dto';
import { throwError } from 'rxjs';
import { LoaderService } from '../components/loader/loader.service';
import { StorageService } from './storage.service';
import { AppSettings } from '../app.settings';
import { MessageService } from 'primeng/api';
import { CommonMessageTransferService } from './common-message-transfer.service';

export type HandleError = <T>(
  identifier?: string,
  result?: T
) => (error: HttpErrorResponse) => Observable<T>;

@Injectable()
export class HttpErrorHandler {
  constructor(
    private router: Router,
    private messageService: MessageService,
    private loaderService: LoaderService,
    private commonMsgTrasferService: CommonMessageTransferService,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ) {
  }

  createHandleError =
    () =>
      <T>(identifier = 'unknown', result = {} as T) =>
        this.handleError(identifier, result);

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * @param identifier - name of the identifier that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(identifier = 'unknown', result = {} as T) {
    return (error: HttpErrorResponse): Observable<T> => {
      this.messageService.clear();
      this.loaderService.hide();
      if (error.status === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Server Unreachable.',
          detail: 'Sorry, seems like server is unreachable.'
        });
        return throwError(result);
      }

      if (error.status === 500) {
        // this.parseFieldErrors(error, identifier, 500);
        return throwError(error.error[0] || error.error);
      }

      if (error.status === 404) {
        return throwError(error.error[0] || error.error);
      }

      if (error.status === 401) {
        this.messageService.add({
          severity: 'error',
          summary: 'Session expired',
          detail: 'Please login again to access the application.'
        });

        this.clearSession();
        if (!this.checkIfRedirectedFromEmail()) {
          this.router.navigate(['/sign-in']);
        }
        return throwError(result);
      }

      if (error.error !== undefined && error.error !== null) {
        if (error.status === 400) {
          // this.parseFieldErrors(error, identifier, 400);
          return throwError(error.error[0] || error.error);
        }
      }
      return throwError(result);
    };
  }

  manageGeneralMsg(generalDto: ErrorDto, code: number) {
    let errorHeader = 'Login Error';
    if (code === 500) {
      errorHeader = 'Server Error';
    }
    this.messageService.add({
      severity: 'error',
      summary: errorHeader,
      detail: generalDto.message
    });
    this.commonMsgTrasferService.throwGeneralError(generalDto);
  }

  parseFieldErrors(
    error: HttpErrorResponse,
    identifier: string,
    code: number
  ) {
    const fieldResponse: FieldErrorDto[] = [];
    const keys = Object.keys(error.error.errors);
    let isGeneralError = false;
    keys.forEach((key) => {
      if (isGeneralError) {
        return;
      }
      const filedErrors: ErrorDto[] = error.error.errors[key];
      if (key === 'general') {
        isGeneralError = true;
        filedErrors[0].identifier = identifier;
        this.manageGeneralMsg(filedErrors[0], code);
        return;
      }
      const dto: FieldErrorDto = new FieldErrorDto();
      dto.fieldName = key;
      dto.fielsErrors = filedErrors;
      fieldResponse.push(dto);
    });
    if (isGeneralError) {
      return;
    }
    const errorResponse: ErrorResponseDto = new ErrorResponseDto();
    errorResponse.fielsErrors = fieldResponse;
    errorResponse.identifier = identifier;
    this.commonMsgTrasferService.throwFieldsError(errorResponse);
  }

  clearSession() {
    this.storageService.removeAll();
    this.storageService.removeAllCookies();
    this.storageService.removeAllSessions();
  }

  checkIfRedirectedFromEmail() {
    // for contact history page
    /// if user hit link from email
    // then persist url in login url
    // then after log in redirect to persisted url
    const isFromEmail =
      this.activatedRoute.snapshot.queryParams.isFromEmail;
    if (isFromEmail === 'true') {
      const isContactHistoryUrl: string =
        this.router.routerState.snapshot.url;
      if (
        isContactHistoryUrl &&
        isContactHistoryUrl.includes(AppSettings.ContactHistoryUrl)
      ) {
        this.router.navigate(['/sign-in'], {
          queryParams: {
            returnUrl: this.router.routerState.snapshot.url
          }
        });

        return true;
      }
    }

    return false;
  }
}
