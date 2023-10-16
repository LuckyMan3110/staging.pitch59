import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';

export class CardPackage {
    constructor(
      public type: PitchCardType,
      public header: string,
      public title: string,
      public monthPrice: number,
      public totalPrice: number,
      public firstYearPrice: number,
      public packageColor: string,
      public packageDescription: string[],
      public comingSoon?: boolean
    ) {
        this.type = type;
        this.header = header;
        this.title = title;
        this.monthPrice = monthPrice;
        this.totalPrice = totalPrice;
        this.firstYearPrice = firstYearPrice;
        this.packageColor = packageColor;
        this.packageDescription = packageDescription;
        this.comingSoon = comingSoon;
    }
}
