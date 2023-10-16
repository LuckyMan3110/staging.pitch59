import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AppSettings } from '../../app.settings';
import { CommonBindingDataService } from '../../services/common-binding-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-payment-approve-content',
  templateUrl: './payment-approve-content.component.html',
  styleUrls: ['./payment-approve-content.component.scss']
})
export class PaymentApproveContentComponent implements OnInit, OnDestroy {
  @Input() requestStatus: any;
  @Input() withMessage: boolean = false;
  @Output() closeEvent: EventEmitter<boolean> = new EventEmitter();
  paymentStatus: '';
  requestStatusBtnText = '';
  paymentDescription: '';
  isMobile: boolean = this.deviceService.isMobile();

  constructor(
    private commonBindingService: CommonBindingDataService,
    private deviceService: DeviceDetectorService
  ) {
  }

  ngOnInit(): void {
    this.populateContent();
  }

  ngOnDestroy() {
    if (this.requestStatus) {
      this.requestStatus = null;
    }
  }

  populateContent() {
    if (this.requestStatus) {
      if (this.requestStatus?.code == 200) {
        this.paymentStatus = this.commonBindingService.getLabel(
          'lbl_payment_approved'
        );
        this.paymentDescription = this.commonBindingService.getLabel(
          'lbl_after_payment_instructions'
        );
        this.requestStatusBtnText = 'GOT IT';
      }
      if (this.requestStatus?.code == AppSettings.PAYMENT_FAILED) {
        this.paymentStatus =
          this.commonBindingService.getLabel('err_payment_failed');
        this.paymentDescription = this.commonBindingService.getLabel(
          'err_payment_description'
        );
        this.requestStatusBtnText = 'UPDATE BILLING';
      }
      if (this.requestStatus?.code != 200 && this.withMessage) {
        this.paymentStatus =
          this.commonBindingService.getLabel('err_payment_failed');
        this.paymentDescription = this.requestStatus?.message
          ? this.requestStatus.message
          : this.commonBindingService.getLabel(
            'err_payment_description'
          );
        this.requestStatusBtnText = 'UPDATE BILLING';
      }
    }
  }

  close() {
    this.closeEvent.emit(true);
  }
}
