import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class AppSettings {
  public static BASE_URL = environment.basePath;
  public static MAIN_URL = environment.appBaseUrl;
  public static HEADER_CONTENT_TYPE = 'application/json';
  public static HEADER_AUTHORIZATION = 'Authorization';
  public static HEADER_TIMEZONE = 'Timezone';
  public static HEADER_TIMEZONE_VALUE = '';
  public static HEADER_ACCEPT_LANGUAGE = 'en-US';
  public static HEADER_AUTHORIZATION_VALUE = '';
  public static USER: any = null;
  public static TOKEN_KEY = 'Token';
  public static USER_DETAILS = 'userDetails';
  public static FILE_UPLOAD_ID = '';
  public static FILE_UPLOAD_NAME = '';
  public static PROFILE_UPLOAD_ID = '';
  public static PROFILE_UPLOAD_NAME = '';
  public static FAQ: any = null;
  public static ACCESS_LIST = 'ACCESS_LIST';
  public static ACCESS_MENU = 'ACCESS_MENU';
  public static TIME_SETTINGS = 'TIME_SETTINGS';
  public static MIN_DISTANCE = 0.1;
  public static MAX_DISTANCE = 1;
  public static UPLOAD_FILE_URL =
    AppSettings.BASE_URL + 'business/upload-files';
  public static GET_FILE_URL = AppSettings.BASE_URL + '/file';
  public static GET_FILE_THUMB_URL =
    AppSettings.BASE_URL + '/file/thumbnail_';
  public static EXPORT_URL = AppSettings.BASE_URL + '/';
  public static PRINT_URL = AppSettings.BASE_URL + '/';
  public static DEFAULT_PROFILE_IMAGE_URL =
    '/assets/images/default_profile.png';
  public static CLEAR_NOTIFICATION_INTERVAL: any;
  public static NOTIFICATION_INTERVAL: 600;
  public static IGNORE_LINK = [];
  public static VIDEO_FORMAT =
    '.mp4,.wmv,.flv,.avi,.wav,.mov,.webm,' +
    '.m4v,.m4a,.f4v,.f4a,.m4b,.m4r,.f4b,.3gp,.3gp2,.3g2,.3gpp,.3gpp2,.wma,.VOB,.LXF,.MXF,.MJPG,.MJPEG,.mkv';
  // public static VIDEO_FORMAT = 'video/*';
  public static SUPPORTED_COUNTRY: 'us';
  public static WEBSITE_PATTERN = new RegExp(
    [
      '^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?',
      '[A-Za-z0-9]+([\\-\\.]{1}[A-Za-z0-9]+)*\\.[A-Za-z]{2,5}(:[0-9]{1,5})',
      '?(\\/.*)?$'
    ].join('')
  );
  public static NAME_PATTERN = new RegExp(['^[A-Za-z]*$'].join(''));
  public static NAME_PATTERN_WITH_SPACE = new RegExp(
    ['^[A-Za-z ]*$'].join('')
  );
  public static ROLE_PATTERN = new RegExp(
    ['^[A-Za-z\\d-_\\s/\\\\]*$'].join('')
  );
  public static FACEBOOK_PATTERN =
    /(^$|https?:\/\/(www\.)?facebook\.com\/\b([-A-Za-z0-9()!@:%_\+.~#?&\/\/=]*))/;
  public static INSTAGRAM_PATTERN =
    /(^$|https?:\/\/(www\.)?instagram\.com\/\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*))/;
  public static LINKEDIN_PATTERN =
    /(^$|https?:\/\/(www\.)?linkedin\.com\/in\/\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*))/;
  public static TWITTER_PATTERN =
    /(^$|https?:\/\/(www\.)?twitter\.com\/\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*))/;
  public static PINTEREST_PATTERN =
    /(^$|https?:\/\/(www\.)?pinterest\.com\/\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*))/;
  public static UNSECURE_FACEBOOK_PATTERN = new RegExp(
    '^(https?:\\/\\/)?(www.)?facebook.com|m\\.facebook.com|fb.com\\/([A-Za-z0-9_\\-\\.]+)\\/?(\\?.*)?$'
  );
  // /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/ig
  public static UNSECURE_INSTAGRAM_PATTERN = new RegExp(
    '^(https?:\\/\\/)?(www.)?instagram.com\\/([A-Za-z0-9_\\-\\.]+)\\/?(\\?.*)?$'
  );
  // /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im
  public static UNSECURE_LINKEDIN_PATTERN = new RegExp(
    '((https?:\\/\\/)?((www|\\w\\w)\\.)?linkedin\\.com\\/)((([\\w]{2,3})?)|([^\\/]+\\/(([\\w|\\d-&#?=])+\\/?){1,}))$'
  );
  // ((https?:\/\/)?((www|\w\w)\.)?linkedin\.com\/)((([\w]{2,3})?)|([^\/]+\/(([\w|\d-&#?=])+\/?){1,}))$
  public static UNSECURE_TWITTER_PATTERN = new RegExp(
    '^(https?:\\/\\/)?(www.)?twitter.com|mobile.twitter.com\\/@?([A-Za-z0-9_\\-\\.]+)\\/?(\\?.*)?$'
  );
  public static UNSECURE_PINTEREST_PATTERN = new RegExp(
    '^(https?:\\/\\/)?(www.)?pinterest.com\\/([A-Za-z0-9_\\-\\.]+)\\/?(\\?.*)?$'
  );
  public static PHONE_PATTERN: any = /^\+?[0-9\-]{10}$/;
  public static US_PHONE_PATTERN: any =
    /^\(?([0-9]{3})\) ?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  public static DIGITCODE_PATTERN = /^\+?[0-9\-]{4,6}$/;
  public static AMOUNT_PATTERN = new RegExp(['^[0-9\\d.]*$'].join(''));
  public static PHONE_CODE = /([0-9]{4,})|[1-9]/;
  // public static EMAIL_PATTERN = new RegExp(['[a-z|A-Z|0-9]+[@]+[a-z|A-Z|0-9]+[.]+[a-z|A-Z|0-9]+'].join(''));
  // tslint:disable-next-line: max-line-length
  public static URL_SLUG_PATTERN = new RegExp(
    ['^[a-z0-9]+(?:-[a-z0-9]+)*$'].join('')
  );
  public static EMAIL_PATTERN =
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
  public static PASSWORD_PATTERN = new RegExp(
    [
      '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{7,}'
    ].join('')
  );
  public static ZIPCODE_PATTERN = new RegExp(
    ['^[0-9]{5}(-[0-9]{4})?$'].join('')
  );
  public static DIGIT_PATTERN = new RegExp(['^[\\d]*$'].join(''));
  public static RADIUS_DIGIT_PATTERN = /^[0-9|.|0-9]+$/;
  public static NUMBER_NOT_ZERO = new RegExp(['^[1-9][0-9]*$'].join(''));
  public static FEE_PATTERN = new RegExp(['^\\d+(.\\d{1,2})?$'].join(''));
  public static ALPHA_NUMERIC = new RegExp(['^[A-Za-z0-9]'].join(''));
  public static VALUE_ONE_TO_HUNDRED = new RegExp(
    ['^[1-9][0-9]?$|^100$'].join('')
  );
  public static NON_ZERO_VALUES = new RegExp(['^[1-9][0-9]*$'].join(''));
  public static HOTEL_PROFILE_UPLOAD_ID = '';
  public static HOTEL_PROFILE_UPLOAD_NAME = '';
  public static PERSON_NAME_PATTERN = '^[a-zA-Z][a-zA-Z\\s-_]+$';
  public static COMPANY_AND_PERSON_NAME_PATTERN =
    '^[a-zA-Z0-9][a-zA-Z0-9\\s-_]+$';
  public static FAX_PATTERN = /^\+?[0-9\-]+$/;
  public static TIME_ZONE_FIRST_STRING = /[(]/gi;
  public static TIME_ZONE_SECOND_STRING = /[)]/gi;
  public static SPLIT_CAMEL_CASE = /([a-z])([A-Z])/g;
  public static CAMEL_CASE = /(?:^\w|[A-Z]|\b\w)/g;
  public static DAYS_COLLECTION = [
    {label: 'Sun', value: '1'},
    {label: 'Mon', value: '2'},
    {label: 'Tue', value: '3'},
    {label: 'Wed', value: '4'},
    {label: 'Thu', value: '5'},
    {label: 'Fri', value: '6'},
    {label: 'Sat', value: '7'}
  ];

  public static MONTHS = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12'
  ];

  public static LOGGED_IN_ROLE = '';
  public static roles = [
    {
      roleCode: 'System Admin',
      redirect: '/admin-dashboard'
    }
  ];

  public static DATE_FORMATTER = 'MMM DD, YYYY hh:mm A';

  public static COOKIE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

  public static FILE_UPLOAD_MAX_SIZE_IN_BYTE = 10000000;
  public static VIDEO_UPLOAD_MAX_SIZE_IN_BYTE = 314572800; // 314572800 BYETS = 300 MB

  public static NEW_USER = 'new user';
  public static SingUpUserData = 'signupUserData';
  public static SESSION_KEY_NAME = 'X-SESSION-KEY';
  public static VIDEO_DURATION = environment.maxVideoDuration;
  public static REVIEW_VIDEO_DURATION = 29.4;
  public static ONE_MILE_IN_METERS = 1609.34;
  public static BUSINESS_ID = 'business_id';
  public static DRAFT_BUSINESS_ID = 'draft_business_id';
  public static DRAFT_PITCH_CARD_TYPE = 'draft_pitch_card_type';
  public static SALES_VIDEO_GUIDELINES_ACCEPTED =
    'sales_video_guidlines_accepted';
  public static DRAFT_BUSINESS_JSON = 'draft_business_json';
  public static DRAFT_USER_ID = 'draft_user_id';
  public static ORGANIZATION_PROGRESS = 'organizationProgress';
  public static IS_RESUME_EXIST = 'resume_already_exist';
  public static PAYMENT_PLAN = 'payment_plan';
  public static HAS_VIRTUAL_VIDEO = 'virtual_video';
  public static EMPLOYER_PORTAL = 'employerPortal';
  public static STORE_EXTERNAL_PRODUCT = 'external_product';
  public static PAYMENT_REQUEST = 'payment_request';
  public static DRAFT_PRODUCT_ID = 'draft_product_id';
  public static USER_BANK_DETAILS = 'user_bank_details';
  public static USER_CARD_DETAILS = 'user_card_details';
  public static BUSINESS_ID_FOR_RELOAD_CAROUSEL =
    'business_id_for_reload_carousel';
  public static FILTER_FORM = 'filter_form';
  public static COMMON_FILTERS = 'common_filter_form';
  public static FILTER_STATE = 'filter_state';
  public static POCKET_CONTENT = 'pocket_content';
  public static SEARCH_POCKET_PARAMS = 'search_pocket_params';
  public static POCKET_SEARCH_TEXT = 'pocket_search_text';
  public static POCKET_NAME = 'pocket_name';
  public static ACTIVE_SLIDE = 'active-slide';
  public static DEFAULT_STATE_ID = '1562761470';
  public static DEFAULT_CITY_ID = '1562761183';
  public static ALIAS_LINK = 'alias_link';
  public static DEFAULT_CATEGORY_ID = '1562761529';
  public static DEFAULT_SUBCATEGORY_ID = '1562761671';
  public static NEW_CUSTOMERS = 'newcustomerscount';
  public static NEW_REVIEWS = 'newreviewscount';
  public static MINIMUM_VIDEO_WATCH_THRESHOLD = 5;
  public static Default_VideoOn_CenterSlide_ForPitchDemosCategory =
    environment.defaultVideoOnCenterSlideForPitchDemosCategory;
  public static LAZY_LOAD_COUNT = 7;
  public static PAYMENT_FAILED = 3000;
  public static INVALID_PROMO_CODE = 3101;
  public static PROMO_CODE_EXPIRED = 3102;
  public static MAX_CHARS_POSITION_TITLE = 40;
  public static MIN_CHARS_FOR_SEARCH_INIT = 3;
  public static FULL_FILL_EP_PROGRESS_VALUE = 100;
  public static PITCHCARD_DEFAULT_WIDTH = 360;
  public static PITCHCARD_DEFAULT_HEIGHT = 575;
  public static VISITED_TILES_STORAGE = 'visited_tiles_storage';
  public static OPEN_ACTIVE_TILE = 'open_active_tile';
  public static OPEN_AUTOFILL_MODAL = 'open_autofill_modal';
  public static NOT_PAID_BUSINESSES = 'not_paid_businesses';
  public static LAST_PAGE_URL = 'last_page_url';

  public static calendlyVirtualVideoShootLink =
    'https://calendly.com/pitch59-video/virtual-video-shoot?month=2021-02';
  public static helpCenterLink = 'http://6959827.hs-sites.com/help-center';

  public static ourStoryVideoUrl =
    'https://stream.mux.com/M3C00pyabzoEOMISZPlHc5RW2nDt3keit.m3u8';
  public static mainBannerVideoUrl =
    'https://stream.mux.com/rDjYLj003eQ8vXQnduCoKK36exNGeGKe7.m3u8';
  public static howItWorksOldVideoUrl =
    'https://stream.mux.com/q5qO3j00WfYdBgIv9SW7Or4SYttcdq01h00.m3u8';
  public static howItWorksJobsVideoUrl =
    'https://stream.mux.com/tD4dIt2EfKPj900vIogYVxlSoU4dLLrUn.m3u8';
  public static howItWorksResumeVideoUrl =
    'https://stream.mux.com/00HCxVECWM02gMxdpTqQ1QaNPFgYYCqFLm.m3u8';
  public static businessIntroVideoUrl =
    'https://stream.mux.com/dk5Xir9zbjDpdOBceksHVdGZNFjjSemK.m3u8';
  public static welcomeIntroVideoUrl =
    'https://stream.mux.com/zdkQKyalj6MkvhzSa01ME01dooXdq1OI97.m3u8';
  public static resumeIntroVideoUrl =
    'https://stream.mux.com/s3xvo2Zc02Bmv02S4t01slLBnm2jHxilFzU.m3u8';
  public static watchOurPitchVideoUrl =
    'https://stream.mux.com/vgkiy9qhM81l9s8LnrgFFgprd11NjFw5.m3u8';
  public static jobPlaceholderVideoUrl =
    'https://stream.mux.com/wR46g6lvn00hhviBiKvSLXxzAciD42SAh.m3u8';
  public static jobPlaceholderVideoID = 'wR46g6lvn00hhviBiKvSLXxzAciD42SAh';
  public static jobPlaceholderPlaybackID =
    'HZPVMtvGPh465DlS1kdkCnPxkbM8jhs02';
  public static commonPlaceholderVideoUrl =
    'https://stream.mux.com/LsoTKID8JHh0202V5zLVADffhoWR01qs3LJ.m3u8';
  public static commonPlaceholderPlaybackID =
    'Zw6MfKGtkQNy7AOM5bMf5tl95BphT02wo';
  public static commonPlaceholderVideoID =
    'LsoTKID8JHh0202V5zLVADffhoWR01qs3LJ';

  public static standOutVideoUrl =
    'https://stream.mux.com/SY0266foD9q4KEXuS5c01CzV00SsLUQeP9L.m3u8';
  public static howToShareVideoUrl =
    'https://stream.mux.com/8aL5x0119fZICUCDI001T45Wk0000l4W00mhD.m3u8';
  public static pocketsVideoUrl =
    'https://stream.mux.com/uy01P9XYwaP6DuoqC9iDefT4vQ2SDKlfo.m3u8';
  public static flipChatVideoUrl =
    'https://stream.mux.com/f018AOU8sXP01hB8Z201dyLfdjrWZ2RX02x5.m3u8';
  public static recordingVideoUrl =
    'https://stream.mux.com/K4WeeBVNR4NZmTf01AzSGeg004SsRzbQ9f.m3u8';

  public static RESPONSE_TYPE_BLOB = 'blob';

  // tslint:disable-next-line: max-line-length
  public static AcceptableVideoFormats =
    'mp4, wmv, flv, avi, wav, mov, webm, m4v, m4a, f4v, f4a, m4b, m4r, f4b, 3gp, 3gp2, 3g2, 3gpp, 3gpp2, wma, vob, lxf, mxf, mjpg, mjpeg, mkv';
  public static ContactHistoryUrl =
    'business-details/customers?isFromEmail=true';
  public static LimitBusinessesInPackage = 20;
  public static UserAdminBusinessType = 'userOrganization';
  public static searchResultMock: any[] = [];
  public static demoPitchCardsList =
    '[{"videoThumbnailId":null,"videoFileId":"hIDvTJrnnDBbT00gTvO01cgPcPbKD8014GH","videoFileUrl":"https://stream.mux.com/UV0200Jx800TFnBiu1dec542wkxwfigHo5Y.m3u8","videoThumbnailUrl":"https://image.mux.com/UV0200Jx800TFnBiu1dec542wkxwfigHo5Y/thumbnail.jpg","videoCoverImageThumbnailId":"f909e231cfa24c8093c1f9f796e7c995.jpg","videoCoverImageFileId":"f909e231cfa24c8093c1f9f796e7c995.jpg","businessLogoThumbnailId":"2611440f618248249d6bd2b91f2c6ed8.jpg","businessLogoFilelId":"2611440f618248249d6bd2b91f2c6ed8.jpg","businessId":"312574811686745624","businessName":"CDH Awarenes","businessType":"service","title":"Miles ","resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"businessStatus":2,"pricingModel":"Pricing is good","employeePictureFileIds":"b54c9a286c374e55b9eb7e4f5d362ef3.jpg","employeePictureThumnailIds":"b54c9a286c374e55b9eb7e4f5d362ef3.jpg","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/b54c9a286c374e55b9eb7e4f5d362ef3.jpg"],"googlePageId":null,"facebookPageId":null,"email":"examplecard@gmail.com","contactNumber":"(999) 991-2525","websiteLink":"examplecard.com","address":"Madison Squere Garden","state":"95013700558461305","city":"95013717151288878","cityTbl":null,"zip":"10001","placeId":null,"latitude":null,"longitude":null,"radius":null,"stripeCustomerId":null,"accountStatus":true,"userId":"288194877010259100","user":null,"businessLogoThumbnailUrl":"/assets/images/pitchcards-logos/nonprofit-pitchcard-logo.jpeg","videoCoverImageThumbnailUrl":"https://image.mux.com/Ouu7Tcknvpvldbd00q2jJx400m6aoj4Y1z/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":0,"averageQualityRating":0,"videoReviewCount":0,"rejectReason":null,"isViewdAdmin":true,"isOffline":false,"isHideTitle":false,"chosenPrice":0,"watchedPrice":0,"numberOfNewReviews":0,"numberOfNewCustomers":0,"categoryNames":null,"alias":"example-card","calendarLink":null,"businessTags":null,"educationalInstitutions":[],"positions":[{"id":"13469","name":"Financial Engineer"}],"skills":[],"businessMonthlyBudget":[],"createdAt":"1611666042618","createdBy":"288194877010259100","updatedAt":"1612199042753","updatedBy":"182778152707223213","id":"312574811686745624"},{"videoThumbnailId":null,"videoFileId":"o00Ik3NM802tZwva2YXb01IC5WymxR2cboe","videoFileUrl":"https://stream.mux.com/Ai00JRGV75BVcaSfIOkE02ysIlETBgH2T2.m3u8","videoThumbnailUrl":"https://image.mux.com/Ai00JRGV75BVcaSfIOkE02ysIlETBgH2T2/thumbnail.jpg","videoCoverImageThumbnailId":"0ccbe2bc537946638d6d9ccf50968b5f.jpg","videoCoverImageFileId":"0ccbe2bc537946638d6d9ccf50968b5f.jpg","businessLogoThumbnailId":null,"businessLogoFilelId":null,"businessId":"314720083589753629","businessName":"Scott C","businessType":"resume","title":" ","resumeFileId":"97c8ba1f71f742828aa7b9fb4dcfe230.jpg","resumeFileUrl":"https://pitch59-prod.s3.amazonaws.com/97c8ba1f71f742828aa7b9fb4dcfe230.jpg","facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":2,"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":true,"businessStatus":2,"pricingModel":"werty","employeePictureFileIds":"1f79fcd78c6e489384dac6c88b727214.jpg","employeePictureThumnailIds":"1f79fcd78c6e489384dac6c88b727214.jpg","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/1f79fcd78c6e489384dac6c88b727214.jpg"],"googlePageId":null,"facebookPageId":null,"email":"examplecard@gmail.com","contactNumber":"(889) 999-9125","websiteLink":"qa@gmail.com","address":"Madison Squere Garden","state":"95013700558461305","city":"95013717151288878","cityTbl":null,"zip":"10001","placeId":"ChIJ_xkgOm1TBogRmEFIurX8DE4","latitude":43.0730517,"longitude":-89.4012302,"radius":25,"stripeCustomerId":null,"accountStatus":true,"userId":"288194877010259100","user":null,"businessLogoThumbnailUrl":null,"videoCoverImageThumbnailUrl":"https://image.mux.com/02anq7C2FT6PMiTbapbyJm8DIx86SVQ011/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":0,"averageQualityRating":0,"videoReviewCount":0,"rejectReason":null,"isViewdAdmin":true,"isOffline":false,"isHideTitle":false,"chosenPrice":0,"watchedPrice":0,"numberOfNewReviews":0,"numberOfNewCustomers":0,"categoryNames":null,"alias":"resume-card","calendarLink":null,"businessTags":null,"educationalInstitutions":[],"positions":[],"skills":[],"businessMonthlyBudget":[],"createdAt":"1612177515148","createdBy":"288194877010259100","updatedAt":"1612347351230","updatedBy":"182778152707223213","id":"314720083589753629"},{"videoThumbnailId":null,"videoFileId":"Pdcv4ApKScgg1z7XBhldn006VcMz52qM4","videoFileUrl":"","videoThumbnailUrl":"https://image.mux.com/uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1","videoCoverImageThumbnailId":"uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK.jpg","videoCoverImageFileId":"uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK.jpg","businessLogoThumbnailId":"bfad9f61ccf5420693a0dfa265e5c0fd.jpg","businessLogoFilelId":"bfad9f61ccf5420693a0dfa265e5c0fd.jpg","businessId":"312577988703135878","businessName":"SH Boutique","businessType":"employee","title":"Sarah H","resumeFileId":null,"educationLevel":0,"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"businessStatus":2,"pricingModel":"Employee","employeePictureFileIds":"747c2d48bf6b43389b056d068c234b9e.jpg","employeePictureThumnailIds":"747c2d48bf6b43389b056d068c234b9e.jpg","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/747c2d48bf6b43389b056d068c234b9e.jpg"],"googlePageId":null,"facebookPageId":null,"email":"examplecard@gmail.com","contactNumber":"(899) 999-1252","address":"Madison Squere Garden","state":"95013700558461305","city":"95013717151288878","cityTbl":null,"zip":"10001","placeId":null,"latitude":null,"longitude":null,"radius":null,"stripeCustomerId":null,"accountStatus":true,"userId":"288194877010259100","user":null,"businessLogoThumbnailUrl":"/assets/images/pitchcards-logos/employee-pitchcard-logo.jpeg","videoCoverImageThumbnailUrl":"https://image.mux.com/uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":0,"averageQualityRating":0,"videoReviewCount":0,"rejectReason":null,"isViewdAdmin":true,"isOffline":false,"isHideTitle":false,"chosenPrice":0,"watchedPrice":0,"numberOfNewReviews":0,"numberOfNewCustomers":0,"categoryNames":null,"alias":"employee","calendarLink":null,"businessTags":null,"educationalInstitutions":[],"positions":[],"skills":[],"businessMonthlyBudget":[],"createdAt":"1611666799931","createdBy":"288194877010259100","updatedAt":"1612199042766","updatedBy":"182778152707223213","id":"312577988703135878"},{"id":"141031783172025594","businessStatus":2,"index":null,"videoThumbnailId":null,"videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mary Kay-Dominique R. Benson","businessType":"basic","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\\\n\\\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"/assets/images/pitchcards-logos/basic-pitchcard-logo.jpeg","videoCoverImageThumbnailUrl":"https://image.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null},{"id":"141031783172025594","businessStatus":2,"index":null,"videoThumbnailId":null,"videoFileId":"YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG","videoFileUrl":"https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8","videoCoverImageThumbnailId":"481937a6d1384cfa94b45fb5c1396517.png","videoCoverImageFileId":"481937a6d1384cfa94b45fb5c1396517.png","businessLogoThumbnailId":"f605a866e7c84a3691355318c32910b2.png","businessLogoFilelId":"f605a866e7c84a3691355318c32910b2.png","businessName":"Mosquito Hunters","businessType":"job","title":null,"resumeFileId":null,"resumeFileUrl":null,"facebookLink":null,"linkedinLink":null,"instagramLink":null,"twitterLink":null,"pinterestLink":null,"educationLevel":0,"educationalInstitutions":[],"workingHours":[],"textingNumber":null,"noTexting":false,"hasMilitaryService":false,"isHideTitle":true,"pricingModel":"I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\\\n\\\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.","employeePictureFileIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailIds":"d74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png","employeePictureThumnailUrl":["https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png","https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png"],"userId":"136304688374834625","businessLogoThumbnailUrl":"/assets/images/pitchcards-logos/job-pitchcard-logo.jpeg","videoCoverImageThumbnailUrl":"https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop","isFavoriteBusiness":false,"isChoosenBusiness":false,"averageCustomerRating":5,"averageQualityRating":5,"videoReviewCount":0,"alias":"mary-kay-dominique-r-benson","email":"drbenson93@aol.com","contactNumber":"(601) 259-2767","websiteLink":"www.marykay.com/dbenson1120","address":"Spring, TX 77389, USA","state":"95013700558461299","stateName":"Texas","stateCode":"TX","city":"95013717151284601","cityName":"Spring","zip":"77389","calendarLink":null,"position":"Office Manager","employmentTypes":"1","compensationTypes":["3","1","4"],"positions":[{"name":"Programming Engineer"}],"compensationDescription":"$75R/YR+Health","benefits":["1","4","9","6","11"],"positionRequirements":"Must have 3 years experience managing a payroll office, work well with others, and have a bachelors degree in underwater basket weaving."}]';
  public static defaultResumePitchCard = {
    videoThumbnailId: null,
    videoFileId: 'o00Ik3NM802tZwva2YXb01IC5WymxR2cboe',
    videoFileUrl:
      'https://stream.mux.com/Ai00JRGV75BVcaSfIOkE02ysIlETBgH2T2.m3u8',
    videoThumbnailUrl:
      'https://image.mux.com/Ai00JRGV75BVcaSfIOkE02ysIlETBgH2T2/thumbnail.jpg',
    videoCoverImageThumbnailId: '0ccbe2bc537946638d6d9ccf50968b5f.jpg',
    videoCoverImageFileId: '0ccbe2bc537946638d6d9ccf50968b5f.jpg',
    businessLogoThumbnailId: null,
    businessLogoFilelId: null,
    businessId: '314720083589753629',
    businessName: 'Scott C',
    businessType: 'resume',
    title: ' ',
    resumeFileId: '97c8ba1f71f742828aa7b9fb4dcfe230.jpg',
    resumeFileUrl:
      'https://pitch59-prod.s3.amazonaws.com/97c8ba1f71f742828aa7b9fb4dcfe230.jpg',
    facebookLink: null,
    linkedinLink: null,
    instagramLink: null,
    twitterLink: null,
    pinterestLink: null,
    educationLevel: 2,
    workingHours: [],
    textingNumber: null,
    noTexting: false,
    hasMilitaryService: true,
    businessStatus: 2,
    pricingModel: 'werty',
    employeePictureFileIds: '1f79fcd78c6e489384dac6c88b727214.jpg',
    employeePictureThumnailIds: '1f79fcd78c6e489384dac6c88b727214.jpg',
    employeePictureThumnailUrl: [
      'https://pitch59-prod.s3.amazonaws.com/1f79fcd78c6e489384dac6c88b727214.jpg'
    ],
    googlePageId: null,
    facebookPageId: null,
    email: 'examplecard@gmail.com',
    contactNumber: '(889) 999-9125',
    websiteLink: 'qa@gmail.com',
    address: 'Madison Squere Garden',
    state: '95013700558461305',
    city: '95013717151288878',
    cityTbl: null,
    zip: '10001',
    placeId: 'ChIJ_xkgOm1TBogRmEFIurX8DE4',
    latitude: 43.0730517,
    longitude: -89.4012302,
    radius: 25,
    stripeCustomerId: null,
    accountStatus: true,
    userId: '288194877010259100',
    user: null,
    businessLogoThumbnailUrl: null,
    videoCoverImageThumbnailUrl:
      'https://image.mux.com/02anq7C2FT6PMiTbapbyJm8DIx86SVQ011/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1',
    isFavoriteBusiness: false,
    isChoosenBusiness: false,
    averageCustomerRating: 0,
    averageQualityRating: 0,
    videoReviewCount: 0,
    rejectReason: null,
    isViewdAdmin: true,
    isOffline: false,
    isHideTitle: false,
    chosenPrice: 0,
    watchedPrice: 0,
    numberOfNewReviews: 0,
    numberOfNewCustomers: 0,
    categoryNames: null,
    alias: 'resume-card',
    calendarLink: null,
    businessTags: null,
    educationalInstitutions: [],
    positions: [],
    skills: [],
    businessMonthlyBudget: [],
    createdAt: '1612177515148',
    createdBy: '288194877010259100',
    updatedAt: '1612347351230',
    updatedBy: '182778152707223213',
    id: '314720083589753629'
  };
  public static defaultBasicPitchCard = {
    id: '141031783172025594',
    businessStatus: 2,
    index: null,
    videoThumbnailId: null,
    videoFileId: 'YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG',
    videoFileUrl:
      'https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8',
    videoCoverImageThumbnailId: '481937a6d1384cfa94b45fb5c1396517.png',
    videoCoverImageFileId: '481937a6d1384cfa94b45fb5c1396517.png',
    businessLogoThumbnailId: 'f605a866e7c84a3691355318c32910b2.png',
    businessLogoFilelId: 'f605a866e7c84a3691355318c32910b2.png',
    businessName: 'Mary Kay-Dominique R. Benson',
    businessType: 'basic',
    title: null,
    resumeFileId: null,
    resumeFileUrl: null,
    facebookLink: null,
    linkedinLink: null,
    instagramLink: null,
    twitterLink: null,
    pinterestLink: null,
    educationLevel: 0,
    educationalInstitutions: [],
    workingHours: [],
    textingNumber: null,
    noTexting: false,
    hasMilitaryService: false,
    isHideTitle: true,
    pricingModel:
      'I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.',
    employeePictureFileIds:
      'd74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png',
    employeePictureThumnailIds:
      'd74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png',
    employeePictureThumnailUrl: [
      'https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png',
      'https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png'
    ],
    userId: '136304688374834625',
    businessLogoThumbnailUrl:
      '/assets/images/pitchcards-logos/basic-pitchcard-logo.jpeg',
    videoCoverImageThumbnailUrl:
      'https://image.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1',
    isFavoriteBusiness: false,
    isChoosenBusiness: false,
    averageCustomerRating: 5,
    averageQualityRating: 5,
    videoReviewCount: 0,
    alias: 'mary-kay-dominique-r-benson',
    email: 'drbenson93@aol.com',
    contactNumber: '(601) 259-2767',
    websiteLink: 'www.marykay.com/dbenson1120',
    address: 'Spring, TX 77389, USA',
    state: '95013700558461299',
    stateName: 'Texas',
    stateCode: 'TX',
    city: '95013717151284601',
    cityName: 'Spring',
    zip: '77389',
    calendarLink: null
  };
  public static defaultEmployeePitchCard = {
    videoThumbnailId: null,
    videoFileId: 'Pdcv4ApKScgg1z7XBhldn006VcMz52qM4',
    videoFileUrl: '',
    videoThumbnailUrl:
      'https://image.mux.com/uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1',
    videoCoverImageThumbnailId: 'uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK.jpg',
    videoCoverImageFileId: 'uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK.jpg',
    businessLogoThumbnailId: 'bfad9f61ccf5420693a0dfa265e5c0fd.jpg',
    businessLogoFilelId: 'bfad9f61ccf5420693a0dfa265e5c0fd.jpg',
    businessId: '312577988703135878',
    businessName: 'SH Boutique',
    businessType: 'employee',
    title: 'Sarah H',
    resumeFileId: null,
    educationLevel: 0,
    workingHours: [],
    textingNumber: null,
    noTexting: false,
    hasMilitaryService: false,
    businessStatus: 2,
    pricingModel: 'Employee',
    employeePictureFileIds: '747c2d48bf6b43389b056d068c234b9e.jpg',
    employeePictureThumnailIds: '747c2d48bf6b43389b056d068c234b9e.jpg',
    employeePictureThumnailUrl: [
      'https://pitch59-prod.s3.amazonaws.com/747c2d48bf6b43389b056d068c234b9e.jpg'
    ],
    googlePageId: null,
    facebookPageId: null,
    email: 'examplecard@gmail.com',
    contactNumber: '(899) 999-1252',
    address: 'Madison Squere Garden',
    state: '95013700558461305',
    city: '95013717151288878',
    cityTbl: null,
    zip: '10001',
    placeId: null,
    latitude: null,
    longitude: null,
    radius: null,
    stripeCustomerId: null,
    accountStatus: true,
    userId: '288194877010259100',
    user: null,
    businessLogoThumbnailUrl:
      '/assets/images/pitchcards-logos/employee-pitchcard-logo.jpeg',
    videoCoverImageThumbnailUrl:
      'https://image.mux.com/uFdrEcRINqjFxcKCd2iRXFRM3tnVIhuK/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1',
    isFavoriteBusiness: false,
    isChoosenBusiness: false,
    averageCustomerRating: 0,
    averageQualityRating: 0,
    videoReviewCount: 0,
    rejectReason: null,
    isViewdAdmin: true,
    isOffline: false,
    isHideTitle: false,
    chosenPrice: 0,
    watchedPrice: 0,
    numberOfNewReviews: 0,
    numberOfNewCustomers: 0,
    categoryNames: null,
    alias: 'employee',
    calendarLink: null,
    businessTags: null,
    educationalInstitutions: [],
    positions: [],
    skills: [],
    businessMonthlyBudget: [],
    createdAt: '1611666799931',
    createdBy: '288194877010259100',
    updatedAt: '1612199042766',
    updatedBy: '182778152707223213',
    id: '312577988703135878'
  };
  public static defaultNonprofitPitchCard = {
    videoThumbnailId: null,
    videoFileId: 'hIDvTJrnnDBbT00gTvO01cgPcPbKD8014GH',
    videoFileUrl:
      'https://stream.mux.com/UV0200Jx800TFnBiu1dec542wkxwfigHo5Y.m3u8',
    videoThumbnailUrl:
      'https://image.mux.com/UV0200Jx800TFnBiu1dec542wkxwfigHo5Y/thumbnail.jpg',
    videoCoverImageThumbnailId: 'f909e231cfa24c8093c1f9f796e7c995.jpg',
    videoCoverImageFileId: 'f909e231cfa24c8093c1f9f796e7c995.jpg',
    businessLogoThumbnailId: '2611440f618248249d6bd2b91f2c6ed8.jpg',
    businessLogoFilelId: '2611440f618248249d6bd2b91f2c6ed8.jpg',
    businessId: '312574811686745624',
    businessName: 'CDH Awarenes',
    businessType: 'service',
    title: 'Miles ',
    resumeFileId: null,
    resumeFileUrl: null,
    facebookLink: null,
    linkedinLink: null,
    instagramLink: null,
    twitterLink: null,
    pinterestLink: null,
    educationLevel: 0,
    workingHours: [],
    textingNumber: null,
    noTexting: false,
    hasMilitaryService: false,
    businessStatus: 2,
    pricingModel: 'Pricing is good',
    employeePictureFileIds: 'b54c9a286c374e55b9eb7e4f5d362ef3.jpg',
    employeePictureThumnailIds: 'b54c9a286c374e55b9eb7e4f5d362ef3.jpg',
    employeePictureThumnailUrl: [
      'https://pitch59-prod.s3.amazonaws.com/b54c9a286c374e55b9eb7e4f5d362ef3.jpg'
    ],
    googlePageId: null,
    facebookPageId: null,
    email: 'examplecard@gmail.com',
    contactNumber: '(999) 991-2525',
    websiteLink: 'examplecard.com',
    address: 'Madison Squere Garden',
    state: '95013700558461305',
    city: '95013717151288878',
    cityTbl: null,
    zip: '10001',
    placeId: null,
    latitude: null,
    longitude: null,
    radius: null,
    stripeCustomerId: null,
    accountStatus: true,
    userId: '288194877010259100',
    user: null,
    businessLogoThumbnailUrl:
      '/assets/images/pitchcards-logos/nonprofit-pitchcard-logo.jpeg',
    videoCoverImageThumbnailUrl:
      'https://image.mux.com/Ouu7Tcknvpvldbd00q2jJx400m6aoj4Y1z/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop&time=1',
    isFavoriteBusiness: false,
    isChoosenBusiness: false,
    averageCustomerRating: 0,
    averageQualityRating: 0,
    videoReviewCount: 0,
    rejectReason: null,
    isViewdAdmin: true,
    isOffline: false,
    isHideTitle: false,
    chosenPrice: 0,
    watchedPrice: 0,
    numberOfNewReviews: 0,
    numberOfNewCustomers: 0,
    categoryNames: null,
    alias: 'example-card',
    calendarLink: null,
    businessTags: null,
    educationalInstitutions: [],
    positions: [
      {
        id: '13469',
        name: 'Financial Engineer'
      }
    ],
    skills: [],
    businessMonthlyBudget: [],
    createdAt: '1611666042618',
    createdBy: '288194877010259100',
    updatedAt: '1612199042753',
    updatedBy: '182778152707223213',
    id: '312574811686745624'
  };
  public static defaultJobPitchCard = {
    id: '141031783172025594',
    businessStatus: 2,
    index: null,
    videoThumbnailId: null,
    videoFileId: 'YGfFC00u02L02mcTB02ppTg8WFuGR45tLrOG',
    videoFileUrl:
      'https://stream.mux.com/tVdRQxNUiX0000bXJ6JwnHkoktl5Jq600t8.m3u8',
    videoCoverImageThumbnailId: '481937a6d1384cfa94b45fb5c1396517.png',
    videoCoverImageFileId: '481937a6d1384cfa94b45fb5c1396517.png',
    businessLogoThumbnailId: 'f605a866e7c84a3691355318c32910b2.png',
    businessLogoFilelId: 'f605a866e7c84a3691355318c32910b2.png',
    businessName: 'Mosquito Hunters',
    businessType: 'job',
    title: null,
    resumeFileId: null,
    resumeFileUrl: null,
    facebookLink: null,
    linkedinLink: null,
    instagramLink: null,
    twitterLink: null,
    pinterestLink: null,
    educationLevel: 0,
    educationalInstitutions: [],
    workingHours: [],
    textingNumber: null,
    noTexting: false,
    hasMilitaryService: false,
    isHideTitle: true,
    pricingModel:
      'I am available 24/7 via my website and email. However, I am also available via phone and text from 8 am - 10 pm. I aim to give my clients a boutique experience when it comes to their beauty regimen. \\n\\nOur skincare sets range from $45 to $205. Our skincare supplements help you to achieve desired skincare goals.  As my customer, you can create your ideal beauty regimen. I want you to feel comfortable at all times in your skin, whether that includes a full face of makeup or an awesome moisturizer.',
    employeePictureFileIds:
      'd74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png',
    employeePictureThumnailIds:
      'd74b011cf1ad48b5ac1f090c36ab202a.png,dfda9406aa814b419de753c2402be096.png',
    employeePictureThumnailUrl: [
      'https://pitch59-prod.s3.amazonaws.com/d74b011cf1ad48b5ac1f090c36ab202a.png',
      'https://pitch59-prod.s3.amazonaws.com/dfda9406aa814b419de753c2402be096.png'
    ],
    userId: '136304688374834625',
    businessLogoThumbnailUrl:
      '/assets/images/pitchcards-logos/job-pitchcard-logo.jpeg',
    videoCoverImageThumbnailUrl:
      'https://image.mux.com/lz6R1hIGhqMP7vxmHHlfUJS3pJO01uM01x/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop',
    isFavoriteBusiness: false,
    isChoosenBusiness: false,
    averageCustomerRating: 5,
    averageQualityRating: 5,
    videoReviewCount: 0,
    alias: 'mary-kay-dominique-r-benson',
    email: 'drbenson93@aol.com',
    contactNumber: '(601) 259-2767',
    websiteLink: 'www.marykay.com/dbenson1120',
    address: 'Spring, TX 77389, USA',
    state: '95013700558461299',
    stateName: 'Texas',
    stateCode: 'TX',
    city: '95013717151284601',
    cityName: 'Spring',
    zip: '77389',
    calendarLink: null,
    position: 'Office Manager',
    employmentTypes: '1',
    compensationTypes: ['3', '1', '4'],
    positions: [
      {
        name: 'Programming Engineer'
      }
    ],
    compensationDescription: '$75R/YR+Health',
    benefits: ['1', '4', '9', '6', '11'],
    positionRequirements:
      'Must have 3 years experience managing a payroll office, work well with others, and have a bachelors degree in underwater basket weaving.'
  };
}
