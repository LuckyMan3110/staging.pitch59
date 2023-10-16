import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable, of, Subject } from 'rxjs';
import { CardPackageService } from '../../cards-packages/services/card-package.service';
import { BusinessDetails } from '../../business/models/business-detail.model';
import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { AnalyticsTab } from '../pages/employer-portal/models/analytics-models.model';
import { AnalyticsTypesEnum } from '../pages/employer-portal/enums/analytics-types.enum';
import { AnalyticsOptionsEnum } from '../pages/employer-portal/enums/analytics-options.enum';
import { Step } from '../../create-pitch-card/create-pitch-card.service';
import {
  OrganizationProgress,
  UserCommonService
} from '../../shared/services/user-common.service';
import { AppSettings } from '../../shared/app.settings';
import { StorageService } from '../../shared/services/storage.service';

export enum EmployerActionsIds {
  EditEP = 0,
  Billing = 1,
  ReportEP = 2,
  Admins = 3,
  AddNewPCs = 4,
  SearchResume = 5,

  Preview = 6,
  Copy = 7,
  BusinessReport = 8,
  EditBusiness = 9
}

export enum IconStates {
  Default = 0,
  Active = 1,
  Disable = 2
}

export enum SortStatuses {
  None = 0,
  DisplayName = 1,
  Created = 2,
  Active = 3,
  Updated = 4
}

export enum AdminRole {
  Owner = 0,
  Admin = 1
}

export interface Admin {
  role: AdminRole;
  user?: {
    role?: AdminRole;
    content?: null;
    folderId?: null;
    folderContentId?: null;
    organizationId?: number;
    createdAt?: number;
    profilePictureFileId?: null;
    profilePictureThumbnailId?: null;
    profilePictureThumbnailUrl?: null;
    id: string;
    firstName?: string;
    lastName?: string;
    contactNumber?: string;
    emailId: string;
  };
  userId: string;
  userOrganizationStatus?: number;
}

export type PitchCardTypeString =
  | 'job'
  | 'resume'
  | 'basic'
  | 'employee'
  | 'service';

export interface PitchCardTypeParams {
  color: string;
  label: string;
  option: PitchCardTypeString;
  value: number;
  count: number | null;
  optionDisabled: boolean;
}

export const ALLOWED_ROLES = [1];

@Injectable()
export class EmployerPortalService {
  // Employer portal Subscriptions
  public $adminsModalsHandler: Subject<any> = new Subject<any>();
  public $choosePcTypeModalsHandler: Subject<any> = new Subject<any>();
  public $portalAnalyticsModalHandler: Subject<any> = new Subject<any>();
  public $portalBillingModalHandler: Subject<any> = new Subject<any>();
  public $editEpModalHandler: Subject<any> = new Subject<any>();
  public $applicantsModalHandler: Subject<any> = new Subject<any>();

  // Businesses Subscriptions
  public $previewModalsHandler: Subject<BusinessDetails> =
    new Subject<BusinessDetails>();
  public $updateBusinesses: Subject<PitchCardType> =
    new Subject<PitchCardType>();
  public $businessAnalyticsModalHandler: Subject<BusinessDetails> =
    new Subject<BusinessDetails>();
  public $businessTestimonialsModalHandler: Subject<boolean> =
    new Subject<boolean>();
  public $businessSearch: Subject<{ event: string; param: string }> =
    new Subject<{ event: string; param: string }>();
  public $fetchEmployerPortalInfo: Subject<boolean> = new Subject<boolean>();
  public $autofillJobCard: Subject<any> = new Subject<any>();
  public $paymentFailedModal: Subject<any> = new Subject<any>();

  public $shutDownAllModal: Subject<any> = new Subject<any>();

  mockEP = {
    name: 'Mock Employer Portal',
    admin: null,
    count: 0,
    createdAt: '1617022245135',
    createdBy: '288194877010259100',
    id: 321,
    pitchCardLogoUrl:
      'https://pitch59-prod.s3.amazonaws.com/df15dfd4eefa4538845abbc0a34542d6.jpg',
    pocketLogoUrl: null,
    updatedAt: '1617022245135',
    updatedBy: null,
    useLogoForPitchCards: true,
    businesses: this.cardPackageService.getMockOfPCs()
  };

  employeePCs =
    '[{"id":"141031783172025594","businessStatus":2,"createdAt":"1617022245135","updatedAt":"1612022245135","index":null,"videoThumbnailId":null,"videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mary Kay-Dominique R. Benson","businessType":"employee","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"https://pitch59-prod.s3.amazonaws.com/f605a866e7c84a3691355318c32910b2.png","videoCoverImageThumbnailUrl":"https://pitch59-prod.s3.amazonaws.com/481937a6d1384cfa94b45fb5c1396517.png","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null,"user":{"firstName":"Jimm","lastName":"Faherty","emailId":"faherty@gmail.com","contactNumber":null,"payPalAccount":null,"roleId":"0","fullName":null,"role":null,"referral":null,"deviceInfo":null,"id":124616734543534720}},{"id":"141031783172025594","businessStatus":2,"index":null,"createdAt":"1617022245135","updatedAt":"1612022245135","videoThumbnailId":null,"videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mary Kay-Dominique R. Benson","businessType":"employee","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"https://pitch59-prod.s3.amazonaws.com/f605a866e7c84a3691355318c32910b2.png","videoCoverImageThumbnailUrl":"https://pitch59-prod.s3.amazonaws.com/481937a6d1384cfa94b45fb5c1396517.png","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null,"user":{"firstName":"John","lastName":"Faherty","emailId":"jfaherty@gmail.com","contactNumber":null,"payPalAccount":null,"roleId":"0","fullName":null,"role":null,"referral":null,"deviceInfo":null,"id":124616734543534800}},{"id":"141031783172025594","businessStatus":2,"createdAt":"1617022245135","updatedAt":"1612022245135","index":null,"videoThumbnailId":null,"videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mary Kay-Dominique R. Benson","businessType":"employee","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"https://pitch59-prod.s3.amazonaws.com/f605a866e7c84a3691355318c32910b2.png","videoCoverImageThumbnailUrl":"https://pitch59-prod.s3.amazonaws.com/481937a6d1384cfa94b45fb5c1396517.png","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null,"user":{"firstName":"James","lastName":"Faherty","emailId":"fahertyj@gmail.com","contactNumber":null,"payPalAccount":null,"roleId":"0","fullName":null,"role":null,"referral":null,"deviceInfo":null,"id":124616734543522720}}]';
  jobPcs =
    '[{"id":"141031783172025594","businessStatus":1,"index":null,"createdAt":"1617022245135","updatedAt":"1612022245135","videoThumbnailId":null,"videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mosquito Hunters of The Woodlands and Spring","businessType":"job","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop","videoCoverImageThumbnailUrl":"https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null,"position":"Office Manager","positionRequirements":"Must have 3 years experience managing a payroll office, work well with others, and have a bachelors degree in underwater basket weaving.","employmentTypes":"1","compensationTypes":["3","1","4"],"compensationDescription":"$75R/YR+Health $75R/YR+Health $75R/YR+Health","benefits":["1","4","9","6","11"],"user":{"firstName":"Jimm","lastName":"Faherty","emailId":"faherty@gmail.com","contactNumber":null,"payPalAccount":null,"roleId":"0","fullName":null,"role":null,"referral":null,"deviceInfo":null,"id":124616734543534720}},{"id":"141031783172025594","businessStatus":2,"index":null,"videoThumbnailId":null,"createdAt":"1617022245135","updatedAt":"1612022245135","videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mosquito Hunters of The Woodlands and Spring","businessType":"job","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop","videoCoverImageThumbnailUrl":"https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null,"position":"Office Manager","positionRequirements":"Must have 3 years experience managing a payroll office, work well with others, and have a bachelors degree in underwater basket weaving.","employmentTypes":"1","compensationTypes":["3","1","4"],"compensationDescription":"$75R/YR+Health","benefits":["1","4","9","6","11"],"user":{"firstName":"John","lastName":"Faherty","emailId":"jfaherty@gmail.com","contactNumber":null,"payPalAccount":null,"roleId":"0","fullName":null,"role":null,"referral":null,"deviceInfo":null,"id":124616734543534800}},{"id":"141031783172025594","businessStatus":3,"index":null,"videoThumbnailId":null,"createdAt":"1617022245135","updatedAt":"1612022245135","videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mosquito Hunters of The Woodlands and Spring","businessType":"job","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop","videoCoverImageThumbnailUrl":"https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null,"position":"Office Manager","positionRequirements":"Must have 3 years experience managing a payroll office, work well with others, and have a bachelors degree in underwater basket weaving.","employmentTypes":"1","compensationTypes":["3","1","4"],"compensationDescription":"$75R/YR+Health","benefits":["1","4","9","6","11"],"user":{"firstName":"James","lastName":"Faherty","emailId":"fahertyj@gmail.com","contactNumber":null,"payPalAccount":null,"roleId":"0","fullName":null,"role":null,"referral":null,"deviceInfo":null,"id":124616734543522720}}]';
  activeBusinessType: {
    color: string;
    label: string;
    option: string;
    value: number;
    count: number;
    optionDisabled: boolean;
  };
  organizationProgress: number;
  businessesLoading: boolean = false;

  private _currentBusiness: BusinessDetails = null;

  constructor(
    private restApiService: RestApiService,
    private cardPackageService: CardPackageService,
    private storageService: StorageService,
    private userService: UserCommonService
  ) {
  }

  getEmployerPortalById(organizationId?: string | number): Observable<any> {
    return organizationId
      ? (this.restApiService.get(
        'get-employer-portal-by-id',
        `organization/${organizationId}`,
        'page-center'
      ) as Observable<any>)
      : (this.restApiService.get(
        'get-employer-portal',
        `organization/list`,
        'page-center'
      ) as Observable<any>);
    // TODO: Mock - this.employerPortalMock() as Observable<any>;
  }

  employerPortalMock(): Observable<any> {
    return of(this.mockEP);
  }

  createEmployerPortal(params: any): Observable<any> {
    return this.restApiService.post(
      'create-employer-portal',
      `organization`,
      params
    );
  }

  getEmployerPortalBusinesses(
    businessType: string,
    searchText: string,
    orderBy: string,
    desc: boolean,
    limit: number,
    skip: number
  ): Observable<any> {
    return this.restApiService.get(
      'organization-businesses',
      `organization/get-organization-business?businessType=${businessType}&search=${searchText}&orderBy=${orderBy}&desc=${desc}&limit=${limit}&skip=${skip}`,
      null
    );
  }

  getUpdateBusiness(businessType: string, businessId): Observable<any> {
    return this.restApiService.get(
      'organization-business',
      `organization/get-organization-business?businessType=${businessType}&businessId=${businessId}&limit=1`
    );
  }

  addAdminsToOrganization(
    organizationId: number | string,
    params
  ): Observable<any> {
    return this.restApiService.post(
      'add-organization-admins',
      `organization/${organizationId}/add-admin`,
      params,
      'page-center'
    );
  }

  removeAdminsFromOrganization(
    organizationId: number | string,
    params
  ): Observable<any> {
    return this.restApiService.post(
      'delete-admins-from-portal',
      `organization/${organizationId}/remove-admins`,
      params,
      null
    );
  }

  deleteInvitedBusinessesFromPortal(businessIds): Observable<any> {
    return this.restApiService.delete(
      'delete-business-from-portal',
      `organization/business`,
      null,
      businessIds
    );
  }

  getEmployerPortalInviteInfo(inviteId): Observable<any> {
    return this.restApiService.get(
      'get-employer-portal-info',
      `organization/invite/${inviteId}`,
      null
    );
  }

  attachPitchCard(inviteId: string, businessId: string) {
    return this.restApiService.post(
      'attach-pitch-card',
      `organization/business-by-invite?inviteId=${inviteId}`,
      [businessId]
    );
  }

  updateBusinessByIndividualParameters(
    organizationId: number | string,
    params
  ): Observable<any> {
    return this.restApiService.put(
      'update-organization-tile',
      `organization/${organizationId}/tile`,
      params,
      'page-center'
    );
  }

  addCardDetail(organizationId: number | string, params): Observable<any> {
    return this.restApiService.post(
      'add-organization-card',
      `organization/${organizationId}/add-card-full`,
      params,
      null
    );
  }

  inviteUserByEmail(
    organizationId: number | string,
    params: { email: string; businessId: number | string }
  ): Observable<any> {
    return this.restApiService.post(
      'invite-user-to-organization',
      `organization/${organizationId}/invite`,
      params,
      null
    );
  }

  updateUserEmail(
    organizationId: number | string,
    params: { email: string; businessId: number | string }
  ): Observable<any> {
    return this.restApiService.post(
      'update-user-email',
      `organization/${organizationId}/${params.businessId}/update-user-member?email=${params.email}`,
      params,
      null
    );
  }

  calculateOrganizationPlan(data): Observable<any> {
    return this.restApiService.post(
      'get-organization-plan',
      `organization/calculate-plan`,
      data,
      'page-center'
    );
  }

  setTestimonialApproveMode(orgId): Observable<any> {
    return this.restApiService.put(
      'set-testimonial-approve-mode',
      `organization/${orgId}/change-auto-approve-testimonials`,
      'page-center'
    );
  }

  joinTeamByInvite(inviteId): Observable<any> {
    return this.restApiService.post(
      'join-team-by-invite',
      `organization/invite/${inviteId}/join`,
      null
    );
  }

  initPitchCardTypeDropdown(): PitchCardTypeParams[] {
    const types = [
      PitchCardType.Job,
      PitchCardType.Basic,
      PitchCardType.Employee,
      PitchCardType.Service
    ];

    const pitchCardTypes = [];
    types.map((type, index) => {
      pitchCardTypes.push({
        option: type,
        label: type,
        value: index,
        color: ''
      });
      pitchCardTypes[index].label =
        type !== PitchCardType.Job
          ? this.getBusinessTypeValue(type) + ' PitchCard'
          : this.getBusinessTypeValue(type);

      if (type === PitchCardType.Service) {
        pitchCardTypes[index].color = '#F7CE37';
      }
      if (
        type === PitchCardType.Basic ||
        type === PitchCardType.Employee
      ) {
        pitchCardTypes[index].color = '#25AFB5';
      }
      if (type === PitchCardType.Resume) {
        pitchCardTypes[index].color = '#D52C2C';
      }
      if (type === PitchCardType.Job) {
        pitchCardTypes[index].color = '#28b256';
      }
    });

    return pitchCardTypes;
  }

  getBusinessTypeValue(type) {
    return type ? this.cardPackageService.getBusinessTypeValue(type) : '';
  }

  calculateOrderPitchCardTypes(businessCountConfig, pitchCardTypes) {
    if (pitchCardTypes?.length && businessCountConfig) {
      pitchCardTypes.map((card) => {
        card.count = businessCountConfig[card.option];
      });

      return pitchCardTypes.sort((a, b) =>
        a.count < b.count || a.count === b.count ? 1 : -1
      );
    }
  }

  getEPActions(showAdditionalActions, isAvailable) {
    return [
      {
        src: '../../../../../../assets/images/my-account-images/team-page/team-edit-default.svg',
        title: 'Edit',
        hide: false,
        id: EmployerActionsIds.EditEP
      },
      {
        src: '../../../../../../assets/images/my-account-images/team-page/statements.svg',
        title: 'Billing',
        hide: false,
        id: EmployerActionsIds.Billing
      },
      // { src: '../../../../../../assets/images/my-account-images/team-page/reports.svg', title: 'Reports', hide: false, id: EmployerActionsIds.ReportEP },
      {
        src: '../../../../../../assets/images/my-account-images/team-page/admin-user.svg',
        title: 'Admins',
        hide: false,
        id: EmployerActionsIds.Admins
      },
      // { src: '', title: 'Add PCs', hide: showAdditionalActions, id: EmployerActionsIds.AddNewPCs },
      {
        src: '',
        title: 'Resume',
        hide: showAdditionalActions || isAvailable,
        id: EmployerActionsIds.SearchResume
      }
    ];
  }

  getIconActions(pitchCardType) {
    return [
      {
        src: '../../../../../assets/images/my-account-images/organization-images/preview-',
        iconId: EmployerActionsIds.Preview,
        title: 'Preview',
        state: IconStates.Default,
        hide: false,
        field: '',
        header: '',
        sort: false,
        fixWidth: '40%',
        resize: true
      },
      {
        src: '../../../../../assets/images/my-account-images/organization-images/copy-link-',
        iconId: EmployerActionsIds.Copy,
        title: 'Copy Link',
        state: IconStates.Default,
        hide: false,
        field: '',
        header: '',
        sort: false,
        fixWidth: '40%',
        resize: true
      },
      {
        src: '../../../../../assets/images/my-account-images/organization-images/analytics-',
        iconId: EmployerActionsIds.BusinessReport,
        title: 'Analytics',
        state: IconStates.Default,
        hide: false,
        field: '',
        header: '',
        sort: false,
        fixWidth: '40%',
        resize: true
      },
      {
        src: '../../../../../assets/images/my-account-images/organization-images/edit-',
        iconId: EmployerActionsIds.EditBusiness,
        title: 'Edit',
        state: IconStates.Default,
        hide: false,
        field: '',
        header: '',
        sort: false,
        fixWidth: '40%',
        resize: true
      }
    ];
  }

  chartsAllTabsData(): AnalyticsTab[] {
    return [
      {
        name: AnalyticsTypesEnum.Shared,
        active: true,
        columns: [
          {
            name: 'Quick Share',
            types: [AnalyticsOptionsEnum.ShareQuickShare]
          },
          {
            name: 'Text',
            types: [AnalyticsOptionsEnum.ShareText]
          },
          {
            name: 'Social Media',
            types: [
              AnalyticsOptionsEnum.ShareFacebook,
              AnalyticsOptionsEnum.ShareLinkedin,
              AnalyticsOptionsEnum.ShareTwitter,
              AnalyticsOptionsEnum.ShareInstagram,
              AnalyticsOptionsEnum.SharePinterest
            ]
          },
          {
            name: 'Email',
            types: [AnalyticsOptionsEnum.ShareEmail]
          },
          {
            name: 'Other',
            types: [AnalyticsOptionsEnum.ShareQRCode]
          }
        ]
      },
      {
        name: AnalyticsTypesEnum.Contacted,
        active: false,
        columns: [
          {
            name: 'Call',
            types: [AnalyticsOptionsEnum.ContactCall]
          },
          {
            name: 'Email',
            types: [AnalyticsOptionsEnum.ContactEmail]
          },
          {
            name: 'Text',
            types: [AnalyticsOptionsEnum.СontactChoosen]
          },
          {
            name: 'Schedule',
            types: [AnalyticsOptionsEnum.ContactSheduled]
          },
          {
            name: 'Video Review',
            types: [AnalyticsOptionsEnum.ContactDirections]
          }
        ]
      },
      {
        name: AnalyticsTypesEnum.VideoViewed,
        active: false,
        columns: [
          {
            name: '0-10',
            types: [AnalyticsOptionsEnum.Watched0Plus]
          },
          {
            name: '11-30',
            types: [AnalyticsOptionsEnum.Watched15Plus]
          },
          {
            name: '30-45',
            types: [AnalyticsOptionsEnum.Watched30Plus]
          },
          {
            name: '45+',
            types: [AnalyticsOptionsEnum.Watched45Plus]
          }
        ]
      },
      {
        name: AnalyticsTypesEnum.Pocketed,
        active: false,
        columns: [
          {
            name: 'Added to Pocket',
            types: [AnalyticsOptionsEnum.PocketAdded]
          },
          {
            name: 'Removed from Pocket',
            types: [AnalyticsOptionsEnum.PocketRemoved]
          }
        ]
      }
    ];
  }

  setCurrentBusiness(business: BusinessDetails): void {
    this._currentBusiness = {...business};
  }

  getCurrentBusiness(): BusinessDetails {
    return {...this._currentBusiness};
  }

  updateOrganizationProgress(totalPitchCards) {
    const processFromStorage: OrganizationProgress =
      this.storageService.getItem(
        AppSettings.ORGANIZATION_PROGRESS,
        true
      );
    if (processFromStorage) {
      processFromStorage.businessCount = totalPitchCards;
      this.storageService.setItem(
        AppSettings.ORGANIZATION_PROGRESS,
        processFromStorage
      );
    }
    if (this.userService?.userOrganizationProgress?.length) {
      this.userService.userOrganizationProgress[0].businessCount =
        totalPitchCards;
    }
  }
}
