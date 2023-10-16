import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-congratulations-details',
  templateUrl: './congratulations.component.html',
  styleUrls: ['./congratulations.component.scss']
})
export class CongratulationsComponent implements OnInit {
  ngOnInit() {
    console.log('init');
  }
}
