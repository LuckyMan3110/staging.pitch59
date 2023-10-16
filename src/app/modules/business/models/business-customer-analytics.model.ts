import { BusinessDetails } from './business-detail.model';
import { UserModel } from '../../shared/models/user.model';
import { BusinessCustomerAnalytic } from '../enums/business-customer.analytic';

export class BusinessCustomerAnalyticsModel {
  businessId: string;
  business: BusinessDetails;
  userId: string;
  user: UserModel;
  customerAnalytics: number;
  businessResponse?: any;
  ipAddress: string;
  id: string;
}
