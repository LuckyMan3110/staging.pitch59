import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Subscription } from 'rxjs';

import { BusinessDetails } from '../../business/models/business-detail.model';
import { businessHoursModel } from '../../shared/models/businessHours.model';
import { WeekDaysEnum } from '../../shared/enums/week-days.enum';
import { workingHoursGroupModel } from '../../shared/models/workingHoursGroup.Model';
import { UserCommonService } from '../../shared/services/user-common.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';

@Injectable()
export class PitchCardModalsWrapperService {
  private _currentBusiness: BusinessDetails = null;
  private _isBrowser: boolean;

  public showMoreInfoDialog = new Subject<boolean>();
  public showJobDetailsDialog = new Subject<boolean>();
  public showShareDialog = new Subject<boolean>();
  public showSaveMobileDialog = new Subject<boolean>();
  public showContactMeDialog = new Subject<boolean>();
  public showDoneDialog = new Subject<boolean>();
  public showPhotoGalleria = new Subject<boolean>();
  public showResumeFileDialog = new Subject<boolean>();
  public showSaveBusinessDialog = new Subject<boolean>();
  public showVideoPlayerDialog = new Subject<boolean>();
  public showVideoReviewsDialog = new Subject<boolean>();
  public showUploadReviewVideoDialog = new Subject<boolean>();
  public showSignUpCommonDialog = new Subject<boolean>();
  public showSignUpDialog = new Subject<boolean>();
  public showContactInfoDialog = new Subject<boolean>();
  public showApplyJobNowDialog = new Subject<boolean>();
  public showJobRequirementsDialog = new Subject<boolean>();

  public $shutDownAllModal = new Subject<{ withCheck?: boolean }>();

  private $pendingMethodSub: Subscription;

  public uniqueId: string;

  constructor(
    private userCommonService: UserCommonService,
    private deviceService: DeviceDetectorService,
    @Inject(PLATFORM_ID) private _platformId
  ) {
    this._isBrowser = isPlatformBrowser(this._platformId);
    this.$pendingMethodSub =
      this.userCommonService.pendingMethodCaller.subscribe(() => {
        this.onTitleClick(this.userCommonService.pendingMethod);
      });
  }

  ngOnDestroy(): void {
    if (this.$pendingMethodSub) {
      this.$pendingMethodSub.unsubscribe();
        }
    }

    onTitleClick(title: string) {
        switch (title) {
            case 'moreInfoDialog':
                this.enableMoreInfoDialog();
                break;
            case 'jobDetailsDialog':
                this.enableJobDetailsDialog();
                break;
            case 'share':
                this.enableShareDialog();
                break;
            case 'contactMe':
                this.enableContactMeDialog();
                break;
            case 'done':
                this.enableShowDoneDialog();
                break;
            case 'companyImgDialog':
                this.enablePhotoGalleriaDialog();
                break;
            case 'saveAsFavorite':
                this.enableSaveBusinessDialog();
                break;
            case 'playVideo':
                this.enablePlayVideoDialog();
                break;
            case 'watchVideoRevews':
                this.enableVideoReviewsDialog();
                break;
            case 'leaveareview':
                this.enableUploadVideoReviewsDialog();
                break;
            case 'contact':
                this.enableContactInfoDialog();
                break;
            case 'resumeFileDialog':
                this.enableResumeFileDialog();
                break;
            case 'applyJobNowDialog':
                this.enableApplyJobNowDialog();
                break;
            case 'showJobRequirementsDialog':
                this.enableJobRequirementsDialog();
                break;
            default:
                break;
        }
    }

    setCurrentBusiness(business: BusinessDetails): void {
        this._currentBusiness = { ...business };
    }

    getCurrentBusiness(): BusinessDetails {
        return { ...this._currentBusiness };
    }

    setUniqueId(id: string) {
        this.uniqueId = id;
    }

    clearCurrentBusiness(): void {
        this._currentBusiness = null;
    }

    enableMoreInfoDialog(): void {
        this.showMoreInfoDialog.next(true);
    }

    enableJobDetailsDialog(): void {
        this.showJobDetailsDialog.next(true);
    }

    getFormattedWorkingHours() {
        return this.formatBusinessHours();
    }

    formatBusinessHours() {
        let workingHoursGroups = [];

        if (this._currentBusiness.workingHours) {
          this._currentBusiness.workingHours.forEach((timesheet) => {
            if (!this.checkExistedHours(workingHoursGroups, timesheet)) {
              workingHoursGroups.push({
                openHours: timesheet.open.hours,
                openMinutes: timesheet.open.minutes,
                closeHours: timesheet.close.hours,
                closeMinutes: timesheet.close.minutes,
                [WeekDaysEnum[timesheet.weekDay]]: true
              });
            }
          });
        }

      this.addDaysOffToEachGraph(workingHoursGroups);

      return this.createWorkingSchedule(workingHoursGroups);
    }

  checkExistedHours(
    workingHoursGroups: workingHoursGroupModel[],
    timesheet: businessHoursModel
  ): boolean {
    return workingHoursGroups.some((object, index) => {
      const equalHours =
        object.openHours === timesheet.open.hours &&
        object.openMinutes === timesheet.open.minutes &&
        object.closeHours === timesheet.close.hours &&
        object.closeMinutes === timesheet.close.minutes;

      if (equalHours) {
        workingHoursGroups[index] = {
          ...workingHoursGroups[index],
                    [WeekDaysEnum[timesheet.weekDay]]: true
                };
                return true;
            }

            return false;
        });
    }

    addDaysOffToEachGraph(workingHoursGroups: workingHoursGroupModel[]) {
        workingHoursGroups.forEach((object, index) => {
            const keys = Object.keys(WeekDaysEnum);
            const allDays = keys.slice(keys.length / 2, keys.length);

          allDays.forEach((day) => {
            if (!object[day]) {
              workingHoursGroups[index] = {
                ...workingHoursGroups[index],
                [day]: false
              };
            }
          });
        });
    }

    createWorkingSchedule(workingHoursGroups: workingHoursGroupModel[]) {
        let result = [];

      workingHoursGroups.forEach((workingHours) => {
        const openHours = this.get12FormatHours(workingHours.openHours);
        const closeHours = this.get12FormatHours(workingHours.closeHours);
        const workingDays = this.getWorkingDays(workingHours);

        result.push({
          openHours,
          closeHours,
          workingDays
        });
      });

        return result;
    }

    get12FormatHours(openHours: number): string {
        let hours = openHours;
        let format = 'AM';

        if (openHours === 0) {
            hours = 12;
            format = 'AM';
        }

        if (openHours > 12) {
            hours = openHours % 12;
            format = 'PM';
        }

        if (openHours === 12) {
            format = 'PM';
        }

        return hours + ' ' + format;
    }

    getWorkingDays(workingHours: workingHoursGroupModel) {
        let days = [];
        let weekDays = this.setOrderedWeekDays(workingHours);

        Object.values(weekDays).forEach((weekDay, index) => {
          const allDays = Object.values(weekDays);
          const {day, value} = weekDay;

          if (
            !allDays[index - 1]?.value &&
            !allDays[index + 1]?.value &&
            value
          ) {
            days.push(day);
          }

          if (!index && allDays[index + 1]?.value && value) {
            this.getDaysRange(allDays, index, days);
          }

          if (
            index &&
            allDays[index + 1]?.value &&
            value &&
            !allDays[index - 1]?.value
          ) {
            this.getDaysRange(allDays, index, days);
          }
        });

        return days;
    }

    setOrderedWeekDays(workingHours: workingHoursGroupModel) {
        let weekDays = {
            0: { day: 'SUN', value: false },
            1: { day: 'MON', value: false },
            2: { day: 'TUE', value: false },
            3: { day: 'WED', value: false },
            4: { day: 'THU', value: false },
            5: { day: 'FRI', value: false },
            6: { day: 'SAT', value: false }
        };

      Object.entries(workingHours).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        if (Object.values(weekDays).some((value) => value.day === key)) {
          const weekDay = Object.values(weekDays).find(
            (value) => value.day === key
          );
          weekDay.value = value;
        }
      });

        return weekDays;
    }

    getDaysRange(allDays, index, days) {
        const firstDay = allDays[index].day;
        let lastDay;

        for (let i = index; i < allDays.length; i++) {
            const currentLoopDay = allDays[i].value;
            const prevLoopDay = allDays[i - 1]?.value;

            if (!currentLoopDay && i && prevLoopDay) {
                lastDay = allDays[i - 1].day;
                break;
            } else if (prevLoopDay && i === 6 && currentLoopDay) {
                lastDay = allDays[6].day;
            }
        }

        days.push(`${firstDay}-${lastDay}`);
    }

    enableShareDialog() {
        this.showShareDialog.next(true);
    }

    enableContactMeDialog() {
        this.showContactMeDialog.next(true);
    }

    enableShowDoneDialog() {
        this.showDoneDialog.next(true);
    }

    getShareBusinessUrl(): string {
        let businessUrl = '';

        if (this._isBrowser) {
          // tslint:disable-next-line: max-line-length
          businessUrl = encodeURI(
            `${window.location.origin}/card/${this._currentBusiness.alias}`
          );
        }
        return businessUrl;
    }

    enablePhotoGalleriaDialog() {
        this.showPhotoGalleria.next(true);
    }

    disablePhotoGalleriaDialog() {
        this.showPhotoGalleria.next(false);
    }

    enableResumeFileDialog() {
        this.showResumeFileDialog.next(true);
    }

  getBusinessImages(): { file: string; thumbnail: string }[] {
    if (this._currentBusiness.employeePictureThumnailUrl) {
      const images = [
        ...this._currentBusiness.employeePictureThumnailUrl
      ];
      return images.map((el, i) => {
        if (typeof el === 'string') {
          return {
            file: images[i],
            thumbnail: el
          };
        } else {
          return el;
        }
      });
    }
        return [];
    }

    enableSaveBusinessDialog() {
        if (this.deviceService.isMobile()) {
          if (this.userCommonService.isAuthenticated()) {
            this.showSaveMobileDialog.next(true);
          } else {
            document.getElementById('downloadvcf').click();
          }
        } else {
          if (!this.userCommonService.isAuthenticated()) {
            this.showSignUpCommonDialog.next(true);
            this.userCommonService.pendingMethod = 'saveAsFavorite';
          } else {
            this.showSaveBusinessDialog.next(true);
          }
        }
    }

    disableSaveBusinessDialog() {
        this.showSaveBusinessDialog.next(false);
    }

    enablePlayVideoDialog() {
        if (this._currentBusiness.videoFileUrl) {
            this.showVideoPlayerDialog.next(true);
        }

        return;
    }

    enableVideoReviewsDialog() {
        this.showVideoReviewsDialog.next(true);
    }

    disableVideoReviewDialog() {
        this.showVideoReviewsDialog.next(false);
    }

    enableUploadVideoReviewsDialog() {
        if (!this.userCommonService.isAuthenticated()) {
            this.showSignUpCommonDialog.next(true);
            this.userCommonService.pendingMethod = 'leaveareview';
            return;
        }
        this.showUploadReviewVideoDialog.next(true);
    }

    enableContactInfoDialog() {
        if (!this.userCommonService.isAuthenticated()) {
            this.showSignUpCommonDialog.next(true);
            this.userCommonService.pendingMethod = 'contact';
            return;
        }

        this.showContactInfoDialog.next(true);
    }

    disableContactInfoDialog() {
        this.showContactInfoDialog.next(false);
    }

    enableApplyJobNowDialog() {
        if (!this.userCommonService.isAuthenticated()) {
            this.userCommonService.pendingMethod = 'applyJobNowDialog';
        }
        this.showApplyJobNowDialog.next(true);
    }

    enableJobRequirementsDialog() {
        if (!this.userCommonService.isAuthenticated()) {
            this.userCommonService.pendingMethod = 'showJobRequirementsDialog';
        }
        this.showJobRequirementsDialog.next(true);
    }

    openLinkInNewTab(link) {
      this.deviceService.browser === 'Safari'
        ? this.openNewTabSafari(link, this.deviceService.isMobile())
        : window.open(link, '_blank');
    }

    openNewTabSafari(url, isMobile?: boolean) {
        const a = window.document.createElement('a');
        a.target = '_blank';
        a.href = url;

        // Dispatch fake click
        if (!isMobile) {
          const e = window.document.createEvent('MouseEvents');
          e.initMouseEvent(
            'click',
            true,
            true,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          );
          a.dispatchEvent(e);
        } else {
            window.location.href = url;
        }
    }

    previewHtmlData(html: string, uniqueId: string) {
        const el = document.getElementById(uniqueId);
        el.innerHTML = '';
        el.insertAdjacentHTML('afterbegin', html);
    }
}
