import { Injectable } from '@angular/core';
import { RestApiService } from '../shared/services/rest-api.service';

@Injectable()
export class DiscountService {
  constructor(private restApiService: RestApiService) {
  }

  validateCode(code: string) {
    return this.restApiService.get(
      'validate-discount',
      `discount/validate?code=${code}`,
      null
    );
  }
}
