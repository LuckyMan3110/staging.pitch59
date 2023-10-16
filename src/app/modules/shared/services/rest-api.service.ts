import { Injectable, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../app.settings';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';

import { LoaderService } from '../components/loader/loader.service';
import { HttpErrorHandler, HandleError } from './http-error-handler.service';
import { MessageService } from 'primeng/api';
import { isPlatformBrowser } from '@angular/common';
import { FileSaverService } from 'ngx-filesaver';
import { environment } from '../../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept-Language': AppSettings.HEADER_ACCEPT_LANGUAGE,
    'Content-Type': AppSettings.HEADER_CONTENT_TYPE,
    Accept: AppSettings.HEADER_CONTENT_TYPE
  })
};

@Injectable()
export class RestApiService {
  httpHandleError: HandleError;
  isBrowser;

  constructor(
    private httpClient: HttpClient,
    private fileSaverService: FileSaverService,
    private httpErrorHandler: HttpErrorHandler,
    private zone: NgZone,
    private router: Router,
    private storageService: StorageService,
    private loaderService: LoaderService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.httpHandleError = httpErrorHandler.createHandleError();
  }

  private prependApiUrl(url: string): string {
    return AppSettings.BASE_URL + url;
  }

  get(identifier: string, url: string, loader?: string): Observable<{}> {
    if (isPlatformBrowser(this.platformId)) {
      this.showLoader(loader);
    }
    return this.handleHttpSuccess(
      this.callerWithoutBody('get', identifier, url)
    );
  }

  post(
    identifier: string,
    url: string,
    body: any,
    loader?: string
  ): Observable<{}> {
    this.showLoader(loader);
    return this.handleHttpSuccess(
      this.callerWithBody('post', identifier, url, body)
    );
  }

  put(
    identifier: string,
    url: string,
    body?: any,
    loader?: string
  ): Observable<{}> {
    this.showLoader(loader);
    return this.handleHttpSuccess(
      this.callerWithBody('put', identifier, url, body)
    );
  }

  putFile(
    identifier: string,
    url: string,
    file: File,
    loader?: string
  ): Observable<any> {
    this.showLoader(loader);
    const head: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'events';
      context?: HttpContext;
      params?:
        | HttpParams
        | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    } = {
      headers: this.getHttpClientHeaders(),
      observe: 'events',
      params: {
        clientFilename: file.name,
        mimeType: file.type
      },
      reportProgress: true
    };

    head.headers['Content-Type'] = file.type;

    return this.httpClient
      .put(url, file, head)
      .pipe(catchError(this.httpHandleError(identifier, [])))
      .pipe(
        map((r: any) => {
          this.hideLoader();
          return r;
        })
      );
  }

  delete(
    identifier: string,
    url: string,
    loader?: string,
    body?: any
  ): Observable<{}> {
    this.showLoader(loader);
    return !body
      ? this.handleHttpSuccess(
        this.callerWithoutBody('delete', identifier, url)
      )
      : this.handleHttpSuccess(
        this.callerWithBody('delete', identifier, url, body)
      );
  }

  callerWithoutBody(
    method: string,
    identifier: string,
    url: string
  ): Observable<{}> {
    if (!this.checkInternetConenction()) {
      return;
    }

    const head = {headers: this.getHttpClientHeaders()};
    const that = this;
    if (method === 'get') {
      return this.httpClient
        .get(this.prependApiUrl(url), head)
        .pipe(catchError(this.httpHandleError(identifier, [])))
        .pipe(
          map((r: Response) => {
            that.hideLoader();
            return r;
          })
        );
    } else if (method === 'delete') {
      return this.httpClient
        .delete(this.prependApiUrl(url), head)
        .pipe(catchError(this.httpHandleError(identifier, [])))
        .pipe(
          map((r: Response) => {
            that.hideLoader();
            return r;
          })
        );
    }
  }

  callerWithBody(
    method: string,
    identifier: string,
    url: string,
    body?: any
  ): Observable<{}> {
    if (!this.checkInternetConenction()) {
      return;
    }
    const that = this;
    const head = {headers: this.getHttpClientHeaders()};
    if (method === 'put') {
      return this.httpClient
        .put(this.prependApiUrl(url), body, head)
        .pipe(catchError(this.httpHandleError(identifier, [])))
        .pipe(
          map((r: Response) => {
            that.hideLoader();
            return r;
          })
        );
    } else if (method === 'post') {
      return this.httpClient
        .post(this.prependApiUrl(url), body, head)
        .pipe(catchError(this.httpHandleError(identifier, [])))
        .pipe(
          map((r: Response) => {
            that.hideLoader();
            return r;
          })
        );
    } else if (method === 'delete') {
      const options = {
        body: body,
        headers: this.getHttpClientHeaders()
      };
      return this.httpClient
        .delete(this.prependApiUrl(url), options)
        .pipe(catchError(this.httpHandleError(identifier, [])))
        .pipe(
          map((r: Response) => {
            that.hideLoader();
            return r;
          })
        );
    }
  }

  downloadImgFile (
    identifier: string,
    url: string,
    fileName: string,
  ) {
    const head: any = {
      headers: this.getHttpClientHeaders(),
      responseType: 'blob'
    };
    return this.httpClient
      .get(environment.apiServUrl + url, head)
      .pipe(catchError(this.httpHandleError(identifier, [])))
      .pipe(
        map((blob: any) => {
          this.fileSaverService.save(blob, fileName);
        })
    );
  }

  downloadPdfFile(
    identifier: string,
    url: string,
    fileName: string,
    loader?: string
  ) {
    if (!this.checkInternetConenction()) {
      return;
    }

    this.showLoader(loader);
    const head: any = {
      headers: this.getHttpClientHeaders(),
      responseType: 'blob'
    };
    return this.httpClient
      .get(this.prependApiUrl(url), head)
      .pipe(catchError(this.httpHandleError(identifier, [])))
      .pipe(
        map((blob: any) => {
          this.fileSaverService.save(blob, fileName);
        })
      );
  }

  downloadBlobFile(url: string, loader?: string) {
    if (!this.checkInternetConenction()) {
      return;
    }

    this.showLoader(loader);
    const head: any = {responseType: 'blob'};
    return this.httpClient.get(url, head).pipe(
      catchError(this.httpHandleError('download-blob-file', [])),
      map((r: any) => {
        this.hideLoader();
        return r;
      })
    );
  }

  private getHttpClientHeaders(): HttpHeaders {
    const token = this.storageService.getItemFromCookies(
      AppSettings.TOKEN_KEY
    );
    if (token !== undefined && token !== null && token.length > 0) {
      return new HttpHeaders({
        'Accept-Language': AppSettings.HEADER_ACCEPT_LANGUAGE,
        // 'Content-Type': AppSettings.HEADER_CONTENT_TYPE,
        // 'Accept': AppSettings.HEADER_CONTENT_TYPE,
        Authorization: `Bearer ${token}`
      });

      
    }
    return new HttpHeaders({
      'Accept-Language': AppSettings.HEADER_ACCEPT_LANGUAGE,
      'Content-Type': AppSettings.HEADER_CONTENT_TYPE,
      Accept: AppSettings.HEADER_CONTENT_TYPE
    });
  }

  private handleHttpSuccess(res: Observable<{}>): Observable<{}> {
    return res;
  }

  private getContentType(fileName: string) {
    const extension = fileName
      .substring(fileName.lastIndexOf('.') + 1)
      .toLowerCase();
    switch (extension) {
      case 'jpeg':
        return 'image/jpeg';
      case 'jpg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/x-ms-bmp';
      case 'pdf':
        return 'application/pdf';
      case 'xls':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    return '';
  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(loader?: string): void {
    if (
      loader !== undefined &&
      loader !== null &&
      'none' !== loader.toLowerCase()
    ) {
      this.loaderService.show(loader);
    }
  }

  private hideLoader(): void {
    this.loaderService.hide();
  }

  // for multipart form data for upload files
  postFiles<T>(
    identifier: string,
    url: string,
    body?: any,
    loader?: string
  ): Observable<T> {
    if (!this.checkInternetConenction()) {
      return;
    }

    const that = this;
    const head = {headers: this.getHeadersFileUpload()};
    this.showLoader(loader);
    return this.httpClient
      .post(this.prependApiUrl(url), body, head)
      .pipe(catchError(this.httpHandleError(identifier, [])))
      .pipe(
        map((r: T) => {
          that.hideLoader();
          return r;
        })
      );
  }

  getHeadersFileUpload(): HttpHeaders {
    // const token = this.storageService.getItemFromCookies(AppSettings.TOKEN_KEY);
    if (
      this.storageService.getItemFromCookies(AppSettings.TOKEN_KEY) !==
      undefined &&
      this.storageService.getItemFromCookies(AppSettings.TOKEN_KEY) !==
      null &&
      this.storageService.getItemFromCookies(AppSettings.TOKEN_KEY)
        .length > 0
    ) {
      return new HttpHeaders({
        'Accept-Language': AppSettings.HEADER_ACCEPT_LANGUAGE,
        // 'Authorization': `Bearer ${token}`
        Authorization: `Bearer ${this.storageService.getItemFromCookies(
          AppSettings.TOKEN_KEY
        )}`
      });
    }
    return new HttpHeaders({
      'Accept-Language': AppSettings.HEADER_ACCEPT_LANGUAGE,
      'Content-Type': AppSettings.HEADER_CONTENT_TYPE,
      Accept: AppSettings.HEADER_CONTENT_TYPE
    });
  }

  checkInternetConenction() {
    if (this.isBrowser) {
      if (!navigator.onLine) {
        this.loaderService.hide();
        this.messageService.add({
          key: 'offline',
          severity: 'error',
          summary: 'Network connection',
          detail: 'No internet connection available.'
        });
        return false;
      } else {
        this.messageService.clear('offline');
        this.messageService.clear();
        return true;
      }
    }

    return true;
  }

  convertObjToQueryParams(params) {
    if (!params) {
      return '';
    }

    return Object.keys(params)
      .map((key) => {
        return (
          key +
          '=' +
          (params[key] || params[key] === 0
            ? encodeURIComponent(params[key])
            : '')
        );
      })
      .join('&');
  }
}
