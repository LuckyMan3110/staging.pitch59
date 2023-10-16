import { BusinessDetails } from '../../business/models/business-detail.model';
import { ApplicantStatus } from './applicant-status';
import { BusinessPitch } from '../../business/models/business-pitch.model';

export class Applicant {
  applicantNotes: String[];
  applicantTag: {
    id: number;
    name: string;
    color: string;
  };
  id: string;
  resumeBusiness: BusinessPitch;
  resumeCardId: string;
}
