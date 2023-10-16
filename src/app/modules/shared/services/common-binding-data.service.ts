import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { StorageService } from './../../shared/services/storage.service';
import { AppSettings } from './../../shared/app.settings';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CommonBindingDataService {
  constructor(
    private restApiService: RestApiService,
    private storageService: StorageService,
    private translateService: TranslateService
  ) {
  }

  toGMT(now) {
    return new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    ).getTime();
  }

  toLocalTime(miliSeconds) {
    const now = new Date(miliSeconds);
    return new Date(
      miliSeconds + now.getTimezoneOffset() * 60000
    ).getTime();
  }

  toLocalDate(miliSeconds) {
    const now = new Date(miliSeconds);
    return new Date(miliSeconds + now.getTimezoneOffset() * 60000);
  }

  unitConversionMToKm(m) {
    const results = m / 1000;
    if (results > 0) {
      return results;
    } else {
      return 0;
    }
  }

  unitConversionKMToM(km) {
    const results = km * 1000;
    if (results > 0) {
      return results;
    } else {
      return 0;
    }
  }

  unitConversionMinToMiliseconds(min) {
    const results = min * 60 * 1000;
    if (results > 0) {
      return results;
    } else {
      return 0;
    }
  }

  unitConversionMilisecondsToMin(mili) {
    const results = mili / 60 / 1000;
    if (results > 0) {
      return results;
    } else {
      return 0;
    }
  }

  centerLatLng(dropPoints) {
    if (dropPoints.lenght === 0) {
      return 0;
    }
    const latArray = [];
    const lngArray = [];
    for (const points of dropPoints) {
      latArray.push(points.lat);
      lngArray.push(points.lng);
    }
    return this.findCenterDashLatLng(lngArray, latArray);
  }

  findCenterDashLatLng(lngArray, latArray) {
    const x1 = this.findMinMaxValue('min', lngArray);
    const x2 = this.findMinMaxValue('max', lngArray);
    const y1 = this.findMinMaxValue('min', latArray);
    const y2 = this.findMinMaxValue('max', latArray);
    const centerPoly = {
      lat: y1 + (y2 - y1) / 2,
      lng: x1 + (x2 - x1) / 2
    };
    return centerPoly;
  }

  findMinMaxValue(type, data) {
    if (type === 'max') {
      return Math.max.apply(null, data);
    } else {
      return Math.min.apply(null, data);
    }
  }

  getSpecificTimeout(code, subcode) {
    const timeouts = this.storageService.getItem(AppSettings.TIME_SETTINGS);
    if (timeouts !== null) {
      for (const item of timeouts[code]) {
        if (item.key === subcode) {
          return parseInt(item.value, 10);
        }
      }
    }
  }

  getLabel(string) {
    let select;
    this.translateService.get(string).subscribe((translatedValue) => {
      select = translatedValue;
    });
    return select;
  }

  telFormat(value) {
    if (value) {
      return value.replace(/^(\d{3})(\d{3})(\d{4}).*/, '($1) $2-$3');
    } else {
      return '';
    }
  }

  getState(response) {
    const states = [
      {
        label: this.getLabel('lbl_please_select'),
        value: ''
      }
    ];
    if (response) {
      for (const item of response) {
        states.push({
          label: item.name,
          value: item.stateId
        });
      }
    }
    return states;
  }

  getAgeGroup(response) {
    const states = [
      {
        label: this.getLabel('lbl_please_select'),
        value: ''
      }
    ];
    if (response) {
      for (const item of response) {
        states.push({
          label: item.ageGroupLabel,
          value: item.ageGroupId
        });
      }
    }
    return states;
  }

  getCities(response) {
    const cities = [
      {
        label: this.getLabel('lbl_please_select'),
        value: ''
      }
    ];
    if (response) {
      for (const item of response) {
        cities.push({
          label: item.name,
          value: item.cityId
        });
      }
    }
    return cities;
  }

  getDosageDays(response) {
    const medicationDosageDays = [];
    if (response) {
      for (const item of response) {
        medicationDosageDays.push({
          label: item.medicationDosageDayLabel,
          value: item.medicationDosageDayId
        });
      }
    }
    return medicationDosageDays;
  }

  getDosageUnits(response) {
    const medicationDosageUnits = [
      {
        label: this.getLabel('lbl_please_select'),
        value: ''
      }
    ];
    if (response) {
      for (const item of response) {
        medicationDosageUnits.push({
          label: item.medicationDosageUnitText,
          value: item.medicationDosageUnitId
        });
      }
    }
    return medicationDosageUnits;
  }

  getAnswerType(response) {
    const answerType = [];
    if (response) {
      for (const item of response) {
        answerType.push({
          label: item.answerTypeLabel,
          value: item.answerTypeId
        });
      }
    }
    return answerType;
  }

  getMedicatinDosageSkipReasons(response) {
    const medicationSkipReasons = [];
    if (response) {
      for (const item of response) {
        medicationSkipReasons.push({
          label: item.dosageSkipReason,
          value: item.dosageSkipReasonId
        });
      }
    }
    return medicationSkipReasons;
  }

  getMedicationFreqeuncies(response) {
    const medicationFrequencies = [
      {
        label: this.getLabel('lbl_please_select'),
        value: {}
      }
    ];
    if (response) {
      for (const item of response) {
        medicationFrequencies.push({
          label: item.medicationDosageFrequencyLabel,
          value: {
            medicationDosageFrequencyId:
            item.medicationDosageFrequencyId,
            defaultTimes: item.defaultTimes
          }
        });
      }
    }
    return medicationFrequencies;
  }

  msToHM(milliseconds: number) {
    // 1- Convert to seconds:
    let seconds = milliseconds / 1000;
    // 2- Extract hours:
    const hours = seconds / 3600; // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const minutes = seconds / 60; // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return hours + ':' + minutes;
  }

  timeToMilliseconds(mins, hh) {
    return mins * 60000 + hh * 60 * 60000;
  }

  duplicatesFromArray(arr) {
    const sorted_arr = arr.slice().sort();
    const results = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
      if (sorted_arr[i + 1] === sorted_arr[i]) {
        results.push(sorted_arr[i]);
      }
    }
    return results;
  }

  close(event: any) {
    const divsToHide = document.getElementsByClassName('grid-menu');
    for (let i = 0; i < divsToHide.length; i++) {
      divsToHide[i]['style'].display = 'none';
    }
  }

  onAPIValidation(error, errorList) {
    for (const l of error.fieldsErrors) {
      errorList[l['fieldName']].hasError = true;
      const errors = l.fieldsErrors;
      errorList[l['fieldName']].error[0] = errors[0].message;
    }
  }

  getParentNodes(classes, classString) {
    const parentNodes = [];
    for (let i = 0; i < classes.length; ++i) {
      const n = classes[i];

      if (
        n?.parentNode?.tagName?.toLowerCase() == 'div' ||
        n?.parentNode?.tagName?.toLowerCase() == 'li'
      ) {
        const sib = n.parentNode.nextElementSibling;
        if (
          (sib && sib?.tagName?.toLowerCase() == 'div') ||
          (sib && sib?.tagName?.toLowerCase() == 'li')
        ) {
          const as = sib.getElementsByClassName(classString);

          for (let j = 0; j < as.length; ++j) {
            parentNodes.push(as[j]);
          }
        }
      }
    }

    return parentNodes;
  }

  async copyToClipboard(value) {
    await navigator.clipboard
      .writeText(value)
      .then(() => true)
      .catch(() => false);
  }
}
