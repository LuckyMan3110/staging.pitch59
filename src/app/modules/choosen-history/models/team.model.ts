import { UserSharedModel } from './user-shared.model';
import { BillingMethodDto } from '../../new-billing/model/billing-method-dto';

export class TeamModel {
  id?: string;
  name: string;
  color: string;
  pitchCardLogoId: string;
  pocketLogoId: string;
  pitchCardLogoUrl: string;
  pocketLogoUrl: string;
  useLogoForPitchCards: boolean;
    useLogoForPockets: boolean;
    billingType: number;
    paymentFrequency: number;

    billingMethodDto: BillingMethodDto;

    public admin: UserSharedModel;
    public count: number;
    public createdAt: string;
    public createdBy: string;
    public updatedAt: string;
    public updatedBy: string | null;
    public userRole: number;
    public users: any[];

    public businesses: any[];
}
