import { Component, OnInit, OnDestroy } from '@angular/core';
import { CreatePitchCardService, Step } from '../create-pitch-card.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from '../../shared/app.settings';
import { Router } from '@angular/router';
import { PitchCardType } from '../../shared/enums/pitch-card-type.enum';
import { DeviceDetectorService } from 'ngx-device-detector';

declare var google: any;

@Component({
  selector: 'app-advertising-radius',
  templateUrl: './advertising-radius.component.html',
  styleUrls: ['./advertising-radius.component.scss']
})
export class AdvertisingRadiusComponent implements OnInit, OnDestroy {
  $validation: Subscription;
  $businessUpdate: Subscription;
  form: FormGroup;
  submitted = false;
  options;
  overlays = [];
  map;
  marker;
  selectedPlace;
  bounds;
  draftBusinesId;
  pitchcardType: PitchCardType;
  isMobile: boolean = this.deviseService.isMobile();

  constructor(
    private service: CreatePitchCardService,
    private deviseService: DeviceDetectorService,
    private router: Router
  ) {
    this.setFormattedLocationAddress =
      this.setFormattedLocationAddress.bind(this);
  }

  ngOnInit() {
    this.service.currentStep = Step.Radius;
    this.$validation = this.service.$validateSection.subscribe((step) => {
      if (step === Step.Radius && this.form) {
        this.service.changeCurrentSectionCompleted(this.form.valid);
        if (this.form.dirty) {
          this.service
            .updateAndChangeStep(this.getPayload())
            .subscribe(
              (result) => {
              },
              (err) => {
                console.log(err);
              }
            );
        } else if (!this.form.dirty && this.form.value.radius === 25) {
          this.service
            .updateAndChangeStep(this.getPayload())
            .subscribe(
              (result) => {
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          this.service.currentStep = this.service.moveToStep;
        }
      }
    });

    this.pitchcardType = this.service.businessType;

    if (this.service.loaded) {
      this.initializeForm();
      this.service.changeCurrentSectionVisited();
    }

    this.$businessUpdate = this.service.$businessUpdated.subscribe(() => {
      this.initializeForm();
    });
  }

  getPayload() {
    const payload = {};

    Object.keys(this.form.controls).forEach((key: string) => {
      if (this.form.controls[key].dirty) {
        payload[key] = this.form.value[key];
      }
    });

    payload['placeId'] = payload['placeId'] && payload['placeId'].placeId;
    if (!this.form.value.radius || this.form.value.radius === 25) {
      payload['radius'] = 25;
    }
    return payload;
  }

  initializeForm() {
    this.setOptions();
    this.bounds = new google.maps.LatLngBounds();
    this.form = this.service.getBusinessForm();
    this.service.tileRequiredState = this.form.valid;
    this.service.tileFormGroup = this.form;
  }

  ngOnDestroy(): void {
    if (this.$validation) {
      this.$validation.unsubscribe();
    }
    if (this.$businessUpdate) {
      this.$businessUpdate.unsubscribe();
    }
  }

  setOptions() {
    this.options = {
      zoomControlOptions: {
        position: 'TOP_RIGHT'
      },
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy',
      center: {lat: 40.8097343, lng: -98.5556199},
      zoom: 4,
      minZoom: 2
    };
  }

  setFormattedLocationAddress(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        this.form.controls.location.setValue(
          results[0].formatted_address
        );
        this.form.controls.location.markAsDirty();
      }
    }
  }

  showLocationError() {
    const geocoder = new google.maps.Geocoder();
    const componentRestrictions = this.service.setComponentRestrictions();
    geocoder.geocode(
      {address: this.form.value.location, componentRestrictions},
      this.setFormattedLocationAddress
    );
  }

  setLocationDataToForm() {
    const latitude = this.form.controls.latitude.value;
    const longitude = this.form.controls.longitude.value;
    const geocoder = new google.maps.Geocoder();

    if (latitude && longitude) {
      geocoder.geocode(
        {location: new google.maps.LatLng(latitude, longitude)},
        this.setFormattedLocationAddress
      );

      const place = {
        lat: latitude,
        lng: longitude
      };
      this.updateMarker(place, false);
    }
  }

  setMap(event) {
    this.map = event.map;
    this.setLocationDataToForm();
  }

  handleMapClick(event) {
    this.setMarker(event.latLng);
  }

  updateMarker(place, markDirty = true) {
    if (!this.map) {
      return;
    }

    const latLng = new google.maps.LatLng(place.lat, place.lng);
    this.setMarker(latLng, place, markDirty);
    this.map.setCenter(latLng);
    this.bounds.extend(latLng);
  }

  setMarker(latLng, placeId = null, markDirty = true) {
    if (this.marker) {
      this.marker.setMap(null);
    }
    this.marker = new google.maps.Marker({position: latLng});
    this.marker.setMap(this.map);
    this.updateLocationForm(latLng, placeId);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {location: latLng},
      this.setFormattedLocationAddress
    );
    if (markDirty) {
      this.form.controls.location.markAsDirty();
    }
    this.bounds.extend(latLng);
    if (this.bounds) {
      this.map.fitBounds(this.bounds);
      this.map.panToBounds(this.bounds);
    }
    this.onRadiusChange();
    this.service.tileRequiredState = this.form.valid;
  }

  updateLocationForm(latLng, placeId) {
    this.form.controls.latitude.setValue(latLng.lat());
    this.form.controls.latitude.markAsDirty();
    this.form.controls.longitude.setValue(latLng.lng());
    this.form.controls.longitude.markAsDirty();
    if (placeId) {
      this.form.controls.placeId.setValue(placeId);
      this.form.controls.placeId.markAsDirty();
    }
    this.service.tileRequiredState = this.form.valid;
  }

  onRadiusChange() {
    const circle = new google.maps.Circle({
      center: this.marker.position,
      fillColor: '#1976D2',
      fillOpacity: 0.35,
      strokeWeight: 1,
      radius: Number(
        this.form.get('radius').value * AppSettings.ONE_MILE_IN_METERS
      )
    });
    this.overlays = [circle];
    this.map.fitBounds(circle.getBounds());
    this.map.panToBounds(circle.getBounds());
  }

  gotoBackToCompanyInfo() {
    this.router.navigate(['add-businesses-details/company-information']);
  }
}
