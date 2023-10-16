import { Injectable } from '@angular/core';
import { PitchCardType } from '../../enums/pitch-card-type.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { RestApiService } from '../../services/rest-api.service';

export interface PitchPackage {
  type: PitchCardType;
  title: string;
  shortDesc: string;
  price: string;
  longDesc: string[];
  img: string;
  comingSoon?: boolean;
}

export interface Counter {
  businessCount: number;
  businessType: PitchCardType;
}

export interface BillingMethodDto {
  id: number;
  type: number;
}

export interface RequestPaymentPlan {
  discountCode?: string;
  typeCounts: Counter[];
  billingMethodDto?: BillingMethodDto;
}

export interface ResponsePaymentPlan {
  amount: number;
  price: number;
  priceWoDiscount: number;
  discountId: null;
  discountCode: string;
  counters: Counter[];
  countBusiness: number;
  countBusinessDiscountTrue: number;
  countBusinessDiscountFalse: number;
  paymentFrequency: number;
  totalPriceBusinessDiscountTrue: number;
  totalPriceBusinessDiscountFalse: number;
  discountType?: null;
  isVolumeDiscountApplied?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SelectPitchCardsService {
  constructor(
    private restApiService: RestApiService,
    private fb: FormBuilder
  ) {
  }

  getPricingPackages(): PitchPackage[] {
    return [
      // {
      //   type: PitchCardType.Basic,
      //   title: 'Company',
      //   shortDesc: 'Showcase your company and brand',
      //   longDesc: [
      //     'Represents the entire company',
      //     'Placed on Services search carousel',
      //     'Searchable, shareable, networkable',
      //     'Includes video testimonials, website, social links, etc...',
      //     'Receive messages and notifications from potential customers through FlipChat'
      //   ],
      //   img: './assets/images/welcome/intro-page/company.png'
      // },
      {
        type: PitchCardType.Employee,
        title: 'Business',
        shortDesc: 'For everyone in business',
        price: '$15/mo/each (First 30 days FREE)',
        longDesc: [
          'For sales, technicians, staff members, etc...',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from clients and potential customers through FlipChat'
        ],
        img: './assets/images/welcome/intro-page/company.png'

      },
      {
        type: PitchCardType.Job,
        title: 'Job',
        shortDesc: 'For employers currently hiring ',
        price: '$15/mo/each (First 30 days FREE)',
        longDesc: [
          'Pitch your available job position',
          'Searchable, shareable, networkable',
          'Includes employee video testimonials, website, social links, etc...',
          'Single tap application process',
          'Allows your applicants to apply with their Resume PitchCard'
        ],
        img: './assets/images/welcome/intro-page/job.png'
      },
      {
        type: PitchCardType.Service,
        title: 'Nonprofit',
        shortDesc: 'For all nonprofits, churches, charities',
        price: '$15/mo/each (First 30 days FREE)',
        longDesc: [
          'Great for churches/charities and other nonprofits spreading their cause',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from people interested in your cause through FlipChat'
        ],
        img: './assets/images/welcome/intro-page/nonprofit.png'
      },
      {
        type: PitchCardType.Resume,
        title: 'Resume',
        shortDesc: 'For those actively seeking employment',
        price: 'FREE',
        longDesc: [
          'Appeal to employers with your elevator pitch and apply to jobs with a single tap',
          'Share, network, and have your PitchCard found on the Resume Carousel',
          'Includes resume, video references, social links, and other important information',
          'Chat with employers and others on the back of your PitchCard through FlipChat',
        ],
        img: './assets/images/welcome/intro-page/resumes.png',
      },
    ];
  }

  getForm(): FormGroup {
    return this.fb.group({
      packages: this.fb.array(this.getTypeCounts()),
      discountCode: ''
    });
  }

  getTypeCounts(): any[] {
    const counters: any[] = [];
    this.getPricingPackages().map((pp) => {
      counters.push(this.fb.group({businessCount: 0, businessType: pp.type}));
    });
    return counters;
  }

  calculateNewPaymentPlan(
    data: RequestPaymentPlan,
    isOrg?: boolean,
    orgId?: string,
    isDisableAutoDiscount?: boolean,
  ): Observable<any> {
    let query = orgId
      ? `?createForOrgnization=${isOrg}&organizationId=${orgId}`
      : `?createForOrgnization=${isOrg}`;
    if (isDisableAutoDiscount){
      query += '&addAutomaticallyDiscount=false';
    }
    return this.restApiService.post(
      'get-new-plan',
      `business/calculate-business-plan-new${query}`,
      data,
      'page-center'
    );
  }

  addBusinesses(
    data: RequestPaymentPlan,
    createForOrg: boolean,
    orgId?: string
  ): Observable<any> {
    const query = orgId
      ? `?createForOrgnization=${createForOrg}&organizationId=${orgId}`
      : `?createForOrgnization=${createForOrg}`;

    return this.restApiService.post(
      'add-new-business/s',
      `business/add-business${query}`,
      data,
      'page-center'
    );
  }
}
