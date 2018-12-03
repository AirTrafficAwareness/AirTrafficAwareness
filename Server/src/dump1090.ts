import {DataSourceProtocol} from './dataSourceProtocol';
import * as request from 'request'
import {Airplane} from "./airplane";
import {ATAEngine} from "./engine";

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

    loopInterval = 1000;
    started = false;

    start() {
        if (this.started) {
            return;
        }
        this.loop();
    }

    loop() {
        request('http://192.168.43.168:8080/data.json', {json: true}, (err, res, body) => {
            console.log(body);
            this.onReceivedData(this.convert(body));
            setTimeout(() => this.loop(), this.loopInterval);
        });
    }

    public convert(dump1090Data: Dump1090Data[]) {

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
                    lastUpdateDate: Date.now()
                };

                airplaneList.push(airplane);
            }
        });

        if (ATAEngine.origin) {
            let airplane: Airplane = {
                identifier: 'Ground',
                latitude: ATAEngine.origin.latitude,
                longitude: ATAEngine.origin.longitude,
                lastUpdateDate: Date.now(),
                heading: 0
            };
            airplaneList.push(airplane);
        }
        //var output = JSON.stringify(airplaneList);
        return airplaneList;
    }

}
