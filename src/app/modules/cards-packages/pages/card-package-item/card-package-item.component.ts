import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CardPackage } from '../../models/card-package.model';
import { CardPackageService } from '../../services/card-package.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-package-item',
  templateUrl: './card-package-item.component.html',
  styleUrls: ['./card-package-item.component.scss']
})
export class CardPackageItemComponent implements OnInit, OnDestroy {
  teamPackagesLayout = false;
  $packageSubscription = new Subscription();
  @Input() package: CardPackage;
  @Input() scale: number = 1;

  @HostBinding('style.--scale-factor') get scaleFactor() {
    return this.scale;
  }

  ngOnInit() {
    this.getLSInfo();
    this.setSubscription();
  }

  ngOnDestroy() {
    if (this.$packageSubscription) {
      this.$packageSubscription.unsubscribe();
    }
    }

  constructor(private cardPackagesService: CardPackageService) {
  }

    getLSInfo() {
        if (localStorage.getItem('cardsPackageUrl') === '/cards-packages') {
            this.teamPackagesLayout = true;
        }
    }

    setSubscription() {
      this.$packageSubscription.add(
        this.cardPackagesService.scaleFactor.subscribe((value) => {
          if (value) {
            this.scale = value;
            Object.defineProperty(this.scaleFactor, this.scale, {
              value: this.scale,
              writable: true
            });
          }
        })
      );
    }
}
