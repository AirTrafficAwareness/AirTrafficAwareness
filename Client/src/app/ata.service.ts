import {EventEmitter, Injectable} from '@angular/core';
import {Airplane, Coordinate} from './airplane';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {ATAEngine} from './engine';

const httpProtocol = location.protocol && location.protocol.startsWith('http') ? `${location.protocol}` : 'http:'; // http: | https:
const wsProtocol = httpProtocol.replace(/^http/, 'ws'); // ws: | wss:

@Injectable({
  providedIn: 'root'
})
export class ATAService {
  public airplanes: BehaviorSubject<Airplane[]> = new BehaviorSubject<Airplane[]>([]);
  private webSocket;

  get currentAirplane() {
    if (this.engine.origin && 'identifier' in this.engine.origin) {
      return this.engine.origin;
    }
    return undefined;
  }

  set currentAirplane(airplane: Airplane) {
    this.webSocket.send(JSON.stringify(airplane));
    this.engine.origin = airplane;
  }

  constructor(public http: HttpClient, private engine: ATAEngine) {}

  connect(address: string, coordinate: Coordinate) {
    const qs = coordinate ? {
      latitude: coordinate.latitude.toFixed(8),
      longitude: coordinate.longitude.toFixed(8)
    } : {};

    return this.http.get<any>(`${httpProtocol}//${address}/api/`, {params: qs}).pipe(res => {
      const url = `${wsProtocol}//${address}`;
      const ws = new WebSocket(url);
      this.engine.origin = coordinate;
      ws.onmessage = (message) => {
        const json = JSON.parse(message.data);
        if (Array.isArray(json)) {
          if (this.engine.origin && ('identifier' in this.engine.origin) && this.engine.origin.identifier) {
            const origin: Airplane = this.engine.origin as Airplane;
            const updated = json.find(airplane => airplane.identifier === origin.identifier);
            if (updated) {
              this.engine.origin = updated;
            }
          }
          const a = json.map(airplane => this.engine.determineProximity(airplane));
          console.log('processed airplanes', a);
          this.airplanes.next(a);
        }
      };
      this.webSocket = ws;
      return res;
    });

  }
}
