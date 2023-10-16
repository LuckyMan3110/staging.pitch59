import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { AppConstantService } from './app-constant.service';
import { LoaderService } from '../components/loader/loader.service';
import { MessageService, Message } from 'primeng/api';

@Injectable()
export class UiService {
    private currentLanguage = 'en_US';

  private _languageChangeEvent = new EventEmitter<string>();

  private _sidebarToggledEvent = new Subject<string>();

  private _LoaderStateChangeEvent = new EventEmitter<string>();

  private _profileUpdateEvent = new Subject<string>();

  private defaultMessageTime = 6000;

  messageDetail: any[] = [];

  constructor(
    private loaderService: LoaderService,
    private messageService: MessageService
  ) {
  }

  changeLanguage(language: string) {
    this.currentLanguage = language;
    this._languageChangeEvent.emit(language);
  }

  get languageChangeEvent(): EventEmitter<string> {
    return this._languageChangeEvent;
  }

  changeLoaderStatus(state: string) {
    this._LoaderStateChangeEvent.emit(state);
  }

  get LoaderStatusChangeEvent(): EventEmitter<string> {
    return this._LoaderStateChangeEvent;
  }

  sidebarToggled() {
    this._sidebarToggledEvent.next();
  }

  get sidebarToggledEvent(): Subject<string> {
    return this._sidebarToggledEvent;
  }

  profileUpdated() {
    this._profileUpdateEvent.next();
  }

  get profileUpdatedEvent(): Subject<string> {
    return this._profileUpdateEvent;
  }

  /**
   *
   * @param message : Message that want to show
   * @param type : Type of message Success,Warning and Error
   * @param life : Message duration
   */
  showMessage(
    message,
    type = AppConstantService.MESSAGE_TYPE.SUCESS,
    life: number = this.defaultMessageTime
  ) {
    this.messageDetail = [];
    this.messageService.clear();
    // Message display setting.
    const messageSetting: Message = {
      severity: type,
      summary: '',
      detail: message,
      life: life
    };

    switch (type) {
      case AppConstantService.MESSAGE_TYPE.SUCESS:
        messageSetting.severity =
          AppConstantService.MESSAGE_TYPE.SUCESS;
        messageSetting.summary =
          AppConstantService.MESSAGE_SUMMARY.SUCESS;
        break;
      case AppConstantService.MESSAGE_TYPE.ERROR:
        messageSetting.severity = AppConstantService.MESSAGE_TYPE.ERROR;
        messageSetting.summary =
          AppConstantService.MESSAGE_SUMMARY.ERROR;
        break;
      case AppConstantService.MESSAGE_TYPE.WARNING:
        messageSetting.severity =
          AppConstantService.MESSAGE_TYPE.WARNING;
        messageSetting.summary =
          AppConstantService.MESSAGE_SUMMARY.WARNING;
        break;
      default:
        messageSetting.severity =
          AppConstantService.MESSAGE_TYPE.SUCESS;
        messageSetting.summary =
          AppConstantService.MESSAGE_SUMMARY.SUCESS;
        break;
    }
    this.messageService.add(messageSetting);
  }

  successMessage(
    message,
    clearPrev = true,
    key = 'main',
    life: number = this.defaultMessageTime
  ) {
    if (clearPrev) {
      this.messageService.clear();
    }
    const messageSetting: Message = {
      key: key,
      severity: AppConstantService.MESSAGE_TYPE.SUCESS,
      summary: '',
      detail: message,
      life: life
    };

    // this.messageDetail.push(messageSetting);
    this.messageService.add(messageSetting);
  }

  errorMessage(
    message,
    key = 'main',
    life: number = this.defaultMessageTime
  ) {
    this.messageService.clear();
    const messageSetting: Message = {
      key: key,
      severity: AppConstantService.MESSAGE_TYPE.ERROR,
      summary: '',
      detail: message,
      life: life
    };

    this.messageService.add(messageSetting);
  }

  warningMessage(
    message,
    key = 'main',
    life: number = this.defaultMessageTime
  ) {
    this.messageService.clear();
    const messageSetting: Message = {
      key: key,
      severity: AppConstantService.MESSAGE_TYPE.WARNING,
      summary: '',
      detail: message,
      life: life
    };

    this.messageService.add(messageSetting);
  }

  supportMessage(life: number = 60000) {
    const messageSetting: Message = {
      key: 'support',
      severity: AppConstantService.MESSAGE_TYPE.WARNING,
      summary: '',
      detail: '',
      closable: true,
      life: 60000
    };
    this.messageService.add(messageSetting);
  }

  showLoaderBar() {
    this.loaderService.show('');
  }

  hideLoaderBar() {
    this.loaderService.hide();
  }
}
