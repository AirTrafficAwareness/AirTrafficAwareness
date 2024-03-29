import {DataSourceProtocol} from './dataSourceProtocol';
import request from './request';
import {Airplane} from "./airplane";
import config, {DataSource} from "./config";

type Dump1090_fa = {
    now: number;
    messages: string;
    aircraft: Dump1090Data[];
}
type Dump1090Data = {
    hex: string;
    squawk: string;
    flight: string;
    lat: number;
    lon: number;
    //validposition: boolean;
    alt_baro: number;
    //vert_rate: number;
    track: number;
    //validtrack: boolean;
    gs: number;
    //messages: number;
    seen: number;
};

export class Dump1090 extends DataSourceProtocol {

    loopInterval = 40;
    started = false;
    url: string;

    constructor() {
        super();
        if (config.dataSource === DataSource.Dump1090 && config.url) {
            this.url = config.url;
        } else {
            //'http://localhost:8080/data.json';
            this.url = 'http://192.168.1.5:8080/data/aircraft.json';
        }
    }

    start(): void {
        if (this.started) {
            return;
        }
        this.loop();
    }

    loop(): void {
        request<Dump1090Data[]>(this.url).then(body => {
            this.onReceivedData(this.convert(body));
            setTimeout(() => this.loop(), this.loopInterval);
        });
    }

    public convert(dump1090Data: Dump1090Data[]): Airplane[] {
        const now = Date.now();
        const airplaneList = [];
        if (!dump1090Data || !Array.isArray(dump1090Data)) {
            return [];
        }

        dump1090Data.forEach(function (val) {
            if (val.flight) {
                const airplane: Airplane = {
                    identifier: val.hex,
                    flightNumber: val.flight || val.squawk,
                    groundSpeed: val.gs,
                    altitude: val.alt_baro,
                    latitude: val.lat,
                    longitude: val.lon,
                    heading: val.track ? val.track : undefined,
                    lastUpdateDate: now - val.seen
                };
                airplaneList.push(airplane);
            }
        });

        //var output = JSON.stringify(airplaneList);
        return airplaneList;
    }

}
