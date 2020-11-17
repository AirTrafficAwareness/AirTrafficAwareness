import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Airplane} from './airplane';
import {GDL90} from './gdl90';
import {ATAEngine} from './engine';

declare var chrome;

function trafficReportToAirplane(report) {
  return {
    identifier: report.participantAddress,
    flightNumber: report.callSign,
    groundSpeed: report.horizontalVelocity,
    altitude: report.altitude,
    latitude: report.latitude,
    longitude: report.longitude,
    heading: report.track,
    lastUpdateDate: Date.now()
  };
}

@Injectable({
  providedIn: 'root'
})
export class GDL90Service {
  public airplanes: BehaviorSubject<Airplane[]> = new BehaviorSubject([]);
  running = false;
  working = false;
  socket = null;
  listener = null;
  private airplaneMap: { [identifier: string]: Airplane } = {};

  constructor(private engine: ATAEngine, private zone: NgZone) {
    this.listener = (info) => {
      console.log('info.socketId', info.socketId, 'this.socket', this.socket);
      // if (this.socket !== info.socketId) {
      //     return;
      // }
      const bytes = new Uint8Array(info.data);
      const hexString = GDL90.toHexString(bytes);
      console.log('hexString', hexString);
      try {
        const decoded = GDL90.decode(info.data);
        console.log('decoded', decoded);

        let updates = false;
        if (decoded.ownshipReport) {
          const airplane = trafficReportToAirplane(decoded.ownshipReport);
          this.engine.origin = airplane;
          updates = true;
          this.airplaneMap[airplane.identifier] = this.engine.determineProximity(airplane);
        } else if (decoded.trafficReport) {
          const airplane = trafficReportToAirplane(decoded.trafficReport);
          updates = true;
          this.airplaneMap[airplane.identifier] = this.engine.determineProximity(airplane);
        }
        if (updates) {
          const now = Date.now();
          const airplanes = Object.values(this.airplaneMap).filter(airplane => now - airplane.lastUpdateDate < 10000);
          this.zone.run(() => {
            this.airplanes.next(airplanes);
          });
        }
      } catch (e) {
        console.error('Error', e);

      }
    };
    if (this.isAvailable) {
      GDL90Service.udp.onReceive.addListener(this.listener);
    }
  }

  private static get udp() {
    return chrome && chrome.sockets && chrome.sockets.udp;
  }

  get isAvailable(): boolean {
    const available = !!GDL90Service.udp;
    console.log('GDL90Service isAvailable', available, chrome);
    return available;
  }

  get currentAirplane() {
    if (this.engine.origin && 'identifier' in this.engine.origin) {
      return this.engine.origin;
    }
    return undefined;
  }

  startListener() {
    this.working = true;
    // this.insomnia.keepAwake().then(() => {
    console.log('success');
    GDL90Service.udp.create({name: '_ATA_UPD_Listener_'}, createInfo => {
      console.log('createInfo', createInfo);
      GDL90Service.udp.bind(createInfo.socketId, '0.0.0.0', 4000, (bindResult) => {
        console.log('bindResult', bindResult);
        const newMessage = '*** Connected ***';
        // this.messages[Time.now()] = newMessage;
        // this.updateText(newMessage + '\n');
        this.socket = createInfo.socketId;
        this.working = false;
        this.running = true;
        // this.ref.detectChanges();
      });
    });
    // }, () => console.log('error'));
  }

  stopListener() {
    this.working = true;
    // this.insomnia.allowSleepAgain().then(() => {
    console.log('success');
    // this.udp.onReceive.removeListener(this.listener);
    GDL90Service.udp.close(this.socket, () => {
      const newMessage = '*** Disconnected ***';
      // this.messages[Time.now()] = newMessage;
      // this.updateText(newMessage + '\n');
      this.socket = null;
      this.working = false;
      this.running = false;
      // this.ref.detectChanges();
    });
    // }, () => console.log('error'));

  }
}
