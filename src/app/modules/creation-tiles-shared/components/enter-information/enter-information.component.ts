import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { AppSettings } from '../../../shared/app.settings';
import { PitchCardType } from '../../../shared/enums/pitch-card-type.enum';
import { UserCommonService } from '../../../shared/services/user-common.service';
import { BusinessService } from '../../../business/services/business.service';
import { UiService } from '../../../shared/services/ui.service';
import { map } from 'rxjs/operators';
import {
  CreateEmployerPortalService,
  Step
} from '../../../create-employer-portal/create-employer-portal.service';
import { Router } from '@angular/router';
import { CreatePitchCardService } from '../../../create-pitch-card/create-pitch-card.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { StorageService } from '../../../shared/services/storage.service';
import { UserSession } from '../../../shared/models/user-session.model';

import { AutoComplete } from 'primeng/autocomplete';

@Component({
  selector: 'app-enter-information',
  templateUrl: './enter-information.component.html',
  styleUrls: ['./enter-information.component.scss']
})
export class EnterInformationComponent implements OnInit, OnDestroy {
  loaded: boolean;
  $validation: Subscription;
  $businessUpdate: Subscription;
  $formValue: Subscription = new Subscription();
  form: FormGroup;
  cardUrl = AppSettings.MAIN_URL + '/card/';
  hls;

  service: CreatePitchCardService | CreateEmployerPortalService;

  cities = [];
  filteredStatesList = [];
  filteredCitiesList = [];
  introTextTemplates: { Placeholder: string; Full: string };
  isDefaultTemplate: boolean;
  charLimit = 1600;
  addressCache: any = {};
  leftOutCategoryNames = '';
  showAliasSection = false;
  editAliasMode = false;
  availableAlias = false;
  streetAddress: string;
  contactNumber: string;
  validatedAddressCache: string;
  city: any;
  state: any;
  zip: string;
  latitude: number;
  longitude: number;
  showPdf = false;
  categoryQuery: string;
  showAdditionalNameField: boolean = false;
  isOrganization: boolean;

  fullName: string;
  emailId: string;
  contact: String;
  alias: String;

  pitchCardTypes = PitchCardType;
  introTextVariables: { value: string; label: string }[] = [];

  @ViewChild('cityField', {static: false}) cityInput: any;
  @ViewChild('stateNames', {static: false}) stateNames: AutoComplete;
  @ViewChild('uploadBtn', {static: false}) uploadBtn: ElementRef;
  @ViewChild('aliasInput', {static: false}) aliasInput: ElementRef;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (
      window.innerWidth < 768 &&
      document.getElementsByClassName('pac-container')
    ) {
      document.body.click();
    }
    if (this.dds.isMobile()) {
      const addressInput = document.getElementById('address');
      addressInput.blur();
    }
  }

  constructor(
    private router: Router,
    private userCommonService: UserCommonService,
    private businessService: BusinessService,
    private uiService: UiService,
    private changeDetectorRef: ChangeDetectorRef,
    private dds: DeviceDetectorService,
    public createEmployerPortalService: CreateEmployerPortalService,
    public createPitchCardService: CreatePitchCardService,
    private storageService: StorageService
  ) {
    this.setFormattedLocationAddress =
      this.setFormattedLocationAddress.bind(this);
    this.service = this.router.url.includes('/create')
      ? this.createPitchCardService
      : this.createEmployerPortalService;
    this.isOrganization =
      this.service.businessType === this.pitchCardTypes.EmployerPortal;
  }

  ngOnInit() {
    this.service.currentStep = Step.Information;

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });
    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.Information) {
        this.resetAddressErrors();
        this.service.changeCurrentSectionCompleted(this.form.valid);

        if (this.form.dirty) {
          this.checkAlias().then(() => {
            this.getChangedProperties();
            this.getPayload().then((payload) => {
              this.service.updateAndChangeStep(payload).subscribe(
                (result) => {
                },
                (error) => {
                  if (error.Code === 8011) {
                    this.form.controls['alias'].setErrors({
                      exists: true
                    });
                  } else {
                    this.uiService.errorMessage(
                      error.message
                    );
                  }
                }
              );
            });
          });
        } else {
          this.service.currentStep = this.service.moveToStep;
        }
      }
    });

    if (this.service.businessType === this.pitchCardTypes.Resume) {
      const myProfile: UserSession = this.storageService.getItem(
        AppSettings.USER_DETAILS,
        true
      );
      this.userCommonService.getUserProfile(myProfile.userId).subscribe(
        (result) => {
          this.fullName =
            result.data.firstName + ' ' + result.data.lastName;
          this.emailId = result.data.emailId;
          this.contact = result.data.contactNumber;
          this.alias =
            result.data.firstName + '-' + result.data.lastName;
          if (!this.form.controls.businessName.value) {
            this.form.controls.businessName.setValue(this.fullName);
            this.updateFieldOnBlur('title');
            this.updateNameOnBlur();
          }
          if (!this.form.controls.email.value) {
            this.form.controls.email.setValue(this.emailId);
            this.updateFieldOnBlur('email');
          }
          if (!this.form.controls.contactNumber.value) {
            this.form.controls.contactNumber.setValue(this.contact);
            this.updateFieldOnBlur('contactNumber');
          }
          if (!this.form.controls.alias.value) {
            this.form.controls.alias.setValue(
              this.formatToAlias(this.alias)
            );
          }
        },
        (error) => {
          this.uiService.errorMessage(error.Message);
        }
      );
    }
  }

  private getChangedProperties() {
    const changedProperties = [];

    Object.keys(this.form.controls).forEach((name) => {
      const currentControl = this.form.controls[name];

      if (currentControl.dirty) {
        changedProperties.push(name);
      }
    });

    console.log(changedProperties);
  }

  async getPayload() {
    if (
      this.form.value.isHideTitle &&
      this.form.value.businessType === PitchCardType.Employee
    ) {
      this.form.controls.businessName.enable();
    } else if (this.form.value.isHideTitle) {
      this.form.controls.title.enable();
    }

    const payload = {};

    Object.keys(this.form.controls).forEach((key: string) => {
      if (this.form.controls[key].dirty) {
        if (key === 'alias') {
          payload[key] = this.form.controls.alias.hasError('invalid')
            ? null
            : this.form.value[key];
        } else if (key === 'address') {
          payload[key] = this.form.controls.address.hasError(
            'notFound'
          )
            ? null
            : this.form.value[key];
        } else if (
          key === 'introductionOptions' &&
          this.form.value.businessType !== PitchCardType.Job &&
          this.form.value.businessType !==
          PitchCardType.EmployerPortal
        ) {
          payload['extraPhoneNumber'] =
            this.form.value.introductionOptions.extraPhoneNumber;
          payload['isEnabledIntroText'] =
            this.form.value.introductionOptions.isEnabledIntroText;
          payload['introText'] = this.computeIntroTextPayload();
        } else {
          payload[key] = this.form.value[key];
        }
      }
    });

    this.form
      .get('contactNumber')
      .patchValue(
        this.service.formatPhoneNumber(
          this.form.get('contactNumber').value
        )
      );

    if (this.form.get('state').value && !this.form.get('city').value) {
      payload['city'] = await this.checkCity(
        this.form.value['city'],
        this.form.value['state'].label
      );
    } else {
      payload['city'] =
        this.form.controls.city.valid &&
        this.form.value['city'] &&
        this.form.value['city'].value
          ? this.form.value['city'].value
          : AppSettings.DEFAULT_CITY_ID;
    }

    payload['state'] =
      this.form.value['state'] && this.form.value['state'].value
        ? this.form.value['state'].value
        : AppSettings.DEFAULT_STATE_ID;

    if (this.form.value.businessType === PitchCardType.Service) {
      const tempTitle = this.form.value['title'];
      payload['businessName'] = this.form.value.secondBusinessName
        ? this.form.value.businessName +
        ' | ' +
        this.form.value.secondBusinessName
        : this.form.value.businessName;
      payload['title'] = tempTitle;
    }
    if (
      (this.form.value.businessType === PitchCardType.Basic ||
        this.form.value.businessType === PitchCardType.Resume) &&
      !this.form.valid
    ) {
      payload['radius'] = 25;
    }
    if (this.form.value.businessType === PitchCardType.Resume) {
      payload['isHideAddress'] =
        this.form.get('isHideAddress').value !== null
          ? this.form.get('isHideAddress').value
          : true;
    }

    return payload;
  }

  computeIntroTextPayload() {
    if (
      this.service.businessType == PitchCardType.Employee &&
      this.isDefaultTemplate
    ) {
      return this.introTextTemplates.Placeholder;
    } else if (this.isDefaultTemplate) {
      return this.updateTemplate();
    } else {
      if (!(this.service instanceof CreateEmployerPortalService)) {
        const text =
          this.form.controls.introductionOptions.value.textValue;
        if (text?.length > this.charLimit) {
          return text.slice(0, this.charLimit);
        } else {
          return text;
        }
      } else {
        return null;
      }
    }
  }

  invalidCityState() {
    return (
      this.form.value['state'] &&
      this.form.value['state'].value &&
      this.form.value['city'] &&
      this.form.value['city'].elm &&
      this.form.value['city'].elm.stateId !=
      this.form.value['state'].value
    );
  }

  initializeForm() {
    this.cities = [];
    this.form = this.service.getBusinessForm();
    this.addressCache = {
      address: this.form.value.address,
      zip: this.form.value.zip
    };
    if (
      this.form.value.isHideTitle &&
      this.form.value.businessType === PitchCardType.Employee
    ) {
      this.form.controls.businessName.disable();
    } else if (
      this.form.value.isHideTitle &&
      this.form.value.businessType !== PitchCardType.Resume
    ) {
      this.form.controls.title.disable();
    }
    if (this.form.value.state) {
      if (
        !this.form.value.state ||
        this.form.value.state === AppSettings.DEFAULT_STATE_ID
      ) {
        this.form.controls.state.reset();
      } else if (this.form.value.state !== '0') {
        this.setState(this.form.value.state);
      }
    }

    if (this.form.get('zip')?.errors?.pattern) {
      this.form.get('zip').markAsDirty();
    }

    if (this.form.value.city) {
      if (this.form.value.city === AppSettings.DEFAULT_CITY_ID) {
        this.form.controls.city.reset();
      } else if (
        this.form.value.city &&
        this.form.value.city !== AppSettings.DEFAULT_CITY_ID &&
        this.form.value.city !== '0'
      ) {
        this.setCity(this.form.value.city);
      }
      this.service.tileFormGroup = this.form;
    }

    // this.form.controls.contactNumber.setValue(this.form.value.contactNumber);
    // this.form.controls.contactNumber.markAsDirty();
    // if (this.form.value.title) {
    //   this.form.controls.title.setValue(this.form.value.title);
    //   this.form.controls.title.markAsDirty();
    // }

    if (this.form.value.secondBusinessName) {
      this.showAdditionalNameField = true;
    }

    if (
      this.service.business?.businessType !== PitchCardType.Job &&
      this.service.business?.businessType !== PitchCardType.EmployerPortal
    ) {
      this.setIntroVariables();

      if (this.form.get('introductionOptions')?.value) {
        this.$formValue.add(
          this.form
            .get('introductionOptions')
            .valueChanges.subscribe((res) => {
            if (res) {
              Object.keys(res).forEach((key: string) => {
                this.service.updateDraftBusiness({
                  [key]: res[key]
                });
              });
            }
            this.isDefaultTemplate =
              this.compareWithDefaultTemplates();
          })
        );
        this.getIntroTextTemplate();
      }
    }
    this.service.tileRequiredState = this.form.valid;
    this.service.tileFormGroup = this.form;
  }

  async checkCity(city: string, state: string) {
    return this.userCommonService
      .getCityByText(`${city},${state}`)
      .pipe(
        map((result) => {
          return result ? result.id : AppSettings.DEFAULT_CITY_ID;
        })
      )
      .toPromise();
  }

  setFormattedLocationAddress(addressEvent) {
    console.log(addressEvent);
    if (addressEvent) {
      const street_number = this.service.getAddressComponent(
        addressEvent.address_components,
        'street_number'
      );
      const route = this.service.getAddressComponent(
        addressEvent.address_components,
        'route'
      );
      const city =
        this.service.getAddressComponent(
          addressEvent.address_components,
          'locality'
        ) ||
        this.service.getAddressComponent(
          addressEvent.address_components,
          'sublocality'
        ) ||
        '';
      const state = this.service.getAddressComponent(
        addressEvent.address_components,
        'administrative_area_level_1'
      );
      const zip = this.service.getAddressComponent(
        addressEvent.address_components,
        'postal_code'
      );

      if (street_number && route) {
        this.streetAddress = street_number + ' ' + route;
      } else if (
        !street_number &&
        !isNaN(+this.form.value.address.split(' ')[0]) &&
        route
      ) {
        this.streetAddress =
          this.form.value.address.split(' ')[0] + ' ' + route;
      } else {
        this.streetAddress = route;
      }
      this.form.controls.address.setValue(
        this.streetAddress ? this.streetAddress : ''
      );
      this.form.controls.address.markAsDirty();
      this.service.updateDraftBusiness({
        address: this.streetAddress ? this.streetAddress : ''
      });
      this.latitude = addressEvent.lat;
      this.longitude = addressEvent.lng;

      const selectedState = this.service.states.find(
        (elm) =>
          elm.elm.stateName === state || elm.elm.stateCode === state
      );
      if (selectedState) {
        this.state = selectedState;
        this.setState(selectedState.value);
        this.form.controls.state.markAsDirty();
        this.service.tileRequiredState = this.form.valid;
      }

      this.userCommonService.getCityByText(`${city},${state}`).subscribe(
        (result) => {
          if (result) {
            const selectedCity = {
              label: result.cityName,
              value: result.id,
              elm: result
            };
            this.city = selectedCity;
            this.setCity(selectedCity.value);
            this.service.updateDraftBusiness({
              city: selectedCity.value
            });
            this.service.tileRequiredState = this.form.valid;
          } else {
            this.form.controls.city.reset();
          }
        },
        (err) => {
          this.form.controls.city.setErrors({notFound: true});
        }
      );
      console.log('ZIP: ', zip);
      this.zip = zip;
      this.form.controls.zip.setValue(this.zip);
      this.form.controls.zip.markAsDirty();
      this.service.updateDraftBusiness({zip: zip});

      if (!this.streetAddress) {
        this.form.controls.address.setErrors({required: true});
      } else {
        this.form.controls.latitude.setValue(this.latitude);
      }
      this.form.controls.latitude.markAsDirty();
      this.form.controls.longitude.setValue(this.longitude);
      this.form.controls.longitude.markAsDirty();
    }
    this.changeDetectorRef.detectChanges();
  }

  updateAddress(event) {
    this.setFormattedLocationAddress(event);
    this.service.tileRequiredState = this.form.valid;
  }

  resetAddressErrors() {
    if (this.form.value.reviewedAddress) {
      this.addressCache.address = this.streetAddress;
      this.validatedAddressCache = this.setAddressQuery(
        this.streetAddress
      );
      if (this.streetAddress) {
        this.form.controls.address.setValue(this.streetAddress);
        this.form.controls.address.markAsDirty();
      }
      if (this.city) {
        this.form.controls.city.markAsDirty();
        this.form.controls.city.setValue(this.city);
      }

      if (this.state) {
        this.form.controls.state.markAsDirty();
        this.form.controls.state.setValue(this.state);
      }

      if (this.zip) {
        this.form.controls.zip.setValue(this.zip);
        this.form.controls.zip.markAsDirty();
      }
      this.form.controls.latitude.setValue(this.latitude);
      this.form.controls.longitude.setValue(this.longitude);
    } else {
      this.latitude = null;
      this.longitude = null;
      this.form.controls.latitude.reset();
      this.form.controls.longitude.reset();

      if (this.form.controls.city.errors) {
        const city = this.getCityLabel();
        if (city) {
          this.filterCities({query: city || ''});
        }
      }

      if (this.form.controls.state.errors) {
        const state = this.getStateLabel() || '';
        const stateElm = this.service.states.find(
          (e) =>
            e.elm.stateCode.toLowerCase() === state.toLowerCase() ||
            e.elm.stateName.toLowerCase() === state.toLowerCase()
        );

        if (!stateElm) {
          this.form.controls.state.setErrors({notFound: true});
        }
      }
    }

    if (this.form.controls.address.value) {
      this.form.controls.address.setErrors(null);
    }

    this.form.controls.reviewedAddress.reset();
  }

  setAddressQuery(address: string) {
    if (this.getCityLabel()) {
      address += `, ${this.getCityLabel()}`;
    }

    if (this.getStateLabel()) {
      address += `, ${this.getStateLabel()}`;
    }

    return address;
  }

  getCityLabel() {
    if (this.form.value.city) {
      if (this.form.value.city.label) {
        return this.form.value.city.label;
      } else {
        return this.form.value.city;
      }
    }
  }

  getStateLabel() {
    if (this.form.value.state) {
      if (this.form.value.state.label) {
        return this.form.value.state.label;
      } else if (this.form.value.state) {
        const state = this.service.states.find(
          (elm) =>
            elm.stateName === this.form.value.state ||
            elm.stateCode === this.form.value.state
        );
        return state && state.label;
      }
    }
  }

  async createAlias(val) {
    if (
      this.form.value.businessType === PitchCardType.Employee ||
      this.form.value.businessType === PitchCardType.Service
    ) {
      this.updateFieldOnBlur('title');
    } else {
      this.updateNameOnBlur();
    }

    this.form.controls.alias.setValue(this.formatToAlias(val));
    this.service.tileRequiredState = this.form.valid;

    switch (this.form.value.businessType) {
      case PitchCardType.Resume:
      case PitchCardType.Basic:
        if (val.length < 3 || !this.form.controls.businessName.dirty) {
          return;
        }
        break;
      case PitchCardType.Service:
      case PitchCardType.Employee:
        if (val.length < 3 || !this.form.controls.title.dirty) {
          return;
        }
        break;
    }

    await this.businessService
      .validateAlias(this.service.businessId, this.form.value.alias)
      .subscribe((response) => {
        this.showAliasSection = true;
        this.form.controls.alias.setValue(response.data);
        this.form.controls.alias.markAsDirty();
        this.service.updateDraftBusiness({alias: response.data});
      });
  }

  formatToAlias(val) {
    return val
      .toLowerCase()
      .slice(0, 40)
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/[-\s]+$/g, '')
      .replace(/^[-\s_]+/g, '')
      .replace(/[-]+/g, '-');
  }

  getIntroTextTemplate() {
    if (
      this.service.business?.businessType !== PitchCardType.Job &&
      !this.isOrganization
    ) {
      if (this.form.get('introductionOptions')?.value) {
        this.$formValue.add(
          this.businessService
            .getIntroTextTemplate(this.service.businessType)
            .subscribe((res) => {
              if (res?.data) {
                this.introTextTemplates = res.data;
                this.isDefaultTemplate =
                  this.compareWithDefaultTemplates();
                this.calculateIntroTextTemplate();
              }
            })
        );
      }
    }
  }

  calculateIntroTextTemplate() {
    if (
      !this.isOrganization &&
      this.service.business?.businessType !== PitchCardType.Job &&
      !(this.service instanceof CreateEmployerPortalService)
    ) {
      this.isDefaultTemplate = this.compareWithDefaultTemplates();
      if (this.isDefaultTemplate) {
        const template = this.updateTemplate();
        this.form.get('introductionOptions').patchValue({
          extraPhoneNumber: this.form.get('introductionOptions').value
            .extraPhoneNumber,
          isEnabledIntroText: this.form.get('introductionOptions')
            .value.isEnabledIntroText,
          introText: this.service.encodeExistIntroText(
            template === this.introTextTemplates.Full
              ? {
                name: this.form.get('title').value,
                companyName:
                this.form.get('businessName').value,
                template: this.introTextTemplates.Full
              }
              : this.service.businessType !==
              PitchCardType.Employee
                ? {
                  companyName:
                  this.form.get('businessName').value,
                  template: this.introTextTemplates.Placeholder
                }
                : {
                  name: this.form.get('title').value,
                  companyName:
                  this.form.get('businessName').value,
                  template: this.introTextTemplates.Placeholder
                }
          )
        });
      } else {
        this.form.get('introductionOptions').patchValue({
          extraPhoneNumber: this.form.get('introductionOptions').value
            .extraPhoneNumber,
          isEnabledIntroText: this.form.get('introductionOptions')
            .value.isEnabledIntroText,
          introText: this.service.extractHtmlContent(
            this.form.controls.introductionOptions.value.introText
          )
        });
      }
      this.form.get('introductionOptions').markAsDirty();
    }
  }

  compareWithDefaultTemplates() {
    if (!(this.service instanceof CreateEmployerPortalService)) {
      const {businessName, title} = this.form.value;
      const fullValue = this.introTextTemplates.Full
        ? this.removeStrongElements(
          this.service.encodeExistIntroText({
            name: title,
            companyName: businessName,
            template: this.introTextTemplates.Full
          })
        )
        : null;
      const placeholderValue = this.introTextTemplates.Placeholder
        ? this.removeStrongElements(
          this.service.encodeExistIntroText({
            companyName: businessName,
            template: this.introTextTemplates.Placeholder
          })
        )
        : null;
      const possibleValue = this.form.controls.introductionOptions.value
        .introText
        ? this.removeStrongElements(
          this.form.controls.introductionOptions.value.introText
        )
        : this.form.controls.introductionOptions.value.introText;
      return (
        possibleValue === fullValue ||
        possibleValue === placeholderValue
      );
    }
  }

  removeStrongElements(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, 'text/xml');
    const elements = doc.getElementsByTagName('strong');
    let index;
    for (index = elements.length - 1; index >= 0; index--) {
      elements[index].parentNode.removeChild(elements[index]);
    }
    return new XMLSerializer().serializeToString(doc);
  }

  updateTemplate(): string {
    if (this.introTextTemplates) {
      const {title, businessName, businessType} = this.form.value;
      if (title && businessName) {
        return this.introTextTemplates?.Full
          ? this.introTextTemplates.Full
          : '';
      } else if (
        (businessName && !title) ||
        (!businessName && !title) ||
        (businessType === PitchCardType.Employee && title)
      ) {
        return this.introTextTemplates?.Placeholder
          ? this.introTextTemplates.Placeholder
          : '';
      }
    }
  }

  resetOptions() {
    this.isDefaultTemplate = true;
    const template = this.updateTemplate();
    const {introductionOptions} = this.form.value;
    if (!(this.service instanceof CreateEmployerPortalService)) {
      this.form.get('introductionOptions').patchValue({
        ...introductionOptions,
        introText: this.service.encodeExistIntroText(
          template === this.introTextTemplates.Full
            ? {
              name: this.form.get('title').value,
              companyName: this.form.get('businessName').value,
              template: this.introTextTemplates.Full
            }
            : this.service.businessType !== PitchCardType.Employee
              ? {
                companyName: this.form.get('businessName').value,
                template: this.introTextTemplates.Placeholder
              }
              : {
                name: this.form.get('title').value,
                companyName: this.form.get('businessName').value,
                template: this.introTextTemplates.Placeholder
              }
        )
      });
    }
  }

  updateNameOnBlur() {
    if (
      this.showAdditionalNameField &&
      this.form.value.secondBusinessName
    ) {
      this.service.updateDraftBusiness({
        businessName:
          this.form.value.businessName +
          ' | ' +
          this.form.value.secondBusinessName
      });
    } else {
      if (this.form.value.businessType === PitchCardType.Service) {
        this.service.updateDraftBusiness({
          businessName: this.form.value.businessName
        });
      } else {
        this.service.updateDraftBusiness({
          businessName: this.form.value.businessName
        });
      }
    }
    this.service.tileRequiredState = this.form.valid;
  }

  updateFieldOnBlur(field: string) {
    if (
      field === 'title' &&
      this.form.value.businessType === PitchCardType.Service
    ) {
      this.service.updateDraftBusiness({
        title: this.form.value['title']
      });
    } else if (
      field === 'title' &&
      this.form.value.businessType === PitchCardType.Resume
    ) {
      this.form.controls['businessName'].markAsDirty();
    } else if (field === 'email' || field === 'websiteLink') {
      this.form.controls[field].setValue(
        this.form.value[field]?.toLowerCase()
      );
      if (
        field === 'websiteLink' &&
        !this.form.value[field].includes('http')
      ) {
        this.form.controls[field].setValue(
          'https://' + this.form.value[field]?.toLowerCase()
        );
      }
      this.form.controls[field].markAsDirty();
    } else if (field === 'contactNumber') {
      this.form.controls[field].setValue(
        this.service.formatPhoneNumber(this.form.value[field])
      );
      this.contactNumber = this.form.value[field];
      this.form.controls[field].markAsDirty();
    } else {
      this.service.updateDraftBusiness({
        [field]: this.form.value[field]
      });
    }
  }

  blockChars(e) {
    e.target.value = e.target.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
  }

  async onPaste(e: KeyboardEvent, control) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode == 86) {
      await navigator.clipboard
        .readText()
        .then((pastedData) => {
          this.form
            .get(control)
            .patchValue(
              pastedData
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*)\./g, '$1')
            );
        })
        .catch((err) => {
          this.uiService.errorMessage('Something going wrong');
        });
    }
  }

  async validateAlias(alias) {
    if (!alias || alias?.length < 3) {
      return;
    }

    alias = this.formatToAlias(alias);
    if (alias !== this.form.value.alias) {
      this.form.controls.alias.setValue(alias);
    }

    await this.businessService
      .validateAlias(this.service.businessId, alias)
      .subscribe((response) => {
        this.availableAlias = !(alias !== response.data);
        if (!this.availableAlias) {
          this.form.controls.alias.setErrors({invalid: true});
        } else {
          this.editAliasMode = false;
          setTimeout(() => {
            this.availableAlias = false;
          }, 3600);
          this.service.updateDraftBusiness({
            businessName: this.form.value.businessName,
            alias: response.data
          });
        }
        if (this.form.value.businessType === 'service') {
          this.service.updateDraftBusiness({
            businessName: this.form.value.title,
            alias: response.data
          });
        } else {
          this.service.updateDraftBusiness({
            businessName: this.form.value.businessName,
            alias: response.data
          });
        }
      });
  }

  checkAlias() {
    return new Promise((resolve, reject) => {
      this.businessService
        .validateAlias(this.service.businessId, this.form.value.alias)
        .subscribe((response) => {
          this.editAliasMode = false;
          this.form.controls.alias.setValue(response.data);
          this.form.controls.alias.markAsDirty();
          this.service.updateDraftBusiness({
            businessName: this.form.value.businessName,
            alias: response.data
          });
          resolve(null);
        });
    });
  }

  toggleEditAliasMode() {
    if (!this.form.controls.alias.errors) {
      this.editAliasMode = !this.editAliasMode;
    }
    if (this.editAliasMode) {
      setTimeout(() => {
        this.aliasInput.nativeElement.focus();
        this.aliasInput.nativeElement.select();
      }, 100);
    }
  }

  loadCities(stateId): Observable<any> {
    this.filteredCitiesList = [];
    return this.userCommonService.getCities(stateId).pipe(
      map((result) => {
        if (result.data && result.data.length) {
          this.cities = this.service.setDropDown(
            result.data,
            'cityName',
            'id'
          );
        }
      })
    );
  }

  setState(stateId) {
    const selectedState = this.service.states.find(
      (elm) => elm.value == stateId
    );
    if (selectedState) {
      this.form.controls.state.setValue(selectedState);
      this.addressCache.state = selectedState;
    }
  }

  setCity(cityId) {
    this.userCommonService
      .getCityById(cityId, false)
      .subscribe((result) => {
        if (result && result.data) {
          const selectedCity = {
            label: result.data.cityName,
            value: result.data.id,
            elm: result.data
          };
          this.form.controls.city.reset(selectedCity);
          this.changeDetectorRef.detectChanges();
          this.addressCache.city = selectedCity;
          this.service.tileRequiredState = this.form.valid;
        }
      });
  }

  filterStates(event) {
    this.filteredStatesList = [
      ...this.service.states.filter(
        (state) =>
          state.value !== '0' &&
          (state.elm.stateName
              .toLowerCase()
              .indexOf(event.query.toLowerCase()) === 0 ||
            state.elm.stateCode.toLowerCase() ===
            event.query.toLowerCase())
      )
    ];

    if (this.filteredStatesList.length === 1) {
      this.form.controls.state.markAsDirty();
      this.form.controls.state.setValue(this.filteredStatesList[0]);
      this.form.controls.state.setErrors(null);
    }

    if (this.filteredStatesList.length === 0) {
      this.form.controls.state.setErrors({notFound: true});
      this.form.controls.state.reset();
    }
    this.service.tileRequiredState = this.form.valid;
  }

  getState(value: any) {
    if (!value) {
      return null;
    }
    if (value && value.value) {
      return value.value;
    }

    const stateElm = this.service.states.find(
      (state) =>
        state.elm.stateCode.toLowerCase() === value.toLowerCase() ||
        state.elm.stateName.toLowerCase() === value.toLowerCase()
    );

    if (stateElm) {
      return stateElm.value;
    }

    return null;
  }

  filterCities(event) {
    const stateId = this.getState(this.form.value.state);

    this.businessService
      .searchCities(event.query, false, stateId)
      .subscribe((result) => {
        if (result?.length) {
          result.map((c, index) => {
            if (c.id === '0') {
              result.splice(index, 1);
            }
          });
        }
        this.filteredCitiesList = this.service.setDropDown(
          result,
          'cityName',
          'id'
        );
        if (this.filteredCitiesList.length === 1) {
          this.form.controls.city.markAsDirty();
          this.form.controls.city.setValue(
            this.filteredCitiesList[0]
          );
          this.setState(this.filteredCitiesList[0].elm.stateId);
        }

        this.form.controls.city.setErrors(null);

        if (this.filteredCitiesList.length === 0) {
          this.form.controls.city.setErrors({notFound: true});
        }
      });
    this.service.tileRequiredState = this.form.valid;
  }

  clearCityList(e, stateOrCity) {
    if (e && e.currentTarget && e.currentTarget.value.length === 0) {
      if (stateOrCity === 'state') {
        this.form.controls['state'].reset();
      }
      if (stateOrCity === 'city') {
        this.form.controls['city'].reset();
      }
    }
  }

  setIntroVariables() {
    this.introTextVariables = [];
    if (this.service.business?.businessName?.length) {
      this.introTextVariables.push({
        value: 'name',
        label: this.service.business.businessName
      });
    }
    if (this.service.business?.title?.length) {
      this.introTextVariables.push({
        value: 'company',
        label: this.service.business.title
      });
    }
  }

  toggleTitleField() {
    this.form.controls.isHideTitle.setValue(!this.form.value.isHideTitle);
    this.form.controls.isHideTitle.markAsDirty();
    if (!this.isOrganization) {
      this.form.value.isHideTitle
        ? this.form.controls.title.disable()
        : this.form.controls.title.enable();
    }
    this.form.controls.isHideTitle.markAsDirty();
    this.updateFieldOnBlur('isHideTitle');
  }

  toggleNameField() {
    this.form.controls.isHideTitle.setValue(!this.form.value.isHideTitle);
    this.form.controls.isHideTitle.markAsDirty();
    this.form.value.isHideTitle
      ? this.form.controls.businessName.disable()
      : this.form.controls.businessName.enable();
    this.form.controls.isHideTitle.markAsDirty();
    this.updateFieldOnBlur('isHideTitle');
  }

  addAnotherNameField() {
    this.showAdditionalNameField = true;
    this.form.controls.businessName.setValidators([
      Validators.maxLength(21),
      Validators.required
    ]);
    this.form.controls.secondBusinessName.setValidators([
      Validators.maxLength(21)
    ]);
  }

  removeAnotherNameField() {
    this.showAdditionalNameField = false;
    this.form.controls.businessName.setValidators(Validators.required);
    this.form.controls.secondBusinessName.setValidators(null);
    this.form.controls.secondBusinessName.setValue(null);
    this.form.controls.secondBusinessName.markAsDirty();
    this.updateNameOnBlur();
  }

  ngOnDestroy(): void {
    if (this.$validation) {
      this.$validation.unsubscribe();
    }
    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }
    if (this.$formValue) {
      this.$formValue.unsubscribe();
    }
  }
}
