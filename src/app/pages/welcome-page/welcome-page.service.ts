import { Injectable } from '@angular/core';
import { PitchCardType } from '../../modules/shared/enums/pitch-card-type.enum';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { AppSettings } from '../../modules/shared/app.settings';
import { DeviceDetectorService } from 'ngx-device-detector';
import { StorageService } from '../../modules/shared/services/storage.service';

export enum WelcomeVideos {
  MainVideo = 0,
  DemoVideo = 1,
  HowItWorksJobs = 2,
  HowItWorksResume = 3,
  WatchOurPitch = 4,
  BusinessIntro = 5,
  ResumeIntro = 6
}

export enum BannerTypes {
  MainBanner = 1,
  ResumeBanner = 2,
  BusinessBanner = 3
}

export interface BannerConfig {
  type: number;
  whiteTitle: string;
  mobileWhiteTitle?: string;
  gradientTitle: string;
  mobileGradientTitle?: string;
  isGradientLast: boolean;
  isMobileGradientLast?: boolean;
  isSinglePCImage: string | boolean;
  subTitle: string;
  createBtnText: string;
  secondaryBtnText: string;
  imgBannerUrl: string;
  createBtnLink: string;
  secondaryLink: string | boolean | VideoInfo;
}

export interface IntroPageConfig {
  type: number;
  videoBlockTitle: string;
  mobileVideoBlockTitle: string;
  videoBlockSubTitle: string;
  videoBlockBtnLink: string;
  videoInfo: VideoInfo;
  tabsBlockTitle: string;
  mobileTabsBlockTitle: string;
  tabs: any[];
}

export interface WhyCardConfig {
  title: string;
  descLists: any[];
  reviews: any[];
}

export interface WhatCardConfig {
  title: string;
  descLists: string[];
  desktopCardImg: string;
  phoneCardImg: string;
}
export interface HowCardConfig {
  title: string;
  title2: string;
  descLists: any[];
}


export interface VideoInfo {
  id: number;
  url: string;
  posterImgUrl: string;
}

@Injectable()
export class WelcomePageService {
  isTablet: boolean = this.dds.isTablet();
  isSmallTabletFlip =
    this.isTablet &&
    window.innerHeight < window.innerWidth &&
    window.innerWidth <= 1024 &&
    window.innerWidth >= 768;
  isBigTabletFlip =
    this.isTablet &&
    window.innerHeight < window.innerWidth &&
    window.innerWidth <= 1366 &&
    window.innerWidth >= 1024;

  constructor(
    private cardPackageService: CardPackageService,
    private dds: DeviceDetectorService,
    private storageService: StorageService
  ) {
  }

  static easeInOutCubic(
    currentTime: number,
    startValue: number,
    changeInValue: number,
    duration
  ) {
    const time = currentTime / duration - 1;
    const timeCubic = time * time * time;
    return changeInValue * (timeCubic + 1) + startValue;
  }

  getBusinessTypeValue(type) {
    return type ? this.cardPackageService.getBusinessTypeValue(type) : '';
  }

  getVideoUrlsConfig(): VideoInfo[] {
    return [
      {id: WelcomeVideos.MainVideo, url: AppSettings.mainBannerVideoUrl, posterImgUrl: 'https://image.mux.com/rDjYLj003eQ8vXQnduCoKK36exNGeGKe7/thumbnail.png?time=55'},
      {id: WelcomeVideos.DemoVideo, url: AppSettings.ourStoryVideoUrl, posterImgUrl: 'https://image.mux.com/M3C00pyabzoEOMISZPlHc5RW2nDt3keit/thumbnail.png?time=120'},
      {id: WelcomeVideos.HowItWorksJobs, url: AppSettings.howItWorksJobsVideoUrl, posterImgUrl: 'https://image.mux.com/q5qO3j00WfYdBgIv9SW7Or4SYttcdq01h00/thumbnail.png?fit_mode=smartcrop&time=0'},
      {id: WelcomeVideos.HowItWorksResume, url: AppSettings.howItWorksResumeVideoUrl, posterImgUrl: 'https://image.mux.com/q5qO3j00WfYdBgIv9SW7Or4SYttcdq01h00/thumbnail.png?fit_mode=smartcrop&time=21'},
      {id: WelcomeVideos.WatchOurPitch, url: AppSettings.watchOurPitchVideoUrl, posterImgUrl: 'https://image.mux.com/vgkiy9qhM81l9s8LnrgFFgprd11NjFw5/thumbnail.jpg?time=59'},
      {id: WelcomeVideos.BusinessIntro, url: AppSettings.welcomeIntroVideoUrl, posterImgUrl: 'https://pitch59-prod.s3.amazonaws.com/68724139cecb416fb06f33b365719de2.jpg'}
    ];
  }

  smoothVerticalScrolling(scrollTo, duration, x?) {
    const scrollFrom = window.scrollY || window.pageYOffset || 0;

    const scrollDiff = scrollTo - scrollFrom;

    let currentTime = 0;
    const increment = 20;
    const url = document.location.pathname;

    (function animateScroll() {
      currentTime += increment;
      const newScrollPos = WelcomePageService.easeInOutCubic(
        currentTime,
        scrollFrom,
        scrollDiff,
        duration
      );
      if (currentTime > duration || url !== document.location.pathname) {
        return;
      }
      window.scrollTo(x !== null ? x : 0, newScrollPos);

      setTimeout(animateScroll, increment);
    })();
  }

  smoothHorizontalScrolling(positionX, positionY, duration) {
    const scrollFrom = window.scrollX || window.pageXOffset || 0;

    const scrollDiff = positionX - scrollFrom;

    let currentTime = 0;
    const increment = 20;
    const url = document.location.pathname;

    (function animateScroll() {
      currentTime += increment;
      const newScrollPos = WelcomePageService.easeInOutCubic(
        currentTime,
        scrollFrom,
        scrollDiff,
        duration
      );
      if (currentTime > duration || url !== document.location.pathname) {
        return;
      }
      window.scrollTo(newScrollPos, positionY);

      setTimeout(animateScroll, increment);
    })();
  }

  getBannerConfig(landing): BannerConfig {
    switch (landing) {
      case BannerTypes.MainBanner:
        return {
          type: BannerTypes.MainBanner,
          whiteTitle: ' your referrals',
          gradientTitle: '10x',
          isGradientLast: false,
          isMobileGradientLast: false,
          isSinglePCImage: './assets/images/welcome/banners-imgs/carousel-3.png',
          subTitle: 'Getting referrals is awkward and difficult. PitchCards make it simple and easy. Try it FREE for 30 days.',
          createBtnText: 'START FREE TRIAL',
          secondaryBtnText: 'SCHEDULE DEMO',
          imgBannerUrl: './assets/images/welcome/banners-imgs/carousel-5.png',
          createBtnLink: '/select-pitchcards',
          secondaryLink: 'https://calendly.com/jeffpitch59/meeting'
        };
      case BannerTypes.ResumeBanner:
        return {
          type: BannerTypes.ResumeBanner,
          whiteTitle: 'Those that stand out get the ',
          mobileWhiteTitle: 'Get the right ',
          gradientTitle: 'job',
          isGradientLast: true,
          isMobileGradientLast: true,
          isSinglePCImage: true,
          subTitle:
            'Resume PitchCards help you stand out from other applicants and allow employers to get to know the real you in 59 seconds. Landing the perfect job starts with creating your FREE Resume PitchCard.',
          createBtnText: 'CREATE PITCHCARD',
          secondaryBtnText: 'SEARCH JOBS',
          imgBannerUrl:
            './assets/images/welcome/banners-imgs/carousel-1.png',
          createBtnLink: '/select-pitchcards',
          secondaryLink: '/search?types=job'
        };
      case BannerTypes.BusinessBanner:
        return {
          type: BannerTypes.BusinessBanner,
          whiteTitle: ' your business and your team',
          mobileWhiteTitle: 'Grow your ',
          gradientTitle: 'Grow',
          mobileGradientTitle: 'business',
          isGradientLast: false,
          isMobileGradientLast: true,
          isSinglePCImage: false,
          subTitle:
            'Grow your revenue, introduce your team, spread your cause, and hire better employees by using the world’s most persuasive tool. The PitchCard.',
          createBtnText: 'CREATE PITCHCARDS',
          secondaryBtnText: 'REQUEST A DEMO',
          imgBannerUrl:
            './assets/images/welcome/banners-imgs/carousel-3.png',
          createBtnLink: '/select-pitchcards',
          secondaryLink: true
        };
      default:
        break;
    }
  }

  getPartnersImageList(isMobile) {
    switch (isMobile) {
      case true:
        return [
          {url: './assets/images/partners/sm.png', title: 'sm', highheight: false},
          {url: './assets/images/partners/UVU.png', title: 'UVU', highheight: true},
          {url: './assets/images/partners/tanner.png', title: 'tanner', highheight: true},
        ];
      case false:
        return [
          {url: './assets/images/partners/teva.png', title: 'teva', highheight: false},
          {url: './assets/images/partners/sm.png', title: 'sm', highheight: false},
          {url: './assets/images/partners/USC.png', title: 'usc', highheight: true},
          {url: './assets/images/partners/pattern.svg', title: 'pattern', highheight: false},
          {url: './assets/images/partners/UVU.png', title: 'UVU', highheight: true},
          {url: './assets/images/partners/tanner.png', title: 'tanner', highheight: true}
        ];
    }
  }

  getIntroPageConfig(type): IntroPageConfig {
    if (type) {
      switch (type) {
        case BannerTypes.ResumeBanner:
          return {
            type: type,
            videoBlockTitle: 'Network. <br> Get recruited. ',
            mobileVideoBlockTitle:
              'Network, get recruited and apply to jobs.',
            videoBlockSubTitle:
              '“It’s almost like a personal, resume business card that’s always with you and lets you pitch employers! I love it!”  Grace B.',
            videoBlockBtnLink: '/create',
            videoInfo: {
              id: WelcomeVideos.ResumeIntro,
              url: AppSettings.resumeIntroVideoUrl,
              posterImgUrl:
                'https://image.mux.com/s3xvo2Zc02Bmv02S4t01slLBnm2jHxilFzU/thumbnail.png?fit_mode=smartcrop&time=0'
            },
            tabsBlockTitle:
              'Instantly share your PitchCard anywhere and apply for jobs with a single tap.',
            mobileTabsBlockTitle:
              'Share your PitchCard everywhere and apply for jobs with a single tap.',
            tabs: this.getResumeTabs()
          };
        case BannerTypes.BusinessBanner:
          return {
            type: type,
            videoBlockTitle:
              'Nail your perfect elevator pitch, then network it everywhere.',
            mobileVideoBlockTitle:
              'Nail your perfect elevator pitch, then network it everywhere.',
            videoBlockSubTitle:
              'With business PitchCards, sharing your PitchCard is as easy as swiping up.',
            videoBlockBtnLink: '/select-pitchcards',
            videoInfo: {
              id: WelcomeVideos.BusinessIntro,
              url: AppSettings.businessIntroVideoUrl,
              posterImgUrl:
                'https://image.mux.com/dk5Xir9zbjDpdOBceksHVdGZNFjjSemK/thumbnail.png?fit_mode=smartcrop&time=315'
            },
            tabsBlockTitle:
              'Introduce your employees, services, products and job positions to the world with a variety of PitchCards.',
            mobileTabsBlockTitle:
              'Introduce your employees, services, products and job positions to the world with a variety of PitchCards.',
            tabs: this.getBusinessTabs()
          };
        default:
          break;
      }
    }
  }

  getWhyCardConfig(): WhyCardConfig {
    return {
        title: 'Why get PitchCards?',
        descLists: [
          {
            gradientTitle: 'Increase',
            title: ' your referrals',
            description: 'Trying to get referrals can be ineffective, awkward, and uncomfortable. PitchCards simplify the referral process so everyone can easily introduce you to their network.',
          },
          {
            gradientTitle: 'Grow',
            title: ' your business',
            description: 'PitchCards are a low-cost way for your team to increase B2B and B2C sales. They’re also perfect for customer support/success, trainings, tutorials, education, or product highlights.',
          },
        ],
        reviews: [
          {
            stat: '150%',
            desc: 'Increase in meetings scheduled',
            company: 'Alta Commercial Capital',
          },
          {
            stat: '9',
            desc: 'New referrals in the first day',
            company: 'Wake Coaching',
          },
          {
            stat: '$19K',
            desc: 'In new business from 1 PitchCard Referral',
            company: 'AC Ninja',
          },
        ]
    };
  }

  getWhatCardConfig(): WhatCardConfig {
    return {
      title: 'What is a PitchCard?',
      descLists: [
        '59-second elevator pitch to establish a foundation of trust',
        'Easy Share allows others to quickly refer and make 3 way introductions with your messaging',
        'Works everywhere and does not require others to download the app or create an account',
        'Anyone can easily add you AND your PitchCard to their Contacts for future use',
        'See when and how your PitchCard is shared, viewed, contacted, etc... to track your growth',
      ],
      desktopCardImg: './assets/images/welcome/phone-welcome.png',
      phoneCardImg: './assets/images/welcome/phone-card.png',
    };
  }

  getHowCardConfig(): HowCardConfig {
    return {
      title: 'How do I use a PitchCard?',
      title2: 'How do I get started?',
      descLists: [
        {
          gradientTitle: 'Select',
          title: ' your PitchCard(s)',
          description: 'Select the type and quantity of PitchCards you’d like for your team and fill out your basic information.',
        },
        {
          gradientTitle: 'Record',
          title: ' your pitch',
          description: 'Script your elevator pitch (<span class="business-title">Pitch Creator</span> and <span class="business-title">Pitch Tips</span>) then choose one of the 4 video recording options.',
        },
        {
          gradientTitle: 'Share',
          title: ' it with everyone',
          description: 'Share your PitchCard with your customers and referral partners and ask them to refer you to their contacts.',
        },

      ],
    };
  }


  getResumeTabs() {
    return [
      {
        title: 'Resume',
        subTitle: 'PitchCard',
        description:
          'Don’t stress, you can redo your video at any time. With pitch tips, topics, and even a built in teleprompter, you can do this.',
        btnText: 'CREATE PITCHCARD',
        btnUrl: '/create',
        cardImg: './assets/images/welcome/intro-page/resumes.png',
        type: PitchCardType.Resume
      },
      {
        title: 'Jobs',
        subTitle: 'Search and apply',
        description:
          'After you’ve created a Resume PitchCard, you can be recruited and apply to jobs with a single tap.',
        btnText: 'SEARCH JOBS',
        btnUrl: '/search?types=job',
        cardImg: './assets/images/welcome/intro-page/job.png',
        type: PitchCardType.Job
      }
    ];
  }

  getBusinessTabs() {
    return [
      {
        title: 'Company',
        subTitle: 'Showcase your company and brand',
        descList: [
          'Represents the entire company',
          'Placed on Services search carousel',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from potential customers through FlipChat'
        ],
        cardImg: './assets/images/welcome/intro-page/company.png',
        type: PitchCardType.Basic,
        comingSoon: false
      },
      {
        title: 'Individual',
        subTitle: 'Introduce yourself, stand out and be heard',
        descList: [
          'For sales, technicians, staff members, etc...',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from clients and potential customers through FlipChat'
        ],
        cardImg: './assets/images/welcome/intro-page/individual.png',
        type: PitchCardType.Employee,
        comingSoon: false
      },
      {
        title: 'Job',
        subTitle: 'Post your open job positions and recruit',
        descList: [
          'Pitch your available job position',
          'Searchable, shareable, networkable',
          'Includes employee video testimonials, website, social links, etc...',
          'Single tap application process',
          'Allows your applicants to apply with their Resume PitchCard'
        ],
        cardImg: './assets/images/welcome/intro-page/job.png',
        type: PitchCardType.Job,
        comingSoon: false
      },
      {
        title: 'Nonprofit',
        subTitle: 'Spread your cause, share your mission',
        descList: [
          'Great for churches/charities and other nonprofits spreading their cause',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from people interested in your cause through FlipChat'
        ],
        cardImg: './assets/images/welcome/intro-page/nonprofit.png',
        type: PitchCardType.Service,
        comingSoon: false
      },
      {
        title: 'Product',
        subTitle: 'Sell specific products and services',
        descList: [
          'Pitch and sell individual products',
          'Placed on Products search carousel',
          'Searchable, shareable, networkable',
          'Includes video testimonials, website, social links, etc...',
          'Receive messages and notifications from potential customers through FlipChat'
        ],
        cardImg: './assets/images/welcome/intro-page/product.png',
        type: PitchCardType.Products,
        comingSoon: true
      },
      {
        comingSoon: true
      }
    ];
  }

  setLastPageUrl() {
    this.storageService.setSession(
      AppSettings.LAST_PAGE_URL,
      window.location.pathname
    );
  }
}
