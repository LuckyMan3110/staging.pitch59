import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable } from 'rxjs';
import { StorageService } from '../../shared/services/storage.service';
import { AppSettings } from '../../shared/app.settings';
import { BankDetailModel } from '../models/bank-detail.model';

@Injectable()
export class UserBankService {
  userEmailId: String = '';

  constructor(
    private restApiService: RestApiService,
    private storageService: StorageService
  ) {
  }

  addNewBankAccountDetails(params: BankDetailModel): Observable<any> {
    return this.restApiService.post(
      'add-new-bank-account',
      'users/add-user-bank-details',
      params,
      'page-center'
    );
  }

  getBankAccountDetails(id): Observable<any> {
    return this.restApiService.get(
      'get-bank-account-details',
      `users/${id}/get-user-bank-detail`
    );
  }

  updateBankAccountDetails(params): Observable<any> {
    return this.restApiService.post(
      'update-user-bank-details',
      'users/update-user-bank-details',
      params,
      'page-center'
    );
  }

  deleteBankAccountDetails(id): Observable<any> {
    return this.restApiService.delete(
      'delete-bank-account-details',
      `users/${id}/delete-user-bank-detail`
    );
  }

  verifyBankAccountDetails(params): Observable<any> {
    return this.restApiService.post(
      'verify-user-bank-account',
      'users/verify-user-bank-details',
      params,
      'page-center'
    );
  }
}
