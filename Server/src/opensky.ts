import {DataSourceProtocol} from './dataSourceProtocol';
import request from 'request';
import {Airplane, Coordinate} from "./airplane";
import {ATAEngine} from "./engine";
import config, {DataSource} from './config';

type OpenSkyData = {
    time: number,
    states: [
        string,          // icao24 - Unique ICAO 24-bit address of the transponder in hex string representation.
        string | null,   // callsign - Call sign of the vehicle (8 chars)
        string,          // origin_country - Country name inferred from the ICAO 24-bit address.
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

export class OpenSky extends DataSourceProtocol {

    started = false;
    credentials?: {username: string, password: string};

    constructor() {
        super();
        if (config.dataSource === DataSource.OpenSky && config.credentials) {
            this.credentials = config.credentials;
        }
    }

    static convert(openSkyData: OpenSkyData): Airplane[] {
        const airplanes: Airplane[] = [];

        const states = openSkyData.states || [];
        for (const [
            identifier, flightNumber, /* origin_country */, /* time_position */, lastUpdateDate, longitude, latitude,
            barometricAltitude, /* on_ground */, groundSpeed, heading, /* vertical_rate */, /* sensors */,
            geometricAltitude, /* squawk */, /* spi */, /* position_source */
        ] of states) {
            const altitude = geometricAltitude || barometricAltitude;
            const airplane = {
                identifier,
                flightNumber,
                lastUpdateDate,
                latitude,
                longitude,
                altitude,
                groundSpeed,
                heading
            };
            airplanes.push(airplane);
        }

        return airplanes;
    }

    loop(interval) {
        const {
            min: {latitude: lamin, longitude: lomin},
            max: {latitude: lamax, longitude: lomax}
        } = calculateBoundingBox(ATAEngine.origin, 100000);

        const params = {
            qs: {lamin, lomin, lamax, lomax},
            json: true,
            auth: undefined
        };

        if (this.credentials) {
            params.auth = this.credentials;
        }

        request('https://opensky-network.org/api/states/all', params, (err, res, body) => {
            console.log('res', res);
            let airplanes = OpenSky.convert(body);
            this.onReceivedData(airplanes);
            setTimeout(() => this.loop(interval), interval);
        });
    }

    start() {
        if (this.started) {
            return;
        }

        if (ATAEngine.origin) {
            this.started = true;
            // OpenSky users can retrieve data with a time resolution of 5 seconds.
            if (this.credentials) {
                this.loop(6000);
            } else {
                this.loop(10000);
            }
        }
    }

}

const meanEarthRadius = 6371e3; // meters
const {PI, cos, sin, acos, asin, abs} = Math;
type BoundingBox = { min: Coordinate, max: Coordinate };

export function calculateBoundingBox(center: Coordinate, length: number): BoundingBox {
    const lat = toRadians(center.latitude);
    const lon = toRadians(center.longitude);
    const latD = length / meanEarthRadius;
    const latT = asin(sin(lat) / cos(latD));
    const lonD = acos((cos(latD) - sin(latT) * sin(lat)) / (cos(latT) * cos(lat)));

    let latMin = lat - latD;
    let latMax = lat + latD;
    let lonMin = lon - lonD;
    let lonMax = lon + lonD;

    //  (latMin, lonMin), (latMax, lonMax)

    if (latMax > PI / 2) {
        //(latMin, -π), (π/2, π)
        lonMin = -PI;
        latMax = PI / 2;
        lonMax = PI;
    }

    if (abs(lonMin) > PI || abs(lonMax) > PI) {
        // (latMin, -π), (latMax, π)
        lonMin = -PI;
        lonMax = PI;
    }

    return {
        min: {
            latitude: toDegrees(latMin),
            longitude: toDegrees(lonMin)
        },
        max: {
            latitude: toDegrees(latMax),
            longitude: toDegrees(lonMax)
        }
    };
}

function toRadians(degrees: number): number {
    return degrees * PI / 180;
}

function toDegrees(radians: number): number {
    return radians / PI * 180;
}

