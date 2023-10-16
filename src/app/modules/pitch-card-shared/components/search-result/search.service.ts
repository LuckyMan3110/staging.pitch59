import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { RestApiService } from '../../../shared/services/rest-api.service';
import { AppSettings } from '../../../shared/app.settings';
import { StorageService } from '../../../shared/services/storage.service';

export enum SearchTypes {
    Businesses = 0,
    Resumes = 1,
    Nonprofit = 2,
    Jobs = 3
}

export enum FilterState {
    None = 0,
    Draft = 1,
    Applied = 2
}

export enum SuggestionsFilter {
  None = 0,
  NotEmptyCount = 1, // tags exist in PitchCards
  EmptyCount = 2 // tags do not exist in PitchCards
}

export interface SearchParams {
    searchText: string;
    city: string;
    zip: string;
    offsetForward: number;
    offsetBackward: number;
    forward: number;
    backward: number;
    searchId: string;
    searchType?: number | string;
}

@Injectable()
export class SearchService {
  educationLevel = [
    {value: {id: 0, name: 'None'}},
    {value: {id: 1, name: 'Less than High School Diploma'}},
    {value: {id: 2, name: 'High School Diploma / GED'}},
    {value: {id: 3, name: 'Trade School'}},
    {value: {id: 4, name: 'Some College'}},
    {value: {id: 5, name: 'Associates Degree'}},
    {value: {id: 6, name: 'Bachelors Degree'}},
    {value: {id: 7, name: 'Masters Degree'}},
    {value: {id: 8, name: 'Doctorate Degree'}}
  ];

  filterForm: any = {};
  commonFormControls: any = {};
  hasFilters: boolean = false;
  currentFilterState = FilterState.None;

  constructor(
    private restApiService: RestApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {
  }

    getFilterForm(searchType: number) {
      switch (searchType) {
        case SearchTypes.Resumes:
          return this.fb.group(this.resumeTypeForm());
        case SearchTypes.Jobs:
          return this.fb.group(this.jobTypeForm());
        default:
          return this.fb.group(this.businessTypeForm());
      }
    }

  businessTypeForm() {
    return {
      location: this.getCommonField('location'),
      numberOfReviews: this.getCommonField('numberOfReviews')
    };
  }

  resumeTypeForm() {
    return {
      location: this.getCommonField('location'),
      educationalInstitutions: [
        this.filterForm?.educationalInstitutions || []
      ],
      educationLevel: [this.filterForm?.educationLevel || []],
      workType: [this.filterForm?.workType || []],
      hasMilitaryService:
        typeof this.filterForm?.hasMilitaryService === 'boolean'
          ? this.filterForm.hasMilitaryService
          : false
    };
  }

  jobTypeForm() {
    return {
      location: this.getCommonField('location'),
      radius: this.filterForm?.radius ? this.filterForm.radius : '',
      employmentType: [this.filterForm?.employmentType || []],
      compensationTypes: [this.filterForm?.compensationTypes || []],
      industries: [this.filterForm?.industries || []],
      minCompensationAmount: this.filterForm?.minCompensationAmount
        ? this.filterForm.minCompensationAmount
        : null,
      maxCompensationAmount: this.filterForm?.maxCompensationAmount
        ? this.filterForm.maxCompensationAmount
        : null,
      benefits: [this.filterForm?.benefits || []],
      isRemote:
        typeof this.filterForm?.isRemote === 'boolean'
          ? this.filterForm.isRemote
          : false
    };
  }

  getCommonField(field) {
    return this.filterForm[field] || this.commonFormControls[field]
      ? this.filterForm[field]
        ? this.filterForm[field]
        : this.commonFormControls[field]
      : '';
  }

  getSearchType() {
    if (
      this.route.snapshot.queryParams.types &&
      this.route.snapshot.queryParams.types.includes('resume')
    ) {
      return SearchTypes.Resumes;
    } else if (
      this.route.snapshot.queryParams.types &&
      this.route.snapshot.queryParams.types.includes('job')
    ) {
      return SearchTypes.Jobs;
    } else if (
      this.route.snapshot.queryParams.types &&
      this.route.snapshot.queryParams.types.includes('nonprofit')
    ) {
      return SearchTypes.Nonprofit;
    } else if (
      this.route.snapshot.queryParams.types &&
      (this.route.snapshot.queryParams.types.includes('basic') ||
        this.route.snapshot.queryParams.types.includes('employee'))
    ) {
      return SearchTypes.Businesses;
    } else {
      return SearchTypes.Businesses;
    }
  }

  maxLengthReviews(): Observable<any> {
    return this.restApiService.get(
      'get-max-numbers-reviews',
      'search/max-length-reviews'
    );
  }

  clearFormDataFromStorage() {
    this.filterForm = {};
    this.commonFormControls = {};
    this.hasFilters = false;

    this.storageService.removeSession(AppSettings.FILTER_FORM);
    this.storageService.removeSession(AppSettings.COMMON_FILTERS);
    this.storageService.removeSession(AppSettings.FILTER_STATE);
  }

  isEmptyForm(form): boolean {
    let isEmptyForm = true;
    for (const prop in form) {
      if (!!form[prop] && !form[prop].hasOwnProperty('length')) {
        isEmptyForm = false;
      }
      if (form[prop]?.length && form[prop] !== false) {
        isEmptyForm = false;
      }
    }
    return isEmptyForm;
  }
}
