import { AppSettings } from './../app.settings';
import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
declare const google: any;
@Directive({
  selector: '[appSearchLocation]'
})
export class SearchLocationDirective {
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  autocomplete: any;
  private _el: HTMLElement;

  constructor(el: ElementRef) {
    this._el = el.nativeElement;
    const input = this._el;
    this.autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: {country: 'us'}
    });
    google.maps.event.addListener(
      this.autocomplete,
      'place_changed',
      () => {
        const place = this.autocomplete.getPlace();
        const placeObj = {
          address_components: place.address_components,
          name: place.name,
          adr_address: place.adr_address,
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          id: input.id,
          placeId: place.place_id
        };

        this.invokeEvent(placeObj);
      }
    );
  }

  invokeEvent(place: Object) {
    this.setAddress.emit(place);
  }
}
