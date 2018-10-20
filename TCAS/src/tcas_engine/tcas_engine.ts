import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from  'rxjs/Observable';
import { timer } from 'rxjs';
import 'rxjs/add/observable/interval';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class TcasEngine {
    private timer;
    public aircraftInfoJson;
    aircraftFlightInfo: JSON; 
    myAircraft: JSON;
    aircraftJson: JSON;
    dangerDistance: number;
    warningDistance: number;
    watchDistance: number;
    
  constructor(public navCtrl: NavController) {
  }

  tcasInit() {
    this.timer = Observable.timer(300);
    this.timer.subscribe((t) => {
        this.aircraftInfoJson = getaircraftresults() // figure out how to get aircraft results from other component
        let tempAircraftInfo = this.aircraftInfoJson;
        this.generateDistances(tempAircraftInfo);
        this.aircraftFlightInfo = tempAircraftInfo;
    });
  }

  generateDistances(tempAircraftInfo) {
    tempAircraftInfo.forEach(aircraft => {
        // the haversine formula takes 2 points(latlong) and finds the distances between them.
        // generally takes around 5 ms to calculate
        var R = 6371e3; // metres
        var φ1 = this.myAircraft['lat1'].toRadians();
        var φ2 = aircraft['lat2'].toRadians();
        var Δφ = (aircraft['lat2']-this.myAircraft['lat1']).toRadians();
        var Δλ = (aircraft['lon2']-this.myAircraft['lon1']).toRadians();

        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        aircraft['distance'] = R * c;

        if (aircraft['distance'] > this.watchDistance) {
            aircraft['flightZone'] = 'safe';
        } else if (aircraft['distance'] > this.warningDistance) {
            aircraft['flightZone'] = 'watch';
        } else if (aircraft['distance'] > this.dangerDistance) {
            aircraft['flightZone'] = 'warning';
        } else {
            aircraft['flightZone'] = 'danger';
        }
    });
  }

  updateZones() {
      
  }
}
