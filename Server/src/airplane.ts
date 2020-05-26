/*
Below you will find the definition of the interfaces required for an any ADS-B compatible
vehicle.
 */
export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Proximity {
    distance: number;
    flightZone: string;
    position: Point;
}

export interface Airplane extends Coordinate {
    identifier: string;
    flightNumber?: string;
    groundSpeed?: number;
    altitude?: number;
    latitude: number;
    longitude: number;
    heading?: number;
    lastUpdateDate: number;
    proximity?: Proximity;
}
