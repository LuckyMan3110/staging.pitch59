import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable } from 'rxjs';
import { StorageService } from '../../shared/services/storage.service';
import { AppSettings } from '../../shared/app.settings';
import { CategoryTag } from '../models/category-tag.model';
import { TagType } from '../enums/tag-type.enum';
import { FullCardModel } from '../../shared/models/full-card.model';
import { AnalyticsOptionsEnum } from '../../choosen-history/pages/employer-portal/enums/analytics-options.enum';
import { CommonBindingDataService } from '../../shared/services/common-binding-data.service';
import { CompensationTypes } from '../../shared/enums/compensation-types.enum';
import { SuggestionsFilter } from '../../pitch-card-shared/components/search-result/search.service';
import { Step } from '../../create-pitch-card/create-pitch-card.service';
import { StepperItem } from '../../creation-tiles-shared/components/stepper/stepper.component';

@Injectable()
export class BusinessService {
  userEmailId: String = '';

  constructor(
    private restApiService: RestApiService,
    private commonBindingService: CommonBindingDataService,
    private storageService: StorageService
  ) {
  }

  getTagsSuggestions(
    name,
    current: CategoryTag[],
    type: TagType,
    loader = 'page-center',
    filter?: SuggestionsFilter,
    limit?: number,
    offset?: number
  ): Observable<any> {
    const params = this.restApiService.convertObjToQueryParams({
      name: name,
      type: type,
      filter: filter ? filter : null,
      limit: limit,
      offset: offset
    });
    return this.restApiService.post(
      'get-tags-suggestions',
      `tag/suggestions?${params}`,
      current,
      loader
    );
  }

  getTagsRelated(
    current: CategoryTag[],
    loader = 'page-center'
  ): Observable<any> {
    return this.restApiService.post(
      'get-tags-related',
      `tag/related`,
      current,
      loader
    );
  }

  addBusinessByBillingAndPaymentPlan(data): Observable<any> {
    return this.restApiService.post(
      'add-business-by-billing',
      `business/add-business-by-billing-and-payment-plan`,
      data,
      'page-center'
    );
  }

  addMultipleBusiness(data, numberOfBusinesses): Observable<any> {
    return this.restApiService.post(
      'add-multiple-businesses',
      `business/add-business-by-billing-and-payment-plan-count?count=${numberOfBusinesses}`,
      data,
      'page-center'
    );
  }

  updateBusiness(businessId, params): Observable<any> {
    return this.restApiService.put(
      'update-business',
      `business/${businessId}`,
      params,
      'page-center'
    );
  }

  addUpdateBusinessPaymentPlan(businessId, data): Observable<any> {
    return this.restApiService.post(
      'add-update-business-plan',
      `business/${businessId}/payment-plan`,
      data,
      'page-center'
    );
  }

  getPaymentPlan(businessId): Observable<any> {
    return this.restApiService.get(
      'get-business-plan',
      `business/${businessId}/get-payment-plan`,
      'page-center'
    );
  }

  calculateBusinessPlan(data, businessType): Observable<any> {
    return this.restApiService.post(
      'get-business-plan',
      `business/calculate-business-plan?businessType=${businessType}`,
      data,
      'page-center'
    );
  }

  requestApprove(businessId): Observable<any> {
    return this.restApiService.get(
      'request-approve',
      `business/${businessId}/request-approve`,
      'page-center'
    );
  }

  updateBusinessByIndividualParameters(businessId, params): Observable<any> {
    return this.restApiService.put(
      'update-tile',
      `business/${businessId}/tile`,
      params,
      'page-center'
    );
  }

  businessToDraft(businessId): Observable<any> {
    return this.restApiService.put(
      'business-to-draft',
      `business/${businessId}/change-to-draft`
    );
  }

  getBusinessListForLoggedInUser(limit, offset): Observable<any> {
    return this.restApiService.get(
      'business-list-loggedin-user',
      `business/get-business-list-user?limit=${limit}&offset=${offset}`,
      'page-center'
    );
  }

  getBusinessListForAnonymousUser(): Observable<any> {
    let userId = null;
    const userDetails = JSON.parse(
      this.storageService.getItem(AppSettings.USER_DETAILS)
    );
    if (userDetails) {
      userId = userDetails.userId;
    }
    return this.restApiService.get(
      'business-list-anonymous',
      `business/get-business-list?limit=5&offset=0&userId=${userId}`,
      'page-center'
    );
  }

  getBusinessDetail(businessId): Observable<any> {
    const test = this.restApiService.get(
      'get-business-detail',
      `business/${businessId}/business-profile`,
      'page-center'
    );
    return test;
  }

  getCheckout(businessId): Observable<any> {
    return this.restApiService.get(
      'get-business-detail',
      `business/get-checkout/${businessId}`,
      'page-center'
    );
  }

  getBusinessSeoTags(businessId): Observable<any> {
    return this.restApiService.get(
      'get-business-detail',
      `business/${businessId}/business-seo-tags`,
      'page-center'
    );
  }

  getBusinessAverageRating(businessId): Observable<any> {
    return this.restApiService.get(
      'get-business-average-rating',
      `business/${businessId}/average-rating`,
      'page-center'
    );
  }

  getVideoDetail(id): Observable<any> {
    return this.restApiService.get(
      'get-video-detail',
      `business/${id}/video-detail`
    );
  }

  createVideoAsset(corsUrl): Observable<any> {
    return this.restApiService.post(
      'create-video-asset',
      `business/create-video-asset`,
      {corsUrl},
      null
    );
  }

  deleteVideoAsset(assetId): Observable<any> {
    return this.restApiService.delete(
      'video-delete',
      `business/${assetId}/video-delete`
    );
  }

  getCardDetails(id): Observable<any> {
    return this.restApiService.get(
      'get-card-details',
      `business/${id}/get-card-details`
    );
  }

  deleteCard(id, data): Observable<any> {
    return this.restApiService.post(
      'delete-card',
      `business/${id}/delete-card`,
      data
    );
  }

  addNewCardDetails(id, data: FullCardModel): Observable<any> {
    return this.restApiService.post(
      'add-card',
      `business/${id}/add-card`,
      data
    );
  }

  addNewFullCardDetails(id, data): Observable<any> {
    return this.restApiService.post(
      'add-full-card',
      `business/${id}/add-card-full`,
      data
    );
  }

  createBusinessByFullCard(
    data,
    businessType: string,
    invitedId
  ): Observable<any> {
    businessType = businessType ? businessType : '';
    invitedId = invitedId ? invitedId : '';
    return this.restApiService.post(
      'add-full-card-by-new-business',
      `business/add-card-full?businessType=${businessType}&InviteId=${invitedId}`,
      data
    );
  }

  // TODO: Handled on Backend side
  // deleteFiles(fileIds): Observable<any> {
  //   return this.restApiService.delete('delete-files', `business/delete-files?fileIds=${fileIds}`, 'page-center');
  // }

  deleteUserInvite(params): Observable<any> {
    return this.restApiService.delete(
      'delete-user-invite',
      `business/delete-invite`,
      'page-center',
      params
    );
  }

  getBusinessContactDetailsV11(id): Observable<any> {
    return this.restApiService.get(
      'contact-detail',
      `business/${id}/contact-detail`,
      'page-center'
    );
  }

  getResume(): Observable<any> {
    return this.restApiService.get('get-resume', `business/get-resume`);
  }

  saveAsFavorite(id): Observable<any> {
    return this.restApiService.get(
      'customer-analytics',
      `customer-analytics/${id}/save-as-favorite`
    );
  }

  removeAsFavorite(id): Observable<any> {
    return this.restApiService.get(
      'customer-analytics',
      `customer-analytics/${id}/remove-as-favorite`,
      'page-center'
    );
  }

  watchedVideo(data, analyticId): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${analyticId}`,
      data,
      'page-center'
    );
  }

  contactBusiness(data): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${AnalyticsOptionsEnum.СontactChoosen}`,
      data,
      'page-center'
    );
  }

  scheduledBusiness(data, showLoader = false): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${AnalyticsOptionsEnum.ContactSheduled}`,
      data,
      showLoader ? 'page-center' : null
    );
  }

  shareSocialMediaAnalytics(
    data,
    analyticId,
    showLoader = false
  ): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${analyticId}`,
      data,
      showLoader ? 'page-center' : null
    );
  }

  contactCall(data, showLoader = false): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${AnalyticsOptionsEnum.ContactCall}`,
      data,
      showLoader ? 'page-center' : null
    );
  }

  contactEmail(data, showLoader = false): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${AnalyticsOptionsEnum.ContactEmail}`,
      data,
      showLoader ? 'page-center' : null
    );
  }

  contactDirections(data, showLoader = false): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${AnalyticsOptionsEnum.ContactDirections}`,
      data,
      showLoader ? 'page-center' : null
    );
  }

  shareQRCode(data, showLoader = false): Observable<any> {
    return this.restApiService.post(
      'business-chosen',
      `customer-analytics/add?analytic=${AnalyticsOptionsEnum.ShareQRCode}`,
      data,
      showLoader ? 'page-center' : null
    );
  }

  getFavoritesBusinessList(limit, offset, searchText): Observable<any> {
    return this.restApiService.get(
      'get-favorite-business-list',
      `customer-analytics/favorite-business-list?limit=${limit}&offset=${offset}&searchText=${searchText}`,
      'page-center'
    );
  }

  searchBusinesses(searchText, searchType): Observable<any> {
    const params = this.restApiService.convertObjToQueryParams({
      searchText: searchText,
      searchType: searchType
    });
    return this.restApiService.get(
      'search-businesses',
      `search/suggestions?${params}`
    );
  }

  searchCities(
    searchText,
    withState = true,
    stateId = null,
    count = 10
  ): Observable<any> {
    if (stateId) {
      const params = this.restApiService.convertObjToQueryParams({
        searchText: searchText,
        withState: withState,
        stateId: stateId,
        count: count
      });
      return this.restApiService.get(
        'search-cities',
        `search/cities?${params}`,
        null
      );
    } else {
      const params = this.restApiService.convertObjToQueryParams({
        searchText: searchText,
        withState: withState,
        count: count
      });
      return this.restApiService.get(
        'search-cities',
        `search/cities?${params}`,
        null
      );
    }
  }

  pitchFilterSearch(params, data, loader = 'page-center'): Observable<any> {
    return this.restApiService.post(
      'pitch-filter-search',
      `search?${this.restApiService.convertObjToQueryParams(params)}`,
      data,
      loader
    );
  }

  referBusiness(data, isResend = false): Observable<any> {
    // tslint:disable-next-line: max-line-length
    return this.restApiService.post(
      'refer-business',
      `user-referrals/send-invitation-to-business-owner?isResend=${isResend}`,
      data,
      'page-center'
    );
  }

  referBusinessBulk(data: any[], isResend = false): Observable<any> {
    // tslint:disable-next-line: max-line-length
    return this.restApiService.post(
      'refer-business',
      `user-referrals/send-invitation-to-business-owner/bulk?isResend=${isResend}`,
      data,
      'page-center'
    );
  }

  getPriceConfiguration(): Observable<any> {
    return this.restApiService.get(
      'price-configuration',
      `price-configuration/get-price-configuration`,
      'page-center'
    );
  }

  getBusinessReport({businessId, fromDate, toDate}): Observable<any> {
    return this.restApiService.get(
      'business-report',
      `customer-analytics/business-analytics-report-user?businessId=${businessId}&fromDate=${fromDate}&toDate=${toDate}`,
      'page-center'
    );
  }

  activateDeactiveAccountStatus(businessId, activeStatus) {
    return this.restApiService.get(
      'activate-deactivate-company-status',
      `business/${businessId}/activate-deactivate-company-status?activeStatus=${activeStatus}`,
      'page-center'
    );
  }

  inviteReferralBySendingSMS(data): Observable<any> {
    return this.restApiService.post(
      'send-sms-to-referral',
      'user-referrals/send-sms-referral-message',
      data,
      'page-center'
    );
  }

  getBusinessListForHomePageCarousel(
    limit,
    offset,
    searchText,
    activeTab
  ): Observable<any> {
    return this.restApiService.get(
      'business-list-for-home-carousel',
      `business/get-business-list-user?limit=${limit}&offset=${offset}&searchText=${searchText}&activeTab=${activeTab}`,
      'page-center'
    );
  }

  hasReferred(): Observable<any> {
    return this.restApiService.get(
      'has-referred',
      'user-referrals/referred'
    );
  }

  validateAlias(businessId: string, alias: string): Observable<any> {
    return this.restApiService.get(
      'validate-alias',
      `business/validate-alias?id=${businessId}&alias=${alias}`
    );
  }

  pausedBusiness(
    businessId: number,
    stop: boolean,
    date: number
  ): Observable<any> {
    let formattedDate;
    if (!date && date !== 0) {
      formattedDate = '';
    } else {
      formattedDate = `date=${date}`;
    }
    return this.restApiService.post(
      'paused-business',
      `business/${businessId}/paused-business?stop=${stop}&${formattedDate}`,
      null,
      'page-center'
    );
  }

  calculateBusinessProgress(
    businessId: number | string,
    organizationId: number | string
  ): Observable<any> {
    const params = this.restApiService.convertObjToQueryParams({
      businessId: businessId,
      orgId: organizationId
    });
    return this.restApiService.get(
      'get-calculate-progress',
      `business/get-calculate-progress?${params}`,
      'page-center'
    );
  }

  calculateProgressBySteps(
    stepsProgress: { step: Step; progress: boolean }[],
    steps: StepperItem[]
  ): { filledSteps: number; calculatedSteps: StepperItem[] } {
    const progressBarParams: {
      filledSteps: number;
      calculatedSteps: StepperItem[];
    } = {filledSteps: 0, calculatedSteps: []};
    if (stepsProgress?.length) {
      stepsProgress.map((spi) => {
        progressBarParams.filledSteps = spi.progress
          ? progressBarParams.filledSteps + 1
          : progressBarParams.filledSteps;
        steps.map((s) => {
          if (s.value === spi.step) {
            s.completed = spi.progress;
            s.visited = spi.progress;
          }
        });
      });
      progressBarParams.calculatedSteps = steps;
    }
    return progressBarParams;
  }

  autofillBusiness(
    businessId: number | string,
    organizationId: number | string
  ): Observable<any> {
    return this.restApiService.put(
      'autofill-business',
      `business/${businessId}/${organizationId}/autofill`,
      null
    );
  }

  getBusinessApplicants(businessId: number | string): Observable<any> {
    return this.restApiService.get(
      'get-business-applicants',
      `business/${businessId}/get-business-applicants`
    );
  }

  getIntroTextTemplate(businessType): Observable<any> {
    return this.restApiService.get(
      'get-intro-template',
      `business/${businessType}/get-introtext-template`
    );
  }

  seperateBizSearch(searchList: any[]) {
    if (searchList.length > 0) {
      // here added showHorizontalLine flag
      // for seperating category - sub category and  busienss by horizontal line
      // sort((a, b) => (a.classification - b.classification));
      const categoryAndSubCatgoryList = searchList.filter(
        (x) => x.classification !== 3
      );
      const businessList = searchList.filter(
        (x) => x.classification === 3
      );

      if (
        categoryAndSubCatgoryList.length > 0 &&
        businessList.length > 0
      ) {
        // add at first position flag showHorizontalLine
        businessList.unshift({showHorizontalLine: true});
      }

      searchList = categoryAndSubCatgoryList.concat(businessList);
    }

    return searchList;
  }

  getSelectedItemsById(allValues, selectedValues) {
    const SelectedItems = [];
    selectedValues.map((value) => {
      allValues.find((elem) => {
        if (elem.id === value.id) {
          SelectedItems.push(elem);
        }
      });
    });
    return SelectedItems;
  }

  getLocation(businessDetails) {
    if (
      businessDetails?.jobCity !== AppSettings.DEFAULT_CITY_ID &&
      businessDetails?.jobState !== AppSettings.DEFAULT_STATE_ID &&
      businessDetails?.jobCityName !== undefined &&
      businessDetails?.jobStateCode !== undefined
    ) {
      return (
        (businessDetails?.jobCityName
          ? businessDetails.jobCityName
          : '') +
        (businessDetails?.jobCityName && businessDetails?.jobStateCode
          ? ', '
          : '') +
        (businessDetails?.jobStateCode
          ? businessDetails.jobStateCode
          : '')
      );
    } else if (
      businessDetails.jobCityTbl?.id !== AppSettings.DEFAULT_CITY_ID ||
      businessDetails?.jobStateTbl?.id !== AppSettings.DEFAULT_STATE_ID
    ) {
      return (
        (businessDetails.jobCityTbl?.cityName
          ? businessDetails.jobCityTbl.cityName
          : '') +
        (businessDetails.jobCityTbl?.cityName &&
        businessDetails?.jobStateTbl?.stateCode
          ? ', '
          : '') +
        (businessDetails?.jobStateTbl?.stateCode
          ? businessDetails.jobStateTbl.stateCode
          : '')
      );
    } else {
      return '';
    }
  }

  calculateCompensationDescription(businessDetails) {
    if (
      businessDetails?.compensationDescription ||
      businessDetails?.isHideSalary
    ) {
      return businessDetails.compensationDescription;
    }

    const minAmount =
      businessDetails?.minCompensationAmount >= 0 &&
      businessDetails?.minCompensationAmount !== null &&
      businessDetails?.minCompensationAmount !== ''
        ? this.calculateAmount(businessDetails.minCompensationAmount)
        : '';
    const maxAmount =
      businessDetails?.maxCompensationAmount >= 0 &&
      businessDetails?.maxCompensationAmount !== null &&
      businessDetails?.maxCompensationAmount !== ''
        ? this.calculateAmount(businessDetails.maxCompensationAmount)
        : '';
    const perPrefix =
      businessDetails?.compensationType && (maxAmount || minAmount)
        ? this.calculatePrefix(businessDetails.compensationType)
        : '';
    const benefits = businessDetails?.benefits?.length ? '+ Benefits' : '';

    if (!minAmount || !maxAmount) {
      return `${minAmount}${maxAmount}${perPrefix} ${benefits}`;
    }

    if (
      minAmount &&
      maxAmount &&
      (businessDetails.minCompensationAmount <
        businessDetails.maxCompensationAmount ||
        businessDetails.minCompensationAmount >
        businessDetails.maxCompensationAmount)
    ) {
      return `${minAmount}-${maxAmount}${perPrefix} ${benefits}`;
    }

    if (
      minAmount &&
      maxAmount &&
      businessDetails.minCompensationAmount ===
      businessDetails.maxCompensationAmount
    ) {
      return `${maxAmount}${perPrefix} ${benefits}`;
    }
    return '';
  }

  calculateAmount(amount) {
    if (amount.toString().length >= 4 && amount.toString().length <= 6) {
      return (
        '$' + (Math.round((amount / 1_000) * 10) / 10).toFixed(1) + 'K'
      );
    }
    if (amount.toString().length >= 7 && amount.toString().length <= 9) {
      return '$' + Math.round(amount / 1_000_000) + 'M';
    }
    if (amount.toString().length >= 10 && amount.toString().length <= 12) {
      return '$' + Math.round(amount / 1_000_000_000) + 'B';
    }
    return '$' + amount;
  }

  calculatePrefix(compensationTypes) {
    if (compensationTypes === CompensationTypes.Hourly) {
      return '/HR';
    }
    if (compensationTypes === CompensationTypes.Monthly) {
      return '/MO';
    }
    if (compensationTypes === CompensationTypes.Yearly) {
      return '/YR';
    }
    return '';
  }

  downloadVideo(videoId: string): Observable<any> {
    return this.restApiService.get(
      'check-video',
      `business/${videoId}/request-video-master-public`
    );
  }

  getVideoUrl(videoId: string): Observable<any> {
    return this.restApiService.get(
      'get-video-url',
      `business/${videoId}/video-master-url-public`
    );
  }

  async downloadImage(url, name?) {
    const a = document.createElement('a');
    a.href = await this.toDataURL(url);
    a.download = name ? name : 'photo';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadPC(businessId, name?): Observable<any> {
    const filename = name ? name : 'pitchcard';
    return this.restApiService.downloadImgFile(
      "download-image", 
      `business/download-preview-image?businessId=${businessId}`,
      filename
    );
  }

  toDataURL(url) {
    return fetch(url)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        return URL.createObjectURL(blob);
      });
  }

  getBusinessTypeValue(type: string) {
    switch (type) {
      case 'employee':
        return 'Individual';
      case 'basic':
        return 'Company';
      case 'service':
        return 'Nonprofit';
      case 'job':
        return 'Job';
      default:
        return type;
    }
  }
}
