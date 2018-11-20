
export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface Point {
    x: number;
    y: number;
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
}

export interface AirplaneData extends Airplane, Point {
    distance: number;
    flightZone: string;
    x: number;
    y: number;
}
