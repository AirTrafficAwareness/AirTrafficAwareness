import {HttpClient} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {Airplane, Coordinate} from "../models/airplane";

const httpProtocol = `${location.protocol}`; // http: | https:
const wsProtocol = httpProtocol.replace(/^http/, 'ws'); // ws: | wss:

@Injectable()
export class AirTrafficAwarenessClient {

  public onUpdate: EventEmitter<Airplane[]> = new EventEmitter();
  private webSocket;

  set currentAirplane(airplane: Airplane) {
    this.webSocket.send(JSON.stringify(airplane));
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
    return this.http.get<any>(`${httpProtocol}//${address}/`, {params: qs}).pipe(res => {
      const url = `${wsProtocol}//${address}`;
      let ws = new WebSocket(url);
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
