import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable } from 'rxjs';
import { StorageService } from '../../shared/services/storage.service';
import { BankDetailModel } from '../../bank-details/models/bank-detail.model';

@Injectable()
export class BusinessBankService {
  userEmailId: String = '';

  constructor(
    private restApiService: RestApiService,
    private storageService: StorageService
  ) {
  }

  addNewBankAccountDetails(
    id: string,
    params: BankDetailModel
  ): Observable<any> {
    return this.restApiService.post(
      'add-new-bank-account',
      `business/${id}/bank-account`,
      params,
      null
    );
  }

  getBankAccountDetails(id): Observable<any> {
    return this.restApiService.get(
      'get-bank-account-details',
      `business/${id}/bank-account`
    );
  }

  updateBankAccountDetails(id, params: BankDetailModel): Observable<any> {
    return this.restApiService.put(
      'update-bank-details',
      `business/${id}/bank-account`,
      params,
      null
    );
  }

  deleteBankAccountDetails(id): Observable<any> {
    return this.restApiService.delete(
      'delete-bank-account-details',
      `business/${id}/bank-account`
    );
  }

  addBankDetailByNewBusiness(
    params: any,
    businessType: string,
    inviteId?
  ): Observable<any> {
    businessType = businessType ? businessType : '';
    inviteId = inviteId ? inviteId : '';
    return this.restApiService.post(
      'add-bank-detail-by-new-business',
      `business/bank-account?businessType=${businessType}&InviteId=${inviteId}`,
      params,
      null
    );
  }

  // Routes for TEAMS
  addTeamBanKAccountDetails(
    id: string,
    params: BankDetailModel
  ): Observable<any> {
    return this.restApiService.post(
      'add-team-bank-account',
      `organization/${id}/bank-account`,
      params,
      null
    );
  }

  updateTeamBankAccountDetails(id, params: BankDetailModel): Observable<any> {
    return this.restApiService.put(
      'update-team-bank-details',
      `organization/${id}/bank-account`,
      params,
      null
    );
  }
}
