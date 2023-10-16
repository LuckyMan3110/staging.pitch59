import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class AppConstantService {
  public static businessDetailsForSidebar: Subject<any> = new Subject<any>();
  public static stepsActiveIndex: Subject<number> = new Subject<number>();
  public static resetPaginationCountofGrid: Subject<any> = new Subject<any>();
  public static resetReferDialog: Subject<any> = new Subject<any>();
  public static resetCommonShareDialog: Subject<any> = new Subject<any>();

  public static MESSAGE_TYPE = {
    SUCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning'
  };
  public static MESSAGE_SUMMARY = {
    SUCESS: 'Success',
    ERROR: 'Error',
    WARNING: 'Warning'
  };
  public static DATE_FORMAT = 'MMM DD, YYYY';
  public static TIME_FORMAT = 'h:mm A';
  public static ISO_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
  public static MOBILE_NUMBER_MASK = '(999) 999-9999';
  public static SSN_NUMBER_MASK = '999-99-9999';

  public static PAGINATION_LIMIT = 10;

  //#region Error Message
  public static errImageFormat = 'Please provide valid image format';
  public static errFileFormat = 'Please provide valid file format';
  public static docNotFound = 'Requested document not found';
  public static Pdf = '.pdf';
  public static imageFileSizeLarge = 'Selected image file size is large';
  //#endregion

  public static MONTHS_LIST = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  public static notification = 'notification';
  public DEFAULT_USER_IMAGE = 'assets/images/placeholder_user.png';
  public DATE_TIME_FOMRAT = 'DD MMM YYYY hh:MM A';
  public MESSAGE_DISPLAY_DELAY = 5000;

  public fileUploadUIType = {
    default: 'default',
    button: 'button',
    link: 'link'
  };

  public static image_extensions = [
    '.jpg',
    '.png',
    '.jpeg',
    '.bmp',
    '.heic',
    '.heif'
  ];
  public static acceptImageextensions =
    '.jpg, .png, .jpeg, .bmp, .heic, .heif';
  public static file_extensions_pdf_doc = ['.pdf', '.doc', '.docx'];
  public file_extensions = ['.pdf'];
  // tslint:disable-next-line: max-line-length
  public video_extensions = [
    '.mp4',
    '.wmv',
    '.flv',
    '.avi',
    '.wav',
    '.mov',
    '.webm',
    '.m4v',
    '.m4a',
    '.f4v',
    '.f4a',
    '.m4b',
    '.m4r',
    '.f4b',
    '.3gp',
    '.3gp2',
    '.3g2',
    '.3gpp',
    '.3gpp2',
    '.wma',
    '.VOB',
    '.LXF',
    '.MXF',
    '.MJPG',
    '.MJPEG',
    '.mpg',
    '.mkv'
  ];
}
