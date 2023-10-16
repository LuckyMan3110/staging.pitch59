import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { CreatePitchCardService, Step } from '../create-pitch-card.service';
import { SplitCamelCasePipe } from '../../pitch-card-shared/pipes/split-camel-case.pipe';
import { CategoryTag } from '../../business/models/category-tag.model';
import { TagType } from '../../business/enums/tag-type.enum';
import { BusinessService } from '../../business/services/business.service';
import { UserCommonService } from '../../shared/services/user-common.service';
import { AppSettings } from '../../shared/app.settings';
import { map } from 'rxjs/operators';
import { CompensationTypes } from '../../shared/enums/compensation-types.enum';
import { WorkType } from '../../business/enums/work-type.enum';
import { UiService } from '../../shared/services/ui.service';
import { AutoComplete } from 'primeng/autocomplete';
import { Editor } from 'primeng/editor';

@Component({
  selector: 'app-position-detail',
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.scss']
})
export class PositionDetailComponent implements OnInit, OnDestroy {
  $validation: Subscription;
  $businessUpdate: Subscription;
  $positionSubs = new Subscription();
  positionForm: FormGroup;

  positionsSuggestions: CategoryTag[] = [];
  positionsQuery: string;
  checkedPositionSuggestions = [];

  workTypesSuggestions: any[] = [];

  benefitsSuggestions: any[] = [];

  filteredStatesList = [];
  filteredCitiesList = [];

  compensationTypesDropDown = [
    {value: {id: CompensationTypes.Hourly, name: ''}},
    {value: {id: CompensationTypes.Monthly, name: ''}},
    {value: {id: CompensationTypes.Yearly, name: ''}}
  ];
  workTypes = WorkType;

  addressCache: any = {};
  streetAddress: string;
  validatedAddressCache: string;
  city: any;
  state: any;
  zip: string;
  jobLatitude: number;
  jobLongitude: number;

  MAX_COUNT_OF_CHARS = AppSettings.MAX_CHARS_POSITION_TITLE;
  MIN_CHARS_FOR_SEARCH_INIT = AppSettings.MIN_CHARS_FOR_SEARCH_INIT;

  @ViewChild('jobAutocomplete') jobTitleAutocomplete: AutoComplete;
  @ViewChild('compensations') compensations: AutoComplete;
  @ViewChild('benefits') benefits: AutoComplete;
  @ViewChild('editor') editor: Editor;
  @ViewChild('extLinkInput', {static: false}) extLinkInput: ElementRef;

  constructor(
    private service: CreatePitchCardService,
    private splitCamelCase: SplitCamelCasePipe,
    private businessService: BusinessService,
    private changeDetectorRef: ChangeDetectorRef,
    private userCommonService: UserCommonService,
    private uiService: UiService
  ) {
    this.setFormattedLocationAddress =
      this.setFormattedLocationAddress.bind(this);
  }

  ngOnInit(): void {
    this.currentStepInit();
    this.getWorkTypeSuggestions();
    this.getBenefitsSuggestions();
    this.initCompensationTypesDropdown();
  }

  ngOnDestroy(): void {
    if (this.$validation) {
      this.$validation.unsubscribe();
    }

    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }

    if (this.$positionSubs) {
      this.$positionSubs.unsubscribe();
    }
  }

  currentStepInit() {
    this.service.currentStep = Step.Position;

    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.Position && this.positionForm) {
        setTimeout(() => {
          this.resetAddressErrors();
          this.service.changeCurrentSectionCompleted(
            this.positionForm.valid
          );

          if (this.positionForm.dirty) {
            this.getChangedProperties();
            this.getPayload().then((payload) => {
              this.service.updateAndChangeStep(payload).subscribe(
                (result) => {
                  if (this.service.finished) {
                    this.service.$finish.next();
                  }
                },
                (error) => {
                }
              );
            });
          } else {
            if (this.service.finished) {
              this.service.$finish.next();
            }
            this.service.currentStep = this.service.moveToStep;
          }
        }, 300);
      }
    });

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });
  }

  private getChangedProperties() {
    const changedProperties = [];

    Object.keys(this.positionForm.controls).forEach((name) => {
      const currentControl = this.positionForm.controls[name];

      if (currentControl.dirty) {
        changedProperties.push(name);
      }
    });

    console.log(changedProperties);
  }

  async getPayload() {
    const payload = {};

    Object.keys(this.positionForm.controls).forEach((key: string) => {
      if (this.positionForm.controls[key].dirty) {
        payload[key] = this.positionForm.get(key).value;
      }
    });

    if (payload.hasOwnProperty('compensationType')) {
      payload['compensationType'] = payload['compensationType'].value.id
        ? payload['compensationType'].value.id
        : null;
    }

    if (
      payload.hasOwnProperty('minCompensationAmount') ||
      payload.hasOwnProperty('maxCompensationAmount')
    ) {
      const min = parseInt(
        this.positionForm.get('minCompensationAmount').value,
        10
      );
      const max = parseInt(
        this.positionForm.get('maxCompensationAmount').value,
        10
      );
      if (min && max && min > max) {
        delete payload['minCompensationAmount'];
        delete payload['maxCompensationAmount'];
      }
    }

    if (
      this.positionForm.value['jobState'] &&
      this.positionForm.value['jobState'].value &&
      this.positionForm.value['jobCity'] &&
      !this.positionForm.value['jobCity'].value
    ) {
      payload['jobCity'] = await this.checkCity(
        this.positionForm.value['jobCity'],
        this.positionForm.value['jobState'].label
      );
    } else {
      payload['jobCity'] =
        this.positionForm.controls.jobCity.valid &&
        this.positionForm.value['jobCity'] &&
        this.positionForm.value['jobCity'].value
          ? this.positionForm.value['jobCity'].value
          : AppSettings.DEFAULT_CITY_ID;
    }
    payload['jobState'] =
      this.positionForm.value['jobState'] &&
      this.positionForm.value['jobState'].value
        ? this.positionForm.value['jobState'].value
        : AppSettings.DEFAULT_STATE_ID;

    if (payload.hasOwnProperty('positions')) {
      if (payload['positions'].hasOwnProperty('name')) {
        payload['positions'] = payload['positions']
          ? [payload['positions']]
          : null;
      } else {
        payload['positions'] = payload['positions']
          ? [
            {
              descriptors: '',
              id: 0,
              name: payload['positions'],
              order: 0,
              type: 1
            }
          ]
          : null;
      }
    }

    if (payload.hasOwnProperty('otherApplicationLink')) {
      if (!this.positionForm.get('otherApplicationLink').valid) {
        payload['otherApplicationLink'] = '';
      }
    }

    return payload;
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

  initializeForm() {
    this.positionForm = this.service.getBusinessForm();

    if (this.positionForm.value.jobState) {
      if (
        !this.positionForm.value.jobState ||
        this.positionForm.value.jobState ===
        AppSettings.DEFAULT_STATE_ID ||
        this.positionForm.value.jobState === '0'
      ) {
        this.positionForm.controls.jobState.reset();
      } else if (this.positionForm.value.jobState !== '0') {
        this.setState(this.positionForm.value.jobState);
      }
    }

    if (this.positionForm.value.jobCity) {
      if (
        this.positionForm.value.jobCity ===
        AppSettings.DEFAULT_CITY_ID ||
        this.positionForm.value.jobCity === '0'
      ) {
        this.positionForm.controls.jobCity.reset();
      } else if (
        this.positionForm.value.jobCity &&
        this.positionForm.value.jobCity !==
        AppSettings.DEFAULT_CITY_ID &&
        this.positionForm.value.jobCity !== '0'
      ) {
        this.setCity(this.positionForm.value.jobCity);
      }
    }

    if (this.positionForm.get('positions').value?.length) {
      this.positionForm
        .get('positions')
        .setValue(this.positionForm.get('positions').value[0]);
    }

    if (this.positionForm.get('compensationType').value) {
      this.positionForm.controls.compensationType.setValue(
        this.compensationTypesDropDown.find(
          (type) =>
            type.value.id ==
            this.positionForm.get('compensationType').value
        )
      );
    }

    this.positionForm.get('requireOtherApplicationMethod')?.value
      ? this.positionForm.get('otherApplicationLink').enable()
      : this.positionForm.get('otherApplicationLink').disable();

    this.$positionSubs.add(
      this.positionForm.valueChanges.subscribe((form) => {
        if (this.positionForm.valid) {
          this.service.changeCurrentSectionCompleted(
            this.positionForm.valid
          );
        }
      })
    );

    if (this.positionForm.get('jobZip')?.errors?.pattern) {
      this.positionForm.get('jobZip').markAsDirty();
    }

    this.updateJobAddressValidation();
    this.updateControlsValidation(
      'isHideSalary',
      'compensationDescription'
    );
    this.updateControlsValidation(
      'showRequirements',
      'positionRequirements'
    );
  }

  getWorkTypeSuggestions() {
    this.businessService
      .getTagsSuggestions('', [], TagType.WorkType)
      .subscribe((res) => {
        const idDiff = 1874;
        this.workTypesSuggestions = res.data.records;
        this.workTypesSuggestions.sort((a, b) =>
          a.id > b.id ? 1 : b.id > a.id ? -1 : 0
        );
        if (
          this.positionForm.value.workTypes?.length &&
          this.workTypesSuggestions?.length
        ) {
          const selectedWorkType =
            this.businessService.getSelectedItemsById(
              this.workTypesSuggestions,
              this.positionForm.value.workTypes
            );
          this.positionForm.controls.workTypes.setValue(
            selectedWorkType
          );
        }
      });
  }

  getBenefitsSuggestions() {
    this.businessService
      .getTagsSuggestions('', [], TagType.Benefits)
      .subscribe((res) => {
        const idDiff = 1874;
        this.benefitsSuggestions = res.data.records;
        // this.benefitsSuggestions.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
        if (
          this.positionForm.value.benefits?.length &&
          this.benefitsSuggestions?.length
        ) {
          const selectedBenefit =
            this.businessService.getSelectedItemsById(
              this.benefitsSuggestions,
              this.positionForm.value.benefits
            );
          this.positionForm.controls.benefits.setValue(
            selectedBenefit
          );
        }
      });
  }

  initCompensationTypesDropdown() {
    this.compensationTypesDropDown.map((t) => {
      t.value.name = <string>(
        this.splitCamelCase.transform(CompensationTypes[t.value.id])
      );
    });
  }

  suggestPositions(event) {
    this.positionsQuery = event.query;
    if (this.positionForm.get('positions')?.errors?.maxLength) {
      this.positionForm.get('positions').setErrors(null);
    }
    if (
      this.positionForm.get('positions').value &&
      this.positionsQuery?.length <= this.MAX_COUNT_OF_CHARS
    ) {
      this.businessService
        .getTagsSuggestions(
          this.positionsQuery,
          [],
          TagType.Position,
          null
        )
        .subscribe((result) => {
          this.positionsSuggestions = [
            new CategoryTag(
              '',
              0,
              this.service.capitalizeFirstLetter(
                this.positionsQuery
              ),
              0,
              TagType.Position
            ),
            ...result.data.records
          ];
          const removeNewSuggestion = this.positionsSuggestions.some(
            (elem) =>
              elem.name.toLowerCase() ===
              event.query.toLowerCase() && elem.id !== 0
          );
          removeNewSuggestion
            ? this.positionsSuggestions.splice(
              this.positionsSuggestions.length - 1,
              1
            )
            : undefined;
        });
    } else {
      const targetField = event.originalEvent.target;
      targetField.value = '';
      this.jobTitleAutocomplete.el.nativeElement.value = '';
      this.jobTitleAutocomplete.hide();
      this.changeDetectorRef.detectChanges();
      this.positionsQuery = '';
      this.checkedPositionSuggestions = [];
    }
  }

  applyUserTagForPositions(event) {
    const targetField = event?.target as HTMLInputElement;
    if (event?.keyCode == 13 && this.positionsQuery) {
      if (
        this.positionsQuery !== targetField.value ||
        this.positionsQuery.length < this.MIN_CHARS_FOR_SEARCH_INIT
      ) {
        this.positionsQuery = '';
      }
      let newTagsArr;
      if (this.checkedPositionSuggestions.length) {
        newTagsArr = this.checkedPositionSuggestions.reduce(
          (acc, position) => [...acc, position],
          this.positionForm.value.positions
        );
        this.jobTitleAutocomplete.el.nativeElement.value = '';
      } else {
        newTagsArr = this.positionForm.value.positions.concat(
          new CategoryTag(
            '',
            0,
            this.service.capitalizeFirstLetter(this.positionsQuery),
            0,
            TagType.Position
          )
        );
      }
      if (this.positionForm.get('positions').value.length < 1) {
        this.positionForm.controls.positions.setValue(newTagsArr);
        this.positionForm.controls.positions.markAsDirty();
      }

      this.changeDetectorRef.detectChanges();
      this.positionsQuery = '';
      this.checkedPositionSuggestions = [];
      this.jobTitleAutocomplete.hide();
    } else if (
      this.positionForm.get('positions')?.value[0]?.name?.length >
      this.MAX_COUNT_OF_CHARS
    ) {
      this.positionForm.get('positions').setErrors({maxLength: true});
    }
  }

  showNotApprovedSuggestionMessage(control) {
    if (this.positionForm.get(control)?.value?.some((item) => !item.id)) {
      return true;
    }
    return false;
  }

  minMaxValidation(event, control) {
    if (
      parseInt(this.positionForm.get('minCompensationAmount').value, 10) >
      parseInt(this.positionForm.get('maxCompensationAmount').value, 10)
    ) {
      this.positionForm.get(control).setErrors({rangeError: true});
    } else {
      this.positionForm.get('minCompensationAmount').setErrors(null);
      this.positionForm
        .get('minCompensationAmount')
        .updateValueAndValidity();

      this.positionForm.get('maxCompensationAmount').setErrors(null);
      this.positionForm
        .get('maxCompensationAmount')
        .updateValueAndValidity();
    }
    this.service.changeCurrentSectionCompleted(this.positionForm.valid);
  }

  blockSymbols(e) {
    e.target.value = e.target.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
  }

  async onPaste(e: KeyboardEvent, control) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode == 86) {
      await navigator.clipboard
        .readText()
        .then((pastedData) => {
          this.positionForm
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

  updateAddress(event) {
    this.setFormattedLocationAddress(event);
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
        !isNaN(+this.positionForm.value.jobAddress.split(' ')[0]) &&
        route
      ) {
        this.streetAddress =
          this.positionForm.value.jobAddress.split(' ')[0] +
          ' ' +
          route;
      } else {
        this.streetAddress = route;
      }
      this.positionForm.controls.jobAddress.setValue(
        this.streetAddress ? this.streetAddress : ''
      );
      this.positionForm.controls.jobAddress.markAsDirty();
      this.service.updateDraftBusiness({
        address: this.streetAddress ? this.streetAddress : ''
      });
      this.jobLatitude = addressEvent.lat;
      this.jobLongitude = addressEvent.lng;

      const selectedState = this.service.states.find(
        (elm) =>
          elm.elm.stateName === state || elm.elm.stateCode === state
      );
      if (selectedState) {
        this.state = selectedState;
        this.setState(selectedState.value);
        this.positionForm.controls.jobState.markAsDirty();
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
          } else {
            this.positionForm.controls.jobCity.reset();
          }
        },
        (err) => {
          this.positionForm.controls.jobCity.setErrors({
            notFound: true
          });
        }
      );
      console.log('ZIP: ', zip);
      this.zip = zip;
      this.positionForm.controls.jobZip.setValue(this.zip);
      this.positionForm.controls.jobZip.markAsDirty();
      this.service.updateDraftBusiness({zip: zip});

      if (!this.streetAddress) {
        this.positionForm.controls.jobAddress.setErrors({
          required: true
        });
      } else {
        this.positionForm.controls.jobLatitude.setValue(
          this.jobLatitude
        );
        this.positionForm.controls.jobLatitude.markAsDirty();
        this.positionForm.controls.jobLongitude.setValue(
          this.jobLongitude
        );
        this.positionForm.controls.jobLongitude.markAsDirty();
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  setState(stateId) {
    const selectedState = this.service.states.find(
      (elm) => elm.value == stateId
    );
    if (selectedState) {
      this.positionForm.controls.jobState.setValue(selectedState);
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
          this.positionForm.controls.jobCity.reset(selectedCity);
          this.changeDetectorRef.detectChanges();
          this.addressCache.city = selectedCity;
          this.updateFieldOnBlur('jobCity');
        }
      });
  }

  updateFieldOnBlur(field: string) {
    if (field === 'websiteLink') {
      this.positionForm.controls[field].setValue(
        this.positionForm.value[field]?.toLowerCase()
      );
      this.positionForm.controls[field].markAsDirty();
    } else if (field === 'positions') {
      this.service.updateDraftBusiness({
        [field]: [this.positionForm.get(field).value]
      });
    } else if (
      field === 'compensationType' &&
      this.positionForm.get(field).value
    ) {
      this.service.updateDraftBusiness({
        [field]: this.positionForm.get(field).value.value.id
      });
    } else if (field === 'jobCity' || field === 'jobState') {
      this.service.updateDraftBusiness({
        jobCityName: this.positionForm.get('jobCity').value?.label
          ? this.positionForm.get('jobCity').value.label
          : '',
        jobStateCode: this.positionForm.get('jobState').value?.label
          ? this.positionForm.get('jobState').value.label
          : ''
      });
    } else if (field === 'isHideSalary') {
      this.updateControlsValidation(
        'isHideSalary',
        'compensationDescription'
      );
      this.service.updateDraftBusiness({
        [field]: this.positionForm.get(field).value
      });
    } else if (field === 'compensationDescription') {
      this.service.updateDraftBusiness({
        [field]: this.positionForm.get(field).value
      });
      this.service.changeCurrentSectionCompleted(this.positionForm.valid);
    } else if (field === 'isRemote') {
      this.updateJobAddressValidation();
      this.service.updateDraftBusiness({
        [field]: this.positionForm.get(field).value
      });
    } else if (
      field === 'minCompensationAmount' ||
      field === 'maxCompensationAmount'
    ) {
      if (this.positionForm.get('minCompensationAmount').valid) {
        this.service.updateDraftBusiness({
          ['minCompensationAmount']:
            this.positionForm.value['minCompensationAmount']
        });
      } else {
        this.service.updateDraftBusiness({
          ['minCompensationAmount']: null
        });
      }

      if (this.positionForm.get('maxCompensationAmount').valid) {
        this.service.updateDraftBusiness({
          ['maxCompensationAmount']:
            this.positionForm.value['maxCompensationAmount']
        });
      } else {
        this.service.updateDraftBusiness({
          ['maxCompensationAmount']: null
        });
      }
    } else if (field === 'requireOtherApplicationMethod') {
      if (!this.positionForm.get('requireOtherApplicationMethod').value) {
        this.positionForm.get('otherApplicationLink').patchValue('');
        this.positionForm.get('otherApplicationLink').markAsDirty();
        this.positionForm.get('otherApplicationLink').disable();
      } else {
        this.positionForm.get('otherApplicationLink').enable();
        this.positionForm.get('otherApplicationLink').markAsPristine();

        if (this.extLinkInput?.nativeElement) {
          setTimeout(() => {
            this.extLinkInput.nativeElement.focus();
          }, 500);
        }
      }

      this.updateControlsValidation(
        'requireOtherApplicationMethod',
        'otherApplicationLink',
        [
          Validators.required,
          Validators.pattern(AppSettings.WEBSITE_PATTERN)
        ]
      );
      this.service.updateDraftBusiness({
        [field]: this.positionForm.get(field).value
      });
    } else if (field === 'otherApplicationLink') {
      this.service.updateDraftBusiness({
        [field]: this.positionForm.value[field]
      });
      this.service.changeCurrentSectionCompleted(this.positionForm.valid);
    } else {
      this.service.updateDraftBusiness({
        [field]: this.positionForm.value[field]
      });
    }
  }

  updateFieldOnType(e, field) {
    if (this.editor?.el?.nativeElement) {
      this.editor.el.nativeElement.classList.remove('ng-invalid');
    }

    if (!e?.textValue?.length || !e?.htmlValue?.length) {
      this.positionForm.get(field).patchValue('');
    }

    if (
      this.positionForm.get(field).invalid &&
      this.positionForm.get(field).touched
    ) {
      this.editor.el.nativeElement.classList.add('ng-invalid');
    }

    if (e?.delta?.ops?.length) {
      e.delta.ops.map((o) => {
        if (
          o?.attributes?.link &&
          !o?.attributes?.link.includes('https://')
        ) {
          e.htmlValue = e.htmlValue.replace(
            o.attributes.link,
            'https://' + o.attributes.link
          );
          o.attributes.link = 'https://' + o.attributes.link;
          this.editor.value = e.htmlValue;
          this.positionForm.get(field).patchValue(this.editor.value);
        }
      });
    }

    setTimeout(() => {
      this.service.updateDraftBusiness({[field]: [this.editor.value]});
    }, 500);
  }

  addPrefix(control) {
    if (
      !this.positionForm.get(control)?.value.includes('https') &&
      this.positionForm.get(control)?.value?.length >= 3
    ) {
      this.positionForm
        .get(control)
        .patchValue(
          'https://' +
          (this.positionForm.get(control)?.value
            ? this.positionForm.get(control).value
            : '')
        );
    }
  }

  updateJobAddressValidation() {
    const validators = !this.positionForm.get('isRemote').value
      ? [Validators.required]
      : [];
    const validatorsZipCode = !this.positionForm.get('isRemote').value
      ? [
        Validators.required,
        Validators.pattern(AppSettings.ZIPCODE_PATTERN)
      ]
      : [Validators.pattern(AppSettings.ZIPCODE_PATTERN)];

    this.positionForm.get('jobAddress').setValidators(validators);
    this.positionForm.get('jobAddress').updateValueAndValidity();

    this.positionForm.get('jobState').setValidators(validators);
    this.positionForm.get('jobState').updateValueAndValidity();

    this.positionForm.get('jobCity').setValidators(validators);
    this.positionForm.get('jobCity').updateValueAndValidity();

    this.positionForm.get('jobZip').setValidators(validatorsZipCode);
    this.positionForm.get('jobZip').updateValueAndValidity();

    this.service.changeCurrentSectionCompleted(this.positionForm.valid);
  }

  updateControlsValidation(checkedControl, updateControl, validatorsList?) {
    const validators = this.positionForm.get(checkedControl).value
      ? validatorsList?.length
        ? validatorsList
        : [Validators.required]
      : [];

    this.positionForm.get(updateControl).setValidators(validators);
    this.positionForm.get(updateControl).updateValueAndValidity();

    this.service.changeCurrentSectionCompleted(this.positionForm.valid);
  }

  filterCities(event) {
    const stateId = this.getState(this.positionForm.value.jobState);

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
          this.positionForm.controls.jobCity.markAsDirty();
          this.positionForm.controls.jobCity.setValue(
            this.filteredCitiesList[0]
          );
          this.setState(this.filteredCitiesList[0].elm.stateId);
        }

        this.positionForm.controls.jobCity.setErrors(null);

        if (this.filteredCitiesList.length === 0) {
          this.positionForm.controls.jobCity.setErrors({
            notFound: true
          });
        }
      });
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
      this.positionForm.controls.jobState.markAsDirty();
      this.positionForm.controls.jobState.setValue(
        this.filteredStatesList[0]
      );
      this.positionForm.controls.jobState.setErrors(null);
    }

    if (this.filteredStatesList.length === 0) {
      this.positionForm.controls.jobState.setErrors({notFound: true});
      this.positionForm.controls.jobState.reset();
    }
  }

  clearCityList(e, stateOrCity) {
    if (e && e.currentTarget && e.currentTarget.value.length === 0) {
      if (stateOrCity === 'state') {
        this.positionForm.controls['jobState'].reset();
      }
      if (stateOrCity === 'city') {
        this.positionForm.controls['jobCity'].reset();
      }
    }
  }

  resetAddressErrors() {
    this.jobLatitude = null;
    this.jobLongitude = null;
    this.positionForm.controls.jobLatitude.reset();
    this.positionForm.controls.jobLongitude.reset();

    if (this.positionForm.controls.jobCity.errors) {
      const city = this.getCityLabel();
      if (city) {
        this.filterCities({query: city || ''});
      }
    }

    if (this.positionForm.controls.jobState.errors) {
      const state = this.getStateLabel() || '';
      const stateElm = this.service.states.find(
        (e) =>
          e.elm.stateCode.toLowerCase() === state.toLowerCase() ||
          e.elm.stateName.toLowerCase() === state.toLowerCase()
      );

      if (!stateElm) {
        this.positionForm.controls.jobState.setErrors({
          notFound: true
        });
      }
    }

    if (this.positionForm.controls.jobAddress.value) {
      this.positionForm.controls.jobAddress.setErrors(null);
    }
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
    if (this.positionForm.value.jobCity) {
      if (this.positionForm.value.jobCity.label) {
        return this.positionForm.value.jobCity.label;
      } else {
        return this.positionForm.value.jobCity;
      }
    }
  }

  getStateLabel() {
    if (this.positionForm.value.jobState) {
      if (this.positionForm.value.jobState.label) {
        return this.positionForm.value.jobState.label;
      } else if (this.positionForm.value.jobState) {
        const state = this.service.states.find(
          (elm) =>
            elm.stateName === this.positionForm.value.jobState ||
            elm.stateCode === this.positionForm.value.jobState
        );
        return state && state.label;
      }
    }
  }
}
