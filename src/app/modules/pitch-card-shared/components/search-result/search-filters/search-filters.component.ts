import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  FilterState,
  SearchService,
  SearchTypes,
  SuggestionsFilter
} from '../search.service';
import { FormGroup } from '@angular/forms';
import { BusinessService } from '../../../../business/services/business.service';
import { TagType } from '../../../../business/enums/tag-type.enum';
import { CategoryTag } from '../../../../business/models/category-tag.model';
import { CreatePitchCardService } from '../../../../create-pitch-card/create-pitch-card.service';
import { Subject, Subscription } from 'rxjs';
import { CompensationTypes } from '../../../../shared/enums/compensation-types.enum';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SplitCamelCasePipe } from '../../../pipes/split-camel-case.pipe';
import { MultiSelect } from 'primeng/multiselect';
import { debounceTime } from 'rxjs/operators';
import { StorageService } from '../../../../shared/services/storage.service';
import { AppSettings } from '../../../../shared/app.settings';
import { NavigationStart, Router } from '@angular/router';
import { AutoComplete } from 'primeng/autocomplete';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() searchType: number;
  @Output() appliedFilters: EventEmitter<any> = new EventEmitter();

  form: FormGroup;
  searchTypes = SearchTypes;
  $filterSubscription = new Subscription();

  suggestedCities = [];
  zip: string = '';

  educationalSuggestions: CategoryTag[] = [];
  compensationTypeSuggestions: CategoryTag[] = [];
  industrySuggestions: CategoryTag[] = [];
  benefitsSuggestions: CategoryTag[] = [];

  SuggestionsFilter = SuggestionsFilter;
  educationalQuery: string;
  compensationTypeQuery: string;
  industryQuery: string;
  benefitsQuery: string;

  educationLevel = this.searchService.educationLevel;

  maxNumbersOfReviews: number;

  workTypesSuggestions: any[] = [];

  compensationTypesDropDown = [
    {value: {id: CompensationTypes.Hourly, name: ''}},
    {value: {id: CompensationTypes.Monthly, name: ''}},
    {value: {id: CompensationTypes.Yearly, name: ''}}
  ];

  searchEducationSub: Subject<any> = new Subject();

  isDesktop: boolean = this.deviceService.isDesktop();
  isMobile: boolean = this.deviceService.isMobile();

  @ViewChild('location') location: AutoComplete;
  @ViewChild('searchEducation') searchEducation: MultiSelect;
  @ViewChild('workTypes') workTypes: MultiSelect;
  @ViewChild('employmentTypes') employmentTypes: MultiSelect;

  constructor(
    private router: Router,
    private searchService: SearchService,
    private businessService: BusinessService,
    private service: CreatePitchCardService,
    private changeDetectorRef: ChangeDetectorRef,
    private splitCamelCase: SplitCamelCasePipe,
    private deviceService: DeviceDetectorService,
    private storageService: StorageService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.searchType?.currentValue !== null) {
      this.form = null;
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.initData();
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    if (this.form) {
      if (
        this.form.get('location').value?.length &&
        !this.location?.inputEL?.nativeElement?.value?.length
      ) {
        this.location.inputEL.nativeElement.value =
          this.form.get('location').value;
      }
    }
  }

  ngOnDestroy() {
    if (this.$filterSubscription) {
      this.$filterSubscription.unsubscribe();
    }
  }

  createForm() {
    this.form = this.searchService.getFilterForm(this.searchType);

    if (this.searchType === SearchTypes.Jobs) {
      this.onCompensationTypeChange();
    }
  }

  initData() {
    if (
      this.searchType === SearchTypes.Businesses ||
      this.searchType === SearchTypes.Nonprofit
    ) {
      this.getMaxNumberOfReviews();
    }
    if (
      this.searchType === SearchTypes.Jobs ||
      this.searchType === SearchTypes.Resumes
    ) {
      this.getWorkTypeSuggestions(SuggestionsFilter.NotEmptyCount);
    }
    if (this.searchType === SearchTypes.Resumes) {
      this.getEducationalSuggestions('', SuggestionsFilter.NotEmptyCount);
    }
    if (this.searchType === SearchTypes.Jobs) {
      this.getIndustrySuggestions();
      this.getCompensationTypeSuggestions();
      this.initCompensationTypesDropdown();
      this.getBenefitsSuggestions();
    }
  }

  initSubscriptions() {
    this.searchEducationSub.pipe(debounceTime(500)).subscribe((target) => {
      this.initSearchEducationalSuggestions(target);
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!event.url.includes('types=')) {
          this.searchService.clearFormDataFromStorage();
        }
      }
    });

    this.$filterSubscription.add(
      this.form.valueChanges.subscribe((r) => {
        if (r?.location && typeof r?.location === 'string') {
          r.location = '';
        }
        this.searchService.hasFilters = !this.searchService.isEmptyForm(
          this.populateFormValues()
        );
        this.searchService.currentFilterState = this.searchService
          .hasFilters
          ? FilterState.Draft
          : FilterState.None;
        this.storageService.setSession(
          AppSettings.FILTER_STATE,
          this.searchService.currentFilterState
        );
        if (this.form) {
          this.searchService.filterForm = this.populateFormValues();
          this.storageService.setSession(
            AppSettings.FILTER_FORM,
            this.populateFormValues()
          );
        }
      })
    );
  }

  initSearchEducationalSuggestions(e) {
    if (!this.searchEducation?.optionsToRender?.length) {
      this.getEducationalSuggestions(
        e.filter,
        SuggestionsFilter.EmptyCount
      );
    }
  }

  onCompensationTypeChange() {
    if (
      this.form.value.compensationTypes &&
      Object.keys(this.form.value.compensationTypes).length === 0
    ) {
      this.form.controls.minCompensationAmount.disable();
      this.form.controls.maxCompensationAmount.disable();
    } else {
      this.form.controls.minCompensationAmount.enable();
      this.form.controls.maxCompensationAmount.enable();
    }
  }

  getMaxNumberOfReviews() {
    this.$filterSubscription.add(
      this.searchService.maxLengthReviews().subscribe((res) => {
        if (res.data) {
          this.maxNumbersOfReviews = res.data;
        }
      })
    );
  }

  searchCities(event) {
    this.businessService.searchCities(event.query).subscribe((result) => {
      this.suggestedCities = result;
      this.zip = !isNaN(event.query) ? event.query : '';
    });
  }

  setCommonField(control) {
    if (this.zip) {
      this.form
        .get(control)
        .setValue({
          ...this.form.get(control).value,
          zipCode: this.zip
        });
    }
    this.searchService.commonFormControls[control] =
      this.form.get(control).value;
    this.storageService.setSession(
      AppSettings.COMMON_FILTERS,
      this.searchService.commonFormControls
    );
  }

  setLocationData(e, control) {
    if (
      e?.target?.value &&
      AppSettings.ZIPCODE_PATTERN.test(e?.target?.value)
    ) {
      this.zip = e.target.value;
      this.searchService.commonFormControls[control] = this.zip;
      this.storageService.setSession(
        AppSettings.COMMON_FILTERS,
        this.searchService.commonFormControls
      );
    }
  }

  suggestEducational(event) {
    this.educationalQuery = event.query;
    this.businessService
      .getTagsSuggestions(
        this.educationalQuery,
        this.form.get('educationalInstitutions').value.map((x) => x.id),
        TagType.EducationalInstitution,
        null
      )
      .subscribe((result) => {
        if (result.data?.records?.length) {
          this.educationalSuggestions = result.data.records;
        }
        const removeNewSuggestion = this.educationalSuggestions.some(
          (elem) => elem.id == 0
        );
        removeNewSuggestion
          ? this.educationalSuggestions.splice(
            this.educationalSuggestions.length - 1,
            1
          )
          : undefined;
      });
  }

  applyUserTagForEducational(event: KeyboardEvent) {
    const targetField = event.target as HTMLInputElement;
    if (event.keyCode == 13 && this.educationalQuery) {
      if (
        this.educationalQuery !== targetField.value ||
        this.educationalQuery.length < 3
      ) {
        this.educationalQuery = '';
      }
      const newTagsArr = this.form.value.educationalInstitutions.concat(
        new CategoryTag(
          '',
          0,
          this.service.capitalizeFirstLetter(this.educationalQuery),
          0
        )
      );
      this.form.controls.educationalInstitutions.setValue(newTagsArr);
      this.changeDetectorRef.detectChanges();
      this.educationalQuery = '';
      targetField.value = '';
    }
  }

  applyUserTagForCompensationType(event: KeyboardEvent) {
    const targetField = event.target as HTMLInputElement;
    if (event.keyCode == 13 && this.compensationTypeQuery) {
      if (
        this.compensationTypeQuery !== targetField.value ||
        this.compensationTypeQuery.length < 3
      ) {
        this.compensationTypeQuery = '';
      }
      const newTagsArr = this.form.value.compensationTypes.concat(
        new CategoryTag(
          '',
          0,
          this.service.capitalizeFirstLetter(
            this.compensationTypeQuery
          ),
          0
        )
      );
      this.form.controls.compensationTypes.setValue(newTagsArr);
      this.changeDetectorRef.detectChanges();
      this.compensationTypeQuery = '';
      targetField.value = '';
    }
  }

  applyUserTagForIndustry(event: KeyboardEvent) {
    const targetField = event.target as HTMLInputElement;
    if (event.keyCode == 13 && this.industryQuery) {
      if (
        this.industryQuery !== targetField.value ||
        this.industryQuery.length < 3
      ) {
        this.industryQuery = '';
      }
      const newTagsArr = this.form.value.industries.concat(
        new CategoryTag(
          '',
          0,
          this.service.capitalizeFirstLetter(this.industryQuery),
          0
        )
      );
      this.form.controls.industries.setValue(newTagsArr);
      this.changeDetectorRef.detectChanges();
      this.industryQuery = '';
      targetField.value = '';
    }
  }

  applyUserTagForBenefits(event: KeyboardEvent) {
    const targetField = event.target as HTMLInputElement;
    if (event.keyCode == 13 && this.benefitsQuery) {
      if (
        this.benefitsQuery !== targetField.value ||
        this.benefitsQuery.length < 3
      ) {
        this.benefitsQuery = '';
      }
      const newTagsArr = this.form.value.benefits.concat(
        new CategoryTag(
          '',
          0,
          this.service.capitalizeFirstLetter(this.benefitsQuery),
          0
        )
      );
      this.form.controls.benefits.setValue(newTagsArr);
      this.changeDetectorRef.detectChanges();
      this.benefitsQuery = '';
      targetField.value = '';
    }
  }

  applyFilters() {
    if (this.form.valid) {
      this.searchService.currentFilterState = FilterState.Applied;
      this.storageService.setSession(
        AppSettings.FILTER_STATE,
        this.searchService.currentFilterState
      );
      this.appliedFilters.emit(this.populateFormValues());
    }
  }

  populateFormValues() {
    const params = {};
    Object.keys(this.form.controls).forEach((key: string) => {
      params[key] = this.form.get(key).value;
    });
    return params;
  }

  clearFilter(control: string) {
    if (control) {
      this.form.get(control).reset();
    }
    if (control === 'location') {
      this.searchService.commonFormControls[control] = null;
    }
    this.searchService.hasFilters = !this.searchService.isEmptyForm(
      this.populateFormValues()
    );
    this.searchService.currentFilterState = this.searchService.hasFilters
      ? FilterState.Draft
      : FilterState.None;
    this.storageService.setSession(
      AppSettings.FILTER_STATE,
      this.searchService.currentFilterState
    );
  }

  clearFilters() {
    this.form.reset();
    this.searchService.clearFormDataFromStorage();
    this.searchService.currentFilterState = FilterState.None;
    this.storageService.setSession(
      AppSettings.FILTER_STATE,
      this.searchService.currentFilterState
    );
  }

  checkOnMaxValue(e) {
    if (e.target.value > this.maxNumbersOfReviews) {
      this.form
        .get('numberOfReviews')
        .patchValue(this.maxNumbersOfReviews);
    }
    if (e.target.value <= 0) {
      this.form.get('numberOfReviews').patchValue(0);
    }
  }

  getWorkTypeSuggestions(filter?) {
    this.$filterSubscription.add(
      this.businessService
        .getTagsSuggestions(
          '',
          [],
          TagType.WorkType,
          null,
          filter ? filter : null
        )
        .subscribe((res) => {
          this.workTypesSuggestions = res.data.records;
          this.workTypesSuggestions.sort((a, b) =>
            a.id > b.id ? 1 : b.id > a.id ? -1 : 0
          );
          if (
            this.form.value.workTypes?.length &&
            this.workTypesSuggestions?.length
          ) {
            const selectedIndustries =
              this.businessService.getSelectedItemsById(
                this.workTypesSuggestions,
                this.form.value.workTypes
              );
            this.form.controls.workTypes.setValue(
              selectedIndustries
            );
          }
        })
    );
  }

  getEducationalSuggestions(name?, filter?) {
    this.$filterSubscription.add(
      this.businessService
        .getTagsSuggestions(
          name ? name : '',
          [],
          TagType.EducationalInstitution,
          null,
          filter ? filter : null
        )
        .subscribe((res) => {
          if (res?.data?.records?.length) {
            this.educationalSuggestions = res.data.records;
            // this.educationalSuggestions.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
          }
        })
    );
  }

  searchEducationInit(value) {
    if (!value?.filter || value?.filter?.length >= 2) {
      this.searchEducationSub.next(value);
    }
  }

  getIndustrySuggestions() {
    this.businessService
      .getTagsSuggestions('', [], TagType.Industry)
      .subscribe((result) => {
        if (result.data?.records?.length) {
          this.industrySuggestions = result.data.records;
        }
        const removeNewSuggestion = this.industrySuggestions.some(
          (elem) => elem.id == 0
        );
        removeNewSuggestion
          ? this.industrySuggestions.splice(
            this.industrySuggestions.length - 1,
            1
          )
          : undefined;
      });
  }

  getCompensationTypeSuggestions() {
    this.businessService
      .getTagsSuggestions('', [], TagType.CompensationType)
      .subscribe((result) => {
        if (result.data?.records?.length) {
          this.compensationTypeSuggestions = result.data.records;
        }
        const removeNewSuggestion =
          this.compensationTypeSuggestions.some(
            (elem) => elem.id == 0
          );
        removeNewSuggestion
          ? this.compensationTypeSuggestions.splice(
            this.compensationTypeSuggestions.length - 1,
            1
          )
          : undefined;
      });
  }

  getBenefitsSuggestions() {
    this.businessService
      .getTagsSuggestions('', [], TagType.Benefits)
      .subscribe((result) => {
        if (result.data?.records?.length) {
          this.benefitsSuggestions = result.data.records;
        }
        const removeNewSuggestion = this.benefitsSuggestions.some(
          (elem) => elem.id == 0
        );
        removeNewSuggestion
          ? this.benefitsSuggestions.splice(
            this.benefitsSuggestions.length - 1,
            1
          )
          : undefined;
      });
  }

  initCompensationTypesDropdown() {
    this.compensationTypesDropDown.map((t) => {
      t.value.name = <string>(
        this.splitCamelCase.transform(CompensationTypes[t.value.id])
      );
    });
  }

  disableLocation(e) {
    if (e.checked) {
      this.form.get('location').disable();
      this.form.get('radius').disable();
    } else {
      this.form.get('location').enable();
      this.form.get('radius').enable();
    }
  }
}
