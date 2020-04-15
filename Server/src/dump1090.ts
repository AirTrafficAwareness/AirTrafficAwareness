import {DataSourceProtocol} from './dataSourceProtocol';
import request from './request';
import {Airplane} from "./airplane";
import {ATAEngine} from "./engine";
import config, {DataSource} from "./config";
import assert from "assert";

type Dump1090Data = {
    hex: string,
    squawk: string,
    flight: string,
    lat: number,
    lon: number,
    validposition: boolean,
    altitude: number,
    vert_rate: number,
    track: number,
    validtrack: boolean,
    speed: number,
    messages: number,
    seen: number
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
            this.url = 'http://localhost:8080/data.json';
        }
    }

    start() {
        if (this.started) {
            return;
        }
        this.loop();
    }

    loop() {
        request(this.url).then(body => {
            this.onReceivedData(this.convert(body));
            setTimeout(() => this.loop(), this.loopInterval);
        });
    }

    public convert(dump1090Data: Dump1090Data[]) {
        const now = Date.now();
        let airplaneList = [];
        if (!dump1090Data || !Array.isArray(dump1090Data)) {
            return [];
        }

        dump1090Data.forEach(function (val) {
            if (val.validposition) {
                const airplane: Airplane = {
                    identifier: val.hex,
                    flightNumber: val.flight || val.squawk,
                    groundSpeed: val.speed,
                    altitude: val.altitude,
                    latitude: val.lat,
                    longitude: val.lon,
                    heading: val.validtrack ? val.track : undefined,
                    lastUpdateDate: now - val.seen
                };

                airplaneList.push(airplane);
            }
        });

        //var output = JSON.stringify(airplaneList);
        return airplaneList;
    }

}
