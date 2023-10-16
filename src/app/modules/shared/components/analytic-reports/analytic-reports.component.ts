import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardPackageService } from '../../../cards-packages/services/card-package.service';
import {
  AnalyticsChartData,
  AnalyticsTab
} from '../../../choosen-history/pages/employer-portal/models/analytics-models.model';
import { AnalyticsTypesEnum } from '../../../choosen-history/pages/employer-portal/enums/analytics-types.enum';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { EmployerPortalService } from '../../../choosen-history/services/employer-portal.service';
import {
  AnalyticsOptionsEnum,
  AnalyticsSocialNetworks
} from '../../../choosen-history/pages/employer-portal/enums/analytics-options.enum';
import { CustomerAnalyticsService } from '../../../choosen-history/services/customer-analytics.service';
import { BusinessDetails } from '../../../business/models/business-detail.model';
import { OrganizationModel } from '../../../choosen-history/pages/employer-portal/models/organization-model';
import { AppSettings } from '../../app.settings';
import { PixelService } from 'ngx-pixel';

@Component({
  selector: 'app-analytic-reports',
  templateUrl: './analytic-reports.component.html',
  styleUrls: ['./analytic-reports.component.scss']
})
export class AnalyticReportsComponent implements OnInit, OnChanges, OnDestroy {
  reportsForm: FormGroup;
  chartData: AnalyticsChartData;
  chartTabs: AnalyticsTab[] = [];
  chartDataModel = AnalyticsTypesEnum;
  chartOptions: any;
  $analyticSub = new Subscription();

  dateFormat = AppSettings.DATE_FORMATTER;

  @Input() product: BusinessDetails | OrganizationModel;
  @Input() maxDateValue: any;

  constructor(
    private fb: FormBuilder,
    private pixel: PixelService,
    private cardPackagesService: CardPackageService,
    private storageService: StorageService,
    private employerService: EmployerPortalService,
    private customerAnalyticsService: CustomerAnalyticsService
  ) {
    this.pixel.track('ViewContent', {
      content_name: 'analytics reports'
    });
  }

  ngOnInit(): void {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.product && changes.product.previousValue) {
      this.product = changes.product.previousValue;
    }
  }

  ngOnDestroy() {
    if (this.storageService.getItem('selectedBusiness')) {
      this.storageService.removeItem('selectedBusiness');
    }
    if (this.$analyticSub) {
      this.$analyticSub.unsubscribe();
    }
  }

  createForm() {
    this.reportsForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      chartType: ['', Validators.required]
    });

    if (this.product) {
      this.initAnalyticsData();
    }
  }

  initAnalyticsData() {
    const today = new Date();
    const monthAgoStamp = today.setMonth(today.getMonth() - 1);
    const monthAgo = new Date(monthAgoStamp);

    this.reportsForm.get('startDate').patchValue(monthAgo);
    this.reportsForm.get('endDate').patchValue(new Date());
    this.reportsForm.get('chartType').patchValue('Shared');

    this.chartTabs = this.employerService.chartsAllTabsData();
    this.$analyticSub.add(
      this.reportsForm.valueChanges.subscribe(() => {
        if (!this.product) {
          this.product = JSON.parse(
            this.storageService.getItem('selectedBusiness')
          );
        }
        this.getPitchCardAnalytics(this.product);
      })
    );

    this.getPitchCardAnalytics(this.product);
  }

  getPitchCardAnalytics(business) {
    if (this.reportsForm.valid && (business.businessId || business.id)) {
      this.chartData = new AnalyticsChartData();
      const activeTab = this.chartTabs.find((t) => t.active === true);
      const startDate = new Date(
        this.reportsForm.get('startDate').value.setHours(0, 0, 0, 0)
      );
      const endDate = new Date(
        this.reportsForm.get('endDate').value.setHours(23, 59, 59, 999)
      );

      let types: string = '';
      activeTab.columns.map((c) => {
        types = types + (types ? ',' : '') + c.types.join(',');
      });

      const params: any = {
        fromDate: new Date(
          startDate.getTime() +
          Math.abs(startDate.getTimezoneOffset() * 60000)
        ).toISOString(),
        toDate: new Date(
          endDate.getTime() +
          Math.abs(endDate.getTimezoneOffset() * 60000)
        ).toISOString(),
        types: types,
        businessId: +business.businessId
          ? business.businessId
          : business.id
      };

      this.$analyticSub.add(
        this.customerAnalyticsService
          .getReportAnalytics(params)
          .subscribe((r) => {
            this.storageService.setItem(
              'selectedBusiness',
              business
            );
            this.populateChartData(r, activeTab);
          })
      );
    }
  }

  populateChartData(data, activeTab: AnalyticsTab) {
    const chartData: AnalyticsChartData = {
      labels: [],
      datasets: [
        {
          label: activeTab.name,
          backgroundColor: '#25AEB4',
          borderColor: '#25AEB4',
          data: []
        }
      ]
    };
    if (Object.keys(data).length) {
      activeTab.columns.map((column, index) => {
        column.types.map((type) => {
          if (AnalyticsOptionsEnum[type] in data) {
            if (AnalyticsSocialNetworks[type] in data) {
              if (
                !chartData.labels.find(
                  (label) => label === column.name
                )
              ) {
                chartData.labels.push(column.name);
              }
              chartData.datasets[0].data.length !==
              chartData.labels.length
                ? chartData.datasets[0].data.push(
                  data[AnalyticsOptionsEnum[type]]
                )
                : (chartData.datasets[0].data[
                chartData.datasets[0].data.length - 1
                  ] += data[AnalyticsOptionsEnum[type]]);
            } else {
              chartData.labels.push(column.name);
              chartData.datasets[0].data.push(
                data[AnalyticsOptionsEnum[type]]
              );
            }
          }
        });
      });
    } else {
      activeTab.columns.map((c) => {
        chartData.labels.push(c.name);
      });
    }
    this.chartData = chartData;
    // this.analyticsModal = true;
  }

  getBusinessTypeValue(type) {
    return this.cardPackagesService.getBusinessTypeValue(type);
  }

  selectChartTab(index, tab) {
    this.chartTabs.map((t) => {
      t.active = false;
    });
    this.chartTabs[index].active = true;
    this.reportsForm.get('chartType').patchValue(tab.name);
  }
}
