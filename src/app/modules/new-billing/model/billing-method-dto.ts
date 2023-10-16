import { BillingMethodType } from '../services/new-billing.service';

export class BillingMethodDto {
    id: any;
    type: BillingMethodType;

    constructor(options: { id: String; type: BillingMethodType }) {
        this.id = options.id;
        this.type = options.type;
    }
}
