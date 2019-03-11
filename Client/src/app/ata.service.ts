import {EventEmitter, Injectable} from '@angular/core';
import {Airplane, Coordinate} from './airplane';
import {HttpClient} from '@angular/common/http';

const httpProtocol = `${location.protocol}`; // http: | https:
const wsProtocol = httpProtocol.replace(/^http/, 'ws'); // ws: | wss:

@Injectable({
  providedIn: 'root'
})
export class ATAService {

  public onUpdate: EventEmitter<Airplane[]> = new EventEmitter();
  private webSocket;
  private pCurrentAirplane: Airplane;

  get currentAirplane() {
    return this.pCurrentAirplane;
  }

  set currentAirplane(airplane: Airplane) {
    this.webSocket.send(JSON.stringify(airplane));
    this.pCurrentAirplane = airplane;
  }

  constructor(public http: HttpClient) {
    console.log('Hello AirplaneProvider Provider');
  }

  connect(address: string, coordinate: Coordinate) {
    console.log('coordinate ?', coordinate);
    const qs = coordinate ? {
      latitude: coordinate.latitude.toFixed(8),
      longitude: coordinate.longitude.toFixed(8)
    } : {};

    console.log('params?', qs);
    return this.http.get<any>(`${httpProtocol}//${address}/api/`, {params: qs}).pipe(res => {
      const url = `${wsProtocol}//${address}`;
      const ws = new WebSocket(url);
      ws.onmessage = (message) => {
        const json = JSON.parse(message.data);
        console.log('json', json);
        if (Array.isArray(json)) {
          this.onUpdate.emit(json);
        }
      };
      this.webSocket = ws;
      return res;
    });

  }
}
