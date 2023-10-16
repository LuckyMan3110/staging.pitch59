import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PitchCardComponent } from './pitch-card.component';
import { PitchCardRoutingModule } from './pitch-card-routing.module';
import { PitchCardSharedModule } from '../../modules/pitch-card-shared/pitch-card-shared.module';
import { RestApiService } from '../../modules/shared/services/rest-api.service';
import { HttpErrorHandler } from '../../modules/shared/services/http-error-handler.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoaderService } from '../../modules/shared/components/loader/loader.service';
import { CommonMessageTransferService } from '../../modules/shared/services/common-message-transfer.service';
import { StorageService } from '../../modules/shared/services/storage.service';
import { BusinessService } from '../../modules/business/services/business.service';
import { CommonBindingDataService } from '../../modules/shared/services/common-binding-data.service';
import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons/faFacebookF';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { MiTranslateLoaderService } from '../../modules/shared/services/mi-translate-loader.service';
import { MiMissingTranslationHandlerService } from '../../modules/shared/services/mi-missing-translation-handler.service';
import { CustomerAnalyticsService } from '../../modules/choosen-history/services/customer-analytics.service';
import { UserCommonService } from '../../modules/shared/services/user-common.service';
import { UiService } from '../../modules/shared/services/ui.service';
import { CardPackageService } from '../../modules/cards-packages/services/card-package.service';
import { AppConstantService } from '../../modules/shared/services/app-constant.service';
import { CreatePitchCardService } from '../../modules/create-pitch-card/create-pitch-card.service';
import { BusinessBankService } from '../../modules/shared/services/business-bank.service';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoaderComponent } from '../../modules/shared/components/loader/loader.component';
import { SharedModule } from '../../modules/shared/shared.module';

@NgModule({
  declarations: [PitchCardComponent],
  imports: [
    CommonModule,
    PitchCardRoutingModule,
    PitchCardSharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: MiTranslateLoaderService
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MiMissingTranslationHandlerService
      }
    }),
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    SharedModule
  ],
  exports: [LoaderComponent],
  providers: [
    RestApiService,
    HttpErrorHandler,
    MessageService,
    LoaderService,
    CommonMessageTransferService,
    StorageService,
    BusinessService,
    CommonBindingDataService,
    TranslateService,
    TranslateStore,
    ConfirmationService,
    CustomerAnalyticsService,
    UserCommonService,
    UiService,
    CardPackageService,
    AppConstantService,
    CreatePitchCardService,
    BusinessBankService
  ]
})
export class PitchCardModule {
  constructor(translate: TranslateService, library: FaIconLibrary) {
    library.addIcons(faFacebookF);
    library.addIcons(faTwitter);
    library.addIcons(faLinkedinIn);
    library.addIcons(faEnvelope);
    library.addIcons(faLink);
    library.addIcons(faCheck);
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
  }
}
