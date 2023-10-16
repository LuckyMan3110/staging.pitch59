import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { Benefits } from '../../shared/enums/benefits.enum';
import { CompensationTypes } from '../../shared/enums/compensation-types.enum';
import { CategoryTag } from './category-tag.model';
import { BusinessDetails } from './business-detail.model';

export class BusinessPitch {
  address: string;
  alias: string;
  averageCustomerRating: number = 0;
  averageQualityRating: number = 0;
  businessLogoFilelId: string;
  businessLogoThumbnailId: string;
  businessLogoThumbnailUrl: string;
  businessName: string;
  businessType: PitchCardType;
  calendarLink: string;
  categoryName?: any;
  city: string;
  cityName?: string;
  contactNumber: string;
  displayName: BusinessDetails['displayName'];
  email: string;
  employeePictureFileIds: string;
  employeePictureThumnailIds: string;
  employeePictureThumnailUrl: string[];
  facebookLink: string;
  id: string;
  index?: number | string;
  instagramLink: string;
  isChoosenBusiness: boolean;
  isFavoriteBusiness: boolean;
  isHideAddress: boolean;
  isHideTitle: boolean;
  isVideoPlaying: boolean;
  linkedinLink: string;
  minCompensationAmount: number;
  maxCompensationAmount: number;
  pinterestLink: string;
  pricingModel: any;
  isRemote: boolean;
  resumeFileUrl: string;
  state: string;
  stateCode?: string;
  stateName?: string;
  subCategoryName?: any;
  title: string;
  twitterLink: string;
  userId: string;
  videoCoverImageFileId: string;
  videoCoverImageThumbnailId: string;
  videoCoverImageThumbnailUrl: string;
  videoFileId: string;
  videoFileUrl: string;
  videoReviewCount: number;
  videoThumbnailId: string;
  videoThumbnailUrl: string;
  websiteLink: string;
  zip: string;

  benefits: Benefits[];
  compensationDescription: string;
  industries: number[] | string[];
  workTypes: any[];
  compensationTypes: CompensationTypes;
  position: string;
  positions?: CategoryTag[];
  jobCity: string;
  jobState: string;
  jobCityName: string;
  jobStateCode: string;
  jobCityTbl: JobCityTbl;
  jobStateTbl: JobStateTbl;
  showRequirements: boolean;
  positionRequirements: string;
  user: BusinessOwner;
  organizationName: string;
  organizationId: string;
}

export class BusinessPitchWrapped {
  business: BusinessPitch;
  index: number;
}

export class JobCityTbl {
  cityName: string;
  id: string;
  stateId: string;
}

export class JobStateTbl {
  id: string;
  stateName: string;
  stateCode: string;
}

export interface BusinessOwner {
  firstName: string;
  lastName: string;
}
