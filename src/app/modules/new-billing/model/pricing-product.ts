import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { ProductType } from '../../shared/components/pricing-menu-components/pricing-menu.service';

export class PricingProduct {
    isCreateCard: boolean;
    id: string;
    name: string;
    businessType: PitchCardType;
    paymentFrequency: number;
    price: number;
    referralDiscount: number;
    isDiscountAvailable: boolean;
    isActive: boolean;
    companyPriceUpToCountLimit: number;
    companyPriceOverCountLimit: number;
    limitCount: number;
    isCompanyProduct: boolean;
    type: ProductType;
    isAvailable: boolean;
    freeCountBusiness: number;
}
