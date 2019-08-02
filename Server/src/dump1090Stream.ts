import net from 'net';
import {DataSourceProtocol} from './dataSourceProtocol';
import request from "request";
import {Airplane} from "./airplane";
import {ATAEngine} from "./engine";

// got data MSG,3,111,11111,AB384A,111111,2018/12/04,22:01:08.467,2018/12/04,22:01:08.435,,34975,,,39.27319,-94.39334,,,,,,0

type Dump1090StreamData = {
    time: number,
    states: [
        string,          // Message Type
        string | null,   // Transmission Type
        string,          // Session ID
        number | null,   // time_position - Unix timestamp (seconds) for the last position update.
        number,          // last_contact - Unix timestamp (seconds) for the last update in general.
        number | null,   // longitude - WGS-84 longitude in decimal degrees. Can be null.
        number | null,   // latitude - WGS-84 latitude in decimal degrees. Can be null.
        number | null,   // baro_altitude - Barometric altitude in meters. Can be null.
        boolean,         // on_ground - Indicates if the position was retrieved from a surface position report.
        number | null,   // velocity - Velocity over ground in m/s. Can be null.
        number | null,   // true_track - True track in decimal degrees clockwise from north (north=0°).
        number | null,   // vertical_rate - Vertical rate in m/s.
        number[] | null, // sensors - IDs of the receivers which contributed to this state vector.
        number | null,   // geo_altitude - Geometric altitude in meters. Can be null.
        string | null,   // squawk - The transponder code aka Squawk. Can be null.
        boolean,         // spi - Whether flight status indicates special purpose indicator.
        number           // position_source - Origin of this state’s position - 0: ADS-B, 1: ASTERIX, 2: MLAT, 3: FLARM
        ][] | null
}

export class Dump1090Stream extends DataSourceProtocol {
    // loopInterval = 1000;
    started = false;

    start() {
        if (this.started) {
            return;
        }
        // this.loop();
        const client = net.connect(30003, '192.168.1.167', function () {
            console.log('connected');
        });
        client.on('data', (data: Buffer) => {
           console.log('got data', data.toString('utf-8'));
        });
    }

    // loop() {
    //     request('http://192.168.43.168:8080/data.json', {json: true}, (err, res, body) => {
    //         console.log(body);
    //         this.onReceivedData(this.convert(body));
    //         setTimeout(() => this.loop(), this.loopInterval);
    //     });
    // }

    public convert(dump1090Data: any[]) {
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

        if (ATAEngine.origin) {
            let airplane: Airplane = {
                identifier: 'Ground',
                latitude: ATAEngine.origin.latitude,
                longitude: ATAEngine.origin.longitude,
                lastUpdateDate: ATAEngine.origin.lastUpdateDate,
                heading: 0
            };
            airplaneList.push(airplane);
        }
        //var output = JSON.stringify(airplaneList);
        return airplaneList;
    }

}
