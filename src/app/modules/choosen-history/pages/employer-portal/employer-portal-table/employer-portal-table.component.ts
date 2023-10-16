import {
  Component,
  ElementRef,
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
  EmployerActionsIds,
  EmployerPortalService,
  IconStates,
  SortStatuses
} from '../../../services/employer-portal.service';
import { TeamModel } from '../../../models/team.model';
import { BusinessDetails } from '../../../../business/models/business-detail.model';
import { AppSettings } from '../../../../shared/app.settings';
import { UiService } from '../../../../shared/services/ui.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { CommonBindingDataService } from '../../../../shared/services/common-binding-data.service';
import { CardPackageService } from '../../../../cards-packages/services/card-package.service';
import { PitchCardType } from '../../../../shared/enums/pitch-card-type.enum';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CamelcasePipe } from '../../../../shared/pipes/camelcase.pipe';
import { OrganizationBusinessStatus } from '../enums/organization-business-status.enum';
import { BusinessService } from '../../../../business/services/business.service';
import { FormBuilder } from '@angular/forms';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { BusinessStatus } from '../../../../business/enums/business.status';

@Component({
  selector: 'app-employer-portal-table',
  templateUrl: './employer-portal-table.component.html',
  styleUrls: ['./employer-portal-table.component.scss']
})
export class EmployerPortalTableComponent
  implements OnInit, OnChanges, OnDestroy {
  employerPortal: TeamModel;
  selectedPC: BusinessDetails[] = [];
  $tableSubscription = new Subscription();
  businessStatuses = OrganizationBusinessStatus;
  pitchCardTypes = PitchCardType;
  sortByStatus = SortStatuses;
  tableActionsIds = EmployerActionsIds;

  searchParams = {
    name: '',
    skip: 0,
    limit: 20,
    sortColumn: '',
    statuses: '',
    sortType: 'asc',
    invites: true
  };

  pitchCardsList = [];
  columns: any[] = [];
  rowsActions: any[] = [];

  loading: boolean = false;
  rows: number = 25;
  totalRecords = 0;
  searchText: string = '';
  sortField: string = '';
  sortOrder: boolean = true;

  emailPattern = AppSettings.EMAIL_PATTERN;

  @Input() selectedType: any;
  @Input() organizationID: string | number;
  @Input() organizationName: string;
  @Output() selectedPitchCards: EventEmitter<any> = new EventEmitter();

  @ViewChild('tableWrap') tableWrap: ElementRef;
  @ViewChild('dt') table: Table;

  constructor(
    private employerService: EmployerPortalService,
    private uiService: UiService,
    private storageService: StorageService,
    private bindingService: CommonBindingDataService,
    private cardPackageService: CardPackageService,
    private router: Router,
    private camelCasePipe: CamelcasePipe,
    private businessService: BusinessService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.table && changes.selectedType?.currentValue !== null) {
      this.loading = true;
      this.employerService.businessesLoading = true;
      this.rowsActions = [];
      this.selectedPC = [];
      this.searchText = '';
      this.table.filters.global = null;
      this.emitSelectedBusinesses();
      this.table.reset();
    }
  }

  ngOnDestroy() {
    if (this.$tableSubscription) {
      this.$tableSubscription.unsubscribe();
    }
  }

  loadBusinessesLazy(event: LazyLoadEvent) {
    this.loading = true;
    this.employerService.businessesLoading = true;
    this.searchText = event.globalFilter || '';
    this.sortField = event.sortField || '';
    this.$tableSubscription.add(
      this.employerService
        .getEmployerPortalBusinesses(
          this.selectedType.option,
          this.searchText,
          this.sortField,
          this.sortOrder,
          event.rows,
          event.first
        )
        .subscribe((r) => {
          if (r.data) {
            this.pitchCardsList = r.data?.records
              ? r.data.records
              : [];
            this.selectedPC = [];
            this.loading = false;
            this.employerService.businessesLoading = false;

            this.totalRecords = r.data.pagination?.totalRecords
              ? r.data.pagination?.totalRecords
              : this.totalRecords;
            this.rows = r.data.pagination?.limit
              ? r.data.pagination.limit
              : this.rows;

            setTimeout(() => {
              this.tableWrap.nativeElement.click();
            }, 5000);
          }

          this.populateTableData();
          this.initRowActions();
        })
    );
  }

  populateTableData() {
    // Jobs columns
    this.columns = [
      {
        field: 'uniqueId',
        header: '#',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option !== PitchCardType.Job
      },
      {
        field: 'position',
        header: 'Position Title',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option !== PitchCardType.Job
      },
      {
        field: 'created',
        header: 'Created',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option !== PitchCardType.Job
      },
      {
        field: 'active',
        header: 'Active',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option !== PitchCardType.Job
      },
      {
        field: 'updated',
        header: 'Auto-Renews On',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option !== PitchCardType.Job
      },
      {
        field: 'applicants',
        header: 'Applicants',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option !== PitchCardType.Job
      },
      {
        field: 'testimonials',
        header: 'Testimonials',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option !== PitchCardType.Job
      },

      // Other PC types columns
      {
        field: 'uniqueId',
        header: '#',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option === PitchCardType.Job
      },
      {
        field: 'updated',
        header: 'Auto Renews',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option === PitchCardType.Job
      },
      {
        field: 'email',
        header: 'User Email',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option === PitchCardType.Job
      },
      {
        field: 'nameUser',
        header: 'Name',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option === PitchCardType.Job
      },
      {
        field: 'status',
        header: 'Status',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option === PitchCardType.Job
      },
      {
        field: 'testimonials',
        header: 'Testimonials',
        sort: true,
        fixWidth: '',
        resize: true,
        hide: this.selectedType?.option === PitchCardType.Job
      }
    ];
  }

  initRowActions() {
    this.rowsActions = this.employerService.getIconActions(
      this.selectedType.option
    );
    this.rowsActions.map((action) => {
      action.state = IconStates.Default;
    });
  }

  initSubscriptions() {
    this.$tableSubscription.add(
      this.employerService.$businessSearch.subscribe((res) => {
        if (res) {
          this.table.filterGlobal(res.event, res.param);
        }
      })
    );

    this.$tableSubscription.add(
      this.employerService.$updateBusinesses.subscribe((type) => {
        const pitchCardTypes =
          this.employerService.initPitchCardTypeDropdown();

        if (type) {
          this.selectedType = pitchCardTypes.find(
            (t) => t.option === type
          );
          this.selectedPC = [];
          this.table.reset();
        } else {
          this.table.reset();
        }
      })
    );
  }

  handleBusinessActions(e, business, iconId?) {
    e.preventDefault();
    if (business) {
      this.storageService.setSession(
        AppSettings.DRAFT_BUSINESS_ID,
        business.businessId
      );
      this.cardPackageService.selectedType = business.pitchCardType;
      this.employerService.setCurrentBusiness(business);

      switch (iconId) {
        case EmployerActionsIds.Preview:
          if (business.status !== this.businessStatuses.Unassigned) {
            this.handlePreviewModal(business);
          }
          break;
        case EmployerActionsIds.Copy:
          if (business.status === this.businessStatuses.Active) {
            this.copyToClipBoard(business);
          }
          break;
        case EmployerActionsIds.EditBusiness:
          if (business.status > 0) {
            this.navigateToEditBusiness(business);
          } else if (
            business.businessType === PitchCardType.Job &&
            business.autofill
          ) {
            this.handleAutofillJobCardModal(business);
          }
          break;
        case EmployerActionsIds.BusinessReport:
          if (business.status === this.businessStatuses.Active) {
            this.handleAnalyticsModal(business);
          }
          break;
        default:
          break;
      }
    } else {
      this.uiService.errorMessage(
        'Pitchcard is not part of the Employer Portal'
      );
    }
  }

  handlePreviewModal(business) {
    this.employerService.$previewModalsHandler.next(business);
  }

  copyToClipBoard(business) {
    const shareUrl = encodeURI(
      `${window.location.origin}/card/${business.alias}`
    );
    this.bindingService.copyToClipboard(shareUrl).then((r) => {
      this.uiService.successMessage(
        this.bindingService.getLabel('msg_success_copy')
      );
    });
  }

  navigateToEditBusiness(business) {
    if (!business.autofill) {
      this.storageService.setSession(
        AppSettings.DRAFT_BUSINESS_ID,
        business.id
      );
      this.cardPackageService.selectedType = business.businessType;
      this.storageService.removeItem(AppSettings.VISITED_TILES_STORAGE);
      this.router.navigate(['create'], {
        queryParams: {businessId: business.id}
      });
    } else {
      this.storageService.removeItem(AppSettings.VISITED_TILES_STORAGE);
      this.handleAutofillJobCardModal(business);
    }
  }

  handleAutofillJobCardModal(business) {
    this.employerService.$autofillJobCard.next({
      business: business,
      orgId: this.organizationID
    });
  }

  handleAnalyticsModal(business) {
    this.employerService.$businessAnalyticsModalHandler.next(business);
  }

  handleTestimonialsModal(business) {
    this.employerService.setCurrentBusiness(business);
    this.employerService.$businessTestimonialsModalHandler.next(true);
    if (business?.newReviews) {
      business.newReviews = false;
    }
  }

  setImageState(action, business) {
    if (action && business) {
      if (
        action.iconId === this.tableActionsIds.Preview &&
        business.status !== this.businessStatuses.Unassigned &&
        business.businessType !== PitchCardType.Job
      ) {
        return business.businessType + '-default.svg';
      }

      if (business.businessType !== PitchCardType.Job) {
        if (business.businessStatus === BusinessStatus.Active) {
          return business.businessType + '-default.svg';
        } else if (
          action.iconId === this.tableActionsIds.EditBusiness &&
          business.status > 0 &&
          business.status !== this.businessStatuses.Unassigned
        ) {
          return business.businessType + '-default.svg';
        } else {
          return 'disable.svg';
        }
      } else {
        if (business.status === this.businessStatuses.Active) {
          return business.businessType + '-default.svg';
        } else if (
          action.iconId === this.tableActionsIds.EditBusiness &&
          (business.status === this.businessStatuses.Invited ||
            business.status === this.businessStatuses.InProcess)
        ) {
          return 'active.svg';
        } else {
          return 'disable.svg';
        }
      }
    }
  }

  getInputValidationStatus(id) {
    if (id && document.getElementById(id)) {
      const input: HTMLInputElement = document.getElementById(
        id
      ) as HTMLInputElement;
      return input.value ? this.emailPattern.test(input.value) : false;
    }
  }

  sendInviteByEmail(e, id, emailUser) {
    e.preventDefault();
    e.currentTarget.disabled = true;
    if (id) {
      const input: HTMLInputElement = document.getElementById(
        id
      ) as HTMLInputElement;
      const params = {email: input.value, businessId: id};

      if (!this.inputModified(id, emailUser)) {
        this.$tableSubscription.add(
          this.employerService
            .inviteUserByEmail(this.organizationID, params)
            .subscribe(
              (r) => {
                if (r.data) {
                  this.updateIndividualBusiness(id);
                }
              },
              (err) => {
                this.uiService.errorMessage(
                  err?.message
                    ? err.message
                    : this.bindingService.getLabel(
                      'err_server'
                    )
                );
              }
            )
        );
      } else {
        this.$tableSubscription.add(
          this.employerService
            .updateUserEmail(this.organizationID, params)
            .subscribe(
              (r) => {
                if (r.data) {
                  const inviteBtn = <HTMLElement>(
                    document.getElementById('invite-' + id)
                  );
                  input.classList.add(
                    'no-borders',
                    'green',
                    'pointer'
                  );
                  inviteBtn.style.display = 'none';

                  setTimeout(() => {
                    this.updateIndividualBusiness(id);
                  }, 1000);
                }
              },
              (err) => {
                this.uiService.errorMessage(
                  err?.message
                    ? err.message
                    : this.bindingService.getLabel(
                      'err_server'
                    )
                );
              }
            )
        );
      }
    }
  }

  updateIndividualBusiness(businessId, isFetch: boolean = false) {
    this.$tableSubscription.add(
      this.employerService
        .getUpdateBusiness(this.selectedType.option, businessId)
        .subscribe(
          (r) => {
            if (r?.data?.records?.length) {
              const updatedBusiness = r.data.records.find(
                (b) => b.id === businessId
              );
              this.pitchCardsList.map((item, index) => {
                if (item.id === businessId) {
                  this.pitchCardsList[index] =
                    updatedBusiness;
                }
              });
              if (!isFetch) {
                this.uiService.successMessage(
                  'Invite Successfully Sent'
                );
              }
            }
          },
          (error) =>
            this.uiService.errorMessage(
              error?.message
                ? error.message
                : this.bindingService.getLabel('err_server')
            )
        )
    );
  }

  inputModified(id, email) {
    return this.pitchCardsList.find(
      (card) => card.id === id && card.emailUser === email
    );
  }

  enableInput(e, id) {
    e.preventDefault();
    const input = <HTMLInputElement>document.getElementById(id);
    const inviteBtn = <HTMLElement>document.getElementById('invite-' + id);

    input.disabled = false;
    input.classList.remove('no-borders', 'green', 'pointer');
    inviteBtn.style.display = 'block';
  }

  clearInput(e, business) {
    if (!e?.target?.value && business?.emailUser && business?.id) {
      const params = {
        email: business.emailUser,
        businessId: business.id
      };
      this.$tableSubscription.add(
        this.businessService.deleteUserInvite(params).subscribe(
          () => {
            setTimeout(() => {
              this.updateIndividualBusiness(business.id, true);
            }, 1000);
            this.uiService.successMessage(
              'User Removed From Business'
            );
          },
          (err) => {
            setTimeout(() => {
              this.updateIndividualBusiness(business.id, true);
            }, 1000);
            this.uiService.errorMessage(
              err?.message
                ? err.message
                : this.bindingService.getLabel('err_server')
            );
          }
        )
      );
    }
  }

  setCompanyStatus(value, businessId) {
    if (businessId) {
      this.$tableSubscription.add(
        this.businessService
          .activateDeactiveAccountStatus(businessId, value)
          .subscribe((res) => {
            this.table.reset();
          })
      );
    }
  }

  handleApplicantModal(business) {
    business.newApplicant = 0;
    const responseObject = {
      business: business,
      organizationId: this.organizationID,
      organizationName: this.organizationName
    };
    this.employerService.$applicantsModalHandler.next(responseObject);
  }

  emitSelectedBusinesses() {
    this.selectedPitchCards.emit(
      this.selectedPC?.length ? this.selectedPC : []
    );
  }
}
