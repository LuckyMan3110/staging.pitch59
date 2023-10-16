import { BusinessDetails } from '../../../../business/models/business-detail.model';

export class OrganizationModel extends BusinessDetails {
  name: string;
  organizationStatus: number;
  color: string;
  pitchCardLogoId: string;
  pocketLogoId: string;
  useLogoForPitchCards: boolean;
  useLogoForPockets: boolean;
  ownerName: string;
  website: string;
  code: string;
  description: string;
  isTesterOrganization: boolean;
  isBillableOrganization: boolean;
  organizationLogoFilelId: string;
  organizationLogoThumbnailId: string;
  organizationLogoThumbnailUrl: string;
  autoApproveTestimonials: boolean;
  hasActiveJobCards: boolean;
  progress: number;
  businessCount: any;

  constructor(obj) {
    super();
    Object.assign(this, obj);
  }
}
