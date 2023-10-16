import { NgModule } from '@angular/core';
import { BootstrapComponent } from './bootstrap.component';
import { BootstrapRoutingModule } from './bootstrap-routing.module';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GtagModule } from 'angular-gtag';
import { environment } from '../../../environments/environment';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [BootstrapComponent],
  imports: [
    RouterModule,
    BootstrapRoutingModule,
    BrowserModule,
    BrowserModule.withServerTransition({appId: 'pitch59'}),
    HttpClientModule,
    BrowserAnimationsModule,
    GtagModule.forRoot({
      trackingId: 'UA-165468810-1',
      trackPageviews: environment.trackPageviews
    })
  ],
  bootstrap: [BootstrapComponent]
})
export class BootstrapModule {
}
