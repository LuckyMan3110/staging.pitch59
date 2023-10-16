import { Injectable } from '@angular/core';

import { StorageService } from '../../shared/services/storage.service';

import { AppSettings } from '../../shared/app.settings';
import { CardPackage } from '../models/card-package.model';
import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { Observable, Subject } from 'rxjs';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Router } from '@angular/router';

@Injectable()
export class CardPackageService {
  scaleFactor: Subject<number> = new Subject();
  DEFAULT_PADDINGS = 30;
  SAFARI_BOTTOM_BAR = 50;

  constructor(
    public storageService: StorageService,
    private restApiService: RestApiService,
    private router: Router
  ) {
  }
    private cardPackages: CardPackage[] = [
        new CardPackage(
          PitchCardType.Service,
          'personal',
          'nonprofit',
          19,
          189,
          0,
          '#F7CE37',
          [
            'Shareable PitchCard',
            'Analytics',
            'Video Testimonials',
            'Unlimited Pocket Marketing'
          ]
        ),
        new CardPackage(
          PitchCardType.Resume,
          'personal',
          'resume',
          0,
          0,
          0,
          '#D52C2C',
          [
            'Shareable PitchCard',
            'Analytics',
            'Video Reviews',
            'Unlimited Pocket Marketing'
          ]
        ),
        new CardPackage(
          PitchCardType.Employee,
          'business',
          'employee',
          19,
          189,
          79,
          '#47B5B7',
          [
            'Shareable PitchCard',
            'Analytics',
            'Video Reviews',
            'Unlimited Pocket Marketing'
          ]
        ),
        new CardPackage(
          PitchCardType.Basic,
          'business',
          'business basic',
          35,
          349,
          99,
          '#47B5B7',
          [
            'Shareable PitchCard',
            'Analytics',
            'Video Reviews',
            'Unlimited Pocket Marketing',
            'Search Engine Placement',
            'Ratings'
          ]
        ),
        new CardPackage(
          PitchCardType.Premium,
          'business',
          'premium',
          59,
          589,
          200,
          '#47B5B7',
          [
            'Shareable PitchCard',
            'Analytics',
            'Video Reviews',
            'Unlimited Pocket Marketing',
            'Search Engine Placement',
            'Ratings',
            'Doors',
            'Multi Video'
          ],
            true
        ),
        new CardPackage(
          PitchCardType.Job,
          'job',
          'job',
          49,
          99,
          79,
          '#28B256',
          [''],
          true
        )
    ];

    private selectedProduct: any;
    private virtualVideoPrice = 149;
    private virtualVideoDiscountPrice = 50;

    getCardPackages() {
        return [...this.cardPackages];
    }

    getMockOfPCs() {
        return JSON.parse(AppSettings.demoPitchCardsList);
    }

  getPackageDescription() {
    return [
      'For churches, charities, and other nonprofits.',
      'For people seeking employment.',
      'For sales reps, technicians, assistants, secretaries, etc...',
      'For businesses of all sizes.',
      'For organizations who are hiring.'
    ];
  }

  getActivePricingByBusinessType(
    businessType?,
    paymentFrequency?,
    productType?
  ): Observable<any> {
    businessType = businessType ? `businessType=${businessType}` : '';
    paymentFrequency = paymentFrequency
      ? businessType
        ? '&' + `paymentFrequency=${paymentFrequency}`
        : `paymentFrequency=${paymentFrequency}`
      : '';
    productType = productType
      ? paymentFrequency || businessType
        ? '&' + `type=${productType}`
        : `type=${productType}`
      : '';
    return this.restApiService.get(
      'get-active-pricing',
      `products/active-pricing?${businessType}${paymentFrequency}${productType}`,
      'page-center'
    );
  }

    getActivePricingByPaymentFrequency(paymentFrequency): Observable<any> {
      paymentFrequency = paymentFrequency
        ? `?paymentFrequency=${paymentFrequency}`
        : '';
      return this.restApiService.get(
        'get-active-pricing',
        `products/active-pricing${paymentFrequency}`,
        'page-center'
      );
    }

    selectPackage(selectedProduct: any) {
      this.storageService.setSession(AppSettings.DRAFT_BUSINESS_ID, null);
      this.selectedProduct = selectedProduct;
      this.selectedType = selectedProduct.businessType
        ? selectedProduct.businessType
        : selectedProduct.type;
    }

    getSelectedPackage() {
        return this.selectedProduct;
    }

    getVirtualVideoPrice() {
        return this.virtualVideoPrice;
    }

    getVirtualVideoDiscountPrice() {
        return this.virtualVideoDiscountPrice;
    }

    getBusinessTypeValue(type: string) {
        switch (type) {
            case PitchCardType.Employee:
                return 'Individual';
            case PitchCardType.Basic:
                return 'Company';
            case PitchCardType.Premium:
                return 'Business Premium';
            case PitchCardType.Service:
                return 'Nonprofit';
            case PitchCardType.Job:
                return 'Job PitchCard';
            case PitchCardType.EmployerPortal:
                return 'Employer Portal';
            default:
                return 'Resume';
        }
    }

    getBillingDescription(type: string) {
        switch (type) {
          case PitchCardType.Resume:
            return [
              'Video Reviews  and Ratings',
              'Shareable PitchCard',
              'PitchCard Analytics and Reports',
              'Unlimited Sharing'
            ];
          case PitchCardType.Service:
            return [
              'Video Reviews  and Ratings',
              'Shareable PitchCard',
              'PitchCard Analytics and Reports',
              'Unlimited Sharing'
            ];
          default:
            return [
              'Video Reviews  and Ratings',
              'Shareable PitchCard',
              'Search Directory Placement',
              'PitchCard Analytics and Reports',
              'Unlimited Sharing'
            ];
        }
    }

    goToPage(path, params?) {
        if (!params) {
            this.router.navigateByUrl(path);
        } else {
          this.router.navigate([path], {
            queryParams: params
          });
        }
    }

    getScaleFactor(isSafari?: boolean, SafariFactor?): number {
      if (SafariFactor) {
        return SafariFactor;
      }
      const widthScaleFactor =
        window.innerWidth /
        (AppSettings.PITCHCARD_DEFAULT_WIDTH + this.DEFAULT_PADDINGS * 2);
      const heightScaleFactor =
        isSafari && window.innerHeight > window.innerWidth
          ? (window.innerHeight + this.SAFARI_BOTTOM_BAR) /
          (AppSettings.PITCHCARD_DEFAULT_HEIGHT +
            this.DEFAULT_PADDINGS * 3 +
            88)
          : window.innerHeight /
          (AppSettings.PITCHCARD_DEFAULT_HEIGHT +
            this.DEFAULT_PADDINGS * 3 +
            88);

      const scaleFactor =
        widthScaleFactor > heightScaleFactor
          ? heightScaleFactor
          : widthScaleFactor;

      return scaleFactor < 1.3 ? scaleFactor : 1.3;
    }

    getPaddings() {
      const cardSize =
        AppSettings.PITCHCARD_DEFAULT_HEIGHT * this.getScaleFactor();
      const padding = (window.innerHeight - cardSize - 88) / 3;

      return padding > 15 ? padding : 15;
    }

    get selectedType(): PitchCardType {
      return this.storageService.getSession(
        AppSettings.DRAFT_PITCH_CARD_TYPE
      );
    }

    set selectedType(value: PitchCardType) {
      this.storageService.setSession(
        AppSettings.DRAFT_PITCH_CARD_TYPE,
        value
      );
    }

    get externalProductType(): string {
      return this.storageService.getItem(
        AppSettings.STORE_EXTERNAL_PRODUCT,
        true
      );
    }

    set externalProductType(value: string) {
        this.storageService.setItem(AppSettings.STORE_EXTERNAL_PRODUCT, value);
    }
}
