import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardDetailModel } from '../../models/card-detail.model';
import { bindCardLogo } from '../../utility-functions/card.utils';

@Component({
  selector: 'app-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss']
})
export class CreditCardComponent implements OnInit {
  logoUrl: string;

  _cardDetails: CardDetailModel;

  @Input() allowRemoveCard: boolean = true;
  @Input() miniSize: boolean = false;
  @Input() midSize: boolean = false;

  @Input()
  set cardDetails(value: any) {
    this._cardDetails = value;
    this.logoUrl = bindCardLogo(this._cardDetails.brand);
  }

  get cardDetails() {
    return this._cardDetails;
  }

  get MM() {
    if (this._cardDetails && this._cardDetails.expMonth) {
      if (this._cardDetails.expMonth.toString().length == 1) {
        return '0' + this._cardDetails.expMonth.toString();
      } else {
        return this._cardDetails.expMonth;
      }
    }

    return 'XX';
  }

  get YY() {
    return this._cardDetails && this._cardDetails.expYear
      ? this._cardDetails.expYear.toString().substr(2, 2)
      : 'XX';
  }

  @Output() delete: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  deleteCard() {
    this.delete.emit();
  }
}
