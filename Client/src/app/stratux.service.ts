import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, interval, startWith, Subscription, switchMap} from 'rxjs';
import {Airplane} from './airplane';
import {ATAEngine} from './engine';
import {HttpClient} from '@angular/common/http';

type JsonElement = JsonObject | Array<JsonElement> | string | number | boolean | null;

interface JsonObject {
  [key: string]: JsonElement;
}

function jsonToAirplane(json: JsonObject): Airplane {
  return {
    identifier: (json['Icao_addr'] as number).toString(16),
    flightNumber: json['Reg'] as string,
    groundSpeed: json['Speed'] as number,
    altitude: json['Alt'] as number,
    latitude: json['Lat'] as number,
    longitude: json['Lng'] as number,
    heading: json['Track'] as number,
    nNumber: json['Tail'] as string,
    lastUpdateDate: Date.now()
  };
}

@Injectable({
  providedIn: 'root'
})
export class StratuxService {
  public airplanes: BehaviorSubject<Airplane[]> = new BehaviorSubject<Airplane[]>([]);
  private airplaneMap: { [identifier: string]: Airplane } = {};
  private timeoutId;
  private timeInterval: Subscription;
  private ownshipIcao: number;

  get isAvailable(): boolean {
    return true;
  }

  constructor(private http: HttpClient, private engine: ATAEngine, private zone: NgZone) {}

  private cullAirplanes() {
    if (this.engine.origin && 'identifier' in this.engine.origin) {
      const origin: Airplane = this.engine.origin as Airplane;
      const now = Date.now();
      const airplanes = Object.values(this.airplaneMap).filter(airplane => airplane.identifier === origin.identifier || now - airplane.lastUpdateDate < 10000);
      this.zone.run(() => {
        this.airplanes.next(airplanes);
      });
    }
    return [];
  }

  startListener() {
    this.http.get('http://ata-raspberrypi.local/getSettings').subscribe(data => {
      this.ownshipIcao = parseInt(data['OwnshipModeS'], 16);
      // console.log('OwnshipModeS', );

      const url = 'ws://ata-raspberrypi.local/traffic';
      const ws = new WebSocket(url);
      // Lat: 39.0918508, Lng: -94.5736323 N175FR A12128
      // Lat: 39.015, Lng: -94.565
      const origin = jsonToAirplane({Icao_addr: this.ownshipIcao, Speed: 0, Alt: 0, Lat: 39.04222, Lng: -94.58438, Track: 0});
      this.engine.origin = origin;
      this.airplaneMap[origin.identifier] = this.engine.determineProximity(origin);
      this.zone.run(() => {
        this.airplanes.next(Object.values(this.airplaneMap));
      });
      // @ts-ignore
      ws.onopen = (event) => {
        console.log('WS Open', event);
        this.timeInterval = interval(100).pipe(
          startWith(0),
          switchMap(() => this.getSituation())
        ).subscribe(gpsData => {
          this.updateGPS(gpsData);
        });
      };
      ws.onclose = (event) => {
        console.log('WS Close', event);
        if (this.timeInterval) {
          this.timeInterval.unsubscribe();
        }
      };
      ws.onerror = (event) => {
        console.log('WS Error', event);
      };
      ws.onmessage = (message) => {
        console.log('WS Message', message);
        const json = JSON.parse(message.data);
        console.log('json', json);
        const airplane = jsonToAirplane(json);
        this.airplaneMap[airplane.identifier] = this.engine.determineProximity(airplane);
        this.cullAirplanes();
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
          this.cullAirplanes();
        }, 20000);
        // if (Array.isArray(json)) {
        //   if (this.engine.origin && ('identifier' in this.engine.origin) && this.engine.origin.identifier) {
        //     const origin: Airplane = this.engine.origin as Airplane;
        //     const updated = json.find(airplane => airplane.identifier === origin.identifier);
        //     if (updated) {
        //       this.engine.origin = updated;
        //     }
        //   }
        //   const a = json.map(airplane => this.engine.determineProximity(airplane));
        //   console.log('processed airplanes', a);
        //   this.airplanes.next(a);
        // }
      };

    });
  }

  private getSituation() {
    return this.http.get('http://ata-raspberrypi.local/getSituation', {observe: 'body', responseType: 'json'})
  }

  get currentAirplane() {
    if (this.engine.origin && 'identifier' in this.engine.origin) {
      return this.engine.origin;
    }
    return undefined;
  }

  public setOwnship(ownship: string): void {
    this.http.post('http://ata-raspberrypi.local/setSettings', {'OwnshipModeS': ownship}).subscribe(data => {
      console.log('res', data);
      if (data['OwnshipModeS']) {
        const origin = this.engine.origin as Airplane;
        delete this.airplaneMap[origin.identifier];
        origin.nNumber = null;
        origin.flightNumber = null;
        origin.identifier = data['OwnshipModeS'];
        this.engine.origin = origin;
        this.airplaneMap[origin.identifier] = this.engine.determineProximity(origin);
        this.zone.run(() => {
          this.airplanes.next(Object.values(this.airplaneMap));
        });
      }
    });
  }

  private updateGPS(gps) {
    const latitude = gps['GPSLatitude'];
    if (latitude) {
      const origin = this.engine.origin as Airplane || jsonToAirplane({Icao_addr: this.ownshipIcao, Speed: 0, Alt: 0, Lat: 39.04222, Lng: -94.58438, Track: 0});
      origin.latitude = gps['GPSLatitude'];
      origin.longitude = gps['GPSLongitude'];
      origin.altitude = gps['GPSAltitudeMSL'];
      origin.groundSpeed = gps['GPSGroundSpeed'];
      let heading = gps['AHRSMagHeading'];
      if (heading == 3276.7) {
        heading = 0;
      }
      origin.heading = heading % 360;
      // GPSAltitudeMSL GPSGroundSpeed AHRSMagHeading
      if (origin.longitude) {
        this.engine.origin = origin;
        this.airplaneMap[origin.identifier] = this.engine.determineProximity(origin);
        this.zone.run(() => {
          this.airplanes.next(Object.values(this.airplaneMap));
        });
      }
    }
  }
}
