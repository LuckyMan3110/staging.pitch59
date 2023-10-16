import { Injectable } from '@angular/core';
import { ApplicantStatuses } from './enums/applicant-statuses.enum';
import { ApplicantStatus } from './models/applicant-status';
import { RestApiService } from '../shared/services/rest-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicantViewerService {
  ApplicantStatuses: [] = [];

  constructor(private restApiService: RestApiService) {
  }

  getApplicantStatuses(organizationId): Observable<{}> {
    return this.restApiService.get(
      'get-organization-applicant-statuses',
      `business/${organizationId}/get-applicant-tags`,
      'page-center'
    );
  }

  setApplicantStatus(applicantId, applicantTagId): Observable<any> {
    return this.restApiService.put(
      'update-tag',
      `business/${applicantId}/${applicantTagId}/update-tag`,
      'page-loader'
    );
  }

  getDefaultApplicantStatuses(): ApplicantStatus[] {
    return [
      {
        id: ApplicantStatuses.Maybe,
        name: 'Maybe',
        color: '#CAB24C'
      },
      {
        id: ApplicantStatuses.Interview,
        name: 'Interview',
        color: '#638F68'
      },
      {
        id: ApplicantStatuses.Hired,
        name: 'Hired',
        color: '#3B93BE'
      },
      {
        id: ApplicantStatuses.Rejected,
        name: 'Rejected',
        color: '#000000FF'
      },
      {
        id: ApplicantStatuses.NotTagged,
        name: 'Not Tagged',
        color: ''
      }
    ];
  }

  createNewStatus(
    organizationId: Number,
    name: string,
    color: string
  ): Observable<any> {
    return this.restApiService.post(
      'create-applicant-tag',
      `business/${organizationId}/applicant-tag?name=${name}&color=${color}`,
      'page-loader'
    );
  }

  applicantViewAll(applicantIds: Number[]): Observable<any> {
    return this.restApiService.post(
      'applicant-viewed-bulk',
      `business/applicant-viewed-bulk`,
      applicantIds,
      'page-loader'
    );
  }
}
