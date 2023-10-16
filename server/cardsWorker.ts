import { businessHoursModel } from "../src/app/modules/shared/models/businessHours.model";

const bsTypeBasic = 'basic';
const bsTypeNonprofit = 'service';
const bsTypeResume = 'resume';
const bsTypeEmployee = 'employee';
const bsTypeJob = 'job';
const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DEFAULT_CITY_ID = '1562761183';
const DEFAULT_STATE_ID = '1562761470';

export enum WeekDaysEnum {
    SUN = 0,
    MON = 1,
    TUE = 2,
    WED = 3,
    THU = 4,
    FRI = 5,
    SAT = 6
}

export enum CompensationTypes {
    None = 0,
    Hourly = 1,
    Monthly = 2,
    Yearly = 3,
}

export enum EmploymentTypes {
    None = 0,
    FullTime = 1,
    PartTime = 2,
    Temporary = 3,
    Seasonal = 4,
    IndependentContractor = 5,
    TemporaryWorker = 6,
    Freelancer = 7,
    Consultant = 8,
}
export class workingHoursGroupModel {
    FRI: boolean;
    MON: boolean;
    SAT: boolean;
    SUN: boolean;
    THU: boolean;
    TUE: boolean;
    WED: boolean;
    closeHours: number;
    closeMinutes: number;
    openHours: number;
    openMinutes: number;
}

class WeekDay {
    day: string;
    value: boolean;
}

const CardsWorker = {
    returnLogo(card, baseUrl) {
        return card.businessType === bsTypeResume
            ? `${baseUrl}/assets/card/img/resume-logo.svg`
            : card.businessLogoThumbnailUrl;
    },

    getDataTarget(businessType) {
        return businessType === bsTypeResume ? 'modal-doc-viewer' : 'none';
    },

    setBusinessName(name) {
        if (name.includes('*pipe*')) {
            const namesArray = name.split('*pipe*');
            return `${namesArray[0]} | ${namesArray[1]}`;
        } else {
            return name;
        }
    },

    setContactBtnStyle(card) {
        if (card.businessType === bsTypeBasic || card.businessType === bsTypeEmployee) {
            return bsTypeBasic + '-gradient';
        } else if (card.businessType === bsTypeNonprofit) {
            return bsTypeNonprofit + '-gradient';
        } else if (card.businessType === bsTypeJob) {
            return bsTypeJob + '-gradient';
        } else {
            return bsTypeResume + '-gradient';
        }
    },

    setTextColor(card) {
        if (card.businessType === bsTypeBasic || card.businessType === bsTypeEmployee) {
            return `${bsTypeBasic}-color`;
        } else if (card.businessType === bsTypeNonprofit) {
            return `${bsTypeNonprofit}-color`;
        } else if (card.businessType === bsTypeJob) {
            return `${bsTypeJob}-color`;
        } else {
            return `${bsTypeResume}-color`;
        }
    },

    setRating(businessType) {
        return businessType === bsTypeBasic ? 'p-grid' : 'hide';
    },

    setMainInfoHeight(businessType) {
        return businessType === bsTypeBasic ? 'basic-height' : businessType === bsTypeJob ? 'job-height' : 'expand-height';
    },

    setSvgImages(card, partSrc, baseUrl) {
        if (card.businessType === bsTypeNonprofit) {
            return `${baseUrl}/assets/card/img/nonprofit-${partSrc}`;
        } else if (card.businessType === bsTypeResume) {
            return `${baseUrl}/assets/card/img/${bsTypeResume}-${partSrc}`;
        } else if (card.businessType === bsTypeJob) {
            return `${baseUrl}/assets/card/img/${bsTypeJob}-${partSrc}`;
        } else {
            return `${baseUrl}/assets/card/img/${bsTypeBasic}-${partSrc}`;
        }
    },

    getSugesstionsDisplayName(business) {
        let displayName;
        if (business.businessType === bsTypeNonprofit) {
            business.title = business.title.replace("*pipe*", " | ");
        }

        if (business.businessType === bsTypeNonprofit || business.businessType === bsTypeEmployee) {
            displayName = business.title;
            if (!business.isHideTitle && business.businessName) {
                displayName += " (" + business.businessName + ")";
            }
        }
        if (business.businessType === bsTypeBasic || business.businessType == bsTypeResume) {
            displayName = business.businessName;
            if (!business.isHideTitle && business.title) {
                displayName += " (" + business.title + ")";
            }
        }
        if (business.businessType === bsTypeJob) {
            displayName = business.businessName;
        }
        return displayName;
    },

    setMetaTags(card, imageLink, baseUrl, reviewsData) {
        if (baseUrl.includes('dev.pitch59.com')){
            imageLink = imageLink.replace('pitch59-prod', 'pitch59-dev-images');
        }else if (baseUrl.includes('staging.pitch59.com')){
            imageLink = imageLink.replace('pitch59-prod', 'pitch59-staging-images');
        }
        return `
            <meta name="apple-itunes-app" content="app-id=1502156356">
            <meta name="google-play-app" content="app-id=com.pitch.fiftynine">
            <meta property="og:title" content="${this.getSugesstionsDisplayName(card)}">
            <meta name="og:title" content="${this.getSugesstionsDisplayName(card)}">
            <meta name="og:description" content="${reviewsData ? reviewsData : ''}">
            <meta name="site_name" property="og:site_name" content="${card.businessType === 'service' || card.businessType === 'employee' ? card.title : card.businessName}">
            <meta property="og:image" content="${imageLink}">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="628">
            <meta property="og:url" content="${baseUrl}/card/${card.alias}">
            <meta name="twitter:card" content="summary_large_image">
        `
    },

    setMoreInfoContent(card) {
        if (card.businessType === 'job') {
            return `<div class="ui-dialog-content">
                        <div class="dialog-title"> Position Details </div>
                        <div class="job-detail-body mt-20 "><div class="grid align-baseline no-margins light-text">
                            <div class="text-right col-3"> Position Title </div>
                            <div class="col-9 normal-text large font-semibold text-ellipsis">${card.positions?.length ? card.positions[0].name : ''}</div>
                        </div>
                        <div class="grid no-margins light-text">
                            <div class="text-right col-3"> Compensation </div>
                            <div class="normal-text col-9" style="padding: 0.5em; overflow-wrap: anywhere">${this.compensationDescription(card) || ''}</div>
                        </div>
                        <div class="grid no-margins light-text">
                            <div class="text-right col-3"> Type </div>
                            <div class="normal-text col-9">${card.workTypes.map(x => x.name).join(', ')}</div>
                        </div>
                        ${this.setBenefits(card.benefits)}
                        <div class="grid no-margins light-text">
                            <div class="text-right col-3"> Location </div>
                            <div class="normal-text col-9">${this.getLocation(card) || ''}</div>
                        </div>
                        <div class="light-text">
                            <div class="text-right mb-5 col-3"> Requirements </div>
                            <div class="large-textarea normal-text">
                                <textarea disabled cols="30" rows="4" style="resize: none">${card.positionRequirements || ""}</textarea>
                            </div>
                        </div>
                    </div>
                    <div class="dialog-title mt-20 mb-5 "> Company Information </div>
                    <div class="job-detail-body">
                        <div class="grid no-margins light-text">
                            <div class="industry-tags col-6 no-padding">${this.setIndustries(card.industries)}</div>
                            <div class="grid justify-end col-6 no-padding no-margins">
                                <div class="logo-social-link pointer ${card?.facebookLink ? '' : 'hide'}">
                                    <a href="${card.facebookLink}" target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/pitch-card-svg/facebook-icon.svg" alt="facebook"/>
                                    </a>
                                </div>
                                <div class="logo-social-link pointer ${card?.instagramLink ? '' : 'hide'}">
                                    <a href="${card.instagramLink}" target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/pitch-card-svg/instagram-icon.svg" alt="instagram">
                                    </a>
                                </div>
                                <div class="logo-social-link pointer ${card?.linkedinLink ? '' : 'hide'}">
                                    <a href="${card.linkedinLink}" target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/pitch-card-svg/linkedin-icon.svg" alt="linkedin">
                                    </a>
                                </div>
                                <div class="logo-social-link pointer ${card?.pinterestLink ? '' : 'hide'}">
                                    <a href="${card.pinterestLink}" target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/pitch-card-svg/pinterest-icon.svg" alt="pinterest"/>
                                    </a>
                                </div>
                                <div class="logo-social-link pointer ${card?.twitterLink ? '' : 'hide'}">
                                    <a href="${card.twitterLink}" target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/pitch-card-svg/twitter-icon.svg" alt="twitter"/>
                                    </a>
                                </div>
                                <div class="logo-social-link pointer ${card?.calendarLink ? '' : 'hide'}">
                                    <a href="${card.calendarLink}" target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/schedule-outline.svg" alt="calendar"/>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="light-text mt-15">
                            <div class="large-textarea normal-text">
                                <textarea disabled cols="30" rows="4" style="resize: none">${card?.pricingModel ? card.pricingModel : ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            const moreInfoWorkingHours = this.formatBusinessHours(card);
            return `<div class="working-hours-container">
                ${card.workingHours.length && card.businessType !== 'resume' ? `
                    ${moreInfoWorkingHours.map(row => {
                return `<span class="working-hours-row">
                            ${row.workingDays.map((range, i, arr) => {
                    return range == arr[arr.length - 1] && range.length > 1 ? `<span>${range} : </span>` : `<span>${range}, </span>`
                }
                )}
                            <span>
                                ${row.openHours} - ${row.closeHours}
                            </span>
                        </span>`})}` : card.businessType !== 'resume' ? `<span>No Information</span>` : ``}
                </div>
                <div class="social-icons-container">
                    ${card.websiteLink ? `<div class="item-icon">
                        <a target="_blank" rel="noopener noreferrer"
                            href="${card.websiteLink.includes('https') ? card.websiteLink : 'https://' + card.websiteLink}">
                            <img src="/assets/images/pitch-card-svg/resume/web-icon.svg" alt="Website" />
                        </a>
                        <div class="icon-title">Website</div>
                    </div>` : ``}
                    ${card.facebookLink ? `<div class="item-icon">
                        <a target="_blank" rel="noopener noreferrer" href="${card.facebookLink}">
                            <img src="/assets/images/pitch-card-svg/resume/facebook-icon.svg" alt="Facebook" />
                        </a>
                        <div class="icon-title">Facebook</div>
                    </div>` : ``}
                    ${card.twitterLink ? `<div class="item-icon">
                        <a target="_blank" rel="noopener noreferrer" href="${card.twitterLink}">
                            <img src="/assets/images/pitch-card-svg/resume/twitter-icon.svg" alt="Twitter" />
                        </a>
                        <div class="icon-title">Twitter</div>
                    </div>` : ``}
                    ${card.instagramLink ? `<div class="item-icon">
                        <a target="_blank" rel="noopener noreferrer" href="${card.instagramLink}">
                            <img src="/assets/images/pitch-card-svg/resume/instagram-icon.svg" alt="Instagram" />
                        </a>
                        <div class="icon-title">Instagram</div>
                    </div>` : ``}
                    ${card.linkedinLink ? `<div class="item-icon">
                        <a target="_blank" rel="noopener noreferrer" href="${card.linkedinLink}">
                            <img src="/assets/images/pitch-card-svg/resume/linkedin-icon.svg" alt="Linkedin" />
                        </a>
                        <div class="icon-title">Linkedin</div>
                    </div>` : ``}
                    ${card.pinterestLink ? `<div class="item-icon">
                        <a target="_blank" rel="noopener noreferrer" href="${card.pinterestLink}">
                            <img src="/assets/images/pitch-card-svg/resume/pinterest-icon.svg" alt="Pinterest" />
                        </a>
                        <div class="icon-title">Pinterest</div>
                    </div>` : ``}
                </div>
                <div class="info-block">
                    <span id="pricingModel">${card.pricingModel ? card.pricingModel : `No Information`}</span>
                </div>`
        }
    },

    formatBusinessHours(card) {
        let workingHoursGroups = [];

        if (card.workingHours) {
            card.workingHours.forEach(timesheet => {
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
    },

    checkExistedHours(workingHoursGroups: workingHoursGroupModel[], timesheet: businessHoursModel): boolean {

        return workingHoursGroups.some((object, index) => {
            const equalHours = (
                object.openHours === timesheet.open.hours &&
                object.openMinutes === timesheet.open.minutes &&
                object.closeHours === timesheet.close.hours &&
                object.closeMinutes === timesheet.close.minutes
            );

            if (equalHours) {
                workingHoursGroups[index] = {
                    ...workingHoursGroups[index],
                    [WeekDaysEnum[timesheet.weekDay]]: true
                };
                return true;
            }

            return false;
        });
    },

    addDaysOffToEachGraph(workingHoursGroups: workingHoursGroupModel[]) {
        workingHoursGroups.forEach((object, index) => {
            const keys = Object.keys(WeekDaysEnum);
            const allDays = keys.slice(keys.length / 2, keys.length);

            allDays.forEach(day => {
                if (!object[day]) {
                    workingHoursGroups[index] = { ...workingHoursGroups[index], [day]: false }
                }
            });
        });
    },

    createWorkingSchedule(workingHoursGroups: workingHoursGroupModel[]) {
        let result = [];

        workingHoursGroups.forEach(workingHours => {
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
    },

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
    },

    getWorkingDays(workingHours: workingHoursGroupModel) {
        let days = [];
        let weekDays: WeekDay[] = this.setOrderedWeekDays(workingHours);

        Object.values(weekDays).forEach((weekDay: WeekDay, index) => {
            const allDays = Object.values(weekDays);
            const { day, value } = weekDay;

            if (!allDays[index - 1]?.value && !allDays[index + 1]?.value && value) {
                days.push(day);
            }

            if (!index && allDays[index + 1]?.value && value) {
                this.getDaysRange(allDays, index, days);
            }

            if (index && allDays[index + 1]?.value && value && !allDays[index - 1]?.value) {
                this.getDaysRange(allDays, index, days);
            }
        });

        return days;
    },

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
    },

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

        Object.entries(workingHours).forEach(entry => {
            const key = entry[0];
            const value = entry[1];

            if (Object.values(weekDays).some(value => value.day === key)) {
                const weekDay = Object.values(weekDays).find(value => value.day === key);
                weekDay.value = value;
            }
        })

        return weekDays;
    },

    setReviews(businessType) {
        if (businessType !== bsTypeResume) {
            return 'Testimonial';
        } else {
            return 'References';
        }
    },

    getMetaTagsDescription(reviewsData, businessType) {
        return `Video ${this.setReviews(businessType)} (${reviewsData.length
        })${reviewsData.length && businessType !== 'resume'
          ? ` | ${reviewsData.reduce((acc, category, index) => {
              if (index < 3 && reviewsData.length !== index + 1) {
                  return (acc += `${category} ● `);
              } else if (
                index === 3 ||
                (reviewsData.length < 4 &&
                  reviewsData.length === index + 1)
              ) {
                  return (acc += category);
              } else {
                  return acc;
              }
                }, '')}`
                : ''
            }`;
    },

    setAttributes(el, attrs) {
        for (let key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    },

    setWorkTypesList(workTypes) {
        if (!workTypes || workTypes.length == 0) {
            return "";
        }

        let workTypeList = workTypes.map(x => x.name).join(", ");

        if (workTypeList.length > 22) {
            return workTypes[0].name + " +" + (workTypes.length - 1);
        }
        else {
            return workTypeList;
        }
    },

    setIndustries(industries) {
        if (!industries || industries.length == 0) {
            return "";
        }

        let industriesList = "";

        for (let industry of industries) {
            industriesList += `<div class="industry-tag">[${industry.name}]</div>`
        }

        return industriesList;
    },

    setBenefits(benefits) {
        if (!benefits || benefits.length == 0) {
            return "";
        }

        return `<div class="job-compensation p-grid">${this.setBenefitsItems(benefits)}</div>`
    },

    setBenefitsItems(benefits) {
        let html = '';
        for (var benefit of benefits) {
            html += `<div class="job-compensation-badge bg-darkgrey white">${benefit.name}</div>`;
        }

        return html;
    },

    getCard(card, baseUrl) {
        let nameOne;
        let nameTwo;
        if (card.businessType === 'service' && card.title.includes('*pipe*')) {
            const nameArray = card.title.split('*pipe*');
            nameOne = nameArray[0];
            nameTwo = nameArray[1];
        }
        return `
            <div class="box-wrap search-result-thumbnail" id="card" >
                <div class="video-thumbnail hidden" data-toggle="modal" data-type="video" data-id="${card.id}" data-target="modal-video">
                    ${card.id ? `<img id="coverImage"
                        src="${card.videoCoverImageThumbnailUrl}?time=0" alt="Video cover">
                    <img class="play" src="${this.setSvgImages(card, 'play-outline.svg', baseUrl)}" alt="Play icon">
                    <video
                        class="video-js video-preview ${card.isMirrorVideo ? 'video-rotated' : ''}"
                        id="videoPlayer-0"
                        controls="false"
                        autoplay
                        playsinline
                        width="800"
                        height="auto"
                        preload="metadata"
                        webkit-playsinline="true"
                        disablePictureInPicture="true"
                        muted="true"
                        data-video="${card.videoFileUrl}"
                        ontimeupdate="onCardTimeUpdate(event)"
                        onclick="getModalData()"
                        ontap="getModalData()"
                    ></video>
                    <span class="countdown-timer" id="countdown-timer"></span>
                    ` : `<div
                        class="coming-soon"
                    >PitchCard not available</div>
                    <img class="play" src="${baseUrl}/assets/card/img/${card.businessType}-play-outline.svg" alt="Play icon">`}
                </div>
                
                <div class="info-wrap" data-card-type="${card.businessType}">
                    <div class="main-info ${this.setMainInfoHeight(card.businessType)}" ${card.id ? '' : 'style="visibility: hidden"'}>
                        <div class="thumb-logo ${card.businessType === 'basic' ? card.businessType : ''}">
                            ${!card.businessLogoThumbnailUrl && card.businessType !== 'resume' ? `
                            <div class="text-center">
                                <h2>Your logo</h2>
                            </div>
                            ` : card.businessType === 'resume' ? `<div class="resume-btn" data-toggle="modal" data-type="doc"
                                data-id="${card.id}" data-target="${this.getDataTarget(card.businessType)}">
                                <img src="${baseUrl}/assets/images/pitch-card-svg/resume/pricing-icon.svg" class="gs-icon">
                                <span>resume</span>
                            </div>` :
                `<img alt="Logo" class="${card.businessType === 'resume' ? 'resume-btn' : ''}"
                            rel="preload" src=${this.returnLogo(card, baseUrl)} data-toggle="modal" data-type="doc"
                            data-id="${card.id}" data-target="${this.getDataTarget(card.businessType)}"
                        >`}

                        </div>

                        <div class="cards-names-wrapper ${card.businessType !== bsTypeBasic && card.businessType !== bsTypeEmployee ? 'borders' : ''}
                            ${card.businessType === bsTypeNonprofit ? '' : 'hide'}">
                            <span class="business-title">${card.title ? nameTwo ? `<span>${nameOne}</span><span style="border-left: 1px solid #000000">${nameTwo}</span>` : card.title : 'Name'}</span>
                            <span class="business-name ${card.isHideTitle ? 'hide' : ''}">${card.businessName ? this.setBusinessName(card.businessName) : ''}</span>
                        </div>
                        <div class="cards-names-wrapper ${card.businessType !== bsTypeBasic && card.businessType !== bsTypeEmployee ? 'borders' : ''}
                            ${card.businessType === bsTypeResume ? '' : 'hide'}">
                            <span class="business-title">${card.businessName ? this.setBusinessName(card.businessName) : 'Full Name'}</span>
                        </div>
                        <div class="cards-names-wrapper ${card.businessType !== bsTypeBasic ? 'borders' : ''}
                            ${card.businessType === bsTypeEmployee ? '' : 'hide'}">
                            <span class="business-title">${card.title ? card.title : 'Your Name'}</span>
                            <span class="business-name ${card.isHideTitle ? 'hide' : ''}">${card.businessName ? this.setBusinessName(card.businessName) : ''}</span>
                        </div>
                        <div class="cards-names-wrapper basic ${card.businessType !== bsTypeBasic && card.businessType !== bsTypeEmployee ? 'borders' : ''}
                            ${card.businessType === bsTypeBasic ? '' : 'hide'}">
                            <span class="business-title">${card.businessName ? this.setBusinessName(card.businessName) : 'Business Name'}</span>
                            <span class="business-name ${card.isHideTitle ? 'hide' : ''}">${card.title ? card.title : ''}</span>
                        </div>
                        <div class="cards-names-wrapper ${card.businessType === bsTypeJob ? '' : 'hide'}">
                            <span class="business-name">${card.businessName ? this.setBusinessName(card.businessName) : 'Organization'}</span>
                        </div>
                    </div>
                    
                    <div class="main-info ${card.businessType === bsTypeJob ? 'hide' : ''}">
                        <div class="video-review button-hover ${card.businessType}-color ${card.businessType === bsTypeBasic && card.businessType !== bsTypeEmployee ? 'borders mt' : ''}"">
                            <div class="head ${this.setTextColor(card)}" data-target="reviews" data-toggle="modal" data-type="reviews" data-id="${card.id}" >
                                <img rel="preload" class="card-icon" src=${this.setSvgImages(card, 'play.svg', baseUrl)} alt="Play">
                                <span class="">Video ${this.setReviews(card.businessType)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="${this.setRating(card.businessType)}">
                            <div class="icon-box">
                                <div class="icons-wrap">
                                    <div>Customer Service</div>
                                    <div class="rating-stars">
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="icon-box">
                                <div class="icons-wrap">
                                    <div>Quality</div>
                                    <div class="rating-stars">
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                        <span><img rel="preload" src="${baseUrl}/assets/card/img/star.svg" class="star-icon" alt="Star"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="job-card-info pointer ${card.businessType === bsTypeJob ? '' : 'hide'}" data-target="modal_dialog_2" data-type="info" data-id="${card.id}" data-toggle="modal">
                    <div class="job-block grid align-baseline no-margins">
                        <div class="position text-ellipsis no-padding">${card.positions?.length ? card.positions[0].name : 'Position'}</div>
                    </div>
                    <div class="job-block grid align-baseline no-margins">
                        <div class="key text-right no-padding">Type</div>
                        <div class="value no-padding text-ellipsis">${this.setWorkTypesList(card.workTypes)}</div>
                    </div>
                    <div class="job-block grid align-baseline no-margins">
                        <div class="key text-right no-padding">Compensation</div>
                        <div class="value no-padding text-ellipsis">${this.compensationDescription(card) || ''}</div>
                    </div>
                    <div class="job-block grid align-baseline no-margins">
                        <div class="key text-right no-padding">Location</div>
                        <div class="value no-padding text-ellipsis">${this.getLocation(card) || ''}</div>
                    </div>
                    <div class="job-block-info">
                        <img src="${this.setSvgImages(card, 'info.svg', baseUrl)}" alt="job-more-info">
                    </div>
                </div>

                <div class="contact-block"  >
                    <div id="contactBtn" data-target="${card.businessType === bsTypeJob ? 'job-modal-authentification-choose' : 'modal_dropdown'}" data-toggle="modal" data-type="${card.businessType === bsTypeJob ? 'save' : 'contacts'}" data-id="${card.id}" class="contact-menu-button ${this.setContactBtnStyle(card)}">
                        ${card.businessType === bsTypeJob ? 'Apply Now' : 'Contact'} 
                    </div>
                </div>

                <div class="share-container">
                    <div id="choosePocket"
                        class="share-block button-hover ${this.setTextColor(card)}"
                        data-count="${card.employeePictureThumnailUrl?.length}"
                        data-target="modal-authentification-choose"
                        data-toggle="modal"
                        data-type="save"
                        data-id="${card.id}"
                    >
                        <div class="icon-wrap">
                            <img rel="preload" src=${this.setSvgImages(card, 'pocket.svg', baseUrl)} alt="Pocket">
                        </div>
                        <span>Save</span>
                    </div>
                    <div
                        class="share-block button-hover ${this.setTextColor(card)}"
                        ${card.businessType === bsTypeJob ?
                            'data-target="reviews" data-type="reviews"' :
                            'data-target="modal_dialog_2" data-type="info"'}
                        data-id="${card.id}"
                        data-toggle="modal"
                    >
                        <div class="icon-wrap">
                            <img
                                rel="preload"
                                src=${this.setSvgImages(card, card.businessType === bsTypeJob ? 'play.svg' : 'info.svg', baseUrl)}
                                alt="Info"
                            >
                        </div>
                        <span>${card.businessType === bsTypeJob ? 'Emp. Reviews' : 'More info'} </span>
                    </div>
                    <div
                        id="photos"
                        class="share-block button-hover ${this.setTextColor(card)}"
                        data-id="${card.id}"
                        data-target="${card.businessType === bsTypeJob ? 'modal_dropdown' : 'modal_dialog_slider'}"
                        data-toggle="modal" data-type="${card.businessType === bsTypeJob ? 'contacts' : 'real-gallery'}"
                    >
                        <div class="icon-wrap">
                            <img rel="preload" src=${this.setSvgImages(card, 'photos.svg', baseUrl)} alt="Photos">
                        </div>
                        <span>${card.businessType === bsTypeJob ? 'Contact' : 'Photos'}</span>
                    </div>
                    <div class="share-block ${this.setTextColor(card)}">
                        <div
                            data-target="modal_dialog_3"
                            data-toggle="modal"
                            data-type="share"
                            data-id="${card.id}"
                            class="contact-menu-button share-btn no-margin ${this.setContactBtnStyle(card)}"
                        >
                            Share
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    compensationDescription(card) {
        let compensationDescription = card
            ? this.calculateCompensationDescription(card)
            : '';
        compensationDescription = compensationDescription.trim() !== '' && compensationDescription.trim() !== '-'
            ? compensationDescription
            : '';
        return compensationDescription;
    },

    calculateCompensationDescription(card) {
        if (card?.compensationDescription || card?.isHideSalary) {
            return card.compensationDescription;
        }

        const minAmount = card?.minCompensationAmount >= 0
        && card?.minCompensationAmount !== null
        && card?.minCompensationAmount !== ''
            ? this.calculateAmount(card.minCompensationAmount) : '';
        const maxAmount = card?.maxCompensationAmount >= 0
        && card?.maxCompensationAmount !== null
        && card?.maxCompensationAmount !== ''
            ? this.calculateAmount(card.maxCompensationAmount) : '';
        const perPrefix = card?.compensationType && (maxAmount || minAmount) ? this.calculatePrefix(card.compensationType) : '';
        const benefits = card?.benefits?.length ? '+ Benefits' : '';

        if (!minAmount || !maxAmount) {
            return `${minAmount}${maxAmount}${perPrefix} ${benefits}`;
        }

        if (minAmount && maxAmount
            && (card.minCompensationAmount < card.maxCompensationAmount
                || card.minCompensationAmount > card.maxCompensationAmount)) {
            return `${minAmount}-${maxAmount}${perPrefix} ${benefits}`;
        }

        if (minAmount && maxAmount && card.minCompensationAmount === card.maxCompensationAmount) {
            return `${maxAmount}${perPrefix} ${benefits}`;
        }
        return '';
    },

    calculateAmount(amount) {
        if (amount.toString().length >= 4 && amount.toString().length <= 6) {
            return '$' + (Math.round((amount / 1_000) * 10) / 10).toFixed(1) + 'K';
        }
        if (amount.toString().length >= 7 && amount.toString().length <= 9) {
            return '$' + Math.round(amount / 1_000_000) + 'M';
        }
        if (amount.toString().length >= 10 && amount.toString().length <= 12) {
            return '$' + Math.round(amount / 1_000_000_000) + 'B';
        }
        return '$' + amount;
    },

    calculatePrefix(compensationTypes) {
        if (compensationTypes === CompensationTypes.Hourly) {
            return '/HR';
        }
        if (compensationTypes === CompensationTypes.Monthly) {
            return '/MO';
        }
        if (compensationTypes === CompensationTypes.Yearly) {
            return '/YR';
        }
        return '';
    },

    getLocation(card) {
        if (card?.isRemote) {
            return 'This position is remote.';
        } else {
            if (card.jobCity !== DEFAULT_CITY_ID || card?.jobState !== DEFAULT_STATE_ID) {
                return (card.jobCityName ? card.jobCityName : '')
                  + (card.jobCityName && card?.jobStateCode ? ', ' : '')
                  + (card?.jobStateCode ? card.jobStateCode : '');
            } else {
                return '';
            }
        }
    },

    getCardCategories(business) {
        if ((business?.businessType !== bsTypeJob && business?.businessType !== bsTypeResume) && business?.categories) {
            return this.getMetaTagsDescription(business.categories, business.businessType);
        } else if (business?.businessType === bsTypeJob && business?.industries) {
            return this.getMetaTagsDescription(this.convertTagsToStrings(business.industries), business.businessType);
        } else if (business?.businessType === bsTypeResume && business?.industries) {
            return this.getMetaTagsDescription(this.convertTagsToStrings(business.positions), business.businessType);
        } else {
            return '';
        }
    },

    convertTagsToStrings(array): string[] {
        const strings = [...array];
        return strings.map(i => i?.name ? i.name : '');
    }
};

export default CardsWorker;
