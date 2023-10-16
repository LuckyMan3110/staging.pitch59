export class CardDetailModel {
  id: String = '';
  customerId: String = '';
  type: string;
  expYear: string;
  expMonth: string;
  last4: string;
  brand: string;
  isCardDelete: boolean;
  stripeToken: string;

  constructor(option?: CardDetailModel) {
    if (option) {
      this.id = option.id;
      this.customerId = option.customerId;
    }
  }
}
