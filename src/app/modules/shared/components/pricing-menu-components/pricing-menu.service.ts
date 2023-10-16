import { Injectable } from '@angular/core';
import { PitchCardType } from '../../enums/pitch-card-type.enum';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { AppSettings } from '../../app.settings';

export class PricingPackage {
  businessType: PitchCardType;
  title: string;
  subTitle: string;
  options: string[];
}

export enum ProductType {
  Single = 1,
  Portal = 2
}

export enum DiscountType {
  Dollar = 1,
  Percentage = 2
}

@Injectable({
  providedIn: 'root'
})
export class PricingMenuService {
  $packageTypeChange: Subject<PitchCardType> = new Subject<PitchCardType>();
  $handlePackageDetails: Subject<boolean> = new Subject<boolean>();
  hasUserEmployerPortal: boolean;

  constructor(private deviceService: DeviceDetectorService) {
  }

  getCarouselConfig(): SwiperConfigInterface {
    return {
      direction: 'horizontal',
      slidesPerView: 3,
      effect: 'coverflow',
      grabCursor: false,
      centeredSlides: true,
      keyboard: false,
      mousewheel: false,
      scrollbar: false,
      coverflowEffect: {
        rotate: 0,
        depth: 400,
        modifier: 1,
        slideShadows: false
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      preventClicks: false,
      preventClicksPropagation: false,
      breakpoints: {
        1024: {
          slidesPerView: 2.2
        },
        992: {
          slidesPerView: 2,
          spaceBetween: 0,
          coverflowEffect: {
            depth: 400
          }
        },
        670: {
          longSwipes: false,
          shortSwipes: true,
          slidesPerView: 1.4,
          spaceBetween: 0,
          loop: true,
          coverflowEffect: {
            depth: 300,
            modifier: 2
          }
        }
      },
      autoplay: false,
      speed: 500,
      loop: true,
      initialSlide: 0,
      observer: true,
      longSwipes: false,
      shortSwipes: true,
      followFinger: false,
      preventInteractionOnTransition: true,
      allowTouchMove: this.deviceService.isMobile()
    };
  }

  getDefaultPClist() {
    return [
      AppSettings.defaultJobPitchCard,
      AppSettings.defaultBasicPitchCard,
      AppSettings.defaultEmployeePitchCard,
      AppSettings.defaultResumePitchCard,
      AppSettings.defaultNonprofitPitchCard
    ];
  }

  getPitchCardsPackages() {
    return [
      {
        businessType: PitchCardType.Job,
        title: 'Job PitchCard',
        subTitle: 'For business owners and sole proprietors',
        options: [
          'Give your potential applicants  your best pitch everytime',
          'All applicants are Resume PitchCards',
          'Includes video employee testimonials, website, social links, etc...',
          'Single tap application process',
          'Searchable, shareable, networkable'
        ]
      },
      {
        businessType: PitchCardType.Basic,
        title: 'Company PitchCard',
        subTitle: 'For business owners, Sole proprietors',
        options: [
          'Get found on the Pitch59 Carousel',
          'Give customers your best pitch everytime',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from potential customers'
        ]
      },
      {
        businessType: PitchCardType.Employee,
        title: 'Professional PitchCard',
        subTitle:
          'For Individuals, Sales Reps, Technicians, Assistants, personal use, etc...',
        options: [
          'Give customers your best pitch everytime',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from potential customers'
        ]
      },
      {
        businessType: PitchCardType.Resume,
        title: 'Resume PitchCard',
        subTitle: 'For those looking for employment',
        options: [
          'Apply to jobs with just one tap',
          'Searchable, shareable, networkable',
          'Includes resume, social links, all other needed info for employers',
          'Get recruited on the Pitch59 Carousel',
          'Receive messages and notifications from potential employers'
        ]
      },
      {
        businessType: PitchCardType.Service,
        title: 'Nonprofit PitchCard',
        subTitle: 'For churches, charities, or other nonprofits',
        options: [
          'Spread your mission and get others to follow and support your  cause',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Chat and communicate with others on the back of your PitchCard'
        ]
      }
    ];
  }
}
