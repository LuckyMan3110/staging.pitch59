import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedPocketRoutingModule } from './shared-pocket-routing.module';
import { SharedModule } from '../../modules/shared/shared.module';

import { SharedPocketComponent } from './shared-pocket/shared-pocket.component';

import { MyPocketsService } from '../../modules/choosen-history/services/my-pockets.service';
import { RestApiService } from '../../modules/shared/services/rest-api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorHandler } from '../../modules/shared/services/http-error-handler.service';
import { LoaderService } from '../../modules/shared/components/loader/loader.service';
import { CommonMessageTransferService } from '../../modules/shared/services/common-message-transfer.service';
import { StorageService } from '../../modules/shared/services/storage.service';
import { BusinessService } from '../../modules/business/services/business.service';
import { CommonBindingDataService } from '../../modules/shared/services/common-binding-data.service';
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { CustomerAnalyticsService } from '../../modules/choosen-history/services/customer-analytics.service';
import { UiService } from '../../modules/shared/services/ui.service';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { AppConstantService } from '../../modules/shared/services/app-constant.service';
import { ToastModule } from 'primeng/toast';
import { CreatePitchCardService } from '../../modules/create-pitch-card/create-pitch-card.service';
import { BusinessBankService } from '../../modules/shared/services/business-bank.service';

@NgModule({
  declarations: [SharedPocketComponent],
  imports: [
    CommonModule,
    SharedPocketRoutingModule,
    SharedModule,
    ToastModule
  ],
  providers: [
    MyPocketsService,
    RestApiService,
    HttpErrorHandler,
    MessageService,
    LoaderService,
    CommonMessageTransferService,
    StorageService,
    BusinessService,
    CommonBindingDataService,
    UserCommonService,
    ConfirmationService,
    CustomerAnalyticsService,
    UiService,
    CardPackageService,
    AppConstantService,
    CreatePitchCardService,
    BusinessBankService
  ]
})
export class SharedPocketModule {
}
