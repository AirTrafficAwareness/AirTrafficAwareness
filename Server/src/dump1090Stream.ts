import net from 'net';
import {DataSourceProtocol} from './dataSourceProtocol';
import {Airplane} from "./airplane";
import config, {DataSource} from './config';

export class Dump1090Stream extends DataSourceProtocol {
    started = false;
    airplaneData: { [hexIdentifier: string]: Airplane } = {};
    url: string;

    constructor() {
        super();
        if (config.dataSource === DataSource.Stream && config.url) {
            this.url = config.url;
        }
    }

    private get airplanes(): Airplane[] {
        return Object.values(this.airplaneData).filter(airplane => {
            return airplane.latitude && airplane.longitude;
        })
    }

    start() {
        if (this.started) {
            return;
        }

        const client = net.connect(30003, this.url, function () {
            console.log('Connected to Dump1090 stream.');
        });
        client.on('data', (data: Buffer) => {
            this.convert(data)
        });

        setInterval(() => {
            const removed = this.removeExpired();
            if (removed.length > 0) {
                this.onReceivedData(this.airplanes);
            }
        }, 1000);
    }

    private convert(dump1090Data: Buffer) {
        const lines = dump1090Data.toString('utf-8').split('\r\n');
        for (const rawData of lines) {
            if (!rawData) {
                continue;
            }
            const [/* messageType */, /* transmissionType */, /* sessionId */, /* aircraftId */,
                hexIdentifier,
                /* flightId */, /* generatedDate */, /* generatedTime */, /* loggedDate */, /* loggedTime */,
                flightNumber, altitude, groundSpeed, heading, latitude, longitude,
                /* verticalRate */, /* squawk */, /* squawkChanged */, /* emergency */, /* spi */, /* onGround */
            ] = rawData.split(',');

            const airplane = this.airplaneData[hexIdentifier] || {
                identifier: hexIdentifier,
                latitude: 0,
                longitude: 0,
                lastUpdateDate: 0
            };
            Object.assign(airplane, {lastUpdateDate: Date.now()});

            if (flightNumber) {
                Object.assign(airplane, {flightNumber});
            }
            if (groundSpeed) {
                Object.assign(airplane, {groundSpeed})
            }
            if (altitude) {
                Object.assign(airplane, {altitude})
            }
            if (latitude) {
                Object.assign(airplane, {latitude});
            }
            if (longitude) {
                Object.assign(airplane, {longitude});
            }
            if (heading) {
                Object.assign(airplane, {heading});
            }

            this.airplaneData[hexIdentifier] = airplane;
        }

        this.onReceivedData(this.airplanes);
    }

    private removeExpired() {
        const now = Date.now();
        return Object.values(this.airplaneData).filter(airplane => {
            if (now - airplane.lastUpdateDate > 60000) {
                delete this.airplaneData[airplane.identifier];
                return true;
            }
            return false;
        });
    }

}
