import {EventEmitter, Injectable} from '@angular/core';
import {Airplane, Coordinate} from './airplane';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

const httpProtocol = `${location.protocol}`; // http: | https:
const wsProtocol = httpProtocol.replace(/^http/, 'ws'); // ws: | wss:

@Injectable({
  providedIn: 'root'
})
export class ATAService {
  public airplanes: BehaviorSubject<Airplane[]> = new BehaviorSubject([]);
  private webSocket;
  private airplane: Airplane;

  get currentAirplane() {
    return this.airplane;
  }

  set currentAirplane(airplane: Airplane) {
    this.webSocket.send(JSON.stringify(airplane));
    this.airplane = airplane;
  }

  constructor(public http: HttpClient) {}

  connect(address: string, coordinate: Coordinate) {
    const qs = coordinate ? {
      latitude: coordinate.latitude.toFixed(8),
      longitude: coordinate.longitude.toFixed(8)
    } : {};

    return this.http.get<any>(`${httpProtocol}//${address}/api/`, {params: qs}).pipe(res => {
      const url = `${wsProtocol}//${address}`;
      const ws = new WebSocket(url);
      ws.onmessage = (message) => {
        const json = JSON.parse(message.data);
        console.log('json', json);
        if (Array.isArray(json)) {
          this.airplanes.next(json);
        }
      };
      this.webSocket = ws;
      return res;
    });

  }
}
