import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { BankDetailModel } from '../../bank-details/models/bank-detail.model';

@Component({
  selector: 'app-bank-account-thumbnail',
  templateUrl: './bank-account-thumbnail.component.html',
  styleUrls: ['./bank-account-thumbnail.component.scss']
})
export class BankAccountThumbnailComponent implements OnInit {
  @Input() model: BankDetailModel;

  constructor() {
  }

  ngOnInit(): void {
  }

  get routingNumber() {
    return (
      'X'.repeat(this.model.routingNumber.length - 4) +
      this.model.routingNumber.substr(
        this.model.routingNumber.length - 4,
        4
      )
    );
  }

  get accountNumber() {
    return (
      'X'.repeat(this.model.accountNumber.length - 4) +
      this.model.accountNumber.substr(
        this.model.accountNumber.length - 4,
        4
      )
    );
  }

  get accountType() {
    return this.model.accountHolderType == 'checking'
      ? 'Checking'
      : 'Saving';
  }
}
