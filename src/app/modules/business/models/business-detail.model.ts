import { BusinessBillingAddress } from './business-billing-address.model ';
import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { CategoryTag } from './category-tag.model';
import { BusinessHours } from './business-hours.model';
import { EducationLevel } from '../enums/education-level.enum';
import { WorkType } from '../enums/work-type.enum';
import { FolderContentRole } from '../../choosen-history/enums/folder-content-role.enum';
import { JobCityTbl, JobStateTbl } from './business-pitch.model';

export class BusinessDetails {
  accountStatus: boolean;
  address: string;
  adminEmail: string[];
  adminRole: string[];
  alias: string;
  averageCustomerRating: 0;
  averageQualityRating: 0;
  businessBillingAddress: BusinessBillingAddress;
  businessHours: BusinessHours[];
  businessId: number;
  businessLogoFilelId: string;
  businessLogoThumbnailId: string;
  businessLogoThumbnailUrl: string;
  businessName: string;
  businessStatus: number;
  businessTags: CategoryTag[];
  businessType: PitchCardType;
  calendarLink: string;
  cardDetails: any[];
  categoryName?: any;
  city: string;
  cityName?: any;
  contactNumber: string;
  createdAt: string;
  createdBy: string;
  displayName: string;
  educationalInstitutions?: CategoryTag[];
  educationLevel?: EducationLevel;
  email: string;
  employeePictureFileIds: string;
  employeePictureFileUrl: string[];
  employeePictureThumnailIds: string;
  employeePictureThumnailUrl: string[];
  facebookLink: string;
  facebookPageId: string;
  googlePageId: string;
  hasMilitaryService: boolean;
  id: string;
  instagramLink: string;
  isChoosenBusiness: boolean;
  isFavoriteBusiness: boolean;
  isHideAddress: boolean;
  isHideReviews: boolean;
  isHideTitle: boolean;
  isMirrorVideo: boolean;
  isPotentialPause: boolean;
  isVideoPlaying: boolean;
  latitude: number;
  linkedinLink: string;
  longitude: number;
  monthlyBudget: number;
  noTexting: boolean;
  pinterestLink: string;
  placeId: string;
  positions?: CategoryTag[];
  pricingModel: any;
  radius: number;
  role: FolderContentRole;
  progress: number;
  referrals: string[];
  resumeFileId: string;
  resumeFileUrl: string;
  sponsorCode: string;
  state: string;
  stripeCustomerId: string;
  stripeToken: string;
  subCategoryName?: any;
  textingNumber: string;
  title: string;
  twitterLink: string;
  updatedAt: string;
  updatedBy: string;
  useBillingAddress: boolean;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    emailId: string;
  };
  videoCoverImageFileId: string;
  videoCoverImageThumbnailId: string;
  videoCoverImageThumbnailUrl: string;
  videoFileId: string;
  videoFileUrl: string;
  videoReviewCount: number;
  videoThumbnailId: string;
  videoThumbnailUrl: string;
  websiteLink: string;
  workingHours: {
    close: {
      hours: number;
      minutes: number;
    };
    open: {
      hours: number;
      minutes: number;
    };
    weekDay: number;
  }[];
  workType?: WorkType;
  workTypes?: [
    {
      id: number;
      name: string;
      descriptors: string;
      type: number;
      status: number;
      order: number;
    }
  ];
  zip: number;
  zipFromMap: number;

  jobAddress: string;
  jobLatitude: string;
  jobLongitude: string;
  jobState: string;
  jobCity: string;
  jobZip: string;
  jobCityName: string;
  jobStateCode: string;
  benefits: CategoryTag[];
  industries: number[] | string[];
  compensationType: number | string;
  minCompensationAmount: number;
  maxCompensationAmount: number;
  isHideSalary: boolean;
  isRemote: boolean;
  showRequirements: boolean;
  compensationDescription: string;
  positionRequirements: string;
  position: string;
  organizationId: string;
  organizationName: string;

  jobCityTbl: JobCityTbl;
  jobStateTbl: JobStateTbl;
  otherApplicationLink: string;
  requireOtherApplicationMethod: boolean;

  extraPhoneNumber: string;
  isEnabledIntroText: boolean;
  introText: string;
}
