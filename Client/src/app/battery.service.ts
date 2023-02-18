import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

export interface BatteryLevel {
  charging: boolean,
  percent: number
}

@Injectable({
  providedIn: 'root'
})
export class BatteryService {

  constructor() { }

  monitor(): Observable<BatteryLevel> {
    return new Observable<BatteryLevel>(subscriber => {
      if (!window.battery || !window.battery.onUpdate) {
        return;
      }
      window.battery.onUpdate(data => {
        subscriber.next(data);
//        console.log('received data', data); // this never gets called :(
      });
    })
  }
}
