import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable } from 'rxjs';

@Injectable()
export class CustomerAnalyticsService {
  constructor(private restApiService: RestApiService) {
  }

  getContactedHistoryList(limit, offset, searchText): Observable<any> {
    return this.restApiService.get(
      'get-chosen-history-list',
      `customer-analytics/chosen-history-list?limit=${limit}&offset=${offset}&searchText=${searchText}`,
      'page-center'
    );
  }

  addReview(params): Observable<any> {
    return this.restApiService.post(
      'add-review',
      'customer-analytics/add-review',
      params,
      'page-center'
    );
  }

  getWelcomePageReviewsList(): Observable<any> {
    return this.restApiService.get(
      'get-watch-video_review-list',
      `customer-analytics/welcome-page/reviews`
    );
  }

  getROIVideo(): Observable<any> {
    return this.restApiService.get(
      'get-watch-video_review-list',
      `customer-analytics/welcome-page/roi`
    );
  }

  getSalesVideo(): Observable<any> {
    return this.restApiService.get(
      'get-watch-video_review-list',
      `customer-analytics/welcome-page/sales`
    );
  }

  getWatchedVideoReviewList(id, limit, offset, sortColumn): Observable<any> {
    return this.restApiService.get(
      'get-watch-video_review-list',
      `customer-analytics/${id}/watch-video_review-list?limit=${limit}&offset=${offset}&sortColumn=${sortColumn}`,
      'page-center'
    );
  }

  getBusinessVideoReviewList(id, config): Observable<any> {
    return this.restApiService.get(
      'get-business-video_review-list',
      `customer-analytics/${id}/reviews?${this.restApiService.convertObjToQueryParams(
        config
      )}`
    );
  }

  getAllBusinessVideoReviewList(id, config): Observable<any> {
    return this.restApiService.get(
      'get-all-review-list',
      `customer-analytics/${id}/all-reviews?${this.restApiService.convertObjToQueryParams(
        config
      )}`
    );
  }

  reportIssues(id, params): Observable<any> {
    return this.restApiService.get(
      'report-review',
      `customer-analytics/${id}/report-review?${this.restApiService.convertObjToQueryParams(
        params
      )}`,
      'page-center'
    );
  }

  respondReview(id, params): Observable<any> {
    return this.restApiService.post(
      'customer-respond',
      `customer-analytics/${id}/customer-respond`,
      params,
      'page-center'
    );
  }

  resetCustomersCount(businessId): Observable<any> {
    return this.restApiService.get(
      'reset-customer-count',
      `customer-analytics/reset-new-customer-count?businessId=${businessId}`,
      'page-center'
    );
  }

  resetReviewsCount(businessId): Observable<any> {
    return this.restApiService.get(
      'reset-customer-count',
      `customer-analytics/reset-new-review-count?businessId=${businessId}`,
      'page-center'
    );
  }

  getReportAnalytics(params): Observable<any> {
    return this.restApiService.get(
      'get-report-analytics',
      `customer-analytics/report?fromDate=${params.fromDate}&toDate=${
        params.toDate
      }&types=${params.types}${
        params.orgId ? `&orgId=${params.orgId}` : ''
      }${params.businessId ? `&businessId=${params.businessId}` : ''}`,
      'page-center'
    );
  }

  deleteTestimonial(reviewId, cacheId): Observable<any> {
    return this.restApiService.post(
      'delete-review',
      `customer-analytics/${reviewId}/delete-review${
        cacheId ? `?cacheId=${cacheId}` : ''
      }`,
      'page-center'
    );
  }

  setApproveTestimonial(reviewId, cacheId): Observable<any> {
    return this.restApiService.put(
      'set-approve-review',
      `customer-analytics/${reviewId}/change-visible${
        cacheId ? `?cacheId=${cacheId}` : ''
      }`,
      'page-center'
    );
  }

  updateNewTestimonials(data: any[], cacheId?): Observable<any> {
    return this.restApiService.post(
      'set-approve-review',
      `customer-analytics/add-viewer-review${
        cacheId ? `?cacheId=${cacheId}` : ''
      }`,
      data,
      'page-center'
    );
  }
}
