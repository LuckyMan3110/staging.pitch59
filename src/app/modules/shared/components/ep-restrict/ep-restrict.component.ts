import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  HostBinding
} from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UserCommonService } from '../../services/user-common.service';

@Component({
  selector: 'app-ep-restrict',
  templateUrl: './ep-restrict.component.html',
  styleUrls: ['./ep-restrict.component.scss']
})
export class EpRestrictComponent implements OnInit {
  isAuthUser: boolean = false;

  @Output() submitClick: EventEmitter<any> = new EventEmitter();

  @Input() isShowBlur = false;

  @Input() isShowRestrict = false;

  @Input() scale = 1.0;

  @HostBinding('style.--scale-factor')
  get scaleFactor() {
    return this.scale;
  }

  constructor(
    private router: Router,
    private deviceService: DeviceDetectorService,
    private userService: UserCommonService
  ) {
  }

  ngOnInit(): void {
    this.setScaleOnMobile();
    this.isAuthUser = this.userService.isAuthenticated();
  }

  showContactMeDialog() {
    this.submitClick.emit();
  }

  goToPrice() {
    this.router.navigate([
      this.isAuthUser ? 'select-pitchcards' : 'pricing'
    ]);
  }

  setScaleOnMobile() {
    if (this.deviceService.isMobile()) {
      this.scale = null;
    }
  }
}
